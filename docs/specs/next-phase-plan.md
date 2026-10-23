# Spec (DRAFT, awaiting approval): pour bar, HD liquid, wall clock, menu unlocks, night shop

Status: decisions 1-5 APPROVED 2026-10-23 (2: bar near the top but not too high, just above the order bubbles; 4 reshaped as story-paced unlocks); 6 decided: keep Horlicks. Visual version for the user: docs/plan/stall-upgrade-plan.html
(published: https://claude.ai/artifact/G28FFgiywwDqsGwrmLoE8z). Waiting on the user's approval of the 6 decisions + art.

## Decisions proposed (all recommended)
1. Condensed milk is the sweetener for Kopi / Teh (siew dai = less condensed, ga dai = more); sugar can only for O and C.
   "Kopi kosong" / "Teh kosong" are not ordered (customers say "C kosong").
2. Pour bar: horizontal, full width, docked under the HUD while pouring; names the cup; labelled zones per ingredient
   (condensed: none/siew dai/normal/ga dai/too sweet · sugar: kosong/…/ga dai · evap: none/C normal/too milky ·
   fill: ¾ peng / full / spill · water (later): di lo/gao/normal/poh/watery). The meter beside the cup is removed.
3. Liquid = HD greyscale layers tinted + cropped by code (body, surface, ice, milk cloud, drops, steam, spill, shine);
   Claude makes an HD stand-in first, user art replaces it.
4. Starter menu: Kopi/Kopi O/Kopi C/Teh/Teh O/Teh C × kosong/siew dai/normal × hot/peng + Milo, Milo Peng, Milo Dinosaur.
   Ga dai unlocks free at fame 20; everything else from the shop.
5. Night shop after each day's summary from Day 3; items gated by fame tiers 0/25/50/75; purchases saved in the run.
6. DECIDED: keep the real name Horlicks (as with Milo); no logo on any art.

## Clock
Taller HUD: wall clock sprite (hour hand 7am→7pm over the 90 s day, minute hand spins), day bar with periods
Morning 7–11 / Lunch rush 11–2 / Teatime 2–5 / Closing 5–7, moving marker, bell at last orders (5pm).

## Catalogue (prices in $, fame tier)
Machines: Big Brass Kettle 45/0 (gao/poh/di lo) · Tarik Mugs 40/25 · Halia Pot 35/25 · Limau Squeezer 30/0 ·
Twin Sock Stand 55/25 (cham) · Malt Shelf 35/0 · Mini Freezer 70/50 (Milo Godzilla) · Gula Melaka Station 50/50
(Teh C Special) · Butter Dish 20/25 (Kopi Gu You) · Tapau Station 40/50 · Ice Machine 60/25 · Fourth Tray Plate 65/50.
Tools: Long-Spout Pot 25 · Sugar Scoop 15 · Milk Pump 20/25 · Brass Spoon 12 · Marked Glasses 10 · Cup Rack Pro 18/25 ·
Big Ice Scoop 10 · Uncle Tan's Towel (story gift, Day 21).
Comfort: Standing Fan 30 · Radio 25 · Cup Warmer 35/25 · Bigger Tip Jar 12 · Queue Bell 10 · Oyen's Cat Bed 15 ·
Second Table 60/50 · Tissue Packets 8.
Decor: Signboard 50/25 · Wall Menu Board 20 · Potted Plants 12 · Red Lanterns 25/25 · Neon "KOPI" Sign 45/75 · Fairy Lights 18/50.

## Build order
A pour bar + HD liquid + condensed rule + Teh O + clock · B order tickets (docs/specs/order-tickets-day-summary.md) ·
C night shop + power-ups + menu unlocks + wall menu board · D new drink mechanics (water/strength, tarik, halia,
limau, layered, cham, butter, ice cream, tapau + delivery rider).

## Art needed (P1 first): see the "Art I need from you" section of the plan page.

## Recipe calendar (replaces the big starter menu; approved idea)
Day 1: Kopi, Kopi O, Teh, Teh O, hot only (Day 1 tutorial) · Day 2: Milo Dinosaur (kids, Ep 2; first ice, the 3/4 rule) ·
Day 3: C + kosong (Marcus, Ep 3) · Day 3 night: shop opens · Day 4: siew dai (Aunty Lim) · Day 5: peng for kopi/teh (Makcik, Ep 4) ·
Day 6: Milo, Milo Peng (Darren) · Day 8: ga dai (Taxi Uncle) · Day 11: gao/poh if the Big Kettle is owned (Ah Gong).
Each unlock: a regular orders it their way -> "new recipe" card (steps + pour-bar zone) -> added to the recipe book; they order it more that day.
Customer orders are filtered to unlocked recipes. Shop machines: next morning a customer orders the special, with a card.

## Day 1 tutorial (rework of Uncle Tan's notes, skippable)
Welcome (walk-in, bubble, patience) -> make Kopi (cup, pot to FULL, condensed to NORMAL, stir, serve) -> Teh -> Kopi O (sugar instead of milk)
-> recipe book card (4 recipes) -> Fame card -> day bar/clock card -> Episode 1.

## Art done
Ice cubes, code-drawn (no image model): art/code/make_ice_specs.py -> ice_cluster.png / ice_cube.png (review: docs/plan/ice-review.png).
