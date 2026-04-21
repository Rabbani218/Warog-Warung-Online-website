import { prisma } from "@/lib/prisma";

export async function getDefaultStore() {
  let store = await prisma.store.findFirst({ orderBy: { createdAt: "asc" } });

  if (!store) {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

    if (!admin) {
      return null;
    }

    store = await prisma.store.create({
      data: {
        ownerId: admin.id,
        name: "Warteg Modern Wareb",
        slug: "wareb-modern"
      }
    });
  }

  return store;
}
