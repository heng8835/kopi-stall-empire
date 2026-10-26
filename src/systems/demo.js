// The "watch first" demo: the steps a ghost hand takes to make an order. Pure, no Phaser;
// StallScene.runDemo plays them with the real tools while the customer says each `teach` line in
// their chat bubble (the coach shows the short `say`).
import { ZONES, TUNING } from '../data/stallTuning.js';
import { MALT } from './order.js';
import { sweetness, newCup, pour, stirStep, tarikStep, addIce, addPowder } from './cup.js';

const mid = ([a, b]) => (a + b) / 2;
const SWEET = { none: 'KOSONG', less: 'SIEW DAI', normal: 'NORMAL', more: 'GA DAI' };
const POT = { kopi: 'Kopi pot', teh: 'Teh pot', milo: 'Milo tin', horlicks: 'Horlicks tin' };

// How far along a pour is, for each kind of target.
export const MEASURE = {
  fill: (cup) => cup.fill,
  sweet: (cup) => sweetness(cup),
  evap: (cup) => cup.evap,
};

// Steps for an order spec (from parseOrder):
//   { do: 'cup' }                                  take a cup from the rack
//   { do: 'pour', tool, measure, until }           hold the tool over the cup until MEASURE[measure] >= until
//   { do: 'stir' } · { do: 'tarik' } · { do: 'ice' } · { do: 'powder' } · { do: 'serve' }
// Each has `say` (short, for the thought bubble) and `teach` (the customer's own words).
export function demoSteps(spec) {
  const full = spec.iced ? mid(ZONES.fill.peng) : mid(ZONES.fill.good);
  const zone = spec.iced ? '¾ PENG' : 'FULL';
  const upTo = spec.iced ? 'only until ¾ ah, the ice will top it up' : 'until FULL';
  const steps = [{ do: 'cup', say: 'A clean cup from the rack', teach: 'First, take a cup from the rack ah.' }];
  if (spec.base === 'cham') {
    steps.push({ do: 'pour', tool: 'kopi', measure: 'fill', until: full / 2, zone: 'HALF', say: 'Kopi pot to about half', teach: 'Cham is kopi and teh together. Kopi first, half cup.' });
    steps.push({ do: 'pour', tool: 'teh', measure: 'fill', until: full, zone, say: `Teh pot on top to ${zone}`, teach: `Then teh on top, ${upTo}.` });
  } else if (spec.strength === 'poh') {
    steps.push({ do: 'pour', tool: spec.base, measure: 'fill', until: full * 0.53, zone: 'HALF', say: `${POT[spec.base]} to about HALF`, teach: `Poh means weak. ${POT[spec.base]} only half ah.` });
    steps.push({ do: 'pour', tool: 'water', measure: 'fill', until: full, zone, say: `Hot water to ${zone}`, teach: `Then hot water from the kettle, ${upTo}.` });
  } else {
    const gao = spec.strength === 'gao' ? ' No water, gao means strong!' : '';
    steps.push({ do: 'pour', tool: spec.base, measure: 'fill', until: full, zone, say: `${POT[spec.base]} to ${zone}`, teach: `${POT[spec.base]}, pour ${upTo}.${gao}` });
  }
  if (!MALT.includes(spec.base)) {
    const sweet = { measure: 'sweet', until: mid(ZONES.sugar[spec.sugar] ?? [0, 0]) };
    const S = SWEET[spec.sugar];
    if (spec.milk === 'condensed') steps.push({ do: 'pour', tool: 'condensed', ...sweet, zone: S, say: `Condensed milk to ${S}`, teach: `Condensed milk until ${S}. That one is the sweet, you know.` });
    if (spec.milk === 'evap') steps.push({ do: 'pour', tool: 'evap', measure: 'evap', until: mid(ZONES.milk.normal), zone: 'C', say: 'Evap milk to C · NORMAL', teach: 'C means evap milk. Pour until C NORMAL.' });
    if (spec.milk !== 'condensed' && spec.sugar !== 'none') {
      const why = spec.milk === 'none' ? 'O means no milk, so the sugar is the sweet.' : 'Then sugar for the sweet.';
      steps.push({ do: 'pour', tool: 'sugar', ...sweet, zone: S, say: `Sugar to ${S}`, teach: `${why} Until ${S}.` });
    }
    if (spec.tarik) steps.push({ do: 'tarik', say: 'Tarik: pull until frothy', teach: 'Now tarik! Pull high high until got foam.' });
    else if (spec.milk !== 'none' || spec.sugar !== 'none') steps.push({ do: 'stir', say: 'Spoon on the cup: stir', teach: 'Spoon in, stir stir.' });
  }
  if (spec.iced) steps.push({ do: 'ice', say: 'Ice in: ¾ becomes FULL', teach: 'Ice in. See? ¾ become FULL.' });
  if (spec.topping) steps.push({ do: 'powder', say: 'Powder on top, no stirring', teach: 'Powder on top, big big mountain. Don\'t stir!' });
  steps.push({ do: 'serve', say: 'Your turn: serve it', teach: 'OK lah! Now pass me the cup.' });
  return steps;
}

// The cup the demo makes, done instantly (for the new-order card's picture of the drink).
export function demoCup(spec) {
  let cup = newCup();
  for (const s of demoSteps(spec)) {
    if (s.do === 'pour') for (let i = 0; i < 400 && MEASURE[s.measure](cup) < s.until; i++) pour(cup, s.tool, 16);
    if (s.do === 'stir') for (let i = 0; i < TUNING.stirWigglesNeeded; i++) stirStep(cup);
    if (s.do === 'tarik') for (let i = 0; i < TUNING.tarikPullsNeeded; i++) tarikStep(cup);
    if (s.do === 'ice') addIce(cup);
    if (s.do === 'powder') addPowder(cup);
  }
  return cup;
}

// An order as its combination, for the new-order card: [{ tool, zone }] in the order you use them
// (tool = the stall tool id: kopi, teh, water, condensed, evap, sugar, stir, tarik, ice, powder).
export function comboFor(spec) {
  const label = { stir: 'stir', tarik: 'pull', ice: 'ice', powder: 'on top' };
  return demoSteps(spec)
    .filter((s) => s.do !== 'cup' && s.do !== 'serve')
    .map((s) => ({ tool: s.do === 'pour' ? s.tool : s.do, zone: s.zone ?? label[s.do] }));
}
