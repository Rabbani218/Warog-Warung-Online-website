import ClientProfileForm from "@/components/ProfileForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ClientProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#fffdfd] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#FF6B6B] font-bold text-sm transition-colors group"
        >
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:border-[#FF6B6B]/20 transition-all">
            <ArrowLeft size={16} />
          </div>
          Kembali ke Beranda
        </Link>
      </div>

      <ClientProfileForm />
    </main>
  );
}
