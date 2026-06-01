"use client";

import { useCustomers } from "@/hooks/useCustomers";
import Link from "next/link";
import { UserPlus, Search, User, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CustomersPage() {
  const { customers, loading } = useCustomers();
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Search */}
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

      {/* List */}
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
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-semibold text-sm">
                    {customer.name[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{customer.name}</p>
                  <p className="text-gray-500 text-xs truncate">{customer.email}</p>
                </div>
                {customer.phone && (
                  <span className="text-gray-500 text-xs hidden md:block">
                    {customer.phone}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
