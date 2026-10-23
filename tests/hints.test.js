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
