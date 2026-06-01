"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createCustomer } from "@/hooks/useCustomers";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string().optional(),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

type FormData = z.infer<typeof schema>;

export default function NewCustomerPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const uid = await createCustomer(data);
      toast.success("Müşteri başarıyla oluşturuldu!");
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
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/customers"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Yeni Müşteri</h1>
          <p className="text-gray-400 text-sm">Uygulama erişimi için müşteri oluşturun</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                {field.label}
              </label>
              <input
                {...register(field.name)}
                type={field.type}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                           text-white placeholder-gray-500 focus:outline-none
                           focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                           transition-colors"
              />
              {errors[field.name] && (
                <p className="text-red-400 text-xs mt-1">
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="pt-2 flex gap-3">
            <Link
              href="/customers"
              className="flex-1 py-2.5 border border-gray-700 text-gray-300 font-medium
                         rounded-lg text-center hover:bg-gray-800 transition-colors text-sm"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50
                         text-white font-semibold rounded-lg transition-colors
                         flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Oluşturuluyor...</>
              ) : (
                "Müşteri Oluştur"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
