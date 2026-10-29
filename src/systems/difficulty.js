// How each day of the month plays (round 5: "too easy after Day 1, nothing to chase"): a gentle
// challenge curve, a daily twist and a small daily goal. Pure, no Phaser.
import { TUNING } from '../data/stallTuning.js';
import { TWISTS, TWIST_CYCLE } from '../data/twists.js';

const LAST_DAY = 30;

// Patience eases down from Day 3 to Day 10 and then holds; from Day 4 rushes can be bigger and closer.
export function dayDifficulty(day) {
  const t = Math.min(1, Math.max(0, (day - 2) / 8));
  const { patienceScale: easy, patienceScaleHard: hard } = TUNING;
  return {
    patienceScale: Math.round((easy - t * (easy - hard)) * 1000) / 1000,
    rushGap: day >= 4 ? TUNING.rushGapHardMs : TUNING.rushGapMs,
    rushMax: day >= 4 ? 4 : 3,
  };
}

// Today's twist, or null (none before Day 3, and the finale is left alone).
export function pickTwist(day) {
  if (day < 3 || day >= LAST_DAY) return null;
  const id = TWIST_CYCLE[(day - 3) % TWIST_CYCLE.length];
  return id ? TWISTS[id] : null;
}

// Weight multiplier for a walk-in's order under today's twist (spec from parseOrder).
export const twistWeight = (twist, spec) => (!twist ? 1 : spec.iced ? twist.iced ?? 1 : twist.hot ?? 1);

// Today's goal, from Day 2: { kind, target, text }. A twist picks a goal that fits it.
export function dailyGoal(day, twist = null) {
  if (day < 2 || day >= LAST_DAY) return null;
  if (twist?.id === 'rain') return { kind: 'hot', target: 4, text: 'Serve 4 hot drinks perfect' };
  if (twist?.id === 'heatwave') return { kind: 'iced', target: 3, text: 'Serve 3 iced drinks perfect' };
  const cycle = [
    { kind: 'perfect', target: Math.min(12, 5 + Math.floor(day / 3)), text: null },
    { kind: 'streak', target: 5, text: 'Get a COMBO ×5 (5 perfect in a row)' },
    { kind: 'noWalkout', target: 1, text: 'Nobody walks out today' },
  ];
  const g = cycle[day % cycle.length];
  return { ...g, text: g.text ?? `Make ${g.target} perfect cups` };
}

// Where a goal stands: { n, target, done, failed }. stats = { perfect, bestStreak, hot, iced, walkedOut, closed }.
export function goalProgress(goal, s) {
  if (!goal) return null;
  if (goal.kind === 'noWalkout') return { n: s.walkedOut ? 0 : 1, target: 1, done: !!s.closed && !s.walkedOut, failed: s.walkedOut > 0 };
  const n = { perfect: s.perfect, streak: s.bestStreak, hot: s.hot, iced: s.iced }[goal.kind] ?? 0;
  return { n: Math.min(n, goal.target), target: goal.target, done: n >= goal.target, failed: false };
}

// The fame milestones that open new shelves in the night shop.
export const MILESTONES = [25, 50, 75];
export const milestonesCrossed = (from, to, seen = []) => MILESTONES.filter((m) => from < m && to >= m && !seen.includes(m));
