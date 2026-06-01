"use client";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, CreateUserInput } from "@/lib/types";
import { useEffect, useState } from "react";

async function getAdminToken(): Promise<string> {
  const token = await auth.currentUser?.getIdToken(true);
  if (!token) {
    throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
  }
  return token;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

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

export async function createCustomer(input: CreateUserInput): Promise<string> {
  const token = await getAdminToken();
  const res = await fetch("/api/customers/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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
  const token = await getAdminToken();
  const res = await fetch("/api/customers/update", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      uid: customerId,
      name: data.name,
      email: data.email,
      phone: data.phone,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Müşteri güncellenemedi.");
  }
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const token = await getAdminToken();
  const res = await fetch("/api/customers/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ uid: customerId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Müşteri silinemedi.");
  }
}
