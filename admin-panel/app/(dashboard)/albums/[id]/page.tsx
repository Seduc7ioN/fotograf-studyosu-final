"use client";

import { use, useState } from "react";
import { useAlbums, useAlbumPhotos, updateAlbum, publishAlbum } from "@/hooks/useAlbums";
import PhotoUploader from "@/components/features/PhotoUploader";
import Link from "next/link";
import {
  ArrowLeft, Upload, Settings, Eye, Download,
  ToggleLeft, ToggleRight, Send, Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: albumId } = use(params);
  const { albums } = useAlbums();
  const album = albums.find((a) => a.id === albumId);
  const { photos, loading } = useAlbumPhotos(albumId);
  const [showUploader, setShowUploader] = useState(false);

  if (!album) {
    return (
      <div className="text-gray-500 text-center py-12">
        Albüm bulunamadı.
      </div>
    );
  }

  const handleToggleDownload = async () => {
    try {
      await updateAlbum(albumId, { downloadEnabled: !album.downloadEnabled });
      toast.success(`İndirme ${!album.downloadEnabled ? "açıldı" : "kapatıldı"}`);
    } catch {
      toast.error("Güncelleme başarısız.");
    }
  };

  const handlePublish = async () => {
    try {
      await publishAlbum(albumId);
      toast.success("Albüm müşteriye açıldı! Bildirim gönderildi.");
    } catch {
      toast.error("Yayınlama başarısız.");
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteDoc(doc(db, "albums", albumId, "photos", photoId));
      toast.success("Fotoğraf silindi.");
    } catch {
      toast.error("Silme işlemi başarısız.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/albums"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{album.title}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                album.status === "ready"
                  ? "bg-green-400/10 text-green-400"
                  : "bg-yellow-400/10 text-yellow-400"
              }`}>
                {album.status === "ready" ? "Yayında" : "Taslak"}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              {photos.length} fotoğraf · {album.customerName ?? album.customerId}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Download toggle */}
          <button
            onClick={handleToggleDownload}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700
                       text-gray-300 rounded-lg text-sm transition-colors"
          >
            {album.downloadEnabled ? (
              <><ToggleRight size={16} className="text-green-400" /> İndirme Açık</>
            ) : (
              <><ToggleLeft size={16} /> İndirme Kapalı</>
            )}
          </button>

          {/* Upload */}
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700
                       text-gray-300 rounded-lg text-sm transition-colors"
          >
            <Upload size={16} />
            Fotoğraf Ekle
          </button>

          {/* Publish */}
          {album.status !== "ready" && (
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400
                         text-white font-medium rounded-lg text-sm transition-colors"
            >
              <Send size={16} />
              Yayınla
            </button>
          )}
        </div>
      </div>

      {/* Uploader */}
      {showUploader && (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h3 className="text-white font-medium mb-4">Fotoğraf Yükle</h3>
          <PhotoUploader
            albumId={albumId}
            onUploadComplete={() => setShowUploader(false)}
          />
        </div>
      )}

      {/* Photos Grid */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-white font-semibold mb-4">
          Fotoğraflar ({photos.length})
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center py-8">Yükleniyor...</p>
        ) : photos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Upload className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Henüz fotoğraf yok.</p>
            <button
              onClick={() => setShowUploader(true)}
              className="mt-3 text-amber-400 text-sm hover:text-amber-300"
            >
              Fotoğraf ekle →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square bg-gray-800 rounded-lg overflow-hidden"
              >
                {photo.thumbnailUrl ? (
                  <img
                    src={photo.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs">Yükleniyor</span>
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                                transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} className="text-white" />
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
