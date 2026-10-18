import { getDb } from "@/lib/db";
import { site } from "@/lib/site";

export async function getProfile() {
  try {
    const db = await getDb();
    const doc = await db.collection("settings").findOne({ _id: "profile" }, { projection: { _id: 0 } });
    return { ...site, ...doc };
  } catch {
    return site;
  }
}
