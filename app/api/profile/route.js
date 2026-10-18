import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin, unauthorized, fail } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { profileSchema, clean } from "@/lib/schema";

export async function GET() {
  return NextResponse.json(await getProfile());
}

export async function PUT(req) {
  if (!(await isAdmin())) return unauthorized();
  const { doc, error } = clean(profileSchema, await req.json());
  if (error) return fail(error, 400);
  try {
    await (await getDb()).collection("settings").updateOne({ _id: "profile" }, { $set: doc }, { upsert: true });
    return NextResponse.json(doc);
  } catch (e) {
    return fail(e);
  }
}
