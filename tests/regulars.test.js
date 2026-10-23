import { describe, it, expect } from 'vitest';
import { daySchedule } from '../src/systems/queue.js';
import { regularOrder, ordersFor } from '../src/systems/menu.js';
import { CUSTOMERS, WALK_INS } from '../src/data/customers.js';
import { LINES } from '../src/i18n/lines.js';
import SIZES from '../src/data/spriteSizes.json';

const seq = (...xs) => () => xs.shift() ?? 0.5;
const day = { dayMs: 720_000, start: 3000, end: 700_000, jitter: 0.3 };

describe('regulars and walk-ins', () => {
  it('each regular comes once, inside their window, and walk-ins make up the rest', () => {
    const regulars = [{ id: 'ahGong', window: [10, 170] }, { id: 'auntyLim', window: [430, 540] }];
    const s = daySchedule({ ...day, total: 8, regulars });
    expect(s).toHaveLength(8);
    expect(s.filter((a) => a.id === null)).toHaveLength(6);
    const gong = s.find((a) => a.id === 'ahGong').at;
    const aunty = s.find((a) => a.id === 'auntyLim').at;
    expect(gong).toBeGreaterThanOrEqual(10_000);
    expect(gong).toBeLessThanOrEqual(170_000);
    expect(aunty).toBeGreaterThanOrEqual(430_000);
    expect(aunty).toBeLessThanOrEqual(540_000);
    expect(s.map((a) => a.at)).toEqual([...s.map((a) => a.at)].sort((a, b) => a - b));
  });

  it('a low-fame day still brings every regular', () => {
    const regulars = [{ id: 'a', window: [0, 100] }, { id: 'b', window: [100, 200] }, { id: 'c', window: [200, 300] }];
    expect(daySchedule({ ...day, total: 2, regulars })).toHaveLength(3);
  });

  it('a regular mostly orders their newest usual, sometimes something else', () => {
    const aunty = CUSTOMERS.find((c) => c.id === 'auntyLim');
    expect(regularOrder(aunty.usual, ordersFor(aunty.orders, 1), 0.25, seq(0.9))).toBe('Teh');
    expect(regularOrder(aunty.usual, ordersFor(aunty.orders, 4), 0.25, seq(0.9))).toBe('Teh siew dai');
    expect(regularOrder(aunty.usual, ordersFor(aunty.orders, 4), 0.25, seq(0.1, 0))).toBe(ordersFor(aunty.orders, 4)[0].text);
  });

  it('nothing on the menu yet means no order (the kids on Day 1)', () => {
    const kids = CUSTOMERS.find((c) => c.id === 'schoolKids');
    expect(regularOrder(kids.usual, ordersFor(kids.orders, 1))).toBe(null);
    expect(regularOrder(kids.usual, ordersFor(kids.orders, 2), 0.25, seq(0.9))).toBe('Milo Dinosaur');
  });

  it('regulars and walk-ins are well formed', () => {
    for (const r of CUSTOMERS.filter((c) => c.regular)) {
      expect(r.window[0]).toBeLessThan(r.window[1]);
      expect(r.window[1]).toBeLessThanOrEqual(720);
      for (const u of r.usual) expect(r.orders.some((o) => o.text === u), `${r.id} ${u}`).toBe(true);
    }
    for (const w of WALK_INS) {
      expect(SIZES[w.standIn], w.id).toBeTruthy();
      expect(LINES[w.lines]?.order?.length, w.id).toBeGreaterThan(0);
      expect(ordersFor(w.orders, 1).length, w.id).toBeGreaterThan(0); // something to order on Day 1
      expect(CUSTOMERS.some((c) => c.id === w.id), w.id).toBe(false);
    }
  });
});
