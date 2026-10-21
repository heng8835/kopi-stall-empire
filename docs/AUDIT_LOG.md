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
