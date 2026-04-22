import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdForm from "@/components/AdForm";

export const dynamic = "force-dynamic";

export default async function CreateAdPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <main className="w-full min-h-screen">
      <AdForm />
    </main>
  );
}
