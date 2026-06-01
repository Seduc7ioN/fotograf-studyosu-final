import { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer (.+)$/);

  if (!match) {
    throw new Error("Yetkisiz istek.");
  }

  const decoded = await getAdminAuth().verifyIdToken(match[1]);
  if (decoded.role !== "admin") {
    throw new Error("Admin yetkisi gerekli.");
  }

  return decoded;
}
