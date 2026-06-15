import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

type AdminPushPayload = {
  title: string;
  body: string;
  url: string;
  type: "booking_request" | "agenda_today" | "agenda_tomorrow";
  entityId?: string;
};

const TIME_ZONE = "Europe/Istanbul";
const MAX_TOKENS_PER_BATCH = 500;
const europeWest1 = functions.region("europe-west1");

function dateKeyInIstanbul(offsetDays = 0): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  ) as Record<string, string>;

  const localNoon = new Date(
    Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day) + offsetDays,
      12
    )
  );

  return formatter.format(localNoon);
}

function compactBody(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" · ");
}

async function getAdminPushTokens() {
  const snapshot = await admin
    .firestore()
    .collection("admin_push_tokens")
    .where("enabled", "==", true)
    .get();

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ref: doc.ref,
      token: String(doc.data().token || ""),
    }))
    .filter((item) => item.token.length > 20);
}

async function sendAdminPush(payload: AdminPushPayload) {
  const tokenDocs = await getAdminPushTokens();

  if (tokenDocs.length === 0) {
    functions.logger.info("Admin push token bulunamadı.", payload);
    return;
  }

  for (let index = 0; index < tokenDocs.length; index += MAX_TOKENS_PER_BATCH) {
    const batch = tokenDocs.slice(index, index + MAX_TOKENS_PER_BATCH);
    const response = await admin.messaging().sendEachForMulticast({
      tokens: batch.map((item) => item.token),
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        type: payload.type,
        url: payload.url,
        entityId: payload.entityId || "",
      },
      webpush: {
        fcmOptions: {
          link: payload.url,
        },
        notification: {
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          requireInteraction: payload.type === "booking_request",
        },
      },
    });

    await Promise.all(
      response.responses.map(async (result, responseIndex) => {
        const code = result.error?.code;
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        ) {
          await batch[responseIndex].ref.delete();
        }
      })
    );

    functions.logger.info("Admin push gönderildi.", {
      payload,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  }
}

export const notifyAdminsOnBookingRequest = europeWest1.firestore
  .document("booking_requests/{requestId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    const requestId = context.params.requestId;
    const body = compactBody([
      data.name,
      data.eventType,
      data.preferredDate,
      data.city,
    ]);

    await sendAdminPush({
      title: "Yeni çekim talebi geldi",
      body: body || "Web sitesinden yeni başvuru alındı.",
      url: `/requests`,
      type: "booking_request",
      entityId: requestId,
    });
  });

async function sendAgendaDigest(dateKey: string, type: "agenda_today" | "agenda_tomorrow") {
  const snapshot = await admin
    .firestore()
    .collection("schedule_events")
    .where("eventDateKey", "==", dateKey)
    .get();

  if (snapshot.empty) {
    functions.logger.info("Ajanda hatırlatması için kayıt yok.", { dateKey, type });
    return;
  }

  const events = snapshot.docs.map((doc) => {
    const data = doc.data();
    return compactBody([
      data.startTime || "Saat girilmedi",
      data.title,
      data.customerName,
      data.location,
    ]);
  });

  const title =
    type === "agenda_today"
      ? "Bugünkü çekim planı"
      : "Yarınki çekim hatırlatması";
  const body =
    events.length === 1
      ? events[0]
      : `${events.length} plan var: ${events.slice(0, 3).join(" / ")}`;

  await sendAdminPush({
    title,
    body,
    url: "/agenda",
    type,
    entityId: dateKey,
  });
}

export const sendTodayAgendaReminder = europeWest1.pubsub
  .schedule("every day 08:30")
  .timeZone(TIME_ZONE)
  .onRun(async () => {
    await sendAgendaDigest(dateKeyInIstanbul(), "agenda_today");
  });

export const sendTomorrowAgendaReminder = europeWest1.pubsub
  .schedule("every day 18:00")
  .timeZone(TIME_ZONE)
  .onRun(async () => {
    await sendAgendaDigest(dateKeyInIstanbul(1), "agenda_tomorrow");
  });
