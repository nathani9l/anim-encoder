import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

const FPS_OPTIONS = [24, 30, 60];

function FpsChips({ value, onChange, dur }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>FPS</Label>
        {dur && (
          <span className="text-xs text-muted-foreground tabular-nums">{dur}s</span>
        )}
      </div>
      <div className="flex gap-2">
        {FPS_OPTIONS.map(opt => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "flex-1 h-8 rounded-md text-sm font-medium transition-colors focus-visible:outline-none",
                selected
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, display }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <span className="text-xs font-medium tabular-nums">{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-border cursor-pointer accent-foreground"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none",
          value ? "bg-foreground" : "bg-border"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full bg-background transition-transform",
            value ? "translate-x-4" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

export default function Settings({ fps, setFps, quality, setQuality, loop, setLoop, frames }) {
  const dur = frames.length ? (frames.length / fps).toFixed(1) : null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 space-y-4">
        <FpsChips value={fps} onChange={setFps} dur={dur} />
        <Slider
          label="Quality"
          value={quality}
          min={10}
          max={100}
          step={5}
          onChange={setQuality}
          display={`${quality}%`}
        />
        <Toggle label="Loop" value={loop} onChange={setLoop} />
      </CardContent>
    </Card>
  );
}
