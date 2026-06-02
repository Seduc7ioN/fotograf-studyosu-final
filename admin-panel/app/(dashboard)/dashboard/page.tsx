"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CalendarDays,
  FolderOpen,
  Loader2,
  Plus,
  Trash2,
  TrendingUp,
  TurkishLira,
  Users,
} from "lucide-react";
import { createIncomeRecord, deleteIncomeRecord, useIncomeRecords } from "@/hooks/useFinance";
import { db } from "@/lib/firebase";
import { Album, User } from "@/lib/types";

type PeriodKey = "day" | "week" | "month";

const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

function toDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = date.getDay() || 7;
  const start = startOfDay(date);
  start.setDate(start.getDate() - day + 1);
  return start;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function localDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function countSince(items: User[], start: Date) {
  return items.filter((item) => {
    const createdAt = toDate(item.createdAt);
    return createdAt ? createdAt >= start : false;
  }).length;
}

export default function DashboardPage() {
  const { records, loading: incomeLoading, error: incomeError } = useIncomeRecords();
  const [customers, setCustomers] = useState<User[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIncome, setSavingIncome] = useState(false);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [incomeForm, setIncomeForm] = useState({
    title: "",
    amount: "",
    customerName: "",
    paidAt: localDateInputValue(),
    note: "",
  });

  useEffect(() => {
    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const albumsQuery = query(collection(db, "albums"), orderBy("createdAt", "desc"));
    const recentAlbumsQuery = query(
      collection(db, "albums"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribers = [
      onSnapshot(
        usersQuery,
        (snapshot) => {
          setCustomers(
            snapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() } as User))
              .filter((user) => user.role === "customer")
          );
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error("Dashboard customers could not be loaded:", err);
          setError("Müşteri verileri yüklenemedi. Firestore kuralları ve admin yetkisini kontrol edin.");
          setLoading(false);
        }
      ),
      onSnapshot(
        albumsQuery,
        (snapshot) => {
          setAlbums(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Album)));
        },
        (err) => {
          console.error("Dashboard albums could not be loaded:", err);
          setError("Albüm verileri yüklenemedi. Firestore kuralları ve admin yetkisini kontrol edin.");
        }
      ),
      onSnapshot(
        recentAlbumsQuery,
        (snapshot) => {
          setRecentAlbums(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Album))
          );
        },
        (err) => {
          console.error("Recent albums could not be loaded:", err);
        }
      ),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const report = useMemo(() => {
    const now = new Date();
    const starts: Record<PeriodKey, Date> = {
      day: startOfDay(now),
      week: startOfWeek(now),
      month: startOfMonth(now),
    };

    const revenue = {
      total: records.reduce((sum, record) => sum + Number(record.amount || 0), 0),
      day: 0,
      week: 0,
      month: 0,
    };

    for (const record of records) {
      const paidAt = toDate(record.paidAt);
      if (!paidAt) continue;
      if (paidAt >= starts.day) revenue.day += Number(record.amount || 0);
      if (paidAt >= starts.week) revenue.week += Number(record.amount || 0);
      if (paidAt >= starts.month) revenue.month += Number(record.amount || 0);
    }

    return {
      customerDay: countSince(customers, starts.day),
      customerWeek: countSince(customers, starts.week),
      customerMonth: countSince(customers, starts.month),
      revenue,
    };
  }, [customers, records]);

  const handleIncomeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(incomeForm.amount);

    if (!incomeForm.title.trim()) {
      toast.error("Gelir açıklaması gerekli.");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Geçerli bir kazanç tutarı girin.");
      return;
    }

    setSavingIncome(true);
    try {
      await createIncomeRecord({
        title: incomeForm.title,
        amount,
        customerName: incomeForm.customerName,
        paidAt: new Date(`${incomeForm.paidAt}T12:00:00`),
        note: incomeForm.note,
      });
      setIncomeForm({
        title: "",
        amount: "",
        customerName: "",
        paidAt: localDateInputValue(),
        note: "",
      });
      toast.success("Kazanç kaydı eklendi.");
    } catch (err) {
      console.error("Income could not be saved:", err);
      toast.error("Kazanç kaydı eklenemedi.");
    } finally {
      setSavingIncome(false);
    }
  };

  const handleDeleteIncome = async (recordId: string) => {
    const confirmed = window.confirm("Bu kazanç kaydını silmek istiyor musunuz?");
    if (!confirmed) return;

    setDeletingIncomeId(recordId);
    try {
      await deleteIncomeRecord(recordId);
      toast.success("Kazanç kaydı silindi.");
    } catch (err) {
      console.error("Income could not be deleted:", err);
      toast.error("Kazanç kaydı silinemedi.");
    } finally {
      setDeletingIncomeId(null);
    }
  };

  const statCards = [
    {
      label: "Toplam Müşteri",
      value: customers.length,
      helper: `Bugün ${report.customerDay} / Bu hafta ${report.customerWeek} / Bu ay ${report.customerMonth}`,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Toplam Albüm",
      value: albums.length,
      helper: `${albums.filter((album) => album.status === "ready").length} hazır albüm`,
      icon: FolderOpen,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Bu Ay Kazanç",
      value: money.format(report.revenue.month),
      helper: `Toplam ${money.format(report.revenue.total)}`,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  const periodCards = [
    { label: "Bugünkü Müşteri", value: report.customerDay, icon: CalendarDays },
    { label: "Haftalık Müşteri", value: report.customerWeek, icon: CalendarDays },
    { label: "Aylık Müşteri", value: report.customerMonth, icon: CalendarDays },
    { label: "Bugünkü Kazanç", value: money.format(report.revenue.day), icon: TurkishLira },
    { label: "Haftalık Kazanç", value: money.format(report.revenue.week), icon: TurkishLira },
    { label: "Aylık Kazanç", value: money.format(report.revenue.month), icon: TurkishLira },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Müşteri, albüm ve kazanç takibi</p>
      </div>

      {(error || incomeError) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold">Veriler yüklenemedi</p>
            <p className="mt-1 text-sm text-amber-100/80">{error || incomeError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">{card.label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{loading ? "—" : card.value}</p>
            <p className="mt-2 text-xs text-gray-500">{card.helper}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 px-5 py-4">
          <h2 className="font-semibold text-white">Dönem Özeti</h2>
          <p className="mt-1 text-xs text-gray-500">Günlük, haftalık ve aylık müşteri/kazanç görünümü.</p>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-3">
          {periodCards.map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-800 bg-gray-950/50 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <item.icon className="h-4 w-4 text-amber-400" />
                {item.label}
              </div>
              <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-xl border border-gray-800 bg-gray-900">
          <div className="border-b border-gray-800 px-5 py-4">
            <h2 className="font-semibold text-white">Kazanç Kaydı Ekle</h2>
            <p className="mt-1 text-xs text-gray-500">Ödeme aldığınız işleri buradan kaydedin.</p>
          </div>
          <form onSubmit={handleIncomeSubmit} className="space-y-4 p-5">
            <Field label="Açıklama">
              <input
                value={incomeForm.title}
                onChange={(e) => setIncomeForm((form) => ({ ...form, title: e.target.value }))}
                placeholder="Düğün çekimi, albüm baskı, kapora..."
                className={inputClass}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tutar">
                <input
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm((form) => ({ ...form, amount: e.target.value }))}
                  type="number"
                  min={1}
                  step={1}
                  placeholder="15000"
                  className={inputClass}
                />
              </Field>
              <Field label="Tarih">
                <input
                  value={incomeForm.paidAt}
                  onChange={(e) => setIncomeForm((form) => ({ ...form, paidAt: e.target.value }))}
                  type="date"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Müşteri adı">
              <input
                value={incomeForm.customerName}
                onChange={(e) => setIncomeForm((form) => ({ ...form, customerName: e.target.value }))}
                placeholder="Ayşe Yılmaz"
                className={inputClass}
              />
            </Field>
            <Field label="Not">
              <textarea
                value={incomeForm.note}
                onChange={(e) => setIncomeForm((form) => ({ ...form, note: e.target.value }))}
                rows={3}
                placeholder="İsteğe bağlı not"
                className={`${inputClass} resize-none`}
              />
            </Field>
            <button
              type="submit"
              disabled={savingIncome}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-400 disabled:opacity-60"
            >
              {savingIncome ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Kazanç Kaydı Ekle
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900">
          <div className="border-b border-gray-800 px-5 py-4">
            <h2 className="font-semibold text-white">Son Kazançlar</h2>
            <p className="mt-1 text-xs text-gray-500">En yeni ödeme kayıtları.</p>
          </div>
          <div className="divide-y divide-gray-800">
            {incomeLoading ? (
              <div className="p-8 text-center text-gray-500">Kazanç kayıtları yükleniyor...</div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Henüz kazanç kaydı yok.</div>
            ) : (
              records.slice(0, 8).map((record) => {
                const paidAt = toDate(record.paidAt);
                return (
                  <div key={record.id} className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-400/10">
                      <TurkishLira className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{record.title}</p>
                      <p className="text-xs text-gray-500">
                        {record.customerName || "Müşteri belirtilmedi"}
                        {paidAt ? ` · ${paidAt.toLocaleDateString("tr-TR")}` : ""}
                      </p>
                    </div>
                    <p className="font-semibold text-green-400">{money.format(record.amount || 0)}</p>
                    <button
                      type="button"
                      onClick={() => handleDeleteIncome(record.id)}
                      disabled={deletingIncomeId === record.id}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-950/40 hover:text-red-300 disabled:opacity-60"
                      aria-label="Kazanç kaydını sil"
                    >
                      {deletingIncomeId === record.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-800 p-5">
          <h2 className="font-semibold text-white">Son Albümler</h2>
          <Link href="/albums" className="text-sm text-amber-400 hover:text-amber-300">
            Tümünü gör →
          </Link>
        </div>
        <div className="divide-y divide-gray-800">
          {recentAlbums.length === 0 && !loading && (
            <p className="p-5 text-center text-sm text-gray-500">Henüz albüm yok.</p>
          )}
          {recentAlbums.map((album) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-800/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-800">
                <FolderOpen className="h-5 w-5 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{album.title}</p>
                <p className="text-xs text-gray-500">{album.photoCount ?? 0} fotoğraf</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  album.status === "ready"
                    ? "bg-green-400/10 text-green-400"
                    : album.status === "archived"
                    ? "bg-gray-700 text-gray-400"
                    : "bg-yellow-400/10 text-yellow-400"
                }`}
              >
                {album.status === "ready" ? "Hazır" : album.status === "archived" ? "Arşiv" : "Taslak"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      {children}
    </label>
  );
}
