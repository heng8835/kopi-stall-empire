import { describe, it, expect } from 'vitest';
import { featuresOf, unlockedFeatures, canMake, ordersFor, lessonFor } from '../src/systems/menu.js';
import { LESSONS, BOOK, STARTER } from '../src/data/recipes.js';
import { CUSTOMERS } from '../src/data/customers.js';
import { EVENTS } from '../src/data/events.js';
import { parseOrder } from '../src/systems/order.js';

describe('recipe calendar', () => {
  it('reads the building blocks of an order', () => {
    expect(featuresOf(parseOrder('Teh C siew dai peng'))).toEqual(['teh', 'C', 'siewDai', 'peng']);
    expect(featuresOf(parseOrder('Kopi'))).toEqual(['kopi']);
    expect(featuresOf(parseOrder('Milo Dinosaur'))).toEqual(['miloDino']);
    expect(featuresOf(parseOrder('Milo'))).toEqual(['milo']);
  });

  it('Day 1 serves only the 4 starter drinks', () => {
    const d1 = unlockedFeatures(1);
    expect(['Kopi', 'Kopi O', 'Teh', 'Teh O'].every((o) => canMake(o, d1))).toBe(true);
    expect(['Kopi C', 'Teh siew dai', 'Kopi peng', 'Milo Dinosaur', 'Kopi ga dai'].some((o) => canMake(o, d1))).toBe(false);
  });

  it('opens up one lesson at a time', () => {
    expect(canMake('Milo Dinosaur', unlockedFeatures(2))).toBe(true);
    expect(canMake('Kopi C kosong', unlockedFeatures(2))).toBe(false);
    expect(canMake('Kopi C kosong', unlockedFeatures(3))).toBe(true);
    expect(canMake('Teh C siew dai peng', unlockedFeatures(5))).toBe(true);
    expect(canMake('Kopi ga dai', unlockedFeatures(30))).toBe(true);
  });

  it('every lesson is well formed and teaches something new', () => {
    const seen = new Set(STARTER);
    for (const l of [...LESSONS].sort((a, b) => a.day - b.day)) {
      expect(l.features.some((f) => !seen.has(f)), `day ${l.day}`).toBe(true);
      l.features.forEach((f) => seen.add(f));
      expect(canMake(l.order, unlockedFeatures(l.day)), l.order).toBe(true);
      expect(CUSTOMERS.some((c) => c.id === l.teacher)).toBe(true);
      if (l.fallback) expect(CUSTOMERS.find((c) => c.id === l.fallback)?.enabled).toBe(true);
      if (l.afterStory) expect(EVENTS.some((e) => e.id === l.afterStory)).toBe(true);
      expect(l.card.title && l.card.line && l.card.steps.length).toBeTruthy();
    }
    for (const f of seen) expect(BOOK[f], f).toBeTruthy();
  });

  it('each counter regular has something to order every day', () => {
    for (const c of CUSTOMERS.filter((x) => x.enabled && x.id !== 'schoolKids')) expect(ordersFor(c.orders, 1).length, c.id).toBeGreaterThan(0);
    expect(ordersFor(CUSTOMERS.find((c) => c.id === 'schoolKids').orders, 1)).toEqual([]); // the kids arrive on Day 2
  });

  it('weights up the new word on its lesson day', () => {
    const aunty = CUSTOMERS.find((c) => c.id === 'auntyLim');
    const d4 = ordersFor(aunty.orders, 4);
    expect(d4.find((o) => o.text === 'Teh siew dai').weight).toBe(9);
    expect(lessonFor(4).teacher).toBe('auntyLim');
  });
});
