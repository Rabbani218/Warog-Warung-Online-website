import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findStore } from "@/lib/store";

export const dynamic = "force-dynamic";

function slugify(value) {
  return String(value || "wareb").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function createSetup(formData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const storeName = String(formData.get("storeName") || "").trim();

  if (!name || !email || !password || !storeName) {
    throw new Error("Semua field wajib diisi.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email sudah terdaftar. Silakan gunakan email lain.");
  }

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "ADMIN"
    }
  });

  await prisma.store.create({
    data: {
      ownerId: user.id,
      name: storeName,
      slug: slugify(storeName),
      heroTitle: `${storeName} - Pesan cepat, bayar mudah`,
      heroSubtitle: "Selamat datang di kasir digital F&B Anda."
    }
  });

  redirect("/admin");
}

export default async function SetupPage() {
  const store = await findStore();
  if (store) {
    redirect("/");
  }

  return (
    <main className="container" style={{ padding: "2rem 0", minHeight: "100vh" }}>
      <section className="panel" style={{ maxWidth: 620, margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <p className="badge">Wareb V2 Onboarding</p>
            <h1 style={{ margin: "0.75rem 0 0", fontFamily: '"Segoe UI", sans-serif' }}>Buat Toko & Admin</h1>
          </div>
          <div style={{ textAlign: "right", color: "#6b7280", fontSize: "0.95rem" }}>
            <p>Platform POS + E-Commerce F&B</p>
            <p>Setup wizard profesional untuk pemilik warkop.</p>
          </div>
        </div>

        <form action={createSetup} className="grid" style={{ gap: "1rem" }}>
          <label className="field">
            <span>Nama Pemilik / Admin</span>
            <input name="name" className="input" placeholder="Ibu Siti" required />
          </label>

          <label className="field">
            <span>Email Admin</span>
            <input name="email" type="email" className="input" placeholder="admin@warteg.com" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input name="password" type="password" className="input" placeholder="••••••••" minLength={8} required />
          </label>

          <label className="field">
            <span>Nama Toko</span>
            <input name="storeName" className="input" placeholder="Warteg Bahari" required />
          </label>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <p style={{ margin: 0, color: "#475569" }}>Setelah selesai, Anda akan diarahkan ke dashboard admin.</p>
            <button type="submit" className="btn" style={{ minWidth: 170 }}>Mulai Setup</button>
          </div>
        </form>
      </section>
    </main>
  );
}
