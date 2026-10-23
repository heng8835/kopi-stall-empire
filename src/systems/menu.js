// Which orders the stall can take on a given day (the recipe calendar). Pure, no Phaser.
import { STARTER, LESSONS } from '../data/recipes.js';
import { parseOrder } from './order.js';

// The building blocks an order needs, e.g. "Teh C siew dai peng" -> teh, C, siewDai, peng.
export function featuresOf(spec) {
  if (spec.base === 'milo') return spec.topping ? ['miloDino'] : spec.iced ? ['milo', 'peng'] : ['milo']; // the Dinosaur is its own recipe
  const f = [spec.base];
  if (spec.milk === 'none') f.push('O');
  if (spec.milk === 'evap') f.push('C');
  if (spec.sugar === 'none') f.push('kosong');
  if (spec.sugar === 'less') f.push('siewDai');
  if (spec.sugar === 'more') f.push('gaDai');
  if (spec.iced) f.push('peng');
  return f;
}

// Everything taught up to and including `day`.
export function unlockedFeatures(day) {
  const set = new Set(STARTER);
  for (const l of LESSONS) if (l.day <= day) l.features.forEach((f) => set.add(f));
  return set;
}

export const canMake = (orderText, unlocked) => featuresOf(parseOrder(orderText)).every((f) => unlocked.has(f));

export const lessonFor = (day) => LESSONS.find((l) => l.day === day) ?? null;

// A customer's orders that can be made today. On a lesson day, orders using the new word are
// weighted up so the player practises it.
export function ordersFor(orders, day) {
  const unlocked = unlockedFeatures(day);
  const fresh = new Set(lessonFor(day)?.features ?? []);
  return orders
    .filter((o) => canMake(o.text, unlocked))
    .map((o) => (featuresOf(parseOrder(o.text)).some((f) => fresh.has(f)) ? { ...o, weight: o.weight * 3 } : o));
}

// Lessons taught so far (for the recipe book), oldest first.
export const lessonsUpTo = (day) => LESSONS.filter((l) => l.day <= day);
