"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, FolderOpen, KeyRound, Loader2, Plus } from "lucide-react";
import { useAlbums } from "@/hooks/useAlbums";
import { createPasswordResetLink, useCustomer } from "@/hooks/useCustomers";

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { customer, loading } = useCustomer(id);
  const { albums } = useAlbums(id);
  const [resetting, setResetting] = useState(false);

  if (loading) {
    return <div className="py-12 text-center text-[#8d7462]">Yükleniyor...</div>;
  }

  if (!customer) {
    return <div className="py-12 text-center text-[#8d7462]">Müşteri bulunamadı.</div>;
  }

  const handlePasswordReset = async () => {
    setResetting(true);
    try {
      const link = await createPasswordResetLink(customer.email);
      await navigator.clipboard.writeText(link);
      toast.success("Şifre yenileme linki kopyalandı.");
    } catch (error: any) {
      toast.error(error.message || "Şifre yenileme linki oluşturulamadı.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/customers"
          className="rounded-lg p-2 text-[#b9a99b] transition hover:bg-[#281d16] hover:text-[#f7f0e8]"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-[#f7f0e8]">
            {customer.name}
          </h1>
          <p className="text-sm text-[#8d7462]">{customer.email}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#433126] bg-[#1f1813] p-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-[#f7f0e8]">Mobil uygulama erişimi</p>
            <p className="mt-1 text-sm text-[#8d7462]">
              Müşteri şifresini unutursa yenileme linkini oluşturup gönderebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={resetting}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#433126] bg-[#100a07] px-4 py-2 text-sm font-semibold text-[#d8c7b8] transition hover:border-[#E8611A]/70 hover:text-[#ff8a45] disabled:opacity-60"
          >
            {resetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Şifre Linki Kopyala
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#f7f0e8]">Albümleri ({albums.length})</h2>
        <Link
          href={`/albums/new?customerId=${id}`}
          className="flex items-center gap-2 rounded-lg bg-[#E8611A] px-3 py-1.5 text-xs font-semibold text-[#170f0a] transition hover:bg-[#ff7a32]"
        >
          <Plus size={14} /> Yeni Albüm
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#433126] bg-[#1f1813]">
        {albums.length === 0 ? (
          <div className="p-8 text-center text-[#8d7462]">Henüz albüm yok.</div>
        ) : (
          <div className="divide-y divide-[#433126]">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="flex items-center gap-4 p-4 transition hover:bg-[#281d16]/50"
              >
                <FolderOpen className="h-5 w-5 flex-shrink-0 text-[#ff8a45]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[#f7f0e8]">{album.title}</p>
                  <p className="text-xs text-[#8d7462]">{album.photoCount ?? 0} fotoğraf</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
