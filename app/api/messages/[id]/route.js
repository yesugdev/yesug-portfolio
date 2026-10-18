import { NextResponse } from "next/server";
import { getDb, toId } from "@/lib/db";
import { isAdmin, unauthorized, fail } from "@/lib/auth";

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const _id = toId((await params).id);
  if (!_id) return fail("Not found", 404);
  await (await getDb()).collection("messages").deleteOne({ _id });
  return NextResponse.json({ ok: true });
}
