# Alpha playtest round 5: 2026-10-29

The same five simulated players from rounds 1–4 played build `165629d` (live as `index-DHbUTb3w.js`). Each started from a fresh save on a phone-sized screen.

- **Changes since round 4:** the round-4 P0s, plus most P1s:
  - Stories wait for a free tray and can't be skipped by taps.
  - NEW ORDER cards come before the order.
  - Demos give the stall back at once.
  - Lesson demos are a sample cup the teacher tastes; then you make it yourself.
  - The day-end numbers agree.
  - Tools keep their spots.
  - Floating texts share one lane per customer.
  - Juice: the streak, combo and "Bought!" pops.
  - The queue sign reads "+N in line".
  - Less dead time.
  - A "Fame" label next to 名气.
  - Glossary words in the shop are tappable.
- **Where the files are:** the reviews and about 340 screenshots are in the session scratchpad `alpha5/`.

> **Caveats (same as before):**
> - The game clock is frozen while agents think.
> - The agents can't hear audio.
> - After Day 1, Wei Jie replayed pour timings he had learned with a small script, which inflates his perfect rate.
> - Ken took about 55 screenshots and Priya about 54, both over the 30–45 budget.

## How far they got

| Player | Round 4 | Round 5 |
|---|---|---|
| Wei Jie | Day 1–4, then stopped: repetitive | Day 1–4 (~25–30 min), stopped: "too easy, nothing to chase" |
| Auntie Mary | Day 1–2 + 2 night shops | Day 1–2 + 2 night shops (~25–30 min), reached her target, no quit |
| Alex | Day 1–5 + 4 night shops | Day 1–5 + 4 night shops (~30–35 min); interest peaked at EP3 and dipped on Day 4 |
| Priya | Day 1–4 | Day 1–3 + night shops (~20 min); closed and reopened the game, and Continue resumed fine |
| Ken | Day 1–6 + Day 7 morning | Day 1–6 + Day 7 start (EP5), 6 night shops, 8 items |

## Scoreboard: rounds 1 → 5

| | Hook | Clarity | Fun | Visuals | Story | Recommend | Come back |
|---|---|---|---|---|---|---|---|
| Wei Jie | 5 → 5 → 5 → 6 → 6 | 6 → 6 → 7 → 7 → **8** | 6 → 6 → 6 → 5 → **6** | 9 → 8 → 9 → 8 → 8 | 7 → 7 → 7 → 7 → 7 | 6 → 6 → 6 → 5 → **6** | 5 → 5 → 5 → 5 → 5 |
| Auntie Mary | 8 → 7 → 9 → 8 → 8 | 4 → 6 → 7 → 6 → **7** | 6 → 6 → 7 → 7 → 7 | 8 → 8 → 8 → 8 → 8 | 8 → 8 → 9 → 8 → 8 | 6 → 6 → 8 → 8 → 7 | 6 → 6 → 7 → 7 → 7 |
| Alex | 8 → 8 → 8 → 8 → 8 | 5 → 6 → 6 → 6 → **7** | 6 → 6 → 7 → 7 → 7 | 8 → 8 → 8 → 7 → **8** | 8 → 8 → 8 → 8 → 7 | 6.5 → 7 → 7 → 7 → 7 | 6 → 6 → 7 → 7 → 7 |
| Priya | 7 → 6 → 7 → 8 → 6 | 7 → 8 → 7 → 6 → **8** | 6 → 7 → 7 → 8 → 7 | 9 → 9 → 9 → 8 → 8 | 7 → 7 → 8 → 8 → 7 | 6 → 7 → 7 → 7 → 7 | 6 → 7 → 7 → 7 → 7 |
| Ken | 7 → 8 → 8 → 7 → **8** | 5 → 7 → 7 → 8 → 6 | 5 → 6 → 6 → 7 → 7 | 8 → 8 → 7 → 7 → **8** | 8 → 8 → 8 → 8 → 8 | 6 → 6 → 7 → 7 → 7 | — → 5 → 6 → 6 → **7** |
| **Average** | 7.0 → 6.8 → 7.4 → 7.4 → 7.2 | 5.4 → 6.6 → 6.8 → 6.6 → **7.2** | 5.8 → 6.2 → 6.6 → 6.8 → 6.8 | 8.4 → 8.2 → 8.2 → 7.6 → **8.0** | 7.6 → 7.6 → 8.0 → 7.8 → 7.4 | 6.1 → 6.4 → 7.0 → 6.8 → 6.8 | 5.8 → 5.8 → 6.4 → 6.4 → **6.6** |

**Would pay:**
- Alex: US$4.99 now, US$9.99 polished; would wishlist.
- Priya: S$4–6 once, and would delete the game if it had energy timers or ads.
- Ken: S$4–6 premium.
- Mary: $3.98–5.98 once, no ads.
- Wei Jie: $1–2, or free with cosmetics.

**Verdict: clarity and visuals recovered; fun and story are flat.**
- **Recovered:**
  - Clarity reached its best yet (6.6 → 7.2).
  - Visuals came back from the round-4 regression (7.6 → 8.0); nobody saw the tool row move.
  - Come back reached its best yet (6.6).
- **No longer reported:**
  - the swallowed post-demo drag
  - the double-tap Skip
  - the day-end numbers contradicting each other
  - the tool row moving
- **Fun stays at 6.8, and story slipped to 7.4. The reason has moved from bugs to design:**
  - "Too easy after Day 1" (Wei Jie).
  - "Every machine is just one more drop" (Ken).
  - Nothing big to chase (Wei Jie, Ken).
  - Characters are missing from their own story scenes (Alex, Ken).
- **The biggest trust problem left: the NEW RECIPE cards still come after the drink** (Wei Jie ×4, Ken ×4). Round 4's fix covered the NEW ORDER cards, which nobody flagged this round. The lesson card still waits for a free tray, so on a busy day it lands after the teacher has been served.

## What the fixes fixed (confirmed by players)

- **Demos:**
  - Priya: the demo and "now you try" was a top keep.
  - Mary called the paused "Watch!" demo with the clock stopped one of the most helpful things.
  - Nobody lost a drag after a demo.
- **Pause, auto-pause and resume:** all worked for Priya, including closing the game and reopening it in the night shop.
- **Juice:** Wei Jie noticed "COMBO ×5!" and "×11 in a row!", and the group orders were the most fun part for him.
- **Upgrades show:** Ken liked "Your upgrades earned +$X today" and seeing the upgrades on the stall.
- **Learning by doing:** the fill meter with real kopitiam words (KOSONG / SIEW DAI / NORMAL / GA DAI) was a top keep for Mary and Alex.
- **Day-end card:** nobody reported contradicting numbers.

## The gaps, ranked

### P0: breaks trust

1. **The NEW RECIPE (lesson) card still comes after the teacher is served (Wei Jie ×4, Ken ×4, Mary).**
   - Seen with Milo Dinosaur, Kopi C kosong, Siew dai, Teh tarik, Limau and Gu you.
   - Cause: `arrive()` sends `showLesson` through `whenCalm` like any card, so it waits for an empty tray (`TRAY_WAIT_MS`).
   - *Fix:*
     - The lesson card waits only for calm hands, like the NEW ORDER card.
     - The teacher's order stays hidden until the card has been seen.
     - If the teacher has already been served, drop the card and show a small "New: X in your recipe book" line instead.
2. **The coach says "Done! Drag it to X" for the wrong drink (Ken, Mary).**
   - A Kopi O was labelled for a customer who ordered Kopi.
   - A Kopi gu you was made with sugar instead of condensed milk, and the coach still said "Done".
   - Serving it gives an Oops.
   - *Fix:* "Done" only when `gradeCup` would be perfect or close. Otherwise say what's wrong, or re-label the cup to the customer it actually fits.
3. **Lesson demos start mid-rush (Ken: Day 5 with 5 customers; it took plate 2 and his inputs were lost).**
   - *Fix:* a demo waits like a story (empty tray, calm), or is offered as a "Watch how?" button on the card instead of starting by itself.

### P1: makes it feel thin or unfair

4. **No challenge curve (Wei Jie, Ken).**
   - After Day 1 nearly every cup is perfect, and patience rarely drops below about 76%.
   - The only real rush was Day 4 at 3pm.
   - *Fix:* tighten patience and add more overlapping arrivals from Day 3, plus a daily twist (rain day, office-lunch rush, inspector).
5. **Nothing big to chase (Wei Jie, Ken, Alex).**
   - Reaching Fame 25 unlocked four machines with no celebration.
   - Every night looks the same.
   - Nothing hints at the "empire".
   - Night 1 has nothing affordable ($11.70 earned against a $12 cheapest item).
   - The shop runs dry around Day 12.
   - *Fix:*
     - Fame milestone pops.
     - An $8–10 item on night 1.
     - An empire or second-stall teaser from Day 1.
     - The catalogue stretched over 30 days.
6. **Machines add no new skill (Ken).** Every machine is one more drop. *Fix:* give Tarik a real pull mini-game (hold and release in rhythm) and one other machine a real skill.
7. **Crowding at 4+ customers (all 5).** It's still the top visual complaint:
   - Speech bubbles stack, and one covered the Pause/Recipes row.
   - Customers walk in stacked on each other, and Ah Gong is hidden.
   - The pour meter covers faces.
   - The counter strip is overloaded: "Perfect ×3!" over the machine labels, "for Jogger" over "Butter", and the tarik mug over Makcik's face.
   - *Fix:* bubble layout that avoids overlaps (stagger heights or shrink when crowded), the meter below the faces, the feedback line moved off the counter row, and queue spots that don't overlap.
8. **Pacing.**
   - Empty mornings on Days 1–2.
   - The afternoon clock jumps (2:45pm to 4:00pm on one Milo Dinosaur).
   - The kids' 4× Milo Dinosaur order blocks the counter every evening from Day 2 to Day 6.
   - *Fix:* rotate or cap the kids event, and rein in the clock speed-up when the stall is merely between customers.
9. **Authenticity (Mary).**
   - A real uncle puts the milk or sugar in first, but Aunty Lim's demo teaches pouring first. Milk-first is allowed, but the demo should show it.
   - "¾ PENG" on the meter reads as "three-quarter iced".
   - The Ice Machine is locked though an ice bucket is already on the counter.
   - *Fix:*
     - Demo steps in the uncle's order.
     - Rename the ¾ mark ("¾ for ice").
     - Shop text explaining that the machine makes ice faster or better, compared with the bucket.
10. **Onboarding for non-gamers (Mary, Wei Jie).**
    - A tapped pot does nothing and no hint says "drag and hold".
    - A short sugar drag adds nothing.
    - The spill text is faint.
    - Tapping Cups before the first customer arrives is silent.
    - *Fix:*
      - A hand hint when a tool is tapped.
      - A minimum dose on a short pour.
      - A bigger spill splash.
      - Cups work at any time.
11. **Story scenes.**
    - Speakers aren't drawn: EP2's kids vanish at the choice, EP3 shows the kids, EP4 has no Oyen, and EP5 shows only Ah Ma.
    - Story choices have no visible effect: the kids "owe" but still pay in full.
    - Prologue Skip skips the story setup (Wei Jie).
    - The prologue's "Uncle… OK! I try!" line takes 3–4 taps (Mary, Alex).
    - An advancing tap picked a choice in EP1 (Ken).
12. **Glossary in the tutorial:** tapping "teh" in Aunty Lim's Day-1 bubble advanced the demo instead of opening the glossary (Alex).

### P2: polish and continuity

- **Time-of-day lines:** "lunch hour almost over" at 7:30am; "Morning!" at 12:30pm.
- **Ratings:**
  - Aunty Lim rates nearly every day 10/10, even 2-star days.
  - Her Day-1 10/10 still counts the demo cup.
- **Uncle Tan's lines:**
  - His day-end line repeats.
  - His tip didn't match the actual slip.
- **Clone customers:** a regular walks straight back in with a new order (Marcus ×3 on Day 3).
- **Orders changing:**
  - Ah Gong's order changed while he waited (Alex, Day 4).
  - A mid-day reload rerolls who's waiting.
- **Money:**
  - Odd cents ($3.53, $16.93).
  - Combo payouts drop while the combo rises.
- **Walk-outs:** a walk-out shows nothing (Alex).
- **Taps landing underneath:**
  - Dismissing the auto-pause screen also taps whatever is under it.
  - A story tap landed on "Save & back to title" on the day-end card.
- **Night shop:**
  - The list jumps back to the top after a purchase.
  - "Tap to confirm" spills out of its button.
  - The "Next:" nudge keeps switching items.
- **Day-end card:**
  - The 7pm last cup shows "Closing time!" instead of its result.
  - The month bar is 1 block on Days 1–3.
  - "Copy playtest notes" is visible to players (hide it in production).
- **Auto-pause:** fires after about 8 s while a player is still reading a card. Restart the timer after cards close, or use about 12 s.
- **Small layout and art issues:**
  - The Skip / Skip all buttons cover Spoon, Cups and Bin.
  - The Horlicks tin is clipped at the left edge.
  - Shop icons are emoji.
  - Small labels ("Condensed", "Evap (C)", cup labels, "Fame 25+").

## Recommended next steps (in order)

1. **P0 #1–#3:**
   - Lesson cards on calm hands only, with the teacher's order held until the card is seen.
   - "Done" only for a cup that grades well.
   - Lesson demos wait for a free tray, or become an opt-in "Watch how?".
2. **Crowding pass (#7):**
   - bubble layout
   - pour meter below the faces
   - the feedback line off the counter row
   - queue spacing
3. **Long-term pull, a plan of its own (#4–#6 and the round-4 leftovers):**
   - a challenge curve and daily twists
   - Fame milestone celebrations
   - an empire teaser
   - catalogue pacing
   - a Tarik skill mini-game
   - the Day 8–9 story gap
4. **Authenticity and onboarding (#9, #10), plus story characters drawn in their own scenes (#11).**

## Method notes

- Five agents, one browser tab each, their own save namespace, a fresh start from the title screen.
- Cost: about 1.09M agent tokens, about 340 screenshots, about 20 min of wall clock (in parallel).
