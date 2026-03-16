import { useState } from "react";
import DropZone from "./components/DropZone";
import Preview from "./components/Preview";
import Settings from "./components/Settings";
import ExportPanel from "./components/ExportPanel";
import CodeSnippet from "./components/CodeSnippet";
import { Separator } from "./components/ui/separator";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-foreground" />
            <span className="text-sm font-semibold tracking-tight">anim-encoder</span>
          </div>
          <span className="text-xs text-muted-foreground">PNG → .uxuitelno</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-7">
          <h1 className="text-xl font-semibold tracking-tight">Encode animation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Convert a PNG frame sequence into a compact AVIF sprite sheet.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 items-start">
          <div className="flex flex-col gap-4">
            <DropZone frames={frames} onFrames={setFrames} />
            <Preview frames={frames} fps={fps} loop={loop} />
          </div>
          <div className="flex flex-col gap-4">
            <Settings
              fps={fps} setFps={setFps}
              quality={quality} setQuality={setQuality}
              loop={loop} setLoop={setLoop}
              frames={frames}
            />
            <ExportPanel
              frames={frames}
              fps={fps}
              encoding={encoding}
              result={result}
              error={error}
              onEncode={handleEncode}
            />
            <CodeSnippet result={result} fps={fps} loop={loop} />
          </div>
        </div>
      </main>
    </div>
  );
}
