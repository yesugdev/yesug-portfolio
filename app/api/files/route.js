import { NextResponse } from "next/server";
import { Binary } from "mongodb";
import { getDb } from "@/lib/db";
import { isAdmin, unauthorized, fail } from "@/lib/auth";

// SVG-г зөвшөөрөхгүй (дотор нь script байж болно)
const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
const MAX = 4 * 1024 * 1024;

export async function POST(req) {
  if (!(await isAdmin())) return unauthorized();
  const file = (await req.formData().catch(() => null))?.get("file");
  if (!file || typeof file === "string") return fail("Файл сонгоно уу", 400);
  if (!allowed.includes(file.type)) return fail("Зөвхөн JPG, PNG, WEBP, GIF эсвэл PDF", 400);
  if (file.size > MAX) return fail("Файл 4MB-аас бага байх ёстой", 400);
  try {
    const { insertedId } = await (await getDb()).collection("files").insertOne({
      name: file.name,
      type: file.type,
      size: file.size,
      data: new Binary(Buffer.from(await file.arrayBuffer())),
      createdAt: new Date(),
    });
    return NextResponse.json({ url: `/api/files/${insertedId}` });
  } catch (e) {
    return fail(e);
  }
}
