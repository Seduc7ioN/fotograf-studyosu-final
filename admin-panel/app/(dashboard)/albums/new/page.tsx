"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAlbum } from "@/hooks/useAlbums";
import { useCustomers } from "@/hooks/useCustomers";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  customerId: z.string().min(1, "Müşteri seçin"),
  title: z.string().min(2, "Albüm adı en az 2 karakter olmalı"),
  downloadEnabled: z.boolean().optional(),
  customerUploadEnabled: z.boolean().optional(),
  expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewAlbumPage() {
  const router = useRouter();
  const { customers } = useCustomers();

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const id = await createAlbum({
        customerId: data.customerId,
        title: data.title,
        downloadEnabled: data.downloadEnabled ?? false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      });
      toast.success("Albüm oluşturuldu!");
      router.push(`/albums/${id}`);
    } catch (e: any) {
      toast.error(e.message || "Albüm oluşturulamadı.");
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/albums"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Yeni Albüm</h1>
          <p className="text-gray-400 text-sm">Müşteri için albüm oluşturun</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Müşteri
            </label>
            <select {...register("customerId")}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                         text-white focus:outline-none focus:border-amber-500">
              <option value="">Müşteri seçin</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-red-400 text-xs mt-1">{errors.customerId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Albüm Adı
            </label>
            <input {...register("title")} type="text" placeholder="Ayşe & Mehmet Dış Çekim"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Bitiş Tarihi (opsiyonel)
            </label>
            <input {...register("expiresAt")} type="date"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                         text-white focus:outline-none focus:border-amber-500" />
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input {...register("downloadEnabled")} type="checkbox"
                className="w-4 h-4 accent-amber-500" />
              <span className="text-sm text-gray-300">İndirmeye izin ver</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input {...register("customerUploadEnabled")} type="checkbox"
                className="w-4 h-4 accent-amber-500" />
              <span className="text-sm text-gray-300">Müşteri fotoğraf yükleyebilsin</span>
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <Link href="/albums"
              className="flex-1 py-2.5 border border-gray-700 text-gray-300 font-medium
                         rounded-lg text-center hover:bg-gray-800 transition-colors text-sm">
              İptal
            </Link>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50
                         text-black font-semibold rounded-lg transition-colors
                         flex items-center justify-center gap-2 text-sm">
              {isSubmitting
                ? <><Loader2 size={16} className="animate-spin" /> Oluşturuluyor...</>
                : "Albüm Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
