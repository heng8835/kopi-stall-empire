import { describe, it, expect } from 'vitest';
import { parseOrder } from '../src/systems/order.js';
import { createDayState, applyServe, applyTimeout, priceOf, formatMoney } from '../src/systems/economy.js';

const p = parseOrder;

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
