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

// Price of what the customer ordered (the full price for a perfect cup; see applyServe).
export function priceOf(spec) {
  const drink = findDrink(spec);
  const base = drink?.price ?? 120;
  return base + (spec.iced && spec.base !== 'milo' ? ICED_SURCHARGE : 0);
}

export const clampFame = (f) => Math.max(0, Math.min(100, Math.round(f * 100) / 100));

// How many arrivals a day brings at this fame (a group counts as one).
export function customersForFame(fame) {
  const n = TUNING.customersMin + Math.floor(Math.max(0, fame - TUNING.fameStart) / TUNING.famePerExtraCustomer);
  return Math.max(TUNING.customersMin, Math.min(TUNING.customersMax, n));
}

// The fame where tomorrow brings one more customer (null at the most customers).
export function nextCustomerAt(fame) {
  if (customersForFame(fame) >= TUNING.customersMax) return null;
  const steps = Math.floor(Math.max(0, fame - TUNING.fameStart) / TUNING.famePerExtraCustomer) + 1;
  return TUNING.fameStart + steps * TUNING.famePerExtraCustomer;
}

// Extra tip for a run of perfect cups in a row: 2 in a row +10c, 3 +20c ... up to +50c.
// Every comboEvery-th perfect in a row pays a combo bonus on top (0 otherwise).
export const comboBonus = (streak) => (streak > 0 && streak % TUNING.comboEvery === 0 ? TUNING.comboBonus : 0);

export const streakBonus = (streak) => Math.min(TUNING.streakTipMax, Math.max(0, streak - 1) * TUNING.streakTipStep);

// Apply one served cup. Returns { paid, tip, fame } for floating feedback text.
// Perfect pays the full price + a tip (+ bonus, e.g. a streak); close pays part of it; a wrong
// drink pays nothing (they politely don't pay for it). price overrides the menu price (story guests).
export function applyServe(state, tier, wantedSpec, { price = priceOf(wantedSpec), bonus = 0 } = {}) {
  const paid = tier === 'perfect' ? price : tier === 'close' ? Math.round((price * TUNING.closePay) / 10) * 10 : 0;
  const tip = tier === 'perfect' ? PERFECT_TIP + bonus : 0;
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
