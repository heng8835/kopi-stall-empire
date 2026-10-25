import { describe, it, expect } from 'vitest';
import { parseOrder } from '../src/systems/order.js';
import { newCup, pour, stirStep, gradeCup, waterShare, formatCup } from '../src/systems/cup.js';
import { nextStep } from '../src/systems/hints.js';
import { ordersFor } from '../src/systems/menu.js';
import { CUSTOMERS } from '../src/data/customers.js';
import { MACHINE_LESSONS } from '../src/data/recipes.js';
import { SHOP } from '../src/data/shop.js';
import { TUNING } from '../src/data/stallTuning.js';

// pour to an amount (1.0 = a full cup) of one ingredient
const to = (cup, ing, amount) => pour(cup, ing, (amount * 1000) / TUNING.pourPerSec[ing]);
const stir = (cup) => { for (let i = 0; i < TUNING.stirWigglesNeeded; i++) stirStep(cup); return cup; };

describe('Big Brass Kettle: gao / poh', () => {
  it('poh: pot to half, hot water to FULL', () => {
    const cup = to(to(newCup(), 'kopi', 0.5), 'water', 0.45);
    to(cup, 'sugar', 0.9);
    stir(cup);
    expect(waterShare(cup)).toBeCloseTo(0.47, 1);
    expect(gradeCup(cup, parseOrder('Kopi O poh')).tier).toBe('perfect');
    expect(formatCup(cup)).toBe('Kopi O poh');
    expect(gradeCup(cup, parseOrder('Kopi O')).reasons).toContain('too watery');
  });

  it('gao: the pot only, any water is wrong', () => {
    const cup = stir(to(to(newCup(), 'kopi', 0.95), 'sugar', 0.9));
    expect(gradeCup(cup, parseOrder('Kopi O gao')).tier).toBe('perfect');
    expect(gradeCup(cup, parseOrder('Kopi O')).tier).toBe('perfect'); // normal kopi is unchanged
    expect(gradeCup(cup, parseOrder('Kopi O poh')).reasons).toContain('not poh: needs hot water');
    const wet = stir(to(to(to(newCup(), 'kopi', 0.8), 'water', 0.15), 'sugar', 0.9));
    expect(gradeCup(wet, parseOrder('Kopi O gao')).reasons).toContain('gao means no water');
  });

  it('the coach walks through a poh drink', () => {
    const spec = parseOrder('Kopi O poh');
    const cup = newCup();
    expect(nextStep(cup, spec, 'Ah Gong').text).toMatch(/HALF/);
    to(cup, 'kopi', 0.5);
    expect(nextStep(cup, spec, 'Ah Gong').text).toMatch(/Hot water/);
    to(cup, 'water', 0.45);
    expect(nextStep(cup, spec, 'Ah Gong').text).toMatch(/Sugar/);
  });

  it('strength orders only appear once the kettle is owned', () => {
    const gong = CUSTOMERS.find((c) => c.id === 'ahGong');
    expect(ordersFor(gong.orders, 30).some((o) => /gao|poh/.test(o.text))).toBe(false);
    expect(ordersFor(gong.orders, 30, ['gao', 'poh']).some((o) => /gao|poh/.test(o.text))).toBe(true);
    const kettle = SHOP.find((i) => i.id === 'kettle');
    expect(kettle.soon).toBeFalsy();
    expect(kettle.unlocks).toEqual(['gao', 'poh']);
    expect(MACHINE_LESSONS.kettle.order).toBe('Kopi O poh');
  });
});
