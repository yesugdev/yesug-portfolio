import { NextResponse } from "next/server";
import { getDb, list } from "@/lib/db";
import { isAdmin, unauthorized, fail } from "@/lib/auth";

const fields = [
  { key: "name", max: 100 },
  { key: "email", max: 200 },
  { key: "message", max: 3000 },
];

// Холбоо барих формоос ирсэн мессежийг хадгална
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true }); // spam bot (далд талбар бөглөсөн)
  const doc = {};
  for (const f of fields) doc[f.key] = String(b[f.key] || "").trim().slice(0, f.max);
  if (!doc.name || !doc.message) return fail("Нэр болон мессежээ бичнэ үү", 400);
  if (!/^\S+@\S+\.\S+$/.test(doc.email)) return fail("Email хаяг буруу байна", 400);
  try {
    doc.createdAt = new Date();
    await (await getDb()).collection("messages").insertOne(doc);
    return NextResponse.json({ ok: true });
  } catch {
    return fail("Илгээж чадсангүй. Дараа дахин оролдоно уу.");
  }
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    return NextResponse.json(await list("messages"));
  } catch (e) {
    return fail(e);
  }
}
