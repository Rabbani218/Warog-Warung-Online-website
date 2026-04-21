const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "owner@wareb.local";
  const passwordHash = await bcrypt.hash("wareb12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Owner Wareb",
      passwordHash,
      role: "ADMIN"
    },
    create: {
      name: "Owner Wareb",
      email: adminEmail,
      passwordHash,
      role: "ADMIN"
    }
  });

  const store = await prisma.store.upsert({
    where: { slug: "wareb-modern" },
    update: {
      ownerId: admin.id,
      name: "Warteg Modern Wareb",
      heroTitle: "Diskon Nampan Siang",
      heroSubtitle: "Rasa rumahan, checkout digital."
    },
    create: {
      ownerId: admin.id,
      name: "Warteg Modern Wareb",
      slug: "wareb-modern",
      description: "POS multi-portal dengan UI warteg modern",
      heroTitle: "Diskon Nampan Siang",
      heroSubtitle: "Rasa rumahan, checkout digital.",
      bankAccountNumber: "1234567890",
      paymentGatewayKey: "sandbox-key"
    }
  });

  await prisma.banner.createMany({
    data: [
      {
        storeId: store.id,
        title: "Paket Hemat Pagi",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
        targetUrl: "/?promo=pagi",
        sortOrder: 1,
        isActive: true
      },
      {
        storeId: store.id,
        title: "Combo Lauk Favorit",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
        targetUrl: "/?promo=combo",
        sortOrder: 2,
        isActive: true
      }
    ],
    skipDuplicates: true
  });

  const nasi = await prisma.menu.upsert({
    where: { storeId_slug: { storeId: store.id, slug: "nasi-goreng-kampung" } },
    update: {
      name: "Nasi Goreng Kampung",
      price: 22000
    },
    create: {
      storeId: store.id,
      name: "Nasi Goreng Kampung",
      slug: "nasi-goreng-kampung",
      description: "Aroma bawang kuat dengan sambal terpisah",
      imageUrl: "https://images.unsplash.com/photo-1604908554027-6e4081b9f6f7?auto=format&fit=crop&w=900&q=80",
      price: 22000,
      isActive: true
    }
  });

  const ayam = await prisma.menu.upsert({
    where: { storeId_slug: { storeId: store.id, slug: "ayam-geprek-warung" } },
    update: {
      name: "Ayam Geprek Warung",
      price: 25000
    },
    create: {
      storeId: store.id,
      name: "Ayam Geprek Warung",
      slug: "ayam-geprek-warung",
      description: "Level pedas bisa dicustom",
      imageUrl: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80",
      price: 25000,
      isActive: true
    }
  });

  const [beras, ayamRaw, cabai] = await Promise.all([
    prisma.ingredient.upsert({
      where: { id: "seed-beras" },
      update: {},
      create: { id: "seed-beras", storeId: store.id, name: "Beras", unit: "gram", stockQty: 30000, minimumStock: 5000 }
    }),
    prisma.ingredient.upsert({
      where: { id: "seed-ayam" },
      update: {},
      create: { id: "seed-ayam", storeId: store.id, name: "Ayam Fillet", unit: "gram", stockQty: 16000, minimumStock: 3000 }
    }),
    prisma.ingredient.upsert({
      where: { id: "seed-cabai" },
      update: {},
      create: { id: "seed-cabai", storeId: store.id, name: "Cabai", unit: "gram", stockQty: 7000, minimumStock: 1500 }
    })
  ]);

  await prisma.recipe.upsert({
    where: { menuId_ingredientId: { menuId: nasi.id, ingredientId: beras.id } },
    update: { qtyNeeded: 180 },
    create: { menuId: nasi.id, ingredientId: beras.id, qtyNeeded: 180 }
  });

  await prisma.recipe.upsert({
    where: { menuId_ingredientId: { menuId: ayam.id, ingredientId: ayamRaw.id } },
    update: { qtyNeeded: 200 },
    create: { menuId: ayam.id, ingredientId: ayamRaw.id, qtyNeeded: 200 }
  });

  await prisma.recipe.upsert({
    where: { menuId_ingredientId: { menuId: ayam.id, ingredientId: cabai.id } },
    update: { qtyNeeded: 35 },
    create: { menuId: ayam.id, ingredientId: cabai.id, qtyNeeded: 35 }
  });

  console.log("Seed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
