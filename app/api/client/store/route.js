import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await getDefaultStore();
    if (!store) {
      return Response.json({ message: "Store not found" }, { status: 404 });
    }

    const paymentSettings = await prisma.paymentSettings.findFirst({
      where: { storeId: store.id },
    });

    return Response.json({
      store,
      paymentSettings,
    });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
