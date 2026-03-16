const card = {
  background: "var(--surface)",
  border: "0.5px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "1rem 1.25rem",
};

function Slider({ label, value, min, max, step, onChange, display }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{display ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{ width: 34, height: 18, borderRadius: 9, background: value ? "var(--text)" : "var(--border)", cursor: "pointer", position: "relative", transition: "background 0.18s" }}>
        <div style={{ position: "absolute", top: 2, left: value ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: value ? "var(--bg)" : "var(--muted)", transition: "left 0.18s" }} />
      </div>
    </div>
  );
}

export default function Settings({ fps, setFps, quality, setQuality, loop, setLoop, frames }) {
  const dur = frames.length ? (frames.length / fps).toFixed(1) : null;
  return (
    <div style={card}>
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--hint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Settings</div>
      <Slider label="FPS" value={fps} min={1} max={60} step={1} onChange={setFps} display={dur ? `${fps} fps · ${dur}s` : `${fps} fps`} />
      <Slider label="Quality" value={quality} min={10} max={100} step={5} onChange={setQuality} display={`${quality}%`} />
      <Toggle label="Loop" value={loop} onChange={setLoop} />
    </div>
  );
}
