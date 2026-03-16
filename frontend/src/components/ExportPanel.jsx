import { Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

function StatBadge({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-muted px-3 py-2">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
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
    <div className="flex flex-col gap-3">
      <Button
        onClick={onEncode}
        disabled={!frames.length || encoding}
        className="w-full"
        size="default"
      >
        {encoding ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Encoding…
          </>
        ) : (
          "Encode .uxuitelno"
        )}
      </Button>

      {error && (
        <div className="rounded-md border border-border bg-background px-3 py-2.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Error: </span>{error}
        </div>
      )}

      {result && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <StatBadge label="Total" value={`${result.stats.sizeKb} KB`} />
              <StatBadge label="AVIF" value={`${result.stats.avifKb} KB`} />
              <StatBadge label="Grid" value={`${result.stats.cols}×${result.stats.rows}`} />
            </div>
            <Separator />
            <Button variant="secondary" onClick={download} className="w-full" size="sm">
              <Download className="mr-2 h-3.5 w-3.5" />
              Download animation.uxuitelno
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
