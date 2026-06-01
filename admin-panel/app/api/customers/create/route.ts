import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { role: "customer" });

    await adminDb.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      name,
      email,
      phone: phone ?? null,
      role: "customer",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ uid: userRecord.uid }, { status: 201 });
  } catch (error: any) {
    console.error("createCustomer error:", error);

    let message = "Musteri olusturulamadi.";
    if (error.code === "auth/email-already-exists") {
      message = "Bu e-posta adresi zaten kayitli.";
    } else if (error.code === "auth/invalid-email") {
      message = "Gecersiz e-posta adresi.";
    } else if (error.code === "auth/weak-password") {
      message = "Sifre cok zayif. En az 6 karakter kullanin.";
    }

    return NextResponse.json({ message }, { status: 400 });
  }
}
