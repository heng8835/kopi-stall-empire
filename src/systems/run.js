import { TUNING } from '../data/stallTuning.js';
import { load, save } from './save.js';

// One month at the stall: which day it is, and what carries from day to day.
// Saved after every day so the month can be played across sessions, plus a mid-day checkpoint
// (run.midDay) so closing the page mid-day doesn't lose the day.
export const MONTH_DAYS = 30;
const KEY = 'run';

export function newRun() {
  return { day: 1, money: 0, fame: TUNING.fameStart, flags: [], ratings: [], ending: null, owned: [], newItems: [], friends: {} };
}

// Aunty Lim's nightly teh score, out of 10 (she's kind: never below 3).
export function auntyRating(perfect, served) {
  if (!served) return 5;
  return Math.max(3, Math.min(10, Math.round((perfect / served) * 10)));
}

// The run for tomorrow, after today ends with this money / fame / flags / rating.
// Machines bought last night have had their recipe card today, so newItems clears. Friendship
// (systems/friends.js) carries on.
export function nextDay(run, { money, fame, flags = run.flags, rating, ending = run.ending, friends = run.friends ?? {} }) {
  return { ...run, day: run.day + 1, money, fame, flags: [...flags], ratings: [...run.ratings, rating], ending, owned: [...(run.owned ?? [])], newItems: [], friends: { ...friends }, midDay: null };
}

export const monthOver = (run) => run.day > MONTH_DAYS;

// A saved run, or null. Anything that doesn't look like a run is ignored.
export function loadRun() {
  const r = load(KEY, null);
  if (!r || typeof r.day !== 'number' || typeof r.money !== 'number') return null;
  return { ...newRun(), ...r, fame: r.fame ?? r.happiness ?? TUNING.fameStart };
}

export const saveRun = (run) => save(KEY, run);

// Today so far (clock, money, stories played...), kept on the run until the day ends.
export const checkpoint = (run, midDay) => ({ ...run, midDay: { ...midDay, day: run.day } });

// The checkpoint for today, or null (an old one from another day is ignored).
export const midDayOf = (run) => (run?.midDay?.day === run?.day ? run.midDay : null);

// The stall's clock for ms into the day: "2:15pm" (7am open, 7pm close, quarter hours).
export function dayClock(ms) {
  const mins = 7 * 60 + Math.floor((ms / TUNING.dayMs) * 12 * 60);
  const h24 = Math.floor(mins / 60);
  const mm = String(Math.floor((mins % 60) / 15) * 15).padStart(2, '0');
  return `${((h24 + 11) % 12) + 1}:${mm}${h24 < 12 ? 'am' : 'pm'}`;
}

// Testing shortcut: ?day=14&fame=60&flags=kidsOwe,humble&money=2000&owned=kettle,fan starts straight on that day.
export function runFromQuery(search) {
  const q = new URLSearchParams(search);
  if (!q.has('day')) return null;
  const day = Math.max(1, Math.min(MONTH_DAYS, parseInt(q.get('day'), 10) || 1));
  const num = (k, d) => (q.has(k) && !Number.isNaN(Number(q.get(k))) ? Number(q.get(k)) : d);
  return {
    ...newRun(),
    day,
    fame: Math.max(0, Math.min(100, num('fame', TUNING.fameStart))),
    money: num('money', 0),
    flags: (q.get('flags') ?? '').split(',').map((f) => f.trim()).filter(Boolean),
    owned: (q.get('owned') ?? '').split(',').map((f) => f.trim()).filter(Boolean),
    ratings: Array(day - 1).fill(6),
  };
}
