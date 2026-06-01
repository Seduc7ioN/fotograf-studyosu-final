"use client";

import { deleteCustomer, useCustomers } from "@/hooks/useCustomers";
import Link from "next/link";
import { Edit2, Loader2, Search, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CustomersPage() {
  const { customers, loading } = useCustomers();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (customerId: string, customerName: string) => {
    const confirmed = window.confirm(
      `${customerName} müşterisini silmek istiyor musunuz? Bu işlem geri alınamaz.`
    );
    if (!confirmed) return;

    setDeletingId(customerId);
    try {
      await deleteCustomer(customerId);
      toast.success("Müşteri silindi.");
    } catch (error: any) {
      toast.error(error.message || "Müşteri silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Müşteriler</h1>
          <p className="text-gray-400 mt-1">{customers.length} müşteri</p>
        </div>
        <Link
          href="/customers/new"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400
                     text-white font-medium rounded-lg transition-colors text-sm"
        >
          <UserPlus size={16} />
          Yeni Müşteri
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Ad veya e-posta ile ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg
                     text-white placeholder-gray-500 focus:outline-none focus:border-amber-500
                     focus:ring-1 focus:ring-amber-500 transition-colors"
        />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search ? "Sonuç bulunamadı." : "Henüz müşteri yok."}
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filtered.map((customer) => (
              <div
                key={customer.id}
                className="flex flex-col gap-3 p-4 hover:bg-gray-800/50 transition-colors sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 font-semibold text-sm">
                      {(customer.name?.[0] || "?").toUpperCase()}
                    </span>
                  </div>
                  <Link href={`/customers/${customer.id}`} className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{customer.name}</p>
                    <p className="text-gray-500 text-xs truncate">{customer.email}</p>
                  </Link>
                </div>
                {customer.phone && (
                  <span className="text-gray-500 text-xs hidden md:block">
                    {customer.phone}
                  </span>
                )}
                <div className="flex items-center gap-2 flex-shrink-0 sm:justify-end">
                  <Link
                    href={`/customers/${customer.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                               text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800
                               hover:text-white transition-colors"
                  >
                    <Edit2 size={13} />
                    Düzenle
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(customer.id, customer.name)}
                    disabled={deletingId === customer.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                               text-red-300 border border-red-900/60 rounded-lg hover:bg-red-950/40
                               disabled:opacity-60 transition-colors"
                  >
                    {deletingId === customer.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
