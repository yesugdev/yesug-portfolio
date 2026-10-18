import { isAdmin } from "@/lib/auth";
import { Login, Dashboard } from "./client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  const warn = !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "change-me";
  return (
    <main className="container admin">
      {warn && <p className="notice">.env.local дотор ADMIN_PASSWORD-оо өөрчилнө үү.</p>}
      {(await isAdmin()) ? <Dashboard /> : <Login />}
    </main>
  );
}
