import { describe, it, expect } from 'vitest';
import { TUTORIAL_STEPS, TOOL_IDS } from '../src/data/tutorial.js';
import { TOOLS } from '../src/data/tools.js';
import { CUSTOMERS } from '../src/data/customers.js';
import { parseOrder } from '../src/systems/order.js';
import { newCup, pour, addIce, addPowder, stirStep, gradeCup } from '../src/systems/cup.js';
import { TUNING } from '../src/data/stallTuning.js';

const holdFor = (ing, amount) => (amount * 1000) / TUNING.pourPerSec[ing];

describe('Day-1 tutorial data', () => {
  it('every tool id exists on the stall', () => {
    expect(TOOL_IDS.filter((id) => !TOOLS.some((t) => t.id === id))).toEqual([]);
  });

  it('every step has an enabled counter customer, a valid order, real tools, and a demo or their own line', () => {
    for (const step of TUTORIAL_STEPS.filter((s) => !s.info)) {
      const def = CUSTOMERS.find((c) => c.id === step.customer);
      expect(def?.enabled, step.customer).toBe(true);
      expect(def.slot ?? 'counter').toBe('counter');
      expect(() => parseOrder(step.order)).not.toThrow();
      expect(step.highlight.filter((id) => !TOOL_IDS.includes(id))).toEqual([]);
      expect(step.demo || step.say?.length > 10, step.order).toBeTruthy();
    }
  });

  it('info tips are short enough for the thought bubble', () => {
    for (const step of TUTORIAL_STEPS.filter((s) => s.info)) expect(step.info.length).toBeLessThanOrEqual(90);
  });

  it('every scripted order can be made perfectly using only the highlighted tools (plus earlier ones)', () => {
    const learned = new Set();
    for (const step of TUTORIAL_STEPS.filter((s) => !s.info)) {
      step.highlight.forEach((id) => learned.add(id));
      const spec = parseOrder(step.order);
      const cup = newCup();
      expect(learned.has(spec.base)).toBe(true);
      pour(cup, spec.base, holdFor(spec.base, 0.95));
      const sweet = { none: 0, less: 0.45, normal: 0.9, more: 1.25 }[spec.sugar];
      if (spec.milk === 'condensed') {
        expect(learned.has('condensed')).toBe(true); // condensed milk is the sweetness
        pour(cup, 'condensed', holdFor('condensed', sweet));
      } else {
        if (spec.milk === 'evap') {
          expect(learned.has('evap')).toBe(true);
          pour(cup, 'evap', holdFor('evap', 0.9));
        }
        if (sweet) {
          expect(learned.has('sugar')).toBe(true);
          pour(cup, 'sugar', holdFor('sugar', sweet));
        }
      }
      const sugar = sweet;
      if (sugar || spec.milk !== 'none') {
        expect(learned.has('stir')).toBe(true);
        for (let i = 0; i < TUNING.stirWigglesNeeded; i++) stirStep(cup);
      }
      if (spec.iced) {
        expect(learned.has('ice')).toBe(true);
        addIce(cup);
      }
      if (spec.topping) addPowder(cup);
      expect(gradeCup(cup, spec).tier, step.order).toBe('perfect');
    }
  });
});
