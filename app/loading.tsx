export default function LoadingPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center" }}>
        <div className="spinner" style={{ width: 72, height: 72, margin: "0 auto 1rem", borderWidth: 8 }} />
        <p style={{ margin: 0, color: "#475569" }}>Memuat aplikasi Wareb...</p>
      </div>
    </main>
  );
}
