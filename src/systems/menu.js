// Which orders the stall can take on a given day (the recipe calendar). Pure, no Phaser.
import { STARTER, LESSONS } from '../data/recipes.js';
import { parseOrder } from './order.js';
import { weightedPick } from './random.js';

// The building blocks an order needs, e.g. "Teh C siew dai peng" -> teh, C, siewDai, peng.
export function featuresOf(spec) {
  if (spec.base === 'milo') return spec.topping ? ['miloDino'] : spec.iced ? ['milo', 'peng'] : ['milo']; // the Dinosaur is its own recipe
  if (spec.base === 'horlicks') return spec.topping ? ['horlicksDino'] : spec.iced ? ['horlicks', 'peng'] : ['horlicks'];
  const f = [spec.base];
  if (spec.milk === 'none') f.push('O');
  if (spec.milk === 'evap') f.push('C');
  if (spec.sugar === 'none') f.push('kosong');
  if (spec.sugar === 'less') f.push('siewDai');
  if (spec.sugar === 'more') f.push('gaDai');
  if (spec.iced) f.push('peng');
  if (spec.strength === 'gao' || spec.strength === 'poh') f.push(spec.strength);
  if (spec.tarik) f.push('tarik');
  return f;
}

// Everything taught up to and including `day`, plus what owned machines add (shop perks().features).
export function unlockedFeatures(day, extra = []) {
  const set = new Set([...STARTER, ...extra]);
  for (const l of LESSONS) if (l.day <= day) l.features.forEach((f) => set.add(f));
  return set;
}

export const canMake = (orderText, unlocked) => featuresOf(parseOrder(orderText)).every((f) => unlocked.has(f));

export const lessonFor = (day) => LESSONS.find((l) => l.day === day) ?? null;

// A customer's orders that can be made today. On a lesson day, orders using the new word are
// weighted up so the player practises it.
export function ordersFor(orders, day, extra = [], freshExtra = []) {
  const unlocked = unlockedFeatures(day, extra);
  const fresh = new Set([...(lessonFor(day)?.features ?? []), ...freshExtra]);
  return orders
    .filter((o) => canMake(o.text, unlocked))
    .map((o) => (featuresOf(parseOrder(o.text)).some((f) => fresh.has(f)) ? { ...o, weight: o.weight * 3 } : o));
}

// Lessons taught so far (for the recipe book), oldest first.
export const lessonsUpTo = (day) => LESSONS.filter((l) => l.day <= day);

// A regular's order today: mostly their usual (the newest one on `usual` that can be made today),
// now and then something else off their list. `available` = ordersFor(...). null = nothing to order.
export function regularOrder(usual = [], available, variety = 0.25, rand = Math.random) {
  if (!available.length) return null;
  const can = new Set(available.map((o) => o.text));
  const mine = [...usual].reverse().find((t) => can.has(t));
  return mine && rand() >= variety ? mine : weightedPick(available, rand).text;
}
