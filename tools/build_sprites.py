"""Export cut-out character art to game-ready HD sprites.

Reads src/data/spriteSizes.json (key -> display height in logical px), takes
art/prepped/<key>.png (from tools/prep_still.py), trims transparent margins and
downscales with premultiplied-alpha LANCZOS to 3x the display height (the max render
scale), writing public/sprites/<key>.png. Premultiplying avoids dark/light halos where
the sprite edge meets transparency.

  .venv/Scripts/python tools/build_sprites.py            # all keys
  .venv/Scripts/python tools/build_sprites.py jun mei    # only these
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "src" / "data" / "spriteSizes.json"
SRC = ROOT / "art" / "prepped"
OUT = ROOT / "public" / "sprites"
RENDER_SCALE = 3


def export(key: str, display_h: int) -> str:
    src = SRC / f"{key}.png"
    if not src.exists():
        return f"MISSING {src.relative_to(ROOT)} (run tools/prep_still.py first)"
    im = Image.open(src).convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    target_h = display_h * RENDER_SCALE
    target_w = max(1, round(im.width * target_h / im.height))
    note = " (upscaled: source is smaller than target)" if target_h > im.height else ""
    out = im.convert("RGBa").resize((target_w, target_h), Image.LANCZOS).convert("RGBA")
    OUT.mkdir(parents=True, exist_ok=True)
    out.save(OUT / f"{key}.png", optimize=True)
    return f"{key}: {im.width}x{im.height} -> {target_w}x{target_h}{note}"


def main() -> int:
    sizes = {k: v for k, v in json.loads(MANIFEST.read_text()).items() if not k.startswith("_")}
    keys = sys.argv[1:] or list(sizes)
    failed = False
    for key in keys:
        if key not in sizes:
            print(f"UNKNOWN key {key} (add it to {MANIFEST.name})")
            failed = True
            continue
        msg = export(key, sizes[key])
        failed |= msg.startswith("MISSING")
        print(msg)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
