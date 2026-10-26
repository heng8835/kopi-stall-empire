import { describe, it, expect } from 'vitest';
import { needleAt, zoneAt, dialZones, doseFor } from '../src/systems/dial.js';
import { ZONES } from '../src/data/stallTuning.js';

const SWEET = [
  ['KOSONG', ...ZONES.sugar.none, 'none'],
  ['SIEW DAI', ...ZONES.sugar.less, 'lo'],
  ['NORMAL', ...ZONES.sugar.normal, 'ok'],
  ['GA DAI', ...ZONES.sugar.more, 'hi'],
  ['TOO SWEET', ZONES.sugar.tooMuch, 1.9, 'bad'],
];

describe('the timing dial', () => {
  it('sweeps back and forth', () => {
    expect(needleAt(0, 2, 1000)).toBe(0);
    expect(needleAt(500, 2, 1000)).toBe(1);
    expect(needleAt(1000, 2, 1000)).toBe(2);
    expect(needleAt(1500, 2, 1000)).toBe(1);
    expect(needleAt(2000, 2, 1000)).toBe(0);
  });

  it('keeps the red zone short', () => {
    const z = dialZones(SWEET);
    expect(z.at(-1)[2]).toBeCloseTo(ZONES.sugar.tooMuch + 0.12);
    expect(z.slice(0, -1)).toEqual(SWEET.slice(0, -1));
  });

  it('anywhere inside a zone gives the middle of it', () => {
    const z = dialZones(SWEET);
    const mid = (ZONES.sugar.normal[0] + ZONES.sugar.normal[1]) / 2;
    for (const v of [0.7, 0.9, 1.05]) expect(doseFor(z, v, 0)).toBeCloseTo(mid);
    expect(zoneAt(z, 0.9)[0]).toBe('NORMAL');
    expect(doseFor(z, 0.9, 0.5)).toBeCloseTo(mid - 0.5); // tops up what's already in
    expect(doseFor(z, 0.3, 0.9)).toBe(0); // never takes anything out
    expect(doseFor(z, 0.05, 0)).toBe(0); // KOSONG: nothing goes in
  });
});
