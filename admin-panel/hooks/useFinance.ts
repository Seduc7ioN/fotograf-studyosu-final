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
import { CreateIncomeRecordInput, IncomeRecord } from "@/lib/types";

const INCOME_COLLECTION = "income_records";

export function useIncomeRecords() {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, INCOME_COLLECTION), orderBy("paidAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setRecords(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IncomeRecord))
        );
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Income records could not be loaded:", err);
        setRecords([]);
        setError("Kazanç kayıtları yüklenemedi.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { records, loading, error };
}

export async function createIncomeRecord(input: CreateIncomeRecordInput) {
  await addDoc(collection(db, INCOME_COLLECTION), {
    title: input.title.trim(),
    amount: input.amount,
    customerName: input.customerName?.trim() || null,
    note: input.note?.trim() || null,
    paidAt: Timestamp.fromDate(input.paidAt),
    createdAt: serverTimestamp(),
  });
}

export async function deleteIncomeRecord(recordId: string) {
  await deleteDoc(doc(db, INCOME_COLLECTION, recordId));
}
