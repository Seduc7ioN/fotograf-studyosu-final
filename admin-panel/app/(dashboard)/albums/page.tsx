"use client";

import { useAlbums } from "@/hooks/useAlbums";
import Link from "next/link";
import { FolderOpen, Plus, ChevronRight, Download, Upload } from "lucide-react";

export default function AlbumsPage() {
  const { albums, loading } = useAlbums();

  const statusLabel = (s: string) =>
    s === "ready" ? "Yayında" : s === "archived" ? "Arşiv" : "Taslak";
  const statusColor = (s: string) =>
    s === "ready"
      ? "bg-green-400/10 text-green-400"
      : s === "archived"
      ? "bg-gray-700 text-gray-400"
      : "bg-yellow-400/10 text-yellow-400";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Albümler</h1>
          <p className="text-gray-400 mt-1 text-sm">{albums.length} albüm</p>
        </div>
        <Link
          href="/albums/new"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400
                     text-black font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          Yeni Albüm
        </Link>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : albums.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Henüz albüm yok.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center
                                justify-center flex-shrink-0">
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {album.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-gray-500 text-xs">
                      {album.photoCount ?? 0} fotoğraf
                    </span>
                    {album.downloadEnabled && (
                      <Download size={12} className="text-amber-400" />
                    )}
                    {(album as any).customerUploadEnabled && (
                      <Upload size={12} className="text-blue-400" />
                    )}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                  ${statusColor(album.status)}`}>
                  {statusLabel(album.status)}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
