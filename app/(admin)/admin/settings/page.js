import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import PaymentSettingsForm from "@/components/PaymentSettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <main className="container" style={{ padding: "1rem 0 2rem" }}>
      <header className="panel" style={{ padding: "1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span className="badge">Payment Configuration</span>
          <h1 style={{ margin: "0.35rem 0 0", fontFamily: '"Segoe Print", cursive' }}>Pengaturan Pembayaran</h1>
        </div>
        <nav style={{ display: "flex", gap: "0.5rem" }}>
          <a className="btn" href="/admin/dashboard">Dashboard</a>
          <a className="btn" href="/admin/products">Products & Ads</a>
          <a className="btn" href="/admin/settings">Settings</a>
          <a className="btn" href="/admin/kds">KDS</a>
        </nav>
      </header>

      <PaymentSettingsForm />
    </main>
  );
}
