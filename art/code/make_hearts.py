"""Draw the friendship hearts as pixel art (code-drawn, no image model), in the sprites' style:
thick dark outline, 2-3 tone shading lit from the top-left, a white glint.

  .venv/Scripts/python art/code/make_hearts.py

Writes art/code/heart.png + heart_empty.png (1 px per pixel) and public/sprites/heart.png +
heartEmpty.png at 3x (nearest neighbour, so they stay crisp at the game's 3x render scale).
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]

# 11 x 10. o outline, h highlight, p pink, s shade, w glint, . clear
HEART = [
    "..ooo.ooo..",
    ".ohhpopppo.",
    "ohwhppppppo",
    "ohhppppppso",
    "ohpppppppso",
    ".opppppsso.",
    "..opppsso..",
    "...opsso...",
    "....oso....",
    ".....o.....",
]

FULL = {"o": (58, 36, 30), "h": (255, 160, 178), "p": (232, 80, 106), "s": (178, 46, 74), "w": (255, 255, 255)}
EMPTY = {"o": (120, 96, 90), "h": (250, 236, 236), "p": (240, 220, 222), "s": (214, 190, 194), "w": (255, 250, 250)}


def draw(colours, scale):
    h, w = len(HEART), len(HEART[0])
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for y, row in enumerate(HEART):
        for x, c in enumerate(row):
            if c != ".":
                im.putpixel((x, y), (*colours[c], 255))
    return im.resize((w * scale, h * scale), Image.NEAREST)


for name, sprite, colours in [("heart", "heart", FULL), ("heart_empty", "heartEmpty", EMPTY)]:
    draw(colours, 1).save(ROOT / "art" / "code" / f"{name}.png")
    draw(colours, 3).save(ROOT / "public" / "sprites" / f"{sprite}.png")
    print(f"art/code/{name}.png, public/sprites/{sprite}.png")
