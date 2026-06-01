"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
      <div /> {/* Breadcrumb buraya eklenebilir */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            aria-label="Bildirimler"
            aria-expanded={isNotificationsOpen}
            className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Bell size={20} />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-gray-800 bg-gray-900 shadow-xl">
              <div className="border-b border-gray-800 px-4 py-3">
                <p className="text-sm font-semibold text-white">Bildirimler</p>
                <p className="mt-0.5 text-xs text-gray-500">Yeni olaylar burada görünecek.</p>
              </div>
              <div className="px-4 py-6 text-center">
                <Bell className="mx-auto h-8 w-8 text-gray-600" />
                <p className="mt-3 text-sm font-medium text-gray-300">Henüz bildirim yok</p>
                <p className="mt-1 text-xs text-gray-500">
                  Müşteri yüklemeleri ve albüm durumları eklendiğinde burada listelenecek.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <span className="text-gray-300 text-sm">{user?.email}</span>
        </div>
      </div>
    </header>
  );
}
