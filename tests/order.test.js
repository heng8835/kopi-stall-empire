import { describe, it, expect } from 'vitest';
import { parseOrder, formatOrder, tokenize, findDrink } from '../src/systems/order.js';
import { DRINKS } from '../src/data/drinks.js';

describe('parseOrder', () => {
  it('reads the kopi grammar', () => {
    expect(parseOrder('Kopi')).toEqual({ base: 'kopi', milk: 'condensed', sugar: 'normal', iced: false, topping: null });
    expect(parseOrder('Kopi O kosong')).toMatchObject({ milk: 'none', sugar: 'none' });
    expect(parseOrder('Teh C siew dai peng')).toEqual({ base: 'teh', milk: 'evap', sugar: 'less', iced: true, topping: null });
    expect(parseOrder('kopi c kosong')).toMatchObject({ base: 'kopi', milk: 'evap', sugar: 'none' });
  });

  it('knows Milo Dinosaur is iced with powder', () => {
    expect(parseOrder('Milo Dinosaur')).toEqual({ base: 'milo', milk: null, sugar: null, iced: true, topping: 'milo' });
  });

  it('rejects unknown words', () => {
    expect(() => parseOrder('Kopi gao')).toThrow();
    expect(() => parseOrder('Bubble tea')).toThrow();
  });
});

describe('formatOrder round-trip', () => {
  const coffeeTea = Object.values(DRINKS).filter((d) => d.base !== 'milo');
  const mods = ['', ' kosong', ' siew dai', ' peng', ' kosong peng', ' siew dai peng'];

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
