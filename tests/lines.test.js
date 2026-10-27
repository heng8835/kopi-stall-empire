import { describe, it, expect } from 'vitest';
import { LINES, greetAt, pickLine } from '../src/i18n/lines.js';
import { GLOSSARY } from '../src/data/glossary.js';
import { TUTORIAL_STEPS } from '../src/data/tutorial.js';

const DAY = 120_000; // 7am -> 7pm

describe('lines', () => {
  it('greets by the stall clock: morning, afternoon, evening', () => {
    expect(greetAt(0, DAY)).toBe('Morning');
    expect(greetAt(DAY * (4.9 / 12), DAY)).toBe('Morning'); // 11:54am
    expect(greetAt(DAY * (7.75 / 12), DAY)).toBe('Afternoon'); // 2:45pm
    expect(greetAt(DAY * (10.75 / 12), DAY)).toBe('Evening'); // 5:45pm
  });

  it('no order line says "Morning" outright (it would at 5pm)', () => {
    for (const [who, kinds] of Object.entries(LINES)) {
      for (const line of kinds.order ?? []) expect(line, who).not.toMatch(/\bMorning\b/);
    }
    expect(pickLine('officeWorker', 'order', { order: 'Kopi', greet: 'Afternoon' }, () => 0.4)).toBe('Afternoon! Kopi, thanks boss.');
  });

  it('the words players asked about have glossary entries', () => {
    for (const k of ['pakcik', '老板', '我们看看', 'peng', 'shiok', 'chope', 'cham']) expect(GLOSSARY[k], k).toBeTruthy();
  });

  it('Day 1: Aunty Lim comes in first and the demo shows her teh', () => {
    const [first] = TUTORIAL_STEPS;
    expect(first.customer).toBe('auntyLim');
    expect(first.demo).toBe(true);
    expect(TUTORIAL_STEPS.findIndex((s) => s.story === 'start')).toBeGreaterThan(0);
  });

  it('Day 1: after her demo cup she asks for a second teh you make yourself', () => {
    const [first] = TUTORIAL_STEPS;
    expect(first.cups).toBe(2);
    expect(first.again).toBeTruthy();
    expect(first.highlight.length).toBeGreaterThan(0);
  });
});
