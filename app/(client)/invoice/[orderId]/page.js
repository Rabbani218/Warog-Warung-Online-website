import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        details: {
          include: {
            menu: true
          }
        },
        invoice: true,
        koticket: true
      }
    });

    if (!order) {
      notFound();
    }

    const trackLabel = order.status === "COMPLETED" ? "Selesai" : order.status === "PROCESSING" ? "Dimasak" : "Pending";
    const kotStatus = order.koticket?.status || "NEW";

    return (
      <main className="container" style={{ padding: "2rem 0" }}>
        <section className="panel" style={{ padding: "1rem", maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ marginTop: 0, fontFamily: '"Segoe Print", cursive' }}>Invoice Digital</h1>
          <p>Invoice: <strong>{order.invoice?.invoiceNumber}</strong></p>
          <p>Order: <strong>{order.orderCode}</strong></p>
          <p>Status Pesanan: <span className="badge">{trackLabel}</span></p>
          <p>Status Dapur: <span className="badge">{kotStatus}</span></p>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Menu</th>
                <th align="right">Qty</th>
                <th align="right">Harga</th>
              </tr>
            </thead>
            <tbody>
              {order.details.map((detail) => (
                <tr key={detail.id}>
                  <td>{detail.menu.name}</td>
                  <td align="right">{detail.quantity}</td>
                  <td align="right">Rp {Number(detail.lineTotal).toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr style={{ borderColor: "#fde7c2", margin: "1rem 0" }} />
          <p>Subtotal: Rp {Number(order.subTotal).toLocaleString("id-ID")}</p>
          <p>PPN: Rp {Number(order.taxAmount).toLocaleString("id-ID")}</p>
          <p><strong>Grand Total: Rp {Number(order.grandTotal).toLocaleString("id-ID")}</strong></p>
        </section>
      </main>
    );
  } catch (error) {
    console.error("Invoice Page Error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-bold">Gagal Memuat Invoice</h2>
        <p className="text-gray-600">Terjadi kesalahan saat mengambil data pesanan.</p>
      </div>
    );
  }
}
