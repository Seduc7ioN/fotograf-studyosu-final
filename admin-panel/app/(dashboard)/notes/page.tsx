"use client";

import Link from "next/link";
import { AlertCircle, FolderOpen, Loader2, MessageSquare } from "lucide-react";
import { useAllComments } from "@/hooks/useComments";

export default function NotesPage() {
  const { comments, loading, error } = useAllComments(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#f7f0e8]">
          Müşteri Notları
        </h1>
        <p className="mt-1 text-sm text-[#b9a99b]">
          Mobil uygulamada fotoğraf altına yazılan rötuş ve Photoshop istekleri.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Notlar yüklenemedi</p>
            <p className="mt-1 text-sm text-red-200/80">{error}</p>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-[#433126] bg-[#1f1813]">
        <div className="flex items-center justify-between border-b border-[#433126] px-5 py-4">
          <div>
            <h2 className="font-semibold text-[#f7f0e8]">Son Notlar</h2>
            <p className="mt-1 text-xs text-[#8d7462]">
              En yeni müşteri yorumları üstte görünür.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#E8611A]/15 px-3 py-1 text-sm font-semibold text-[#ff8a45]">
            <MessageSquare size={15} />
            {comments.length}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-[#8d7462]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Notlar yükleniyor...
          </div>
        ) : comments.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#8d7462]">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-50" />
            Henüz müşteri notu yok.
          </div>
        ) : (
          <div className="divide-y divide-[#433126]">
            {comments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#E8611A]/15">
                  <MessageSquare className="h-5 w-5 text-[#ff8a45]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#f7f0e8]">
                      {comment.customerName}
                    </p>
                    {comment.createdAt?.toDate && (
                      <span className="text-xs text-[#8d7462]">
                        {comment.createdAt.toDate().toLocaleString("tr-TR")}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#d8c7b8]">
                    {comment.text}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#8d7462]">
                    <Link
                      href={`/albums/${comment.albumId}`}
                      className="inline-flex items-center gap-1 rounded-full border border-[#433126] px-2 py-1 transition hover:border-[#E8611A]/70 hover:text-[#ff8a45]"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      Albüme git
                    </Link>
                    {comment.photoId && (
                      <span className="rounded-full border border-[#433126] px-2 py-1">
                        Fotoğraf: {comment.photoId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
