import { useState } from "react";
import DropZone from "./components/DropZone";
import Preview from "./components/Preview";
import Settings from "./components/Settings";
import ExportPanel from "./components/ExportPanel";
import CodeSnippet from "./components/CodeSnippet";

const s = {
  app: { maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" },
  header: { marginBottom: "1.75rem" },
  title: { fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em" },
  subtitle: { fontSize: 13, color: "var(--muted)", marginTop: 3 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" },
  col: { display: "flex", flexDirection: "column", gap: 12 },
};

export default function App() {
  const [frames, setFrames] = useState([]);
  const [fps, setFps] = useState(30);
  const [quality, setQuality] = useState(65);
  const [loop, setLoop] = useState(true);
  const [encoding, setEncoding] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleEncode() {
    if (!frames.length) return;
    setEncoding(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      frames.forEach(f => fd.append("files", f));
      fd.append("fps", fps);
      fd.append("quality", quality);
      fd.append("loop", loop);
      const res = await fetch("/api/encode", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const blob = await res.blob();
      const statsHeader = res.headers.get("X-Anim-Stats");
      const stats = statsHeader ? JSON.parse(statsHeader.replace(/'/g, '"')) : {};
      setResult({ blob, stats });
    } catch (e) {
      setError(e.message);
    } finally {
      setEncoding(false);
    }
  }

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={s.title}>Anim Encoder</div>
        <div style={s.subtitle}>PNG sequence → .uxuitelno (AVIF sprite sheet)</div>
      </div>
      <div style={s.grid}>
        <div style={s.col}>
          <DropZone frames={frames} onFrames={setFrames} />
          <Preview frames={frames} fps={fps} loop={loop} />
        </div>
        <div style={s.col}>
          <Settings fps={fps} setFps={setFps} quality={quality} setQuality={setQuality} loop={loop} setLoop={setLoop} frames={frames} />
          <ExportPanel frames={frames} fps={fps} encoding={encoding} result={result} error={error} onEncode={handleEncode} />
          <CodeSnippet result={result} fps={fps} loop={loop} />
        </div>
      </div>
    </div>
  );
}
