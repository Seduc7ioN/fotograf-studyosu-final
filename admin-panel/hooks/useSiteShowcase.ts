"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebase";
import { SiteShowcaseItem } from "@/lib/types";

const COLLECTION = "site_showcase";

export function useSiteShowcase() {
  const [items, setItems] = useState<SiteShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const showcaseQuery = query(collection(db, COLLECTION), orderBy("order", "asc"));
    return onSnapshot(
      showcaseQuery,
      (snapshot) => {
        setItems(
          snapshot.docs.map(
            (item) => ({ id: item.id, ...item.data() } as SiteShowcaseItem)
          )
        );
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Site showcase could not be loaded:", err);
        setError("Vitrin görselleri yüklenemedi.");
        setLoading(false);
      }
    );
  }, []);

  return { items, loading, error };
}

export async function createShowcaseItem(
  file: File,
  order: number
): Promise<void> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `site/showcase/${Date.now()}_${crypto.randomUUID()}.${extension}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, { contentType: file.type });
  const imageUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, COLLECTION), {
    title: "Yeni Hikaye",
    caption: "Lume Art Wedding",
    imageUrl,
    storagePath,
    order,
    published: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateShowcaseItem(
  itemId: string,
  data: Partial<Pick<SiteShowcaseItem, "title" | "caption" | "order" | "published">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, itemId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteShowcaseItem(item: SiteShowcaseItem): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, item.id));
  if (item.storagePath) {
    await deleteObject(ref(storage, item.storagePath)).catch(() => undefined);
  }
}
