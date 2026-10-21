# Project Brief — Kopi Stall Empire

Game design (cast, drinks, kopi grammar, events, upgrades) lives in `GAME_DESIGN.md`.
This brief only records scope, decisions-status and acceptance for the current milestone.

## Summary (Confirmed)
Cozy kopitiam stall management game, Phaser 3 + Vite, mobile-browser portrait first, hosted on itch.io.

## First vertical slice (Confirmed) — v0.1
1 stall, 3 days (~3 min each), 6 drinks, 6 customers, 8 drama events, day -> night upgrades.
Built in milestones: M0 setup, M1 serving loop, M2 cast + art, M3 night + save, M4 events, M5 polish + ship.

## Not included yet (Confirmed)
Anything beyond v0.1 — park in `IDEAS.md`.

## Technical direction
- Logical 180x320, integer camera zoom, canvas = 180*z x 320*z (Confirmed — see DECISION_LOG)
- No backend; localStorage save (Confirmed)
- Vitest for pure systems (Recommended)

## Acceptance — M1 serving loop
- Done when a customer walks up with a kopitiam-lingo order bubble, player builds the drink with taps, serves it, and gets paid + happiness.
- Done when tapping a local term in the bubble opens a glossary pop-up.
- Done when the kids' group order needs 4 cups.
- Done when a wrong drink or timed-out customer has only gentle consequences (no game over).
- Done when the day clock ends and a summary card appears.
- Done when `npm test` passes and the game works at 375x812.

## Open questions
- TODO: Ah Gong + Tourist sprite style (to draw in M2, same 12x16 format).
