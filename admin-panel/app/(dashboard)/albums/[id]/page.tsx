"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Send,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Upload,
} from "lucide-react";
import PhotoUploader from "@/components/features/PhotoUploader";
import { publishAlbum, updateAlbum, useAlbumPhotos, useAlbums } from "@/hooks/useAlbums";
import { useAlbumComments } from "@/hooks/useComments";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import {
  albumStatusMeta,
  albumStatusOptions,
  photoSelectionLabel,
  photoSelectionTone,
} from "@/lib/album-workflow";
import { AlbumStatus, Photo } from "@/lib/types";

type PhotoFilter = "all" | NonNullable<Photo["selectionStatus"]>;

export default function AlbumDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: albumId } = params;
  const { albums } = useAlbums();
  const album = albums.find((a) => a.id === albumId);
  const { photos, loading } = useAlbumPhotos(albumId);
  const { comments, loading: commentsLoading, error: commentsError } =
    useAlbumComments(albumId);
  const [showUploader, setShowUploader] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>("all");

  const commentsByPhoto = useMemo(() => {
    const map = new Map<string, typeof comments>();
    for (const comment of comments) {
      if (!comment.photoId) continue;
      const list = map.get(comment.photoId) ?? [];
      list.push(comment);
      map.set(comment.photoId, list);
    }
    return map;
  }, [comments]);

  const photosById = useMemo(
    () => new Map(photos.map((photo) => [photo.id, photo])),
    [photos]
  );

  const selectionSummary = useMemo(() => {
    return photos.reduce(
      (summary, photo) => {
        const status = photo.selectionStatus ?? "none";
        summary[status] = (summary[status] ?? 0) + 1;
        return summary;
      },
      {
        none: 0,
        selected: 0,
        retouch: 0,
        approved: 0,
        rejected: 0,
      } as Record<NonNullable<Photo["selectionStatus"]>, number>
    );
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (photoFilter === "all") return photos;
    return photos.filter((photo) => (photo.selectionStatus ?? "none") === photoFilter);
  }, [photoFilter, photos]);

  if (!album) {
    return <div className="py-12 text-center text-[#8d7462]">Albüm bulunamadı.</div>;
  }

  const statusMeta = albumStatusMeta(album.status);

  const handleToggleDownload = async () => {
    try {
      await updateAlbum(albumId, { downloadEnabled: !album.downloadEnabled });
      toast.success(`İndirme ${!album.downloadEnabled ? "açıldı" : "kapatıldı"}.`);
    } catch {
      toast.error("Güncelleme başarısız.");
    }
  };

  const handlePublish = async () => {
    try {
      await publishAlbum(albumId);
      toast.success("Albüm müşteriye açıldı.");
    } catch {
      toast.error("Yayınlama başarısız.");
    }
  };

  const handleStatusChange = async (status: AlbumStatus) => {
    try {
      await updateAlbum(albumId, { status });
      toast.success("Albüm durumu güncellendi.");
    } catch {
      toast.error("Durum güncellenemedi.");
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
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div className="flex items-start gap-3">
          <Link
            href="/albums"
            className="rounded-lg p-2 text-[#b9a99b] transition hover:bg-[#281d16] hover:text-[#f7f0e8]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold text-[#f7f0e8]">
                {album.title}
              </h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusMeta.tone}`}
              >
                {statusMeta.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#8d7462]">
              {photos.length} fotoğraf · {comments.length} müşteri notu ·{" "}
              {album.customerName ?? album.customerId}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={album.status}
            onChange={(event) => handleStatusChange(event.target.value as AlbumStatus)}
            className="rounded-lg border border-[#433126] bg-[#1f1813] px-3 py-2 text-sm text-[#d8c7b8] outline-none transition hover:border-[#E8611A]/70 focus:border-[#E8611A]"
            aria-label="Albüm durumu"
          >
            {albumStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleToggleDownload}
            className="flex items-center gap-2 rounded-lg border border-[#433126] bg-[#1f1813] px-3 py-2 text-sm text-[#d8c7b8] transition hover:border-[#E8611A]/70 hover:text-[#ff8a45]"
          >
            {album.downloadEnabled ? (
              <>
                <ToggleRight size={16} className="text-green-300" />
                İndirme Açık
              </>
            ) : (
              <>
                <ToggleLeft size={16} />
                İndirme Kapalı
              </>
            )}
          </button>
          <button
            onClick={() => setShowUploader((open) => !open)}
            className="flex items-center gap-2 rounded-lg border border-[#433126] bg-[#1f1813] px-3 py-2 text-sm text-[#d8c7b8] transition hover:border-[#E8611A]/70 hover:text-[#ff8a45]"
          >
            <Upload size={16} />
            Fotoğraf Ekle
          </button>
          {!["ready", "in_selection", "retouching", "ready_to_deliver", "delivered"].includes(album.status) && (
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 rounded-lg bg-[#E8611A] px-4 py-2 text-sm font-bold text-[#170f0a] transition hover:bg-[#ff7a32]"
            >
              <Send size={16} />
              Yayınla
            </button>
          )}
        </div>
      </div>

      {showUploader && (
        <div className="rounded-xl border border-[#433126] bg-[#1f1813] p-5">
          <h3 className="mb-4 font-semibold text-[#f7f0e8]">Fotoğraf Yükle</h3>
          <PhotoUploader albumId={albumId} onUploadComplete={() => setShowUploader(false)} />
        </div>
      )}

      <section className="rounded-xl border border-[#433126] bg-[#1f1813] p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-semibold text-[#f7f0e8]">
              Fotoğraflar ({filteredPhotos.length}/{photos.length})
            </h2>
            <p className="mt-1 text-xs text-[#8d7462]">
              Seçildi {selectionSummary.selected} · Rötuş {selectionSummary.retouch} · Beğenmedi {selectionSummary.rejected}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "Tümü"],
              ["selected", "Seçilen"],
              ["retouch", "Rötuş"],
              ["rejected", "Beğenmedi"],
              ["none", "Bekleyen"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPhotoFilter(value as PhotoFilter)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  photoFilter === value
                    ? "border-[#E8611A] bg-[#E8611A]/15 text-[#ff8a45]"
                    : "border-[#433126] text-[#b9a99b] hover:border-[#E8611A]/70 hover:text-[#ff8a45]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-[#8d7462]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Yükleniyor...
          </div>
        ) : photos.length === 0 ? (
          <div className="py-12 text-center text-[#8d7462]">
            <Upload className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p>Henüz fotoğraf yok.</p>
            <button
              onClick={() => setShowUploader(true)}
              className="mt-3 text-sm font-semibold text-[#ff8a45] hover:text-[#ffb17c]"
            >
              Fotoğraf ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {filteredPhotos.map((photo) => {
              const photoComments = commentsByPhoto.get(photo.id) ?? [];
              return (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-[#100a07]"
                >
                  {photo.thumbnailUrl ? (
                    <img
                      src={photo.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-xs text-[#8d7462]">Yükleniyor</span>
                    </div>
                  )}

                  {photoComments.length > 0 && (
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#E8611A] px-2 py-1 text-[11px] font-bold text-[#170f0a]">
                      <MessageSquare size={12} />
                      {photoComments.length}
                    </div>
                  )}

                  {photo.selectionStatus && photo.selectionStatus !== "none" && (
                    <div
                      className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-[11px] font-bold ${photoSelectionTone(photo.selectionStatus)}`}
                    >
                      {photoSelectionLabel(photo.selectionStatus)}
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="rounded-lg bg-red-500/80 p-2 transition hover:bg-red-500"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[#433126] bg-[#1f1813]">
        <div className="flex items-center justify-between border-b border-[#433126] px-5 py-4">
          <div>
            <h2 className="font-semibold text-[#f7f0e8]">Müşteri Fotoğraf Notları</h2>
            <p className="mt-1 text-xs text-[#8d7462]">
              Müşterinin mobil uygulamada fotoğrafa yazdığı Photoshop ve rötuş notları.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#E8611A]/15 px-3 py-1 text-sm font-semibold text-[#ff8a45]">
            <MessageSquare size={15} />
            {comments.length}
          </div>
        </div>

        {commentsLoading ? (
          <p className="py-8 text-center text-[#8d7462]">Yorumlar yükleniyor...</p>
        ) : commentsError ? (
          <p className="py-8 text-center text-red-300">{commentsError}</p>
        ) : comments.length === 0 ? (
          <p className="py-8 text-center text-[#8d7462]">
            Henüz müşteri fotoğraf notu yok.
          </p>
        ) : (
          <div className="divide-y divide-[#433126]">
            {comments.map((comment) => {
              const photo = comment.photoId ? photosById.get(comment.photoId) : null;
              return (
                <div key={comment.id} className="flex gap-4 px-5 py-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[#433126] bg-[#100a07]">
                    {photo?.thumbnailUrl ? (
                      <img
                        src={photo.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#8d7462]">
                        <MessageSquare size={20} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#f7f0e8]">
                        {comment.customerName}
                      </p>
                      {comment.createdAt?.toDate && (
                        <span className="text-xs text-[#8d7462]">
                          {comment.createdAt.toDate().toLocaleString("tr-TR")}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#d8c7b8]">
                      {comment.text}
                    </p>
                    {comment.photoId && (
                      <p className="mt-2 text-xs text-[#8d7462]">
                        Fotoğraf ID: {comment.photoId}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
