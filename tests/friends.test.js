import { describe, it, expect } from 'vitest';
import { hearts, befriend, friendTip, friendPatience, waitLine, WAIT_LINES, MAX_HEARTS, giftDue, cupsToNext, favourite } from '../src/systems/friends.js';
import { CUSTOMERS } from '../src/data/customers.js';
import { nextDay, newRun } from '../src/systems/run.js';

describe('friendship', () => {
  it('grows with good cups, dips with walk-outs, never below zero', () => {
    let f = {};
    for (let i = 0; i < 5; i++) f = befriend(f, 'auntyLim', 'perfect');
    expect(hearts(f.auntyLim)).toBe(2);
    f = befriend(f, 'auntyLim', 'timeout');
    expect(f.auntyLim).toBe(4);
    expect(befriend({}, 'x', 'timeout').x).toBe(0);
    expect(hearts(1000)).toBe(MAX_HEARTS);
  });

  it('friends tip more and wait longer', () => {
    expect(friendTip(0, 'perfect')).toBe(0);
    expect(friendTip(4, 'perfect')).toBe(20);
    expect(friendTip(2, 'close')).toBe(10);
    expect(friendTip(5, 'oops')).toBe(0);
    expect(friendPatience(5)).toBeCloseTo(1.4);
  });

  it('fond friends say they can wait; others grumble', () => {
    expect(WAIT_LINES.fond).toContain(waitLine(3, () => 0));
    expect(WAIT_LINES.meh).toContain(waitLine(1, () => 0));
  });

  it('friendship carries over to the next day', () => {
    const run = { ...newRun(), friends: { marcus: 3 } };
    expect(nextDay(run, { money: 0, fame: 10, rating: 5, friends: { marcus: 4 } }).friends).toEqual({ marcus: 4 });
    expect(nextDay(run, { money: 0, fame: 10, rating: 5 }).friends).toEqual({ marcus: 3 });
  });
});

describe('the Regulars screen', () => {
  it('counts the cups to the next heart', () => {
    expect(cupsToNext(0)).toBe(2);
    expect(cupsToNext(1.6)).toBe(1);
    expect(cupsToNext(2)).toBe(3);
    expect(cupsToNext(20)).toBe(null);
  });
  it('knows a favourite: the first usual, else the most asked for', () => {
    expect(favourite({ usual: ['Teh'], orders: [{ text: 'Kopi', weight: 9 }] })).toBe('Teh');
    expect(favourite({ orders: [{ text: 'Kopi', weight: 1 }, { text: 'Teh', weight: 3 }] })).toBe('Teh');
    expect(CUSTOMERS.every((c) => favourite(c))).toBe(true);
  });
  it('every regular has one thank-you, once, and only at the top', () => {
    const regulars = CUSTOMERS.filter((c) => c.regular);
    expect(regulars.length).toBeGreaterThanOrEqual(6);
    for (const def of regulars) {
      expect(def.giftLine, def.id).toBeTruthy();
      expect(giftDue(def, MAX_HEARTS - 1, [])).toBe(false);
      expect(giftDue(def, MAX_HEARTS, [])).toBe(true);
      expect(giftDue(def, MAX_HEARTS, [def.id])).toBe(false);
    }
  });
});
