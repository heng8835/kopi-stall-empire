import { PALETTE, SPRITES } from '../data/sprites.js';
import { validateMap } from '../systems/spriteFactory.js';

const SCALE = 8;
const grid = document.getElementById('grid');

for (const [name, map] of Object.entries(SPRITES)) {
  const canvas = document.createElement('canvas');
  canvas.width = map[0].length * SCALE;
  canvas.height = map.length * SCALE;
  const ctx = canvas.getContext('2d');
  map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.' || !PALETTE[ch]) return;
      ctx.fillStyle = PALETTE[ch];
      ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    }),
  );

  const fig = document.createElement('figure');
  const caption = document.createElement('figcaption');
  caption.textContent = name;
  fig.append(canvas, caption);
  for (const p of validateMap(name, map)) {
    const w = document.createElement('div');
    w.className = 'warn';
    w.textContent = p;
    fig.append(w);
  }
  grid.append(fig);
}
