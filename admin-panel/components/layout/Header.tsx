"use client";

import { useState } from "react";
import { AtSign, Bell, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { studioBrand } from "@/lib/brand";

export default function Header() {
  const { user } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#38271d] bg-[#17100b]/95 px-6 backdrop-blur">
      <div className="h-px w-24 bg-gradient-to-r from-[#E8611A] to-transparent opacity-70" />
      <div className="flex items-center gap-4">
        <a
          href={studioBrand.phoneHref}
          className="hidden items-center gap-2 rounded-lg border border-[#38271d] px-3 py-2 text-sm text-[#d8c7b8] transition hover:border-[#E8611A]/70 hover:text-[#ff8a45] md:flex"
        >
          <Phone size={16} />
          {studioBrand.phone}
        </a>
        <a
          href={studioBrand.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-2 rounded-lg border border-[#38271d] px-3 py-2 text-sm text-[#d8c7b8] transition hover:border-[#E8611A]/70 hover:text-[#ff8a45] lg:flex"
        >
          <AtSign size={16} />
          {studioBrand.instagramHandle}
        </a>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            aria-label="Bildirimler"
            aria-expanded={isNotificationsOpen}
            className="relative rounded-lg p-2 text-[#b9a99b] transition-colors hover:bg-[#281d16] hover:text-[#f7f0e8]"
          >
            <Bell size={20} />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-[#38271d] bg-[#17100b] shadow-xl">
              <div className="border-b border-[#38271d] px-4 py-3">
                <p className="text-sm font-semibold text-[#f7f0e8]">Bildirimler</p>
                <p className="mt-0.5 text-xs text-[#8d7462]">Yeni olaylar burada görünecek.</p>
              </div>
              <div className="px-4 py-6 text-center">
                <Bell className="mx-auto h-8 w-8 text-[#6f5848]" />
                <p className="mt-3 text-sm font-medium text-[#d8c7b8]">Henüz bildirim yok</p>
                <p className="mt-1 text-xs text-[#8d7462]">
                  Müşteri yüklemeleri ve albüm durumları eklendiğinde burada listelenecek.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8611A]">
            <span className="text-xs font-bold text-[#170f0a]">
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <span className="text-sm text-[#d8c7b8]">{user?.email}</span>
        </div>
      </div>
    </header>
  );
}
