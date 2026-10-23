# Project Brief — Kopi Stall Empire

Game design (cast, drinks, kopi grammar, events, upgrades) lives in `GAME_DESIGN.md`.
This brief only records scope, decisions-status and acceptance for the current milestone.

## Summary (Confirmed)
Cozy kopitiam stall game, Phaser 3 + Vite, mobile-browser portrait first. Playtest build on
GitHub Pages (https://heng8835.github.io/kopi-stall-empire/), final release on itch.io.

## First vertical slice (Confirmed) — v0.1
1 stall, a 30-day month (90 s days, saved), 6 drinks, 6 counter customers, a month-1 story of 15
short-drama episodes (docs/story/month-1.md), Fame-driven customer volume, then night upgrades.
Player is a young owner (Jun or Mei). Drinks are made by hand from a first-person stall view
(drag cup, hold pot to pour, milk/sugar gauges, ice/powder, stir, drag to customer).

Done so far: setup, hands-on serving loop (StallScene), HD art for owners + all v0.1 customers
except Sophie, Day-1 tutorial, sound, juice, playtest log, CI + Pages deploy.
Also done: walk-in + queue, Fame, 30-day run + save + Continue, story calendar (docs/specs/walk-in-fame-story.md).
Next: `docs/specs/order-tickets-day-summary.md` (order tickets, peng ¾ rule, richer day summary; its
3-day flow part is superseded). Then night phase + upgrades, then polish + itch.io.

## Not included yet (Confirmed)
Anything beyond v0.1 — park in `IDEAS.md`. Backlog cast art already exists in `art/source/`.

## Technical direction (Confirmed — see DECISION_LOG)
- Logical 360x640; backbuffer = logical x min(3, fit x devicePixelRatio)
- AI-made pixel-styled HD art, HD finish (no forced pixel grid); pipeline in CLAUDE.md
- No backend; localStorage save (try/catch)
- Vitest for pure systems; Actions runs tests + deploys on every push to main

## Acceptance — current slice
- Done when every v0.1 order can be made "perfect" with the drag tools (tests/cup.test.js).
- Done when wrong drinks / timeouts only have gentle consequences (no game over).
- Done when the tutorial teaches the actions and can be skipped / replayed.
- Done when the day lasts ~90 seconds and ends with a summary + Next day + Copy playtest notes.
- Done when `npm test` passes and the game works at 375x812.

## Open questions
- TODO: Sophie (tourist) art without the flag keychain / Merlion print (user to regenerate).
- TODO: tune pour speeds / patience / gauge zones from real-phone playtest notes.
