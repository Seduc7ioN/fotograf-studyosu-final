"use client";

import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getToken, onMessage } from "firebase/messaging";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { auth, db, messagingPromise } from "@/lib/firebase";

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

type PushStatus =
  | "unsupported"
  | "missing-vapid"
  | "default"
  | "granted"
  | "denied"
  | "loading";

async function sha256(value: string) {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) return null;

  const existing = await navigator.serviceWorker.getRegistration(
    "/firebase-messaging-sw.js"
  );
  if (existing) return existing;

  return navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

export function useAdminPushNotifications() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [saving, setSaving] = useState(false);
  const [tokenId, setTokenId] = useState<string | null>(null);

  const canAskPermission = useMemo(
    () => status === "default" || status === "denied",
    [status]
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (typeof window === "undefined" || !("Notification" in window)) {
        if (active) setStatus("unsupported");
        return;
      }

      if (!vapidKey) {
        if (active) setStatus("missing-vapid");
        return;
      }

      const messaging = await messagingPromise;
      if (!messaging) {
        if (active) setStatus("unsupported");
        return;
      }

      if (active) setStatus(Notification.permission as PushStatus);
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function subscribeForegroundMessages() {
      const messaging = await messagingPromise;
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title || "Yeni bildirim";
        const body = payload.notification?.body || "";
        toast.success(`${title}${body ? `\n${body}` : ""}`);
      });
    }

    void subscribeForegroundMessages();
    return () => unsubscribe?.();
  }, []);

  const enable = useCallback(async () => {
    if (!auth.currentUser) {
      toast.error("Bildirimleri açmak için admin girişi gerekli.");
      return;
    }

    if (!vapidKey) {
      toast.error("Firebase Web Push VAPID key eksik.");
      setStatus("missing-vapid");
      return;
    }

    setSaving(true);
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission as PushStatus);

      if (permission !== "granted") {
        toast.error("Bildirim izni verilmedi.");
        return;
      }

      const messaging = await messagingPromise;
      const registration = await getServiceWorkerRegistration();
      if (!messaging || !registration) {
        toast.error("Bu tarayıcı push bildirimini desteklemiyor.");
        setStatus("unsupported");
        return;
      }

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        toast.error("Bildirim tokenı alınamadı.");
        return;
      }

      const id = await sha256(token);
      const ref = doc(db, "admin_push_tokens", id);
      const existing = await getDoc(ref);

      await setDoc(
        ref,
        {
          token,
          uid: auth.currentUser.uid,
          email: auth.currentUser.email || "",
          enabled: true,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          updatedAt: serverTimestamp(),
          createdAt: existing.exists()
            ? existing.data().createdAt
            : serverTimestamp(),
        },
        { merge: true }
      );

      setTokenId(id);
      toast.success("Panel bildirimleri açıldı.");
    } catch (err) {
      console.error("Admin push notifications could not be enabled:", err);
      toast.error("Bildirimler açılamadı.");
    } finally {
      setSaving(false);
    }
  }, []);

  const disable = useCallback(async () => {
    if (!tokenId) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, "admin_push_tokens", tokenId));
      setTokenId(null);
      toast.success("Bu cihaz için bildirim kapatıldı.");
    } catch (err) {
      console.error("Admin push notifications could not be disabled:", err);
      toast.error("Bildirim kapatılamadı.");
    } finally {
      setSaving(false);
    }
  }, [tokenId]);

  return {
    status,
    saving,
    enabled: status === "granted",
    canAskPermission,
    enable,
    disable,
  };
}
