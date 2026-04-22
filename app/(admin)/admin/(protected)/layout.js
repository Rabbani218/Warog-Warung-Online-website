import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminMotionShell from "@/components/AdminMotionShell";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Secure server-side protection
  if (!session || session.user?.role !== "ADMIN") {
    // Redirect to home page instead of /admin to avoid infinite loops
    // especially if this layout is active for the login page.
    redirect("/?error=Unauthorized");
  }

  return <AdminMotionShell>{children}</AdminMotionShell>;
}
