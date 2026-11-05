import { describe, it, expect } from 'vitest';
import { TUNING } from '../src/data/stallTuning.js';
import { SHOP } from '../src/data/shop.js';
import { EVENTS } from '../src/data/events.js';
import { GOAL_REWARD } from '../src/data/twists.js';
import { customersForFame, clampFame, empireLine } from '../src/systems/economy.js';
import { endingFor } from '../src/systems/story.js';

// A rough month for three kinds of player (round 6: Fame 70 came on Day 7 of 30). Not a prediction of real
// thumbs: it keeps the fame numbers from drifting back to an Empire that's over by the second week.
const PLAYERS = {
  sharp: { perfect: 0.92, close: 0.06, walkouts: 0, stars: 3, goal: 0.8, story: 1, decor: 1 },
  steady: { perfect: 0.72, close: 0.2, walkouts: 1, stars: 2, goal: 0.5, story: 0.8, decor: 0.5 },
  relaxed: { perfect: 0.5, close: 0.3, walkouts: 3, stars: 1, goal: 0.2, story: 0.6, decor: 0.25 },
};

// the best fame each story day's choice can give
const storyFame = (day) => EVENTS.filter((e) => e.day === day).reduce((sum, e) => sum + (e.fame ?? 0) + Math.max(0, ...(e.choice?.options ?? []).map((o) => o.fame ?? 0)), 0);
// the decor and comforts in the order a player would likely buy them, one every few days
const DECOR = SHOP.filter((i) => i.effect?.famePerDay).sort((a, b) => a.price - b.price).map((i, n) => ({ from: Math.max(i.fromDay ?? 0, 3 + n * 3), perDay: i.effect.famePerDay }));

function month(p) {
  const { perfect, close, oops, timeout } = TUNING.fameDelta;
  let fame = TUNING.fameStart;
  let reached = null;
  for (let day = 1; day <= 30; day++) {
    const cups = customersForFame(fame) * 1.25; // groups and regulars
    const decor = DECOR.filter((d) => day >= d.from).reduce((sum, d) => sum + d.perDay, 0);
    fame = clampFame(
      fame + cups * (p.perfect * perfect + p.close * close + (1 - p.perfect - p.close) * oops) + p.walkouts * timeout
        + TUNING.fameForStars[p.stars] + p.goal * GOAL_REWARD.fame + decor * p.decor + storyFame(day) * p.story,
    );
    if (reached == null && fame >= TUNING.empireFame) reached = day;
  }
  return { fame, reached };
}

describe('the month curve', () => {
  it('a sharp player reaches the Empire late in the month, not in the second week', () => {
    const { reached } = month(PLAYERS.sharp);
    expect(reached).toBeGreaterThanOrEqual(20);
    expect(reached).toBeLessThanOrEqual(27);
  });

  it('a steady player gets there at the very end, or just misses', () => {
    const { reached, fame } = month(PLAYERS.steady);
    expect(reached === null ? fame : 200).toBeGreaterThanOrEqual(170);
    if (reached !== null) expect(reached).toBeGreaterThanOrEqual(26);
  });

  it('a relaxed player never gets stuck: fame still grows over the month', () => {
    const { fame, reached } = month(PLAYERS.relaxed);
    expect(reached).toBe(null);
    expect(fame).toBeGreaterThan(TUNING.fameStart * 3);
  });

  it('the finale reads the tuned gates', () => {
    const { endings } = EVENTS.find((e) => e.endings);
    expect(endingFor(endings, TUNING.empireFame).id).toBe('empire');
    expect(endingFor(endings, TUNING.empireFame - 1).id).toBe('ourStall');
    expect(endingFor(endings, TUNING.ourStallFame).id).toBe('ourStall');
    expect(endingFor(endings, TUNING.ourStallFame - 1).id).toBe('stillBrewing');
  });

  it('the tracker counts up to the Empire, then says so', () => {
    expect(empireLine(134.7)).toBe('Empire 名气 134/200 ▰▰▰▰▰▰▱▱▱▱');
    expect(empireLine(199.9)).toMatch(/199\/200 ▰{9}▱$/);
    expect(empireLine(200)).toMatch(/^Empire ready!/);
  });
});
