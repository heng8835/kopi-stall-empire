# Alpha playtest round 3 — 2026-10-27

The same five simulated players as rounds 1 and 2 played build `194d42b` (live as `index-BaxCdgka.js`). Each started from a fresh save on a phone-sized screen.
- **What changed since round 2:** the round-2 P0/P1/P2 fixes, plus the owner's three fixes: Day 1 is Aunty Lim, then the demo; the music preloads; the pour meter sits above the hand.
- **Where the files are:** reviews and about 340 screenshots are in the session scratchpad `alpha3/`.

> **Caveats (same as before):**
> - The game clock is frozen while agents think, so there is less time pressure than for a real player.
> - The agents can't hear audio, so the music fix can't be judged here.
> - The "Copy playtest notes" button only exists on the dev server.
> - Ken scripted part of Days 3–6, so some of his "oops" results are his own wrong-plate drops.
> - Priya lost a tab once during setup because I closed a stale tab. She resumed fine, and the run wasn't affected.

## How far they got

| Player | Round 2 | Round 3 |
|---|---|---|
| Wei Jie | End of Day 4, nothing to buy | End of Day 4, stopped: "nothing exciting next" (Butter Dish $20, "ok lor") |
| Auntie Mary | Day 1–2, flustered at lunch | Day 1–2 + night shop, **never lost or stressed** |
| Alex | Day 1–4, dropped Days 3–4 | Day 1–3 + 2 night shops, wants to see EP4 |
| Priya | Day 1–2 + reload | Day 1–3, interrupted twice, resumed fine |
| Ken | Day 1–6 | Day 1–6 + Day 7 morning, 5 night shops, 8 purchases |

## Scoreboard: round 1 → round 2 → round 3

| | Hook | Clarity | Fun | Visuals | Story | Recommend | Come back |
|---|---|---|---|---|---|---|---|
| Wei Jie | 5 → 5 → 5 | 6 → 6 → **7** | 6 → 6 → 6 | 9 → 8 → **9** | 7 → 7 → 7 | 6 → 6 → 6 | 5 → 5 → 5 |
| Auntie Mary | 8 → 7 → **9** | 4 → 6 → **7** | 6 → 6 → **7** | 8 → 8 → 8 | 8 → 8 → **9** | 6 → 6 → **8** | 6 → 6 → **7** |
| Alex | 8 → 8 → 8 | 5 → 6 → 6 | 6 → 6 → **7** | 8 → 8 → 8 | 8 → 8 → 8 | 6.5 → 7 → 7 | 6 → 6 → **7** |
| Priya | 7 → 6 → **7** | 7 → 8 → 7 | 6 → 7 → 7 | 9 → 9 → 9 | 7 → 7 → **8** | 6 → 7 → 7 | 6 → 7 → 7 |
| Ken | 7 → 8 → 8 | 5 → 7 → 7 | 5 → 6 → 6 | 8 → 8 → 7 | 8 → 8 → 8 | 6 → 6 → **7** | — → 5 → **6** |
| **Average** | 7.0 → 6.8 → **7.4** | 5.4 → 6.6 → **6.8** | 5.8 → 6.2 → **6.6** | 8.4 → 8.2 → 8.2 | 7.6 → 7.6 → **8.0** | 6.1 → 6.4 → **7.0** | 5.8 → 5.8 → **6.4** |

**Would pay:**
- Priya: S$4–6 once.
- Alex: US$4.99–6.99 on mobile, or about A$10–12 on Steam (would wishlist). "More heart than Good Pizza Great Pizza already."
- Ken: $2.99 now, $4.99–6.99 if the 30-day arc lands.
- Mary: $3–5 once.
- Wei Jie: $2–3, or free with ads.
- Still nobody wants energy timers.

**Verdict:** the best round so far.
- **Every average went up except visuals,** which held at 8.2. Recommend reached 7.0 for the first time, and "come back tomorrow" moved for the first time (5.8 → 6.4).
- **Mary moved the most:** she was never lost and rated story 9 and recommend 8.
- **The hook rose** (6.8 → 7.4), though Wei Jie and Ken still want to pour their own first cup sooner (see the decision below).
- **What drags now:**
  - an order-switch bug around story guests and demos
  - pop-ups that eat a pour
  - a few overflows and overlaps
  - progress that isn't *felt* (upgrades, the empire goal, dead afternoons)

## What the fixes fixed (confirmed by players)

- **Day 1 demo:** "keep the Aunty Lim watch-then-do demo" (Mary). Clarity is up for Mary and Wei Jie.
- **Pour meter:** nobody reported their hand covering it. Header overlap is gone.
- **Next-goal line and COMBO ×5:** "the hook finally landed with the big gold COMBO banner" (Wei Jie).
- **Closing:** nobody reported the queue vanishing at 7pm.
- **Fame:** nobody reported mismatched fame numbers.
- **Shop and resume:** the shop confirm, and "Save & back → Continue · Night shop", both work (Priya, Ken).
- **Saves:** all solid across reloads and interruptions (Priya, Ken).
- **Readable meters that teach the lingo:** Alex learned O, C, kosong, siew dai and peng in three days. All 5 players liked them.

## The gaps, ranked

### P0: breaks trust

1. **An order changes under the player / a duplicate Marcus (3/5: Priya, Alex, Ken).**
   - **What happened:** on Day 3, after the Limau Squeezer was bought, Marcus's Kopi C kosong was taught (card or demo). His order at the counter then became "Teh O limau peng", and a second Marcus waited in the queue.
   - **Result:** the correct cup scored "Oops — kopi instead of teh", and the limau customer left. EP3 then played as if he got his kopi.
   - **Likely cause:** EP3's new `guest` (Marcus), while his regular visit also spawned, and the limau lesson re-picked his order.
   - **Fix:** a guest suppresses that regular's own visit that day. An order is locked once its card or demo has shown, or a cup is labelled for it.
2. **Pop-ups land mid-pour and eat the input (2/5: Priya, Wei Jie; Alex for the Limau card).** Recipe cards and EP2 opened while the player was pouring or had just tapped Cups, and that pour or stir did nothing. *Fix:* nothing modal while a tool is held or within about 1 s of a tool action.
3. **The day-end card is taller than the screen on later days (2/5: Wei Jie Day 4, Ken Days 5–6).** The last button ends up off-screen. *Fix:* fit the card: compact rows, and scale the card if it is still too tall.
4. **A second spoon drop straight after the first doesn't register (Alex, Days 1–3, repeatable).** The third drop works. *Fix:* reproduce and fix, probably the spoon still gliding home.
5. **"Aunty Lim's teh X/10" is unexplained (5/5).**
   - It shows 10/10 or 9/10 for her own demo cup, and 6/10 although her cup was Perfect.
   - It shows on days she didn't come.
   - It actually scores the whole day.
   - EP1's "the first teh of your life" contradicts the demo (Mary, Wei Jie, Alex).
   - *Fix:* rename the line to the day's own rating ("Aunty Lim rates today: 9/10"), or score only her cups. Reword EP1 ("Your first teh at this stall…").

### P1: makes it feel thin or unfair

6. **Late feedback.** Spill shows only after the next ingredient (Wei Jie, Priya), and there is no combo-break signal (Wei Jie). "Not quite full" was Wei Jie's top slip, but its in-play text is small.
7. **No pause, and an idle phone burns the day (Priya).** 20 s away cost 2–3.5 game hours. *Fix:* a bottom pause button, plus auto-pause on idle or when the tab loses focus.
8. **The clock jumps through demos and episodes (Alex, Ken, Priya).** A demo burns 15–25 s of day, and around EP3 the clock jumped about 3 hours. Ken calls the free first perfect "unearned". *Fix:* freeze the clock during demos.
9. **Lumpy pacing (4/5).** The stall sits empty mid-afternoon on Days 1, 2 and 6, then everyone arrives at closing. Patience is so generous (about 50 s) that there's no tension (Ken).
10. **Upgrades not felt (4/5).**
    - Buying shows one line of text.
    - Marked Glasses lines and the Ice Machine are invisible.
    - Long-Spout Pot "changed nothing" because FULL is forgiving.
    - Drink machines pay back slowly: Butter Dish takes about 60 cups, and Limau earned $0.80 in 3 days.
    - A bought drink may not be ordered for days.
    - *Fix (Ken):* a reveal moment, a guaranteed first customer next morning, and machine drinks priced to pay back in about 3 days.
11. **Readability is still uneven.**
    - Coach and tool labels are small and pale (Mary).
    - Bubbles stack in rushes (4/5).
    - Ah Gong is hidden behind standing customers (Mary, Alex).
    - The pour meter now covers the customers' faces while pouring (4/5 mention it, all mildly). This was the trade for keeping it out from under the hand.
12. **Glossary gaps.**
    - "Kopi O" opens the Kopi entry, so "O" is never explained (Mary).
    - Orange words in story scenes aren't tappable (Mary).
    - In the prologue, a glossary word in the middle of the box steals the tap meant to advance (Alex).
    - Plain Chinese isn't glossed (慢慢来, 可以啦, 好喝, Alex).
    - "kopi kakis" and "pakciks" aren't tappable where they appear.
13. **Real making order (Mary).** Sugar first is how a real uncle does it. The coach said "no kopi or teh yet". *Fix:* accept sweetener or milk first.
14. **Cup routing (Wei Jie, Ken).** A fresh cup goes to the first in line, and players want to pick. A spare finished drink is refused if that customer has a half-made cup. An empty cup can be served (counts as an oop, breaks the combo).

### P2: polish and continuity

- **Story choices with no effect.**
  - "Owe me lah": all four kids paid in full (Ken, Mary).
  - EP2's "on the house" reply is the "owe me" reply (Wei Jie).
  - Marcus "tips 50 cents" after the wrong cup.
- **Oyen is introduced but never on screen** (Alex, Ken).
- **Small mismatches:**
  - the Hipster's "no sugar" line clashes with his NORMAL order
  - kids already hold drinks before being served
  - only Jia Hui appears in EP2
- **Layout and overflow:**
  - The month progress bar is stuck at 1 box (Wei Jie, Priya).
  - The Recipes icon overlaps its "R" (Alex, Ken).
  - The drama Skip covers the Recipes tab (Ken).
  - Feedback text sits on the cup labels (Ken).
  - The Tarik tool overlaps the Spoon label (Wei Jie).
  - The "+3 waiting" badge stays up after the group is served (Wei Jie).
- **The shop still mixes emoji with pixel art** (🍋 for calamansi, 🍨, 🛍, 🫚; Mary, Alex, Ken). The Night 1 shop has about 30 items in 4 tabs, and the goal item is buried in the list (Ken, Priya).
- **Repeated lines:** "Shiok! Steady hands" three days running; the same reaction lines.
- **Switching owner mid-month:** you can switch to Mei from the title, but the story stays Jun's (Ken).
- **Shared name:** two "Uncle" walk-ins at once; the cup just says "for Uncle" (Priya).

## A decision for the owner

**How Day 1 starts.** You asked for Aunty Lim first and then the demo, and Mary loved it ("keep it"). But Wei Jie and Ken both want the player's *own* first pour sooner. Wei Jie's first self-made kopi came about 3 minutes in, after the prologue, the demo, EP1 and the menu card. Two options that keep the demo:
- **(a)** A shorter demo: the ghost hand shows only the pot and the milk, and you do the stir and the serve.
- **(b)** After her demo cup, Aunty Lim asks for a second teh "your turn", made by the player, before EP1.

## Recommended next steps (in order)

1. **P0 #1–#5:**
   - order lock and no duplicate guests
   - no pop-ups while pouring
   - the day-end card fits the screen
   - the second-stir bug
   - Aunty Lim's rating renamed or explained, and EP1 reworded
2. **Immediate spill and combo-break feedback; freeze the clock during demos; a pause button with auto-pause** (#6–#8).
3. **Glossary fixes** (#12) and **sugar first** (#13).
4. **Upgrade feel and machine pricing** (#10) and **afternoon pacing** (#9). These are the big ones for D7 retention, and worth a plan of their own.

## Method notes

- Five agents, one browser tab each, own save namespace, fresh start from the title screen.
- Alex's first agent couldn't open a tab: the pane's tab cap was full of round-2 tabs. I closed the stale tabs and relaunched him.
- Cost: about 0.95M agent tokens, about 340 screenshots, about 12 min of wall clock (in parallel).
