export default function robots() {
  const url = process.env.SITE_URL || "http://localhost:3000";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }, sitemap: `${url}/sitemap.xml` };
}
