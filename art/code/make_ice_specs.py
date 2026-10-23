"""Write the PixelSpecs for the peng ice cubes (code-drawn, no image model).

Each cube is hand-drawn below without an outline; this adds its own 1 px dark ring so cubes in a
cluster stay separate where they overlap. Render with codeart2d render_pixelspec.py.
"""
import json
from pathlib import Path

# t top face, e top-face front edge, l left face, r right face, v centre edge,
# w glint, h left highlight, s right shade, b bubble
def iso_cube(a, side):
    """A 2:1 isometric cube: top diamond 2a+1 wide and a+1 tall, sides `side` px tall.
    Corners are softened by one pixel so it reads cute, faces keep crisp edges."""
    w, h = 2 * a + 1, a + 1 + side
    cx, half = a, a / 2
    rows = []
    for y in range(h):
        row = ""
        for x in range(w):
            dx = abs(x - cx)
            top = dx / a + abs(y - half) / half <= 1.0001
            # sides: below the top diamond's lower edges, down by `side`
            edge_y = half + (1 - dx / a) * half  # lower edge of the diamond at this column
            body = y > edge_y - 0.5 and y <= edge_y + side - 0.5 + 0.0001 and y >= half
            c = "."
            if top:
                c = "e" if y >= edge_y - 0.6 and y > half else "t"
            elif body:
                c = "l" if x < cx else "r" if x > cx else "v"
            row += c
        rows.append(row)
    # soften the six corners: drop lone outermost pixels
    rows[0] = rows[0].replace("t", ".", 1)
    for y in (int(half), int(half) + 1):
        r = list(rows[y])
        if r[0] != ".": r[0] = "."
        if r[-1] != ".": r[-1] = "."
        rows[y] = "".join(r)
    r = list(rows[-1]); rows[-1] = "".join(c if abs(i - cx) < a - 1 else "." for i, c in enumerate(r))
    # glints and shading
    g = [list(r) for r in rows]
    def put(x, y, c, only):
        if 0 <= y < h and 0 <= x < w and g[y][x] in only: g[y][x] = c
    put(cx - 2, 1, "w", "t"); put(cx - 1, 1, "w", "t"); put(cx - 3, 2, "w", "t")
    for y in range(int(half) + 3, int(half) + 3 + max(2, side // 2)):
        put(1, y, "h", "l")
    for y in range(int(half) + 3, int(half) + 2 + max(2, side // 2)):
        put(w - 2, y, "s", "r")
    put(cx - 2, h - 4, "b", "l")
    return [r for r in ("".join(r) for r in g) if r.strip(".")]


CUBE_BIG = iso_cube(6, 7)
CUBE_SMALL = iso_cube(5, 6)

PALETTE = {
    "k": "#2c4a63",  # outline: deep icy blue (softer than the characters' brown-black)
    "t": "#eefaff",
    "l": "#c4e9f9",
    "r": "#93cbe6",
    "w": "#ffffff",
    "h": "#f4fcff",
    "s": "#78b4d6",
    "b": "#e6f7ff",
    "e": "#d6f1fc",
    "v": "#aedaef",
}


def outlined(rows):
    """Pad by 1 and paint the 4-neighbour ring around the drawn pixels with 'k'."""
    w, h = len(rows[0]) + 2, len(rows) + 2
    grid = [["."] * w for _ in range(h)]
    for y, row in enumerate(rows):
        for x, c in enumerate(row):
            if c != ".":
                grid[y + 1][x + 1] = c
    out = [r[:] for r in grid]
    for y in range(h):
        for x in range(w):
            if grid[y][x] != ".":
                continue
            if any(0 <= y + dy < h and 0 <= x + dx < w and grid[y + dy][x + dx] != "." for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                out[y][x] = "k"
    return ["".join(r) for r in out]


def spec(name, canvas, layers):
    return {
        "schema": "codeart2d.pixelspec.v1",
        "name": name,
        "canvas": canvas,
        "palette": PALETTE,
        "outline": {"mode": "none"},
        "poses": {"big": outlined(CUBE_BIG), "small": outlined(CUBE_SMALL)},
        "layers": layers,
    }


here = Path(__file__).parent
# one cube, 1 px transparent margin around it
(here / "ice_cube.pixelspec.json").write_text(json.dumps(spec("ice_cube", [17, 16], [
    {"name": "cube", "origin": [1, 1], "rows": "big"},
]), indent=2))
# three cubes floating together: one behind, a big one front-left, a small one front-right
(here / "ice_cluster.pixelspec.json").write_text(json.dumps(spec("ice_cluster", [29, 19], [
    {"name": "back", "z": 0, "origin": [8, 1], "rows": "big"},
    {"name": "front_left", "z": 1, "origin": [1, 4], "rows": "big"},
    {"name": "front_right", "z": 2, "origin": [14, 6], "rows": "small"},
]), indent=2))
print("ok")
