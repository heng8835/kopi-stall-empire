import { describe, it, expect } from 'vitest';
import { parseOrder } from '../src/systems/order.js';
import { createDayState, applyServe, applyTimeout, priceOf, formatMoney, customersForFame, nextCustomerAt, streakBonus } from '../src/systems/economy.js';

const p = parseOrder;

describe('economy', () => {
  it('prices with iced surcharge', () => {
    expect(priceOf(p('Kopi O'))).toBe(120);
    expect(priceOf(p('Kopi O peng'))).toBe(140);
    expect(priceOf(p('Milo Dinosaur'))).toBe(280);
  });

  it('perfect pays in full + tip, close pays 60%, a wrong drink pays nothing', () => {
    const s = createDayState();
    expect(s.fame).toBe(10);
    applyServe(s, 'perfect', p('Kopi'));
    applyServe(s, 'close', p('Kopi'));
    applyServe(s, 'oops', p('Kopi'));
    expect(s.money).toBe(140 + 30 + 80);
    expect(s.fame).toBe(10.3);
    applyTimeout(s);
    expect(s.fame).toBe(9.3);
    expect(s.walkedOut).toBe(1);
  });

  it('a story guest can pay less, and streaks add to the tip', () => {
    const s = createDayState();
    expect(applyServe(s, 'perfect', p('Kopi'), { price: 0, bonus: streakBonus(3) })).toMatchObject({ paid: 0, tip: 50 });
    expect(streakBonus(1)).toBe(0);
    expect(streakBonus(20)).toBe(50);
  });

  it('carries fame and clamps it to 0-100', () => {
    const s = createDayState({ fame: 99.9, money: 500 });
    applyServe(s, 'perfect', p('Kopi'));
    expect(s.fame).toBe(100);
    expect(s.money).toBe(500 + 170);
    expect(createDayState({ fame: 0.5 }).fameStart).toBe(0.5);
  });

  it('more fame brings more customers, slowly (chill start)', () => {
    expect(customersForFame(0)).toBe(8);
    expect(customersForFame(10)).toBe(8); // Day 1
    expect(customersForFame(21)).toBe(10);
    expect(customersForFame(30)).toBe(12);
    expect(customersForFame(100)).toBe(15);
    expect(nextCustomerAt(21)).toBe(25);
    expect(nextCustomerAt(100)).toBe(null);
  });

  it('formats money', () => expect(formatMoney(310)).toBe('$3.10'));
});

describe('comboBonus', () => {
  it('pays on every 5th perfect in a row only', async () => {
    const { comboBonus } = await import('../src/systems/economy.js');
    expect([1, 4, 5, 6, 10].map(comboBonus)).toEqual([0, 0, 100, 0, 100]);
  });
});
