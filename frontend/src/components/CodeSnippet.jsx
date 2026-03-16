import { useState } from "react";

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: "0.5px solid var(--border)" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontFamily: "monospace", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function CodeBlock({ code, onCopy, copied }) {
  return (
    <div style={{ position: "relative" }}>
      <pre style={{ fontSize: 11, lineHeight: 1.7, color: "var(--muted)", whiteSpace: "pre-wrap", wordBreak: "break-word", background: "var(--bg)", border: "0.5px solid var(--border)", borderRadius: 6, padding: "10px 12px", margin: 0 }}>
        {code}
      </pre>
      <button onClick={onCopy} style={{ position: "absolute", top: 6, right: 6, fontSize: 10, padding: "2px 7px", color: "var(--muted)" }}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function kotlinSpec(stats, fps, loop) {
  const fc = stats?.frameCount ?? "N";
  const fw = stats?.frameWidth ?? "W";
  const fh = stats?.frameHeight ?? "H";
  const cols = stats?.cols ?? "C";
  const rows = stats?.rows ?? "R";
  const fpsVal = fps ?? 30;
  const loopVal = loop ?? true;

  const decoder = `// 1. Read the file
val bytes = resources.openRawResource(R.raw.animation).readBytes()

// 2. Parse manifest
val manifestLen = ByteBuffer.wrap(bytes, 0, 4)
    .order(ByteOrder.LITTLE_ENDIAN).int
val manifest = JSONObject(String(bytes, 4, manifestLen))

val frameCount = manifest.getInt("frameCount")   // ${fc}
val frameWidth  = manifest.getInt("frameWidth")   // ${fw}px
val frameHeight = manifest.getInt("frameHeight")  // ${fh}px
val cols        = manifest.getInt("cols")          // ${cols}
val fps         = manifest.getDouble("fps")        // ${fpsVal}
val loop        = manifest.getBoolean("loop")      // ${loopVal}

// 3. Decode AVIF sprite sheet
val avifBytes = bytes.copyOfRange(4 + manifestLen, bytes.size)
val sheet = BitmapFactory.decodeByteArray(avifBytes, 0, avifBytes.size)

// 4. Extract frame i (0-based)
fun getFrame(i: Int): Bitmap {
    val col = i % cols
    val row = i / cols
    return Bitmap.createBitmap(sheet, col * frameWidth, row * frameHeight,
        frameWidth, frameHeight)
}

// 5. Playback via ValueAnimator
val animator = ValueAnimator.ofInt(0, frameCount - 1).apply {
    duration = (frameCount * 1000.0 / fps).toLong()
    repeatCount = if (loop) ValueAnimator.INFINITE else 0
    addUpdateListener { imageView.setImageBitmap(getFrame(it.animatedValue as Int)) }
}
animator.start()`;

  return decoder;
}

function swiftSpec(stats, fps, loop) {
  const fc = stats?.frameCount ?? "N";
  const fw = stats?.frameWidth ?? "W";
  const fh = stats?.frameHeight ?? "H";
  const cols = stats?.cols ?? "C";
  const fpsVal = fps ?? 30;
  const loopVal = loop ?? true;

  const decoder = `// 1. Read the file
let url = Bundle.main.url(forResource: "animation", withExtension: "uxuitelno")!
let data = try! Data(contentsOf: url)

// 2. Parse manifest
let manifestLen = data.prefix(4).withUnsafeBytes {
    $0.load(as: UInt32.self).littleEndian
}
let manifestData = data[4 ..< 4 + Int(manifestLen)]
let manifest = try! JSONSerialization.jsonObject(with: manifestData) as! [String: Any]

let frameCount = manifest["frameCount"] as! Int   // ${fc}
let frameWidth  = manifest["frameWidth"] as! Int   // ${fw}px
let frameHeight = manifest["frameHeight"] as! Int  // ${fh}px
let cols        = manifest["cols"] as! Int          // ${cols}
let fps         = manifest["fps"] as! Double        // ${fpsVal}
let loop        = manifest["loop"] as! Bool         // ${loopVal}

// 3. Decode AVIF sprite sheet (iOS 16+)
let avifData = data[(4 + Int(manifestLen))...]
let sheet = UIImage(data: avifData)!.cgImage!

// 4. Extract frame i (0-based)
func getFrame(_ i: Int) -> UIImage {
    let col = i % cols
    let row = i / cols
    let rect = CGRect(x: col * frameWidth, y: row * frameHeight,
                      width: frameWidth, height: frameHeight)
    let cropped = sheet.cropping(to: rect)!
    return UIImage(cgImage: cropped)
}

// 5. Playback via CADisplayLink
var frameIndex = 0
var displayLink: CADisplayLink?

displayLink = CADisplayLink(target: self, selector: #selector(tick))
displayLink?.preferredFrameRateRange = .init(minimum: Float(fps),
                                              maximum: Float(fps), preferred: Float(fps))
displayLink?.add(to: .main, forMode: .common)

@objc func tick() {
    imageView.image = getFrame(frameIndex)
    frameIndex += 1
    if frameIndex >= frameCount {
        if loop { frameIndex = 0 } else { displayLink?.invalidate() }
    }
}`;

  return decoder;
}

export default function CodeSnippet({ result, fps, loop }) {
  const [tab, setTab] = useState("kotlin");
  const [copied, setCopied] = useState(false);
  const stats = result?.stats;

  function copy(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const isKotlin = tab === "kotlin";
  const code = isKotlin ? kotlinSpec(stats, fps, loop) : swiftSpec(stats, fps, loop);

  return (
    <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem 1.25rem" }}>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["kotlin", "Android / Kotlin"], ["swift", "iOS / Swift"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ fontSize: 11, padding: "3px 10px", background: tab === key ? "var(--bg)" : "transparent", fontWeight: tab === key ? 500 : 400, borderColor: tab === key ? "var(--border-focus)" : "var(--border)" }}>
            {label}
          </button>
        ))}
      </div>

      <Section title="Requirements">
        <InfoRow label="Min OS version" value={isKotlin ? "Android 12 (API 31)" : "iOS 16"} />
        <InfoRow label="AVIF decoder" value={isKotlin ? "BitmapFactory (built-in)" : "UIImage (built-in)"} />
        <InfoRow label="Transparency" value="RGBA / alpha channel" />
      </Section>

      {stats && (
        <Section title="File info">
          <InfoRow label="Frames" value={stats.frameCount} />
          <InfoRow label="Frame size" value={`${stats.frameWidth} × ${stats.frameHeight} px`} />
          <InfoRow label="Grid" value={`${stats.cols} × ${stats.rows}`} />
          <InfoRow label="FPS" value={fps} />
          <InfoRow label="Loop" value={loop ? "yes" : "no"} />
          <InfoRow label="File size" value={`${stats.sizeKb} KB`} />
          <InfoRow label="AVIF sprite sheet" value={`${stats.avifKb} KB`} />
        </Section>
      )}

      <Section title=".uxuitelno format">
        <CodeBlock
          copied={false}
          onCopy={() => copy("[4 bytes LE uint32] — manifest length\n[N bytes UTF-8]     — JSON manifest\n[remainder]         — AVIF sprite sheet (cols × rows)")}
          code={"[4 bytes LE uint32] — manifest length\n[N bytes UTF-8]     — JSON manifest\n[remainder]         — AVIF sprite sheet (cols × rows)"}
        />
      </Section>

      <Section title={isKotlin ? "Decoder (Kotlin)" : "Decoder (Swift)"}>
        <CodeBlock code={code} copied={copied} onCopy={() => copy(code)} />
      </Section>

    </div>
  );
}
