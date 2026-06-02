"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { studioBrand } from "@/lib/brand";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  rememberMe: z.boolean(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("studio-admin-email");
    if (savedEmail === "eserulag@gmail.com") {
      window.localStorage.removeItem("studio-admin-email");
      return;
    }
    if (savedEmail) {
      setValue("email", savedEmail);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password, data.rememberMe);
      if (data.rememberMe) {
        window.localStorage.setItem("studio-admin-email", data.email);
      } else {
        window.localStorage.removeItem("studio-admin-email");
      }
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Giriş başarısız.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1d140e] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(232,97,26,0.18),transparent_28rem),radial-gradient(circle_at_8%_85%,rgba(232,97,26,0.09),transparent_24rem)]" />
      <div className="absolute left-1/2 top-0 h-px w-72 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#E8611A] to-transparent opacity-70" />

      <div className="relative w-full max-w-[420px] rounded-[28px] border border-[#4a3529] bg-[#1f1813]/95 px-9 py-10 shadow-[0_0_80px_rgba(232,97,26,0.13)] backdrop-blur">
        <div className="mb-8 text-center">
          <Image
            src="/lumeart-mark.svg"
            alt={studioBrand.name}
            width={260}
            height={160}
            priority
            className="mx-auto h-36 w-auto object-contain"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8d7462]">
              E-posta
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="lumeartwedding@gmail.com"
              className="w-full rounded-lg border border-[#6d5444] bg-[#f8f5f0] px-4 py-3 text-[#2b1d15] placeholder-[#82756c] outline-none transition focus:border-[#E8611A] focus:ring-2 focus:ring-[#E8611A]/35"
            />
            {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8d7462]">
              Şifre
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#6d5444] bg-[#f8f5f0] px-4 py-3 pr-11 text-[#2b1d15] placeholder-[#82756c] outline-none transition focus:border-[#E8611A] focus:ring-2 focus:ring-[#E8611A]/35"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d5444] hover:text-[#2b1d15]"
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-[#b9a99b]">
            <input
              {...register("rememberMe")}
              type="checkbox"
              className="h-4 w-4 rounded border-[#6d5444] bg-[#211813] text-[#E8611A] focus:ring-[#E8611A] focus:ring-offset-0"
            />
            Beni hatırla
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8611A] px-4 py-3 text-sm font-bold uppercase tracking-[0.28em] text-[#170f0a] transition hover:bg-[#ff7a32] disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Giriş yapılıyor...
              </>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#6f5848]">© 2026 {studioBrand.name}</p>
      </div>
    </div>
  );
}
