"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Still loading → do nothing
    if (status === "loading") return;

    // No session → redirect to login
    if (status === "unauthenticated" || !session) {
      router.replace("/admin?error=SessionExpired&message=Sesi+Anda+telah+berakhir");
      return;
    }

    // Session exists but not ADMIN → redirect to home
    if (session.user?.role !== "ADMIN") {
      router.replace("/?error=Unauthorized");
      return;
    }

    // Authorized!
    setIsAuthorized(true);
  }, [session, status, router]);

  // Show loading skeleton while session is being resolved
  if (status === "loading" || !isAuthorized) {
    return <AdminLoadingSkeleton />;
  }

  return <AdminMotionShell>{children}</AdminMotionShell>;
}
