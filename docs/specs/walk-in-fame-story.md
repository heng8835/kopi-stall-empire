# Spec: walk-in + queue, 90 s days, Fame-driven volume, 30-day story calendar

Status: BUILT 2026-10-23 (approved by user). Kenneth's monogram was painted out, so he shows in full (silhouette only in Ep 3).
Story script: `docs/story/month-1.md` (15 episodes, Days 1-30).

- **Goal:**
  - Customers walk in from the street opening on the left and queue behind the counter when it's full.
  - Days are shorter (90 s).
  - The ♥ bar becomes **Fame 名气**, which decides how many customers come each day: 8-9 on Day 1, growing to ~16.
  - A 30-day run with a short-drama story calendar: an episode every 2-3 days, one on each of the first 3 days, choices with callbacks, and three warm endings.
  - Progress is saved, so the month can be played across sessions.

## Acceptance criteria
1. Every counter customer enters from the left street opening (x < 0, behind the rope posts).
   - They walk to their counter spot, growing from far-away scale to full size, with a waddle (bob + tilt) on their current still.
   - If a `<key>Walk` sprite sheet exists, it plays that instead (no code change needed per character).
2. When all counter spots are taken, new customers queue by the rope posts, up to `TUNING.queueMax = 3`.
   - When a spot frees up, the front of the queue walks to it.
   - Patience only starts at the counter. A group (the kids) waits until the whole counter is free.
3. `TUNING.dayMs = 90_000`. Spawns are spread so a day brings `customersForFame(fame)` arrivals. A group counts as 1 arrival.
4. Fame 0-100, starting at 10:
   - `customersForFame`: 10 → 8, 20 → 9, ~95 → 16. Clamped to 8-16, all in `stallTuning.js`.
   - The HUD shows "名气 Fame" instead of ♥.
   - A perfect serve gives +0.5, a walk-out −1 (tunable). Story choices add their listed fame.
5. Story episodes run on their calendar day at `start` / `mid` / `end`. Each one plays as a mini-drama overlay that pauses the day:
   - dimmed stall, speaker sprite or silhouette, name tag + line box
   - tap to advance, and a skip button
   - 2-3 choice buttons, then the 短剧 caption sting
6. Choices set flags and apply fame / money effects. `[if flag]` lines only show when that flag is set. The Day 30 ending is picked by fame (≥70 / 40-69 / <40).
7. Day end → summary → **Next day** carries money, fame and flags to Day + 1. After Day 30 the ending plays, then "Month 1 complete".
8. Progress (day, money, fame, flags, Aunty Lim's ratings) is saved in localStorage after each day. The title screen offers **Continue** / **New game**.
9. `npm test` and `npm run build` pass. The game plays at 375×812 with no console errors.

## Assumptions
- Answers from you: 90 s days, a mini-drama that pauses the day, ♥ becomes Fame, and the backlog cast is used.
- Walk frames are deferred (route to be decided: xAI key / Grok CLI / ChatGPT sheets). For now the code waddles the still. The frame hook is built so frames drop in later.
- Ah Gong keeps his fade-in at the table; he doesn't walk.
- The 3-day flow and "Next day" button from `order-tickets-day-summary.md` are taken over here. That spec's ticket / peng / rich-summary parts stay as they are and are built **after** this one.
- The night phase / upgrades are not part of this spec. The day summary goes straight to "Next day".
- Story-only characters appear only inside episodes, not in the random customer pool. New regulars are parked in IDEAS.md.
- On Day 1 the episode `start` plays after the tutorial finishes or is skipped.
- Milestone change: v0.1 grows from "3 days" to "30 days / month 1". This gets logged in DECISION_LOG and CLAUDE.md is updated.

## Approach
- **Walk + queue (StallScene + new pure `src/systems/queue.js`):**
  - A customer is placed in a counter spot or the queue at spawn.
  - A walker helper tweens x/y/scale along `ENTRY → (QUEUE[i] →) SPOT`. Waddle = y bob + ±4° angle, tied to tween progress.
  - `queue.js` holds the line (enqueue, `nextFor(freeSpots)`, the group rule), so the rules are unit-tested.
  - Walk-sheet hook: `addWalker(scene, key)` uses an animation `<key>-walk` if the texture `<key>Walk` exists, else the still.
- **Fame + volume (`src/systems/economy.js`, `stallTuning.js`):**
  - Rename `happiness` → `fame`, with a migration: old saves read `happiness` as fame.
  - `customersForFame(f) = clamp(round(8 + f/12), 8, 16)`.
  - The spawn timer becomes a precomputed schedule: N arrival times jittered across `[firstSpawnMs, dayMs − lastSpawnBeforeEndMs]`.
  - A rush effect inserts extra arrivals.
- **Story engine (new pure `src/systems/story.js` + data `src/data/events.js` + UI `src/systems/drama.js`):**
  - `events.js`: `{ id, day, when, title:{en,zh}, cast:[keys], beats:[{who, text, if?}], choice?:{ options:[{label, flags, fame, money, reply:[beats]}] }, caption, effects? }`.
  - The finale has `endings` keyed by fame band.
  - `story.js`:
    - `eventsFor(day, when)` and `visibleBeats(beats, flags)`
    - `applyChoice(state, option)` → new state
    - `endingFor(fame)`
  - `drama.js`: the overlay renderer. It pauses tweens and the clock, then resumes them.
  - Hooks in StallScene: after create/tutorial (`start`), at 40% of the day clock (`mid`), and in `endDay` before the summary (`end`).
- **Run state + save (`src/systems/save.js`, new `src/systems/run.js`):**
  - `run = { day, money, fame, flags:[], ratings:[] }`.
  - `run.js`: `newRun()` and `nextDay(run, dayResult)`. Saved under `kopiStall.run`.
  - TitleScene: Continue / New game.
- **Aunty Lim's ratings:** her nightly score = `clamp(round(perfectRate × 10), 3, 10)`, pushed to `run.ratings` and shown in Ep 1 and Ep 8.
- **Art:**
  - Cut out the 6 backlog characters listed in `month-1.md` with `tools/prep_still.py`, add them to `spriteSizes.json`, then `build_sprites.py`.
  - Kenneth stays a silhouette (`setTintFill(0x1a1a1a)`) until the fixed art exists.
- **Glossary:** add every new term listed in `month-1.md`.

## Affected files
| File | Change |
|---|---|
| `src/scenes/StallScene.js` | walker + queue, spawn schedule, Fame HUD, story hooks, Next day |
| `src/scenes/TitleScene.js` | Continue / New game |
| `src/data/stallTuning.js` | dayMs 90 s, queue/walk/fame/volume numbers |
| `src/data/events.js` *(new)* | the 15 episodes from `month-1.md` |
| `src/data/glossary.js` | new terms |
| `src/data/spriteSizes.json` + `public/sprites/` | 6 story sprites |
| `src/systems/economy.js` | happiness → fame |
| `src/systems/queue.js`, `story.js`, `run.js` *(new, pure)* | rules, unit-tested |
| `src/systems/drama.js` *(new)* | the episode overlay UI |
| `src/systems/save.js` | unchanged (used by `run.js`) |
| `tests/queue.test.js`, `story.test.js`, `run.test.js`, `events.test.js` *(new)*; `economy` tests updated | |
| `docs/ART_BIBLE.md` | walk-sheet prompt + Kenneth fix prompt |
| `IDEAS.md`, `DECISION_LOG.md`, `CLAUDE.md`, `PROJECT_BRIEF.md`, `STATE.yml` | scope note, decisions, walk-frame route note |

## Data flow
- **Starting the run:** `TitleScene` → `run` (loaded or new) → `Day` scene `data.run`.
- **Spawning:** the spawn schedule comes from `customersForFame(run.fame)`.
- **Serving:** a serve calls `applyServe`, which updates fame.
- **Episodes:** `eventsFor(day, when)` → drama overlay → `applyChoice` → `run.flags` / fame / money.
- **Day end:** `endDay` → rating pushed → `nextDay(run)` → `save('run')` → summary → Next day.

## Failure modes & edge cases
- **Episode during a drag or pour:** the episode waits until no cup is being dragged or poured (max 3 s), then pauses.
- **Group in queue while singles wait behind:** singles don't skip past the group. FIFO is kept so nobody "jumps the queue". The kids just wait.
- **Queue full:** the spawn is delayed by 3 s and retried. It's not lost unless the day ends.
- **Forced episode customers (the kids on Day 2):** they join the queue like anyone else. The episode fires when they reach the counter.
- **Missing sprite for a speaker:** a silhouette of a generic still + name tag. `events.test.js` asserts every `who` is a sprite key, `narrator`, `note`, `owner` or a listed silhouette.
- **localStorage blocked:** the run lives in memory only. The game works, just without Continue.
- **Old saves:** `tutorialDone` and `owner` are kept. With no `run`, the title shows only "New game".

## Security / sensitive data
None.

## Cost / performance
- Negligible in code.
- Art cut-outs are local; no generation spend.
- 6 extra sprites ≈ +1-2 MB in `public/sprites/`. If it's heavier, convert to webp.

## Test plan
- `npm test`:
  - `queue`: FIFO, the group-waits rule, `queueMax`
  - `story`: `eventsFor`, `[if]` filtering, `applyChoice`, `endingFor` bands
  - `run`: `nextDay` carry, save round-trip with blocked storage
  - `events`: data validation — speakers, glossary terms, line length ≤ 90 chars, days 1-30, and a gap ≤ 3 days after Day 3
  - `economy`: fame deltas + `customersForFame` table
- `npm run build`.
- Browser pane, 375×812:
  - Day 1: 8-9 arrivals walk in from the left; the queue forms when the counter is full; the front walks up when a spot frees.
  - Ep 1 plays after the tutorial; its end choice sets the flag.
  - Jump to Day 2 / 12 / 14 / 30 via `?day=N&flags=a,b`: episodes, `[if]` lines, and the ending band changes with `?fame=`.
  - Next day carries money and fame; reloading shows Continue.
  - No console errors.

## Rollout
Old saves have no run, so the game starts a new run. Commit per task group; push for GitHub Pages.

## Alternatives considered
- **Random events instead of a calendar:** no story arc, no callbacks. You asked for a calendar.
- **Keeping ♥ and adding Fame:** two bars on a 360-wide HUD for little gain. You chose a single Fame bar.
- **Real walk frames now:** no generation route on this machine. Deferred behind the hook.

## Open questions
- Kenneth's art fix (monogram briefcase) — yours, whenever. He's a silhouette until then.
- The walk-frame route: an xAI key, the Grok CLI, or ChatGPT sheets.

## Tasks
- [x] T1 Tuning: 90 s day, queue/walk/fame/volume numbers; economy happiness → fame + `customersForFame` (+ tests)
- [x] T2 `queue.js` + tests; StallScene walker (waddle on still, `<key>Walk` hook) + queue by the rope posts + spawn schedule
- [x] T3 `run.js` + save + Next day + TitleScene Continue / New game (+ tests)
- [x] T4 `story.js` + `drama.js` overlay + StallScene hooks (start / mid / end, wait-for-drag, pause) (+ tests)
- [x] T5 `events.js`: convert all 15 episodes from `docs/story/month-1.md`; glossary terms; `events.test.js`
- [x] T6 Story sprites: cut out 6 backlog characters → `spriteSizes.json` → build; Kenneth silhouette
- [x] T7 Docs: ART_BIBLE (walk sheet + Kenneth fix prompts), IDEAS, DECISION_LOG, CLAUDE.md milestone, PROJECT_BRIEF
- [x] T8 Verify: `npm test`, `npm run build`, pane run at 375×812 (Day 1 walk/queue, Ep 1-2, jump to Day 14 + 30)
