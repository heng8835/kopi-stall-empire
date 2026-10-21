import { describe, it, expect } from 'vitest';
import { scoreDrink } from '../src/systems/scoring.js';
import { parseOrder } from '../src/systems/order.js';
import { createDayState, applyServe, applyTimeout, priceOf, formatMoney } from '../src/systems/economy.js';

const p = parseOrder;

describe('scoreDrink', () => {
  it('perfect on exact match', () => {
    expect(scoreDrink(p('Teh C siew dai'), p('Teh C siew dai'))).toBe('perfect');
  });
  it('close when one detail is off', () => {
    expect(scoreDrink(p('Teh C'), p('Teh C siew dai'))).toBe('close');
    expect(scoreDrink(p('Kopi C kosong peng'), p('Kopi C kosong'))).toBe('close');
  });
  it('oops when base is wrong or 2+ details off', () => {
    expect(scoreDrink(p('Kopi C siew dai'), p('Teh C siew dai'))).toBe('oops');
    expect(scoreDrink(p('Kopi O'), p('Kopi C kosong'))).toBe('oops');
    expect(scoreDrink(null, p('Kopi'))).toBe('oops');
  });
  it('milo only cares about ice and powder', () => {
    const dino = p('Milo Dinosaur');
    expect(scoreDrink({ ...dino }, dino)).toBe('perfect');
    expect(scoreDrink({ ...dino, topping: null }, dino)).toBe('close');
    expect(scoreDrink({ ...dino, topping: null, iced: false }, dino)).toBe('oops');
  });
});

describe('economy', () => {
  it('prices with iced surcharge', () => {
    expect(priceOf(p('Kopi O'))).toBe(120);
    expect(priceOf(p('Kopi O peng'))).toBe(140);
    expect(priceOf(p('Milo Dinosaur'))).toBe(280);
  });

  it('always pays, tips on perfect, gentle happiness', () => {
    const s = createDayState();
    applyServe(s, 'perfect', p('Kopi'));
    applyServe(s, 'oops', p('Kopi'));
    expect(s.money).toBe(140 + 30 + 140);
    expect(s.happiness).toBe(51);
    applyTimeout(s);
    expect(s.happiness).toBe(50);
    expect(s.walkedOut).toBe(1);
  });

  it('formats money', () => expect(formatMoney(310)).toBe('$3.10'));
});
