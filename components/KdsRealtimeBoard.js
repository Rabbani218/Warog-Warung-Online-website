"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, ChefHat, CheckCircle2, AlertCircle } from "lucide-react";
import { updateKotStatusAction } from "@/app/(admin)/admin/kds/actions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDisplayStatus(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "NEW") return "NEW";
  if (normalized === "PROCESSING" || normalized === "COOKING") return "COOKING";
  if (normalized === "DONE" || normalized === "READY") return "READY";
  return "NEW";
}

function normalizeQueue(queue) {
  return (queue || []).map((ticket) => ({
    ...ticket,
    status: toDisplayStatus(ticket.status),
  }));
}

async function fetchQueue() {
  try {
    const response = await fetch("/api/admin/kot", { cache: "no-store" });
    if (!response.ok) return null; // null = fetch failed, don't overwrite state
    const data = await response.json();
    const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return normalizeQueue(
      data.filter(
        (ticket) =>
          !(
            toDisplayStatus(ticket.status) === "READY" &&
            new Date(ticket.createdAt) < anHourAgo
          )
      )
    );
  } catch {
    return null; // network error — don't overwrite state
  }
}

// ─── TicketCard — defined OUTSIDE component to prevent re-mount on each render ─

function TicketCard({ ticket, now, onUpdate }) {
  const minutesOld = Math.floor(
    (now - new Date(ticket.createdAt).getTime()) / 60000
  );
  const isDelayed = minutesOld >= 15 && ticket.status !== "READY";

  return (
    <motion.div
      layout
      layoutId={ticket.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`glass-card ${isDelayed ? "kds-delay" : ""}`}
      style={{ padding: "1rem", marginBottom: "1rem", cursor: "grab" }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("ticketId", ticket.id);
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: "0.5rem",
        }}
      >
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
              borderRadius: "6px",
            }}
          >
            <AlertCircle size={13} /> {minutesOld}m
          </span>
        ) : (
          <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
            {minutesOld}m
          </span>
        )}
      </div>

      <p style={{ margin: "0.5rem 0", color: "#64748b", fontSize: "0.875rem" }}>
        Meja: <strong>{ticket.order.tableNumber || "-"}</strong>
      </p>

      <div
        style={{
          marginBottom: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
        }}
      >
        {ticket.order?.details?.map((detail) => (
          <div
            key={detail.id}
            style={{
              fontSize: "0.875rem",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              <span style={{ color: "#FF6B6B", fontWeight: "bold" }}>
                {detail.quantity}x
              </span>{" "}
              {detail.menu?.name || "Item"}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        {ticket.status === "NEW" && (
          <button
            className="btn"
            style={{ flex: 1, fontSize: "0.75rem", padding: "0.5rem" }}
            onClick={() => onUpdate(ticket.id, "COOKING")}
          >
            Masak
          </button>
        )}
        {ticket.status === "COOKING" && (
          <button
            className="btn"
            style={{
              flex: 1,
              fontSize: "0.75rem",
              padding: "0.5rem",
              background: "#10b981",
            }}
            onClick={() => onUpdate(ticket.id, "READY")}
          >
            Siap Saji
          </button>
        )}
        {ticket.status === "READY" && (
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              color: "#10b981",
              width: "100%",
              textAlign: "center",
              padding: "0.5rem",
            }}
          >
            ✓ Pesanan Siap Diambil
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Board Component ─────────────────────────────────────────────────────

export default function KdsRealtimeBoard({ initialQueue }) {
  const [queue, setQueue] = useState(() => normalizeQueue(initialQueue));
  const [syncStatus, setSyncStatus] = useState("Menghubungkan...");
  const [now, setNow] = useState(Date.now());
  // Track in-flight optimistic updates to prevent polling from reverting them
  const pendingUpdates = useRef(new Map()); // ticketId → optimistic status

  // Clock ticker for delay badges
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Merge fresh server data with any pending optimistic updates
  const mergeWithPending = useCallback((fresh) => {
    if (!fresh) return; // fetch failed — keep current state
    setQueue((current) => {
      if (!pendingUpdates.current.size) return fresh;
      // Apply optimistic overrides on top of server data
      return fresh.map((ticket) => {
        const pending = pendingUpdates.current.get(ticket.id);
        return pending ? { ...ticket, status: pending } : ticket;
      });
    });
  }, []);

  // SSE + polling setup — stable refs, no restarts on queue changes
  useEffect(() => {
    let sseSource = null;
    let pollingInterval = null;
    let heartbeatInterval = null;
    let isDestroyed = false;

    const doSync = async () => {
      if (isDestroyed) return;
      const fresh = await fetchQueue();
      if (!isDestroyed) mergeWithPending(fresh);
    };

    const startPolling = (interval = 6000) => {
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = setInterval(doSync, interval);
    };

    const startSSE = () => {
      if (isDestroyed) return;
      try {
        sseSource = new EventSource("/api/admin/kot/stream", {
          withCredentials: true,
        });

        sseSource.addEventListener("connected", () => {
          if (!isDestroyed) setSyncStatus("Realtime aktif");
        });

        sseSource.addEventListener("kot-update", () => {
          // SSE fires → immediate sync
          doSync();
        });

        sseSource.addEventListener("heartbeat", () => {
          if (!isDestroyed) setSyncStatus("Realtime aktif");
        });

        sseSource.onerror = () => {
          if (isDestroyed) return;
          setSyncStatus("Polling mode");
          sseSource?.close();
          sseSource = null;
          startPolling(5000);
        };
      } catch {
        setSyncStatus("Polling mode");
        startPolling(5000);
      }
    };

    // Initial data load
    doSync();
    // Slow reconciliation polling (even when SSE active) to catch missed events
    startPolling(10000);
    // SSE for instant push updates
    startSSE();

    return () => {
      isDestroyed = true;
      sseSource?.close();
      if (pollingInterval) clearInterval(pollingInterval);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [mergeWithPending]); // stable — mergeWithPending is wrapped in useCallback

  // Update ticket status with optimistic UI + server confirmation
  const updateTicket = useCallback(async (ticketId, nextStatus) => {
    // Register optimistic update so polling won't revert it
    pendingUpdates.current.set(ticketId, nextStatus);

    // Apply optimistic update immediately in UI
    setQueue((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
    );

    try {
      const updated = await updateKotStatusAction(ticketId, nextStatus);
      // Server confirmed — update with real data and clear pending
      pendingUpdates.current.delete(ticketId);
      setQueue((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, ...updated, status: toDisplayStatus(updated.status) }
            : t
        )
      );
    } catch (err) {
      console.error("[KDS] updateKotStatusAction failed:", err);
      // Revert optimistic on error
      pendingUpdates.current.delete(ticketId);
      const fresh = await fetchQueue();
      if (fresh) setQueue(fresh);
    }
  }, []);

  const columns = useMemo(() => {
    const cols = { NEW: [], COOKING: [], READY: [] };
    queue.forEach((item) => {
      const s = toDisplayStatus(item.status);
      cols[s].push({ ...item, status: s });
    });
    return cols;
  }, [queue]);

  const handleDrop = useCallback(
    (e, targetStatus) => {
      const id = e.dataTransfer.getData("ticketId");
      if (id) updateTicket(id, targetStatus);
    },
    [updateTicket]
  );

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          className="retro-heading"
          style={{ margin: 0, fontSize: "1.5rem" }}
        >
          KDS Kanban
        </h2>
        <span
          style={{
            fontSize: "0.75rem",
            color: "#94a3b8",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "9999px",
              background:
                syncStatus === "Realtime aktif" ? "#10b981" : "#f59e0b",
              animation: "pulse 2s infinite",
            }}
          />
          {syncStatus}
        </span>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "1.5rem",
        }}
      >
        {/* NEW Column */}
        <div
          className="glass-card"
          style={{ padding: "1rem", minHeight: "500px" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "NEW")}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              color: "#f59e0b",
            }}
          >
            <Clock3 size={18} />
            <h3
              style={{
                margin: 0,
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
              }}
            >
              Antrean Masuk ({columns.NEW.length})
            </h3>
          </div>
          <AnimatePresence mode="popLayout">
            {columns.NEW.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                now={now}
                onUpdate={updateTicket}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* COOKING Column */}
        <div
          className="glass-card"
          style={{ padding: "1rem", minHeight: "500px" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "COOKING")}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              color: "#f97316",
            }}
          >
            <ChefHat size={18} />
            <h3
              style={{
                margin: 0,
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
              }}
            >
              Sedang Dimasak ({columns.COOKING.length})
            </h3>
          </div>
          <AnimatePresence mode="popLayout">
            {columns.COOKING.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                now={now}
                onUpdate={updateTicket}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* READY Column */}
        <div
          className="glass-card"
          style={{ padding: "1rem", minHeight: "500px" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "READY")}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              color: "#10b981",
            }}
          >
            <CheckCircle2 size={18} />
            <h3
              style={{
                margin: 0,
                fontWeight: "bold",
                fontSize: "0.875rem",
                textTransform: "uppercase",
              }}
            >
              Siap Saji ({columns.READY.length})
            </h3>
          </div>
          <AnimatePresence mode="popLayout">
            {columns.READY.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                now={now}
                onUpdate={updateTicket}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
