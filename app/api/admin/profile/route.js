import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, avatar, bio, description, address, whatsappNumber, operationalHours, employees } = await req.json();
    const store = await getDefaultStore();

    if (!store) {
      return NextResponse.json({ message: "Store belum tersedia" }, { status: 404 });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    const employeeItems = Array.isArray(employees)
      ? employees
          .map((item) => ({
            name: String(item?.name || "").trim(),
            role: String(item?.role || "").trim() || null,
            phone: String(item?.phone || "").trim() || null
          }))
          .filter((item) => item.name)
      : [];

    const [user, updatedStore] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: updateData
      }),
      prisma.store.update({
        where: { id: store.id },
        data: {
          bio: String(bio || "").trim() || null,
          description: String(description || "").trim() || null,
          address: String(address || "").trim() || null,
          whatsappNumber: String(whatsappNumber || "").trim() || null,
          operationalHours: String(operationalHours || "").trim() || null,
          employees: {
            deleteMany: {},
            create: employeeItems
          }
        },
        include: {
          employees: {
            orderBy: { createdAt: "asc" }
          }
        }
      })
    ]);

    return NextResponse.json({
      message: "Profile updated successfully",
      user: { name: user.name, email: user.email, avatar: user.avatar },
      store: {
        bio: updatedStore.bio,
        description: updatedStore.description,
        address: updatedStore.address,
        whatsappNumber: updatedStore.whatsappNumber,
        operationalHours: updatedStore.operationalHours,
        employees: updatedStore.employees
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Gagal memperbarui profil" }, { status: 500 });
  }
}
