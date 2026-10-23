# Asset list: everything for a smooth game (2026-10-23)

How to make them: same style and pipeline as `docs/ART_BIBLE.md`.
- Plain flat white background, no shadow, no text, no logos.
- One item per cell. Sheets of 4–6 items cut cleanly.
- Animation frames go left to right in one row: same canvas size and same feet/base line in every frame.
- Drop the images into `art/source/` and tell me the file names. Send them while I'm idle, not mid-task (images sent mid-turn don't save).

**Legend**

| Mark | Meaning |
|---|---|
| ✅ | already have / I make it in code |
| P1 | phase A (making drinks, clock, tutorial, recipe calendar) |
| P2 | night shop and polish |
| P3 | later |

## 1. Drink making (P1: the biggest smoothness win)

| # | Asset | Frames | Notes |
|---|---|---|---|
| 1.1 | **Pour poses for every pouring tool** | 1 each × 7 | Each tool tilted about 40°, spout or opening pointing down-left, as if mid-pour: kopi pot, teh pot, condensed milk can, evaporated milk can, sugar can (or scoop), Milo tin, Horlicks tin (plain, no logo). Replaces rotating the upright picture. |
| 1.2 | Spoon stirring | 3 | The spoon in a cup at three angles: left, upright, right. |
| 1.3 | Cup on saucer, clean glass | 1 | Our glass mug again with a clean edge (the current one has a white speckled fringe). I can also clean it myself. |
| 1.4 | Traditional ceramic kopi cup + saucer | 1 | Thick white cup with a green or red rim line, for hot drinks (very kopitiam). Optional; glass for everything also works. |
| ✅ | Liquid, surface, milk clouds, sugar grains, splashes, steam, condensation | – | Drawn in code (the approved preview). |
| ✅ | Ice cubes | – | Code-drawn pixel art, done. |
| 1.5 | Milo powder mountain | 1 | A heap of dry Milo powder, to sit on top of a glass. Optional; code draws one now. |
| 1.6 | Bin lid open / closed | 2 | The bin is still a grey box drawn in code. |

## 2. Customers feel alive (P1 / P2)

| # | Asset | Frames | Notes |
|---|---|---|---|
| 2.1 | **Taxi Uncle, standing, no taxi** | 1 | P1. He teaches "ga dai" at the counter on Day 8. The current art is welded to his taxi. |
| 2.2 | **Makcik, standing, no stall** | 1 | P1. She teaches "peng" on Day 5. The current art has the stall and sign attached. |
| 2.3 | Reaction faces for counter customers | 2 each × 6 | P2. A happy (perfect) and a sad (oops) version of Aunty Lim, Marcus, Darren, Wei Ling, Hafiz and Jia Hui. Same pose, only the face changes. |
| 2.4 | Walk cycles | 4 each × 6 | P2. Side view walking right, same 6 characters. Prompt in ART_BIBLE. |
| 2.5 | Ah Gong reading, page-turn | 2 | P3. An idle loop at his table. |
| 2.6 | Oyen idle + knock-cup pose | 2–3 | P3. Sleeping loop and a paw swipe for the "daily tax". |

## 3. HUD, clock and day bar (P1)

| # | Asset | Frames | Notes |
|---|---|---|---|
| 3.1 | **Kopitiam wall clock face** | 1 | Round, wood rim, cream face, 12 numbers, no hands, no brand. Code draws a clean one until it arrives. |
| 3.2 | **Hour hand + minute hand** | 2 | Separate pieces, pointing straight up, ornate black. |
| 3.3 | **Period icons** | 4 | Morning sunrise, lunch (rice bowl + sun), teatime (cup + afternoon sun), closing (shutter half down + moon). |
| 3.4 | Last-orders bell | 1–2 | Brass hand bell; second frame tilted for the ring. |
| 3.5 | **Fame badge** | 1 | A small round red badge or rosette for 名气, no text. |
| 3.6 | Coin icon | 1 | Generic gold coin for the money counter. |
| 3.7 | **Recipe book icon + open book page** | 2 | Small worn notebook (Uncle Tan's) for the HUD button, plus a blank open notebook spread for the recipe book screen. |

## 4. Tutorial and recipe cards (P1)

| # | Asset | Frames | Notes |
|---|---|---|---|
| 4.1 | **Recipe card** | 1 | Blank cream index card with a little tape on top: background for "new recipe" cards. |
| 4.2 | **Uncle Tan, standing, pointing** | 1 | The tutorial host. The rain uncle art works now, but a version with a teaching pose and towel would be nicer. |
| 4.3 | Hand/finger pointer | 2 | Cartoon pointing hand, normal + pressed, to show drag directions. |
| 4.4 | Big "NEW!" burst | 1 | Star-burst shape, no text (I add the words). |

## 5. Night shop (P2)

| # | Asset | Frames | Notes |
|---|---|---|---|
| 5.1 | Night stall background | 1 | Same view as the day stall at night: shutter half down, one warm bulb. Easiest: a ChatGPT edit of `stall-bg`. |
| 5.2 | Supplier catalogue book | 1 | Open order book with blank pages. |
| 5.3 | Price tag, SOLD stamp, padlock | 3 | Blank shapes, no text. |
| 5.4 | Machines | 12 | Brass kettle, tarik mugs, halia pot, limau squeezer + calamansi, twin coffee-sock stand, Horlicks tin (no logo), mini freezer, gula melaka bottle, butter dish, tapau bags + red string, ice machine, extra tray plate. |
| 5.5 | Tools | 7 | Long-spout pot, sugar scoop, milk pump, brass spoon, marked glass, cup rack, big ice scoop. |
| 5.6 | Comfort | 8 | Standing fan, retro radio, cup warmer, tip jar, bell, cat bed, marble table + stools, tissue packets. |
| 5.7 | Decor | 6 | Blank signboard, blank menu board, potted plants, red lanterns, neon "KOPI" sign, fairy lights. |

## 6. New drinks (P3)

Ginger slices, calamansi half, butter cube, ice cream scoop, gula melaka layer, tarik froth, Horlicks powder heap,
a takeaway bag with a red string handle, and two tarik mugs mid-pour (2 frames).

## 7. Still blocked or nice to have

- Sophie without the flag keychain / Merlion print (blocked since v0.1).
- A delivery rider with no logo (for tapau bulk orders).
- Story portraits with expressions (shocked / crying / laughing) for the big twists: Aunty Lim, Kenneth, Uncle Tan, Marcus. 1–2 each.

## Phase A needs only these (everything else can wait)

1.1 pour poses (7) · 1.2 spoon (3) · 2.1 Taxi Uncle standing · 2.2 Makcik standing · 3.1–3.3 clock face, hands, period icons ·
3.5 fame badge · 3.7 recipe book · 4.1 recipe card.
I build with code stand-ins now and swap each one in as it arrives. Nothing blocks the build.
