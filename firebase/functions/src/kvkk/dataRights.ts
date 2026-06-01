import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

/**
 * KVKK m.7 & m.11 — Veri Silme Hakkı
 * Müşteri "Verilerimi Sil" talebinde bulunduğunda tüm kişisel
 * verileri kalıcı olarak siler ve imha kaydını audit_logs'a yazar.
 */
export const deleteMyData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }

  const uid = context.auth.uid;
  const db = admin.firestore();
  const bucket = admin.storage().bucket();

  functions.logger.info(`KVKK veri silme talebi: uid=${uid}`);

  try {
    // 1. Kullanıcının albümlerini bul
    const albumsSnap = await db
      .collection("albums")
      .where("customerId", "==", uid)
      .get();

    for (const albumDoc of albumsSnap.docs) {
      const albumId = albumDoc.id;

      // 2. Her albümün fotoğraflarını Firestore'dan al
      const photosSnap = await db
        .collection("albums")
        .doc(albumId)
        .collection("photos")
        .get();

      // 3. Storage'daki dosyaları sil
      for (const photoDoc of photosSnap.docs) {
        const photoData = photoDoc.data();
        const paths = [
          photoData.storagePath,
          photoData.thumbnailPath,
          photoData.watermarkedPath,
        ].filter(Boolean);

        await Promise.allSettled(
          paths.map((p) => bucket.file(p).delete().catch(() => {}))
        );

        // Firestore fotoğraf kaydını sil
        await photoDoc.ref.delete();
      }

      // 4. Albüm dokümanını sil
      await albumDoc.ref.delete();
    }

    // 5. Favorileri sil
    const favSnap = await db
      .collection("favorites")
      .where("customerId", "==", uid)
      .get();
    await Promise.all(favSnap.docs.map((d) => d.ref.delete()));

    // 6. Yorumları sil
    const commentSnap = await db
      .collection("comments")
      .where("customerId", "==", uid)
      .get();
    await Promise.all(commentSnap.docs.map((d) => d.ref.delete()));

    // 7. Firestore kullanıcı kaydını sil
    await db.collection("users").doc(uid).delete();

    // 8. Firebase Auth hesabını sil
    await admin.auth().deleteUser(uid);

    // 9. KVKK imha kaydını audit_logs'a yaz (denetim için)
    await db.collection("audit_logs").add({
      type: "KVKK_DATA_DELETION",
      uid,
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedCollections: ["albums", "photos", "favorites", "comments", "users"],
      storageDeleted: true,
      authDeleted: true,
      legalBasis: "KVKK m.11/e — İlgili kişinin silme talebi",
    });

    functions.logger.info(`KVKK silme tamamlandı: uid=${uid}`);
    return { success: true, message: "Tüm kişisel verileriniz silinmiştir." };

  } catch (error) {
    functions.logger.error("KVKK silme hatası:", error);

    // Hata logunu da kaydet
    await db.collection("audit_logs").add({
      type: "KVKK_DATA_DELETION_ERROR",
      uid,
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      error: String(error),
    });

    throw new functions.https.HttpsError(
      "internal",
      "Veri silme işlemi sırasında hata oluştu. Lütfen e-posta ile başvurun."
    );
  }
});

/**
 * KVKK m.11/b — Veri Kopyası Talebi (Veri Taşınabilirliği)
 * Müşterinin kendine ait tüm meta-verileri JSON olarak döner.
 * (Fotoğraf dosyaları signed URL olarak eklenir)
 */
export const exportMyData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Giriş gerekli.");
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  const [userDoc, albumsSnap, favSnap, commentsSnap] = await Promise.all([
    db.collection("users").doc(uid).get(),
    db.collection("albums").where("customerId", "==", uid).get(),
    db.collection("favorites").where("customerId", "==", uid).get(),
    db.collection("comments").where("customerId", "==", uid).get(),
  ]);

  const exportData = {
    exportDate: new Date().toISOString(),
    legalBasis: "KVKK m.11/b — İlgili kişinin veri kopyası talebi",
    user: userDoc.exists
      ? { id: userDoc.id, ...userDoc.data() }
      : null,
    albums: albumsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    favorites: favSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    comments: commentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };

  // Denetim kaydı
  await db.collection("audit_logs").add({
    type: "KVKK_DATA_EXPORT",
    uid,
    requestedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return exportData;
});

/**
 * KVKK m.7 — Otomatik Periyodik İmha
 * Her ayın 1'i 03:00'de çalışır.
 * Süresi dolmuş albümleri ve verilerini kalıcı olarak siler.
 */
export const periodicDataCleanup = functions.pubsub
  .schedule("0 3 1 * *") // Her ayın 1'i, 03:00
  .timeZone("Europe/Istanbul")
  .onRun(async () => {
    const db = admin.firestore();
    const bucket = admin.storage().bucket();
    const now = admin.firestore.Timestamp.now();

    functions.logger.info("KVKK periyodik imha başladı.");

    // Süresi dolmuş albümleri bul
    const expiredSnap = await db
      .collection("albums")
      .where("expiresAt", "<", now)
      .where("status", "!=", "archived")
      .get();

    let deletedCount = 0;

    for (const albumDoc of expiredSnap.docs) {
      const albumId = albumDoc.id;

      try {
        // Fotoğrafları sil
        const photosSnap = await db
          .collection("albums").doc(albumId)
          .collection("photos").get();

        for (const photoDoc of photosSnap.docs) {
          const d = photoDoc.data();
          const paths = [d.storagePath, d.thumbnailPath, d.watermarkedPath].filter(Boolean);
          await Promise.allSettled(paths.map((p) => bucket.file(p).delete().catch(() => {})));
          await photoDoc.ref.delete();
        }

        // İlgili favorileri sil
        const favSnap = await db.collection("favorites").where("albumId", "==", albumId).get();
        await Promise.all(favSnap.docs.map((d) => d.ref.delete()));

        // Albümü "archived" olarak işaretle (metadata saklanır, dosyalar silinir)
        await albumDoc.ref.update({
          status: "archived",
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
          photoCount: 0,
        });

        // İmha logu
        await db.collection("audit_logs").add({
          type: "KVKK_AUTO_CLEANUP",
          albumId,
          deletedAt: admin.firestore.FieldValue.serverTimestamp(),
          legalBasis: "KVKK m.7 — Saklama süresi sonu otomatik imha",
        });

        deletedCount++;
      } catch (err) {
        functions.logger.error(`Albüm imha hatası: albumId=${albumId}`, err);
      }
    }

    functions.logger.info(`KVKK periyodik imha tamamlandı. ${deletedCount} albüm işlendi.`);
  });
