import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import AdminHeader from "@/components/AdminHeader";
import StoreSettingsForm from "@/components/StoreSettingsForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const store = await getDefaultStore();
  const storeProfile = store
    ? await prisma.store.findUnique({
        where: { id: store.id },
        select: {
          name: true,
          bio: true,
          address: true,
          whatsappNumber: true,
        }
      })
    : null;

  return (
    <main className="admin-shell" style={{ padding: "2rem 1rem" }}>
      <div className="w-full max-w-7xl mx-auto">
        <AdminHeader 
          badge="Business Settings"
          title={<>Pengaturan <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600">Toko</span></>}
          description="Kelola informasi dasar toko Anda, bio, alamat, dan nomor WhatsApp untuk mempermudah komunikasi pelanggan."
          badgeColor="indigo"
        />

        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <StoreSettingsForm
            initialData={storeProfile}
          />
        </div>
      </div>
    </main>
  );
}
