import { describe, it, expect } from 'vitest';
import { fitScore, pickFor } from '../src/systems/assign.js';
import { newCup, pour, addIce } from '../src/systems/cup.js';
import { parseOrder } from '../src/systems/order.js';

const cand = (id, order) => ({ c: { id }, spec: parseOrder(order) });

describe('who is this cup for', () => {
  const waiting = [cand('marcus', 'Kopi C kosong'), cand('aunty', 'Teh siew dai'), cand('ahGong', 'Kopi O')];

  it('an empty cup goes to whoever waited longest', () => {
    expect(pickFor(newCup(), waiting).c.id).toBe('marcus');
  });

  it('teh in the cup -> the teh order', () => {
    expect(pickFor(pour(newCup(), 'teh', 500), waiting).c.id).toBe('aunty');
  });

  it('kopi with no milk -> still the oldest kopi order; with sugar only it fits Kopi O too', () => {
    expect(pickFor(pour(newCup(), 'kopi', 500), waiting).c.id).toBe('marcus');
    const withEvap = pour(pour(newCup(), 'kopi', 500), 'evap', 400);
    expect(pickFor(withEvap, waiting).c.id).toBe('marcus');
    expect(fitScore(withEvap, parseOrder('Kopi O'))).toBeLessThan(0);
  });

  it('ice prefers a peng order', () => {
    const list = [cand('a', 'Kopi'), cand('b', 'Kopi peng')];
    expect(pickFor(addIce(pour(newCup(), 'kopi', 500)), list).c.id).toBe('b');
  });

  it('nobody fits -> null', () => {
    expect(pickFor(pour(newCup(), 'milo', 500), waiting)).toBe(null);
    expect(pickFor(newCup(), [])).toBe(null);
  });
});
