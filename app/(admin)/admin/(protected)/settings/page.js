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
    <main className="w-full min-h-screen">
      <div className="w-full space-y-8">
        <header className="mb-8">
          <div className="mb-4">
            <span className="badge">Payment & Settings</span>
            <h1 className="retro-heading mt-2 text-3xl font-bold">
              Pengaturan Sistem
            </h1>
          </div>
          <AdminTopNav currentPath="/admin/settings" />
        </header>

        <div className="w-full max-w-6xl mx-auto">
          <PaymentSettingsForm
            initialSettings={{
              ewalletNumber: payment?.ewalletNumber || "",
              bankAccount: payment?.bankAccount || "",
              qrisImageUrl: payment?.qrisImageUrl || ""
            }}
          />
        </div>
      </div>
    </main>
  );
}
