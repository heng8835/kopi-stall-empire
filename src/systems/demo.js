// The "watch first" demo: the steps a ghost hand takes to make an order, in the same words as the
// pour bar and the coach. Pure, no Phaser; StallScene.runDemo plays them with the real tools.
import { ZONES } from '../data/stallTuning.js';
import { MALT } from './order.js';
import { sweetness } from './cup.js';

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
//   { do: 'stir' } · { do: 'ice' } · { do: 'powder' } · { do: 'serve' }
// Each has `say`: the line the owner's thought bubble shows.
export function demoSteps(spec) {
  const full = spec.iced ? mid(ZONES.fill.peng) : mid(ZONES.fill.good);
  const zone = spec.iced ? '¾ PENG' : 'FULL';
  const steps = [{ do: 'cup', say: 'First, a clean cup from the rack' }];
  if (spec.base === 'cham') {
    steps.push({ do: 'pour', tool: 'kopi', measure: 'fill', until: full / 2, say: 'Cham: kopi pot to about half' });
    steps.push({ do: 'pour', tool: 'teh', measure: 'fill', until: full, say: `Then the teh pot on top, to ${zone}` });
  } else if (spec.strength === 'poh') {
    steps.push({ do: 'pour', tool: spec.base, measure: 'fill', until: full * 0.53, say: `Poh: ${POT[spec.base].toLowerCase()} only to about HALF` });
    steps.push({ do: 'pour', tool: 'water', measure: 'fill', until: full, say: `Hot water from the kettle to ${zone}` });
  } else {
    steps.push({ do: 'pour', tool: spec.base, measure: 'fill', until: full, say: `${POT[spec.base]} to ${zone}${spec.strength === 'gao' ? ', no water (gao)' : ''}` });
  }
  if (!MALT.includes(spec.base)) {
    const sweet = { measure: 'sweet', until: mid(ZONES.sugar[spec.sugar] ?? [0, 0]) };
    if (spec.milk === 'condensed') steps.push({ do: 'pour', tool: 'condensed', ...sweet, say: `Condensed milk to ${SWEET[spec.sugar]}: it IS the sweetness` });
    if (spec.milk === 'evap') steps.push({ do: 'pour', tool: 'evap', measure: 'evap', until: mid(ZONES.milk.normal), say: 'Evaporated milk to C · NORMAL' });
    if (spec.milk !== 'condensed' && spec.sugar !== 'none') steps.push({ do: 'pour', tool: 'sugar', ...sweet, say: `Sugar to ${SWEET[spec.sugar]}` });
    if (spec.milk !== 'none' || spec.sugar !== 'none') steps.push({ do: 'stir', say: 'Drop the spoon on the cup: it stirs' });
  }
  if (spec.iced) steps.push({ do: 'ice', say: `Ice in: it tops the ¾ up to FULL` });
  if (spec.topping) steps.push({ do: 'powder', say: 'Shake the powder on top. No stirring!' });
  steps.push({ do: 'serve', say: 'Done! Now you: drag the cup to the customer' });
  return steps;
}

