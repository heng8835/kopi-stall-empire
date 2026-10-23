# Kopi Stall Empire (working title)

A chill, cozy kopi stall management game set in Singapore kopitiam daily life.
Think "Dave the Diver-lite": a simple serving loop plus lots of small, funny,
real Singapore daily-life drama. Long-term goal for the player: grow one kopi
stall into a kopi stall empire.

Full design: see `GAME_DESIGN.md`. Read it before building any feature.

## Current milestone: v0.1 vertical slice
- 1 stall, a 30-day month (~3-minute days; closing waits for the last customers), saved between sessions
- 6 drinks, 6 counter customers, month-1 story: 15 short-drama episodes on a calendar
  (`src/data/events.js`, script in `docs/story/month-1.md`); Fame (名气) sets customers per day
- Day phase (serve customers) -> night phase (spend earnings on upgrades)
- Playable in a mobile browser (portrait first), also works on desktop
- Do NOT add features beyond v0.1 scope unless asked. Note ideas in `IDEAS.md` instead.

## Tech stack
- Phaser 3 + Vite, plain JavaScript (no TypeScript for now)
- Logical resolution 360x640 (portrait). Backbuffer = 360x640 x (fit x devicePixelRatio, max 3), so HD art and text stay sharp.
- HD sprites use linear filtering. Drinks/liquids are drawn in code (`src/systems/cup.js` + StallScene).
- No backend. Save progress in localStorage (wrap in try/catch).
- Host on itch.io as an HTML5 build (`npm run build` -> `dist/`)

## Suggested structure
```
src/
  main.js            Phaser config
  scenes/            Boot, Title, StallScene (key 'Day': first-person stall), Night later
  data/
    drinks.js        drink recipes + order text
    customers.js     customer definitions (sprite key, slot, orders, lines key)
    owners.js        playable owners (Jun / Mei)
    spriteSizes.json HD sprite keys -> display height (single source of truth)
    events.js        drama events (trigger, dialogue, effect)
    tools.js         stall tools: id, kind (pour/drop/stir/rack/bin), position
    stallTuning.js   day length, pour speeds, sugar/milk/fill zones (tune from playtests)
  systems/           order parsing, money, upgrades, event scheduler
  i18n/              dialogue strings by language mix
```
Content (drinks, customers, events, dialogue) lives in `src/data/` as plain
data so new content can be added without touching game logic.

## Art rules
- Pixel-styled HD chibi art: big round head, small body, thick dark outline, soft
  2-3 tone shading, pink blush, expressive faces. Pastel sky-blue backgrounds, warm kopitiam tones.
- Character art is made outside the repo (ChatGPT image gen) and kept in `art/source/`.
  Pipeline: `tools/prep_still.py` (cutout -> `art/prepped/`, gitignored) ->
  add key + display height to `src/data/spriteSizes.json` -> `tools/build_sprites.py`
  (HD finish, 3x) -> `public/sprites/<key>.png` (committed). Run tools with `.venv/Scripts/python`.
- Style rules + ready-to-paste ChatGPT prompts: `docs/ART_BIBLE.md`.
- Do not force AI art onto a low-res pixel grid (it damages it; see `docs/art/finish-comparison.png`).
- Original characters only. No copyrighted characters, real brand logos or monograms,
  national flags or landmark/mascot trademarks (e.g. the Merlion).

## Language rules
Dialogue should feel like real Singapore: mixed and natural.
- Main mix for v0.1: Singlish, English, Chinese (Mandarin). Light Hokkien flavour is fine.
- Each character has their own natural mix (see cast in GAME_DESIGN.md).
- Order bubbles use real kopitiam lingo (e.g. "Kopi C siew dai peng").
- Every local term must have a glossary entry (tap-to-explain pop-up).
- Humour is affectionate. Never mock ethnicity, religion or accents in a mean way.

## Tone
Chill and cozy. No fail states that feel punishing. Drama events are funny and
warm, not stressful. Example: the kopitiam catches fire and Aunty Lim calmly
keeps eating her char kway teow.

## Workflow
- Use plan mode for any feature touching more than 2 files.
- Commit after each working feature with a clear message.
- After building a feature, run the game and check it in a mobile-sized viewport.
- When adding a drama event or customer, follow the existing data format exactly.

## Commands + docs
- `npm run dev` (http://localhost:5173), `npm test` (Vitest), `npm run build` -> `dist/`
- Every scene's `create()` starts with `fitCamera(this)` (render-scale zoom, see `src/systems/view.js`).
- Place characters with `addSprite(scene, key, x, yFeet)` from `src/systems/sprites.js`.
- Dev hooks: `window.__stall` (scene), `window.__sfx`; drinks graded by `gradeCup` in `src/systems/cup.js`.
- Use `addText()` from `src/systems/text.js` for all text (crisp at any zoom).
- Session handoff: `docs/STATE.yml`. Decisions: `docs/DECISION_LOG.md`. Scope/acceptance: `docs/PROJECT_BRIEF.md`.
