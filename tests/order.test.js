import { describe, it, expect } from 'vitest';
import { parseOrder, formatOrder, tokenize, findDrink } from '../src/systems/order.js';
import { DRINKS } from '../src/data/drinks.js';

describe('parseOrder', () => {
  it('reads the kopi grammar', () => {
    expect(parseOrder('Kopi')).toEqual({ base: 'kopi', milk: 'condensed', sugar: 'normal', iced: false, topping: null, strength: 'normal' });
    expect(parseOrder('Kopi O kosong')).toMatchObject({ milk: 'none', sugar: 'none' });
    expect(parseOrder('Teh C siew dai peng')).toEqual({ base: 'teh', milk: 'evap', sugar: 'less', iced: true, topping: null, strength: 'normal' });
    expect(parseOrder('kopi c kosong')).toMatchObject({ base: 'kopi', milk: 'evap', sugar: 'none' });
  });

  it('knows Milo Dinosaur is iced with powder', () => {
    expect(parseOrder('Milo Dinosaur')).toEqual({ base: 'milo', milk: null, sugar: null, iced: true, topping: 'milo', strength: null });
  });

  it('rejects unknown words', () => {
    expect(() => parseOrder('Kopi siu')).toThrow();
    expect(() => parseOrder('Bubble tea')).toThrow();
  });

  it('reads strength: gao (strong) and poh (weak)', () => {
    expect(parseOrder('Kopi O gao siew dai')).toMatchObject({ milk: 'none', strength: 'gao', sugar: 'less' });
    expect(parseOrder('Teh poh')).toMatchObject({ base: 'teh', strength: 'poh' });
    for (const t of ['Kopi O gao', 'Kopi C poh siew dai', 'Kopi gao peng']) expect(formatOrder(parseOrder(t))).toBe(t);
  });
});

describe('formatOrder round-trip', () => {
  const coffeeTea = Object.values(DRINKS).filter((d) => d.milk !== null); // kopi / teh / cham grammar
  const mods = ['', ' kosong', ' siew dai', ' ga dai', ' peng', ' kosong peng', ' siew dai peng'];

  for (const d of coffeeTea) {
    for (const m of mods) {
      const text = `${d.name}${m}`;
      it(text, () => {
        const spec = parseOrder(text);
        expect(formatOrder(spec)).toBe(text);
        expect(findDrink(spec).id).toBe(d.id);
      });
    }
  }

  it('Milo Dinosaur', () => expect(formatOrder(parseOrder('Milo Dinosaur'))).toBe('Milo Dinosaur'));

  it('Horlicks family', () => {
    for (const t of ['Horlicks', 'Horlicks peng', 'Horlicks Dinosaur']) expect(formatOrder(parseOrder(t))).toBe(t);
    expect(parseOrder('Horlicks Dinosaur')).toEqual({ base: 'horlicks', milk: null, sugar: null, iced: true, topping: 'horlicks', strength: null });
    expect(findDrink(parseOrder('Horlicks Dinosaur')).id).toBe('horlicksDino');
    expect(() => parseOrder('Horlicks kosong')).toThrow();
  });
});

describe('tokenize', () => {
  it('tags glossary words and two-word phrases', () => {
    const t = tokenize('Boss, kopi C kosong, fast fast can?');
    expect(t.map((x) => x.glossaryKey)).toEqual(['boss', 'kopi', 'c', 'kosong', 'fast fast', 'can']);
    expect(t[4].text).toBe('fast fast');
  });

  it('leaves normal words untagged', () => {
    const t = tokenize('Teh C siew dai, thank you');
    expect(t.map((x) => x.glossaryKey)).toEqual(['teh', 'c', 'siew dai', null, null]);
  });
});
