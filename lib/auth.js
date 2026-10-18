import { cookies } from "next/headers";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

export const token = () =>
  createHash("sha256").update("portfolio:" + (process.env.ADMIN_PASSWORD || "")).digest("hex");

export async function isAdmin() {
  return Boolean(process.env.ADMIN_PASSWORD) && (await cookies()).get("admin")?.value === token();
}

export const unauthorized = () => NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
export const fail = (e, status = 500) => NextResponse.json({ error: e.message || e }, { status });
