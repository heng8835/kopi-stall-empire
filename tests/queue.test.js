import { describe, it, expect } from 'vitest';
import { placeArrival, frontCanTake, arrivalSchedule } from '../src/systems/queue.js';

const base = { totalSpots: 3, max: 3 };

describe('queue', () => {
  it('goes straight to the counter when a spot is free and nobody is waiting', () => {
    expect(placeArrival({ ...base, freeSpots: 1, lineLength: 0 })).toBe('counter');
  });

  it('joins the queue when the counter is full, until the queue is full', () => {
    expect(placeArrival({ ...base, freeSpots: 0, lineLength: 0 })).toBe('queue');
    expect(placeArrival({ ...base, freeSpots: 0, lineLength: 2 })).toBe('queue');
    expect(placeArrival({ ...base, freeSpots: 0, lineLength: 3 })).toBe(null);
  });

  it('never skips past people already queuing', () => {
    expect(placeArrival({ ...base, freeSpots: 2, lineLength: 1 })).toBe('queue');
  });

  it('a group needs the whole counter', () => {
    expect(placeArrival({ ...base, freeSpots: 2, lineLength: 0, group: true })).toBe('queue');
    expect(placeArrival({ ...base, freeSpots: 3, lineLength: 0, group: true })).toBe('counter');
  });

  it('the front walks up only when there is room for it', () => {
    const single = { n: 1 };
    const kids = { n: 4 };
    expect(frontCanTake([], 3, 3)).toBe(null);
    expect(frontCanTake([single, kids], 1, 3)).toBe(single);
    expect(frontCanTake([kids, single], 2, 3)).toBe(null); // the single waits behind the kids
    expect(frontCanTake([kids, single], 3, 3)).toBe(kids);
  });

  it('spreads arrivals across the day, in order', () => {
    const fixed = arrivalSchedule(9, 2000, 78_000, 0, () => 0.5);
    expect(fixed).toHaveLength(9);
    expect(fixed[0]).toBeGreaterThanOrEqual(2000);
    expect(fixed[8]).toBeLessThanOrEqual(78_000);
    const r = arrivalSchedule(16, 2000, 78_000, 0.35);
    expect([...r].sort((a, b) => a - b)).toEqual(r);
    expect(Math.min(...r)).toBeGreaterThanOrEqual(2000);
  });
});
