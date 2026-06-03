"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { Comment } from "@/lib/types";

export function useAlbumComments(albumId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!albumId) return;

    const q = query(collection(db, "comments"), where("albumId", "==", albumId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Comment)
        );
        data.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
          const bDate = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
          return bDate - aDate;
        });
        setComments(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Album comments could not be loaded:", err);
        setComments([]);
        setError("Müşteri yorumları yüklenemedi.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [albumId]);

  return { comments, loading, error };
}
