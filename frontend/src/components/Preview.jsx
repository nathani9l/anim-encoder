import { useEffect, useRef, useState } from "react";

export default function Preview({ frames, fps, loop }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ playing: false, raf: null });
  const [imgs, setImgs] = useState([]);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!frames.length) { setImgs([]); setInfo(null); return; }
    let cancelled = false;
    Promise.all(
      frames.map(f => new Promise((res, rej) => {
        const img = new Image();
        const url = URL.createObjectURL(f);
        img.onload = () => { URL.revokeObjectURL(url); res(img); };
        img.onerror = rej;
        img.src = url;
      }))
    ).then(loaded => {
      if (!cancelled) {
        setImgs(loaded);
        setInfo({ w: loaded[0].naturalWidth, h: loaded[0].naturalHeight, n: loaded.length });
      }
    });
    return () => { cancelled = true; };
  }, [frames]);

  useEffect(() => {
    const st = stateRef.current;
    st.playing = false;
    cancelAnimationFrame(st.raf);
    if (!imgs.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const fw = imgs[0].naturalWidth;
    const fh = imgs[0].naturalHeight;
    canvas.width = fw; canvas.height = fh;
    let i = 0, last = null;
    const interval = 1000 / fps;
    st.playing = true;
    function tick(ts) {
      if (!st.playing) return;
      if (!last) last = ts;
      if (ts - last >= interval) {
        ctx.clearRect(0, 0, fw, fh);
        ctx.drawImage(imgs[i], 0, 0);
        i++;
        if (i >= imgs.length) {
          if (loop) i = 0;
          else { st.playing = false; return; }
        }
        last = ts;
      }
      st.raf = requestAnimationFrame(tick);
    }
    st.raf = requestAnimationFrame(tick);
    return () => { st.playing = false; cancelAnimationFrame(st.raf); };
  }, [imgs, fps, loop]);

  return (
    <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, gap: 10, overflow: "hidden" }}>
      {imgs.length > 0 ? (
        <>
          <canvas ref={canvasRef} style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 4 }} />
          {info && (
            <div style={{ fontSize: 11, color: "var(--hint)", display: "flex", gap: 12 }}>
              <span>{info.w}×{info.h}px</span>
              <span>{info.n} frames</span>
              <span>{(info.n / fps).toFixed(1)}s</span>
            </div>
          )}
        </>
      ) : (
        <span style={{ fontSize: 12, color: "var(--hint)" }}>Preview</span>
      )}
    </div>
  );
}
