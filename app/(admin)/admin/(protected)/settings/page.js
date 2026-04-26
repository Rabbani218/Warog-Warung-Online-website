import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
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
        <AdminHeader 
          badge="Payment & Settings"
          title={<>Pengaturan <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600">Sistem</span></>}
          description="Konfigurasi metode pembayaran, QRIS, dan pengaturan operasional lainnya untuk toko Anda."
          badgeColor="amber"
        />

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
