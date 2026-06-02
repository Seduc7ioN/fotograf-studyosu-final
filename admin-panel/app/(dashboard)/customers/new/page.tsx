"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Copy, Loader2, Mail, MessageCircle } from "lucide-react";
import { createCustomer } from "@/hooks/useCustomers";

const schema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string().optional(),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

type FormData = z.infer<typeof schema>;

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Müşterimiz";
}

function buildLoginMessage(data: Partial<FormData>) {
  const name = firstName(data.name || "");
  return `Merhaba ${name} Hanım/Bey,
Fotoğraflarınıza erişmek için mobil uygulamaya aşağıdaki bilgilerle giriş yapabilirsiniz:

E-posta: ${data.email || "musteri@example.com"}
Şifre: ${data.password || "Musteri12345"}`;
}

function normalizeWhatsAppPhone(phone?: string) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("90") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length >= 11) return `90${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length >= 10) return `90${digits}`;
  return digits.length >= 10 ? digits : "";
}

function isUsableEmail(email?: string) {
  return z.string().email().safeParse(email || "").success;
}

export default function NewCustomerPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const watchedValues = watch();
  const loginMessage = useMemo(() => buildLoginMessage(watchedValues), [watchedValues]);
  const whatsappPhone = normalizeWhatsAppPhone(watchedValues.phone);
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(loginMessage)}`
    : "";
  const mailUrl = isUsableEmail(watchedValues.email)
    ? `mailto:${watchedValues.email}?subject=${encodeURIComponent(
        "Lume Art Wedding mobil uygulama giriş bilgileri"
      )}&body=${encodeURIComponent(loginMessage)}`
    : "";

  const copyLoginMessage = async () => {
    try {
      await navigator.clipboard.writeText(loginMessage);
      toast.success("Giriş bilgileri kopyalandı.");
    } catch {
      toast.error("Kopyalanamadı. Metni elle seçip kopyalayabilirsiniz.");
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const uid = await createCustomer(data);
      await navigator.clipboard.writeText(buildLoginMessage(data)).catch(() => undefined);
      toast.success("Müşteri oluşturuldu, giriş bilgileri kopyalandı.");
      router.push(`/customers/${uid}`);
    } catch (error: any) {
      toast.error(error.message || "Müşteri oluşturulamadı.");
    }
  };

  const fields = [
    { name: "name" as const, label: "Ad Soyad", type: "text", placeholder: "Ayşe Yılmaz" },
    { name: "email" as const, label: "E-posta", type: "email", placeholder: "ayse@example.com" },
    { name: "phone" as const, label: "Telefon (opsiyonel)", type: "tel", placeholder: "+90 555 000 00 00" },
    { name: "password" as const, label: "Şifre", type: "password", placeholder: "En az 8 karakter" },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/customers"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Yeni Müşteri</h1>
          <p className="text-sm text-gray-400">Mobil uygulama erişimi için müşteri hesabı oluşturun</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  {field.label}
                </label>
                <input
                  {...register(field.name)}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white
                             placeholder-gray-500 transition-colors focus:border-amber-500
                             focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                {errors[field.name] && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Link
                href="/customers"
                className="flex-1 rounded-lg border border-gray-700 py-2.5 text-center text-sm font-medium
                           text-gray-300 transition-colors hover:bg-gray-800"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5
                           text-sm font-semibold text-white transition-colors hover:bg-amber-400
                           disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  "Müşteri Oluştur"
                )}
              </button>
            </div>
          </form>
        </div>

        <aside className="rounded-xl border border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">Müşteriye Gönderilecek Giriş Bilgileri</h2>
              <p className="mt-1 text-xs text-gray-500">Formu doldurdukça metin otomatik güncellenir.</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <a
                href={whatsappUrl || undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!whatsappUrl}
                onClick={(event) => {
                  if (!whatsappUrl) event.preventDefault();
                }}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  whatsappUrl
                    ? "border-green-700/60 bg-green-950/20 text-green-200 hover:bg-green-900/30"
                    : "cursor-not-allowed border-gray-800 text-gray-600"
                }`}
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
              <a
                href={mailUrl || undefined}
                aria-disabled={!mailUrl}
                onClick={(event) => {
                  if (!mailUrl) event.preventDefault();
                }}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  mailUrl
                    ? "border-blue-700/60 bg-blue-950/20 text-blue-200 hover:bg-blue-900/30"
                    : "cursor-not-allowed border-gray-800 text-gray-600"
                }`}
              >
                <Mail size={14} />
                E-posta
              </a>
              <button
                type="button"
                onClick={copyLoginMessage}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-xs
                           font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <Copy size={14} />
                Kopyala
              </button>
            </div>
          </div>
          <div className="p-5">
            <pre className="whitespace-pre-wrap rounded-lg border border-gray-800 bg-gray-950 p-4 text-sm leading-6 text-gray-200">
              {loginMessage}
            </pre>
            <p className="mt-3 text-xs text-gray-500">
              Müşteri oluşturulduğunda bu metin otomatik panoya kopyalanır.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
