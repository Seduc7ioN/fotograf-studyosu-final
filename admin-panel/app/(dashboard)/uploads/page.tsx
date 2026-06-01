"use client";

import { useCallback, useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface PendingUpload {
  id: string;
  albumId: string;
  customerId: string;
  fileName: string;
  status: "pending" | "approved" | "rejected";
  previewUrl: string | null;
  fileSize: number;
  createdAt: { _seconds: number };
}

export default function PendingUploadsPage() {
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    uploadId: string;
    reason: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fn = httpsCallable(functions, "getPendingUploads");
      const res = await fn({}) as any;
      setUploads(res.data || []);
    } catch (e: any) {
      toast.error("Yüklemeler alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const approve = async (uploadId: string) => {
    setProcessing(uploadId);
    try {
      const fn = httpsCallable(functions, "approveCustomerUpload");
      await fn({ uploadId });
      toast.success("✅ Fotoğraf onaylandı ve albüme eklendi.");
      setUploads((prev) => prev.filter((u) => u.id !== uploadId));
    } catch (e: any) {
      toast.error("Onaylama başarısız: " + e.message);
    } finally {
      setProcessing(null);
    }
  };

  const reject = async () => {
    if (!rejectModal) return;
    setProcessing(rejectModal.uploadId);
    try {
      const fn = httpsCallable(functions, "rejectCustomerUpload");
      await fn({ uploadId: rejectModal.uploadId, reason: rejectModal.reason });
      toast.success("Fotoğraf reddedildi.");
      setUploads((prev) => prev.filter((u) => u.id !== rejectModal.uploadId));
      setRejectModal(null);
    } catch (e: any) {
      toast.error("Reddetme başarısız.");
    } finally {
      setProcessing(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    return `${Math.round(bytes / 1_000)} KB`;
  };

  const formatDate = (ts: { _seconds: number }) => {
    if (!ts) return "—";
    return new Date(ts._seconds * 1000).toLocaleString("tr-TR");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Onay Bekleyen Yüklemeler</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Müşterilerin yüklediği fotoğrafları inceleyin
          </p>
        </div>
        <div className="flex items-center gap-2">
          {uploads.length > 0 && (
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm font-semibold">
              {uploads.length} bekliyor
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" size={20} /> Yükleniyor...
        </div>
      ) : uploads.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
          <p className="text-gray-400 font-medium">Onay bekleyen fotoğraf yok</p>
          <p className="text-gray-600 text-sm mt-1">
            Müşteriler fotoğraf yüklediğinde burada görünür.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              {/* Fotoğraf önizleme */}
              <div className="relative aspect-square bg-gray-800">
                {upload.previewUrl ? (
                  <Image
                    src={upload.previewUrl}
                    alt={upload.fileName}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Clock className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                {/* Bekliyor badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500/90 rounded-full text-xs font-bold text-black">
                  Onay Bekliyor
                </div>
              </div>

              {/* Bilgiler */}
              <div className="p-3">
                <p className="text-white text-xs font-medium truncate mb-0.5">
                  {upload.fileName}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 text-xs">
                    {formatSize(upload.fileSize)}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {formatDate(upload.createdAt)}
                  </span>
                </div>

                {/* Aksiyon butonları */}
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(upload.id)}
                    disabled={processing === upload.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2
                               bg-green-500/10 hover:bg-green-500/20 text-green-400
                               rounded-lg text-xs font-semibold transition-colors
                               disabled:opacity-50 border border-green-500/20"
                  >
                    {processing === upload.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle size={13} />
                    )}
                    Onayla
                  </button>
                  <button
                    onClick={() =>
                      setRejectModal({ uploadId: upload.id, reason: "" })
                    }
                    disabled={processing === upload.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2
                               bg-red-500/10 hover:bg-red-500/20 text-red-400
                               rounded-lg text-xs font-semibold transition-colors
                               disabled:opacity-50 border border-red-500/20"
                  >
                    <XCircle size={13} />
                    Reddet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reddetme Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">Fotoğrafı Reddet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Müşteriye bir neden belirtebilirsiniz (opsiyonel).
            </p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal((prev) =>
                  prev ? { ...prev, reason: e.target.value } : null
                )
              }
              placeholder="Örn: Görüntü kalitesi yetersiz, konu dışı..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                         text-white text-sm placeholder-gray-600 focus:outline-none
                         focus:border-amber-500 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2 border border-gray-700 text-gray-400
                           rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={reject}
                disabled={!!processing}
                className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400
                           border border-red-500/30 rounded-lg text-sm font-semibold
                           transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 size={14} className="animate-spin mx-auto" />
                ) : (
                  "Reddet"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
