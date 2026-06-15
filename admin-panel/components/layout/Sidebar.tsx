"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PanelsTopLeft,
  Settings,
  Upload,
  Users,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { studioBrand } from "@/lib/brand";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/agenda", icon: CalendarDays, label: "Ajanda" },
  { href: "/requests", icon: ClipboardList, label: "Talepler" },
  { href: "/customers", icon: Users, label: "Müşteriler" },
  { href: "/albums", icon: FolderOpen, label: "Albümler" },
  { href: "/notes", icon: MessageSquare, label: "Notlar" },
  { href: "/uploads", icon: Upload, label: "Yüklemeler" },
  { href: "/showcase", icon: PanelsTopLeft, label: "Site Vitrini" },
  { href: "/settings", icon: Settings, label: "Ayarlar" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    onClose();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Menüyü kapat"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(19rem,86vw)] flex-col border-r border-[#38271d] bg-[#17100b] shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="relative border-b border-[#38271d] p-5 lg:p-6">
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg border border-[#38271d] p-2 text-[#b9a99b] transition hover:border-[#E8611A] hover:text-[#ff8a45] lg:hidden"
        >
          <X size={18} />
        </button>
        <Image
          src="/lumeart-mark.svg"
          alt={studioBrand.name}
          width={210}
          height={128}
          className="h-24 w-auto lg:h-auto lg:w-full"
        />
        <p className="mt-3 font-display text-lg font-semibold text-[#f7f0e8]">
          {studioBrand.adminTitle}
        </p>
        <p className="text-xs text-[#8d7462]">{studioBrand.panelSubtitle}</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#E8611A]/15 text-[#ff8a45]"
                  : "text-[#b9a99b] hover:bg-[#281d16] hover:text-[#f7f0e8]"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#38271d] p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#b9a99b] transition-colors hover:bg-[#281d16] hover:text-red-300"
        >
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>
      </aside>
    </>
  );
}
