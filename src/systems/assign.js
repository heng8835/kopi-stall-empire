// Who is this cup for? No order tickets: the game guesses from what's in the cup.
// Pure, no Phaser.
import { ZONES } from '../data/stallTuning.js';

// How well a cup so far fits an order. Negative = it can't be this order any more.
export function fitScore(cup, spec) {
  let s = 0;
  if (cup.base) {
    if (cup.base === spec.base) s += 3;
    else if (spec.base === 'cham' && (cup.base === 'kopi' || cup.base === 'teh')) s += 2; // half-way to a cham
    else return -5;
  }
  const condensed = cup.condensed > ZONES.trace;
  const evap = cup.evap > ZONES.trace;
  if (spec.milk === null && (condensed || evap)) return -5; // malt drinks have no milk
  if (spec.milk === 'none' && (condensed || evap)) return -3;
  if (spec.milk === 'condensed' && evap) return -3;
  if (spec.milk === 'evap' && condensed) return -3;
  if ((spec.milk === 'condensed' && condensed) || (spec.milk === 'evap' && evap)) s += 1;
  if (cup.ice) s += spec.iced ? 1 : -2;
  if (cup.powder) s += spec.topping ? 1 : -2;
  return s;
}

// Pick the customer a cup is most likely for. candidates: [{ c, spec }] oldest first (waiting
// longest wins a tie). Returns the candidate or null if nobody fits.
export function pickFor(cup, candidates) {
  let best = null;
  let bestScore = -1;
  for (const cand of candidates) {
    const s = fitScore(cup, cand.spec);
    if (s > bestScore) {
      best = cand;
      bestScore = s;
    }
  }
  return best;
}
