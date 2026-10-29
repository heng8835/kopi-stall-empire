import { describe, it, expect } from 'vitest';
import { demoSteps, MEASURE } from '../src/systems/demo.js';
import { parseOrder } from '../src/systems/order.js';
import { newCup, pour, addIce, addPowder, addExtra, stirStep, tarikStep, gradeCup } from '../src/systems/cup.js';
import { TUNING } from '../src/data/stallTuning.js';
import { CUSTOMERS, WALK_INS } from '../src/data/customers.js';

const INGREDIENT = { kopi: 'kopi', teh: 'teh', milo: 'milo', horlicks: 'horlicks', water: 'water', condensed: 'condensed', evap: 'evap', sugar: 'sugar', gula: 'gula' };

// Play the demo steps on a cup the way the ghost hand does: pour in small ticks until the target.
function play(spec) {
  let cup = null;
  for (const s of demoSteps(spec)) {
    if (s.do === 'cup') cup = newCup();
    if (s.do === 'pour') for (let i = 0; i < 400 && MEASURE[s.measure](cup) < s.until; i++) pour(cup, INGREDIENT[s.tool], 16);
    if (s.do === 'stir') for (let i = 0; i < TUNING.stirWigglesNeeded; i++) stirStep(cup);
    if (s.do === 'tarik') for (let i = 0; i < TUNING.tarikPullsNeeded; i++) tarikStep(cup);
    if (s.do === 'ice') addIce(cup);
    if (s.do === 'powder') addPowder(cup);
    if (s.do === 'drop') addExtra(cup, s.extra);
  }
  return cup;
}

describe('demo: the ghost hand makes every order perfectly', () => {
  const orders = new Set([...CUSTOMERS, ...WALK_INS].flatMap((c) => c.orders.map((o) => o.text)));
  for (const text of orders) {
    it(text, () => {
      const result = gradeCup(play(parseOrder(text)), parseOrder(text));
      expect(result.reasons).toEqual([]);
      expect(result.tier).toBe('perfect');
    });
  }

  it('says each step in plain words and ends by handing over', () => {
    const steps = demoSteps(parseOrder('Teh'));
    expect(steps.map((s) => s.do)).toEqual(['cup', 'pour', 'pour', 'stir', 'serve']);
    expect(steps[1].say).toMatch(/Condensed milk first, to NORMAL/); // milk first, like the uncles
    expect(steps[2].say).toMatch(/Teh pot on top to FULL/);
  });
});

describe('new-order card combinations', () => {
  it('lists the tools in order with their zones', async () => {
    const { comboFor } = await import('../src/systems/demo.js');
    expect(comboFor(parseOrder('Teh C siew dai peng'))).toEqual([
      { tool: 'evap', zone: 'C' }, { tool: 'sugar', zone: 'SIEW DAI' }, { tool: 'teh', zone: '¾ +ICE' }, { tool: 'stir', zone: 'stir' }, { tool: 'ice', zone: 'ice' },
    ]);
    expect(comboFor(parseOrder('Kopi O kosong'))).toEqual([{ tool: 'kopi', zone: 'FULL' }]);
  });
  it('the instant cup is perfect', async () => {
    const { demoCup } = await import('../src/systems/demo.js');
    expect(gradeCup(demoCup(parseOrder('Teh tarik')), parseOrder('Teh tarik')).tier).toBe('perfect');
  });
});
