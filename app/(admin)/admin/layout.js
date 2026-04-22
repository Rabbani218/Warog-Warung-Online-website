"use client";

import { useSession } from "next-auth/react";
import AdminMotionShell from "@/components/AdminMotionShell";

function AdminLoadingSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #fafafa 0%, #f5f0ff 50%, #fff0f3 100%)"
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 56,
            height: 56,
            margin: "0 auto 1.5rem",
            borderRadius: "50%",
            border: "4px solid #f3f4f6",
            borderTopColor: "#FF6B6B",
            animation: "spin 0.8s linear infinite"
          }}
        />
        <p style={{ color: "#6b7280", fontWeight: 600, fontSize: "0.95rem" }}>
          Memuat Dashboard Admin…
        </p>
        <p style={{ color: "#9ca3af", fontSize: "0.8rem", marginTop: "0.25rem" }}>
          Memverifikasi sesi dan otorisasi
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <AdminLoadingSkeleton />;
  }

  // If session is missing or user is not ADMIN, middleware should have handled it.
  // But we add a safety check here to avoid rendering admin UI for non-admins.
  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return <AdminMotionShell>{children}</AdminMotionShell>;
}
