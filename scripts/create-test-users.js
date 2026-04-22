const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  // Create Client Test User
  await prisma.user.upsert({
    where: { email: "test@wareb.com" },
    update: {},
    create: {
      email: "test@wareb.com",
      name: "Robot Client",
      passwordHash,
      role: "CLIENT",
    },
  });

  // Create Admin Test User
  const admin = await prisma.user.upsert({
    where: { email: "admin@wareb.com" },
    update: {},
    create: {
      email: "admin@wareb.com",
      name: "Robot Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // Ensure a store exists for the admin
  const store = await prisma.store.upsert({
    where: { slug: "robot-store" },
    update: {},
    create: {
      ownerId: admin.id,
      name: "Robot Store",
      slug: "robot-store",
    },
  });

  console.log("Test users created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
