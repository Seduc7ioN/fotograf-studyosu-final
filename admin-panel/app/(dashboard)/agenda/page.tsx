"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  createScheduleEvent,
  deleteScheduleEvent,
  useScheduleEvents,
} from "@/hooks/useScheduleEvents";
import { ScheduleEvent } from "@/lib/types";
import { useAlbums } from "@/hooks/useAlbums";
import { useCustomers } from "@/hooks/useCustomers";

type Holiday = {
  date: string;
  title: string;
  type: "full" | "half";
};

const weekdays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const monthFormatter = new Intl.DateTimeFormat("tr-TR", {
  month: "long",
  year: "numeric",
});
const dayFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  weekday: "long",
});

const religiousHolidaysByYear: Record<number, Holiday[]> = {
  2026: [
    { date: "2026-03-19", title: "Ramazan Bayramı Arefesi", type: "half" },
    { date: "2026-03-20", title: "Ramazan Bayramı 1. Gün", type: "full" },
    { date: "2026-03-21", title: "Ramazan Bayramı 2. Gün", type: "full" },
    { date: "2026-03-22", title: "Ramazan Bayramı 3. Gün", type: "full" },
    { date: "2026-05-26", title: "Kurban Bayramı Arefesi", type: "half" },
    { date: "2026-05-27", title: "Kurban Bayramı 1. Gün", type: "full" },
    { date: "2026-05-28", title: "Kurban Bayramı 2. Gün", type: "full" },
    { date: "2026-05-29", title: "Kurban Bayramı 3. Gün", type: "full" },
    { date: "2026-05-30", title: "Kurban Bayramı 4. Gün", type: "full" },
  ],
};

function fixedHolidays(year: number): Holiday[] {
  return [
    { date: `${year}-01-01`, title: "Yılbaşı", type: "full" },
    { date: `${year}-04-23`, title: "Ulusal Egemenlik ve Çocuk Bayramı", type: "full" },
    { date: `${year}-05-01`, title: "Emek ve Dayanışma Günü", type: "full" },
    { date: `${year}-05-19`, title: "Atatürk'ü Anma, Gençlik ve Spor Bayramı", type: "full" },
    { date: `${year}-07-15`, title: "Demokrasi ve Milli Birlik Günü", type: "full" },
    { date: `${year}-08-30`, title: "Zafer Bayramı", type: "full" },
    { date: `${year}-10-28`, title: "Cumhuriyet Bayramı Arefesi", type: "half" },
    { date: `${year}-10-29`, title: "Cumhuriyet Bayramı", type: "full" },
  ];
}

function getOfficialHolidays(year: number) {
  return [...fixedHolidays(year), ...(religiousHolidaysByYear[year] ?? [])];
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localDateFromKey(key: string, time = "12:00") {
  return new Date(`${key}T${time || "12:00"}:00`);
}

function toDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      key: dateKey(date),
      inCurrentMonth: date.getMonth() === month,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    };
  });
}

function eventTime(event: ScheduleEvent) {
  if (event.startTime) return event.startTime;
  const date = toDate(event.eventDate);
  return date
    ? new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(date)
    : "";
}

export default function AgendaPage() {
  const todayKey = dateKey(new Date());
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    startTime: "",
    location: "",
    note: "",
    customerId: "",
    albumId: "",
  });

  const { events, loading, error } = useScheduleEvents();
  const { customers } = useCustomers();
  const { albums } = useAlbums();

  const holidays = useMemo(
    () => getOfficialHolidays(viewDate.getFullYear()),
    [viewDate]
  );
  const holidayMap = useMemo(
    () => new Map(holidays.map((holiday) => [holiday.date, holiday])),
    [holidays]
  );
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    for (const event of events) {
      const key = event.eventDateKey || (toDate(event.eventDate) ? dateKey(toDate(event.eventDate)!) : "");
      if (!key) continue;
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    for (const list of Array.from(map.values())) {
      list.sort((a, b) => eventTime(a).localeCompare(eventTime(b), "tr"));
    }
    return map;
  }, [events]);

  const selectedDate = localDateFromKey(selectedKey);
  const selectedEvents = eventsByDate.get(selectedKey) ?? [];
  const selectedHoliday = holidayMap.get(selectedKey);
  const monthHolidays = holidays.filter((holiday) => {
    const date = localDateFromKey(holiday.date);
    return date.getMonth() === viewDate.getMonth();
  });
  const customerAlbums = albums.filter((album) => album.customerId === form.customerId);

  const changeMonth = (amount: number) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const goToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedKey(dateKey(today));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Plan başlığı gerekli.");
      return;
    }

    setSaving(true);
    try {
      const selectedCustomer = customers.find((customer) => customer.id === form.customerId);
      const selectedAlbum = albums.find((album) => album.id === form.albumId);
      await createScheduleEvent({
        title: form.title,
        eventDate: localDateFromKey(selectedKey, form.startTime),
        eventDateKey: selectedKey,
        startTime: form.startTime,
        location: form.location,
        note: form.note,
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        albumId: selectedAlbum?.id,
        albumTitle: selectedAlbum?.title,
      });
      setForm({ title: "", startTime: "", location: "", note: "", customerId: "", albumId: "" });
      toast.success("Ajanda kaydı eklendi.");
    } catch (err) {
      console.error("Schedule event could not be saved:", err);
      toast.error("Ajanda kaydı eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm("Bu ajanda kaydını silmek istiyor musunuz?");
    if (!confirmed) return;

    setDeletingId(eventId);
    try {
      await deleteScheduleEvent(eventId);
      toast.success("Ajanda kaydı silindi.");
    } catch (err) {
      console.error("Schedule event could not be deleted:", err);
      toast.error("Ajanda kaydı silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#f7f0e8]">Ajanda</h1>
          <p className="mt-1 text-sm text-[#b9a99b]">
            Çekim günleri, müşteri randevuları ve resmi tatiller.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded-lg border border-[#433126] bg-[#1f1813] p-2 text-[#d8c7b8] transition hover:border-[#E8611A]/70 hover:text-[#ff8a45]"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-[#433126] bg-[#1f1813] px-4 py-2 text-sm font-semibold text-[#d8c7b8] transition hover:border-[#E8611A]/70 hover:text-[#ff8a45]"
          >
            Bugün
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded-lg border border-[#433126] bg-[#1f1813] p-2 text-[#d8c7b8] transition hover:border-[#E8611A]/70 hover:text-[#ff8a45]"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Ajanda yüklenemedi</p>
            <p className="mt-1 text-sm text-red-200/80">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-xl border border-[#433126] bg-[#1f1813]">
          <div className="flex items-center justify-between border-b border-[#433126] px-5 py-4">
            <div>
              <p className="font-display text-2xl font-semibold capitalize text-[#f7f0e8]">
                {monthFormatter.format(viewDate)}
              </p>
              <p className="text-xs text-[#8d7462]">
                Tarihe tıklayın, sağ taraftan çekim notu ekleyin.
              </p>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-[#ff8a45]" />}
          </div>

          <div className="grid grid-cols-7 border-b border-[#433126] bg-[#17100b]">
            {weekdays.map((day) => (
              <div key={day} className="px-3 py-3 text-center text-xs font-semibold text-[#8d7462]">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const holiday = holidayMap.get(day.key);
              const dayEvents = eventsByDate.get(day.key) ?? [];
              const selected = day.key === selectedKey;
              const isToday = day.key === todayKey;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedKey(day.key)}
                  className={[
                    "min-h-[118px] border-b border-r border-[#35251c] p-3 text-left transition",
                    day.inCurrentMonth ? "bg-[#1f1813]" : "bg-[#130d09] opacity-55",
                    selected ? "ring-2 ring-inset ring-[#E8611A]" : "hover:bg-[#281d16]",
                    day.isWeekend ? "text-[#b9a99b]" : "text-[#f7f0e8]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                        isToday ? "bg-[#E8611A] text-[#170f0a]" : "text-inherit",
                      ].join(" ")}
                    >
                      {day.date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="rounded-full bg-[#E8611A]/15 px-2 py-0.5 text-[11px] font-semibold text-[#ff8a45]">
                        {dayEvents.length} plan
                      </span>
                    )}
                  </div>

                  {holiday && (
                    <div className="mt-2 rounded-md border border-[#E8611A]/25 bg-[#E8611A]/10 px-2 py-1 text-[11px] font-medium text-[#ffb17c]">
                      {holiday.type === "half" ? "Yarım gün · " : ""}
                      {holiday.title}
                    </div>
                  )}

                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="truncate rounded-md bg-[#100a07] px-2 py-1 text-[11px] text-[#d8c7b8]"
                      >
                        {eventTime(event) && `${eventTime(event)} · `}
                        {event.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-[#433126] bg-[#1f1813]">
            <div className="border-b border-[#433126] px-5 py-4">
              <p className="font-display text-xl font-semibold text-[#f7f0e8]">
                {dayFormatter.format(selectedDate)}
              </p>
              {selectedHoliday && (
                <p className="mt-1 text-xs font-semibold text-[#ff8a45]">
                  {selectedHoliday.type === "half" ? "Yarım gün resmi tatil" : "Resmi tatil"} ·{" "}
                  {selectedHoliday.title}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#d8c7b8]">
                  Plan / çekim başlığı
                </label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Ayşe & Mehmet dış çekim"
                  className="w-full rounded-lg border border-[#433126] bg-[#100a07] px-3 py-2.5 text-sm text-[#f7f0e8] placeholder-[#8d7462] outline-none transition focus:border-[#E8611A]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#d8c7b8]">
                    Müşteri
                  </label>
                  <select
                    value={form.customerId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        customerId: event.target.value,
                        albumId: "",
                      }))
                    }
                    className="w-full rounded-lg border border-[#433126] bg-[#100a07] px-3 py-2.5 text-sm text-[#f7f0e8] outline-none transition focus:border-[#E8611A]"
                  >
                    <option value="">Müşteri seçilmedi</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#d8c7b8]">
                    Albüm
                  </label>
                  <select
                    value={form.albumId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, albumId: event.target.value }))
                    }
                    disabled={!form.customerId}
                    className="w-full rounded-lg border border-[#433126] bg-[#100a07] px-3 py-2.5 text-sm text-[#f7f0e8] outline-none transition focus:border-[#E8611A] disabled:opacity-50"
                  >
                    <option value="">Albüm seçilmedi</option>
                    {customerAlbums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#d8c7b8]">
                    Saat
                  </label>
                  <input
                    value={form.startTime}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, startTime: event.target.value }))
                    }
                    type="time"
                    className="w-full rounded-lg border border-[#433126] bg-[#100a07] px-3 py-2.5 text-sm text-[#f7f0e8] outline-none transition focus:border-[#E8611A]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#d8c7b8]">
                    Konum
                  </label>
                  <input
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, location: event.target.value }))
                    }
                    placeholder="Stüdyo / mekan"
                    className="w-full rounded-lg border border-[#433126] bg-[#100a07] px-3 py-2.5 text-sm text-[#f7f0e8] placeholder-[#8d7462] outline-none transition focus:border-[#E8611A]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#d8c7b8]">
                  Not
                </label>
                <textarea
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                  rows={4}
                  placeholder="Yanınıza alınacak ekipman, müşteri isteği, teslim notu..."
                  className="w-full resize-none rounded-lg border border-[#433126] bg-[#100a07] px-3 py-2.5 text-sm text-[#f7f0e8] placeholder-[#8d7462] outline-none transition focus:border-[#E8611A]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8611A] px-4 py-2.5 text-sm font-bold text-[#170f0a] transition hover:bg-[#ff7a32] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Ajandaya Ekle
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-[#433126] bg-[#1f1813]">
            <div className="border-b border-[#433126] px-5 py-4">
              <p className="font-display text-xl font-semibold text-[#f7f0e8]">Günün Planları</p>
              <p className="text-xs text-[#8d7462]">{selectedEvents.length} kayıt</p>
            </div>
            <div className="space-y-3 p-5">
              {selectedEvents.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[#433126] px-4 py-6 text-center text-sm text-[#8d7462]">
                  Bu gün için plan yok.
                </p>
              ) : (
                selectedEvents.map((event) => (
                  <div key={event.id} className="rounded-lg border border-[#433126] bg-[#100a07] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#f7f0e8]">{event.title}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#b9a99b]">
                          {eventTime(event) && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-[#ff8a45]" />
                              {eventTime(event)}
                            </span>
                          )}
                          {event.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-[#ff8a45]" />
                              {event.location}
                            </span>
                          )}
                          {event.customerName && (
                            <span className="inline-flex items-center gap-1">
                              Müşteri: {event.customerName}
                            </span>
                          )}
                          {event.albumTitle && (
                            <span className="inline-flex items-center gap-1">
                              Albüm: {event.albumTitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(event.id)}
                        disabled={deletingId === event.id}
                        className="rounded-lg p-2 text-[#8d7462] transition hover:bg-red-950/30 hover:text-red-300 disabled:opacity-50"
                        aria-label="Ajanda kaydını sil"
                      >
                        {deletingId === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {event.note && <p className="mt-3 text-sm text-[#b9a99b]">{event.note}</p>}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#433126] bg-[#1f1813]">
            <div className="border-b border-[#433126] px-5 py-4">
              <p className="font-display text-xl font-semibold text-[#f7f0e8]">Bu Ay Resmi Tatiller</p>
              <p className="text-xs text-[#8d7462]">Arefeler yarım gün olarak işaretlenir.</p>
            </div>
            <div className="space-y-2 p-5">
              {monthHolidays.length === 0 ? (
                <p className="text-sm text-[#8d7462]">Bu ay resmi tatil yok.</p>
              ) : (
                monthHolidays.map((holiday) => (
                  <div
                    key={holiday.date}
                    className="flex items-start gap-3 rounded-lg border border-[#433126] bg-[#100a07] px-3 py-2"
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 text-[#ff8a45]" />
                    <div>
                      <p className="text-sm font-semibold text-[#f7f0e8]">{holiday.title}</p>
                      <p className="text-xs text-[#8d7462]">
                        {dayFormatter.format(localDateFromKey(holiday.date))}
                        {holiday.type === "half" ? " · yarım gün" : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
