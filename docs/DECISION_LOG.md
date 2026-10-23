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
