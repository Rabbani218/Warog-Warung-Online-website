"use client";

import { useEffect, useMemo, useState } from "react";

async function fetchQueue() {
  const response = await fetch("/api/admin/kot", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Gagal mengambil antrean KOT.");
  }
  return response.json();
}

export default function KdsRealtimeBoard({ initialQueue }) {
  const [queue, setQueue] = useState(initialQueue || []);
  const [status, setStatus] = useState("Menghubungkan stream...");

  useEffect(() => {
    let pollingId;
    let source;

    const start = async () => {
      try {
        source = new EventSource("/api/admin/kot/stream", { withCredentials: true });

        source.addEventListener("connected", () => {
          setStatus("Realtime aktif.");
        });

        source.addEventListener("kot-update", async () => {
          const fresh = await fetchQueue();
          setQueue(fresh);
        });

        source.onerror = async () => {
          setStatus("Stream terputus, fallback polling.");
          if (source) {
            source.close();
          }

          pollingId = setInterval(async () => {
            try {
              const fresh = await fetchQueue();
              setQueue(fresh);
            } catch (_error) {
              setStatus("Polling gagal, mencoba ulang...");
            }
          }, 5000);
        };
      } catch (_error) {
        setStatus("Realtime gagal, fallback polling.");
      }
    };

    start();

    return () => {
      if (source) source.close();
      if (pollingId) clearInterval(pollingId);
    };
  }, []);

  async function updateTicket(id, nextStatus) {
    const response = await fetch(`/api/admin/kot/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });

    if (!response.ok) {
      return;
    }

    const fresh = await fetchQueue();
    setQueue(fresh);
  }

  const counters = useMemo(() => {
    return queue.reduce(
      (acc, item) => {
        if (item.status === "NEW") acc.new += 1;
        if (item.status === "PROCESSING") acc.processing += 1;
        return acc;
      },
      { new: 0, processing: 0 }
    );
  }, [queue]);

  return (
    <section className="panel" style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Kitchen Display System (Realtime)</h3>
        <span className="badge">{status}</span>
      </div>

      <p style={{ color: "#6b7280" }}>
        NEW: <strong>{counters.new}</strong> | PROCESSING: <strong>{counters.processing}</strong>
      </p>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
        {queue.map((ticket) => (
          <article key={ticket.id} className="panel" style={{ padding: "0.8rem" }}>
            <strong>{ticket.order.orderCode}</strong>
            <p style={{ margin: "0.2rem 0", color: "#6b7280" }}>Meja: {ticket.order.tableNumber || "-"}</p>
            <span className="badge">{ticket.status}</span>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.7rem" }}>
              <button className="btn" onClick={() => updateTicket(ticket.id, "PROCESSING")}>PROCESSING</button>
              <button className="btn" onClick={() => updateTicket(ticket.id, "DONE")}>DONE</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
