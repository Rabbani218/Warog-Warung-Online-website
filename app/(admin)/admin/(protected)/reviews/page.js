import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import { redirect } from "next/navigation";
import { Star, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kelola Ulasan | Admin Wareb"
};

export default async function AdminReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const store = await getDefaultStore();
  const reviews = await prisma.review.findMany({
    where: { menu: { storeId: store.id } },
    include: { 
      user: { select: { name: true, email: true } },
      menu: { select: { name: true, imageUrl: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="retro-heading m-0 text-2xl">Ulasan Pelanggan</h2>
        <span className="badge">{reviews.length} Ulasan Masuk</span>
      </div>

      <div className="glass-panel p-6">
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Belum ada ulasan dari pelanggan.</p>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <article key={review.id} className="glass-card p-4 flex flex-col md:flex-row gap-4 items-start border border-white/10">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <strong className="text-lg text-slate-800">{review.user?.name || review.user?.email || "Pengguna"}</strong>
                      <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 bg-black/5 p-2 rounded-lg inline-block text-sm text-gray-700">
                    <span className="font-semibold text-determination-red">{review.menu?.name}</span>
                  </div>

                  {review.comment && (
                    <div className="flex gap-2 text-gray-700">
                      <MessageSquare size={16} className="mt-1 flex-shrink-0 text-gray-400" />
                      <p className="m-0 leading-relaxed">{review.comment}</p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
