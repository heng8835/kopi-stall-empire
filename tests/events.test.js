import { describe, it, expect } from 'vitest';
import SIZES from '../src/data/spriteSizes.json';
import { EVENTS, CAST } from '../src/data/events.js';
import { CUSTOMERS } from '../src/data/customers.js';
import { GLOSSARY } from '../src/data/glossary.js';
import { scriptFor, fill } from '../src/systems/story.js';
import { tokenize } from '../src/systems/order.js';

const allBeats = (e) => [
  ...(e.beats ?? []),
  ...(e.choice?.options ?? []).flatMap((o) => o.beats ?? []),
  ...(e.after ?? []),
  ...(e.endings ?? []).flatMap((x) => x.beats),
  ...(e.epilogue ?? []),
];
const vars = { owner: 'Ah Girl', rating: 10 };

describe('month 1 story data', () => {
  it('has unique ids, valid days and moments', () => {
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(EVENTS.length);
    for (const e of EVENTS) {
      expect(e.day).toBeGreaterThanOrEqual(1);
      expect(e.day).toBeLessThanOrEqual(30);
      expect(['start', 'mid', 'end']).toContain(e.when);
      expect(e.title.en && e.title.zh).toBeTruthy();
    }
  });

  it('plays on each of Days 1-3, then at least every 3 days, ending on Day 30', () => {
    const days = [...new Set(EVENTS.map((e) => e.day))].sort((a, b) => a - b);
    expect(days.slice(0, 3)).toEqual([1, 2, 3]);
    days.slice(1).forEach((d, i) => expect(d - days[i]).toBeLessThanOrEqual(3));
    expect(days.at(-1)).toBe(30);
  });

  it('every speaker is in the cast and has art (or a silhouette fallback)', () => {
    for (const b of EVENTS.flatMap(allBeats)) {
      if (b.who === 'narrator' || b.who === 'note') continue;
      const cast = CAST[b.who];
      expect(cast, b.who).toBeTruthy();
      if (b.who === 'owner') continue;
      expect(SIZES[cast.sprite] || SIZES[cast.fallback], `${b.who} art`).toBeTruthy();
    }
  });

  it('lines fit the dialogue box', () => {
    for (const b of EVENTS.flatMap(allBeats)) expect(fill(b.text, vars).length, b.text).toBeLessThanOrEqual(100);
    for (const e of EVENTS) for (const o of e.choice?.options ?? []) expect(o.label.length, o.label).toBeLessThanOrEqual(42);
  });

  it('choices offer 2-3 options; guests are real customers', () => {
    for (const e of EVENTS.filter((x) => x.choice)) expect(e.choice.options.length).toBeGreaterThanOrEqual(2);
    for (const e of EVENTS.filter((x) => x.guest)) expect(CUSTOMERS.some((c) => c.id === e.guest.id)).toBe(true);
  });

  it('the finale always has an ending', () => {
    const fin = EVENTS.find((e) => e.endings);
    expect(fin.day).toBe(30);
    for (const fame of [0, 39, 40, 69, 70, 100]) expect(scriptFor(fin, { fame }).length).toBeGreaterThan(fin.beats.length);
  });

  it('local terms in the story are tappable', () => {
    const text = EVENTS.flatMap(allBeats).map((b) => b.text).join(' ');
    const tapped = new Set(tokenize(text).map((t) => t.glossaryKey).filter(Boolean));
    for (const k of ['chope', 'kan cheong', 'api', 'ikan bilis', 'nasi lemak', 'kway teow', 'qigong', 'makcik', 'kopitiam', '有进步空间', '等我吃完先', '房东', '有心']) {
      expect(GLOSSARY[k], k).toBeTruthy();
      expect(tapped.has(k), k).toBe(true);
    }
  });
});
