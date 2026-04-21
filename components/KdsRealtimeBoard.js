"use client";

import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, ChefHat, CheckCircle2, AlertCircle } from "lucide-react";
import { updateKotStatusAction } from "@/app/(admin)/admin/kds/actions";

function toDisplayStatus(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "NEW") {
    return "NEW";
  }
  if (normalized === "PROCESSING" || normalized === "COOKING") {
    return "COOKING";
  }
  if (normalized === "DONE" || normalized === "READY") {
    return "READY";
  }
  return "NEW";
}

function normalizeQueue(queue) {
  return (queue || []).map((ticket) => ({
    ...ticket,
    status: toDisplayStatus(ticket.status)
  }));
}

async function fetchQueue() {
  const response = await fetch("/api/admin/kot", { cache: "no-store" });
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return normalizeQueue(
    data.filter((ticket) => !(toDisplayStatus(ticket.status) === "READY" && new Date(ticket.createdAt) < anHourAgo))
  );
}

export default function KdsRealtimeBoard({ initialQueue }) {
  const [queue, setQueue] = useState(() => normalizeQueue(initialQueue));
  const [optimisticQueue, applyOptimisticQueue] = useOptimistic(queue, (_current, next) => next);
  const [status, setStatus] = useState("Menghubungkan stream...");
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let pollingId;
    let source;

    const syncQueue = async () => {
      const fresh = await fetchQueue();
      setQueue(fresh);
      applyOptimisticQueue(fresh);
    };

    const startStream = async () => {
      try {
        source = new EventSource("/api/admin/kot/stream", { withCredentials: true });
        source.addEventListener("connected", () => setStatus("Realtime aktif"));
        source.addEventListener("kot-update", syncQueue);
        source.onerror = () => {
          setStatus("Polling fallback");
          if (source) {
            source.close();
          }
          pollingId = setInterval(syncQueue, 5000);
        };
      } catch (_error) {
        setStatus("Polling fallback");
      }
    };

    startStream();

    return () => {
      if (source) {
        source.close();
      }
      if (pollingId) {
        clearInterval(pollingId);
      }
    };
  }, [applyOptimisticQueue]);

  function updateTicket(ticketId, nextStatus) {
    const optimistic = optimisticQueue.map((item) =>
      item.id === ticketId ? { ...item, status: nextStatus } : item
    );
    applyOptimisticQueue(optimistic);

    startTransition(async () => {
      try {
        const updated = await updateKotStatusAction(ticketId, nextStatus);
        const merged = optimistic.map((item) => (item.id === ticketId ? { ...item, ...updated } : item));
        setQueue(merged);
        applyOptimisticQueue(merged);
      } catch (_error) {
        const fresh = await fetchQueue();
        setQueue(fresh);
        applyOptimisticQueue(fresh);
      }
    });
  }

  const columns = useMemo(() => {
    const cols = { NEW: [], COOKING: [], READY: [] };
    optimisticQueue.forEach((item) => {
      const displayStatus = toDisplayStatus(item.status);
      cols[displayStatus].push({ ...item, status: displayStatus });
    });
    return cols;
  }, [optimisticQueue]);

  const TicketCard = ({ ticket }) => {
    const minutesOld = Math.floor((now - new Date(ticket.createdAt).getTime()) / 60000);
    const isDelayed = minutesOld >= 15 && ticket.status !== "READY";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className={`glass-card ${isDelayed ? "kds-delay" : ""}`}
        style={{ padding: "1rem", marginBottom: "1rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
          <strong style={{ fontSize: "1.1rem" }}>{ticket.order.orderCode}</strong>
          {isDelayed ? (
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
                borderRadius: "6px"
              }}
            >
              <AlertCircle size={13} /> {minutesOld}m
            </span>
          ) : (
            <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{minutesOld}m</span>
          )}
        </div>

        <p style={{ margin: "0.5rem 0", color: "#64748b", fontSize: "0.875rem" }}>
          Meja: <strong>{ticket.order.tableNumber || "-"}</strong>
        </p>

        <div style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {ticket.order?.details?.map((detail) => (
            <div key={detail.id} style={{ fontSize: "0.875rem", display: "flex", justifyContent: "space-between" }}>
              <span>
                <span style={{ color: "#FF6B6B", fontWeight: "bold" }}>{detail.quantity}x</span> {detail.menu?.name || "Item"}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          {ticket.status === "NEW" ? (
            <button className="btn" style={{ flex: 1, fontSize: "0.75rem", padding: "0.5rem" }} onClick={() => updateTicket(ticket.id, "COOKING")}>Masak</button>
          ) : null}

          {ticket.status === "COOKING" ? (
            <button
              className="btn"
              style={{ flex: 1, fontSize: "0.75rem", padding: "0.5rem", background: "#10b981" }}
              onClick={() => updateTicket(ticket.id, "READY")}
            >
              Siap Saji
            </button>
          ) : null}

          {ticket.status === "READY" ? (
            <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#10b981", width: "100%", textAlign: "center", padding: "0.5rem" }}>
              ✓ Pesanan Siap Diambil
            </span>
          ) : null}
        </div>
      </motion.div>
    );
  };

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 className="retro-heading" style={{ margin: 0, fontSize: "1.5rem" }}>KDS Kanban</h2>
        <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "9999px", background: "#10b981", animation: "pulse 2s infinite" }} />
          {isPending ? "Menyinkronkan..." : status}
        </span>
      </div>

      <motion.div
        layout
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}
      >
        <div className="glass-card" style={{ padding: "1rem", minHeight: "500px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.2)", color: "#f59e0b" }}>
            <Clock3 size={18} />
            <h3 style={{ margin: 0, fontWeight: "bold", fontSize: "0.875rem", textTransform: "uppercase" }}>
              Antrean Masuk ({columns.NEW.length})
            </h3>
          </div>
          <AnimatePresence>{columns.NEW.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}</AnimatePresence>
        </div>

        <div className="glass-card" style={{ padding: "1rem", minHeight: "500px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.2)", color: "#f97316" }}>
            <ChefHat size={18} />
            <h3 style={{ margin: 0, fontWeight: "bold", fontSize: "0.875rem", textTransform: "uppercase" }}>
              Sedang Dimasak ({columns.COOKING.length})
            </h3>
          </div>
          <AnimatePresence>{columns.COOKING.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}</AnimatePresence>
        </div>

        <div className="glass-card" style={{ padding: "1rem", minHeight: "500px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.2)", color: "#10b981" }}>
            <CheckCircle2 size={18} />
            <h3 style={{ margin: 0, fontWeight: "bold", fontSize: "0.875rem", textTransform: "uppercase" }}>
              Siap Saji ({columns.READY.length})
            </h3>
          </div>
          <AnimatePresence>{columns.READY.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}</AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
