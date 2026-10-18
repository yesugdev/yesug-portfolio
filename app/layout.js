import "./globals.css";
import { getProfile } from "@/lib/profile";

// SITE_URL буруу бичигдсэн ч сайт унахгүй
function siteUrl() {
  try {
    return new URL(process.env.SITE_URL);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export async function generateMetadata() {
  const site = await getProfile();
  const title = `${site.name} — ${site.role?.split(",")[0].trim()}`;
  return {
    metadataBase: siteUrl(),
    title,
    description: site.about,
    openGraph: { title, description: site.about, type: "website", images: site.avatar ? [site.avatar] : [] },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
