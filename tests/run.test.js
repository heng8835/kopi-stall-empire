import { describe, it, expect, vi, afterEach } from 'vitest';
import { newRun, nextDay, auntyRating, monthOver, loadRun, saveRun, runFromQuery } from '../src/systems/run.js';

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
