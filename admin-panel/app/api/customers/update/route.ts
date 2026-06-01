import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-api-auth";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { uid, name, email, phone } = await req.json();
    if (!uid || !name || !email) {
      return NextResponse.json(
        { message: "Eksik müşteri bilgisi." },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    await adminAuth.updateUser(uid, {
      email,
      displayName: name,
    });

    await adminDb.collection("users").doc(uid).update({
      name,
      email,
      phone: phone || null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("updateCustomer error:", error);

    if (error.message === "Yetkisiz istek." || error.message === "Admin yetkisi gerekli.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    let message = "Müşteri güncellenemedi.";
    if (error.code === "auth/email-already-exists") {
      message = "Bu e-posta adresi zaten kayıtlı.";
    } else if (error.code === "auth/invalid-email") {
      message = "Geçersiz e-posta adresi.";
    }

    return NextResponse.json({ message }, { status: 400 });
  }
}
