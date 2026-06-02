"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  Upload,
  Users,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { studioBrand } from "@/lib/brand";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/agenda", icon: CalendarDays, label: "Ajanda" },
  { href: "/customers", icon: Users, label: "Müşteriler" },
  { href: "/albums", icon: FolderOpen, label: "Albümler" },
  { href: "/uploads", icon: Upload, label: "Yüklemeler" },
  { href: "/settings", icon: Settings, label: "Ayarlar" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-[#38271d] bg-[#17100b]">
      <div className="border-b border-[#38271d] p-6">
        <Image
          src="/lumeart-mark.svg"
          alt={studioBrand.name}
          width={210}
          height={128}
          className="h-auto w-full"
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
  );
}
