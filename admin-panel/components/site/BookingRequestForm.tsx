"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";
import { createBookingRequest } from "@/hooks/useBookingRequests";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  eventType: "Düğün",
  preferredDate: "",
  city: "",
  venue: "",
  message: "",
};

const inputClass =
  "w-full rounded-2xl border border-[#5d4333]/70 bg-[#100a07]/80 px-4 py-3 text-sm text-[#f7f0e8] outline-none transition placeholder:text-[#6f5848] focus:border-[#E8611A]";

const eventTypes = [
  "Düğün",
  "Nişan",
  "Kına",
  "Save the Date",
  "Dış Çekim",
  "Diğer",
];

export default function BookingRequestForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.preferredDate) {
      toast.error("İsim, telefon ve tarih alanlarını doldurun.");
      return;
    }

    setSubmitting(true);
    try {
      await createBookingRequest(form);
      setSent(true);
      setForm(initialForm);
      toast.success("Randevu talebiniz alındı.");
    } catch (err: any) {
      toast.error(err.message || "Talep gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-[2rem] border border-[#5d4333]/70 bg-[#17100b]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur md:p-7"
    >
      <div className="mb-6 flex items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#E8611A]">
            Çekim talebi
          </p>
          <h3 className="mt-3 font-display text-4xl text-[#f7f0e8]">
            Tarihinizi konuşalım
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#9f8978]">
            Bilgilerinizi bırakın, uygunluk ve teklif için size dönüş yapalım.
          </p>
        </div>
        <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8611A]/15 text-[#ff8a45] sm:flex">
          <CalendarDays size={21} />
        </span>
      </div>

      {sent && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-100">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-300" />
          Talebiniz yönetim paneline düştü. En kısa sürede dönüş yapılacak.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className={inputClass}
          placeholder="Ad Soyad *"
          maxLength={80}
        />
        <input
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          className={inputClass}
          placeholder="Telefon *"
          maxLength={40}
        />
        <input
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          className={inputClass}
          placeholder="E-posta"
          type="email"
          maxLength={120}
        />
        <select
          value={form.eventType}
          onChange={(event) =>
            setForm({ ...form, eventType: event.target.value })
          }
          className={inputClass}
        >
          {eventTypes.map((type) => (
            <option key={type} value={type} className="bg-[#17100b]">
              {type}
            </option>
          ))}
        </select>
        <input
          value={form.preferredDate}
          onChange={(event) =>
            setForm({ ...form, preferredDate: event.target.value })
          }
          className={inputClass}
          type="date"
        />
        <input
          value={form.city}
          onChange={(event) => setForm({ ...form, city: event.target.value })}
          className={inputClass}
          placeholder="Şehir"
          maxLength={80}
        />
        <input
          value={form.venue}
          onChange={(event) => setForm({ ...form, venue: event.target.value })}
          className={`${inputClass} md:col-span-2`}
          placeholder="Mekan / lokasyon"
          maxLength={140}
        />
        <textarea
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          className={`${inputClass} min-h-32 resize-none md:col-span-2`}
          placeholder="Kısa notunuz, beklentiniz veya sormak istediğiniz şeyler"
          maxLength={800}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#E8611A] px-6 py-4 text-xs font-bold uppercase tracking-[0.28em] text-[#170f0a] transition hover:bg-[#ff7a32] disabled:opacity-60"
      >
        {submitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
        Talep Gönder
      </button>
    </form>
  );
}
