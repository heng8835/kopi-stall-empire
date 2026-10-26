import { describe, it, expect } from 'vitest';
import { parseOrder, formatOrder, plainOrder, findDrink } from '../src/systems/order.js';
import { newCup, pour, stirStep, addIce, addPowder, addExtra, gradeCup, formatCup } from '../src/systems/cup.js';
import { nextStep, recipeHint } from '../src/systems/hints.js';
import { featuresOf, ordersFor } from '../src/systems/menu.js';
import { demoCup, demoSteps, comboFor } from '../src/systems/demo.js';
import { CUSTOMERS, WALK_INS } from '../src/data/customers.js';
import { MACHINE_LESSONS, BOOK } from '../src/data/recipes.js';
import { SHOP } from '../src/data/shop.js';
import { TUNING } from '../src/data/stallTuning.js';

const to = (cup, ing, amount) => pour(cup, ing, (amount * 1000) / TUNING.pourPerSec[ing]);
const stir = (cup) => { for (let i = 0; i < TUNING.stirWigglesNeeded; i++) stirStep(cup); return cup; };
const teh = () => stir(to(to(newCup(), 'teh', 0.95), 'condensed', 0.9));

describe('phase D order words', () => {
  it('parses and formats every new order', () => {
    for (const t of ['Teh halia', 'Teh halia tarik', 'Teh O limau peng', 'Kopi gu you', 'Kopi O gu you', 'Milo Godzilla', 'Teh C Special', 'Kopi tapau', 'Milo peng tapau', 'Teh C Special tapau', 'Kopi C kosong tapau']) {
      expect(formatOrder(parseOrder(t)), t).toBe(t);
      expect(plainOrder(parseOrder(t)), t).toBeTruthy();
    }
    expect(parseOrder('Milo Godzilla')).toMatchObject({ base: 'milo', iced: true, topping: 'milo', scoop: true });
    expect(parseOrder('Teh C Special')).toMatchObject({ base: 'teh', milk: 'evap', layered: true });
    expect(() => parseOrder('Kopi Special')).toThrow();
    expect(findDrink(parseOrder('Milo Godzilla')).id).toBe('miloGodzilla');
    expect(findDrink(parseOrder('Teh C Special')).id).toBe('tehCSpecial');
  });

  it('each order needs its machine', () => {
    expect(featuresOf(parseOrder('Teh halia tarik'))).toEqual(['teh', 'tarik', 'halia']);
    expect(featuresOf(parseOrder('Kopi gu you'))).toEqual(['kopi', 'guYou']);
    expect(featuresOf(parseOrder('Milo peng tapau'))).toEqual(['milo', 'peng', 'tapau']);
    expect(featuresOf(parseOrder('Teh C Special'))).toEqual(['tehCSpecial']);
    const features = SHOP.flatMap((i) => i.unlocks ?? []);
    for (const f of ['halia', 'limau', 'guYou', 'miloGodzilla', 'tehCSpecial', 'tapau']) {
      expect(features, f).toContain(f);
      expect(BOOK[f], f).toBeTruthy();
    }
  });
});

describe('extras dropped from the counter', () => {
  it('halia, limau, butter: missing or extra is close', () => {
    expect(gradeCup(addExtra(teh(), 'halia'), parseOrder('Teh halia')).tier).toBe('perfect');
    expect(gradeCup(teh(), parseOrder('Teh halia')).reasons).toContain('forgot the halia (ginger)');
    expect(gradeCup(addExtra(teh(), 'halia'), parseOrder('Teh')).reasons).toContain('ginger nobody asked for');
    const limau = addIce(addExtra(stir(to(to(newCup(), 'teh', 0.68), 'sugar', 0.9)), 'limau'));
    expect(gradeCup(limau, parseOrder('Teh O limau peng')).tier).toBe('perfect');
    expect(formatCup(limau)).toBe('Teh O limau peng');
    const guYou = addExtra(stir(to(to(newCup(), 'kopi', 0.95), 'condensed', 0.9)), 'butter');
    expect(gradeCup(guYou, parseOrder('Kopi gu you')).tier).toBe('perfect');
  });

  it('Milo Godzilla = Dinosaur + ice cream; tapau = bagged', () => {
    const dino = addPowder(addIce(to(newCup(), 'milo', 0.68)));
    expect(gradeCup(dino, parseOrder('Milo Godzilla')).reasons).toEqual(['forgot the ice cream']);
    addExtra(dino, 'scoop');
    expect(gradeCup(dino, parseOrder('Milo Godzilla')).tier).toBe('perfect');
    expect(formatCup(dino)).toBe('Milo Godzilla');
    const kopi = stir(to(to(newCup(), 'kopi', 0.95), 'condensed', 0.9));
    expect(gradeCup(kopi, parseOrder('Kopi tapau')).reasons).toEqual(['not bagged: tapau means takeaway']);
    expect(gradeCup(addExtra(kopi, 'tapau'), parseOrder('Kopi tapau')).tier).toBe('perfect');
    expect(gradeCup(kopi, parseOrder('Kopi')).tier).toBe('close');
  });

  it('the coach adds the extras before the ice and the bag last', () => {
    const spec = parseOrder('Teh O limau peng tapau');
    const cup = to(to(newCup(), 'teh', 0.68), 'sugar', 0.9);
    expect(nextStep(cup, spec, 'Marcus').text).toMatch(/limau/i);
    addExtra(cup, 'limau');
    expect(nextStep(cup, spec, 'Marcus').text).toMatch(/spoon/);
    stir(cup);
    expect(nextStep(cup, spec, 'Marcus').text).toMatch(/ice/);
    addIce(cup);
    expect(nextStep(cup, spec, 'Marcus').text).toMatch(/bag/);
    addExtra(cup, 'tapau');
    expect(nextStep(cup, spec, 'Marcus').text).toMatch(/Done/);
    expect(recipeHint(spec)).toBe('Teh ¾ · no milk · sugar NORMAL · limau · stir · ice · bag it');
  });
});

describe('Teh C Special', () => {
  const special = () => to(to(to(newCup(), 'gula', 0.9), 'evap', 0.8), 'teh', 0.95);

  it('three layers, in order, never stirred', () => {
    const spec = parseOrder('Teh C Special');
    expect(gradeCup(special(), spec)).toEqual({ tier: 'perfect', reasons: [] });
    expect(formatCup(special())).toBe('Teh C Special');
    expect(gradeCup(stir(special()), spec).tier).toBe('oops');
    const wrong = to(to(to(newCup(), 'evap', 0.8), 'gula', 0.9), 'teh', 0.95);
    expect(gradeCup(wrong, spec).reasons).toEqual(['layers in the wrong order']);
    expect(gradeCup(stir(to(to(newCup(), 'teh', 0.95), 'evap', 0.8)), spec).tier).toBe('oops'); // a plain Teh C
  });

  it('the coach and the demo walk the layers', () => {
    const spec = parseOrder('Teh C Special');
    const cup = newCup();
    expect(nextStep(cup, spec, 'Makcik').text).toMatch(/gula melaka/);
    to(cup, 'gula', 0.9);
    expect(nextStep(cup, spec, 'Makcik').text).toMatch(/evap/);
    to(cup, 'evap', 0.8);
    expect(nextStep(cup, spec, 'Makcik').text).toMatch(/teh pot/);
    to(cup, 'teh', 0.95);
    expect(nextStep(cup, spec, 'Makcik').text).toMatch(/Done/);
    expect(nextStep(stir(cup), spec, 'Makcik').bin).toBe(true);
    expect(gradeCup(demoCup(spec), spec).tier).toBe('perfect');
    expect(comboFor(spec).map((s) => s.tool)).toEqual(['gula', 'evap', 'teh']);
  });
});

describe('demos and lessons', () => {
  it('every machine lesson demo makes a perfect drink', () => {
    for (const [id, l] of Object.entries(MACHINE_LESSONS)) {
      const spec = parseOrder(l.order);
      expect(gradeCup(demoCup(spec), spec).tier, id).toBe('perfect');
      expect(CUSTOMERS.some((c) => c.id === l.teacher), id).toBe(true);
    }
    for (const t of ['Teh halia tarik', 'Milo Godzilla tapau', 'Kopi O gu you siew dai']) {
      const spec = parseOrder(t);
      expect(gradeCup(demoCup(spec), spec).tier, t).toBe('perfect');
    }
    expect(demoSteps(parseOrder('Teh halia')).find((s) => s.do === 'drop')).toMatchObject({ tool: 'halia', extra: 'halia' });
  });

  it('customers order the new drinks once the machine is owned', () => {
    const all = [...CUSTOMERS, ...WALK_INS];
    const orders = all.flatMap((c) => c.orders.map((o) => o.text));
    for (const t of orders) expect(() => parseOrder(t), t).not.toThrow();
    for (const f of ['halia', 'limau', 'guYou', 'miloGodzilla', 'tehCSpecial', 'tapau']) {
      expect(orders.some((t) => featuresOf(parseOrder(t)).includes(f)), f).toBe(true);
    }
    const rider = WALK_INS.find((w) => w.id === 'riderBulk');
    expect(ordersFor(rider.orders, 30)).toEqual([]);
    expect(ordersFor(rider.orders, 30, ['tapau', 'gao', 'poh', 'tarik']).length).toBeGreaterThan(0);
  });
});

describe('the counter top', () => {
  it('spreads the counter machines out without overlapping', async () => {
    const { MACHINE_TOOLS, COUNTER, layoutCounter } = await import('../src/data/tools.js');
    const counter = Object.values(MACHINE_TOOLS).filter((t) => t.feet === COUNTER);
    expect(counter.length).toBe(6);
    for (const n of [1, 3, 6]) {
      const some = counter.slice(0, n);
      const at = layoutCounter(some);
      const row = some.map((t) => ({ l: at[t.id].x - (t.w * at[t.id].scale) / 2, r: at[t.id].x + (t.w * at[t.id].scale) / 2 })).sort((a, b) => a.l - b.l);
      for (let i = 1; i < row.length; i++) expect(row[i - 1].r).toBeLessThanOrEqual(row[i].l);
      expect(row[0].l).toBeGreaterThanOrEqual(0);
      expect(row.at(-1).r).toBeLessThanOrEqual(360);
    }
  });
});

describe('the recipe book', () => {
  it('every recipe word has an example order that uses it', () => {
    for (const [f, b] of Object.entries(BOOK)) {
      expect(b.example, f).toBeTruthy();
      expect(featuresOf(parseOrder(b.example)), f).toContain(f);
    }
  });
});
