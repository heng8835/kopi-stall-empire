# Alpha playtest report — 2026-10-27

Five simulated players (AI agents in character) each started the live dev build fresh, on a phone-sized screen.
They played only by tapping, dragging and looking at screenshots, with no access to the code, then wrote honest
reviews. The full reviews and ~380 screenshots are in the session scratchpad (`alpha/<name>_review.md`).

> Treat this as strong signal, not gospel: agents play turn by turn (the game clock is frozen while they "think"),
> and they can't hear audio. Where a finding might be a harness artefact, it's marked.

## The players

| Player | Who | Played | Quit? |
|---|---|---|---|
| **Wei Jie** | 16, Sec 4, Genshin / Brawl Stars / Cooking Fever | Day 1–4 | **Quit Day 4, 1:45pm**: three "NEW ORDER" cards in a minute mid-rush |
| **Auntie Mary** | 58, real kopitiam regular, Candy Crush, reads everything | Day 1–2 (+peek Day 3) | Nearly quit Day 2: couldn't get a cup to Ah Gong |
| **Alex** | 29, Melbourne, cozy/indie (Stardew, Coffee Talk, Dave the Diver) | Day 1–4 + night shop | Interest dropped Day 4 after the 5th pop-up that day |
| **Priya** | 34, MRT commuter mum, Royal Match / merge games | Day 1–2 (one commute) | No, but lost a day to a reload |
| **Ken** | 41, senior game designer, ex-QA | 9 days, 3 night shops (save wiped once) | Stopped at Day 5 night shop |

## Scoreboard (1–10)

| | Hook | Clarity | Fun | Visuals | Story | Recommend | Come back tomorrow | Would pay |
|---|---|---|---|---|---|---|---|---|
| Wei Jie | 5 | 6 | 6 | 9 | 7 | 6 | 5 | $1–2 cosmetics |
| Auntie Mary | 8 | 4 | 6 | 8 | 8 | 6 | 6 | $2–3 once (after serving fixed) |
| Alex | 8 | 5 | 6 | 8 | 8 | 6.5 | 6 | US$5–7 premium, once fixed |
| Priya | 7 | 7 | 6 | 9 | 7 | 6 (8 with mid-day save) | 6 | $3–5 once |
| Ken | 7 | 5 | 5 | 8 | 8 | 6 | — | US$5–7 premium; F2P wouldn't hold past Day 3 |
| **Average** | **7.0** | **5.4** | **5.8** | **8.4** | **7.6** | **6.1** | **5.8** | |

**Verdict in one line:** the *wrapper* is strong (art 8.4, story 7.6, a real hook), but the *game in the middle*
(serving reliability, interruptions, something to chase) is what's holding it at ~6. Every player came back for the
story and art, and every player was pushed away by the same two or three mechanical problems.

---

## The gaps, ranked

### P0 — breaks trust (found by 3–5 of 5 players)

1. **Cups go to the wrong customer, or nowhere** (5/5, verified in code).
   - Dropping a cup on Ah Gong at his back table goes to whoever stands in front (JC girl, Colleagues, Kids, Marcus),
     because the drop picks the *first* customer whose sprite or bubble is under your finger, not the one you see.
     Ken: "Of 6 Kopi O for Ah Gong, 4 went to someone else." Front bubbles also hide him completely.
   - Dropping between the sprites of a group (Kids, Uncles, Students) silently snaps the cup back, with no message.
   - Mary reports walk-ins/leavers also taking cups (couldn't confirm in code: walkers aren't "waiting"; likely a bubble overlap).
   - Result: "Oops — forgot the milk" for a drink that was right, so the game blames the player for its own miss.
   - **Fix:** a cup labelled "for X" goes to X if dropped anywhere in the customer area (or a tap serves it); each
     customer (and a whole group) gets one generous drop zone; Ah Gong's zone is where he's drawn; feedback on a miss.
2. **Interruptions land mid-action** (5/5).
   - Story scenes, NEW ORDER / NEW RECIPE cards and "watch" demos fire while you're holding a pot or dragging a cup.
     Pours keep running or freeze, drags advance the dialogue and **picked a story choice Wei Jie never saw**; the spoon
     was left floating; a drama froze a sugar dial on screen behind the card.
   - **The same drink gets taught 2–3 times**: Milo Dinosaur NEW RECIPE + NEW ORDER on Day 2; Teh siew dai card + demo +
     NEW ORDER on Day 4; Kopi C kosong taught Day 3 then NEW ORDER again Day 4. Day 4 had 5 pop-ups for Alex.
   - **Fix:** queue every card/demo/episode until hands are free *and* no customer is mid-serve; one teaching moment per
     drink (a NEW RECIPE suppresses the NEW ORDER card for its orders); cap pop-ups per day; finish/cancel any pour or
     dial before pausing.
3. **Pots pour into every cup they pass over** (4/5, verified). Dragging the teh pot across plate 1 to plate 2
   makes plate 1 a Cham. **Fix:** a pot only pours once it has *stopped* over a cup (≈150 ms dwell) or only into the
   cup it was first held over.
4. **Losing progress** (2/5, verified).
   - Priya: closing the page mid-day loses the whole day (money, story replays). For a commuter this is the #1 issue.
   - Ken: the day-end "Close stall" button sits where the shelf tools are, leads to the title, and "New month (restart)"
     right under "Continue" wipes the save with **no confirmation**. Ken lost a Day 4 save.
   - **Fix:** confirm on restart (and move it away from Continue); autosave mid-day (at least at each customer served) or
     resume the day; rename/move "Close stall".

### P1 — the loop doesn't pull you forward (3–5 of 5)

5. **Too slow to the first pour** (4/5). Prologue → EP 1 → Aunty Lim's intro → 12 s demo → menu card → second "open"
   button: ~2–2.5 min before your own first cup (Wei Jie, Priya). Plus ~2–3 s of black screen before the prologue's
   first line, and ~10 s of empty stall before each summary. **Goal: first pour within ~30–45 s.** Let the prologue be
   skippable in one tap, fold Aunty Lim's intro into her demo, drop the second "open" button.
6. **Nothing to chase early, and progress you can't feel** (Ken, Wei Jie, Alex).
   - The night shop opens only after Day 3; nights 1–2 are an empty screen.
   - Stars ~3 every day even with mistakes; fame was +2 on both a 1-star and a 3-star day (Ken).
   - "Tomorrow: about 9 customers" on Days 2, 3 and 4 although fame rose 10 → 21 (Alex); income flat ~$23–27/day Days 2–5.
   - Upgrade payback too small to feel: $45 kettle ≈ +$0.15 per poh; $60 ice machine +20¢ per iced drink.
   - No visible long-term goal: the "Empire" never appears; what the Day 30 tin means isn't framed.
   - **Fix:** one cheap shop item after Day 1; stars and fame driven by performance (perfect streaks, no timeouts);
     a visible "customers/fame → next unlock" bar; upgrades priced to pay back in 1–3 days and *announced* the next day
     ("Ice machine: +$1.60 today"); a month goal / empire meter on the summary.
7. **Low pressure, little mastery** (Ken, Wei Jie). Patience ~2 min, queue never drains, "close" pays ~80% of perfect,
   a wrong drink still pays (Mary: a wrong drink paid *more* than the right one, $2.80 vs $1.50). Long "等客人" gaps,
   ~8 customers/day. The cozy rule is right, but the fun peaks were the rushes (Wei Jie: "rushes 8, quiet 3").
   - **Fix (cozy-safe):** shorter dead air (bunch arrivals into small rushes), a perfect-streak combo with a small tip
     bonus, wrong drink pays nothing (customer politely hands it back), "close" ~60%. Keep no fail states.
8. **Story promises it doesn't keep** (4/5).
   - The "下集 EP 4" teaser at the end of Day 3 sets up EP 4, which only comes on **Day 5**; same for EP 5 → Day 7.
     Players read it as "tomorrow" and think it broke.
   - Story choices with money ("Today on the house!", "Can, owe me lah") change nothing; the kids still pay.
   - EP 3's title card appeared at closing after EP 3 had already played at lunch (the two-part episode).
   - **Fix:** the 下集 card says *when* ("Day 5"), or every day has a beat; make money choices actually move money;
     the closing part of a two-part episode shows "EP 3 · part 2" (or no title card).
9. **Text and grading that contradict each other** (4/5).
   - "不要太甜 / Not too sweet hor" (Ah Gong, Pakcik) but the order is NORMAL and siew dai is penalised.
     **For a real kopi drinker that's siew dai.** Either change the lines or the orders.
   - "Gao" graded the same as normal; an "unstirred" Kopi O graded Perfect (it has sugar).
   - Aunty Lim: "10 out of 10. 有进步空间" (room for improvement); Uncle Tan gives the same "Shiok! Steady hands" at 2★ as 3★.
   - Coach line stale or wrong: "Drag it to Aunty Lim" after she's served, "nobody waiting wants a Teh siew dai" while
     the auntie ordered exactly that, "Spilled!" on a fresh cup, "Waiting for customers" with someone waiting;
     the coach names Pakcik while the new cup says "for Ah Gong".
   - Day summary lists only the first 5 customers, no "+N more" (verified), so rows don't add up.

### P2 — polish and readability

10. **Top-right corner collisions** (5/5): drama "Skip ▸▸" over the Recipes tab; "♪ on" hidden behind Recipes;
    the pour gauge covers Ah Gong's bubble and the Recipes tab. Ken: put the gauge next to the cup, not at the top.
11. **Buttons and text:** "Close up for the night ▸ 收档" overflows its button (5/5); money text overlaps the coin;
    three skip buttons at once in the tutorial; tiny 56×17 Skip; the shop purchase message clipped by "Open stall".
    **Typo** on the Day 1 menu card: "the sugar can sweetens it" (5/5).
12. **Readability for older players** (Mary): tool labels, "tap to close" and recipe-book captions too small / low
    contrast; Aunty Lim's demo too fast to follow (~12 s); the fill line on the glass too faint; nothing says how long to hold.
13. **Night shop:** the list wouldn't drag-scroll for Alex and Ken (the recipe book did) *(possibly a harness swipe
    artefact; check on a phone)*; items below the fold sit under "Open stall", so a tap can start the next day; no
    purchase confirm; emoji icons mixed with pixel art.
14. **Art nits:** Milo tin and Powder tin look almost identical (Horlicks Dinosaur card shows the Horlicks tin for "on
    top" but you must use the green Powder tin); the Milo Dinosaur mountain is small and pale; many walk-ins already hold
    a drink while ordering; two Aunty Lims on screen in her first scene; Oyen (the cat) is talked about but never seen;
    four bubbles overlapping in rushes.
15. **Culture accessibility** (Alex): "嗯. 好.", "不要太甜", "Assalamualaikum", "NSF", "chope" had no English/glossary
    *(some do have glossary entries: the tap didn't register in the prologue)*; **nobody discovered that highlighted
    words are tappable**: add a one-time hint ("tap orange words").
16. **Dev leftovers:** "Copy playtest notes" button visible on the day-end screen (3/5).

---

## What to keep (everyone agreed)

- **The art** (avg 8.4): title screen, prologue panels, chibi cast, the stall, drinks drawn in code, bought items
  appearing in the stall (the Horlicks tin on the rail delighted Wei Jie).
- **The story and writing** (avg 7.6): Uncle Tan's 11:47pm message, Aunty Lim and her red notebook, **Marcus's fake
  phone calls** (Alex's peak: "He tips 50 cents. His hand is shaking."), Darren's "Can owe first?" / "BOSS POWER!",
  the hipster's "Interesting. Rustic.", the 下集 teasers and the Day 30 tin mystery.
- **The coach line + picture recipes + glossary**: Alex (knew nothing about kopi) found onboarding very friendly;
  Priya called the coach line the best feature.
- **The sweetness dial**: Ken: "the best verb in the game"; Mary loved the KOSONG → GA DAI zones.
- **Rushes** (four kids shouting for Milo Dinosaurs) were the most fun moments for Wei Jie.
- **No punishing fail states** (Priya, Mary).

---

## Recommended next steps (in order)

1. **Serving that never lies** (P0 #1, #3): per-customer drop zones (Ah Gong's at his seat, groups as one zone),
   "for X" cups go to X, miss feedback, pots pour only when settled.
2. **One calm moment for every pop-up** (P0 #2): a single interruption queue gated on "hands free and nothing
   mid-serve"; one teaching card per drink; max ~2 per day after Day 1.
3. **Never lose progress** (P0 #4): restart confirm + layout, mid-day autosave/resume.
4. **First pour in 45 s** (P1 #5).
5. **Something to chase from Day 1** (P1 #6–7): shop after Day 1, performance-driven stars/fame, visible next
   unlock + month goal, felt upgrade payback, small perfect-streak bonus, denser rushes.
6. **Make the story keep its promises** (P1 #8–9): teaser says the day, choices move money, fix the 不要太甜 orders,
   coach line always current, summary "+N more".
7. **Polish pass** (P2): top-right corner, button text, typo, text size/contrast, shop scroll, dev button, art nits.

## Method notes

- Each agent played in its own browser tab with its own save, through `tools/playtest/harness.js` (tap/drag/look/state).
- Known artefacts: the game clock is frozen between agent actions, so time pressure is *lower* than for a real
  player; drag-scroll in the night shop may not match a real finger; audio wasn't judged.
- Cost: ~1.1M agent tokens, ~380 screenshots, ~25 min wall clock.
