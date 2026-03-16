import io
import json
import math
import struct
from PIL import Image


MAX_SHEET_DIM = 16384


def load_frame(data: bytes) -> Image.Image:
    return Image.open(io.BytesIO(data)).convert("RGBA")


def _even(n: int) -> int:
    return n if n % 2 == 0 else n - 1


def build_sprite_sheet(frames, fw: int, fh: int):
    n = len(frames)
    cols = math.ceil(math.sqrt(n))
    rows = math.ceil(n / cols)
    sheet = Image.new("RGBA", (cols * fw, rows * fh), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        f = frame if frame.size == (fw, fh) else frame.resize((fw, fh), Image.LANCZOS)
        sheet.paste(f, ((i % cols) * fw, (i // cols) * fh))
    return sheet, cols, rows


def encode_avif(sheet: Image.Image, quality: int) -> bytes:
    buf = io.BytesIO()
    sheet.save(buf, format="AVIF", quality=quality)
    return buf.getvalue()


def pack_anim(frames_data, fps, quality, loop):
    frames = [load_frame(d) for d in frames_data]
    n = len(frames)

    orig_fw, orig_fh = frames[0].width, frames[0].height
    cols = math.ceil(math.sqrt(n))
    rows = math.ceil(n / cols)

    scale = min(MAX_SHEET_DIM / (cols * orig_fw), MAX_SHEET_DIM / (rows * orig_fh), 1.0)
    fw = max(2, _even(int(orig_fw * scale)))
    fh = max(2, _even(int(orig_fh * scale)))

    sheet, cols, rows = build_sprite_sheet(frames, fw, fh)
    avif = encode_avif(sheet, quality)

    manifest = {
        "version": 1,
        "frameCount": len(frames),
        "frameWidth": fw,
        "frameHeight": fh,
        "cols": cols,
        "rows": rows,
        "fps": fps,
        "loop": loop,
    }
    manifest_bytes = json.dumps(manifest, separators=(",", ":")).encode("utf-8")
    header = struct.pack("<I", len(manifest_bytes))
    result = header + manifest_bytes + avif

    stats = {
        "frameCount": len(frames),
        "frameWidth": fw,
        "frameHeight": fh,
        "cols": cols,
        "rows": rows,
        "sizeKb": round(len(result) / 1024, 1),
        "avifKb": round(len(avif) / 1024, 1),
    }
    return result, stats
