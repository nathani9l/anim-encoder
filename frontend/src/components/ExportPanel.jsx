function StatCard({ label, value }) {
  return (
    <div style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "8px 10px" }}>
      <div style={{ fontSize: 10, color: "var(--hint)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

export default function ExportPanel({ frames, encoding, result, error, onEncode }) {
  function download() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(result.blob);
    a.download = "animation.uxuitelno";
    a.click();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button className="primary" onClick={onEncode} disabled={!frames.length || encoding} style={{ width: "100%", padding: "10px 0", fontSize: 14 }}>
        {encoding ? "Encoding on server…" : "Encode .uxuitelno"}
      </button>
      {error && (
        <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 10px" }}>
          Error: {error}
        </div>
      )}
      {result && (
        <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <StatCard label="Total" value={`${result.stats.sizeKb} KB`} />
            <StatCard label="AVIF" value={`${result.stats.avifKb} KB`} />
            <StatCard label="Grid" value={`${result.stats.cols}×${result.stats.rows}`} />
          </div>
          <button onClick={download} style={{ width: "100%", padding: "8px 0", fontSize: 13 }}>
            Download animation.uxuitelno
          </button>
        </div>
      )}
    </div>
  );
}
