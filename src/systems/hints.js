// The recipe hint under each order bubble, in the same words as the pour bar zones.
// "Teh C siew dai peng" -> "Teh ¾ · evap C · sugar SIEW DAI · stir · ice". Pure, no Phaser.
import { ZONES } from '../data/stallTuning.js';
import { sweetness, sugarBucket, needsStir, waterShare } from './cup.js';

const SWEET = { none: 'KOSONG', less: 'SIEW DAI', normal: 'NORMAL', more: 'GA DAI' };

export function recipeHint(spec) {
  const pot = spec.iced ? '¾' : 'FULL';
  if (spec.base === 'milo' || spec.base === 'horlicks') {
    const name = spec.base === 'milo' ? 'Milo' : 'Horlicks';
    return [`${name} ${pot}`, spec.iced && 'ice', spec.topping && 'powder on top'].filter(Boolean).join(' · ');
  }
  const name = { kopi: 'Kopi', teh: 'Teh', cham: 'Kopi + teh' }[spec.base];
  const steps = [`${name} ${pot}`];
  if (spec.strength === 'poh') steps.splice(0, 1, `${name} ½`, 'hot water FULL');
  if (spec.strength === 'gao') steps.push('no water');
  if (spec.milk === 'condensed') steps.push(`condensed ${SWEET[spec.sugar]}`);
  else {
    steps.push(spec.milk === 'evap' ? 'evap C' : 'no milk');
    steps.push(spec.sugar === 'none' ? 'no sugar' : `sugar ${SWEET[spec.sugar]}`);
  }
  if (spec.milk !== 'none' || spec.sugar !== 'none') steps.push('stir');
  if (spec.iced) steps.push('ice');
  return steps.join(' · ');
}

// ---------- the coach: the next step for a ticketed cup ----------

const POT = { kopi: 'kopi pot', teh: 'teh pot', milo: 'Milo tin', horlicks: 'Horlicks tin' };
const SWEET_IDX = { none: 0, less: 2, normal: 4, more: 6 };
const MALTS = ['milo', 'horlicks'];

// What to do next with this cup for this order, in plain words (the owner's self-talk).
// who = the customer's name. Returns { text, bin } (bin: the cup can't be saved).
export function nextStep(cup, spec, who) {
  const peng = spec.iced;
  const [lo, hi] = peng ? ZONES.fill.peng : ZONES.fill.good;
  const zone = peng ? '¾ PENG' : 'FULL';
  const fill = cup.ice ? cup.fill - 0.25 : cup.fill; // judge the pour before the ice went in
  const malt = MALTS.includes(spec.base);

  // the base
  if (spec.base === 'cham') {
    if (!cup.base) return { text: 'Cham: kopi pot first, about half the cup' };
    if (cup.base === 'kopi') return { text: `Now the teh pot on top, till ${zone}` };
    if (cup.base === 'teh') return { text: `Now the kopi pot on top, till ${zone}` };
  }
  if (cup.base && cup.base !== spec.base) return { text: 'Wrong drink in this cup! Drag it to the bin', bin: true };
  // strength (Big Brass Kettle): poh = pot to half, then hot water; gao = no water at all
  if (!malt) {
    const pot = cup.fill - cup.water - (cup.ice ? 0.25 : 0);
    if (spec.strength === 'poh') {
      if (!cup.base || pot < ZONES.pohPot[0]) return { text: `Poh = weak: ${POT[spec.base] ?? 'pot'} to about HALF` };
      if (pot > ZONES.pohPot[1] + 0.05) return { text: 'Too much kopi for poh! Bin it and pour to half', bin: true };
      if (fill < lo) return { text: `Hot water kettle (rail) till ${zone}` };
    } else if (spec.strength === 'gao' && waterShare(cup) > ZONES.water.gao) {
      return { text: 'Gao = no water! Bin it and try again', bin: true };
    } else if (waterShare(cup) >= ZONES.water.poh[0]) {
      return { text: 'Too watery! Bin it and try again', bin: true };
    }
  }
  if (!cup.base || fill < lo) return { text: `Hold the ${spec.base === 'cham' ? 'pot' : POT[spec.base]} over the cup till ${zone}` };
  if (cup.fill > ZONES.fill.spill || (peng && !cup.ice && fill >= hi + 0.03)) return { text: peng ? 'Too full for peng! Bin it and pour to ¾' : 'Spilled! Bin it and try again', bin: true };

  if (!malt) {
    const want = SWEET_IDX[spec.sugar];
    const sweet = sugarBucket(sweetness(cup));
    const target = { 0: 'KOSONG', 2: 'SIEW DAI', 4: 'NORMAL', 6: 'GA DAI' }[want];
    if (spec.milk === 'none' && cup.condensed + cup.evap > ZONES.trace) return { text: '"O" means no milk! Bin it and try again', bin: true };
    if (spec.milk === 'evap' && cup.condensed > ZONES.trace) return { text: '"C" is the evap can, not condensed! Bin it', bin: true };
    if (spec.milk === 'condensed' && cup.evap > ZONES.trace) return { text: 'Plain kopi / teh uses condensed, not evap! Bin it', bin: true };
    if (spec.milk === 'condensed' && sweet < want) return { text: `Condensed milk till ${target} (it's the sweetness)` };
    if (spec.milk === 'evap' && cup.evap < ZONES.milk.normal[0]) return { text: 'Evap milk till C · NORMAL' };
    if (spec.milk !== 'condensed' && sweet < want) return { text: `Sugar till ${target}` };
    if (sweet > want) return { text: `Too sweet for ${target.toLowerCase()}! Bin it and try again`, bin: true };
    if (needsStir(cup)) return { text: 'Drop the spoon on the cup to stir' };
  }
  if (peng && !cup.ice) return { text: 'Drop the ice in (it tops up to FULL)' };
  if (spec.topping && !cup.powder) return { text: 'Shake the powder on top' };
  return { text: `Done! Drag it to ${who}` };
}
