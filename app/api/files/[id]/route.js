import { getDb, toId } from "@/lib/db";

export async function GET(req, { params }) {
  const _id = toId((await params).id);
  const doc = _id && (await (await getDb()).collection("files").findOne({ _id }));
  if (!doc) return new Response("Not found", { status: 404 });
  return new Response(doc.data.buffer, {
    headers: {
      "Content-Type": doc.type,
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.name)}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
