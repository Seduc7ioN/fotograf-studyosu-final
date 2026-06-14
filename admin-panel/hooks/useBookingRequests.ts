"use client";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  BookingRequest,
  BookingRequestStatus,
  CreateBookingRequestInput,
} from "@/lib/types";

const COLLECTION = "booking_requests";

export function useBookingRequests() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requestsQuery = query(
      collection(db, COLLECTION),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      requestsQuery,
      (snapshot) => {
        setRequests(
          snapshot.docs.map(
            (item) => ({ id: item.id, ...item.data() } as BookingRequest)
          )
        );
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Booking requests could not be loaded:", err);
        setError("Randevu talepleri yüklenemedi.");
        setLoading(false);
      }
    );
  }, []);

  return { requests, loading, error };
}

export async function createBookingRequest(
  input: CreateBookingRequestInput
): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    eventType: input.eventType.trim(),
    preferredDate: input.preferredDate,
    city: input.city.trim(),
    venue: input.venue.trim(),
    message: input.message.trim(),
    status: "new" satisfies BookingRequestStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBookingRequest(
  requestId: string,
  data: Partial<
    Pick<BookingRequest, "status" | "adminNote" | "offerAmount">
  >
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, requestId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
