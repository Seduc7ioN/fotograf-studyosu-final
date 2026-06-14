import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const europeWest1 = functions.region("europe-west1");

/**
 * YENİ — PicPeak'ten ilham
 * Müşteri albüm veya fotoğraf üzerine yorum bırakabilir.
 * Admin panelde tüm yorumları görebilir ve yanıt verebilir.
 */

// Yorum ekle
export const addComment = europeWest1.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }

  const { albumId, photoId, text } = data;
  const uid = context.auth.uid;

  if (!text || text.trim().length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "Yorum boş olamaz.");
  }

  if (text.length > 500) {
    throw new functions.https.HttpsError("invalid-argument", "Yorum 500 karakteri geçemez.");
  }

  // Albüm erişim kontrolü
  const albumDoc = await admin.firestore().collection("albums").doc(albumId).get();
  if (!albumDoc.exists) throw new functions.https.HttpsError("not-found", "Albüm bulunamadı.");

  const isAdmin = context.auth.token.role === "admin";
  if (!isAdmin && albumDoc.data()!.customerId !== uid) {
    throw new functions.https.HttpsError("permission-denied", "Erişim yok.");
  }

  // Kullanıcı adını al
  const userDoc = await admin.firestore().collection("users").doc(uid).get();
  const customerName = userDoc.data()?.name || "Müşteri";

  // Yorumu kaydet
  const commentRef = await admin.firestore().collection("comments").add({
    albumId,
    photoId: photoId || null,
    customerId: uid,
    customerName,
    text: text.trim(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info(`Yorum eklendi: commentId=${commentRef.id}, albumId=${albumId}`);
  return { id: commentRef.id };
});

// Yorumları listele
export const getComments = europeWest1.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }

  const { albumId, photoId } = data;
  const uid = context.auth.uid;
  const isAdmin = context.auth.token.role === "admin";

  // Erişim kontrolü
  if (!isAdmin) {
    const albumDoc = await admin.firestore().collection("albums").doc(albumId).get();
    if (!albumDoc.exists || albumDoc.data()!.customerId !== uid) {
      throw new functions.https.HttpsError("permission-denied", "Erişim yok.");
    }
  }

  let query: admin.firestore.Query = admin.firestore()
    .collection("comments")
    .where("albumId", "==", albumId)
    .orderBy("createdAt", "asc");

  if (photoId) {
    query = query.where("photoId", "==", photoId);
  }

  const snap = await query.limit(100).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});

// Yorum sil (sadece kendi yorumu veya admin)
export const deleteComment = europeWest1.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }

  const { commentId } = data;
  const uid = context.auth.uid;
  const isAdmin = context.auth.token.role === "admin";

  const commentDoc = await admin.firestore().collection("comments").doc(commentId).get();
  if (!commentDoc.exists) throw new functions.https.HttpsError("not-found", "Yorum bulunamadı.");

  if (!isAdmin && commentDoc.data()!.customerId !== uid) {
    throw new functions.https.HttpsError("permission-denied", "Sadece kendi yorumunuzu silebilirsiniz.");
  }

  await commentDoc.ref.delete();
  return { success: true };
});
