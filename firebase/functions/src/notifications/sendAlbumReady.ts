import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

/**
 * Admin panelden albüm "hazır" olarak işaretlenince
 * müşteriye push bildirimi gönderir.
 */
export const sendAlbumReadyNotification = functions.firestore
  .document("albums/{albumId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const albumId = context.params.albumId;

    // Sadece status "draft" → "ready" geçişinde tetikle
    if (before.status === after.status || after.status !== "ready") {
      return;
    }

    const customerId = after.customerId;
    if (!customerId) return;

    // Müşterinin FCM token'ını al
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(customerId)
      .get();

    if (!userDoc.exists) return;

    const fcmToken = userDoc.data()!.fcmToken;
    if (!fcmToken) {
      functions.logger.info(`Müşterinin FCM token'ı yok: ${customerId}`);
      return;
    }

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: "📸 Fotoğraflarınız Hazır!",
        body: `"${after.title}" albümünüz görüntülenmeye hazır.`,
      },
      data: {
        albumId,
        type: "album_ready",
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      android: {
        notification: {
          sound: "default",
          channelId: "album_ready",
        },
      },
    };

    try {
      await admin.messaging().send(message);
      functions.logger.info(
        `Bildirim gönderildi: customerId=${customerId}, albumId=${albumId}`
      );
    } catch (error) {
      functions.logger.error("Bildirim gönderme hatası:", error);
    }
  });

/**
 * Callable: Admin panelden manuel bildirim göndermek için
 */
export const sendManualNotification = functions.https.onCall(
  async (data, context) => {
    if (context.auth?.token?.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Sadece admin bu işlemi yapabilir."
      );
    }

    const { customerId, title, body, albumId } = data;

    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(customerId)
      .get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Kullanıcı bulunamadı."
      );
    }

    const fcmToken = userDoc.data()!.fcmToken;
    if (!fcmToken) {
      throw new functions.https.HttpsError(
        "not-found",
        "Kullanıcının bildirim token'ı yok."
      );
    }

    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: albumId ? { albumId, type: "manual" } : { type: "manual" },
    });

    return { success: true };
  }
);
