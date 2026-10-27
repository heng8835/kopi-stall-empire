// What the day-end card shows: stars, counts, money split, fame change, per-customer rows,
// the most common slips with Uncle Tan's tip, and a happy quote. Pure, no Phaser.
import { TIPS, DEFAULT_TIP, WALKOUT_TIP } from '../data/tips.js';

export function tipFor(reason) {
  return TIPS.find((t) => reason?.includes(t.match)) ?? DEFAULT_TIP;
}

// entry: the playlog entry for today (events), econ: the day's economy state, names: id -> display name
export function summarizeDay(entry, econ, names = {}) {
  const serves = entry.events.filter((e) => e.type === 'serve');
  const timeouts = entry.events.filter((e) => e.type === 'timeout');
  const counts = { served: serves.length, perfect: 0, close: 0, oops: 0, walkedOut: timeouts.length };
  const per = {};
  const row = (who) => (per[who] ??= { who, name: names[who] ?? who, perfect: 0, close: 0, oops: 0, walkedOut: 0 });
  const slips = {};
  for (const s of serves) {
    counts[s.tier] += 1;
    row(s.who)[s.tier] += 1;
    for (const r of s.reasons ?? []) slips[r] = (slips[r] ?? 0) + 1;
  }
  for (const t of timeouts) row(t.who).walkedOut += 1;

  const rate = counts.served ? counts.perfect / counts.served : 0;
  // 3 stars: almost all perfect and nobody walked out; 2: mostly right; a rough day: 1
  const stars = !counts.served ? 1 : rate >= 0.8 && counts.walkedOut === 0 ? 3 : rate >= 0.5 && counts.walkedOut <= 2 ? 2 : 1;
  const topSlips = Object.entries(slips)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([reason, n]) => ({ reason, n }));
  const quote = [...serves].reverse().find((s) => s.tier === 'perfect' && s.line);

  return {
    stars,
    counts,
    money: { sales: econ.earnedToday - (econ.tipsToday ?? 0), tips: econ.tipsToday ?? 0, total: econ.earnedToday },
    fame: { from: Math.floor(econ.fameStart), to: Math.floor(econ.fame) },
    perCustomer: Object.values(per),
    topSlips,
    tip: topSlips.length || !counts.walkedOut ? tipFor(topSlips[0]?.reason) : WALKOUT_TIP,
    quote: quote ? { who: names[quote.who] ?? quote.who, line: quote.line } : null,
  };
}
