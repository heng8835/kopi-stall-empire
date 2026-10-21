"""Prepare AI-generated character stills for the sprite pipeline.

Removes a plain light background by flood-filling from the image border (so white
clothing inside the dark outline survives), drops floor shadows and loose decorations
(steam, sparkles) that are not attached to a character, and writes one transparent PNG
per character, left to right.

  python tools/prep_still.py art/source/owner-jun-mei.webp --names jun mei --out art/prepped
  python tools/prep_still.py art/source/stall-assets.webp --key auto --grid 4 6 --names kopiPot tehPot - - ... --out art/prepped

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
    ap.add_argument("--regions", nargs="+", help="x0:x1 pixel column range per character (for crowded images); the largest part inside each range is kept")
    ap.add_argument("--grid", nargs=2, type=int, metavar=("COLS", "ROWS"), help="asset sheet laid out in a grid: --names in row order, '-' skips a cell; the largest part per cell is kept (captions dropped)")
    ap.add_argument("--key", help="flat background colour to remove: 'auto' (sample the corner) or #rrggbb")
    ap.add_argument("--key-tol", type=float, default=30, help="colour distance still counted as background for --key")
    args = ap.parse_args()

    im = Image.open(args.input).convert("RGBA")
    rgba = np.array(im)
    if args.key:
        key = rgba[2, 2, :3].astype(np.float32) if args.key == "auto" else np.array([int(args.key[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
        dist = np.sqrt(((rgba[..., :3].astype(np.float32) - key) ** 2).sum(axis=2))
        fg = (dist > args.key_tol) & (rgba[..., 3] >= args.min_alpha)
    else:
        fg = ~background_mask(rgba, args.min_lum, args.max_sat, args.min_alpha) & (rgba[..., 3] >= args.min_alpha)

    if args.grid:
        cols, rows = args.grid
        cw, ch = rgba.shape[1] / cols, rgba.shape[0] / rows
        out = Path(args.out)
        out.mkdir(parents=True, exist_ok=True)
        for idx, name in enumerate(args.names):
            if name == "-":
                continue
            r, c = divmod(idx, cols)
            y0, y1, x0, x1 = int(r * ch), int((r + 1) * ch), int(c * cw), int((c + 1) * cw)
            cell = fg[y0:y1, x0:x1]
            lab, k = ndimage.label(cell, structure=np.ones((3, 3)))
            if not k:
                print(f"{name}: empty cell")
                continue
            big = np.argmax(ndimage.sum(cell, lab, range(1, k + 1))) + 1
            ys, xs = ndimage.find_objects((lab == big).astype(np.int32))[0]
            m = args.margin
            cy0, cy1 = max(0, ys.start - m), min(cell.shape[0], ys.stop + m)
            cx0, cx1 = max(0, xs.start - m), min(cell.shape[1], xs.stop + m)
            crop = rgba[y0 + cy0:y0 + cy1, x0 + cx0:x0 + cx1].copy()
            crop[..., 3] = np.where(lab[cy0:cy1, cx0:cx1] == big, 255, 0)
            Image.fromarray(crop).save(out / f"{name}.png")
            print(f"{out / (name + '.png')}  {cx1 - cx0}x{cy1 - cy0}")
        return

    if args.regions:
        if len(args.regions) != len(args.names):
            ap.error("--regions needs one range per name")
        # One label per region: the largest connected part inside that column range.
        labels = np.zeros(fg.shape, dtype=np.int32)
        for i, rng in enumerate(args.regions, start=1):
            x0, x1 = (int(v) for v in rng.split(":"))
            sub = np.zeros_like(fg)
            sub[:, x0:x1] = fg[:, x0:x1]
            lab, k = ndimage.label(sub, structure=np.ones((3, 3)))
            if k:
                big = np.argmax(ndimage.sum(sub, lab, range(1, k + 1))) + 1
                labels[(lab == big) & (labels == 0)] = i
        n = len(args.names)
    else:
        # Characters = the N largest connected parts; everything else (steam, sparkles) is dropped.
        labels, n = ndimage.label(fg, structure=np.ones((3, 3)))
    sizes = ndimage.sum(fg, labels, range(1, n + 1))
    keep = (np.arange(n) + 1) if args.regions else np.argsort(sizes)[::-1][: len(args.names)] + 1
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
