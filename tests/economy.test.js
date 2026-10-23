import { describe, it, expect } from 'vitest';
import { parseOrder } from '../src/systems/order.js';
import { createDayState, applyServe, applyTimeout, priceOf, formatMoney, customersForFame } from '../src/systems/economy.js';

const p = parseOrder;

describe('economy', () => {
  it('prices with iced surcharge', () => {
    expect(priceOf(p('Kopi O'))).toBe(120);
    expect(priceOf(p('Kopi O peng'))).toBe(140);
    expect(priceOf(p('Milo Dinosaur'))).toBe(280);
  });

  it('always pays, tips on perfect, gentle fame', () => {
    const s = createDayState();
    expect(s.fame).toBe(10);
    applyServe(s, 'perfect', p('Kopi'));
    applyServe(s, 'oops', p('Kopi'));
    expect(s.money).toBe(140 + 30 + 140);
    expect(s.fame).toBe(10.25);
    applyTimeout(s);
    expect(s.fame).toBe(9.25);
    expect(s.walkedOut).toBe(1);
  });

  it('carries fame and clamps it to 0-100', () => {
    const s = createDayState({ fame: 99.9, money: 500 });
    applyServe(s, 'perfect', p('Kopi'));
    expect(s.fame).toBe(100);
    expect(s.money).toBe(500 + 170);
    expect(createDayState({ fame: 0.5 }).fameStart).toBe(0.5);
  });

  it('more fame brings more customers, slowly (chill start)', () => {
    expect(customersForFame(0)).toBe(6);
    expect(customersForFame(10)).toBe(6); // Day 1
    expect(customersForFame(30)).toBe(8);
    expect(customersForFame(60)).toBe(10);
    expect(customersForFame(100)).toBe(12);
  });

  it('formats money', () => expect(formatMoney(310)).toBe('$3.10'));
});
