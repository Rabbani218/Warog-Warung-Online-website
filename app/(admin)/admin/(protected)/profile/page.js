import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import AdminTopNav from "@/components/AdminTopNav";
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
        <header style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <span className="badge">Business Settings</span>
            <h1 className="retro-heading" style={{ margin: "0.5rem 0 0", fontSize: "1.8rem" }}>
              Pengaturan Toko
            </h1>
          </div>
          <AdminTopNav currentPath="/admin/profile" />
        </header>

        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <StoreSettingsForm
            initialData={storeProfile}
          />
        </div>
      </div>
    </main>
  );
}
