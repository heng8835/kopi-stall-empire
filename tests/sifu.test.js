import { describe, it, expect } from 'vitest';
import { newCup, pour, addIce, stirStep, gradeCup, isSifu, sifuZone } from '../src/systems/cup.js';
import { parseOrder } from '../src/systems/order.js';
import { TUNING } from '../src/data/stallTuning.js';
import { updateBest, newRun, nextDay } from '../src/systems/run.js';
import { perks, toggleTool, itemById } from '../src/systems/shop.js';

const hold = (what, amount) => (amount / TUNING.pourPerSec[what]) * 1000;
function kopi(fill, milk) {
  const cup = newCup();
  pour(cup, 'condensed', hold('condensed', milk));
  pour(cup, 'kopi', hold('kopi', fill));
  for (let i = 0; i < TUNING.stirWigglesNeeded; i++) stirStep(cup);
  return cup;
}

describe('the Sifu pour', () => {
  const spec = parseOrder('Kopi');
  it('dead centre counts; a plain perfect is still perfect, just not Sifu', () => {
    const centred = kopi(0.94, 0.89);
    expect(gradeCup(centred, spec).tier).toBe('perfect');
    expect(isSifu(centred, spec)).toBe(true);
    const offFill = kopi(0.82, 0.89);
    expect(gradeCup(offFill, spec).tier).toBe('perfect');
    expect(isSifu(offFill, spec)).toBe(false);
    const offMilk = kopi(0.94, 0.7);
    expect(gradeCup(offMilk, spec).tier).toBe('perfect');
    expect(isSifu(offMilk, spec)).toBe(false);
  });
  it('peng: the band is judged after the ice, and the meter shows it before', () => {
    const iced = parseOrder('Kopi peng');
    const cup = kopi(0.69, 0.89);
    addIce(cup);
    expect(gradeCup(cup, iced).tier).toBe('perfect');
    expect(isSifu(cup, iced)).toBe(true);
    const [a, b] = sifuZone('kopi', iced);
    expect(a).toBeLessThan(0.69);
    expect(b).toBeGreaterThan(0.69);
  });
  it('every band sits inside the zone it refines', () => {
    expect(sifuZone('kopi', spec)[0]).toBeGreaterThanOrEqual(0.8);
    expect(sifuZone('kopi', spec)[1]).toBeLessThanOrEqual(1.08);
    expect(sifuZone('condensed', parseOrder('Kopi siew dai'))[0]).toBeGreaterThanOrEqual(0.19);
    expect(sifuZone('condensed', parseOrder('Kopi siew dai'))[1]).toBeLessThanOrEqual(0.675);
    expect(sifuZone('condensed', parseOrder('Kopi O kosong'))).toBe(null);
    expect(sifuZone('kopi', parseOrder('Kopi poh'))).toBe(null);
  });
});

describe('personal bests', () => {
  it('a record is only a record once', () => {
    const a = updateBest({ sifu: 3, combo: 5 }, { sifu: 4, combo: 5 });
    expect(a).toEqual({ best: { sifu: 4, combo: 5 }, sifu: true, combo: false });
    expect(updateBest(undefined, { sifu: 0, combo: 0 }).best).toEqual({ sifu: 0, combo: 0 });
  });
  it('carries over to tomorrow', () => {
    const r = { ...newRun(), best: { sifu: 2, combo: 7 } };
    expect(nextDay(r, { money: 0, fame: 10, rating: 5 }).best).toEqual({ sifu: 2, combo: 7 });
  });
});

describe('tool switches', () => {
  it('a tool switched off stops counting, and back on', () => {
    let r = { ...newRun(), owned: ['longSpout'] };
    expect(perks(r.owned, r.off).pourMult).toBe(1.4);
    r = toggleTool(r, 'longSpout');
    expect(perks(r.owned, r.off).pourMult).toBe(1);
    r = toggleTool(r, 'longSpout');
    expect(perks(r.owned, r.off).pourMult).toBe(1.4);
  });
  it('old saves without the field are fine', () => {
    expect(toggleTool({ owned: ['milkPump'] }, 'milkPump').off).toEqual(['milkPump']);
    expect(itemById('milkPump').toggle).toBe(true);
  });
});
