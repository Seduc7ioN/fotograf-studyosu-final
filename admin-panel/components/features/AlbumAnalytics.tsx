"use client";

import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { Eye, Download, TrendingUp } from "lucide-react";

interface AlbumAnalyticsProps {
  albumId: string;
  viewCount?: number;
  downloadCount?: number;
}

export default function AlbumAnalyticsWidget({
  albumId,
  viewCount = 0,
  downloadCount = 0,
}: AlbumAnalyticsProps) {
  const [dailyViews, setDailyViews] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fn = httpsCallable(functions, "getAlbumAnalytics");
    fn({ albumId })
      .then((res: any) => {
        setDailyViews(res.data?.dailyViews || {});
      })
      .finally(() => setLoading(false));
  }, [albumId]);

  // Son 7 günlük veri
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    return { key, label: d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }), value: dailyViews[key] || 0 };
  });

  const maxVal = Math.max(...last7Days.map((d) => d.value), 1);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-amber-400" />
        <h3 className="text-white font-semibold text-sm">Analitik</h3>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Eye className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400 text-xs">Görüntüleme</span>
          </div>
          <p className="text-white text-xl font-bold">{viewCount}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Download className="w-3 h-3 text-green-400" />
            <span className="text-gray-400 text-xs">İndirme</span>
          </div>
          <p className="text-white text-xl font-bold">{downloadCount}</p>
        </div>
      </div>

      {/* Mini bar chart — Son 7 gün */}
      <div>
        <p className="text-gray-500 text-xs mb-3">Son 7 gün görüntülenme</p>
        {loading ? (
          <div className="h-16 flex items-center justify-center text-gray-600 text-xs">
            Yükleniyor...
          </div>
        ) : (
          <div className="flex items-end gap-1 h-16">
            {last7Days.map((day) => (
              <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-amber-500/70 rounded-sm transition-all duration-500"
                  style={{ height: `${(day.value / maxVal) * 48}px`, minHeight: day.value > 0 ? "4px" : "0" }}
                  title={`${day.label}: ${day.value} görüntülenme`}
                />
                <span className="text-gray-600 text-[8px] whitespace-nowrap">
                  {day.label.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
