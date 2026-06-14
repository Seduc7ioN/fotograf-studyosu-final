import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const europeWest1 = functions.region("europe-west1");

/**
 * YENİ — Lightfolio'dan ilham
 * Müşteri seçim modunda fotoğraf seçer (selected/deselected).
 * Admin panelde seçilen fotoğrafları görür ve onaylar/reddeder.
 */

// Müşteri fotoğraf seçer
export const selectPhoto = europeWest1.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }

  const { albumId, photoId, selected } = data;
  const uid = context.auth.uid;

  // Albüm kontrol: seçim modu açık mı?
  const albumDoc = await admin.firestore().collection("albums").doc(albumId).get();
  if (!albumDoc.exists) throw new functions.https.HttpsError("not-found", "Albüm bulunamadı.");

  const albumData = albumDoc.data()!;

  if (!albumData.selectionMode) {
    throw new functions.https.HttpsError("failed-precondition", "Bu albüm seçim modunda değil.");
  }

  if (albumData.customerId !== uid) {
    throw new functions.https.HttpsError("permission-denied", "Bu albüme erişim yetkiniz yok.");
  }

  // Seçim deadline kontrolü
  if (albumData.selectionDeadline && albumData.selectionDeadline.toDate() < new Date()) {
    throw new functions.https.HttpsError("deadline-exceeded", "Seçim süresi dolmuştur.");
  }

  await admin.firestore()
    .collection("albums").doc(albumId)
    .collection("photos").doc(photoId)
    .update({
      selectionStatus: selected ? "selected" : "none",
    });

  return { success: true };
});

// Admin seçimi onaylar veya reddeder
export const approvePhotoSelection = europeWest1.https.onCall(async (data, context) => {
  if (context.auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Sadece admin.");
  }

  const { albumId, photoId, approved } = data;

  await admin.firestore()
    .collection("albums").doc(albumId)
    .collection("photos").doc(photoId)
    .update({
      selectionStatus: approved ? "approved" : "rejected",
    });

  return { success: true };
});

// Albümdeki seçimlerin özetini döner
export const getSelectionSummary = europeWest1.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }

  const { albumId } = data;
  const isAdmin = context.auth.token.role === "admin";
  const uid = context.auth.uid;

  const albumDoc = await admin.firestore().collection("albums").doc(albumId).get();
  if (!albumDoc.exists) throw new functions.https.HttpsError("not-found", "Albüm bulunamadı.");

  if (!isAdmin && albumDoc.data()!.customerId !== uid) {
    throw new functions.https.HttpsError("permission-denied", "Erişim yok.");
  }

  const photosSnap = await admin.firestore()
    .collection("albums").doc(albumId)
    .collection("photos")
    .get();

  const summary = {
    total: photosSnap.size,
    selected: 0,
    approved: 0,
    rejected: 0,
    none: 0,
  };

  photosSnap.docs.forEach((doc) => {
    const status = doc.data().selectionStatus || "none";
    summary[status as keyof typeof summary]++;
  });

  return summary;
});
