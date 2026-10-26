import { describe, it, expect } from 'vitest';
import { hearts, befriend, friendTip, friendPatience, waitLine, WAIT_LINES, MAX_HEARTS } from '../src/systems/friends.js';
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
    expect(friendTip(0, 'perfect', 30)).toBe(0);
    expect(friendTip(4, 'perfect', 30)).toBe(30); // double the perfect tip at 4 hearts
    expect(friendTip(2, 'close', 30)).toBe(10);
    expect(friendTip(5, 'oops', 30)).toBe(0);
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
