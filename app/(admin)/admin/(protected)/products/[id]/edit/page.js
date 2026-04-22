import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const product = await prisma.menu.findUnique({
    where: { id: params.id }
  });

  if (!product) notFound();

  return (
    <main className="w-full min-h-screen">
      <ProductForm initialData={JSON.parse(JSON.stringify(product))} />
    </main>
  );
}
