import { useState, useRef, useCallback } from "react";

async function collectFiles(dataTransfer) {
  const files = [];
  for (const item of dataTransfer.items) {
    const entry = item.webkitGetAsEntry?.();
    if (entry?.isDirectory) {
      await new Promise(res => {
        entry.createReader().readEntries(entries => {
          const reads = entries
            .filter(e => e.name.toLowerCase().endsWith(".png"))
            .map(e => new Promise(r => e.file(r)));
          Promise.all(reads).then(fs => { files.push(...fs); res(); });
        });
      });
    } else if (item.kind === "file") {
      const f = item.getAsFile();
      if (f?.name.toLowerCase().endsWith(".png")) files.push(f);
    }
  }
  return files;
}

const card = {
  border: "1.5px dashed var(--border)",
  borderRadius: "var(--radius)",
  padding: "2rem 1rem",
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s",
  userSelect: "none",
};

export default function DropZone({ frames, onFrames }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(async files => {
    const sorted = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );
    onFrames(sorted);
  }, [onFrames]);

  const onDrop = useCallback(async e => {
    e.preventDefault();
    setDragging(false);
    const files = await collectFiles(e.dataTransfer);
    if (files.length) load(files);
  }, [load]);

  return (
    <div
      style={{ ...card, borderColor: dragging ? "var(--border-focus)" : "var(--border)", background: dragging ? "var(--bg)" : "transparent" }}
      onDrop={onDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" style={{ marginBottom: 8 }}>
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
      </svg>
      {frames.length > 0 ? (
        <div style={{ fontSize: 13 }}>
          <strong>{frames.length}</strong> frames loaded
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Click or drop to replace</div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Drop a folder with PNG frames<br />
          <span style={{ fontSize: 12, color: "var(--hint)" }}>or click to select files</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept=".png" multiple onChange={e => load(e.target.files)} />
    </div>
  );
}
