"use client";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase";
import { User, CreateUserInput } from "@/lib/types";
import { useEffect, useState } from "react";

export function useCustomers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as User))
          .filter((u) => u.role === "customer");
        setCustomers(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Customers could not be loaded:", err);
        setCustomers([]);
        setError("Müşteriler yüklenemedi.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { customers, loading, error };
}

export function useCustomer(customerId: string) {
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) return;
    getDoc(doc(db, "users", customerId))
      .then((snap) => {
        if (snap.exists()) {
          setCustomer({ id: snap.id, ...snap.data() } as User);
        }
        setError(null);
      })
      .catch((err) => {
        console.error("Customer could not be loaded:", err);
        setError("Müşteri yüklenemedi.");
      })
      .finally(() => setLoading(false));
  }, [customerId]);

  return { customer, loading, error };
}

/**
 * Yeni müşteri oluşturur.
 * Firebase Auth + Firestore kaydı birlikte oluşturulur (API route üzerinden).
 */
export async function createCustomer(input: CreateUserInput): Promise<string> {
  const res = await fetch("/api/customers/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Müşteri oluşturulamadı.");
  }

  const { uid } = await res.json();
  return uid;
}

export async function updateCustomer(
  customerId: string,
  data: Partial<User>
): Promise<void> {
  await updateDoc(doc(db, "users", customerId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCustomer(customerId: string): Promise<void> {
  // Önce Firestore kaydını sil, sonra Auth kullanıcısını API route ile sil
  await fetch("/api/customers/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: customerId }),
  });
  await deleteDoc(doc(db, "users", customerId));
}
