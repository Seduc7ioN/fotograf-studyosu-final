"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Copy, Mail, MessageCircle, Send } from "lucide-react";
import { defaultStudioSettings, useSettings } from "@/hooks/useSettings";
import { User } from "@/lib/types";

type TemplateKey = keyof typeof defaultStudioSettings.messageTemplates;

const templateLabels: Record<TemplateKey, string> = {
  customerLogin: "Müşteri giriş bilgisi",
  albumReady: "Albüm hazır",
  appointmentReminder: "Randevu hatırlatma",
  paymentReminder: "Ödeme hatırlatma",
  thankYou: "Teşekkür mesajı",
};

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Müşterimiz";
}

function normalizeWhatsAppPhone(phone?: string) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("90") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length >= 11) return `90${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length >= 10) return `90${digits}`;
  return digits.length >= 10 ? digits : "";
}

function fillTemplate({
  template,
  customer,
  date,
}: {
  template: string;
  customer: User;
  date: string;
}) {
  return template
    .replaceAll("{name}", firstName(customer.name))
    .replaceAll("{email}", customer.email)
    .replaceAll("{password}", "Şifreyi güvenlik için panel göstermez. Gerekirse şifre yenileme linki gönderin.")
    .replaceAll("{date}", date || "randevu günü");
}

function mailSubject(key: TemplateKey) {
  switch (key) {
    case "albumReady":
      return "Albümünüz hazır";
    case "appointmentReminder":
      return "Randevu hatırlatma";
    case "paymentReminder":
      return "Ödeme hatırlatma";
    case "thankYou":
      return "Teşekkür ederiz";
    default:
      return "Lume Art Wedding bilgilendirme";
  }
}

export default function MessageTemplateSender({ customer }: { customer: User }) {
  const { settings } = useSettings();
  const [templateKey, setTemplateKey] = useState<TemplateKey>("albumReady");
  const [date, setDate] = useState("");

  const templates = settings.messageTemplates || defaultStudioSettings.messageTemplates;
  const message = useMemo(
    () => fillTemplate({ template: templates[templateKey], customer, date }),
    [customer, date, templateKey, templates]
  );
  const whatsappPhone = normalizeWhatsAppPhone(customer.phone);
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
    : "";
  const mailUrl = customer.email
    ? `mailto:${customer.email}?subject=${encodeURIComponent(mailSubject(templateKey))}&body=${encodeURIComponent(message)}`
    : "";

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Mesaj kopyalandı.");
    } catch {
      toast.error("Mesaj kopyalanamadı.");
    }
  };

  return (
    <section className="rounded-xl border border-[#433126] bg-[#1f1813]">
      <div className="flex items-start gap-3 border-b border-[#433126] px-5 py-4">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8611A]/15">
          <Send className="h-4 w-4 text-[#ff8a45]" />
        </div>
        <div>
          <h2 className="font-semibold text-[#f7f0e8]">Hazır Mesaj Gönder</h2>
          <p className="mt-1 text-xs text-[#8d7462]">
            Ayarlar sayfasındaki şablonları WhatsApp, e-posta veya kopyala ile kullanın.
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#d8c7b8]">
              Şablon
            </span>
            <select
              value={templateKey}
              onChange={(event) => setTemplateKey(event.target.value as TemplateKey)}
              className="w-full rounded-lg border border-[#433126] bg-[#100a07] px-3 py-2.5 text-sm text-[#f7f0e8] outline-none transition focus:border-[#E8611A]"
            >
              {(Object.keys(templateLabels) as TemplateKey[]).map((key) => (
                <option key={key} value={key}>
                  {templateLabels[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#d8c7b8]">
              Tarih alanı
            </span>
            <input
              value={date}
              onChange={(event) => setDate(event.target.value)}
              type="date"
              className="w-full rounded-lg border border-[#433126] bg-[#100a07] px-3 py-2.5 text-sm text-[#f7f0e8] outline-none transition focus:border-[#E8611A]"
            />
          </label>

          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <a
              href={whatsappUrl || undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!whatsappUrl}
              onClick={(event) => {
                if (!whatsappUrl) {
                  event.preventDefault();
                  toast.error("Müşterinin telefon numarası yok.");
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-700/60 bg-green-950/20 px-3 py-2 text-sm font-semibold text-green-200 transition hover:bg-green-900/30"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={mailUrl}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-700/60 bg-blue-950/20 px-3 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-900/30"
            >
              <Mail className="h-4 w-4" />
              E-posta
            </a>
            <button
              type="button"
              onClick={copyMessage}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#433126] bg-[#100a07] px-3 py-2 text-sm font-semibold text-[#d8c7b8] transition hover:border-[#E8611A]/70 hover:text-[#ff8a45]"
            >
              <Copy className="h-4 w-4" />
              Kopyala
            </button>
          </div>
        </div>

        <pre className="min-h-[220px] whitespace-pre-wrap rounded-lg border border-[#433126] bg-[#100a07] p-4 text-sm leading-6 text-[#f7f0e8]">
          {message}
        </pre>
      </div>
    </section>
  );
}
