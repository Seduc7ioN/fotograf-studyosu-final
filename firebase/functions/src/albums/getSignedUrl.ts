import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

/**
 * Güvenli fotoğraf erişimi için signed URL üretir.
 * Flutter uygulaması bu fonksiyonu çağırarak fotoğraf URL'i alır.
 * URL 1 saat geçerlidir.
 */
export const getSignedPhotoUrl = functions.https.onCall(
  async (data, context) => {
    // Giriş yapılmış mı?
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Giriş yapmanız gerekiyor."
      );
    }

    const { albumId, photoId, isThumbnail } = data;

    if (!albumId || !photoId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "albumId ve photoId gerekli."
      );
    }

    const uid = context.auth.uid;
    const isAdmin = context.auth.token.role === "admin";

    // Admin değilse albüme erişim yetkisi kontrol et
    if (!isAdmin) {
      const albumDoc = await admin
        .firestore()
        .collection("albums")
        .doc(albumId)
        .get();

      if (!albumDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Albüm bulunamadı.");
      }

      if (albumDoc.data()!.customerId !== uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Bu albüme erişim yetkiniz yok."
        );
      }

      // Albüm süresi dolmuş mu?
      const expiresAt = albumDoc.data()!.expiresAt?.toDate();
      if (expiresAt && expiresAt < new Date()) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Bu albümün süresi dolmuştur."
        );
      }
    }

    // Fotoğraf kaydını Firestore'dan al
    const photoDoc = await admin
      .firestore()
      .collection("albums")
      .doc(albumId)
      .collection("photos")
      .doc(photoId)
      .get();

    if (!photoDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Fotoğraf bulunamadı."
      );
    }

    const photoData = photoDoc.data()!;
    const storagePath = isThumbnail
      ? photoData.thumbnailPath
      : photoData.storagePath;

    if (!storagePath) {
      throw new functions.https.HttpsError(
        "not-found",
        "Fotoğraf dosya yolu bulunamadı."
      );
    }

    // Signed URL oluştur (1 saat geçerli)
    const bucket = admin.storage().bucket();
    const [signedUrl] = await bucket.file(storagePath).getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 1 saat
    });

    functions.logger.info(
      `Signed URL üretildi: uid=${uid}, albumId=${albumId}, photoId=${photoId}`
    );

    return { url: signedUrl };
  }
);

/**
 * İndirme izni olan fotoğraflar için indirme URL'i üretir.
 */
export const getDownloadUrl = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Giriş yapmanız gerekiyor."
      );
    }

    const { albumId, photoId } = data;
    const uid = context.auth.uid;
    const isAdmin = context.auth.token.role === "admin";

    // Albüm erişim kontrolü
    const albumDoc = await admin
      .firestore()
      .collection("albums")
      .doc(albumId)
      .get();

    if (!albumDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Albüm bulunamadı.");
    }

    const albumData = albumDoc.data()!;

    if (!isAdmin && albumData.customerId !== uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Bu albüme erişim yetkiniz yok."
      );
    }

    // İndirme izni var mı?
    if (!isAdmin && !albumData.downloadEnabled) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Bu albüm için indirme izni verilmemiştir."
      );
    }

    // Fotoğraf kaydını al
    const photoDoc = await admin
      .firestore()
      .collection("albums")
      .doc(albumId)
      .collection("photos")
      .doc(photoId)
      .get();

    if (!photoDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Fotoğraf bulunamadı."
      );
    }

    const storagePath = photoDoc.data()!.storagePath;

    // İndirme için daha uzun süreli signed URL (24 saat)
    const bucket = admin.storage().bucket();
    const [signedUrl] = await bucket.file(storagePath).getSignedUrl({
      action: "read",
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 saat
    });

    return { url: signedUrl };
  }
);
