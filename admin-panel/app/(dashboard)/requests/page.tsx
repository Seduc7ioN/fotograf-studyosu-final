"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  updateBookingRequest,
  useBookingRequests,
} from "@/hooks/useBookingRequests";
import { BookingRequest, BookingRequestStatus } from "@/lib/types";

const statusOptions: Array<{
  value: BookingRequestStatus | "all";
  label: string;
}> = [
  { value: "all", label: "Tümü" },
  { value: "new", label: "Yeni" },
  { value: "contacted", label: "Görüşüldü" },
  { value: "proposal_sent", label: "Teklif Gönderildi" },
  { value: "accepted", label: "Kabul" },
  { value: "rejected", label: "Red" },
];

const statusStyles: Record<BookingRequestStatus, string> = {
  new: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  contacted: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  proposal_sent: "border-purple-500/30 bg-purple-500/10 text-purple-200",
  accepted: "border-green-500/30 bg-green-500/10 text-green-200",
  rejected: "border-red-500/30 bg-red-500/10 text-red-200",
};

const inputClass =
  "w-full rounded-lg border border-[#4a3529] bg-[#211813] px-3 py-2.5 text-sm text-[#f7f0e8] outline-none transition focus:border-[#E8611A]";

function statusLabel(status: BookingRequestStatus) {
  return statusOptions.find((item) => item.value === status)?.label || status;
}

function formatDate(request: BookingRequest) {
  if (!request.createdAt?.toDate) return "Yeni";
  return request.createdAt.toDate().toLocaleString("tr-TR");
}

export default function RequestsPage() {
  const { requests, loading, error } = useBookingRequests();
  const [statusFilter, setStatusFilter] = useState<BookingRequestStatus | "all">(
    "all"
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, BookingRequest>>({});

  const filteredRequests = useMemo(
    () =>
      statusFilter === "all"
        ? requests
        : requests.filter((request) => request.status === statusFilter),
    [requests, statusFilter]
  );

  const newCount = requests.filter((request) => request.status === "new").length;

  const draftFor = (request: BookingRequest) =>
    drafts[request.id] ?? {
      ...request,
      adminNote: request.adminNote || "",
      offerAmount: request.offerAmount ?? null,
    };

  const patchDraft = (
    request: BookingRequest,
    patch: Partial<BookingRequest>
  ) => {
    setDrafts((current) => ({
      ...current,
      [request.id]: { ...draftFor(request), ...patch },
    }));
  };

  const saveRequest = async (request: BookingRequest) => {
    const draft = draftFor(request);
    setSavingId(request.id);
    try {
      await updateBookingRequest(request.id, {
        status: draft.status,
        adminNote: draft.adminNote?.trim() || "",
        offerAmount:
          draft.offerAmount === null || Number.isNaN(Number(draft.offerAmount))
            ? null
            : Number(draft.offerAmount),
      });
      setDrafts((current) => {
        const next = { ...current };
        delete next[request.id];
        return next;
      });
      toast.success("Talep güncellendi.");
    } catch (err: any) {
      toast.error(err.message || "Talep güncellenemedi.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[#f7f0e8]">
            Randevu Talepleri
          </h1>
          <p className="mt-1 text-sm text-[#9f8978]">
            Web sitesinden gelen çekim başvurularını ve teklif sürecini yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#4a3529] px-4 py-2 text-sm font-semibold text-[#d8c7b8]">
          <Clock size={16} className="text-[#E8611A]" />
          {newCount} yeni talep
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatusFilter(option.value)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              statusFilter === option.value
                ? "border-[#E8611A] bg-[#E8611A]/15 text-[#ff8a45]"
                : "border-[#4a3529] text-[#b9a99b] hover:border-[#E8611A]/70"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Talepler yüklenemedi</p>
            <p className="mt-1 text-sm text-red-200/80">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#39281e] bg-[#17100b] p-10 text-center text-[#8d7462]">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
          Talepler yükleniyor...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-xl border border-[#39281e] bg-[#17100b] p-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[#6f5848]" />
          <p className="mt-3 font-semibold text-[#d8c7b8]">
            Bu filtrede talep yok
          </p>
          <p className="mt-1 text-sm text-[#8d7462]">
            Web sitesinden form gönderildiğinde burada görünür.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredRequests.map((request) => {
            const draft = draftFor(request);
            return (
              <article
                key={request.id}
                className="rounded-2xl border border-[#39281e] bg-[#17100b] p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-3xl text-[#f7f0e8]">
                        {request.name}
                      </h2>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[request.status]}`}
                      >
                        {statusLabel(request.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#8d7462]">
                      {formatDate(request)}
                    </p>
                  </div>
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      patchDraft(request, {
                        status: event.target.value as BookingRequestStatus,
                      })
                    }
                    className={`${inputClass} sm:w-52`}
                  >
                    {statusOptions
                      .filter((option) => option.value !== "all")
                      .map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-[#17100b]"
                        >
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-[#d8c7b8] md:grid-cols-2">
                  <a
                    href={`tel:${request.phone}`}
                    className="flex items-center gap-2 rounded-xl border border-[#39281e] px-3 py-2 transition hover:border-[#E8611A]/70"
                  >
                    <Phone size={15} className="text-[#E8611A]" />
                    {request.phone}
                  </a>
                  {request.email ? (
                    <a
                      href={`mailto:${request.email}`}
                      className="flex items-center gap-2 rounded-xl border border-[#39281e] px-3 py-2 transition hover:border-[#E8611A]/70"
                    >
                      <Mail size={15} className="text-[#E8611A]" />
                      {request.email}
                    </a>
                  ) : (
                    <span className="flex items-center gap-2 rounded-xl border border-[#39281e] px-3 py-2 text-[#6f5848]">
                      <Mail size={15} />
                      E-posta yok
                    </span>
                  )}
                  <span className="flex items-center gap-2 rounded-xl border border-[#39281e] px-3 py-2">
                    <CalendarDays size={15} className="text-[#E8611A]" />
                    {request.preferredDate || "Tarih belirtilmedi"} · {request.eventType}
                  </span>
                  <span className="flex items-center gap-2 rounded-xl border border-[#39281e] px-3 py-2">
                    <MapPin size={15} className="text-[#E8611A]" />
                    {[request.city, request.venue].filter(Boolean).join(" / ") ||
                      "Lokasyon belirtilmedi"}
                  </span>
                </div>

                {request.message && (
                  <p className="mt-4 whitespace-pre-wrap rounded-xl border border-[#39281e] bg-[#100a07] p-4 text-sm leading-6 text-[#b9a99b]">
                    {request.message}
                  </p>
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8d7462]">
                      Teklif tutarı
                    </span>
                    <input
                      value={draft.offerAmount ?? ""}
                      onChange={(event) =>
                        patchDraft(request, {
                          offerAmount: event.target.value
                            ? Number(event.target.value)
                            : null,
                        })
                      }
                      type="number"
                      min={0}
                      className={inputClass}
                      placeholder="₺"
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8d7462]">
                      Admin notu
                    </span>
                    <textarea
                      value={draft.adminNote || ""}
                      onChange={(event) =>
                        patchDraft(request, { adminNote: event.target.value })
                      }
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder="Görüşme notu, paket detayı, dönüş bilgisi..."
                    />
                  </label>
                </div>

                <div className="mt-5 flex justify-end border-t border-[#39281e] pt-4">
                  <button
                    type="button"
                    onClick={() => saveRequest(request)}
                    disabled={savingId === request.id}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#E8611A] px-4 py-2 text-sm font-bold text-[#170f0a] transition hover:bg-[#ff7a32] disabled:opacity-60"
                  >
                    {savingId === request.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Kaydet
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
