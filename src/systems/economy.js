import { ICED_SURCHARGE, STEP_TIP, EXTRA_PRICE } from '../data/drinks.js';
import { TUNING } from '../data/stallTuning.js';
import { findDrink } from './order.js';

// All money is integer cents. Fame (名气) is 0-TUNING.fameMax and carries over the whole month.
export function createDayState(carry = {}) {
  return {
    money: carry.money ?? 0,
    earnedToday: 0,
    tipsToday: 0,
    bonusToday: 0, // today's goal, a friend's thanks: neither sales nor tips
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
  const extras = ['halia', 'limau', 'tarik', 'butter', 'tapau'].reduce((sum, k) => sum + (spec[k] ? EXTRA_PRICE[k] : 0), 0);
  return base + (spec.iced && spec.base !== 'milo' ? ICED_SURCHARGE : 0) + extras + (EXTRA_PRICE[spec.strength] ?? 0);
}

// How many things the player does to make this drink: pot(s), milk, sugar, stir, water, ice, extras, topping, bag.
export function drinkSteps(spec) {
  const malt = spec.base === 'milo' || spec.base === 'horlicks';
  let n = spec.layered ? 3 : spec.base === 'cham' ? 2 : 1; // Teh C Special: gula melaka, evap, teh
  if (!malt && !spec.layered) {
    const sugar = spec.milk !== 'condensed' && spec.sugar !== 'none';
    if (spec.milk !== 'none') n += 1;
    if (sugar) n += 1;
    if (!spec.tarik && (spec.milk !== 'none' || sugar)) n += 1; // the spoon (tarik does the mixing itself)
    if (spec.strength === 'poh') n += 1; // the kettle
  }
  for (const k of ['iced', 'topping', 'scoop', 'halia', 'limau', 'butter', 'tarik', 'tapau']) if (spec[k]) n += 1;
  return n;
}

export const stepTip = (spec) => STEP_TIP * drinkSteps(spec);

// What a perfect cup of this pays before streaks and perks (the shop's "about $2.35 a cup").
export const cupPay = (spec) => priceOf(spec) + stepTip(spec);

export const clampFame = (f) => Math.max(0, Math.min(TUNING.fameMax, Math.round(f * 100) / 100));

// The month's big goal as one line: "Empire 名气 134/200 ▰▰▰▰▰▰▱▱▱▱" (the day-end card, the shop's Stall 2 card).
export function empireLine(fame) {
  const goal = TUNING.empireFame;
  if (fame >= goal) return `Empire ready! 名气 ${Math.floor(fame)}/${goal}: keep it till Day 30`;
  const filled = Math.min(9, Math.floor((fame / goal) * 10));
  return `Empire 名气 ${Math.floor(fame)}/${goal} ${'▰'.repeat(filled)}${'▱'.repeat(10 - filled)}`;
}

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

// Extra tip for a run of perfect cups in a row: 2 in a row +10c, 3 +20c, 4 and on +30c.
// Every comboEvery-th perfect in a row pays a combo bonus on top (0 otherwise).
export const comboBonus = (streak) => (streak > 0 && streak % TUNING.comboEvery === 0 ? TUNING.comboBonus : 0);

export const streakBonus = (streak) => Math.min(TUNING.streakTipMax, Math.max(0, streak - 1) * TUNING.streakTipStep);

// Apply one served cup. Returns { paid, tip, fame } for floating feedback text.
// Perfect pays the full price + a tip for the work (+ bonus, e.g. a streak); close pays part of it; a wrong
// drink pays nothing (they politely don't pay for it). price overrides the menu price (story guests).
export function applyServe(state, tier, wantedSpec, { price = priceOf(wantedSpec), bonus = 0 } = {}) {
  const paid = tier === 'perfect' ? price : tier === 'close' ? Math.round((price * TUNING.closePay) / 10) * 10 : 0;
  const tip = tier === 'perfect' ? stepTip(wantedSpec) + bonus : 0;
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
