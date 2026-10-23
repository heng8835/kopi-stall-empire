import { ICED_SURCHARGE, PERFECT_TIP } from '../data/drinks.js';
import { TUNING } from '../data/stallTuning.js';
import { findDrink } from './order.js';

// All money is integer cents. Fame (名气) is 0-100 and carries over the whole month.
export function createDayState(carry = {}) {
  return {
    money: carry.money ?? 0,
    earnedToday: 0,
    tipsToday: 0,
    fame: carry.fame ?? TUNING.fameStart,
    fameStart: carry.fame ?? TUNING.fameStart,
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

export const clampFame = (f) => Math.max(0, Math.min(100, Math.round(f * 100) / 100));

// How many arrivals a day brings at this fame (a group counts as one).
export function customersForFame(fame) {
  const n = TUNING.customersMin + Math.floor(fame / TUNING.famePerExtraCustomer);
  return Math.max(TUNING.customersMin, Math.min(TUNING.customersMax, n));
}

// Apply one served cup. Returns { paid, tip, fame } for floating feedback text.
export function applyServe(state, tier, wantedSpec) {
  const paid = priceOf(wantedSpec);
  const tip = tier === 'perfect' ? PERFECT_TIP : 0;
  const fame = TUNING.fameDelta[tier];
  state.money += paid + tip;
  state.earnedToday += paid + tip;
  state.tipsToday += tip;
  state.fame = clampFame(state.fame + fame);
  state.served += 1;
  if (tier === 'perfect') state.perfect += 1;
  return { paid, tip, fame };
}

export function applyTimeout(state) {
  state.fame = clampFame(state.fame + TUNING.fameDelta.timeout);
  state.walkedOut += 1;
}

export function formatMoney(cents) {
  const sign = cents < 0 ? '-' : '';
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}
