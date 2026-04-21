export default function SetupLoading() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center" }}>
        <div className="spinner" style={{ width: 64, height: 64, margin: "0 auto 1rem", borderWidth: 8 }} />
        <p style={{ margin: 0, color: "#475569" }}>Menyiapkan halaman setup...</p>
      </div>
    </main>
  );
}
