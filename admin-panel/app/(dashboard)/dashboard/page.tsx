"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Album } from "@/lib/types";
import { Users, FolderOpen, Image, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    customers: 0,
    albums: 0,
    photos: 0,
  });
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [customersSnap, albumsSnap, recentSnap] = await Promise.all([
        getCountFromServer(query(collection(db, "users"))),
        getCountFromServer(query(collection(db, "albums"))),
        getDocs(
          query(collection(db, "albums"), orderBy("createdAt", "desc"), limit(5))
        ),
      ]);

      setStats({
        customers: customersSnap.data().count,
        albums: albumsSnap.data().count,
        photos: 0, // Aggregate sayaç eklenebilir
      });

      setRecentAlbums(
        recentSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Album))
      );
      setLoading(false);
    }

    fetchStats();
  }, []);

  const statCards = [
    { label: "Toplam Müşteri", value: stats.customers, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Toplam Albüm", value: stats.albums, icon: FolderOpen, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Aktif Albümler", value: stats.albums, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Stüdyonuzun genel durumu</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{card.label}</span>
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {loading ? "—" : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Albums */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Son Albümler</h2>
          <Link href="/albums" className="text-amber-400 text-sm hover:text-amber-300">
            Tümünü gör →
          </Link>
        </div>
        <div className="divide-y divide-gray-800">
          {recentAlbums.length === 0 && !loading && (
            <p className="text-gray-500 text-sm p-5 text-center">
              Henüz albüm yok.
            </p>
          )}
          {recentAlbums.map((album) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <FolderOpen className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{album.title}</p>
                <p className="text-gray-500 text-xs">{album.photoCount ?? 0} fotoğraf</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                album.status === "ready"
                  ? "bg-green-400/10 text-green-400"
                  : album.status === "archived"
                  ? "bg-gray-700 text-gray-400"
                  : "bg-yellow-400/10 text-yellow-400"
              }`}>
                {album.status === "ready" ? "Hazır" : album.status === "archived" ? "Arşiv" : "Taslak"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
