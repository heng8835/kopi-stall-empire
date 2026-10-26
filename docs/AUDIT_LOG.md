# Audit Log

Append-only history of this project's **decisions** and **notable changes** — the durable
record for version control and audit. Newest entry on top. **Never edit or delete past
rows**; to reverse a decision, add a new `archival` row that references the old one.

How this differs from the neighbouring docs (don't duplicate them):
- **DECISION_LOG.md** = the decisions in force *right now* (living). **This file** = the full
  *history*, including decisions that were later archived/reversed.
- The central **activity.jsonl** = cross-project session telemetry (one line per finish); this
  file is the human-readable project audit trail.

Written automatically by `please-finish` at the end of a session (decisions and notable
changes since the last entry). You may also add a row by hand when something matters.

**Columns**
- **Date** — `YYYY-MM-DD`.
- **Sev** — `major` (decision, architectural, breaking, data/security change) or `minor`.
- **Type** — `decision` · `change` · `archival` (a superseded/reversed decision).
- **Change** — one-line summary. No real data values, plant codes, or file-server paths.
- **Why** — the reason / trigger.
- **Refs** — commit hash, `docs/specs/<slug>.md`, or affected docs. Optional.

| Date | Sev | Type | Change | Why | Refs |
|------|-----|------|--------|-----|------|
| 2026-10-26 | major | change | Friendship meter for every customer (hearts on bubbles, bigger tips, more patience, waiting lines); new-order combination cards; Oyen + tin in Ep 1 | User playtest feedback | 3aa108a, 1ba4cfa |
| 2026-10-26 | major | decision | Day 1 tutorial = Aunty Lim teaches one drink in her own bubbles (ghost-hand demo), then a starter menu card; no note cards; stall locked until then | User: notes too heavy, wanted a guided first drink | b3ae38e, 32616a3 |
| 2026-10-25 | major | change | Full soundtrack (Suno, 6 tracks) with crossfade loops, story music over scene music; prologue cutscene + one-month trial framing | User wanted cozy SG music and a proper opening | 9bf9583, 6ce2faf |
| 2026-10-25 | minor | decision | Kettle gao/poh uses the "cozy" rule (normal drinks unchanged); tarik mugs teach teh tarik | User picked the cozy option | 9550a35 |
| 2026-10-23 | minor | change | Spec written for order tickets, peng ¾ fill rule, better day summary + 3-day flow | User playtest feedback; to build in a new session | docs/specs/order-tickets-day-summary.md |
| 2026-10-22 | major | change | Stall art pass: user's background, tool sheet, glass cup; clean kid/Marcus/Jun/Mei pack | User wanted the game to match the mockup | 2b8d2e4, 2f93ed6 |
| 2026-10-22 | major | decision | Rebuilt the day as a first-person stall with hands-on drag/pour/stir/serve, 2-minute days | User: buttons not fun, day too long | 70942fb, 94eb34c |
| 2026-10-21 | major | change | Live on GitHub Pages with CI (tests + build + deploy on push) | Pro workflow: play on real phones | 9aeb66b |
| 2026-10-21 | minor | change | Day-1 tutorial, procedural sound, juice; fixed customer stuck in queue | Onboarding + feel | 335ba5f, 2b2dc5b, 29fb93e |
| 2026-10-21 | major | decision | HD finish for AI art at 360x640 (not a forced pixel grid); player = young owner Jun/Mei | Forced grid damaged the art; user request | 37b0100 |
| 2026-10-21 | archival | archival | 12x16 / 16x24 code-drawn pixel sprites dropped in favour of AI art | User preferred ChatGPT-style chibi art | 1bda3af |
