"use client";

import { use } from "react";
import { useCustomer } from "@/hooks/useCustomers";
import { useAlbums } from "@/hooks/useAlbums";
import Link from "next/link";
import { ArrowLeft, FolderOpen, Plus } from "lucide-react";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { customer, loading } = useCustomer(id);
  const { albums } = useAlbums(id);

  if (loading) {
    return <div className="text-gray-500 text-center py-12">Yükleniyor...</div>;
  }
  if (!customer) {
    return <div className="text-gray-500 text-center py-12">Müşteri bulunamadı.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customers"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
          <p className="text-gray-400 text-sm">{customer.email}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Albümleri ({albums.length})</h2>
        <Link href={`/albums/new?customerId=${id}`}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400
                     text-black text-xs font-semibold rounded-lg transition-colors">
          <Plus size={14} /> Yeni Albüm
        </Link>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {albums.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Henüz albüm yok.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {albums.map((album) => (
              <Link key={album.id} href={`/albums/${album.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors">
                <FolderOpen className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{album.title}</p>
                  <p className="text-gray-500 text-xs">{album.photoCount ?? 0} fotoğraf</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
