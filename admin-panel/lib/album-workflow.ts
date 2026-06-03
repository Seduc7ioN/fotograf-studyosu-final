import { AlbumStatus, Photo } from "@/lib/types";

export const albumStatusOptions: Array<{
  value: AlbumStatus;
  label: string;
  helper: string;
  tone: string;
}> = [
  {
    value: "draft",
    label: "Hazırlanıyor",
    helper: "Panelde hazırlanıyor, müşteriye açılmadı.",
    tone: "bg-yellow-400/10 text-yellow-300",
  },
  {
    value: "ready",
    label: "Müşteri Seçiminde",
    helper: "Müşteri albümü görüp seçim yapabilir.",
    tone: "bg-blue-400/10 text-blue-300",
  },
  {
    value: "in_selection",
    label: "Seçim Bekleniyor",
    helper: "Müşteri seçimlerini tamamlıyor.",
    tone: "bg-sky-400/10 text-sky-300",
  },
  {
    value: "retouching",
    label: "Rötuşta",
    helper: "Seçilen fotoğraflar düzenleniyor.",
    tone: "bg-[#E8611A]/15 text-[#ff8a45]",
  },
  {
    value: "ready_to_deliver",
    label: "Teslime Hazır",
    helper: "Teslim öncesi son kontrol.",
    tone: "bg-green-400/10 text-green-300",
  },
  {
    value: "delivered",
    label: "Teslim Edildi",
    helper: "İş tamamlandı.",
    tone: "bg-emerald-400/10 text-emerald-300",
  },
  {
    value: "archived",
    label: "Arşiv",
    helper: "Süreç kapatıldı.",
    tone: "bg-gray-700 text-[#b9a99b]",
  },
];

export const customerVisibleAlbumStatuses: AlbumStatus[] = [
  "ready",
  "in_selection",
  "retouching",
  "ready_to_deliver",
  "delivered",
];

export function albumStatusMeta(status?: string) {
  return (
    albumStatusOptions.find((option) => option.value === status) ??
    albumStatusOptions[0]
  );
}

export function photoSelectionLabel(status?: Photo["selectionStatus"]) {
  switch (status) {
    case "selected":
      return "Seçildi";
    case "retouch":
      return "Rötuş istiyor";
    case "approved":
      return "Onaylandı";
    case "rejected":
      return "Beğenmedi";
    default:
      return "Bekliyor";
  }
}

export function photoSelectionTone(status?: Photo["selectionStatus"]) {
  switch (status) {
    case "selected":
      return "bg-green-400/15 text-green-300";
    case "retouch":
      return "bg-[#E8611A]/15 text-[#ff8a45]";
    case "approved":
      return "bg-emerald-400/15 text-emerald-300";
    case "rejected":
      return "bg-red-400/15 text-red-300";
    default:
      return "bg-[#100a07]/80 text-[#b9a99b]";
  }
}
