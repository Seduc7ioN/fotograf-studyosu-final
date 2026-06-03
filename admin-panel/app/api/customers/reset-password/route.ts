import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-api-auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "E-posta gerekli." }, { status: 400 });
    }

    const link = await getAdminAuth().generatePasswordResetLink(email);
    return NextResponse.json({ link });
  } catch (error: any) {
    console.error("resetPasswordLink error:", error);

    if (error.message === "Yetkisiz istek." || error.message === "Admin yetkisi gerekli.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    if (error.code === "auth/user-not-found") {
      return NextResponse.json({ message: "Bu e-posta ile müşteri bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ message: "Şifre yenileme linki oluşturulamadı." }, { status: 400 });
  }
}
