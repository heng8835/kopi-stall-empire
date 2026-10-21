import { describe, it, expect } from 'vitest';
import { TUTORIAL_STEPS, BUTTON_IDS } from '../src/data/tutorial.js';
import { CUSTOMERS } from '../src/data/customers.js';
import { parseOrder } from '../src/systems/order.js';

describe('Day-1 tutorial data', () => {
  it('every step has an enabled customer, a valid order, valid highlights and a bilingual note', () => {
    for (const step of TUTORIAL_STEPS) {
      const def = CUSTOMERS.find((c) => c.id === step.customer);
      expect(def?.enabled, step.customer).toBe(true);
      expect(() => parseOrder(step.order)).not.toThrow();
      expect(step.highlight.filter((id) => !BUTTON_IDS.includes(id))).toEqual([]);
      expect(step.highlight).toContain('serve');
      expect(step.note.en.length).toBeGreaterThan(10);
      expect(step.note.zh.length).toBeGreaterThan(3);
    }
  });

  it('teaches the grammar in order: plain, O, C + kosong, then siew dai + peng', () => {
    const specs = TUTORIAL_STEPS.map((s) => parseOrder(s.order));
    expect(specs[0]).toMatchObject({ milk: 'condensed', sugar: 'normal', iced: false });
    expect(specs[1]).toMatchObject({ milk: 'none' });
    expect(specs[2]).toMatchObject({ milk: 'evap', sugar: 'none' });
    expect(specs[3]).toMatchObject({ milk: 'evap', sugar: 'less', iced: true });
  });
});
