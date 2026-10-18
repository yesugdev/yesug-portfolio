import { getProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const url = process.env.SITE_URL || "http://localhost:3000";
  const site = await getProfile();
  return [{ url, lastModified: new Date() }, ...(site.aboutLong ? [{ url: `${url}/about`, lastModified: new Date() }] : [])];
}
