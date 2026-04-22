import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdForm from "@/components/AdForm";

export const dynamic = "force-dynamic";

export default async function EditAdPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const ad = await prisma.banner.findUnique({
    where: { id: params.id }
  });

  if (!ad) notFound();

  return (
    <main className="w-full min-h-screen">
      <AdForm initialData={JSON.parse(JSON.stringify(ad))} />
    </main>
  );
}
