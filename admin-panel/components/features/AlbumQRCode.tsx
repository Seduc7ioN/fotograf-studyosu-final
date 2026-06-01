"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { QrCode, Copy, ExternalLink, Loader2, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface AlbumQRCodeProps {
  albumId: string;
  existingToken?: string;
}

// QR kod SVG'sini basit algoritmayı kullanarak oluşturur
// Gerçek projede: qrcode paketi kullanılır (npm install qrcode)
function generateQRDataUrl(text: string): string {
  // Bu placeholder; gerçekte qrcode.toDataURL(text) kullanılır
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}&bgcolor=111111&color=f59e0b&qzone=2`;
}

export default function AlbumQRCode({ albumId, existingToken }: AlbumQRCodeProps) {
  const [token, setToken] = useState<string | undefined>(existingToken);
  const [loading, setLoading] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number>(90);

  const shareUrl = token
    ? `${process.env.NEXT_PUBLIC_APP_URL || "https://studyo.app"}/share/${token}`
    : null;

  const handleCreateLink = async () => {
    setLoading(true);
    try {
      const createShareLink = httpsCallable(functions, "createShareLink");
      const result = await createShareLink({ albumId, expiresInDays }) as any;
      setToken(result.data.token);
      toast.success("QR kod oluşturuldu!");
    } catch (err: any) {
      toast.error("Link oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link kopyalandı!");
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-4 h-4 text-amber-400" />
        <h3 className="text-white font-semibold text-sm">QR Kod & Paylaşım Linki</h3>
      </div>

      {!token ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-xs mb-4">
            Müşteri QR kodu tarayarak şifresiz albüme erişebilir.
          </p>

          <div className="flex items-center gap-2 mb-4">
            <label className="text-gray-400 text-xs whitespace-nowrap">Geçerlilik:</label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5
                         text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value={7}>7 gün</option>
              <option value={30}>30 gün</option>
              <option value={90}>90 gün</option>
              <option value={365}>1 yıl</option>
              <option value={0}>Sınırsız</option>
            </select>
          </div>

          <button
            onClick={handleCreateLink}
            disabled={loading}
            className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50
                       text-black font-semibold rounded-lg text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
            Link Oluştur
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
              <img
                src={generateQRDataUrl(shareUrl!)}
                alt="QR Kod"
                className="w-40 h-40 rounded-lg"
              />
            </div>
          </div>

          {/* Link */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700">
            <span className="text-gray-400 text-xs flex-1 truncate">{shareUrl}</span>
            <button
              onClick={copyLink}
              className="text-amber-400 hover:text-amber-300 flex-shrink-0"
            >
              <Copy size={14} />
            </button>
            <a
              href={shareUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 flex-shrink-0"
            >
              <ExternalLink size={14} />
            </a>
          </div>

          <button
            onClick={handleCreateLink}
            disabled={loading}
            className="w-full py-1.5 border border-gray-700 text-gray-400 rounded-lg text-xs
                       hover:bg-gray-800 transition-colors"
          >
            Yeni Link Oluştur
          </button>
        </div>
      )}
    </div>
  );
}
