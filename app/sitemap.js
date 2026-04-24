import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://wareb-v2.vercel.app";

  // Base routes
  const routes = [
    "",
    "/admin",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic routes (products)
  try {
    const products = await prisma.menu.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const productRoutes = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...routes, ...productRoutes];
  } catch (_error) {
    // Keep sitemap generation graceful when DB is not reachable during deployment.
    return routes;
  }
}
