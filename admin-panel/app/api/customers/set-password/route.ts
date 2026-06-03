import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-api-auth";

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { uid, password } = await req.json();
    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ message: "Müşteri ID gerekli." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { message: "Şifre en az 6 karakter olmalı." },
        { status: 400 }
      );
    }

    await getAdminAuth().updateUser(uid, { password });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("setCustomerPassword error:", error);

    if (error.message === "Yetkisiz istek." || error.message === "Admin yetkisi gerekli.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Müşteri şifresi güncellenemedi." },
      { status: 400 }
    );
  }
}
