// Night-shop rules: what can be bought, buying, and what everything owned adds up to. Pure.
import { SHOP } from '../data/shop.js';
import { formatMoney } from './economy.js';

export const itemById = (id) => SHOP.find((i) => i.id === id) ?? null;

// 'owned' | 'soon' | 'gift' | 'fame' (not famous enough yet) | 'money' (can't afford) | 'buy'
export function shopState(item, run) {
  if (run.owned?.includes(item.id)) return 'owned';
  if (item.soon) return 'soon';
  if (item.gift) return 'gift';
  if (run.fame < item.tier) return 'fame';
  if (run.money < item.price) return 'money';
  return 'buy';
}

// Buy an item: a new run with the money spent and the item owned (machines get a recipe
// card next morning). Returns null if it can't be bought.
export function buy(run, item) {
  if (shopState(item, run) !== 'buy') return null;
  return {
    ...run,
    money: run.money - item.price,
    owned: [...(run.owned ?? []), item.id],
    newItems: item.unlocks ? [...(run.newItems ?? []), item.id] : run.newItems ?? [],
  };
}

// A story gift (Uncle Tan's towel): owned without paying.
export const gift = (run, id) => (run.owned?.includes(id) ? run : { ...run, owned: [...(run.owned ?? []), id] });

// Everything owned, added up into one set of modifiers for the stall.
export function perks(owned = []) {
  const p = {
    pourMult: 1, stirMs: null, sugarScoop: false, milkPump: false, marked: false, autoCup: false, towel: false,
    plates: 3, tables: 1,
    patienceMult: 1, famePerDay: 0, hotTip: 0, icedTip: 0, tipMult: 1, queueBonus: 0, menuBoard: false, extraCustomers: 0,
    features: [],
  };
  for (const id of owned) {
    const item = itemById(id);
    if (!item) continue;
    const e = item.effect ?? {};
    if (e.pourMult) p.pourMult *= e.pourMult;
    if (e.patienceMult) p.patienceMult *= e.patienceMult;
    if (e.tipMult) p.tipMult *= e.tipMult;
    if (e.stirMs) p.stirMs = Math.min(p.stirMs ?? Infinity, e.stirMs);
    for (const k of ['famePerDay', 'hotTip', 'icedTip', 'queueBonus', 'extraCustomers']) p[k] += e[k] ?? 0;
    if (e.plates) p.plates = Math.max(p.plates, e.plates);
    if (e.tables) p.tables = Math.max(p.tables, e.tables);
    for (const k of ['sugarScoop', 'milkPump', 'marked', 'autoCup', 'towel', 'menuBoard']) p[k] ||= !!e[k];
    p.features.push(...(item.unlocks ?? []));
  }
  p.famePerDay = Math.round(p.famePerDay * 10) / 10;
  return p;
}

// The next thing to save up for (the day-end card and the night shop show it): the cheapest machine
// (a new drink) the player is famous enough for, else the cheapest anything. { item, short } with
// short = cents still to go (0 = can buy tonight), or { tier, unlocks } when everything in reach is owned.
export function nextGoal(run) {
  const open = SHOP.filter((i) => !i.gift && !i.soon && !run.owned?.includes(i.id));
  const reach = open.filter((i) => run.fame >= i.tier);
  const cheapest = (list) => list.reduce((a, b) => (b.price < a.price ? b : a));
  const machines = reach.filter((i) => i.aisle === 'machine');
  if (reach.length) {
    const item = cheapest(machines.length ? machines : reach);
    return { item, short: Math.max(0, item.price - run.money) };
  }
  const later = open.filter((i) => i.tier > run.fame);
  if (!later.length) return null;
  const tier = Math.min(...later.map((i) => i.tier));
  return { tier, unlocks: later.filter((i) => i.tier === tier).length };
}

// nextGoal as one line for the day-end card and the night shop.
export function goalText(goal) {
  if (!goal) return null;
  if (goal.tier) return `名气 ${goal.tier} unlocks ${goal.unlocks} more in the shop`;
  const { item, short } = goal;
  return short ? `Next: ${item.name} ${formatMoney(item.price)}, ${formatMoney(short)} to go` : `You can buy the ${item.name} tonight!`;
}
