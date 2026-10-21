import { CAST, PALETTE16 } from './castSamples.js';

const BIG = 6;
const root = document.getElementById('cast');

function drawMap(ctx, map, pal, ox, oy, scale) {
  map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.' || !pal[ch]) return;
      ctx.fillStyle = pal[ch];
      ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale);
    }),
  );
}

// Mini kopitiam strip at in-game scale (sprite x2, then x2 again like a phone's integer zoom).
function strip(sprites) {
  const sx = 2;
  const css = 2;
  const w = 20 + sprites.length * 36;
  const h = 64;
  const c = document.createElement('canvas');
  c.width = w * css;
  c.height = h * css;
  c.style.width = `${w * css}px`;
  const ctx = c.getContext('2d');
  ctx.scale(css, css);
  ctx.fillStyle = '#bfe6f5';
  ctx.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 10) {
    ctx.fillStyle = x % 20 ? '#dff1e4' : '#c9e6d2';
    ctx.fillRect(x, 30, 10, 18);
  }
  sprites.forEach(({ map, pal }, i) => drawMap(ctx, map, pal, 10 + i * 36, 4, sx));
  ctx.fillStyle = '#d18e55';
  ctx.fillRect(0, 48, w, 3);
  ctx.fillStyle = '#b5713f';
  ctx.fillRect(0, 51, w, h - 51);
  return c;
}

for (const member of CAST) {
  const sec = document.createElement('section');
  sec.innerHTML = `<h2>${member.name}</h2><p class="trait">${member.trait}</p>`;
  const row = document.createElement('div');
  row.className = 'row';

  const pals = member.variants.map((v) => ({ ...PALETTE16, ...(v.palette ?? {}) }));
  member.variants.forEach((v, i) => {
    const fig = document.createElement('figure');
    const c = document.createElement('canvas');
    c.className = 'big';
    c.width = 16 * BIG + 16;
    c.height = 24 * BIG + 8;
    drawMap(c.getContext('2d'), v.map, pals[i], 8, 4, BIG);
    fig.append(c);
    const cap = document.createElement('figcaption');
    cap.innerHTML = `<b>${v.key}</b> · ${v.label}<span>${v.note}</span>`;
    fig.append(cap);
    row.append(fig);
  });
  sec.append(row);

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = member.group ? 'In-game size, as a mixed group of 4:' : 'In-game size, behind the counter:';
  sec.append(label);
  const order = member.group ? [0, 1, 2, 1] : member.variants.map((_, i) => i);
  sec.append(strip(order.map((i) => ({ map: member.variants[i].map, pal: pals[i] }))));
  root.append(sec);
}
