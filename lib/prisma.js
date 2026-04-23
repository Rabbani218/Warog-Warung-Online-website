import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Verify connection on startup (only in development)
if (process.env.NODE_ENV === "development") {
  prisma.$connect()
    .then(() => console.log("✓ Database connected successfully"))
    .catch((err) => console.error("✗ Database connection failed:", err.message));
}
