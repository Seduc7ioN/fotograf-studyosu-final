"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebase";
import { SiteMusicTrack } from "@/lib/types";

const COLLECTION = "site_music";

export function useSiteMusic() {
  const [tracks, setTracks] = useState<SiteMusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const musicQuery = query(
      collection(db, COLLECTION),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      musicQuery,
      (snapshot) => {
        setTracks(
          snapshot.docs.map(
            (item) => ({ id: item.id, ...item.data() } as SiteMusicTrack)
          )
        );
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Site music could not be loaded:", err);
        setError("Site müzikleri yüklenemedi.");
        setLoading(false);
      }
    );
  }, []);

  return { tracks, loading, error };
}

export function useActiveSiteMusic() {
  const [track, setTrack] = useState<SiteMusicTrack | null>(null);

  useEffect(() => {
    const musicQuery = query(
      collection(db, COLLECTION),
      where("active", "==", true),
      orderBy("updatedAt", "desc"),
      limit(1)
    );

    return onSnapshot(
      musicQuery,
      (snapshot) => {
        const activeTrack = snapshot.docs[0];
        setTrack(
          activeTrack
            ? ({ id: activeTrack.id, ...activeTrack.data() } as SiteMusicTrack)
            : null
        );
      },
      (err) => {
        console.error("Active site music could not be loaded:", err);
        setTrack(null);
      }
    );
  }, []);

  return track;
}

export async function createSiteMusicTrack(file: File): Promise<void> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "mp3";
  const storagePath = `site/music/${Date.now()}_${crypto.randomUUID()}.${extension}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, { contentType: file.type });
  const audioUrl = await getDownloadURL(storageRef);

  const snapshot = await getDocs(collection(db, COLLECTION));
  const batch = writeBatch(db);
  snapshot.docs.forEach((musicDoc) => {
    batch.update(musicDoc.ref, {
      active: false,
      updatedAt: serverTimestamp(),
    });
  });

  const musicRef = doc(collection(db, COLLECTION));
  batch.set(musicRef, {
    title: file.name.replace(/\.[^/.]+$/, "") || "Site Müziği",
    audioUrl,
    storagePath,
    fileName: file.name,
    contentType: file.type,
    size: file.size,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function updateSiteMusicTrack(
  trackId: string,
  data: Partial<Pick<SiteMusicTrack, "title" | "active">>
): Promise<void> {
  if (data.active) {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const batch = writeBatch(db);
    snapshot.docs.forEach((musicDoc) => {
      if (musicDoc.id === trackId) return;
      batch.update(musicDoc.ref, {
        active: false,
        updatedAt: serverTimestamp(),
      });
    });
    batch.update(doc(db, COLLECTION, trackId), {
      ...data,
      active: true,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    return;
  }

  await updateDoc(doc(db, COLLECTION, trackId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSiteMusicTrack(track: SiteMusicTrack): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, track.id));
  if (track.storagePath) {
    await deleteObject(ref(storage, track.storagePath)).catch(() => undefined);
  }
}
