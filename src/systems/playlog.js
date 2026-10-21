// Playtest log: what happened each day, kept in localStorage (last MAX_DAYS days) so a
// tester can copy a short summary from the day-end card and paste it back for tuning.
import { load, save } from './save.js';

const KEY = 'playlog';
const MAX_DAYS = 20;

export function startDay({ day, owner }) {
  return { day, owner, startedAt: new Date().toISOString(), events: [] };
}

// tMs = in-game clock (ms since the stall opened) so pacing can be read later.
export function logEvent(entry, type, data = {}, tMs = 0) {
  entry.events.push({ type, t: Math.round(tMs), ...data });
}

export function finishDay(entry, econ) {
  entry.result = { served: econ.served, perfect: econ.perfect, walkedOut: econ.walkedOut, earned: econ.earnedToday, happiness: econ.happiness };
  const all = [...load(KEY, []), entry].slice(-MAX_DAYS);
  save(KEY, all);
  return entry;
}

export const getLog = () => load(KEY, []);
export const clearLog = () => save(KEY, []);

// Compact, human-readable summary of one day (what gets copied to the clipboard).
export function summarize(entry) {
  const serves = entry.events.filter((e) => e.type === 'serve');
  const timeouts = entry.events.filter((e) => e.type === 'timeout');
  const glossary = entry.events.filter((e) => e.type === 'glossary').map((e) => e.key);
  const byWho = {};
  for (const e of [...serves, ...timeouts]) {
    const w = (byWho[e.who] ??= { perfect: 0, close: 0, oops: 0, timeout: 0, waits: [] });
    if (e.type === 'timeout') w.timeout += 1;
    else {
      w[e.tier] += 1;
      w.waits.push(e.waitMs);
    }
  }
  const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length / 100) / 10 : 0);
  const lines = [
    `Kopi Stall playtest — day ${entry.day} as ${entry.owner} (${new Date(entry.startedAt).toLocaleString()})`,
    entry.result
      ? `served ${entry.result.served} (perfect ${entry.result.perfect}), walked out ${entry.result.walkedOut}, earned $${(entry.result.earned / 100).toFixed(2)}, happiness ${entry.result.happiness}`
      : 'day not finished',
    ...Object.entries(byWho).map(
      ([who, w]) => `- ${who}: perfect ${w.perfect}, close ${w.close}, oops ${w.oops}, timeout ${w.timeout}, avg wait ${avg(w.waits)}s`,
    ),
  ];
  const mistakes = serves.filter((e) => e.tier !== 'perfect').map((e) => `${e.wanted} -> made ${e.made}`);
  if (mistakes.length) lines.push(`mistakes: ${mistakes.join('; ')}`);
  if (glossary.length) lines.push(`glossary opened: ${glossary.join(', ')}`);
  return lines.join('\n');
}
