# Spec: night shop (phase C)

Status: BUILT 2026-10-23 (user: "go for c"). Catalogue design: docs/specs/next-phase-plan.md + plan page.

- **Goal:** after each day's summary (from Day 3), Uncle Tan's Supplier Catalogue opens. Spend the day's earnings on machines that unlock drinks, tools that make pouring easier, comfort that makes customers patient or generous, and decor that adds fame every day. Purchases are saved in the run.
- **Acceptance:**
  1. From the Day 3 summary on, "Next day" opens the shop. It shows money, 4 aisles (Machines / Tools / Comfort / Decor) and item cards with name, 中文, price, effect, fame tier and state (buy / owned / locked by fame / coming next). "Open stall ▸ Day N" goes on.
  2. Buying deducts money, marks the item owned, saves the run, and is refused when money or fame is short.
  3. Every live item's effect works in the stall (see table). Fame-per-day items add their fame at the start of each day, with a HUD toast.
  4. Twin Sock Stand unlocks Cham / Cham O / Cham C. Horlicks Shelf adds a Horlicks tin tool and unlocks Horlicks / Horlicks peng / Horlicks Dinosaur. The next morning a regular orders it with a "new recipe" card, and it goes in the recipe book.
  5. `npm test` and the build pass; checked at 375×812.

## Live items and effects

| Item | Aisle | $ | Fame | Effect |
|---|---|---|---|---|
| Twin Sock Stand | machine | 55 | 25 | unlocks cham (kopi + teh in one cup) |
| Horlicks Shelf | machine | 35 | 0 | Horlicks tin tool; unlocks horlicks, horlicksDino |
| Ice Machine | machine | 60 | 25 | peng drinks +20¢ |
| Long-Spout Pot | tool | 25 | 0 | kopi / teh / milo / horlicks pour 25% faster |
| Sugar Scoop | tool | 15 | 0 | sugar drops in scoops: each drop = one zone (siew dai, normal, ga dai) |
| Milk Pump | tool | 20 | 25 | condensed / evap drop in doses: each drop = one zone |
| Brass Spoon | tool | 12 | 0 | stirs in 0.6 s instead of 1 s |
| Marked Glasses | tool | 10 | 0 | every cup shows the ¾ and FULL lines (not just ticketed ones) |
| Cup Rack Pro | tool | 18 | 25 | after a serve, a fresh cup drops onto that plate |
| Uncle Tan's Towel | tool | gift | – | given on Day 21: the first spill each day is forgiven |
| Standing Fan | comfort | 30 | 0 | customers wait 15% longer |
| Radio | comfort | 25 | 0 | +0.5 fame a day |
| Cup Warmer | comfort | 35 | 25 | hot drinks +10¢ tip |
| Bigger Tip Jar | comfort | 12 | 0 | tips +20% |
| Queue Bell | comfort | 10 | 0 | one more queue spot |
| Oyen's Cat Bed | comfort | 15 | 0 | +1 fame a day |
| Tissue Packets | comfort | 8 | 0 | +0.3 fame a day |
| Signboard | decor | 50 | 25 | +1 fame a day |
| Wall Menu Board | decor | 20 | 0 | a menu board on the wall lists today's drinks |
| Potted Plants | decor | 12 | 0 | +0.3 fame a day |
| Red Lanterns | decor | 25 | 25 | +0.5 fame a day |
| Neon "KOPI" Sign | decor | 45 | 75 | +1 fame a day, +1 customer a day |
| Fairy Lights | decor | 18 | 50 | +0.4 fame a day |

**Coming next (phase D, shown but not buyable):** Big Brass Kettle, Tarik Mugs, Halia Pot, Limau Squeezer, Mini Freezer, Gula Melaka Station, Butter Dish, Tapau Station, Fourth Tray Plate, Second Table.

## Approach
- Data `src/data/shop.js`: `{ id, aisle, name, zh, price (cents), tier (fame), text, effect, unlocks?, icon, soon? }`.
- Pure `src/systems/shop.js`: `shopState(item, run)` → buy / owned / fame / money / soon; `buy(run, item)` → new run; `perks(owned)` → one modifiers object (pourMult, sugarScoop, milkPump, stirMs, marked, autoCup, towel, patienceMult, famePerDay, hotTip, tipMult, queueBonus, icedTip, menuBoard, extraCustomers, features[]). Tests.
- Run: `owned: []`, `newItems: []` (machines bought last night → recipe card next morning).
- `menu.js`: unlocked features = the calendar + owned machines' `unlocks`.
- Drinks: bases `cham` (made by pouring both kopi and teh) and `horlicks` (a malt drink like Milo). Grammar, prices, colours, hints, book, glossary.
- `ShopScene`: night-tinted stall background, aisle tabs, a scrolling card list, money, Open stall.
- `StallScene`: reads `perks` at create; applies them where each rule lives.
- Item icons: emoji placeholders until the catalogue art arrives (ASSET_LIST 5.4–5.7).

## Test plan
`npm test` (shop rules, perks, cham/horlicks grading and parsing, menu unlocks), `npm run build`, browser at 375×812: Day 3 summary → shop → buy → open → effects (fame toast, faster pour, sugar scoop, Horlicks tool + card).

## Tasks
- [x] C1 shop data + rules + tests
- [x] C2 cham + horlicks drinks
- [x] C3 shop scene + flow + save
- [x] C4 perks in the stall
- [x] C5 machine recipe cards + book + menu board
- [x] C6 verify + commit

Build notes: the lesson queue holds the calendar lesson plus any machine bought last night; a teacher who is
already at the stall takes the new order instead of a twin walking in. Group teachers (the kids) need the whole
counter, so their card can come later in the day. Item icons are emoji placeholders; the Horlicks tin is code-drawn.
