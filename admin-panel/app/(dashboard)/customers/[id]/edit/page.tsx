"use client";

import { updateCustomer, useCustomer } from "@/hooks/useCustomers";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { customer, loading } = useCustomer(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateCustomer(id, data);
      toast.success("Müşteri güncellendi.");
      router.push(`/customers/${id}`);
    } catch (error: any) {
      toast.error(error.message || "Müşteri güncellenemedi.");
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-center py-12">Yükleniyor...</div>;
  }

  if (!customer) {
    return <div className="text-gray-500 text-center py-12">Müşteri bulunamadı.</div>;
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/customers/${id}`}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Müşteriyi Düzenle</h1>
          <p className="text-gray-400 text-sm">Müşteri iletişim bilgilerini güncelleyin</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Ad Soyad
            </label>
            <input
              {...register("name")}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none
                         focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                         transition-colors"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              E-posta
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none
                         focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                         transition-colors"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Telefon
            </label>
            <input
              {...register("phone")}
              type="tel"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none
                         focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                         transition-colors"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Link
              href={`/customers/${id}`}
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
                <><Loader2 size={16} className="animate-spin" /> Kaydediliyor...</>
              ) : (
                "Kaydet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
