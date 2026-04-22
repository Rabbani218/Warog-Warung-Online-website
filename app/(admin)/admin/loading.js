export default function AdminLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "1rem"
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "4px solid #f3f4f6",
          borderTopColor: "#FF6B6B",
          animation: "spin 0.8s linear infinite"
        }}
      />
      <p style={{ color: "#6b7280", fontWeight: 600, fontSize: "0.9rem" }}>
        Memuat halaman…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
