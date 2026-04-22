import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminMotionShell from "@/components/AdminMotionShell";

export default async function AdminProtectedLayout({ children }) {
  const session = await getServerSession(authOptions);

  // ── GUARD: No session OR not ADMIN → kick to public login page ──
  // IMPORTANT: redirect to /admin (the login page), NOT to / or /setup
  // This prevents loops because /admin is outside this (protected) group
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin");
  }

  return <AdminMotionShell>{children}</AdminMotionShell>;
}
