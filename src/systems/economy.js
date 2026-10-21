import { ICED_SURCHARGE, PERFECT_TIP } from '../data/drinks.js';
import { findDrink } from './order.js';

// All money is integer cents.
export const HAPPINESS_START = 50;
export const HAPPINESS_DELTA = { perfect: 2, close: 1, oops: -1, timeout: -1 };

export function createDayState(carry = {}) {
  return {
    money: carry.money ?? 0,
    earnedToday: 0,
    happiness: carry.happiness ?? HAPPINESS_START,
    served: 0,
    perfect: 0,
    walkedOut: 0,
  };
}

// Price of what the customer ordered (they pay for their order, even if you got it wrong).
export function priceOf(spec) {
  const drink = findDrink(spec);
  const base = drink?.price ?? 120;
  return base + (spec.iced && spec.base !== 'milo' ? ICED_SURCHARGE : 0);
}

const clampHappy = (h) => Math.max(0, Math.min(100, h));

// Apply one served cup. Returns { paid, tip, happy } for floating feedback text.
export function applyServe(state, tier, wantedSpec) {
  const paid = priceOf(wantedSpec);
  const tip = tier === 'perfect' ? PERFECT_TIP : 0;
  const happy = HAPPINESS_DELTA[tier];
  state.money += paid + tip;
  state.earnedToday += paid + tip;
  state.happiness = clampHappy(state.happiness + happy);
  state.served += 1;
  if (tier === 'perfect') state.perfect += 1;
  return { paid, tip, happy };
}

export function applyTimeout(state) {
  state.happiness = clampHappy(state.happiness + HAPPINESS_DELTA.timeout);
  state.walkedOut += 1;
}

export function formatMoney(cents) {
  const sign = cents < 0 ? '-' : '';
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}
