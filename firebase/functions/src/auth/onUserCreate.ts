import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

/**
 * Yeni kullanıcı oluşturulduğunda Firestore'daki role'e göre
 * custom claim atar. Admin panelden kullanıcı oluşturulunca
 * bu fonksiyon tetiklenir.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    // Firestore'dan kullanıcı kaydını al
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get();

    if (!userDoc.exists) {
      functions.logger.warn(`User doc not found for uid: ${user.uid}`);
      return;
    }

    const userData = userDoc.data()!;
    const role = userData.role ?? "customer";

    // Custom claim olarak role'ü ata
    await admin.auth().setCustomUserClaims(user.uid, { role });

    functions.logger.info(`Custom claim set for ${user.uid}: role=${role}`);
  } catch (error) {
    functions.logger.error("onUserCreate error:", error);
  }
});

/**
 * Admin panelden çağrılır. Mevcut kullanıcıya admin claim'i ekler.
 * Sadece mevcut admin çağırabilir (callable function).
 */
export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Çağıran admin mi?
  if (context.auth?.token?.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Sadece admin bu işlemi yapabilir."
    );
  }

  const { targetUid } = data;
  if (!targetUid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "targetUid gerekli."
    );
  }

  await admin.auth().setCustomUserClaims(targetUid, { role: "admin" });
  return { success: true };
});
