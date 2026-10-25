// Cup model for hands-on drink making: what's physically in a cup, how pouring changes it,
// and how close it is to what the customer ordered. Pure functions, no Phaser.
import { TUNING, ZONES, LIQUID } from '../data/stallTuning.js';
import { formatOrder, MALT } from './order.js';

const BASES = ['kopi', 'teh', 'milo', 'horlicks'];
const MILKS = ['condensed', 'evap'];

export function newCup() {
  return { base: null, fill: 0, water: 0, sugar: 0, condensed: 0, evap: 0, ice: false, powder: false, stir: 0 };
}

// Pour `ingredient` for dtMs while the tool is held over the cup. Returns the cup (mutated).
export function pour(cup, ingredient, dtMs) {
  const amt = ((TUNING.pourPerSec[ingredient] ?? 0) * dtMs) / 1000;
  if (BASES.includes(ingredient)) {
    // A second, different base turns it into an accidental "cham" (mix).
    if (cup.base && cup.base !== ingredient && cup.fill > 0.05) cup.base = 'cham';
    else if (!cup.base) cup.base = ingredient;
    cup.fill += amt;
  } else if (ingredient === 'water') {
    // Hot water from the Big Brass Kettle: fills the cup, makes kopi / teh weaker (poh)
    cup.water += amt;
    cup.fill += amt;
  } else if (ingredient === 'sugar') cup.sugar += amt;
  else if (MILKS.includes(ingredient)) cup[ingredient] += amt;
  // Adding anything after stirring means it needs stirring again.
  if (ingredient === 'sugar' || MILKS.includes(ingredient)) cup.stir = Math.min(cup.stir, 0.5);
  return cup;
}

// Ice raises the level once, so a peng drink is poured to the ¾ line and then iced.
export function addIce(cup) {
  if (!cup.ice && cup.base) cup.fill += TUNING.iceVolume;
  cup.ice = true;
  return cup;
}
export const addPowder = (cup) => ((cup.powder = true), cup);

export function stirStep(cup) {
  const next = cup.stir + 1 / TUNING.stirWigglesNeeded;
  cup.stir = next > 0.999 ? 1 : next; // 6 x 1/6 is 0.9999… in floating point
  return cup;
}

export const isEmpty = (cup) => !cup.base && cup.water < 0.02 && cup.sugar < 0.02 && cup.condensed < 0.02 && cup.evap < 0.02;

// Hot water's share of the drink, ice not counted: 0 = all pot (gao), about half = poh.
export function waterShare(cup) {
  const liquid = cup.fill - (cup.ice ? TUNING.iceVolume : 0);
  return liquid > 0.01 ? Math.min(1, cup.water / liquid) : 0;
}
const hasMix = (cup) => cup.sugar > ZONES.trace || milkAmount(cup) > ZONES.trace;
export const needsStir = (cup) => hasMix(cup) && cup.stir < 1;

export function milkAmount(cup) {
  return cup.condensed + cup.evap;
}

// How sweet the cup is: the sugar can plus condensed milk (which is sweet itself).
export function sweetness(cup) {
  return cup.sugar + cup.condensed;
}

// Which milk is in the cup: null, 'condensed', 'evap' or 'mixed'.
export function milkType(cup) {
  const n = ZONES.trace;
  const c = cup.condensed > n;
  const e = cup.evap > n;
  return c && e ? 'mixed' : c ? 'condensed' : e ? 'evap' : null;
}

// Bucket a sweetness: 0 none (kosong), 2 less (siew dai), 4 normal, 6 more (ga dai), 8 too much.
// Same zones the pour bar shows, so one zone off = 2 steps.
export function sugarBucket(x) {
  const z = ZONES.sugar;
  if (x < z.none[1]) return 0;
  if (x < z.less[1]) return 2;
  if (x < z.normal[1]) return 4;
  if (x < z.more[1]) return 6;
  return 8;
}

const SUGAR_IDX = { none: 0, less: 2, normal: 4, more: 6 };
const SUGAR_WORD = { none: 'kosong', less: 'siew dai', normal: 'normal sweet', more: 'ga dai' };

// Compare a cup with an order spec (from parseOrder). Returns { tier, reasons }.
export function gradeCup(cup, spec) {
  const oops = [];
  const close = [];

  if (!cup.base) oops.push('nothing in the cup');
  else if (cup.base !== spec.base) oops.push(cup.base === 'cham' ? 'kopi and teh mixed' : `${cup.base} instead of ${spec.base}`);

  const fill = cup.fill;
  if (cup.base) {
    if (fill > ZONES.fill.spill) close.push('spilled over');
    else if (fill < ZONES.fill.good[0]) close.push(fill < 0.5 ? 'cup half empty' : 'not quite full');
    else if (fill > ZONES.fill.good[1]) close.push('a bit too full');
  }

  if (!MALT.includes(spec.base)) {
    // Milk
    const want = spec.milk === 'none' ? null : spec.milk;
    const got = milkType(cup);
    if (got === 'mixed') oops.push('two kinds of milk');
    else if (want !== got) oops.push(!got ? 'forgot the milk' : !want ? 'should be no milk (O)' : got === 'evap' ? 'evaporated milk instead of condensed' : 'condensed milk instead of evaporated (C)');
    else if (want === 'evap') {
      // (condensed milk is judged as sweetness below)
      const m = milkAmount(cup);
      if (m < ZONES.milk.normal[0]) close.push('not enough milk');
      else if (m > ZONES.milk.normal[1]) close.push('too much milk');
    }

    // Sweetness: condensed milk for Kopi / Teh, the sugar can for O and C
    const sweet = sugarBucket(sweetness(cup));
    const diff = Math.abs(sweet - SUGAR_IDX[spec.sugar]);
    if (diff > 0) {
      const sweeter = sweet > SUGAR_IDX[spec.sugar];
      const msg = sweeter ? `too sweet for ${SUGAR_WORD[spec.sugar]}` : `not sweet enough for ${SUGAR_WORD[spec.sugar]}`;
      (diff <= 2 ? close : oops).push(msg); // one zone off is close, two or more is oops
    }
  }

  if (!MALT.includes(spec.base) && cup.base) {
    // Strength (Big Brass Kettle): poh needs hot water, gao none at all, normal tolerates a splash
    const w = waterShare(cup);
    const want = spec.strength ?? 'normal';
    if (want === 'poh' && w < ZONES.water.poh[0]) close.push('not poh: needs hot water');
    else if (want === 'poh' && w > ZONES.water.poh[1]) close.push('too watery, even for poh');
    else if (want === 'gao' && w > ZONES.water.gao) close.push('gao means no water');
    else if (want === 'normal' && w >= ZONES.water.poh[0]) close.push('too watery');
  }

  if (!!spec.iced !== cup.ice) close.push(spec.iced ? 'forgot the ice (peng)' : 'should be hot, not iced');
  if (!!spec.topping !== cup.powder) close.push(spec.topping ? 'forgot the powder on top' : 'extra powder on top');
  if (needsStir(cup)) close.push('forgot to stir');

  const reasons = [...oops, ...close];
  const tier = oops.length || close.length >= 3 ? 'oops' : close.length ? 'close' : 'perfect';
  return { tier, reasons };
}

// Describe a cup in kopitiam lingo (for the label under each cup and the playtest log).
export function formatCup(cup) {
  if (isEmpty(cup)) return 'empty cup';
  if (!cup.base) return 'no kopi or teh yet';
  const s = sugarBucket(sweetness(cup));
  const sugar = s <= 1 ? 'none' : s <= 3 ? 'less' : s <= 5 ? 'normal' : 'more';
  const mt = milkType(cup);
  const milk = mt === 'evap' ? 'evap' : mt === 'condensed' ? 'condensed' : 'none';
  const strength = waterShare(cup) >= ZONES.water.poh[0] ? 'poh' : 'normal';
  let text = MALT.includes(cup.base) ? formatOrder({ base: cup.base, iced: cup.ice, topping: cup.powder }) : formatOrder({ base: cup.base, milk, sugar, strength, iced: cup.ice });
  const notes = [];
  if (cup.fill < ZONES.fill.good[0]) notes.push('not full');
  if (s === 8) notes.push('too sweet');
  if (mt === 'mixed') notes.push('2 milks');
  if (needsStir(cup)) notes.push('unstirred');
  if (notes.length) text += ` (${notes.join(', ')})`;
  return text;
}

// Liquid colour for drawing: base colour, lightened by milk.
export function liquidColor(cup) {
  const base = LIQUID[cup.base] ?? LIQUID.kopi;
  const m = Math.min(1, milkAmount(cup) / 1.6 + waterShare(cup) * 0.35); // hot water thins it a little
  const milk = cup.evap > cup.condensed ? LIQUID.evap : LIQUID.condensed;
  const mix = (a, b, t) => Math.round(a + (b - a) * t);
  const ch = (c, s) => (c >> s) & 0xff;
  return (mix(ch(base, 16), ch(milk, 16), m) << 16) | (mix(ch(base, 8), ch(milk, 8), m) << 8) | mix(ch(base, 0), ch(milk, 0), m);
}
