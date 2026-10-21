// Weighted random pick: items need a numeric `weight`.
export function weightedPick(items, rng = Math.random) {
  const total = items.reduce((s, it) => s + (it.weight ?? 1), 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight ?? 1;
    if (r < 0) return it;
  }
  return items[items.length - 1];
}

export const randBetween = (min, max, rng = Math.random) => min + rng() * (max - min);
