// Teh tarik as a skill (round 5: "every machine is just one more drop"): hold to lift the mug high,
// let go in the green band. A good pull froths a third of the cup, a short or too-high one only half
// that. Three good pulls in a row is a tarik master's cup. Pure, no Phaser (StallScene.openTarik plays it).
import { TUNING } from '../data/stallTuning.js';

// How high the mug is after holding this long: 0 = at the rim, 1 = the top of the meter, above 1 = too high.
export const pullHeight = (ms, riseMs = TUNING.tarik.riseMs) => ms / riseMs;

// 'good' (let go in the band), 'short' (too early), 'splash' (held past the top).
export function gradePull(h, band = TUNING.tarik.band) {
  if (h > 1) return 'splash';
  return h >= band[0] ? 'good' : 'short';
}

// Froth from one pull; it mixes the cup as well as stirring does.
export function pullCup(cup, grade) {
  const add = grade === 'good' ? TUNING.tarik.good : TUNING.tarik.half;
  const next = cup.froth + add;
  cup.froth = next > 0.999 ? 1 : next;
  cup.stir = Math.max(cup.stir, cup.froth);
  cup.pulls = [...(cup.pulls ?? []), grade];
  cup.tarikMaster = cup.froth >= 1 && cup.pulls.every((g) => g === 'good');
  return cup;
}
