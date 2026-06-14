import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import sharp from "sharp";

const THUMB_MAX_WIDTH = 400;
const THUMB_MAX_HEIGHT = 400;
const THUMB_PREFIX = "thumb_";

/**
 * Firebase Storage'a fotoğraf yüklenince otomatik thumbnail oluşturur.
 * originals/ klasörüne yüklenen JPG/PNG dosyaları için çalışır.
 * Oluşturulan thumbnail thumbs/ klasörüne kaydedilir.
 */
export const generateThumbnail = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name!;
    const contentType = object.contentType!;
    const bucket = admin.storage().bucket(object.bucket);

    // Sadece originals/ klasöründeki resimleri işle
    if (!filePath.includes("/originals/")) {
      functions.logger.info("originals/ dışında dosya, atlanıyor:", filePath);
      return;
    }

    // Sadece resim dosyaları
    if (!contentType.startsWith("image/")) {
      functions.logger.info("Resim değil, atlanıyor:", contentType);
      return;
    }

    // Zaten thumbnail mi? (sonsuz döngüyü önle)
    const fileName = path.basename(filePath);
    if (fileName.startsWith(THUMB_PREFIX)) {
      functions.logger.info("Zaten thumbnail, atlanıyor.");
      return;
    }

    // albums/album_001/originals/photo_001.jpg → album_001
    const pathParts = filePath.split("/");
    const albumId = pathParts[1];

    const tempFilePath = path.join(os.tmpdir(), fileName);
    const thumbFileName = `${THUMB_PREFIX}${fileName}`;
    const thumbFilePath = path.join(os.tmpdir(), thumbFileName);
    const thumbStoragePath = `albums/${albumId}/thumbs/${thumbFileName}`;

    try {
      // Dosyayı geçici dizine indir
      await bucket.file(filePath).download({ destination: tempFilePath });
      functions.logger.info("Dosya indirildi:", tempFilePath);

      // Sharp ile thumbnail oluştur
      await sharp(tempFilePath)
        .resize(THUMB_MAX_WIDTH, THUMB_MAX_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toFile(thumbFilePath);

      functions.logger.info("Thumbnail oluşturuldu:", thumbFilePath);

      // Thumbnail'ı Storage'a yükle
      await bucket.upload(thumbFilePath, {
        destination: thumbStoragePath,
        metadata: {
          contentType: "image/jpeg",
          metadata: { generatedBy: "generateThumbnail" },
        },
      });

      functions.logger.info("Thumbnail yüklendi:", thumbStoragePath);

      // Firestore'daki photo kaydına thumbnailPath ekle
      const photosQuery = await admin
        .firestore()
        .collection("albums")
        .doc(albumId)
        .collection("photos")
        .where("storagePath", "==", filePath)
        .limit(1)
        .get();

      if (!photosQuery.empty) {
        await photosQuery.docs[0].ref.update({
          thumbnailPath: thumbStoragePath,
        });
        functions.logger.info("Firestore photo kaydı güncellendi.");
      }
    } catch (error) {
      functions.logger.error("generateThumbnail error:", error);
    } finally {
      // Geçici dosyaları temizle
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (fs.existsSync(thumbFilePath)) fs.unlinkSync(thumbFilePath);
    }
  });
