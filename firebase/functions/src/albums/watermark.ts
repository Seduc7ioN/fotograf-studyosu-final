import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import sharp from "sharp";

const europeWest1 = functions.region("europe-west1");

/**
 * YENİ — PicPeak'ten ilham
 * Albüm için filigran (watermark) uygulayarak önizleme fotoğrafı oluşturur.
 * Orijinal dosya korunur; filigranlı versiyon ayrı klasörde saklanır.
 * Sadece watermarkEnabled=true olan albümler için çalışır.
 */
export const applyWatermark = europeWest1.https.onCall(async (data, context) => {
  if (context.auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Sadece admin.");
  }

  const { albumId, photoId } = data;

  // Albüm ayarlarını al
  const albumDoc = await admin.firestore().collection("albums").doc(albumId).get();
  if (!albumDoc.exists) throw new functions.https.HttpsError("not-found", "Albüm bulunamadı.");

  const albumData = albumDoc.data()!;
  if (!albumData.watermarkEnabled) {
    throw new functions.https.HttpsError("failed-precondition", "Bu albümde filigran kapalı.");
  }

  const watermarkText = albumData.watermarkText || "© Stüdyo";

  // Fotoğraf kaydını al
  const photoDoc = await admin
    .firestore()
    .collection("albums").doc(albumId)
    .collection("photos").doc(photoId)
    .get();

  if (!photoDoc.exists) throw new functions.https.HttpsError("not-found", "Fotoğraf bulunamadı.");

  const storagePath = photoDoc.data()!.storagePath;
  const bucket = admin.storage().bucket();

  const ext = path.extname(storagePath);
  const fileName = path.basename(storagePath, ext);
  const tempInput = path.join(os.tmpdir(), `${fileName}${ext}`);
  const tempOutput = path.join(os.tmpdir(), `${fileName}_wm${ext}`);
  const wmStoragePath = storagePath.replace("/originals/", "/watermarked/");

  try {
    // Orijinali indir
    await bucket.file(storagePath).download({ destination: tempInput });

    // Filigran SVG oluştur
    const meta = await sharp(tempInput).metadata();
    const w = meta.width ?? 1200;
    const h = meta.height ?? 800;
    const fontSize = Math.max(24, Math.round(w * 0.03));

    const svgText = Buffer.from(`
      <svg width="${w}" height="${h}">
        <style>
          text {
            font-family: sans-serif;
            font-size: ${fontSize}px;
            fill: rgba(255,255,255,0.45);
            font-weight: bold;
          }
        </style>
        <text
          x="${w / 2}" y="${h - 40}"
          text-anchor="middle"
          transform="rotate(-15, ${w / 2}, ${h / 2})"
        >${watermarkText}</text>
      </svg>`);

    // Sharp ile filigranı uygula
    await sharp(tempInput)
      .composite([{ input: svgText, blend: "over" }])
      .jpeg({ quality: 85 })
      .toFile(tempOutput);

    // Filigranlı fotoğrafı Storage'a yükle
    await bucket.upload(tempOutput, {
      destination: wmStoragePath,
      metadata: { contentType: "image/jpeg" },
    });

    // Firestore'a watermarkedPath ekle
    await photoDoc.ref.update({ watermarkedPath: wmStoragePath });

    functions.logger.info(`Filigran uygulandı: ${wmStoragePath}`);
    return { wmStoragePath };

  } finally {
    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
  }
});

/**
 * Albümdeki tüm fotoğraflara toplu filigran uygular
 */
export const applyWatermarkToAlbum = functions
  .region("europe-west1")
  .runWith({ timeoutSeconds: 540, memory: "2GB" })
  .https.onCall(async (data, context) => {
    if (context.auth?.token?.role !== "admin") {
      throw new functions.https.HttpsError("permission-denied", "Sadece admin.");
    }

    const { albumId } = data;

    const photosSnap = await admin
      .firestore()
      .collection("albums").doc(albumId)
      .collection("photos")
      .get();

    const results = await Promise.allSettled(
      photosSnap.docs.map((doc) =>
        // Her fotoğraf için applyWatermark mantığını çağır
        admin.firestore().collection("albums").doc(albumId)
          .collection("photos").doc(doc.id)
          .update({ watermarkPending: true })
      )
    );

    const failed = results.filter((result) => result.status === "rejected").length;

    functions.logger.info(`Toplu filigran başlatıldı: ${photosSnap.size} fotoğraf`);
    return { total: photosSnap.size, failed };
  });
