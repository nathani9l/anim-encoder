#!/usr/bin/env python3
"""
Декодер .uxuitelno — извлекает кадры из анимации в папку PNG.

Использование:
    python3 decode.py animation.uxuitelno
    python3 decode.py animation.uxuitelno --out ./frames
"""

import argparse
import io
import json
import struct
import sys
from pathlib import Path

from PIL import Image


def decode(path: Path, out_dir: Path):
    data = path.read_bytes()

    if len(data) < 4:
        sys.exit("Файл слишком маленький")

    manifest_len = struct.unpack_from("<I", data, 0)[0]
    manifest_raw = data[4 : 4 + manifest_len]
    avif_raw = data[4 + manifest_len :]

    try:
        manifest = json.loads(manifest_raw)
    except json.JSONDecodeError as e:
        sys.exit(f"Битый манифест: {e}")

    print("Манифест:")
    for k, v in manifest.items():
        print(f"  {k}: {v}")
    print(f"  avifSize: {len(avif_raw) / 1024:.1f} KB")
    print()

    sheet = Image.open(io.BytesIO(avif_raw)).convert("RGBA")
    print(f"Sprite sheet: {sheet.size[0]}×{sheet.size[1]}")

    frame_count = manifest["frameCount"]
    fw = manifest["frameWidth"]
    fh = manifest["frameHeight"]
    cols = manifest["cols"]

    out_dir.mkdir(parents=True, exist_ok=True)

    for i in range(frame_count):
        col = i % cols
        row = i // cols
        x, y = col * fw, row * fh
        frame = sheet.crop((x, y, x + fw, y + fh))
        out_path = out_dir / f"frame_{i:04d}.png"
        frame.save(out_path)

    print(f"Извлечено {frame_count} кадров → {out_dir}/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Декодер .uxuitelno")
    parser.add_argument("file", type=Path, help="Путь к .uxuitelno файлу")
    parser.add_argument("--out", type=Path, default=None, help="Папка для кадров (по умолчанию: рядом с файлом)")
    args = parser.parse_args()

    if not args.file.exists():
        sys.exit(f"Файл не найден: {args.file}")

    out_dir = args.out or args.file.parent / args.file.stem
    decode(args.file, out_dir)
