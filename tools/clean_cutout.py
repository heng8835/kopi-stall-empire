"""Clean up a cut-out sprite in art/prepped/ before tools/build_sprites.py.

A flat-key cutout (prep_still.py --key) of a small, lossy source leaves two kinds of dirt:
  - pin holes and cracks: dark shading inside the art close to the key colour was keyed out, so
    the background shows through as dots and streaks (glass, metal shadows). Transparent pockets
    that don't touch the edge of the image and are small or thin are filled from the nearest
    opaque pixel. Wide ones (a cup's handle gap, the inside of a glass) stay see-through.
  - a speckled rim: light or key-coloured pixels on the outer edge. Each rim pixel that is much
    lighter than the art just inside it, or close to the key colour, takes the colour from inside.

  .venv/Scripts/python tools/clean_cutout.py toolStir cupGlass ...      # cleans art/prepped/<key>.png in place
  .venv/Scripts/python tools/clean_cutout.py --out art/cleaned toolStir  # writes elsewhere instead

Then run tools/build_sprites.py for the same keys. Needs Pillow, numpy and scipy (the project .venv).
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "art" / "prepped"


def lum(rgb: np.ndarray) -> np.ndarray:
    return 0.3 * rgb[..., 0] + 0.59 * rgb[..., 1] + 0.11 * rgb[..., 2]


def clean(rgba: np.ndarray, hole_max: float, rim_lift: float, key_tol: float, thin: float = 2.5) -> tuple[np.ndarray, int, int]:
    rgb = rgba[..., :3].astype(np.float32)
    solid = rgba[..., 3] >= 128
    # the key colour: what the cut-away pixels still hold (the crop keeps their RGB)
    key = np.median(rgb[~solid], axis=0) if (~solid).any() else np.array([0, 0, 0], np.float32)

    # 1. pin holes: small transparent pockets enclosed by the art
    lab, n = ndimage.label(~solid)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    sizes = ndimage.sum(~solid, lab, range(1, n + 1))
    limit = max(12, hole_max * solid.sum())
    # how wide each pocket is at its widest (a keyed-out streak is a crack; a handle gap is wide)
    depth = ndimage.distance_transform_edt(~solid)
    widest = ndimage.maximum(depth, lab, range(1, n + 1))
    holes = np.isin(lab, [i + 1 for i in range(n) if (i + 1) not in edge and (sizes[i] <= limit or widest[i] <= thin)])
    filled = solid | holes

    # 2. the rim: opaque pixels next to see-through ones (the outside, or a big pocket like a handle gap)
    rim = filled & ndimage.binary_dilation(~filled, structure=np.ones((3, 3)))
    inner = filled & ~rim
    # where each pixel would take its colour from: the nearest solid, non-hole pixel (for holes),
    # the nearest pixel just inside the rim (for rim specks)
    _, src_solid = ndimage.distance_transform_edt(~(solid & ~holes), return_indices=True)
    _, src_inner = ndimage.distance_transform_edt(~inner, return_indices=True)
    out = rgba.copy()
    hy, hx = np.nonzero(holes)
    out[hy, hx, :3] = rgba[src_solid[0][hy, hx], src_solid[1][hy, hx], :3]
    out[hy, hx, 3] = 255

    ry, rx = np.nonzero(rim)
    inside_rgb = rgb[src_inner[0][ry, rx], src_inner[1][ry, rx]]
    here = rgb[ry, rx]
    light = lum(here) - lum(inside_rgb) > rim_lift
    keyish = np.sqrt(((here - key) ** 2).sum(axis=1)) < key_tol
    bad = light | keyish
    keep = filled.copy()
    keep[ry[bad], rx[bad]] = False  # a light or key-coloured speck on the rim goes
    # stray pixels sticking out past the outline (2 or fewer neighbours) go too, twice over
    for _ in range(2):
        neighbours = ndimage.convolve(keep.astype(np.int32), np.ones((3, 3), np.int32), mode="constant") - keep
        keep &= ~(keep & (neighbours <= 2))
    out[..., 3] = np.where(keep, 255, 0)
    return out, int(holes.sum()), int((filled & ~keep).sum())


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("keys", nargs="+")
    ap.add_argument("--out", help="write here instead of cleaning art/prepped in place")
    ap.add_argument("--hole-max", type=float, default=0.01, help="largest pocket filled, as a share of the sprite's area")
    ap.add_argument("--thin", type=float, default=4, help="a pocket no wider than this (px from its middle to the art) is a crack, filled at any length")
    ap.add_argument("--rim-lift", type=float, default=45, help="a rim pixel this much lighter than inside is a speck")
    ap.add_argument("--key-tol", type=float, default=60, help="a rim pixel this close to the key colour is a speck")
    args = ap.parse_args()
    out_dir = Path(args.out) if args.out else SRC
    out_dir.mkdir(parents=True, exist_ok=True)
    for key in args.keys:
        src = SRC / f"{key}.png"
        if not src.exists():
            print(f"MISSING {src}")
            continue
        rgba = np.array(Image.open(src).convert("RGBA"))
        cleaned, holes, specks = clean(rgba, args.hole_max, args.rim_lift, args.key_tol, args.thin)
        Image.fromarray(cleaned).save(out_dir / f"{key}.png")
        print(f"{key}: {holes} hole px filled, {specks} rim specks removed")


if __name__ == "__main__":
    main()
