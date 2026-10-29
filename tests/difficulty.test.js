import { describe, it, expect } from 'vitest';
import { dayDifficulty, pickTwist, twistWeight, dailyGoal, goalProgress, milestonesCrossed } from '../src/systems/difficulty.js';
import { pullHeight, gradePull, pullCup } from '../src/systems/tarik.js';
import { newCup, gradeCup } from '../src/systems/cup.js';
import { parseOrder } from '../src/systems/order.js';

describe('the month gets a little harder (round 5)', () => {
  it('patience eases down from Day 3 to Day 10 and holds', () => {
    expect(dayDifficulty(1).patienceScale).toBe(1.9);
    expect(dayDifficulty(2).patienceScale).toBe(1.9);
    expect(dayDifficulty(6).patienceScale).toBeLessThan(1.9);
    expect(dayDifficulty(10).patienceScale).toBe(1.45);
    expect(dayDifficulty(25).patienceScale).toBe(1.45);
    expect(dayDifficulty(4).rushMax).toBe(4);
  });
  it('twists from Day 3, never on the finale; they tilt orders', () => {
    expect(pickTwist(2)).toBeNull();
    expect(pickTwist(3).id).toBe('rain');
    expect(pickTwist(30)).toBeNull();
    expect(twistWeight(pickTwist(3), parseOrder('Kopi'))).toBe(3);
    expect(twistWeight(pickTwist(3), parseOrder('Kopi peng'))).toBe(1);
  });
  it('a daily goal from Day 2 that fits the twist, and its progress', () => {
    expect(dailyGoal(1)).toBeNull();
    expect(dailyGoal(3, pickTwist(3)).kind).toBe('hot');
    const g = dailyGoal(4);
    expect(g.text).toBeTruthy();
    expect(goalProgress({ kind: 'perfect', target: 6 }, { perfect: 7 })).toMatchObject({ n: 6, done: true });
    expect(goalProgress({ kind: 'noWalkout', target: 1 }, { walkedOut: 0, closed: false }).done).toBe(false);
    expect(goalProgress({ kind: 'noWalkout', target: 1 }, { walkedOut: 0, closed: true }).done).toBe(true);
    expect(goalProgress({ kind: 'noWalkout', target: 1 }, { walkedOut: 1, closed: true }).failed).toBe(true);
  });
  it('fame milestones: each one once', () => {
    expect(milestonesCrossed(24.6, 25.0)).toEqual([25]);
    expect(milestonesCrossed(24.6, 25.0, [25])).toEqual([]);
    expect(milestonesCrossed(40, 80)).toEqual([50, 75]);
  });
});

describe('teh tarik pull (round 5)', () => {
  it('hold into the band, let go: a good pull; too long: splash; too short: short', () => {
    expect(gradePull(pullHeight(700))).toBe('good');
    expect(gradePull(pullHeight(300))).toBe('short');
    expect(gradePull(pullHeight(1200))).toBe('splash');
  });
  it('three good pulls froth it and make a tarik master; misses take more pulls', () => {
    const cup = newCup();
    for (let i = 0; i < 3; i++) pullCup(cup, 'good');
    expect(cup.froth).toBe(1);
    expect(cup.tarikMaster).toBe(true);
    const slow = newCup();
    pullCup(slow, 'short');
    pullCup(slow, 'good');
    pullCup(slow, 'good');
    expect(slow.froth).toBeLessThan(1);
    pullCup(slow, 'splash');
    expect(slow.froth).toBe(1);
    expect(slow.tarikMaster).toBe(false);
  });
  it('a pulled teh tarik grades perfect', async () => {
    const { pour } = await import('../src/systems/cup.js');
    const { TUNING } = await import('../src/data/stallTuning.js');
    const cup = pour(newCup(), 'condensed', (0.85 * 1000) / TUNING.pourPerSec.condensed);
    pour(cup, 'teh', (0.95 * 1000) / TUNING.pourPerSec.teh);
    for (let i = 0; i < 3; i++) pullCup(cup, 'good');
    expect(gradeCup(cup, parseOrder('Teh tarik')).tier).toBe('perfect');
  });
});
