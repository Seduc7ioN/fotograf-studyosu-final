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
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { CreateScheduleEventInput, ScheduleEvent } from "@/lib/types";

const SCHEDULE_COLLECTION = "schedule_events";

export function useScheduleEvents() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, SCHEDULE_COLLECTION), orderBy("eventDate", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEvents(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ScheduleEvent))
        );
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Schedule events could not be loaded:", err);
        setEvents([]);
        setError("Ajanda kayıtları yüklenemedi.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { events, loading, error };
}

export async function createScheduleEvent(input: CreateScheduleEventInput) {
  await addDoc(collection(db, SCHEDULE_COLLECTION), {
    title: input.title.trim(),
    eventDate: Timestamp.fromDate(input.eventDate),
    eventDateKey: input.eventDateKey,
    startTime: input.startTime?.trim() || null,
    location: input.location?.trim() || null,
    note: input.note?.trim() || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteScheduleEvent(eventId: string) {
  await deleteDoc(doc(db, SCHEDULE_COLLECTION, eventId));
}
