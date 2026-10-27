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
| 2026-10-27 | Money follows quality: perfect = price + tip (+10c per perfect in a row, max +50c), close = 60%, wrong drink = no charge; day-end fame bonus +1/+2 for 2/3 stars; +1 customer per 5 fame | Alpha: a wrong drink paid more than the right one, fame and customers didn't move |
| 2026-10-27 | Walk-ins come in little rushes; an empty stall runs the clock 4x | Alpha: long dead air, rushes were the fun part |
| 2026-10-27 | Night shop from Day 1; Ice Machine $35/+40c, Cup Warmer $25/+20c, Tip Jar +50%; summary shows "your upgrades earned" | Alpha: nothing to chase early, upgrades didn't feel |
| 2026-10-27 | Day 1: Aunty Lim says her teh in one line and you make it (no watch-first demo); shorter EP1 intro | Alpha: ~2 min to the first pour |
| 2026-10-27 | Story teasers say when (tomorrow / Day 5); a story choice can change what the guest pays (guestPays, guestCups) | Alpha: "EP 4" read as tomorrow; "on the house" changed nothing |
| 2026-10-27 | Shop buys need a second tap; shop/book scroll use world coords (fixes phone scrolling) | Alpha: list wouldn't scroll on phone, a scroll could buy |
| 2026-10-27 | A cup labelled "for X" goes to X anywhere in the customer area; only a drop on another person's body takes it, and only if it grades as well for them. Bubbles never steal a cup | Alpha 2: Ah Gong hidden behind the front row, 4/5 players' cups went to the wrong person |
| 2026-10-27 | Pop-ups wait for the tray too (no half-made/unserved cup, or 6 s idle); demos use their own empty plate (skipped if none) and freeze everyone's patience | Alpha 2: demo built in the player's cup, cards mid-cup, patience drained during demos |
| 2026-10-27 | Today's new recipe is off the menu until its card has been shown (teach before the order) | Alpha 2: Milo Dinosaur ordered at 7:30am, card at 12:45pm |
| 2026-10-27 | 7pm: no new arrivals, but the line already there is still served (90 s + 15 s per queued person); if it runs out they say goodbye, no walk-out, no fame lost | Alpha 2: the queue "vanished" at closing (4/5) |
| 2026-10-27 | Star fame shows on the HUD the moment the day-end card opens; card says "+N today · ★ +M" | Alpha 2: HUD and card fame never matched (5/5) |
| 2026-10-27 | A next-goal line (systems/shop.js nextGoal) on the day-end card and the shop; every 5th perfect in a row = COMBO pop + $1.00; "Best combo" on the card | Alpha 2: nothing to chase, combo counter paid nothing visible |
| 2026-10-27 | Day 1: Aunty Lim walks straight in and you make her teh; EP1 (her intro + the note on the tin) plays after that cup | Alpha 2: first cup still ~2 min in |
| 2026-10-27 | Shop confirm changes the button in place (no list rebuild), 8 s window; "Save & back" on the day-end card resumes at that night's shop (run.night) | Alpha 2: slow confirm lost a purchase; Save & back skipped the shop |
| 2026-10-27 | Day 1 back to: Aunty Lim walks in, greets you, the ghost-hand demo makes her teh, you serve it, then EP1 (she stays at the counter through it) | Owner playtest: "Aunty Lim should come in first, then show us the demo" |
| 2026-10-27 | Music: all tracks downloaded one after another at boot (title, intro, day first); fade-in 0.15 s | Owner playtest: music came in late on the intro, title and stall (each mp3 was fetched only when its scene started) |
| 2026-10-27 | Pour meter docks at y 176 (under the bubbles, above the pot), bigger bar and text; the status keeps its size, the label shrinks | Owner playtest: the meter under the cups was covered by the pouring hand; alpha 2 header overlap |
| 2026-10-27 | P2 pass: drama Skip in its own pill under the HUD, hidden during choices; bigger outlined +$ pop from the chest; hearts 14 px, off the Recipes tab; Ah Gong's bubble ends before the tab; long order lines one size down | Alpha 2 overlaps (4-5/5) |
| 2026-10-27 | Bin takes a cup over its top half; the spoon always finishes stirring, a cup served mid-stir counts as stirred, spoon on an empty cup says pour first | Alpha 2 (Wei Jie): bin and spoon drops failed |
| 2026-10-27 | {greet} (Morning/Afternoon/Evening) filled when the bubble shows; Marcus is EP3's guest and his 50c tip is paid; the boast says "also 10/10" after a 10 | Alpha 2 story continuity |
| 2026-10-27 | Upgraded tools get a gold name tag (brass spoon tinted brass); more shop items use real sprites; a cup with no customer says "next customer"; equal fits go to the customer over that plate | Alpha 2: upgrades invisible, Cup Rack Pro "empty cup", cups out of order |
| 2026-10-28 | Orders lock once a card, demo or cup is for them; a lesson never rewrites a locked or story-guest order; bringGuest reuses a regular who is already in (no twin) and drops their scheduled visit | Alpha 3 P0 (3/5): Marcus's order switched to Teh O limau and a second Marcus appeared on Day 3 |
| 2026-10-28 | Pop-ups wait 1.2 s after any touch (CALM_MS 1200, pointer down = not calm) | Alpha 3 P0: recipe cards and EP2 landed mid-pour |
| 2026-10-28 | Day-end card drops optional lines (quote, zh tip, extra rows, slips) then scales text (min 0.8) to fit the screen; month bar shows at least 1 box | Alpha 3 P0: card taller than the screen from Day 4 |
| 2026-10-28 | A spoon re-dropped on a cup still stirring finishes it now (never ignored); stir timers only finish their own cup; grabbing a tool mid-glide kills the glide | Alpha 3 P0 (Alex): second spoon drop did nothing |
| 2026-10-28 | Aunty Lim rates your day from cups you made (demo cups left out), shown as "Aunty Lim rates your day: X/10 (N of M cups perfect)"; EP1 opens "Your own first teh at this stall" | Alpha 3 P0 (5/5): "Aunty Lim's teh X/10" unexplained |
| 2026-10-28 | Day 1: after her demo teh, Aunty Lim asks "Now you try!" for a second teh you make yourself, before EP1 (step cups: 2, again) | Owner chose option (b): own first pour sooner, demo kept |
