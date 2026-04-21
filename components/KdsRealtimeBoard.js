"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PdfReceiptButton from "@/components/PdfReceiptButton";
import { Clock, ChefHat, CheckCircle, AlertCircle } from "lucide-react";

async function fetchQueue() {
  const response = await fetch("/api/admin/kot", { cache: "no-store" });
  if (!response.ok) return [];
  const data = await response.json();
  // Filter out DONE tickets older than 1 hour to keep the board clean
  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return data.filter(t => !(t.status === "DONE" && new Date(t.createdAt) < anHourAgo));
}

export default function KdsRealtimeBoard({ initialQueue }) {
  const [queue, setQueue] = useState(initialQueue || []);
  const [status, setStatus] = useState("Menghubungkan stream...");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000); // update now every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let pollingId;
    let source;
    const start = async () => {
      try {
        source = new EventSource("/api/admin/kot/stream", { withCredentials: true });
        source.addEventListener("connected", () => setStatus("Realtime aktif"));
        source.addEventListener("kot-update", async () => {
          const fresh = await fetchQueue();
          setQueue(fresh);
        });
        source.onerror = () => {
          setStatus("Polling fallback");
          if (source) source.close();
          pollingId = setInterval(async () => {
            try {
              const fresh = await fetchQueue();
              setQueue(fresh);
            } catch (e) {}
          }, 5000);
        };
      } catch (e) {
        setStatus("Polling fallback");
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
    if (response.ok) {
      const fresh = await fetchQueue();
      setQueue(fresh);
    }
  }

  const columns = useMemo(() => {
    const cols = { NEW: [], PROCESSING: [], DONE: [] };
    queue.forEach(item => {
      if (cols[item.status]) cols[item.status].push(item);
    });
    return cols;
  }, [queue]);

  const TicketCard = ({ ticket }) => {
    const minutesOld = Math.floor((now - new Date(ticket.createdAt).getTime()) / 60000);
    const isDelayed = minutesOld >= 15 && ticket.status !== "DONE";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`glass-card ${isDelayed ? "kds-delay" : ""}`}
        style={{ padding: "1rem", marginBottom: "1rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
          <strong style={{ fontSize: "1.1rem" }}>{ticket.order.orderCode}</strong>
          {isDelayed && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.75rem",
                color: "#ef4444",
                fontWeight: "bold",
                padding: "0.35rem 0.6rem",
                background: "rgba(239, 68, 68, 0.15)",
                borderRadius: "4px"
              }}
            >
              <AlertCircle size={13} /> {minutesOld}m
            </span>
          )}
          {!isDelayed && <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{minutesOld}m</span>}
        </div>
        <p style={{ margin: "0.5rem 0", color: "#9ca3af", fontSize: "0.875rem" }}>
          Meja: <strong>{ticket.order.tableNumber || "-"}</strong>
        </p>

        {/* Render Order Details if available */}
        <div style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {ticket.order?.details?.map((d) => (
            <div key={d.id} style={{ fontSize: "0.875rem", display: "flex", justifyContent: "space-between" }}>
              <span>
                <span style={{ color: "#ff9a1a", fontWeight: "bold" }}>{d.quantity}x</span> {d.menu?.name || "Item"}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          {ticket.status === "NEW" && (
            <button
              className="btn"
              style={{ flex: 1, fontSize: "0.75rem", padding: "0.5rem" }}
              onClick={() => updateTicket(ticket.id, "PROCESSING")}
            >
              Masak
            </button>
          )}
          {ticket.status === "PROCESSING" && (
            <button
              className="btn"
              style={{
                flex: 1,
                fontSize: "0.75rem",
                padding: "0.5rem",
                background: "#10b981",
                borderColor: "#10b981"
              }}
              onClick={() => updateTicket(ticket.id, "DONE")}
            >
              Selesai
            </button>
          )}
          {ticket.status === "DONE" && (
            <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#10b981", width: "100%", textAlign: "center", padding: "0.5rem" }}>
              ✓ Siap Disajikan
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 className="retro-heading" style={{ margin: 0, fontSize: "1.5rem" }}>KDS Kanban</h2>
        <span style={{ fontSize: "0.75rem", color: "#9ca3af", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "9999px", background: "#10b981", animation: "pulse 2s infinite" }} />
          {status}
        </span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}>
        {/* Column: NEW */}
        <div className="glass-card" style={{ padding: "1rem", minHeight: "500px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#facc15" }}>
            <Clock size={18} />
            <h3 style={{ margin: 0, fontWeight: "bold", fontSize: "0.875rem", textTransform: "uppercase" }}>
              Antrean Masuk ({columns.NEW.length})
            </h3>
          </div>
          <AnimatePresence>{columns.NEW.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}</AnimatePresence>
        </div>

        {/* Column: PROCESSING */}
        <div className="glass-card" style={{ padding: "1rem", minHeight: "500px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#ff9a1a" }}>
            <ChefHat size={18} />
            <h3 style={{ margin: 0, fontWeight: "bold", fontSize: "0.875rem", textTransform: "uppercase" }}>
              Sedang Dimasak ({columns.PROCESSING.length})
            </h3>
          </div>
          <AnimatePresence>{columns.PROCESSING.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}</AnimatePresence>
        </div>

        {/* Column: DONE */}
        <div className="glass-card" style={{ padding: "1rem", minHeight: "500px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#10b981" }}>
            <CheckCircle size={18} />
            <h3 style={{ margin: 0, fontWeight: "bold", fontSize: "0.875rem", textTransform: "uppercase" }}>
              Siap Saji ({columns.DONE.length})
            </h3>
          </div>
          <AnimatePresence>{columns.DONE.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}</AnimatePresence>
        </div>
      </div>
    </section>
  );
}
