import { prisma } from "@/lib/prisma";

export async function findStore() {
  try {
    return await prisma.store.findFirst({ orderBy: { createdAt: "asc" } });
  } catch (error) {
    console.error("Prisma connection error in findStore:", error);
    return null;
  }
}

export async function getDefaultStore() {
  try {
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
  } catch (error) {
    console.error("Prisma connection error in getDefaultStore:", error);
    return null;
  }
}
