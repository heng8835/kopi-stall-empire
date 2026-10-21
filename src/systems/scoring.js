// Compare the drink the player made with the drink the customer wanted.
// Tiers: 'perfect' (exact), 'close' (one detail off), 'oops' (wrong base or 2+ details off).
// Nothing here is punishing: every tier still pays (see economy.js).

const FIELDS = ['milk', 'sugar', 'iced', 'topping'];
const MILO_FIELDS = ['iced', 'topping'];

export function countDiffs(made, wanted) {
  if (!made?.base || made.base !== wanted.base) return Infinity;
  const fields = wanted.base === 'milo' ? MILO_FIELDS : FIELDS;
  return fields.filter((f) => (made[f] ?? null) !== (wanted[f] ?? null)).length;
}

export function scoreDrink(made, wanted) {
  const diffs = countDiffs(made, wanted);
  if (diffs === 0) return 'perfect';
  if (diffs === 1) return 'close';
  return 'oops';
}
