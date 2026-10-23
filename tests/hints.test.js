import { describe, it, expect } from 'vitest';
import { recipeHint } from '../src/systems/hints.js';
import { parseOrder } from '../src/systems/order.js';

const h = (o) => recipeHint(parseOrder(o));

describe('recipe hints under orders', () => {
  it('spells out each order in pour-bar words', () => {
    expect(h('Kopi O kosong')).toBe('Kopi FULL · no milk · no sugar');
    expect(h('Kopi')).toBe('Kopi FULL · condensed NORMAL · stir');
    expect(h('Teh siew dai')).toBe('Teh FULL · condensed SIEW DAI · stir');
    expect(h('Kopi O')).toBe('Kopi FULL · no milk · sugar NORMAL · stir');
    expect(h('Teh C siew dai peng')).toBe('Teh ¾ · evap C · sugar SIEW DAI · stir · ice');
    expect(h('Kopi C kosong')).toBe('Kopi FULL · evap C · no sugar · stir');
    expect(h('Kopi ga dai')).toBe('Kopi FULL · condensed GA DAI · stir');
  });

  it('Milo drinks', () => {
    expect(h('Milo')).toBe('Milo FULL');
    expect(h('Milo peng')).toBe('Milo ¾ · ice');
    expect(h('Milo Dinosaur')).toBe('Milo ¾ · ice · powder on top');
    expect(h('Horlicks peng')).toBe('Horlicks ¾ · ice');
    expect(h('Cham O')).toBe('Kopi + teh FULL · no milk · sugar NORMAL · stir');
  });
});

import { nextStep } from '../src/systems/hints.js';
import { newCup, pour, addIce, stirStep } from '../src/systems/cup.js';
import { TUNING } from '../src/data/stallTuning.js';

const hold = (ing, amt) => (amt * 1000) / TUNING.pourPerSec[ing];
const step = (cup, order) => nextStep(cup, parseOrder(order), 'Aunty Lim').text;

describe('the coach (next step)', () => {
  it('walks through a Teh siew dai', () => {
    const cup = newCup();
    expect(step(cup, 'Teh siew dai')).toBe('Hold the teh pot over the cup till FULL');
    pour(cup, 'teh', hold('teh', 0.95));
    expect(step(cup, 'Teh siew dai')).toBe("Condensed milk till SIEW DAI (it's the sweetness)");
    pour(cup, 'condensed', hold('condensed', 0.45));
    expect(step(cup, 'Teh siew dai')).toBe('Drop the spoon on the cup to stir');
    for (let i = 0; i < 6; i++) stirStep(cup);
    expect(step(cup, 'Teh siew dai')).toBe('Done! Drag it to Aunty Lim');
  });

  it('Kopi O kosong is just the pot', () => {
    const cup = pour(newCup(), 'kopi', hold('kopi', 0.95));
    expect(step(cup, 'Kopi O kosong')).toBe('Done! Drag it to Aunty Lim');
  });

  it('peng: ¾ then ice; too full says bin it', () => {
    const cup = pour(newCup(), 'kopi', hold('kopi', 0.7));
    pour(cup, 'condensed', hold('condensed', 0.9));
    for (let i = 0; i < 6; i++) stirStep(cup);
    expect(step(cup, 'Kopi peng')).toBe('Drop the ice in (it tops up to FULL)');
    addIce(cup);
    expect(step(cup, 'Kopi peng')).toBe('Done! Drag it to Aunty Lim');
    expect(nextStep(pour(newCup(), 'kopi', hold('kopi', 0.95)), parseOrder('Kopi peng'), 'X').bin).toBe(true);
  });

  it('C drinks: evap then sugar; wrong milk says bin it', () => {
    const cup = pour(newCup(), 'kopi', hold('kopi', 0.95));
    expect(step(cup, 'Kopi C')).toBe('Evap milk till C · NORMAL');
    pour(cup, 'evap', hold('evap', 0.9));
    expect(step(cup, 'Kopi C')).toBe('Sugar till NORMAL');
    expect(nextStep(pour(pour(newCup(), 'kopi', hold('kopi', 0.95)), 'condensed', 500), parseOrder('Kopi C'), 'X').bin).toBe(true);
  });

  it('cham: kopi first, then teh', () => {
    const cup = newCup();
    expect(step(cup, 'Cham')).toBe('Cham: kopi pot first, about half the cup');
    pour(cup, 'kopi', hold('kopi', 0.5));
    expect(step(cup, 'Cham')).toBe('Now the teh pot on top, till FULL');
  });
});
