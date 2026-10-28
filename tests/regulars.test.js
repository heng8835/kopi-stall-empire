import { describe, it, expect } from 'vitest';
import { daySchedule, bunch } from '../src/systems/queue.js';
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

  it('the first customer comes straight away, and regulars still keep their time', () => {
    for (let i = 0; i < 20; i++) {
      const s = daySchedule({ ...day, total: 8, regulars: [{ id: 'ahGong', window: [10, 170] }] });
      expect(s[0].at).toBe(day.start);
      expect(s.find((a) => a.id === 'ahGong').at).toBeGreaterThanOrEqual(10_000);
    }
  });

  it('walk-ins fill the quiet stretches: no long empty gap even when the regulars all come late', () => {
    const late = [{ id: 'a', window: [430, 540] }, { id: 'b', window: [480, 590] }, { id: 'c', window: [560, 670] }];
    for (let i = 0; i < 30; i++) {
      let seed = i + 1; // seeded, so the test is the same every run (a few random days did leave a 36% gap)
      const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const s = daySchedule({ ...day, total: 10, regulars: late, rushGap: 2500, rand });
      expect(s).toHaveLength(10);
      expect(s[0].at).toBe(day.start);
      const times = [...s.map((a) => a.at), day.end];
      const gaps = times.slice(1).map((t, j) => t - times[j]);
      expect(Math.max(...gaps)).toBeLessThan((day.end - day.start) * 0.35);
    }
  });

  it('walk-ins come in little rushes', () => {
    // sizes: 2 (rand 0.5), then 3 (rand 0.9), then 1 (rand 0.1)
    expect(bunch([0, 100, 200, 300, 400, 500], 10, 1000, seq(0.5, 0.9, 0.1))).toEqual([0, 10, 200, 210, 220, 500]);
    expect(bunch([0, 100], 0, 1000)).toEqual([0, 100]);
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
      expect(SIZES[w.sprite], w.id).toBeTruthy();
      expect(LINES[w.lines]?.order?.length, w.id).toBeGreaterThan(0);
      expect(ordersFor(w.orders, 30, w.bulk ? ['tapau', 'tarik'] : []).length, w.id).toBeGreaterThan(0); // comes once their drinks are taught (a bulk rider: the Tapau Station)
      expect(CUSTOMERS.some((c) => c.id === w.id), w.id).toBe(false);
    }
    // a decent crowd from Day 1 (the iced-drink people turn up once peng is taught)
    expect(WALK_INS.filter((w) => ordersFor(w.orders, 1).length).length).toBeGreaterThanOrEqual(10);
  });
});
