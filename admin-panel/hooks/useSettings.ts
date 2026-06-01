"use client";

import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

export type StudioSettings = {
  studioName: string;
  contactEmail: string;
  phone: string;
  address: string;
  website: string;
  defaultDownloadEnabled: boolean;
  defaultAlbumExpiryDays: number;
  maxUploadSizeMB: number;
};

export const defaultStudioSettings: StudioSettings = {
  studioName: "Stüdyo Admin",
  contactEmail: "",
  phone: "",
  address: "",
  website: "",
  defaultDownloadEnabled: true,
  defaultAlbumExpiryDays: 30,
  maxUploadSizeMB: 30,
};

async function getAdminToken() {
  const token = await auth.currentUser?.getIdToken(true);
  if (!token) {
    throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
  }
  return token;
}

export async function fetchSettings(): Promise<StudioSettings> {
  const token = await getAdminToken();
  const res = await fetch("/api/settings", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Ayarlar yüklenemedi.");
  }

  return {
    ...defaultStudioSettings,
    ...data,
  };
}

export async function saveSettings(settings: StudioSettings): Promise<void> {
  const token = await getAdminToken();
  const res = await fetch("/api/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Ayarlar kaydedilemedi.");
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<StudioSettings>(defaultStudioSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchSettings()
      .then((data) => {
        if (!cancelled) {
          setSettings(data);
          setError(null);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err.message || "Ayarlar yüklenemedi.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, setSettings, loading, error };
}
