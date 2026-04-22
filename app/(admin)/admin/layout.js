import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminMotionShell from "@/components/AdminMotionShell";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Secure server-side protection
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin?error=Unauthorized&message=Akses+ditolak.+Silakan+login+sebagai+admin.");
  }

  return <AdminMotionShell>{children}</AdminMotionShell>;
}
