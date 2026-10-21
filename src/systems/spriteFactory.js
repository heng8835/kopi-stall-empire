import { PALETTE, SPRITES } from '../data/sprites.js';

const W = 12;
const H = 16;

// Returns a list of problems with a pixel map (wrong size, unknown palette chars).
export function validateMap(name, map, palette = PALETTE) {
  const problems = [];
  if (map.length !== H) problems.push(`${name}: ${map.length} rows (want ${H})`);
  map.forEach((row, i) => {
    if (row.length !== W) problems.push(`${name} row ${i}: ${row.length} chars (want ${W})`);
    for (const ch of row) {
      if (ch !== '.' && !(ch in palette)) problems.push(`${name} row ${i}: unknown char "${ch}"`);
    }
  });
  return problems;
}

// Copy of a map with palette chars swapped, e.g. { u: 'h' } to recolour the drink.
export function tintVariant(map, swaps) {
  return map.map((row) => [...row].map((ch) => swaps[ch] ?? ch).join(''));
}

// Copy of a map with specific pixels overwritten: [[x, y, ch], ...].
export function stampPixels(map, pixels) {
  const rows = map.map((row) => [...row]);
  for (const [x, y, ch] of pixels) {
    if (rows[y] && x >= 0 && x < rows[y].length) rows[y][x] = ch;
  }
  return rows.map((r) => r.join(''));
}

// Draw one pixel map into a new canvas texture.
export function makeTexture(scene, key, map, palette = PALETTE) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const w = map[0]?.length ?? W;
  const tex = scene.textures.createCanvas(key, w, map.length);
  const ctx = tex.getContext();
  map.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.' || !palette[ch]) return;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(x, y, 1, 1);
    });
  });
  tex.refresh();
  return key;
}

// Build a texture for every sprite in SPRITES. Warns about malformed maps in dev.
export function buildTextures(scene) {
  for (const [name, map] of Object.entries(SPRITES)) {
    if (import.meta.env?.DEV) validateMap(name, map).forEach((p) => console.warn('[sprites]', p));
    makeTexture(scene, name, map);
  }
}
