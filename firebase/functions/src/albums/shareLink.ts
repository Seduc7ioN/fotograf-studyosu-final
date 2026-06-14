import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { randomUUID } from "crypto";

const europeWest1 = functions.region("europe-west1");

/**
 * YENİ — PicPeak'ten ilham
 * Admin panelden çağrılır: albüm için QR erişim token'ı oluşturur.
 * Müşteriye QR kodu paylaşılır → QR tarandığında şifresiz albüme gider.
 * Token süre bazlı (expiresAt) veya kalıcı olabilir.
 */
export const createShareLink = europeWest1.https.onCall(async (data, context) => {
  if (context.auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Sadece admin.");
  }

  const { albumId, expiresInDays } = data;
  if (!albumId) throw new functions.https.HttpsError("invalid-argument", "albumId gerekli.");

  const token = randomUUID();
  const expiresAt = expiresInDays
    ? admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      )
    : null;

  // Albüm dokümanına shareToken yaz
  await admin.firestore().collection("albums").doc(albumId).update({
    shareToken: token,
    shareEnabled: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // share_links koleksiyonuna kaydet
  await admin.firestore().collection("share_links").doc(token).set({
    albumId,
    token,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: expiresAt ?? null,
    viewCount: 0,
  });

  functions.logger.info(`Share link oluşturuldu: albumId=${albumId}, token=${token}`);

  return { token, expiresAt };
});

/**
 * YENİ — Share token ile albüme erişim (şifresiz, QR tarama senaryosu)
 * Flutter uygulamasında deep link ile açılır: studyo://share/{token}
 */
export const getAlbumByShareToken = europeWest1.https.onCall(async (data) => {
  const { token } = data;
  if (!token) throw new functions.https.HttpsError("invalid-argument", "token gerekli.");

  const linkDoc = await admin.firestore().collection("share_links").doc(token).get();

  if (!linkDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Geçersiz link.");
  }

  const linkData = linkDoc.data()!;

  // Süre kontrolü
  if (linkData.expiresAt && linkData.expiresAt.toDate() < new Date()) {
    throw new functions.https.HttpsError("deadline-exceeded", "Bu linkin süresi dolmuş.");
  }

  // Albüm kontrolü
  const albumDoc = await admin.firestore().collection("albums").doc(linkData.albumId).get();
  if (!albumDoc.exists || albumDoc.data()!.status !== "ready") {
    throw new functions.https.HttpsError("not-found", "Albüm bulunamadı veya henüz hazır değil.");
  }

  // Görüntülenme sayacını artır
  await linkDoc.ref.update({ viewCount: admin.firestore.FieldValue.increment(1) });
  await albumDoc.ref.update({ viewCount: admin.firestore.FieldValue.increment(1) });

  return {
    albumId: linkData.albumId,
    album: { id: albumDoc.id, ...albumDoc.data() },
  };
});
