"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
      <div /> {/* Breadcrumb buraya eklenebilir */}
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
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
