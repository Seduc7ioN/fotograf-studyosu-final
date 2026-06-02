"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { studioBrand } from "@/lib/brand";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("studio-admin-email");
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/lumeart-logo.svg"
            alt={studioBrand.name}
            width={320}
            height={124}
            priority
            className="mx-auto mb-5 h-24 w-auto rounded-xl bg-white object-contain p-3"
          />
          <h1 className="text-2xl font-bold text-white">{studioBrand.adminTitle}</h1>
          <p className="text-gray-400 mt-1">{studioBrand.panelSubtitle} girişi yapın</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                E-posta
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="admin@studyo.com"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg
                           text-white placeholder-gray-500 focus:outline-none
                           focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                           transition-colors"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 bg-gray-800 border border-gray-700 rounded-lg
                             text-white placeholder-gray-500 focus:outline-none
                             focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                             transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                {...register("rememberMe")}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-amber-500
                           focus:ring-amber-500 focus:ring-offset-0"
              />
              Beni hatırla
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50
                         text-white font-semibold rounded-lg transition-colors
                         flex items-center justify-center gap-2"
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
        </div>
      </div>
    </div>
  );
}
