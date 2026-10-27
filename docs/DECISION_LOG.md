# Decision Log (decisions in force now)

| Date | Decision | Why |
|------|----------|-----|
| 2026-10-21 | System font (Noto Sans SC / PingFang / YaHei) instead of a pixel font | CJK pixel fonts are large; Mandarin is needed |
| 2026-10-21 | Drink cup still drawn by palette-swapping the `kopiC` pixel map (NEAREST, scaled x6) | Placeholder until drink art exists |
| 2026-10-21 | Vitest for pure systems (order parsing, scoring) | Order grammar is the core rule set; cheap to test |
| 2026-10-21 | Character art = AI-generated pixel-styled stills, HD finish (premultiplied LANCZOS), not a forced pixel grid | Forced grid broke outlines/faces (docs/art/finish-comparison.png); user chose option A |
| 2026-10-21 | Logical 360x640; backbuffer = logical x min(3, fit x DPR); camera zoom = render scale | Sharp HD art + CJK text on retina phones; fractional fit avoids big letterbox |
| 2026-10-21 | Player is a young owner, Jun or Mei (choice saved in localStorage); Uncle Tan = retired, mentioned only in v0.1 | User request |
| 2026-10-21 | Ah Gong uses a side-table slot; groups take the whole counter; tap a customer to choose who SERVE targets | Seated art + readable layout at 360 wide |
| 2026-10-22 | Day scene rebuilt as first-person stall POV with hands-on drag/pour/stir/serve, 3 cup spots, 2-minute days (StallScene) | User playtest: buttons not fun, day too long |
| 2026-10-22 | Greybox shapes first, art second; liquids drawn in code inside an empty-cup sprite | Prove the mechanics are fun before commissioning art; any drink combo renders |
| 2026-10-22 | Art to match the user's mockup exactly: clean background via ChatGPT edit, tools/cup cut from the mockup (2.5x of 360x640) | User wants the in-game look identical to the mockup |
| 2026-10-23 | Milestone grows from 3 days to a 30-day month with a story calendar (15 episodes, choices set flags, 3 endings by fame) | User request: short-drama style story, an episode every 2-3 days |
| 2026-10-23 | 90-second days; ♥ happiness replaced by Fame 名气 (0-100), which sets arrivals per day (8 + fame/12, 8-16) | User: days too long, customer volume should grow with reputation |
| 2026-10-23 | Customers walk in from the left street opening and queue (FIFO, max 3) behind the counter; walk = waddle on the still until `<key>-walk` frames exist | User wants walking + queue; no image/video generation route on this PC yet |
| 2026-10-23 | Episodes play in a separate DramaScene over the paused stall (scene.pause/launch) | Pausing tweens globally would freeze the overlay's own animation |
| 2026-10-23 | Chill pacing: 3-minute days, 6 customers on Day 1 (+1 per 15 fame, max 12), patience x2.2; closing time waits for counter customers (max 60 s) | Playtest: served under half the customers; day cut orders off |
| 2026-10-23 | Owner 'coach' thought bubble shows the next step for the cup being worked on | Playtest: hard to remember what each order needs |
| 2026-10-23 | Retuned: 2-minute days, 8 customers on Day 1 (+1 per 15 fame, max 15) | Playtest: 3 minutes with 6 customers felt too empty |
| 2026-10-23 | No order tickets: cups are matched to the waiting customer they fit best (oldest first), shown as 'for X' above the cup; the coach murmurs the latest order's recipe and the next step | Playtest: tapping customers to take orders got messy with several cups |
| 2026-10-23 | Regulars (Aunty Lim, Marcus, Ah Gong, kids) come once a day in their day period with their usual (1 in 4 something else); random walk-ins (office worker, uncle, student, auntie, tinted stand-ins until art) fill the rest of the fame count | User: most customers should be random people; the cast have their own preference and routine |
| 2026-10-25 | Big Brass Kettle, cozy rule: normal drinks unchanged (pot to FULL); poh = pot to half + hot water to FULL; gao = pot only, no water; no di lo for now | User picked the cozy option: nothing already learnt changes |
| 2026-10-26 | Phase D: each machine is one gesture. Halia/limau/butter/ice cream/bag are drops from new counter-top machines; gula melaka is dosed (2 drops = NORMAL), Teh C Special = gula, evap, teh, never stirred; tapau = bag it last; bulk rider = one person, 3 cups, one counter spot | Same cozy rule as the kettle: nothing already learnt changes, each new word adds one step |
| 2026-10-26 | When counter machines are owned, the radio, cat bed and cup warmer move to the back-wall ledge; tip jar, bell and fan stay at the counter ends | The counter top was too crowded for both |
| 2026-10-27 | Sugar Scoop / Milk Pump / gula melaka use a timing dial: drop on a cup, a needle sweeps the zones, tap to stop, the cup gets the middle of that zone | Playtest: dropping 1-3 doses was fiddly and the zone hard to read; user picked the dial |
| 2026-10-27 | Customers are drawn by distance (depth from feet y); groups walk up in single file | Playtest: kids and the queue overlapped in the wrong order |
| 2026-10-27 | A cup goes to its own customer ("for X") if dropped on them or anywhere up in the customer area; one drop zone per customer/group | Alpha: cups went to whoever stood in front (Ah Gong), drops between kids did nothing |
| 2026-10-27 | Cards, demos and stories wait for hands free (calm 0.4 s); one teaching moment per drink (featuresSeen); max 2 NEW ORDER cards a day | Alpha: pop-ups landed mid-pour/drag, same drink taught 2-3 times |
| 2026-10-27 | Pots pour only after resting 140 ms over a cup | Alpha: sweeping across plate 1 poured into it |
| 2026-10-27 | Mid-day checkpoint (run.midDay) on every serve/walk-out/story/lesson and on page hide; restart asks first and sits top-left | Alpha: reloads lost the day, a restart wiped a Day 4 save |
