import { describe, it, expect } from 'vitest';
import { summarizeDay, tipFor } from '../src/systems/daySummary.js';
import { DEFAULT_TIP } from '../src/data/tips.js';

const ev = (type, data) => ({ type, t: 0, ...data });
const econ = { earnedToday: 900, tipsToday: 90, fameStart: 10.2, fame: 12.9 };
const names = { auntyLim: 'Aunty Lim', officeGuy: 'Marcus' };

describe('day summary', () => {
  it('counts, money split, fame and per-customer rows', () => {
    const s = summarizeDay({ events: [
      ev('serve', { who: 'auntyLim', tier: 'perfect', reasons: [], line: 'Wah, shiok!' }),
      ev('serve', { who: 'auntyLim', tier: 'close', reasons: ['forgot to stir'] }),
      ev('serve', { who: 'officeGuy', tier: 'oops', reasons: ['too sweet for kosong', 'forgot to stir'] }),
      ev('timeout', { who: 'officeGuy' }),
      ev('glossary', { key: 'kopi' }),
    ] }, econ, names);
    expect(s.counts).toEqual({ served: 3, perfect: 1, close: 1, oops: 1, walkedOut: 1 });
    expect(s.money).toEqual({ sales: 810, tips: 90, total: 900 });
    expect(s.fame).toEqual({ from: 10, to: 12 });
    expect(s.perCustomer.find((r) => r.who === 'officeGuy')).toMatchObject({ name: 'Marcus', oops: 1, walkedOut: 1 });
    expect(s.topSlips[0]).toEqual({ reason: 'forgot to stir', n: 2 });
    expect(s.tip.en).toMatch(/spoon/);
    expect(s.quote).toEqual({ who: 'Aunty Lim', line: 'Wah, shiok!' });
  });

  it('stars: 3 for a great day, 1 for a rough one', () => {
    const perfect = Array(5).fill(ev('serve', { who: 'auntyLim', tier: 'perfect', reasons: [] }));
    expect(summarizeDay({ events: perfect }, econ).stars).toBe(3);
    const rough = Array(4).fill(ev('serve', { who: 'auntyLim', tier: 'oops', reasons: ['spilled over'] }));
    expect(summarizeDay({ events: rough }, econ).stars).toBe(1);
    expect(summarizeDay({ events: [] }, econ).stars).toBe(1);
  });

  it('every slip gets a tip, with a cheerful default', () => {
    expect(tipFor('spilled over').en).toMatch(/¾/);
    expect(tipFor('a bit too sweet').en).toMatch(/★/);
    expect(tipFor(undefined)).toBe(DEFAULT_TIP);
  });
});
