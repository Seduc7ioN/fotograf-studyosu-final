import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

/**
 * YENİ — PicPeak'ten ilham
 * Albüm görüntülenme olayını kaydeder.
 * Flutter uygulaması albüm açıldığında bu fonksiyonu çağırır.
 */
export const trackAlbumView = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }

  const { albumId } = data;
  const today = new Date().toISOString().split("T")[0]; // "2026-06-01"

  const albumRef = admin.firestore().collection("albums").doc(albumId);
  const analyticsRef = admin.firestore().collection("analytics").doc(albumId);

  // Batch write: hem albüm sayacı hem analytics
  const batch = admin.firestore().batch();

  batch.update(albumRef, {
    viewCount: admin.firestore.FieldValue.increment(1),
    lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  batch.set(
    analyticsRef,
    {
      albumId,
      viewCount: admin.firestore.FieldValue.increment(1),
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
      [`dailyViews.${today}`]: admin.firestore.FieldValue.increment(1),
    },
    { merge: true }
  );

  await batch.commit();
  return { success: true };
});

/**
 * YENİ — İndirme olayını kaydeder
 */
export const trackPhotoDownload = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }

  const { albumId, photoId } = data;
  const today = new Date().toISOString().split("T")[0];

  const batch = admin.firestore().batch();

  // Albüm sayacı
  batch.update(admin.firestore().collection("albums").doc(albumId), {
    downloadCount: admin.firestore.FieldValue.increment(1),
  });

  // Fotoğraf sayacı
  batch.update(
    admin.firestore()
      .collection("albums").doc(albumId)
      .collection("photos").doc(photoId),
    { downloadCount: admin.firestore.FieldValue.increment(1) }
  );

  // Analytics
  batch.set(
    admin.firestore().collection("analytics").doc(albumId),
    {
      downloadCount: admin.firestore.FieldValue.increment(1),
      [`dailyDownloads.${today}`]: admin.firestore.FieldValue.increment(1),
    },
    { merge: true }
  );

  await batch.commit();
  return { success: true };
});

/**
 * YENİ — Admin için analitik verisi döner
 */
export const getAlbumAnalytics = functions.https.onCall(async (data, context) => {
  if (context.auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Sadece admin.");
  }

  const { albumId } = data;

  const analyticsDoc = await admin
    .firestore()
    .collection("analytics")
    .doc(albumId)
    .get();

  if (!analyticsDoc.exists) {
    return { viewCount: 0, downloadCount: 0, dailyViews: {}, dailyDownloads: {} };
  }

  return analyticsDoc.data();
});
