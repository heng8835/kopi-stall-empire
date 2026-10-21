# Kopi Stall Empire (working title)

A chill, cozy kopi stall management game set in Singapore kopitiam daily life.
Think "Dave the Diver-lite": a simple serving loop plus lots of small, funny,
real Singapore daily-life drama. Long-term goal for the player: grow one kopi
stall into a kopi stall empire.

Full design: see `GAME_DESIGN.md`. Read it before building any feature.

## Current milestone: v0.1 vertical slice
- 1 stall, 3 in-game days (~3 minutes each)
- 6 drinks, 6 customer characters, 8 drama events
- Day phase (serve customers) -> night phase (spend earnings on upgrades)
- Playable in a mobile browser (portrait first), also works on desktop
- Do NOT add features beyond v0.1 scope unless asked. Note ideas in `IDEAS.md` instead.

## Tech stack
- Phaser 3 + Vite, plain JavaScript (no TypeScript for now)
- Pixel-perfect rendering: `pixelArt: true`, integer scaling
- No backend. Save progress in localStorage (wrap in try/catch).
- Host on itch.io as an HTML5 build (`npm run build` -> `dist/`)

## Suggested structure
```
src/
  main.js            Phaser config
  scenes/            Boot, Day, Night, Title
  data/
    drinks.js        drink recipes + order text
    customers.js     cast definitions (sprite, orders, dialogue lines)
    events.js        drama events (trigger, dialogue, effect)
    sprites.js       pixel maps + palette (see below)
  systems/           order parsing, money, upgrades, event scheduler
  i18n/              dialogue strings by language mix
```
Content (drinks, customers, events, dialogue) lives in `src/data/` as plain
data so new content can be added without touching game logic.

## Art rules
- Chunky pixel art, chibi proportions: BIG head, small body
- Base character grid 12x16 (v0.1). May grow to 16x24 for animations later.
- Dot eyes, pink blush, tiny mouth, flat colours, no outlines-heavy style
- Pastel sky-blue backgrounds, warm kopitiam tones
- Sprites are drawn from character maps in `src/data/sprites.js`
  (one character per pixel, palette lookup). Keep that format.
- Original characters only. No copyrighted characters or real brand logos.

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
- Every scene's `create()` starts with `fitCamera(this)` (integer zoom, see `src/systems/view.js`).
- Sprite preview (dev only): http://localhost:5173/sprites.html
- Use `addText()` from `src/systems/text.js` for all text (crisp at any zoom).
- Session handoff: `docs/STATE.yml`. Decisions: `docs/DECISION_LOG.md`. Scope/acceptance: `docs/PROJECT_BRIEF.md`.
