"""Prepare AI-generated character stills for the sprite pipeline.

Removes a plain light background by flood-filling from the image border (so white
clothing inside the dark outline survives), drops floor shadows and loose decorations
(steam, sparkles) that are not attached to a character, and writes one transparent PNG
per character, left to right.

  python tools/prep_still.py art/source/owner-jun-mei.webp --names jun mei --out art/prepped

Needs Pillow, numpy and scipy (the project .venv has them).
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


def background_mask(rgba: np.ndarray, min_lum: float, max_sat: float, min_alpha: int) -> np.ndarray:
    """Light/low-saturation or see-through pixels connected to the border = background
    (covers white backgrounds, transparent backgrounds and soft floor shadows)."""
    rgb = rgba[..., :3]
    r, g, b = (rgb[..., i].astype(np.float32) for i in range(3))
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    sat = rgb.max(axis=2).astype(np.float32) - rgb.min(axis=2).astype(np.float32)
    light = ((lum >= min_lum) & (sat <= max_sat)) | (rgba[..., 3] < min_alpha)
    labels, _ = ndimage.label(light)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    border = border[border != 0]
    return np.isin(labels, border)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("--names", nargs="+", required=True, help="one name per character, left to right")
    ap.add_argument("--out", required=True)
    ap.add_argument("--min-lum", type=float, default=200, help="background/shadow brightness floor")
    ap.add_argument("--max-sat", type=float, default=28, help="background/shadow max colourfulness")
    ap.add_argument("--min-alpha", type=int, default=200, help="more transparent than this = background")
    ap.add_argument("--margin", type=int, default=8)
    args = ap.parse_args()

    im = Image.open(args.input).convert("RGBA")
    rgba = np.array(im)
    fg = ~background_mask(rgba, args.min_lum, args.max_sat, args.min_alpha) & (rgba[..., 3] >= args.min_alpha)

    # Characters = the N largest connected parts; everything else (steam, sparkles) is dropped.
    labels, n = ndimage.label(fg, structure=np.ones((3, 3)))
    sizes = ndimage.sum(fg, labels, range(1, n + 1))
    keep = np.argsort(sizes)[::-1][: len(args.names)] + 1
    objects = ndimage.find_objects(labels)
    boxes = sorted(((objects[k - 1], k) for k in keep), key=lambda t: t[0][1].start)

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    for name, ((ys, xs), k) in zip(args.names, boxes):
        m = args.margin
        y0, y1 = max(0, ys.start - m), min(rgba.shape[0], ys.stop + m)
        x0, x1 = max(0, xs.start - m), min(rgba.shape[1], xs.stop + m)
        crop = rgba[y0:y1, x0:x1].copy()
        crop[..., 3] = np.where(labels[y0:y1, x0:x1] == k, 255, 0)
        path = out / f"{name}.png"
        Image.fromarray(crop).save(path)
        print(f"{path}  {x1 - x0}x{y1 - y0}  ({int(sizes[k - 1])} px kept)")


if __name__ == "__main__":
    main()
