import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "../lib/utils";

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
      className={cn(
        "rounded-lg border-2 border-dashed transition-colors cursor-pointer select-none",
        "flex flex-col items-center justify-center gap-2 py-10 px-6 text-center",
        dragging
          ? "border-foreground/30 bg-accent"
          : "border-border hover:border-border/60 hover:bg-accent/50"
      )}
      onDrop={onDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
    >
      <div className="rounded-full border border-border bg-background p-2.5">
        <Upload className="h-4 w-4 text-muted-foreground" />
      </div>
      {frames.length > 0 ? (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{frames.length} frames loaded</p>
          <p className="text-xs text-muted-foreground">Click or drop to replace</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          <p className="text-sm text-foreground">Drop a folder with PNG frames</p>
          <p className="text-xs text-muted-foreground">or click to select files</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept=".png" multiple onChange={e => load(e.target.files)} />
    </div>
  );
}
