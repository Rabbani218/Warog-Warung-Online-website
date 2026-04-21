import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminTopNav from "@/components/AdminTopNav";
import PaymentSettingsForm from "@/components/PaymentSettingsForm";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const store = await getDefaultStore();
  const payment = store
    ? await prisma.paymentSettings.findUnique({
        where: { storeId: store.id }
      })
    : null;

  return (
    <main className="admin-shell" style={{ padding: "2rem 1rem" }}>
      <div className="w-full max-w-7xl mx-auto">
        <header style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <span className="badge">Payment & Settings</span>
            <h1 className="retro-heading" style={{ margin: "0.5rem 0 0", fontSize: "1.8rem" }}>
              Pengaturan Sistem
            </h1>
          </div>
          <AdminTopNav currentPath="/admin/settings" />
        </header>

        <PaymentSettingsForm
          initialSettings={{
            ewalletNumber: payment?.ewalletNumber || "",
            bankAccount: payment?.bankAccount || "",
            qrisImageUrl: payment?.qrisImageUrl || ""
          }}
        />
      </div>
    </main>
  );
}
