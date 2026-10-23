import { describe, it, expect } from 'vitest';
import { newCup, pour, addIce, addPowder, stirStep, gradeCup, formatCup, sugarBucket, needsStir } from '../src/systems/cup.js';
import { parseOrder } from '../src/systems/order.js';
import { TUNING } from '../src/data/stallTuning.js';

// Hold a tool over the cup for long enough to reach `amount` (1.0 = normal / full).
const holdFor = (ingredient, amount) => (amount * 1000) / TUNING.pourPerSec[ingredient];
const stirAll = (cup) => {
  for (let i = 0; i < TUNING.stirWigglesNeeded; i++) stirStep(cup);
  return cup;
};

// Make a drink "perfectly" by following the order spec, the way a good player would.
function makePerfect(orderText) {
  const spec = parseOrder(orderText);
  const cup = newCup();
  pour(cup, spec.base, holdFor(spec.base, spec.iced ? 0.7 : 0.95)); // peng: ¾ line, the ice tops it up
  if (spec.base !== 'milo') {
    const sweet = { none: 0, less: 0.45, normal: 0.9, more: 1.25 }[spec.sugar];
    // Kopi / Teh: condensed milk is the sweetness. C: evap + sugar. O: sugar only.
    if (spec.milk === 'condensed') pour(cup, 'condensed', holdFor('condensed', sweet));
    else {
      if (spec.milk === 'evap') pour(cup, 'evap', holdFor('evap', 0.9));
      if (sweet) pour(cup, 'sugar', holdFor('sugar', sweet));
    }
    stirAll(cup);
  }
  if (spec.iced) addIce(cup);
  if (spec.topping) addPowder(cup);
  return { cup, spec };
}

describe('cup model', () => {
  it('pours at the tuned rate', () => {
    const cup = pour(newCup(), 'kopi', 1000);
    expect(cup.base).toBe('kopi');
    expect(cup.fill).toBeCloseTo(TUNING.pourPerSec.kopi);
  });

  it('mixing kopi into teh makes a cham', () => {
    const cup = pour(pour(newCup(), 'teh', 500), 'kopi', 300);
    expect(cup.base).toBe('cham');
  });

  it('adding sugar or milk after stirring needs another stir', () => {
    const cup = stirAll(pour(pour(newCup(), 'kopi', 1200), 'sugar', 900));
    expect(needsStir(cup)).toBe(false);
    pour(cup, 'sugar', 100);
    expect(needsStir(cup)).toBe(true);
  });

  it('buckets sugar into zones', () => {
    expect([0, 0.2, 0.45, 0.7, 0.9, 1.1, 1.25, 1.45, 1.6].map(sugarBucket)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('gradeCup', () => {
  const orders = [
    'Kopi', 'Kopi O', 'Kopi C', 'Teh', 'Teh O', 'Teh C', 'Kopi siew dai', 'Teh ga dai', 'Kopi O ga dai', 'Teh peng',
    'Kopi O kosong', 'Kopi C kosong', 'Kopi C kosong peng', 'Teh C siew dai', 'Teh C siew dai peng', 'Milo Dinosaur',
  ];
  for (const o of orders) {
    it(`a carefully made ${o} is perfect`, () => {
      const { cup, spec } = makePerfect(o);
      expect(gradeCup(cup, spec)).toEqual({ tier: 'perfect', reasons: [] });
    });
  }

  it('forgetting to stir is close', () => {
    const spec = parseOrder('Teh C siew dai');
    const cup = pour(pour(pour(newCup(), 'teh', 1200), 'evap', 900), 'sugar', 450);
    expect(gradeCup(cup, spec)).toEqual({ tier: 'close', reasons: ['forgot to stir'] });
  });

  it('normal sugar for a siew dai order is close; kosong order with normal sugar is oops', () => {
    expect(gradeCup(makePerfect('Teh C').cup, parseOrder('Teh C siew dai')).tier).toBe('close');
    expect(gradeCup(makePerfect('Kopi C').cup, parseOrder('Kopi C kosong')).tier).toBe('oops');
  });

  it('condensed milk is the sweetness for Kopi / Teh', () => {
    // a Kopi made with normal condensed milk is too sweet for "Kopi siew dai"
    expect(gradeCup(makePerfect('Kopi').cup, parseOrder('Kopi siew dai')).reasons).toContain('too sweet for siew dai');
    // adding sugar on top of condensed milk makes it ga dai
    const extra = pour(makePerfect('Teh').cup, 'sugar', holdFor('sugar', 0.4));
    stirAll(extra);
    expect(gradeCup(extra, parseOrder('Teh ga dai')).tier).toBe('perfect');
  });

  it('peng: pour to ¾ then ice; full + ice spills', () => {
    const full = addIce(stirAll(pour(pour(newCup(), 'kopi', holdFor('kopi', 0.95)), 'condensed', holdFor('condensed', 0.9))));
    expect(gradeCup(full, parseOrder('Kopi peng')).reasons).toContain('spilled over');
    expect(gradeCup(makePerfect('Kopi peng').cup, parseOrder('Kopi peng')).tier).toBe('perfect');
  });

  it('wrong milk or wrong base is oops', () => {
    expect(gradeCup(makePerfect('Kopi C').cup, parseOrder('Kopi')).reasons).toContain('evaporated milk instead of condensed');
    expect(gradeCup(makePerfect('Teh').cup, parseOrder('Kopi')).tier).toBe('oops');
    expect(gradeCup(makePerfect('Kopi').cup, parseOrder('Kopi O')).reasons).toContain('should be no milk (O)');
  });

  it('forgetting peng or the Milo powder is close', () => {
    expect(gradeCup(makePerfect('Kopi C kosong').cup, parseOrder('Kopi C kosong peng')).reasons).toEqual(['forgot the ice (peng)']);
    const iceMiloNoPowder = addIce(pour(newCup(), 'milo', holdFor('milo', 0.7)));
    expect(gradeCup(iceMiloNoPowder, parseOrder('Milo Dinosaur'))).toEqual({ tier: 'close', reasons: ['forgot the Milo powder on top'] });
  });

  it('three small mistakes add up to oops', () => {
    const spec = parseOrder('Teh C siew dai peng');
    const cup = pour(pour(pour(newCup(), 'teh', 600), 'evap', 900), 'sugar', 450); // half empty, unstirred, no ice
    expect(gradeCup(cup, spec).tier).toBe('oops');
  });
});

describe('formatCup', () => {
  it('describes cups in lingo', () => {
    expect(formatCup(newCup())).toBe('empty cup');
    expect(formatCup(makePerfect('Teh C siew dai peng').cup)).toBe('Teh C siew dai peng');
    expect(formatCup(pour(pour(newCup(), 'kopi', 1200), 'sugar', 900))).toBe('Kopi O (unstirred)');
    expect(formatCup(makePerfect('Milo Dinosaur').cup)).toBe('Milo Dinosaur');
  });
});
