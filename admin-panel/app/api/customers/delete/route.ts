import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-api-auth";

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { uid } = await req.json();
    if (!uid) {
      return NextResponse.json(
        { message: "Silinecek müşteri bulunamadı." },
        { status: 400 }
      );
    }

    await Promise.all([
      getAdminAuth().deleteUser(uid),
      getAdminDb().collection("users").doc(uid).delete(),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("deleteCustomer error:", error);

    if (error.message === "Yetkisiz istek." || error.message === "Admin yetkisi gerekli.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Müşteri silinemedi." },
      { status: 400 }
    );
  }
}
