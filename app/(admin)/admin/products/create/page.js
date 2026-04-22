import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function CreateProductPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <main className="w-full min-h-screen">
      <ProductForm />
    </main>
  );
}
