"use client";

import { saveSettings, StudioSettings, useSettings } from "@/hooks/useSettings";
import {
  AlertCircle,
  AtSign,
  Building2,
  Loader2,
  MessageSquare,
  Save,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

const inputClass =
  "w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";

export default function SettingsPage() {
  const { settings, setSettings, loading, error } = useSettings();
  const [saving, setSaving] = useState(false);

  const updateField = <K extends keyof StudioSettings>(
    key: K,
    value: StudioSettings[K]
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const updateTemplate = (
    key: keyof StudioSettings["messageTemplates"],
    value: string
  ) => {
    setSettings((current) => ({
      ...current,
      messageTemplates: {
        ...current.messageTemplates,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      toast.success("Ayarlar kaydedildi.");
    } catch (err: any) {
      toast.error(err.message || "Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
        <p className="mt-1 text-sm text-gray-400">
          Stüdyo bilgileri, varsayılan albüm ayarları ve panel tercihleri.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Ayarlar yüklenemedi</p>
            <p className="mt-1 text-sm text-red-200/80">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
          Ayarlar yükleniyor...
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-gray-800 bg-gray-900">
            <div className="flex items-center gap-3 border-b border-gray-800 px-6 py-4">
              <Building2 className="h-5 w-5 text-amber-400" />
              <div>
                <h2 className="font-semibold text-white">Stüdyo Bilgileri</h2>
                <p className="text-xs text-gray-500">
                  Müşterilere gösterilecek temel iletişim bilgileri.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <Field label="Stüdyo adı">
                <input
                  value={settings.studioName}
                  onChange={(e) => updateField("studioName", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="İletişim e-postası">
                <input
                  value={settings.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  type="email"
                  className={inputClass}
                />
              </Field>
              <Field label="Telefon">
                <input
                  value={settings.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+90 555 000 00 00"
                  className={inputClass}
                />
              </Field>
              <Field label="Web sitesi">
                <input
                  value={settings.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </Field>
              <Field label="Instagram">
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    value={settings.instagramUrl}
                    onChange={(e) => updateField("instagramUrl", e.target.value)}
                    placeholder="https://www.instagram.com/lumeartwedding"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </Field>
              <div className="md:col-span-2">
                <Field label="Adres">
                  <textarea
                    value={settings.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-800 bg-gray-900">
            <div className="flex items-center gap-3 border-b border-gray-800 px-6 py-4">
              <SlidersHorizontal className="h-5 w-5 text-amber-400" />
              <div>
                <h2 className="font-semibold text-white">Albüm Varsayılanları</h2>
                <p className="text-xs text-gray-500">
                  Yeni albüm oluştururken kullanılacak başlangıç değerleri.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <Field label="Varsayılan indirme">
                <label className="flex h-[42px] items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.defaultDownloadEnabled}
                    onChange={(e) =>
                      updateField("defaultDownloadEnabled", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-amber-500 focus:ring-amber-500"
                  />
                  Açık gelsin
                </label>
              </Field>
              <Field label="Albüm geçerlilik süresi">
                <input
                  value={settings.defaultAlbumExpiryDays}
                  onChange={(e) =>
                    updateField("defaultAlbumExpiryDays", Number(e.target.value))
                  }
                  type="number"
                  min={1}
                  className={inputClass}
                />
              </Field>
              <Field label="Maksimum yükleme MB">
                <input
                  value={settings.maxUploadSizeMB}
                  onChange={(e) => updateField("maxUploadSizeMB", Number(e.target.value))}
                  type="number"
                  min={1}
                  max={100}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-gray-800 bg-gray-900">
            <div className="flex items-center gap-3 border-b border-gray-800 px-6 py-4">
              <MessageSquare className="h-5 w-5 text-amber-400" />
              <div>
                <h2 className="font-semibold text-white">Mesaj Şablonları</h2>
                <p className="text-xs text-gray-500">
                  WhatsApp ve e-posta ile gönderilecek hazır metinler. Kullanılabilir alanlar: {"{name}"}, {"{email}"}, {"{password}"}, {"{date}"}.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <Field label="Müşteri giriş bilgisi">
                <textarea
                  value={settings.messageTemplates.customerLogin}
                  onChange={(e) => updateTemplate("customerLogin", e.target.value)}
                  rows={6}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <Field label="Albüm hazır">
                <textarea
                  value={settings.messageTemplates.albumReady}
                  onChange={(e) => updateTemplate("albumReady", e.target.value)}
                  rows={6}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <Field label="Randevu hatırlatma">
                <textarea
                  value={settings.messageTemplates.appointmentReminder}
                  onChange={(e) => updateTemplate("appointmentReminder", e.target.value)}
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <Field label="Ödeme hatırlatma">
                <textarea
                  value={settings.messageTemplates.paymentReminder}
                  onChange={(e) => updateTemplate("paymentReminder", e.target.value)}
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Teşekkür mesajı">
                  <textarea
                    value={settings.messageTemplates.thankYou}
                    onChange={(e) => updateTemplate("thankYou", e.target.value)}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-green-400" />
              <div>
                <h2 className="font-semibold text-white">Güvenlik</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Bu sayfadaki kayıtlar sadece admin token ile çalışan API üzerinden
                  değiştirilebilir. Admin e-postası ve giriş şifresi Firebase
                  Authentication üzerinden yönetilir.
                </p>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold
                         text-white transition-colors hover:bg-amber-400 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Kaydet
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      {children}
    </label>
  );
}
