// SITE_URL нь ажиллах үед (.env) уншигдах ёстой тул build үед статик болгохгүй
export const dynamic = "force-dynamic";

export default function robots() {
  const url = process.env.SITE_URL || "http://localhost:3000";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }, sitemap: `${url}/sitemap.xml` };
}
