import { describe, it, expect, vi, afterEach } from 'vitest';
import { newRun, nextDay, auntyRating, monthOver, loadRun, saveRun, runFromQuery, checkpoint, midDayOf, dayClock } from '../src/systems/run.js';
import { TUNING } from '../src/data/stallTuning.js';

afterEach(() => vi.unstubAllGlobals());

describe('run (the month)', () => {
  it('starts on Day 1 with starting fame', () => {
    expect(newRun()).toMatchObject({ day: 1, money: 0, fame: 10, flags: [], ratings: [] });
  });

  it('carries money, fame, flags and the rating to tomorrow', () => {
    const r = nextDay(newRun(), { money: 1234, fame: 13.5, flags: ['humble'], rating: 6 });
    expect(r).toMatchObject({ day: 2, money: 1234, fame: 13.5, flags: ['humble'], ratings: [6] });
    expect(monthOver(r)).toBe(false);
    expect(monthOver({ ...r, day: 31 })).toBe(true);
  });

  it('Aunty Lim rates kindly, 3-10', () => {
    expect(auntyRating(0, 0)).toBe(5);
    expect(auntyRating(0, 8)).toBe(3);
    expect(auntyRating(5, 10)).toBe(5);
    expect(auntyRating(10, 10)).toBe(10);
  });

  it('saves and loads; survives blocked storage', () => {
    const mem = {};
    vi.stubGlobal('window', { localStorage: { getItem: (k) => mem[k] ?? null, setItem: (k, v) => (mem[k] = v) } });
    saveRun({ ...newRun(), day: 7, money: 900 });
    expect(loadRun()).toMatchObject({ day: 7, money: 900 });
    vi.stubGlobal('window', { localStorage: { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } } });
    expect(loadRun()).toBe(null);
    expect(() => saveRun(newRun())).not.toThrow();
  });

  it('jumps to a day from the URL for testing', () => {
    expect(runFromQuery('')).toBe(null);
    expect(runFromQuery('?day=14&fame=60&flags=kidsOwe,humble')).toMatchObject({ day: 14, fame: 60, flags: ['kidsOwe', 'humble'] });
    expect(runFromQuery('?day=99').day).toBe(30);
  });
});

describe('run + night shop', () => {
  it('keeps what you own and clears last night\'s new machines', () => {
    const r = nextDay({ ...newRun(), owned: ['fan', 'twinSock'], newItems: ['twinSock'] }, { money: 0, fame: 10, rating: 5 });
    expect(r.owned).toEqual(['fan', 'twinSock']);
    expect(r.newItems).toEqual([]);
  });

  it('keeps a mid-day checkpoint for today only, and the next day clears it', () => {
    const r = checkpoint({ ...newRun(), day: 4 }, { clockMs: 50000, storyDone: ['start'] });
    expect(midDayOf(r)).toMatchObject({ day: 4, clockMs: 50000, storyDone: ['start'] });
    expect(midDayOf({ ...r, day: 5 })).toBe(null);
    expect(nextDay(r, { money: 0, fame: 10, rating: 5 }).midDay).toBe(null);
    expect(midDayOf(newRun())).toBe(null);
  });

  it('shows the stall clock', () => {
    expect(dayClock(0)).toBe('7:00am');
    expect(dayClock(TUNING.dayMs / 2)).toBe('1:00pm');
    expect(dayClock(TUNING.dayMs)).toBe('7:00pm');
  });
});

describe('night flag', () => {
  it('a new day clears it (the shop was visited)', async () => {
    const { nextDay, newRun } = await import('../src/systems/run.js');
    const r = nextDay({ ...newRun(), night: true }, { money: 0, fame: 10, rating: 5 });
    expect(r.night).toBe(false);
  });
});
