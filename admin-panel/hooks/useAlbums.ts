"use client";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Album, CreateAlbumInput } from "@/lib/types";
import { useEffect, useState } from "react";

export function useAlbums(customerId?: string) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, "albums"), orderBy("createdAt", "desc"));

    if (customerId) {
      q = query(
        collection(db, "albums"),
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Album)
      );
      setAlbums(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [customerId]);

  return { albums, loading };
}

export function useAlbumPhotos(albumId: string) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;

    const q = query(
      collection(db, "albums", albumId, "photos"),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPhotos(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [albumId]);

  return { photos, loading };
}

export async function createAlbum(input: CreateAlbumInput): Promise<string> {
  const docRef = await addDoc(collection(db, "albums"), {
    ...input,
    status: "draft",
    photoCount: 0,
    downloadEnabled: input.downloadEnabled ?? false,
    expiresAt: input.expiresAt ? Timestamp.fromDate(input.expiresAt) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateAlbum(
  albumId: string,
  data: Partial<Album>
): Promise<void> {
  await updateDoc(doc(db, "albums", albumId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function publishAlbum(albumId: string): Promise<void> {
  await updateDoc(doc(db, "albums", albumId), {
    status: "ready",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAlbum(albumId: string): Promise<void> {
  await fetch("/api/albums/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ albumId }),
  });
}

// Tek albüm hook'u
export function useAlbum(albumId: string) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;
    const unsub = onSnapshot(doc(db, "albums", albumId), (snap) => {
      setAlbum(snap.exists() ? ({ id: snap.id, ...snap.data() } as Album) : null);
      setLoading(false);
    });
    return unsub;
  }, [albumId]);

  return { album, loading };
}
