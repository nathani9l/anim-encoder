import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs py-1.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

function CodeBlock({ code, onCopy, copied }) {
  return (
    <div className="relative">
      <pre className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-words bg-muted rounded-md p-3 font-mono">
        {code}
      </pre>
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 flex items-center gap-1 rounded px-2 py-1 text-[10px] text-muted-foreground bg-background border border-border hover:text-foreground transition-colors"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function kotlinSpec(stats, fps, loop) {
  const fc = stats?.frameCount ?? "N";
  const fw = stats?.frameWidth ?? "W";
  const fh = stats?.frameHeight ?? "H";
  const cols = stats?.cols ?? "C";
  const fpsVal = fps ?? 30;
  const loopVal = loop ?? true;

  return `// 1. Read the file
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
}

function swiftSpec(stats, fps, loop) {
  const fc = stats?.frameCount ?? "N";
  const fw = stats?.frameWidth ?? "W";
  const fh = stats?.frameHeight ?? "H";
  const cols = stats?.cols ?? "C";
  const fpsVal = fps ?? 30;
  const loopVal = loop ?? true;

  return `// 1. Read the file
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
    return UIImage(cgImage: sheet.cropping(to: rect)!)
}

// 5. Playback via CADisplayLink
var frameIndex = 0
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
    <Card>
      <CardHeader>
        <CardTitle>Integration</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 p-0.5 rounded-md bg-muted w-fit">
          {[["kotlin", "Android"], ["swift", "iOS"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "px-3 py-1 text-xs rounded transition-colors",
                tab === key
                  ? "bg-background text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Section title="Requirements">
          <div className="rounded-md border border-border overflow-hidden">
            <InfoRow label="Min OS" value={isKotlin ? "Android 12 (API 31)" : "iOS 16"} />
            <InfoRow label="AVIF decoder" value={isKotlin ? "BitmapFactory" : "UIImage"} />
            <InfoRow label="Transparency" value="RGBA / alpha channel" />
          </div>
        </Section>

        {stats && (
          <Section title="File info">
            <div className="rounded-md border border-border overflow-hidden">
              <InfoRow label="Frames" value={stats.frameCount} />
              <InfoRow label="Frame size" value={`${stats.frameWidth} × ${stats.frameHeight} px`} />
              <InfoRow label="Grid" value={`${stats.cols} × ${stats.rows}`} />
              <InfoRow label="FPS" value={fps} />
              <InfoRow label="Loop" value={loop ? "yes" : "no"} />
              <InfoRow label="File size" value={`${stats.sizeKb} KB`} />
            </div>
          </Section>
        )}

        <Section title="Format">
          <CodeBlock
            copied={false}
            onCopy={() => copy("[4 bytes LE uint32] — manifest length\n[N bytes UTF-8]     — JSON manifest\n[remainder]         — AVIF sprite sheet")}
            code={"[4 bytes LE uint32] — manifest length\n[N bytes UTF-8]     — JSON manifest\n[remainder]         — AVIF sprite sheet (cols × rows)"}
          />
        </Section>

        <Section title={isKotlin ? "Decoder — Kotlin" : "Decoder — Swift"}>
          <CodeBlock code={code} copied={copied} onCopy={() => copy(code)} />
        </Section>
      </CardContent>
    </Card>
  );
}
