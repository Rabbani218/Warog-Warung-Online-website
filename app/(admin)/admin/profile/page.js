import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import AdminTopNav from "@/components/AdminTopNav";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, avatar: true }
  });

  const store = await getDefaultStore();
  const storeProfile = store
    ? await prisma.store.findUnique({
        where: { id: store.id },
        select: {
          bio: true,
          description: true,
          address: true,
          employees: {
            select: { id: true, name: true, role: true, phone: true },
            orderBy: { createdAt: "asc" }
          }
        }
      })
    : null;

  return (
    <main className="admin-shell" style={{ padding: "2rem 1rem" }}>
      <div className="w-full max-w-7xl mx-auto">
        <header style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <span className="badge">User Settings</span>
            <h1 className="retro-heading" style={{ margin: "0.5rem 0 0", fontSize: "1.8rem" }}>
              Profil Pengguna
            </h1>
          </div>
          <AdminTopNav currentPath="/admin/profile" />
        </header>

        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <ProfileForm
            initialData={{
              ...user,
              bio: storeProfile?.bio || "",
              description: storeProfile?.description || "",
              address: storeProfile?.address || "",
              employees: storeProfile?.employees || []
            }}
          />
        </div>
      </div>
    </main>
  );
}
