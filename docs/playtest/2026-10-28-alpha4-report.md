# Alpha playtest round 4: 2026-10-28

The same five simulated players as rounds 1–3 played build `2b3ce4f` (live as `index-CDzgqLPQ.js`). Each started from a fresh save on a phone-sized screen.
- **What changed since round 3:**
  - the round-3 P0s and the Day 1 "Now you try!" teh (cf993dd)
  - the round-3 P1s: instant spill and streak feedback, pause plus auto-pause, the clock stopping during demos, gap-filling arrivals, the upgrade reveal card and pricing, glossary taps, sugar first, picking who a cup is for
- **Where the files are:** reviews and about 330 screenshots are in the session scratchpad `alpha4/`.

> **Caveats (same as before):**
> - The game clock is frozen while agents think.
> - The agents can't hear audio.
> - Background tabs were throttled this round, so Wei Jie and Alex had some calls time out. Wei Jie fixed it by bringing his tab to the front.
> - Ken drove the game through small helper functions that only call the pt API, a few customers at a time.

## How far they got

| Player | Round 3 | Round 4 |
|---|---|---|
| Wei Jie | End of Day 4, "nothing exciting next" | End of Day 4 + night shop: repetitive, the next draw (EP4, Milo Godzilla) felt far |
| Auntie Mary | Day 1–2 + night shop | Day 1–2 + 2 night shops, about 25–30 min, reached her target |
| Alex | Day 1–3 + 2 night shops | **Day 1–5 + 4 night shops**, EP1–4, would keep going to Day 7 |
| Priya | Day 1–3 | **Day 1–4**, interrupted twice (the auto-pause and the mid-day resume worked) |
| Ken | Day 1–6 + Day 7 morning | Day 1–6 + Day 7 to 11:15am, 4 night shops, 11 items, EP1–5 |

## Scoreboard: rounds 1 → 2 → 3 → 4

| | Hook | Clarity | Fun | Visuals | Story | Recommend | Come back |
|---|---|---|---|---|---|---|---|
| Wei Jie | 5 → 5 → 5 → **6** | 6 → 6 → 7 → 7 | 6 → 6 → 6 → 5 | 9 → 8 → 9 → 8 | 7 → 7 → 7 → 7 | 6 → 6 → 6 → 5 | 5 → 5 → 5 → 5 |
| Auntie Mary | 8 → 7 → 9 → 8 | 4 → 6 → 7 → 6 | 6 → 6 → 7 → 7 | 8 → 8 → 8 → 8 | 8 → 8 → 9 → 8 | 6 → 6 → 8 → 8 | 6 → 6 → 7 → 7 |
| Alex | 8 → 8 → 8 → 8 | 5 → 6 → 6 → 6 | 6 → 6 → 7 → 7 | 8 → 8 → 8 → 7 | 8 → 8 → 8 → 8 | 6.5 → 7 → 7 → 7 | 6 → 6 → 7 → 7 |
| Priya | 7 → 6 → 7 → **8** | 7 → 8 → 7 → 6 | 6 → 7 → 7 → **8** | 9 → 9 → 9 → 8 | 7 → 7 → 8 → 8 | 6 → 7 → 7 → 7 | 6 → 7 → 7 → 7 |
| Ken | 7 → 8 → 8 → 7 | 5 → 7 → 7 → **8** | 5 → 6 → 6 → **7** | 8 → 8 → 7 → 7 | 8 → 8 → 8 → 8 | 6 → 6 → 7 → 7 | — → 5 → 6 → 6 |
| **Average** | 7.0 → 6.8 → 7.4 → 7.4 | 5.4 → 6.6 → 6.8 → 6.6 | 5.8 → 6.2 → 6.6 → **6.8** | 8.4 → 8.2 → 8.2 → 7.6 | 7.6 → 7.6 → 8.0 → 7.8 | 6.1 → 6.4 → 7.0 → 6.8 | 5.8 → 5.8 → 6.4 → 6.4 |

**Would pay:**
- Alex: US$5–8, would wishlist today.
- Priya: S$4.98 once.
- Ken: S$4–6 premium.
- Mary: $3–5 once, no ads.
- Wei Jie: $1–2, or ads for double tips.

**Verdict:** a flat round, with longer sessions.
- **Players went further:**
  - Alex got to Day 5 (3 last round).
  - Priya got to Day 4 (3).
  - Ken reached Day 7 with 11 purchases.
- **Fun went up again** (6.6 → 6.8). Priya's fun and Ken's clarity and fun went up.
- **Visuals dropped** (8.2 → 7.6). The new feedback text piles up at the counter, and the tool row now moves when you buy the Tarik Mugs. That second one is a regression from this round's P2 "spread the rail" fix.
- **Wei Jie dropped** (fun 5, recommend 5): dead time, weak juice, and nothing near enough to chase.
- **The biggest trust problem is still pop-ups and story scenes eating taps.** The round-3 fix (wait 1.2 s after a touch) isn't enough when players tap continuously through a rush.

## What the fixes fixed (confirmed by players)

- **Sugar or milk first:** "Milk first, like the uncles!" was Mary's top "keep".
- **Auto-pause and resume:**
  - The auto-pause caught Priya stepping away.
  - The mid-day resume ("Welcome back! Carrying on from 11:15am") was "excellent for short sessions".
  - The Pause tab freezes everything.
- **No more order switching or twin Marcus:** nobody reported either. The spoon re-drop works; Alex's third drop in a row was ignored, which is a separate edge.
- **Upgrades show:** "Your upgrades earned +$4.65 today" and the counter props landed (Priya, Alex, Ken). The perk floats (Tip Jar +30¢) were seen.
- **Day-end card:** fits the screen, and nobody reported overflow.
- **Combo pays:** Ken saw Day 6 tips ($28.50) about equal to sales.

## The gaps, ranked

### P0: breaks trust

1. **Pop-ups and story scenes still land mid-action, and gameplay taps skip their lines (4/5).**
   - EP2 opened mid-tap (Mary, Alex, Priya), and EP4 opened mid-drink (Alex). Players land on the 3-way choice without the setup.
   - Recipe cards opened mid-pour (Priya ×3, Alex).
   - *Fix:*
     - Stories wait until no cup is being made (TRAY_WAIT for stories too, and longer).
     - A drama scene ignores taps for about 0.8 s after it appears, and the first beat needs a deliberate tap.
     - The pop-up gate counts the last *tool or cup action*, not just the last touch.
2. **Cards come after the order (3/5).**
   - The Milo Dinosaur card came after the kids were served (Day 2: Wei Jie, Ken, Alex).
   - The Kopi O kosong "new order" card came after serving it (Alex).
   - *Fix:* show the combo card when the customer arrives (before their cup), or skip it once the order has been served.
3. **The first drag after a demo is swallowed (Ken 4/4, Alex 2), and the demo's Skip ignores its first tap.** Repro: after "Your turn! Drag the cup to X", the first drag does nothing; the second works. Likely the demo's input blocker or tween still holds the cup.
4. **The day-end numbers contradict each other (5/5).** "15 cups · 15 perfect" sits next to "Aunty Lim rates… 13 of 13". The demo cups are left out of one number and not the other. *Fix:* say it: "13 of 13 cups you made (+2 by the demos)", or leave demo cups out of every total.
5. **The tool row moves when you buy Tarik Mugs (3/5).** This regression comes from this round's crowding fix: Ice, Spoon and Cups jump, which breaks muscle memory. *Fix:* the base tools keep their spots, and the mugs take a fixed spare spot, or the counter.

### P1: makes it feel thin or unfair

6. **Counter clutter (5/5).**
   - "Perfect +$", "Streak broken", "Friendship Lv", "Tip Jar +30¢" and the coins pile on each other and on the cup labels.
   - "Friendship Lv" is cut off at the right edge and lingers behind drama scenes.
   - *Fix:* one float lane, with the lines stacked and staggered.
7. **Crowded counter.**
   - Bubbles stack, and Ah Gong is hidden with 4+ customers (Ken, Alex, Mary).
   - "+N waiting" counts cups, not people (Mary panicked at "+7").
8. **Dead time.**
   - Day 1 was empty from 3:45 to 6:45pm (Wei Jie).
   - Closing waits 15–20 s on an empty stall.
   - Priya wants auto-pause sooner (5–8 s with someone waiting; now 20 s).
9. **Demos.**
   - They're too fast to read for Mary and too slow for Wei Jie.
   - The NPC makes the first cup of every new recipe (Ken: "the first teh tarik was Makcik's").
   - *Fix:* demos show the steps and the player makes the cup, with a slower first time and a one-tap skip.
10. **Juice and purchases.**
    - The combo looks the same at ×2 and ×12 (Wei Jie).
    - A purchase is one line of text at night.
    - The tarik animation is thin, a single mug.
11. **Economy and design (Ken).**
    - "Gao" has no mechanic.
    - Cham can be made without the $55 Twin Sock.
    - Half the catalogue is "+0.3 fame a day" filler.
    - Customers cap at 15 from Day 5.
    - Plain Milo is taught after Milo Dinosaur.
    - Marked Glasses repeat the pour meter, and its labels are too small (Mary).
12. **Long-term goal.**
    - There's no story on Days 8–9.
    - No empire or second-stall goal is ever shown; Ken's D7 fix #1 is a month-2 or second-stall teaser.
    - The "Next:" goal flip-flops and points at items buried in the list (Alex, Ken).
13. **Foreigner gaps (Alex).**
    - 名气 has no "Fame" label.
    - "pakciks" and "chope" in the shop aren't explained.
    - Chinese-only lines have no translation in the bubble.

### P2: polish and continuity

- **Dialogue that doesn't match the order:**
  - Makcik says "Teh tarik, extra cold ah" for a hot teh tarik (Priya, Wei Jie).
  - Aunty Lim's art holds an iced takeaway cup.
- **The same message every night:** Uncle Tan's end-of-day line repeats word for word on Days 1–5 (Alex, Mary).
- **Characters missing from their own scenes:** Marcus, the kids and the sunglasses man aren't drawn in their own episodes. Oyen doesn't animate.
- **Owner switch:** you can switch owner on Continue (Mei plays Jun's save; Ken).
- **Group orders block the queue:** a walking-in group kept 3 customers queued with counter spots free (Ken).
- **Fractional tips:** +$3.43 (tip multiplier rounding; Ken).
- **Month bar:** still shows 1 block on Days 1–3.
- **Day-end customer list:** cut at 4 names with no "+N more".
- **Skip buttons:** they sit over the Recipes tab (drama) and over the Cups rack (demo).
- **Prologue:** the phone screen ignores the first taps, and orange words in the phone chat aren't tappable (Mary).
- **Emoji icons:** still in the shop and the reveal card; the Tarik tool and the EP1 tin are placeholders.

## Recommended next steps (in order)

1. **P0 #1–#5:**
   - stories and cards wait for a free tray and need a deliberate tap
   - cards before the order
   - the swallowed post-demo drag and Skip
   - matching day-end numbers
   - the tool row stays put
2. **One float lane** for counter feedback; "+N waiting" counts people; shorter closing on an empty stall; auto-pause at about 8 s.
3. **Demos let you make the first cup** (the steps shown, then your turn).
4. **A plan of its own for long-term pull:** the Day 8–9 story gap, a visible empire or second-stall goal, catalogue filler into visible upgrades, and the combo and purchase celebrations.

## Method notes

- Five agents, one browser tab each, their own save namespace, a fresh start from the title screen.
- Cost: about 1.07M agent tokens, about 330 screenshots, about 22 min of wall clock (in parallel).
