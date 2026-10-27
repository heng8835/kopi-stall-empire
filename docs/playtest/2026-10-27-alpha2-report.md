# Alpha playtest, round 2 — 2026-10-27

The same five simulated players (same personas, same brief, same harness: `tools/playtest/harness.js`)
played the build with the P0 + P1/P2 fixes (`c7be925`, `533ef19`), each from a fresh save, on a phone-sized screen.
Round 1 is in `2026-10-27-alpha-report.md`. Reviews and ~320 screenshots: session scratchpad `alpha2/`.

> Same caveats as round 1: the game clock is frozen while agents think (less time pressure than a real player),
> no audio, and the "Copy playtest notes" button they saw only exists on the dev server.
> Wei Jie scripted a few coach-led orders on Days 2–4; his "oops" results there are not counted as bugs.

## How far they got

| Player | Round 1 | Round 2 |
|---|---|---|
| Wei Jie | Quit Day 4, 1:45pm (three NEW ORDER cards mid-rush) | Played to end of Day 4, stopped: nothing affordable, next episode not till Day 5, drinks "same-same" |
| Auntie Mary | Day 1–2, nearly quit (couldn't serve Ah Gong) | Day 1–2 as planned, didn't quit; flustered at lunch rush / "+7 waiting" |
| Alex | Day 1–4, interest dropped Day 4 | Day 1–4 + 3 night shops; dropped Days 3–4 (interruptions, clutter) |
| Priya | Day 1–2, lost a day to a reload | Day 1–2 + reload → **resumed fine at Day 3** |
| Ken | 9 days total, **save wiped once** | Day 1–6 + start of 7, 5 night shops, **no save loss** |

## Scoreboard: round 1 → round 2

| | Hook | Clarity | Fun | Visuals | Story | Recommend | Come back |
|---|---|---|---|---|---|---|---|
| Wei Jie | 5 → 5 | 6 → 6 | 6 → 6 | 9 → 8 | 7 → 7 | 6 → 6 | 5 → 5 |
| Auntie Mary | 8 → 7 | 4 → **6** | 6 → 6 | 8 → 8 | 8 → 8 | 6 → 6 | 6 → 6 |
| Alex | 8 → 8 | 5 → **6** | 6 → 6 | 8 → 8 | 8 → 8 | 6.5 → **7** | 6 → 6 |
| Priya | 7 → 6 | 7 → **8** | 6 → **7** | 9 → 9 | 7 → 7 | 6 → **7** | 6 → **7** |
| Ken | 7 → **8** | 5 → **7** | 5 → **6** | 8 → 8 | 8 → 8 | 6 → 6 | — → 5 |
| **Average** | 7.0 → 6.8 | **5.4 → 6.6** | **5.8 → 6.2** | 8.4 → 8.2 | 7.6 → 7.6 | **6.1 → 6.4** | 5.8 → 5.8 |

**Would pay:** about the same. Priya S$4–6 once, Alex US$5–8 PC / 3–5 mobile (would wishlist now), Ken S$4–6
premium *after fixes* (no as-is), Mary $2.98, Wei Jie only a $2–3 cosmetic. Everyone: no ads, no energy timers.

**Verdict:** the fixes moved **clarity the most (+1.2)**, and fun and recommend a little. Nobody quit or lost a save.
The hook didn't move: players still find the first drink comes too late. Art and story stay the strengths.
The remaining drag is the same three things as before, only smaller: **cups going to the wrong customer, pop-ups at
the wrong moment, and nothing to chase.**

## What the fixes fixed (confirmed by the players)

- **Saves:** Priya reloaded mid-run and continued; Ken played 6 days with no wipe; restart asks first.
- **Pots:** no pass-through pours reported.
- **Coach + picture recipes + menu card:** "the coach line carries it" (Wei Jie); Priya's clarity 8.
- **Economy feel:** "upgrades earned +$X today" on the summary was noticed and liked (Priya, Ken); wrong drink no charge.
- **Pace:** the empty-stall clock speed-up worked (Priya's 20 s away = 12:15 → 2:30pm, nobody walked out).
- **Rushes:** the Day 2 kids' Milo Dinosaur rush was Alex's best moment and Wei Jie's "click".

## The gaps now, ranked

### P0: still breaks trust

1. **Ah Gong's cup still goes to someone else** (4/5: Priya, Mary, Alex ×3, Ken, Wei Jie).
   - Ah Gong sits behind the counter row, and the front customer's **bubble** covers him.
   - Players drop on what they see. That point is inside the front customer's zone (the bubble is part of it) and
     outside Ah Gong's, so the cup goes to the front customer as a wrong drink. The tip then says "forgot the milk".
   - Mary also saw a cup go to Marcus while he was still a faded walker.
   - **Fix:** a cup with a ticket ("for X") goes to X unless it is dropped on another customer's *body* (bubbles never
     steal a ticketed cup); only `waiting` customers can take cups; lift Ah Gong (or his bubble) clear of the front row.
2. **Teaching demos and cards still take over the player's cup** (Ken, Alex, Wei Jie).
   - Ken: Makcik's Kopi peng demo was built in the cup labelled "for Sophie", and an empty cup vanished when Aunty
     Lim's demo started.
   - NEW RECIPE cards and EP3/EP4 still start in the middle of making a cup. The calm gate only waits for hands to be
     free, not for the cups on the tray.
   - Customers' patience keeps draining while a demo plays (Office guy 86% → 58%).
   - **Fix:** "calm" also needs no unfinished cup on the tray (or the demo uses a fresh plate and leaves the player's
     cups alone); freeze patience during any forced scene.
3. **Recipe card after the order** (Mary, Ken). The Milo Dinosaur card shows at 12:45–4:45pm on Day 2, but a
   student/backpacker ordered it at 7:30am with no explanation. **Fix:** teach before the first such order arrives
   (hold that order until the lesson has played).

### P1: the loop

4. **Closing "swallows" customers** (Mary, Alex, Wei Jie, Ken).
   - This is by design (`startClosing` turns the queue away; the counter gets 60 s), but it reads as a bug.
   - The kids with 4 Milo Dinosaurs, Aunty Lim queued since 4:30pm, and a made cup never served all just fade.
     The results then still say "Aunty Lim's teh 9/10".
   - **Fix:** at 7pm the people already queued still get served (no new arrivals). Or a clear "Sorry, closed!" beat
     where they wave and leave.
5. **Fame on the top bar ≠ the results card** (5/5). The star bonus is added on the summary only
   (`showSummary`). **Fix:** show it as a separate line ("★ bonus +2") and add it to the bar with a tick-up.
6. **Nothing to chase / no skill ceiling** (Wei Jie, Ken, Alex).
   - $12–34 a day against machines at $35–55, and nothing says "save for X".
   - The combo counter (×12) pays nothing you can see; the streak tip is too small to notice.
   - Ken had a 9–10 perfect streak and three stars every day from Day 2, with no pressure (8–11 customers, very
     generous patience).
   - Days 4 and 6 have no story; the "empire" is never hinted.
   - **Fix:** a "next goal" line on the results and in the shop ("Ice Machine: $12 to go"); combo milestones with
     a visible pop (×5, ×10: +$1 and a burst); a small event every day; a mid-month milestone or empire teaser.
7. **The first drink is still ~2–2.5 min in** (Wei Jie, Priya). The prologue's Skip leads into EP1, and then Aunty
   Lim's intro. Wei Jie wants ~20 s. **Fix:** serve the first cup before EP1 (EP1 after the first Perfect), or fold
   EP1 into Aunty Lim's first order.
8. **Shop confirm loses purchases** (Mary). "Tap to confirm" makes that row taller, so the second tap can land on a
   different row and start a new confirm. There's no message. Alex also saw rows of different heights. **Fix:** keep
   row heights fixed, show the confirm on the button itself, and give slow readers a longer window.
9. **"Save & back to title" on the results skips that night's shop** (Ken). Continue goes straight into the next day.
   **Fix:** continue to the night shop if it wasn't visited.

### P2: polish

10. **Overlaps** (4–5/5):
    - "Skip ▸▸" sits on the 2nd choice button and the coach line (it was moved there in round-1 fixes; move it again).
    - The sweetness meter header "SIEW DAI → ★ NORMAL" sits over "sweetness".
    - "+$" floats behind bubbles; "TAP!" and the cat bed cover cup labels; bubbles pile up in rushes.
11. **Bin and spoon targets** (Wei Jie): dropping on the bin icon often fails (only low on the bin works); a spoon
    drop sometimes leaves the cup "unstirred".
12. **Small text** (Mary): "+$" pops, the heart row, cup labels behind the coach bar, grey summary lines.
    The FULL line is still too faint for her. Condensed milk has no meter like sugar's.
13. **Story continuity:**
    - "Morning!" lines at 2:45pm and 5:45pm.
    - "He tips 50 cents" doesn't change money; Marcus speaks off screen in EP3.
    - The EP1 note is on the tin, but the title says "on the Pot".
    - "Tomorrow sure 10/10!" comes right after a 10/10.
14. **Cup Rack Pro cups have no owner** ("empty cup"); cup order on the tray doesn't match customer order.
15. **Tutorial highlight boxes stay lit** after the first serve.
16. **Upgrades you can't see:** the scoop, brass spoon and long-spout pot look the same once bought. Shop icons are
    still emoji.
17. **Culture:** Mary wants Kopi C on the menu (the Evap can is on the rail), and hot drinks in porcelain cups.
    Alex found untagged words: peng, shiok, chope, pakcik, cham, 老板, 我们看看.

## Recommended next steps (in order)

1. **Ticketed cups always reach their customer** (#1) + **demos never touch the player's cups, patience frozen in
   scenes** (#2) + **teach before the order** (#3).
2. **Closing serves the queue that's already there** (#4) and **one fame number** (#5).
3. **Something to chase** (#6): a next-goal line, combo milestones that pay and pop, a beat every day.
4. **First cup before EP1** (#7).
5. Shop confirm + night-shop resume (#8, #9), then the P2 overlap/readability pass.

## Method notes

- Five agents, one browser tab each, own save namespace, fresh start from the title screen.
- Cost: ~1.0M agent tokens, ~320 screenshots, ~15 min wall clock (all five in parallel).
