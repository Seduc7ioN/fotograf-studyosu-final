import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/admin-api-auth";
import { getAdminDb } from "@/lib/firebase-admin";

const SETTINGS_COLLECTION = "app_settings";
const SETTINGS_DOC = "studio";

const defaultSettings = {
  studioName: "Lume Art Wedding",
  contactEmail: "",
  phone: "0 533 603 43 16",
  address: "",
  website: "https://www.instagram.com/lumeartwedding",
  instagramUrl: "https://www.instagram.com/lumeartwedding",
  defaultDownloadEnabled: true,
  defaultAlbumExpiryDays: 30,
  maxUploadSizeMB: 30,
};

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const doc = await getAdminDb()
      .collection(SETTINGS_COLLECTION)
      .doc(SETTINGS_DOC)
      .get();

    return NextResponse.json({
      ...defaultSettings,
      contactEmail: admin.email || defaultSettings.contactEmail,
      ...(doc.exists ? doc.data() : {}),
    });
  } catch (error: any) {
    console.error("getSettings error:", error);

    if (error.message === "Yetkisiz istek." || error.message === "Admin yetkisi gerekli.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Ayarlar okunamadı." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();

    const settings = {
      studioName: String(body.studioName || "").trim(),
      contactEmail: String(body.contactEmail || "").trim(),
      phone: String(body.phone || "").trim(),
      address: String(body.address || "").trim(),
      website: String(body.website || "").trim(),
      instagramUrl: String(body.instagramUrl || "").trim(),
      defaultDownloadEnabled: Boolean(body.defaultDownloadEnabled),
      defaultAlbumExpiryDays: Number(body.defaultAlbumExpiryDays || 30),
      maxUploadSizeMB: Number(body.maxUploadSizeMB || 30),
    };

    if (!settings.studioName) {
      return NextResponse.json(
        { message: "Stüdyo adı boş olamaz." },
        { status: 400 }
      );
    }

    await getAdminDb()
      .collection(SETTINGS_COLLECTION)
      .doc(SETTINGS_DOC)
      .set(
        {
          ...settings,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true, settings });
  } catch (error: any) {
    console.error("updateSettings error:", error);

    if (error.message === "Yetkisiz istek." || error.message === "Admin yetkisi gerekli.") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Ayarlar kaydedilemedi." },
      { status: 400 }
    );
  }
}
