// The recipe hint under each order bubble, in the same words as the pour bar zones.
// "Teh C siew dai peng" -> "Teh ¾ · evap C · sugar SIEW DAI · stir · ice". Pure, no Phaser.
import { ZONES } from '../data/stallTuning.js';
import { sweetness, sugarBucket, needsStir, waterShare, gradeCup } from './cup.js';

const SWEET = { none: 'KOSONG', less: 'SIEW DAI', normal: 'NORMAL', more: 'GA DAI' };

export function recipeHint(spec) {
  const pot = spec.iced ? '¾' : 'FULL';
  const bag = spec.tapau && 'bag it';
  if (spec.base === 'milo' || spec.base === 'horlicks') {
    const name = spec.base === 'milo' ? 'Milo' : 'Horlicks';
    return [`${name} ${pot}`, spec.iced && 'ice', spec.topping && 'powder on top', spec.scoop && 'ice cream', bag].filter(Boolean).join(' · ');
  }
  if (spec.layered) return ['gula melaka NORMAL', 'evap C', 'teh FULL', 'no stirring!', bag].filter(Boolean).join(' · ');
  const name = { kopi: 'Kopi', teh: 'Teh', cham: 'Kopi + teh' }[spec.base];
  const steps = [`${name} ${pot}`];
  if (spec.strength === 'poh') steps.splice(0, 1, `${name} ½`, 'hot water FULL');
  if (spec.strength === 'gao') steps.push('no water');
  if (spec.milk === 'condensed') steps.push(`condensed ${SWEET[spec.sugar]}`);
  else {
    steps.push(spec.milk === 'evap' ? 'evap C' : 'no milk');
    steps.push(spec.sugar === 'none' ? 'no sugar' : `sugar ${SWEET[spec.sugar]}`);
  }
  if (spec.halia) steps.push('halia');
  if (spec.limau) steps.push('limau');
  if (spec.butter) steps.push('butter');
  if (spec.tarik) steps.push('tarik');
  else if (spec.milk !== 'none' || spec.sugar !== 'none') steps.push('stir');
  if (spec.iced) steps.push('ice');
  if (bag) steps.push(bag);
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
  const zone = peng ? '¾ +ICE' : 'FULL';
  const fill = cup.ice ? cup.fill - 0.25 : cup.fill; // judge the pour before the ice went in
  const malt = MALTS.includes(spec.base);
  const extrasNext = () => {
    // ginger / limau / butter go in before the ice; then ice cream on top; the bag last of all
    for (const [k, say] of [['halia', 'Halia: drop the ginger in'], ['limau', 'Limau: squeeze the calamansi in'], ['butter', 'Gu you: drop the butter in']]) {
      if (spec[k] && !cup[k]) return { text: say };
    }
    return null;
  };
  const finish = () => {
    if (spec.scoop && !cup.scoop) return { text: 'Godzilla: a scoop of ice cream on top!' };
    if (spec.tapau && !cup.tapau) return { text: 'Tapau: drop a bag on the cup' };
    // only a cup that would really please them is "done" (round 5: a gu you made with sugar still said Done)
    const { tier, reasons } = gradeCup(cup, spec);
    if (tier === 'oops') return { text: `Not right yet: ${reasons[0] ?? 'not their drink'}. Bin it and try again`, bin: true };
    return { text: `Done! Drag it to ${who}` };
  };

  // Teh C Special: three layers from the bottom up, and no spoon
  if (spec.layered) {
    if (cup.stir > 0 || cup.froth > 0) return { text: 'Stirred! The layers are gone. Bin it and try again', bin: true };
    if (cup.base && cup.base !== 'teh') return { text: 'Wrong drink in this cup! Drag it to the bin', bin: true };
    if (cup.condensed > ZONES.trace || cup.sugar > ZONES.trace) return { text: 'Special uses gula melaka, not milk or sugar! Bin it', bin: true };
    const g = cup.gula ?? 0;
    if (g < ZONES.sugar.normal[0]) return cup.base || cup.evap > ZONES.trace ? { text: 'Gula melaka goes in FIRST. Bin it and start again', bin: true } : { text: 'Layer 1: drop the gula melaka (counter) on the cup, tap the dial at NORMAL' };
    if (g >= ZONES.sugar.normal[1]) return { text: 'Too much gula melaka! Bin it and try again', bin: true };
    if (cup.evap < ZONES.milk.normal[0]) return cup.base ? { text: 'Evap goes in before the teh. Bin it and start again', bin: true } : { text: 'Layer 2: evap milk till C · NORMAL' };
    if (!cup.base || fill < lo) return { text: `Layer 3: teh pot gently till ${zone}. Don't stir!` };
    if (cup.fill > ZONES.fill.spill) return { text: 'Spilled! Bin it and try again', bin: true };
    if (peng && !cup.ice) return { text: 'Drop the ice in (it tops up to FULL)' };
    return finish();
  }

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
  // sugar or milk in first is how a real uncle does it too: fine, the pot goes on top
  const first = !cup.base && !malt && (cup.sugar > ZONES.trace || cup.condensed > ZONES.trace || cup.evap > ZONES.trace);
  const potName = spec.base === 'cham' ? 'pot' : POT[spec.base];
  if (first) return { text: `${cup.sugar > ZONES.trace ? 'Sugar' : 'Milk'} first, like the uncles! Now the ${potName} till ${zone}` };
  if (!cup.base || fill < lo) return { text: `Hold the ${potName} over the cup till ${zone}` };
  if (cup.fill > ZONES.fill.spill || (peng && !cup.ice && fill >= hi + 0.03)) return { text: peng ? 'Too full for peng! Bin it and pour to ¾' : 'Spilled! Bin it and try again', bin: true };

  if (!malt) {
    const want = SWEET_IDX[spec.sugar];
    const sweet = sugarBucket(sweetness(cup));
    const target = { 0: 'KOSONG', 2: 'SIEW DAI', 4: 'NORMAL', 6: 'GA DAI' }[want];
    if (spec.milk === 'none' && cup.condensed + cup.evap > ZONES.trace) return { text: '"O" means no milk! Bin it and try again', bin: true };
    if (spec.milk === 'evap' && cup.condensed > ZONES.trace) return { text: '"C" is the evap can, not condensed! Bin it', bin: true };
    if (spec.milk === 'condensed' && cup.evap > ZONES.trace) return { text: 'Plain kopi / teh uses condensed, not evap! Bin it', bin: true };
    if (spec.milk === 'condensed' && cup.condensed <= ZONES.trace && sweet >= want && want > 0) return { text: 'Plain kopi / teh is sweetened with condensed milk, not sugar! Bin it', bin: true };
    if (spec.milk === 'condensed' && sweet < want)return { text: `Condensed milk till ${target} (it's the sweetness)` };
    if (spec.milk === 'evap' && cup.evap < ZONES.milk.normal[0]) return { text: 'Evap milk till C · NORMAL' };
    if (spec.milk !== 'condensed' && sweet < want) return { text: `Sugar till ${target}` };
    if (sweet > want) return { text: `Too sweet for ${target.toLowerCase()}! Bin it and try again`, bin: true };
    const extra = extrasNext();
    if (extra) return extra;
    if (spec.tarik && cup.froth < 1) return { text: 'Tarik! Drop the mugs on the cup (or pull them up and down over it)' };
    if (needsStir(cup)) return { text: 'Drop the spoon on the cup to stir' };
  }
  if (peng && !cup.ice) return { text: 'Drop the ice in (it tops up to FULL)' };
  if (spec.topping && !cup.powder) return { text: 'Shake the powder on top' };
  return finish();
}
