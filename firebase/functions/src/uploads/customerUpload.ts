import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import sharp from "sharp";

const europeWest1 = functions.region("europe-west1");

/**
 * MÜŞTERİ FOTOĞRAF YÜKLEME — ONAY AKIŞI
 *
 * Storage yapısı:
 *   albums/{albumId}/pending/{uploadId}.jpg   ← müşteri yükler
 *   albums/{albumId}/originals/{photoId}.jpg  ← admin onaylarsa taşınır
 *   albums/{albumId}/thumbs/{photoId}.jpg     ← onay sonrası oluşturulur
 *
 * Firestore yapısı:
 *   pending_uploads/{uploadId} → { albumId, customerId, status: "pending"|"approved"|"rejected" }
 */

// ─── 1. Müşteriye yükleme için pre-signed URL ver ─────────────────────────────
export const getCustomerUploadUrl = europeWest1.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }

  const { albumId, fileName, contentType } = data;
  const uid = context.auth.uid;

  // Albüm sahibi mi?
  const albumDoc = await admin.firestore().collection("albums").doc(albumId).get();
  if (!albumDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Albüm bulunamadı.");
  }
  if (albumDoc.data()!.customerId !== uid) {
    throw new functions.https.HttpsError("permission-denied", "Bu albüme erişim yetkiniz yok.");
  }

  // Müşteri yükleme aktif mi?
  if (!albumDoc.data()!.customerUploadEnabled) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Bu albüm için müşteri yüklemesi kapalıdır."
    );
  }

  // Albüm süresi dolmuş mu?
  const expiresAt = albumDoc.data()!.expiresAt?.toDate();
  if (expiresAt && expiresAt < new Date()) {
    throw new functions.https.HttpsError("deadline-exceeded", "Bu albümün süresi dolmuştur.");
  }

  // Dosya tipi kontrolü
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowed.includes(contentType)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Sadece JPG, PNG, WEBP ve HEIC formatları desteklenir."
    );
  }

  // Pending upload kaydı oluştur
  const uploadRef = await admin.firestore().collection("pending_uploads").add({
    albumId,
    customerId: uid,
    fileName,
    contentType,
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const uploadId = uploadRef.id;
  const ext = path.extname(fileName) || ".jpg";
  const storagePath = `albums/${albumId}/pending/${uploadId}${ext}`;

  // Pending upload'a storagePath yaz
  await uploadRef.update({ storagePath });

  // Signed upload URL üret (15 dakika geçerli)
  const bucket = admin.storage().bucket();
  const [uploadUrl] = await bucket.file(storagePath).getSignedUrl({
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  });

  functions.logger.info(`Müşteri upload URL üretildi: uid=${uid}, albumId=${albumId}, uploadId=${uploadId}`);

  return { uploadUrl, uploadId, storagePath };
});

// ─── 2. Admin: Pending yüklemeleri listele ────────────────────────────────────
export const getPendingUploads = europeWest1.https.onCall(async (data, context) => {
  if (context.auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Sadece admin.");
  }

  const { albumId } = data;

  let query: admin.firestore.Query = admin
    .firestore()
    .collection("pending_uploads")
    .where("status", "==", "pending")
    .orderBy("createdAt", "desc");

  if (albumId) {
    query = query.where("albumId", "==", albumId);
  }

  const snap = await query.limit(50).get();

  // Her biri için thumbnail preview URL üret
  const bucket = admin.storage().bucket();
  const results = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      let previewUrl: string | null = null;

      try {
        const [url] = await bucket.file(d.storagePath).getSignedUrl({
          action: "read",
          expires: Date.now() + 60 * 60 * 1000, // 1 saat
        });
        previewUrl = url;
      } catch (_) {}

      return { id: doc.id, ...d, previewUrl };
    })
  );

  return results;
});

// ─── 3. Admin: Fotoğrafı onayla → albüme taşı ────────────────────────────────
export const approveCustomerUpload = functions
  .region("europe-west1")
  .runWith({ timeoutSeconds: 120, memory: "512MB" })
  .https.onCall(async (data, context) => {
    if (context.auth?.token?.role !== "admin") {
      throw new functions.https.HttpsError("permission-denied", "Sadece admin.");
    }

    const { uploadId } = data;
    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    // Pending kaydını al
    const uploadDoc = await db.collection("pending_uploads").doc(uploadId).get();
    if (!uploadDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Yükleme kaydı bulunamadı.");
    }

    const uploadData = uploadDoc.data()!;
    if (uploadData.status !== "pending") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Bu yükleme zaten işlenmiş."
      );
    }

    const { albumId, storagePath } = uploadData;

    // Albümdeki mevcut fotoğraf sayısını al (sıralama için)
    const photosSnap = await db
      .collection("albums").doc(albumId)
      .collection("photos").get();
    const order = photosSnap.size;

    // Yeni photoId ve yol
    const photoId = db.collection("_").doc().id;
    const ext = path.extname(storagePath) || ".jpg";
    const newOriginalPath = `albums/${albumId}/originals/${photoId}${ext}`;
    const newThumbPath = `albums/${albumId}/thumbs/${photoId}.jpg`;

    // Dosyayı pending → originals'a kopyala
    await bucket.file(storagePath).copy(bucket.file(newOriginalPath));

    // Thumbnail oluştur
    const tempInput = path.join(os.tmpdir(), `${photoId}${ext}`);
    const tempThumb = path.join(os.tmpdir(), `${photoId}_thumb.jpg`);
    try {
      await bucket.file(newOriginalPath).download({ destination: tempInput });
      await sharp(tempInput)
        .resize(400, 400, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(tempThumb);
      await bucket.upload(tempThumb, {
        destination: newThumbPath,
        metadata: { contentType: "image/jpeg" },
      });
    } finally {
      if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
      if (fs.existsSync(tempThumb)) fs.unlinkSync(tempThumb);
    }

    // Firestore'a photo kaydı ekle
    await db.collection("albums").doc(albumId).collection("photos").doc(photoId).set({
      id: photoId,
      albumId,
      storagePath: newOriginalPath,
      thumbnailPath: newThumbPath,
      isDownloadable: false,
      order,
      uploadedByCustomer: true,   // ← müşteri yükledi işareti
      customerId: uploadData.customerId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Albüm fotoğraf sayacını artır
    await db.collection("albums").doc(albumId).update({
      photoCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Pending kaydını güncelle
    await uploadDoc.ref.update({
      status: "approved",
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedPhotoId: photoId,
    });

    // Pending dosyayı sil
    await bucket.file(storagePath).delete().catch(() => {});

    // Müşteriye bildirim gönder
    const userDoc = await db.collection("users").doc(uploadData.customerId).get();
    const fcmToken = userDoc.data()?.fcmToken;
    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: "✅ Fotoğrafınız Onaylandı",
          body: "Yüklediğiniz fotoğraf albüme eklendi.",
        },
        data: { albumId, type: "upload_approved" },
      });
    }

    functions.logger.info(`Upload onaylandı: uploadId=${uploadId} → photoId=${photoId}`);
    return { success: true, photoId };
  });

// ─── 4. Admin: Fotoğrafı reddet → sil ────────────────────────────────────────
export const rejectCustomerUpload = europeWest1.https.onCall(async (data, context) => {
  if (context.auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Sadece admin.");
  }

  const { uploadId, reason } = data;
  const db = admin.firestore();
  const bucket = admin.storage().bucket();

  const uploadDoc = await db.collection("pending_uploads").doc(uploadId).get();
  if (!uploadDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Yükleme kaydı bulunamadı.");
  }

  const uploadData = uploadDoc.data()!;

  // Pending dosyayı Storage'dan sil
  await bucket.file(uploadData.storagePath).delete().catch(() => {});

  // Kaydı güncelle
  await uploadDoc.ref.update({
    status: "rejected",
    rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
    rejectionReason: reason || "Belirtilmedi",
  });

  // Müşteriye bildirim
  const userDoc = await db.collection("users").doc(uploadData.customerId).get();
  const fcmToken = userDoc.data()?.fcmToken;
  if (fcmToken) {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: "❌ Fotoğraf Reddedildi",
        body: reason
          ? `Fotoğrafınız reddedildi: ${reason}`
          : "Yüklediğiniz fotoğraf albüme eklenmedi.",
      },
      data: { albumId: uploadData.albumId, type: "upload_rejected" },
    });
  }

  functions.logger.info(`Upload reddedildi: uploadId=${uploadId}`);
  return { success: true };
});

// ─── 5. Storage trigger: Pending klasörüne dosya gelince Firestore'u güncelle ─
export const onCustomerUploadComplete = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name!;

    // Sadece pending klasöründeki dosyaları işle
    if (!filePath.includes("/pending/")) return;

    // Dosya adından uploadId'yi çıkar
    const uploadId = path.basename(filePath, path.extname(filePath));

    // Firestore kaydını "uploaded" olarak işaretle
    const uploadRef = admin.firestore().collection("pending_uploads").doc(uploadId);
    const uploadDoc = await uploadRef.get();
    if (!uploadDoc.exists) return;

    await uploadRef.update({
      fileSize: object.size,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      fileReady: true,
    });

    // Admin'e bildirim: yeni onay bekleyen var
    // (Admin push bildirim sistemi opsiyonel)
    functions.logger.info(`Müşteri yüklemesi tamamlandı: uploadId=${uploadId}`);
  });
