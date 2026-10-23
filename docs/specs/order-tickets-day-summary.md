# Spec: order tickets on cups + peng fill rule + better day summary

Status: BUILT 2026-10-23 (phase B). A (peng rule) shipped in phase A; the 3-day flow in D was superseded by the 30-day run. Tickets: tap sprite or bubble; target zone outlined on the pour bar and a dashed target line on the glass.
Why: players can't tell how much teh to pour for a peng drink or where "siew dai" is on the gauge, and the day-end card is too thin. User chose "order tickets on cups" (tap a customer -> ticketed cup appears -> gauge highlights that order's target band).

## A. The peng (iced) fill rule (`src/systems/cup.js`, `src/data/stallTuning.js`)
- Add `TUNING.iceVolume = 0.25`. `addIce` raises `cup.fill` by that once, and the drawn liquid level rises too.
- Grading stays "total fill in 0.85–1.05". So the recipe for peng is: **pour to the ¾ line (about 0.6–0.8), then add ice**. Filling to the top and then adding ice gives "spilled over".
- Tests: update `makePerfect` in `tests/cup.test.js` and `tests/tutorial.test.js` (pour 0.7 before ice). Add tests for "full + ice → spilled" and "¾ + ice → perfect".

## B. Order tickets (`src/scenes/StallScene.js`)
- **Taking an order:** tapping a waiting customer's sprite or bubble (anywhere except an orange glossary word) takes the order.
  - It places a cup in the first free tray slot (no rack drag needed) and clips on a ticket: a cream paper tag above the cup showing the order lingo + name, e.g. "Teh C siew dai peng · Aunty".
  - If the tray is full, the feedback says "Tray full — serve or bin a cup first".
- **Groups:** each tap on the kids takes the next ticket ("Milo Dinosaur 2/4"). There's at most one ticket per cup still owed, so `c.ticketsTaken` ≤ n − served.
- **The bubble after taking the order:** it shows a small "✓ ticket" mark. Before that, it shows a subtle "tap to take order" hint the first few times (tutorial).
- **Gauges on a ticketed cup:**
  - The target band is highlighted with a ★ and a text label: "★ siew dai", "★ normal", "★ kosong", "★ no milk (O)" (shown as an outline-only red band if any milk is poured), "★ full" (hot) or "★ ¾ (peng)".
  - The glass gets a dashed target line: the full line, or the ¾ line for peng.
  - Unticketed cups keep the plain gauge.
- **Serving:** a ticket doesn't lock the cup. It can still be served to anyone, and it's graded against whoever receives it.
  - The ticket is removed when the cup is served or binned.
  - If the ticket's customer leaves, the ticket greys out with "(left)".
- **Rack:** it stays for spare cups.

## C. Tutorial (`src/data/tutorial.js`)
- Step 1 becomes: "Tap Aunty to take her order — a cup with her ticket appears. HOLD the teh pot till the ★ zone…".
- Step 3 teaches peng: "pour to the ¾ line, then ice".
- Highlights: the `rack` is replaced by a customer highlight (new id `customer`). `TOOL_IDS` is updated accordingly, and so is the test.

## D. Better day summary (new pure module `src/systems/daySummary.js` + `tests/daySummary.test.js`, UI in `StallScene.endDay`)
- **The summary function:** `summarizeDay(logEntry, econ)` returns:
  - `stars` (1–3), from the perfect rate and walk-outs
  - `counts` (served, perfect, close, oops, walked out)
  - `money`: sales, tips and total. This needs `econ.tipsToday` tracked in `applyServe` (`src/systems/economy.js`).
  - `happiness` from start to end. This needs `econ.happinessStart`.
  - `perCustomer` rows: name + perfect / close / oops / walked out
  - `topSlips`: the most common reasons from the serve log, e.g. "forgot to stir ×3"
  - `tip`: Uncle Tan's advice for the top slip, from a data map in `src/data/tips.js`, e.g.
    - forgot to stir → "Wiggle the spoon after milk or sugar!"
    - too sweet → "Siew dai = stop in the light-green ★ zone"
    - forgot the ice / spilled → "Peng: pour to the ¾ line, then ice"
  - `bestQuote`: a happy customer line from the day
- **The serve log entry:** must also record `reasons` (StallScene already logs them) and the customer's display name.
- **UI:** a full-height summary card replaces the small one:
  - the title + 中文
  - the ★ rating
  - the stats row
  - money (sales / tips / total)
  - the ♥ change
  - per-customer rows
  - "Uncle Tan says: …" with the tip
  - the best quote
- **Buttons:**
  - **Next day:** goes to Day + 1, carrying money and happiness through `data.carry`, and after day 3 it shows "Close stall". This is the v0.1 3-day flow.
  - **Close stall.**
  - **Copy playtest notes:** kept. `summarize()` in `src/systems/playlog.js` also includes the top slips.

## Verification
- `npm test`: the new `daySummary` tests, the updated cup and tutorial tests, all green.
- `npm run build`.
- Browser pane at 375×812, with real mouse-event drags (the `window.__drag` helper pattern from this session):
  - Take an order by tapping a customer, check the ticket appears, the target band and dashed line show, and a peng drink made to the ¾ line + ice is perfect.
  - Full + ice → "spilled over".
  - Kids' 4 tickets.
  - Tray full message.
  - The ticket greys out when its customer leaves.
  - End the day and check the new summary: stars, money split, top slip + tip, Next day → Day 2 with money carried.
  - No console errors.
- Commit and push. The user plays on GitHub Pages.
