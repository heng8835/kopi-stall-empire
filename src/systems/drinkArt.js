// HD drink art for one cup on the tray: the liquid drawn inside the glass sprite on a canvas at the
// glass's own resolution (3x logical), so it stays as sharp as the art. Ported from the approved
// preview (docs/plan/pour-prototype.src.html): mug-perspective surface, slosh, pour stream,
// milk layer / clouds, sugar grains, ice splash, soft steam, condensation, Milo powder.
// Units below are glass-sprite pixels (cupGlass.png is 150 x 186).
import { ZONES } from '../data/stallTuning.js';
import { milkAmount, needsStir } from './cup.js';

const M = 26; // side margin (spill, steam drift)
const TOP = 170; // room above the glass for the stream, steam and the Milo mountain
const BOT = 10;
export const ART_W = 150 + M * 2;
export const ART_H = TOP + 186 + BOT;
// where the glass's bottom centre sits in the canvas (for the image origin)
export const ART_ORIGIN = { x: (M + 75) / ART_W, y: (TOP + 186) / ART_H };

// Inside of the mug, measured from the sprite: the surface oval at FULL is centred at y 42,
// the inside base oval at y 151; walls at those heights. Ovals are 0.28 as tall as wide.
const IN = { top: 42, bottom: 151, l0: 15, r0: 107, l1: 24, r1: 98 };
const PERSP = 0.28;
const X = (x) => M + x;
const Y = (y) => TOP + y;
const wallAt = (y) => {
  const t = (y - IN.top) / (IN.bottom - IN.top);
  return [IN.l0 + (IN.l1 - IN.l0) * t, IN.r0 + (IN.r1 - IN.r0) * t];
};
const levelY = (fill) => IN.bottom - (IN.bottom - IN.top) * Math.min(fill, ZONES.fill.spill);
const oval = (y) => {
  const [l, r] = wallAt(y);
  const rx = (r - l) / 2;
  return { cx: X((l + r) / 2), cy: Y(y), rx, ry: rx * PERSP };
};

// Drink colours (stirred, normal milk). Kopi O near-black; Kopi golden caramel; Kopi C lighter,
// creamier and a touch greyer (more evaporated milk, which is whiter); Teh O amber-red; Teh orange
// caramel; Teh C peachy beige; Milo chocolate.
const NO_MILK = { kopi: [42, 24, 16], teh: [122, 58, 20], milo: [94, 61, 43], cham: [78, 40, 22], horlicks: [214, 188, 147] };
const WITH_MILK = {
  condensed: { kopi: [150, 96, 50], teh: [196, 122, 64], milo: [140, 100, 72], cham: [164, 104, 58] },
  evap: { kopi: [168, 124, 84], teh: [206, 152, 106], milo: [150, 112, 84], cham: [176, 124, 84] },
};
const MILK = { condensed: [243, 226, 192], evap: [247, 240, 228] };
export const STREAM = { kopi: [52, 30, 18], teh: [140, 66, 22], milo: [94, 61, 43], horlicks: [214, 188, 147], condensed: [243, 226, 192], evap: [250, 245, 236] };

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const shade = (c, k) => c.map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export function drinkColor(cup) {
  const base = NO_MILK[cup.base] ?? NO_MILK.kopi;
  const m = milkAmount(cup);
  if (m < 0.02) return base;
  const kind = cup.evap > cup.condensed ? 'evap' : 'condensed';
  const target = WITH_MILK[kind][cup.base] ?? WITH_MILK[kind].kopi;
  let c = mix(base, target, Math.min(1, m / 0.9));
  // more milk only lightens a little (ga dai condensed milk is still a caramel kopi); way too much goes pale
  if (m > 0.9) c = mix(c, MILK[kind], Math.min(0.35, ((m - 0.9) / 1.2) * 0.35));
  return c;
}

// Pixel-art helpers shared by every cup (built once from the loaded textures).
let shared = null;
function sharedArt(scene) {
  if (shared) return shared;
  const glass = scene.textures.get('cupGlass').getSourceImage();
  const ice = scene.textures.get('iceCluster').getSourceImage();
  // only the glass's bright reflections, laid back over the drink so it sits "behind" the glass
  const c = document.createElement('canvas');
  c.width = glass.width;
  c.height = glass.height;
  const x = c.getContext('2d');
  x.drawImage(glass, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    const l = d.data[i] * 0.3 + d.data[i + 1] * 0.59 + d.data[i + 2] * 0.11;
    const a = Math.max(0, (l - 195) / 60) * (d.data[i + 3] / 255); // only the brightest streaks
    d.data[i] = d.data[i + 1] = d.data[i + 2] = 255;
    d.data[i + 3] = Math.round(255 * Math.min(1, a));
  }
  x.putImageData(d, 0, 0);
  // scale the glass to the canvas's 150 x 186 units whatever its file size
  shared = { glass, ice, shine: c, gw: 150, gh: 186 };
  return shared;
}

export class DrinkArt {
  constructor(scene, key) {
    this.scene = scene;
    this.tex = scene.textures.exists(key) ? scene.textures.get(key) : scene.textures.createCanvas(key, ART_W, ART_H);
    this.g = this.tex.getContext();
    this.reset();
  }

  reset() {
    this.wob = 0;
    this.t = 0;
    this.parts = [];
    this.puffs = [];
    this.stream = null;
    this.iceAnim = null;
    this.powder = 0;
    this.cold = 0;
    this.lastFill = 0;
    this.puffIn = 0;
    this.stirT = 0;
    this.stirMs = 0;
    this.dirty = true;
  }

  startStir(ms) {
    this.stirT = 0;
    this.stirMs = ms;
  }

  // pour: { ingredient } while a tool pours into this cup, else null.
  // targetFill: where a ticketed order should be poured to (¾ for peng, full for hot), else null.
  update(cup, dtMs, pour, targetFill = null) {
    this.targetFill = targetFill;
    const dt = Math.min(50, dtMs);
    this.t += dt;
    if (!cup) {
      // served or binned: clear the drawing once (the old drink must not linger on the tray)
      if (this.cup) {
        this.reset();
        this.cup = null;
      }
      return;
    }
    this.cup = cup;
    const fill = cup.fill;
    const ing = pour?.ingredient;
    this.stream = null;
    if (ing === 'sugar') {
      if (Math.random() < 0.7) this.spawn('grain');
    } else if (ing) {
      this.stream = { color: STREAM[ing] ?? STREAM.kopi, w: ['condensed', 'evap'].includes(ing) ? 17 : 24 }; // chunky, easy to see at game size
      this.wob = Math.max(this.wob, 0.55);
      if (['kopi', 'teh', 'milo', 'horlicks'].includes(ing) && Math.random() < 0.5) this.spawn('bub');
      if (ing === 'evap' && Math.random() < 0.6) this.spawn('cloud');
    }
    if (fill !== this.lastFill && !ing) this.wob = Math.max(this.wob, 0.4); // a stir or a drop moves it
    this.lastFill = fill;

    // ice: falls in, splashes, bobs
    if (cup.ice && !this.iceAnim) this.iceAnim = { y: Y(levelY(fill - 0.25)) - 90, v: 0, landed: false };
    if (this.iceAnim) {
      const surf = Y(levelY(fill));
      const a = this.iceAnim;
      if (!a.landed) {
        a.v += dt * 0.0024;
        a.y += a.v * dt;
        if (a.y >= surf - 12) {
          a.landed = true;
          this.wob = 1.4;
          for (let i = 0; i < 14; i++) this.spawn('drop');
        }
      } else a.y = surf - 12 + Math.sin(this.t / 260) * 1.6 * Math.min(1, this.wob + 0.3);
    }
    if (cup.powder) this.powder = Math.min(1, this.powder + dt / 500);
    if (cup.powder && this.powder < 1 && Math.random() < 0.8) this.spawn('dust');
    this.cold = cup.ice ? Math.min(1, this.cold + dt / 1800) : 0;

    // soft steam from hot drinks: round puffs that rise, grow and fade
    const hot = cup.base && !cup.ice && fill > 0.25;
    if (hot) {
      this.puffIn -= dt;
      if (this.puffIn <= 0) {
        this.puffIn = 110 + Math.random() * 90;
        const o = oval(levelY(fill));
        this.puffs.push({ x: o.cx + (Math.random() - 0.5) * o.rx * 1.1, y: o.cy - 4, r: 7 + Math.random() * 5, age: 0, life: 1700 + Math.random() * 900, seed: Math.random() * 6 });
      }
    }
    for (const p of this.puffs) {
      p.age += dt;
      p.y -= dt * 0.028;
      p.x += Math.sin(p.age / 380 + p.seed) * dt * 0.012;
    }
    this.puffs = this.puffs.filter((p) => p.age < p.life);

    for (const p of this.parts) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'drop') p.vy += 0.0006 * dt;
      if ((p.kind === 'grain' || p.kind === 'dust') && p.y > Y(levelY(fill)) - (cup.powder ? 10 : 0)) p.life = 0;
    }
    this.parts = this.parts.filter((p) => p.life > 0);
    if (this.stirMs) {
      this.stirT += dt;
      this.wob = Math.max(this.wob, 0.5);
      if (this.stirT > this.stirMs + 150) this.stirMs = 0;
    }
    this.wob *= Math.pow(0.9985, dt);
    this.dirty = true;
  }

  spawn(kind) {
    const fill = this.cup?.fill ?? 0;
    const o = oval(levelY(fill));
    const sx = (r) => o.cx + (r - 0.5) * 2 * o.rx;
    if (kind === 'bub') this.parts.push({ kind, x: sx(0.3 + Math.random() * 0.4), y: o.cy, vx: (Math.random() - 0.5) * 0.03, vy: -0.02 - Math.random() * 0.03, life: 600, r: 2 + Math.random() * 2.5 });
    if (kind === 'cloud') this.parts.push({ kind, x: sx(0.55) + (Math.random() - 0.5) * 12, y: o.cy + 8, vx: (Math.random() - 0.5) * 0.02, vy: 0.014 + Math.random() * 0.01, life: 1600, r: 7 + Math.random() * 8 });
    if (kind === 'grain') this.parts.push({ kind, x: sx(0.35 + Math.random() * 0.3), y: Y(-60 - Math.random() * 30), vx: 0, vy: 0.16 + Math.random() * 0.06, life: 1200, r: 2.2 });
    if (kind === 'dust') this.parts.push({ kind, x: sx(0.3 + Math.random() * 0.4), y: Y(-40), vx: (Math.random() - 0.5) * 0.02, vy: 0.12, life: 900, r: 2.5 + Math.random() * 2.5 });
    if (kind === 'drop') {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const v = 0.12 + Math.random() * 0.14;
      this.parts.push({ kind, x: sx(0.5) + (Math.random() - 0.5) * 40, y: o.cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 700, r: 2 + Math.random() * 2.2 });
    }
  }

  columnPath(yTop, tilt = 0, dy = 0) {
    const g = this.g;
    const t = oval(yTop);
    const b = oval(IN.bottom);
    g.beginPath();
    g.ellipse(t.cx, t.cy + dy, t.rx, t.ry, tilt, Math.PI, 0, true);
    g.lineTo(b.cx + b.rx, b.cy);
    g.ellipse(b.cx, b.cy, b.rx, b.ry, 0, 0, Math.PI, false);
    g.closePath();
  }

  insidePath() {
    const g = this.g;
    const b = oval(IN.bottom);
    g.beginPath();
    g.moveTo(X(IN.l0), Y(IN.top - 34));
    g.lineTo(X(IN.r0), Y(IN.top - 34));
    g.lineTo(X(IN.r1), Y(IN.bottom));
    g.ellipse(b.cx, b.cy, b.rx, b.ry, 0, 0, Math.PI, false);
    g.closePath();
  }

  draw() {
    if (!this.dirty) return;
    this.dirty = false;
    const g = this.g;
    const art = sharedArt(this.scene);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, ART_W, ART_H);
    const cup = this.cup;
    if (!cup) return this.tex.refresh();

    // saucer + glass
    g.fillStyle = 'rgba(255,255,255,1)';
    g.beginPath(); g.ellipse(X(63), Y(181), 92, 14, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(154,163,171,1)'; g.lineWidth = 2; g.stroke();
    g.drawImage(art.glass, X(0), Y(0), art.gw, art.gh);

    const fill = cup.fill;
    const ly = levelY(fill);
    const lc = drinkColor(cup);
    const mixed = needsStir(cup) ? cup.stir : 1;
    if (cup.base && fill > 0.01) {
      g.save();
      this.insidePath();
      g.clip();
      const o = oval(ly);
      const tilt = Math.sin(this.t / 170) * 0.07 * this.wob;
      const dy = Math.sin(this.t / 120) * 2 * this.wob;
      // body: the unstirred drink shows the plain base with milk sitting at the bottom
      const body = mixed < 1 ? mix(NO_MILK[cup.base] ?? NO_MILK.kopi, lc, 0.25 + 0.75 * mixed) : lc;
      this.columnPath(ly, tilt, dy);
      const grad = g.createLinearGradient(0, o.cy, 0, Y(IN.bottom) + oval(IN.bottom).ry);
      grad.addColorStop(0, rgb(shade(body, 1.08), 0.97));
      grad.addColorStop(0.55, rgb(body, 0.98));
      grad.addColorStop(1, rgb(shade(body, 0.72), 0.99));
      g.fillStyle = grad;
      g.fill();
      if (mixed < 1 && cup.condensed > 0.05) {
        const h = Math.min(30, cup.condensed * 24) * (1 - mixed);
        g.fillStyle = rgb(mix(MILK.condensed, body, 0.18), 0.92);
        this.columnPath(Math.max(ly, IN.bottom - h), Math.sin(this.t / 300) * 0.03);
        g.fill();
      }
      if (mixed < 1 && milkAmount(cup) > 0.05) {
        // swirl streaks while it needs stirring
        g.strokeStyle = rgb(cup.evap > cup.condensed ? MILK.evap : MILK.condensed, 0.5 * (1 - mixed));
        g.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
          const s = oval(Math.min(IN.bottom - 8, ly + 20 + i * 24));
          g.beginPath();
          g.ellipse(s.cx, s.cy, s.rx * 0.7, s.ry * 0.7, 0, this.t / 400 + i, this.t / 400 + i + 3.4);
          g.stroke();
        }
      }
      // shine stripe down the left of the drink
      g.fillStyle = 'rgba(255,255,255,.16)';
      g.fillRect(o.cx - o.rx + 8, o.cy + o.ry + 2, 7, Math.max(0, Y(IN.bottom) - o.cy - o.ry - 6));
      // surface oval + its far-side shadow + a soft highlight
      g.fillStyle = rgb(mix(shade(body, 1.22), [255, 245, 225], cup.base === 'kopi' && milkAmount(cup) < 0.1 ? 0.12 : 0.22), 0.97);
      g.beginPath(); g.ellipse(o.cx, o.cy + dy, o.rx, o.ry, tilt, 0, Math.PI * 2); g.fill();
      g.strokeStyle = rgb(shade(body, 0.8), 0.6); g.lineWidth = 2.5;
      g.beginPath(); g.ellipse(o.cx, o.cy + dy, o.rx - 1, o.ry - 1, tilt, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.35)';
      g.beginPath(); g.ellipse(o.cx - o.rx * 0.45, o.cy + dy + o.ry * 0.25, o.rx * 0.22, o.ry * 0.18, tilt, 0, Math.PI * 2); g.fill();
      g.restore();
    }

    // the ticket's target line: a dashed oval on the glass until the drink reaches it
    for (const tf of [].concat(this.targetFill ?? [])) {
      if (fill >= tf + 0.08) continue;
      const o = oval(levelY(tf));
      g.save();
      g.setLineDash([7, 5]);
      g.lineWidth = 3;
      g.strokeStyle = 'rgba(255,210,63,0.95)';
      g.beginPath(); g.ellipse(o.cx, o.cy, o.rx + 1, o.ry + 1, 0, 0, Math.PI); g.stroke();
      g.restore();
    }

    // particles
    for (const p of this.parts) {
      const a = Math.max(0, Math.min(1, p.life / 400));
      if (p.kind === 'bub') g.fillStyle = `rgba(255,240,220,${0.6 * a})`;
      else if (p.kind === 'cloud') g.fillStyle = rgb(MILK.evap, 0.35 * a);
      else if (p.kind === 'grain') g.fillStyle = `rgba(255,255,255,${a})`;
      else if (p.kind === 'dust') g.fillStyle = rgb(cup.base === 'horlicks' ? [236, 220, 190] : NO_MILK.milo, a);
      else g.fillStyle = rgb(shade(lc, 1.1), a);
      g.beginPath();
      if (p.kind === 'grain') g.rect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      else g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fill();
      if (p.kind === 'grain') { g.strokeStyle = `rgba(120,120,120,${a})`; g.lineWidth = 0.8; g.stroke(); }
    }

    // ice: crisp pixel art, slightly see-through
    if (this.iceAnim) {
      const o = oval(ly);
      const iw = o.rx * 2 * 0.86;
      const ih = iw * (art.ice.height / art.ice.width);
      g.imageSmoothingEnabled = false;
      g.globalAlpha = 0.93;
      g.drawImage(art.ice, o.cx - iw / 2, this.iceAnim.y - ih * 0.45, iw, ih);
      g.globalAlpha = 1;
      g.imageSmoothingEnabled = true;
    }

    // Milo powder mountain
    if (this.powder > 0) {
      const o = oval(IN.top);
      const w = o.rx * 1.24 * (0.6 + 0.4 * this.powder);
      const top = o.cy - 4;
      const h = 62 * this.powder;
      const malt = cup.base === 'horlicks'; // Horlicks powder is pale cream, Milo is chocolate
      g.fillStyle = malt ? '#e8d6b0' : '#5a3a28';
      g.beginPath(); g.moveTo(o.cx - w, top + 6); g.quadraticCurveTo(o.cx - w * 0.5, top - h * 0.6, o.cx, top - h); g.quadraticCurveTo(o.cx + w * 0.5, top - h * 0.6, o.cx + w, top + 6); g.closePath(); g.fill();
      g.fillStyle = malt ? '#f6ead0' : '#7a5038';
      g.beginPath(); g.moveTo(o.cx - w * 0.55, top); g.quadraticCurveTo(o.cx - w * 0.3, top - h * 0.65, o.cx - w * 0.05, top - h * 0.9); g.lineTo(o.cx - w * 0.2, top); g.fill();
      g.fillStyle = 'rgba(40,24,14,.55)';
      for (let i = 0; i < 18; i++) g.fillRect(o.cx + Math.sin(i * 12.9) * w * 0.7, top - Math.abs(Math.cos(i * 7.3)) * h * 0.7, 3, 3);
    }

    // the spoon going round while it stirs (two turns), handle resting on the rim
    if (this.stirMs && cup.base) {
      const k = Math.min(1, this.stirT / this.stirMs);
      const th = k * Math.PI * 4;
      const o = oval(Math.min(IN.bottom - 20, ly + 26));
      const tip = { x: o.cx + Math.cos(th) * o.rx * 0.45, y: o.cy + Math.sin(th) * o.ry * 0.45 };
      const top = { x: tip.x + 30 + Math.cos(th) * 12, y: Y(-46) };
      const surfY = oval(ly).cy;
      const tAtSurf = (surfY - top.y) / (tip.y - top.y);
      const sx = top.x + (tip.x - top.x) * tAtSurf;
      g.lineCap = 'round';
      // under the surface: dimmed by the drink
      g.strokeStyle = 'rgba(200,205,212,0.45)';
      g.lineWidth = 7;
      g.beginPath(); g.moveTo(sx, surfY); g.lineTo(tip.x, tip.y); g.stroke();
      g.fillStyle = 'rgba(200,205,212,0.45)';
      g.beginPath(); g.ellipse(tip.x, tip.y, 9, 5, th, 0, Math.PI * 2); g.fill();
      // above the surface: shiny steel
      g.strokeStyle = '#6d7680'; g.lineWidth = 9;
      g.beginPath(); g.moveTo(top.x, top.y); g.lineTo(sx, surfY); g.stroke();
      g.strokeStyle = '#d9dee4'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(top.x, top.y); g.lineTo(sx, surfY); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(top.x - 1.5, top.y); g.lineTo(sx - 1.5, surfY); g.stroke();
      // a ripple ring where the spoon enters the drink
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2;
      g.beginPath(); g.ellipse(sx, surfY, 12, 4, 0, 0, Math.PI * 2); g.stroke();
    }

    // the glass's reflections over the drink
    if (cup.base && fill > 0.01) {
      g.save();
      this.insidePath();
      g.clip();
      g.globalAlpha = 0.4;
      g.drawImage(art.shine, X(0), Y(0), art.gw, art.gh);
      g.restore();
      g.globalAlpha = 1;
    }

    // spill on the saucer
    if (fill > ZONES.fill.spill) {
      g.fillStyle = rgb(lc, 0.85);
      g.beginPath(); g.ellipse(X(118), Y(182), 26, 7, 0, 0, Math.PI * 2); g.fill();
    }

    // pour stream from above
    if (this.stream) {
      const o = oval(ly);
      const x = o.cx + o.rx * 0.15;
      const y1 = cup.base ? o.cy : Y(IN.bottom);
      const w = this.stream.w + Math.sin(this.t / 70) * 0.8;
      const c = this.stream.color;
      const grad = g.createLinearGradient(x - w, 0, x + w, 0);
      grad.addColorStop(0, rgb(shade(c, 0.82)));
      grad.addColorStop(0.45, rgb(shade(c, 1.22)));
      grad.addColorStop(1, rgb(shade(c, 0.82)));
      g.fillStyle = grad;
      const sway = Math.sin(this.t / 120) * 1.5;
      g.beginPath();
      g.moveTo(x - w / 2 - 2, 0);
      g.quadraticCurveTo(x - w / 2 + sway, y1 / 2, x - w / 2 + 1, y1);
      g.lineTo(x + w / 2 - 1, y1);
      g.quadraticCurveTo(x + w / 2 + sway, y1 / 2, x + w / 2 + 2, 0);
      g.fill();
      g.fillStyle = rgb(shade(c, 1.15), 0.85);
      g.beginPath(); g.ellipse(x, y1, w + 5, 4, 0, 0, Math.PI * 2); g.fill();
    }

    // soft steam: overlapping radial puffs, like real steam
    for (const p of this.puffs) {
      const k = p.age / p.life;
      const r = p.r * (1 + k * 2.2);
      const a = 0.32 * Math.sin(Math.PI * Math.min(1, k * 1.15)) * (1 - k * 0.3);
      if (a <= 0.005) continue;
      const rg = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      rg.addColorStop(0, `rgba(255,255,255,${a})`);
      rg.addColorStop(0.55, `rgba(255,255,255,${a * 0.45})`);
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = rg;
      g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
    }

    // condensation on cold glasses
    if (this.cold > 0) {
      for (let i = 0; i < 26; i++) {
        const yy = IN.top + 14 + ((i * 37) % (IN.bottom - IN.top - 20));
        const [l, r] = wallAt(yy);
        const xx = l + 4 + ((i * 53) % Math.max(1, r - l - 8));
        g.fillStyle = `rgba(255,255,255,${0.6 * this.cold})`;
        g.beginPath(); g.ellipse(X(xx), Y(yy), 2.2, 3, 0, 0, Math.PI * 2); g.fill();
      }
    }
    this.tex.refresh();
  }
}
