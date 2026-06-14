"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileAudio,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Music2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createSiteMusicTrack,
  deleteSiteMusicTrack,
  updateSiteMusicTrack,
  useSiteMusic,
} from "@/hooks/useSiteMusic";
import {
  createShowcaseItem,
  deleteShowcaseItem,
  updateShowcaseItem,
  useSiteShowcase,
} from "@/hooks/useSiteShowcase";
import { SiteMusicTrack, SiteShowcaseItem } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-[#4a3529] bg-[#211813] px-3 py-2.5 text-sm text-[#f7f0e8] outline-none transition focus:border-[#E8611A]";

export default function ShowcasePage() {
  const { items, loading, error } = useSiteShowcase();
  const {
    tracks,
    loading: musicLoading,
    error: musicError,
  } = useSiteMusic();
  const [uploading, setUploading] = useState(false);
  const [musicUploading, setMusicUploading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [musicSavingId, setMusicSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, SiteShowcaseItem>>({});
  const [musicDrafts, setMusicDrafts] = useState<Record<string, SiteMusicTrack>>({});

  const onDrop = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setUploading(true);
      try {
        for (let index = 0; index < files.length; index += 1) {
          await createShowcaseItem(files[index], items.length + index + 1);
        }
        toast.success(`${files.length} vitrin görseli eklendi.`);
      } catch (err: any) {
        toast.error(err.message || "Görsel yüklenemedi.");
      } finally {
        setUploading(false);
      }
    },
    [items.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 20 * 1024 * 1024,
    disabled: uploading,
  });

  const onMusicDrop = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setMusicUploading(true);
    try {
      await createSiteMusicTrack(files[0]);
      toast.success("Site müziği eklendi ve aktif edildi.");
    } catch (err: any) {
      toast.error(err.message || "Müzik yüklenemedi.");
    } finally {
      setMusicUploading(false);
    }
  }, []);

  const {
    getRootProps: getMusicRootProps,
    getInputProps: getMusicInputProps,
    isDragActive: isMusicDragActive,
  } = useDropzone({
    onDrop: onMusicDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
    },
    maxFiles: 1,
    maxSize: 30 * 1024 * 1024,
    disabled: musicUploading,
  });

  const draftFor = (item: SiteShowcaseItem) => drafts[item.id] ?? item;
  const musicDraftFor = (track: SiteMusicTrack) =>
    musicDrafts[track.id] ?? track;

  const patchDraft = (item: SiteShowcaseItem, patch: Partial<SiteShowcaseItem>) => {
    setDrafts((current) => ({
      ...current,
      [item.id]: { ...(current[item.id] ?? item), ...patch },
    }));
  };

  const saveItem = async (item: SiteShowcaseItem) => {
    const draft = draftFor(item);
    setSavingId(item.id);
    try {
      await updateShowcaseItem(item.id, {
        title: draft.title.trim() || "Yeni Hikaye",
        caption: draft.caption.trim(),
        order: Number(draft.order) || 1,
        published: draft.published,
      });
      setDrafts((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      toast.success("Vitrin kaydı güncellendi.");
    } catch (err: any) {
      toast.error(err.message || "Vitrin kaydı güncellenemedi.");
    } finally {
      setSavingId(null);
    }
  };

  const patchMusicDraft = (
    track: SiteMusicTrack,
    patch: Partial<SiteMusicTrack>
  ) => {
    setMusicDrafts((current) => ({
      ...current,
      [track.id]: { ...(current[track.id] ?? track), ...patch },
    }));
  };

  const saveMusicTrack = async (track: SiteMusicTrack) => {
    const draft = musicDraftFor(track);
    setMusicSavingId(track.id);
    try {
      await updateSiteMusicTrack(track.id, {
        title: draft.title.trim() || "Site Müziği",
        active: draft.active,
      });
      setMusicDrafts((current) => {
        const next = { ...current };
        delete next[track.id];
        return next;
      });
      toast.success("Site müziği güncellendi.");
    } catch (err: any) {
      toast.error(err.message || "Site müziği güncellenemedi.");
    } finally {
      setMusicSavingId(null);
    }
  };

  const removeItem = async (item: SiteShowcaseItem) => {
    if (!window.confirm(`"${item.title}" vitrin görseli silinsin mi?`)) return;
    try {
      await deleteShowcaseItem(item);
      toast.success("Vitrin görseli silindi.");
    } catch (err: any) {
      toast.error(err.message || "Vitrin görseli silinemedi.");
    }
  };

  const removeMusicTrack = async (track: SiteMusicTrack) => {
    if (!window.confirm(`"${track.title}" site müziği silinsin mi?`)) return;
    try {
      await deleteSiteMusicTrack(track);
      toast.success("Site müziği silindi.");
    } catch (err: any) {
      toast.error(err.message || "Site müziği silinemedi.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[#f7f0e8]">
            Site Vitrini
          </h1>
          <p className="mt-1 text-sm text-[#9f8978]">
            Ana sayfadaki kayan hikaye görsellerini ve sıralarını yönetin.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg border border-[#4a3529] px-4 py-2.5 text-sm font-semibold text-[#d8c7b8] transition hover:border-[#E8611A] hover:text-[#ff8a45]"
        >
          <Eye size={16} />
          Siteyi Gör
        </a>
      </div>

      <section className="rounded-2xl border border-[#39281e] bg-[#17100b] p-5 md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl font-semibold text-[#f7f0e8]">
              Site Müziği
            </h2>
            <p className="mt-1 text-sm text-[#9f8978]">
              Girişteki “Tanıtımı Sesli İzle” akışında çalacak müziği yönetin.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#4a3529] px-3 py-1.5 text-xs text-[#b9a99b]">
            <Music2 size={14} />
            Tek aktif parça kullanılır
          </span>
        </div>

        <div
          {...getMusicRootProps()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition ${
            isMusicDragActive
              ? "border-[#E8611A] bg-[#E8611A]/10"
              : "border-[#4a3529] bg-[#100a07] hover:border-[#E8611A]/70"
          }`}
        >
          <input {...getMusicInputProps()} />
          {musicUploading ? (
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#E8611A]" />
          ) : (
            <FileAudio className="mx-auto h-9 w-9 text-[#E8611A]" />
          )}
          <p className="mt-4 font-semibold text-[#f7f0e8]">
            {musicUploading
              ? "Müzik yükleniyor..."
              : "Site müziği yüklemek için tıklayın veya sürükleyin"}
          </p>
          <p className="mt-1 text-xs text-[#8d7462]">
            MP3, WAV, M4A, AAC veya OGG · Maksimum 30 MB
          </p>
        </div>

        {musicError && (
          <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-200">
            {musicError}
          </div>
        )}

        <div className="mt-5 space-y-4">
          {musicLoading ? (
            <div className="rounded-xl border border-[#39281e] bg-[#100a07] p-6 text-center text-[#8d7462]">
              <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
              Müzikler yükleniyor...
            </div>
          ) : tracks.length === 0 ? (
            <div className="rounded-xl border border-[#39281e] bg-[#100a07] p-6 text-center">
              <FileAudio className="mx-auto h-8 w-8 text-[#6f5848]" />
              <p className="mt-3 font-semibold text-[#d8c7b8]">
                Henüz site müziği yok
              </p>
              <p className="mt-1 text-sm text-[#8d7462]">
                İlk parçayı yukarıdaki alandan yükleyin.
              </p>
            </div>
          ) : (
            tracks.map((track) => {
              const draft = musicDraftFor(track);
              return (
                <article
                  key={track.id}
                  className="rounded-2xl border border-[#39281e] bg-[#100a07] p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div className="space-y-4">
                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8d7462]">
                          Müzik başlığı
                        </span>
                        <input
                          value={draft.title}
                          onChange={(event) =>
                            patchMusicDraft(track, { title: event.target.value })
                          }
                          className={inputClass}
                        />
                      </label>
                      <audio
                        controls
                        src={track.audioUrl}
                        className="w-full"
                        preload="metadata"
                      />
                      <p className="text-xs text-[#6f5848]">
                        {track.fileName} · {(track.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          patchMusicDraft(track, { active: !draft.active })
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-[#4a3529] px-3 py-2 text-sm text-[#d8c7b8] transition hover:border-[#E8611A]"
                      >
                        {draft.active ? <Eye size={16} /> : <EyeOff size={16} />}
                        {draft.active ? "Aktif" : "Pasif"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMusicTrack(track)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-900/70 px-3 py-2 text-sm text-red-300 transition hover:bg-red-950/40"
                      >
                        <Trash2 size={16} />
                        Sil
                      </button>
                      <button
                        type="button"
                        onClick={() => saveMusicTrack(track)}
                        disabled={musicSavingId === track.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#E8611A] px-4 py-2 text-sm font-bold text-[#170f0a] transition hover:bg-[#ff7a32] disabled:opacity-60"
                      >
                        {musicSavingId === track.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Kaydet
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-[#E8611A] bg-[#E8611A]/10"
            : "border-[#4a3529] bg-[#17100b] hover:border-[#E8611A]/70"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#E8611A]" />
        ) : (
          <ImagePlus className="mx-auto h-10 w-10 text-[#E8611A]" />
        )}
        <p className="mt-4 font-semibold text-[#f7f0e8]">
          {uploading
            ? "Görseller yükleniyor..."
            : "Vitrine görsel yüklemek için tıklayın veya sürükleyin"}
        </p>
        <p className="mt-1 text-xs text-[#8d7462]">
          JPG, PNG veya WEBP · Görsel başına maksimum 20 MB
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#39281e] bg-[#17100b] p-10 text-center text-[#8d7462]">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
          Vitrin yükleniyor...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-[#39281e] bg-[#17100b] p-10 text-center">
          <Upload className="mx-auto h-9 w-9 text-[#6f5848]" />
          <p className="mt-3 font-semibold text-[#d8c7b8]">
            Henüz vitrin görseli yok
          </p>
          <p className="mt-1 text-sm text-[#8d7462]">
            İlk görseli yukarıdaki alandan yükleyin.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {items.map((item) => {
            const draft = draftFor(item);
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#39281e] bg-[#17100b]"
              >
                <div className="relative aspect-[16/10] bg-[#100a07]">
                  <Image
                    src={item.imageUrl}
                    alt={draft.title}
                    fill
                    sizes="(max-width: 1280px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <span
                    className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
                      draft.published
                        ? "bg-green-500/90 text-[#071008]"
                        : "bg-black/70 text-[#d8c7b8]"
                    }`}
                  >
                    {draft.published ? "Yayında" : "Gizli"}
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_100px]">
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8d7462]">
                        Başlık
                      </span>
                      <input
                        value={draft.title}
                        onChange={(event) =>
                          patchDraft(item, { title: event.target.value })
                        }
                        className={inputClass}
                      />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8d7462]">
                        Sıra
                      </span>
                      <input
                        value={draft.order}
                        onChange={(event) =>
                          patchDraft(item, { order: Number(event.target.value) })
                        }
                        type="number"
                        min={1}
                        className={inputClass}
                      />
                    </label>
                  </div>
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8d7462]">
                      Kısa açıklama
                    </span>
                    <input
                      value={draft.caption}
                      onChange={(event) =>
                        patchDraft(item, { caption: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#39281e] pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        patchDraft(item, { published: !draft.published })
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-[#4a3529] px-3 py-2 text-sm text-[#d8c7b8] transition hover:border-[#E8611A]"
                    >
                      {draft.published ? <Eye size={16} /> : <EyeOff size={16} />}
                      {draft.published ? "Yayında" : "Gizli"}
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-900/70 px-3 py-2 text-sm text-red-300 transition hover:bg-red-950/40"
                      >
                        <Trash2 size={16} />
                        Sil
                      </button>
                      <button
                        type="button"
                        onClick={() => saveItem(item)}
                        disabled={savingId === item.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#E8611A] px-4 py-2 text-sm font-bold text-[#170f0a] transition hover:bg-[#ff7a32] disabled:opacity-60"
                      >
                        {savingId === item.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
