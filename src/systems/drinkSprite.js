import { PALETTE, SPRITES } from '../data/sprites.js';
import { OFF_MENU_LIQUID } from '../data/drinks.js';
import { makeTexture, stampPixels } from './spriteFactory.js';
import { findDrink } from './order.js';

// Every drink is the kopiC cup map with the liquid ('u') recoloured,
// steam removed + ice cubes added when peng, and a powder mound for Milo Dinosaur.

const EXTRA = { I: '#e6f6ff', P: '#7a5236' };
const EMPTY = '#e8e2d6';
const STEAM = [[4, 7], [6, 7], [3, 8], [5, 8]];
const ICE = [[3, 10, 'I'], [6, 10, 'I'], [4, 9, 'I']];
const POWDER = [[3, 9, 'P'], [4, 9, 'P'], [5, 9, 'P'], [6, 9, 'P'], [7, 9, 'P'], [4, 8, 'P'], [5, 8, 'P'], [6, 8, 'P'], [5, 7, 'P']];

export function liquidColour(spec) {
  if (!spec?.base) return EMPTY;
  return findDrink(spec)?.liquid ?? OFF_MENU_LIQUID[spec.base] ?? EMPTY;
}

export function cupKey(spec) {
  if (!spec?.base) return 'cup:empty';
  return `cup:${spec.base}-${spec.milk}-${spec.iced ? 1 : 0}-${spec.topping ? 1 : 0}`;
}

// Returns a texture key for this drink, building it on first use.
export function ensureCupTexture(scene, spec) {
  const key = cupKey(spec);
  if (scene.textures.exists(key)) return key;

  let map = SPRITES.kopiC;
  if (spec?.iced) {
    map = stampPixels(map, STEAM.map(([x, y]) => [x, y, '.']));
    map = stampPixels(map, ICE);
  }
  if (spec?.topping) {
    map = stampPixels(map, STEAM.map(([x, y]) => [x, y, '.']));
    map = stampPixels(map, POWDER);
  }
  if (!spec?.base) map = stampPixels(map, STEAM.map(([x, y]) => [x, y, '.']));

  makeTexture(scene, key, map, { ...PALETTE, ...EXTRA, u: liquidColour(spec) });
  return key;
}
