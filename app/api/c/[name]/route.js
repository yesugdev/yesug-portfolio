import { NextResponse } from "next/server";
import { getDb, list } from "@/lib/db";
import { isAdmin, unauthorized, fail } from "@/lib/auth";
import { collections, clean } from "@/lib/schema";

export async function GET(req, { params }) {
  const { name } = await params;
  if (!collections[name]) return fail("Not found", 404);
  try {
    return NextResponse.json(await list(name));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req, { params }) {
  if (!(await isAdmin())) return unauthorized();
  const { name } = await params;
  if (!collections[name]) return fail("Not found", 404);
  const { doc, error } = clean(collections[name].fields, await req.json());
  if (error) return fail(error, 400);
  try {
    doc.createdAt = new Date();
    const { insertedId } = await (await getDb()).collection(name).insertOne(doc);
    return NextResponse.json({ ...doc, _id: insertedId.toString() });
  } catch (e) {
    return fail(e);
  }
}
