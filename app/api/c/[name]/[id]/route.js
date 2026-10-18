import { NextResponse } from "next/server";
import { getDb, toId } from "@/lib/db";
import { isAdmin, unauthorized, fail } from "@/lib/auth";
import { collections, clean } from "@/lib/schema";

async function target(params) {
  const { name, id } = await params;
  return { name, _id: collections[name] && toId(id), id };
}

export async function PUT(req, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { name, _id, id } = await target(params);
  if (!_id) return fail("Not found", 404);
  const { doc, error } = clean(collections[name].fields, await req.json());
  if (error) return fail(error, 400);
  try {
    await (await getDb()).collection(name).updateOne({ _id }, { $set: doc });
    return NextResponse.json({ ...doc, _id: id });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { name, _id } = await target(params);
  if (!_id) return fail("Not found", 404);
  try {
    await (await getDb()).collection(name).deleteOne({ _id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
