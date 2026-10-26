// The pour bar: a horizontal gauge docked under the HUD while something is poured, so the
// player's finger (down at the cup) never covers it. Zones touch (no gaps); the bar trembles in
// GA DAI-style "careful" zones and shakes harder in the red ones.
import { GAME_W, COLORS } from '../config.js';
import { ZONES } from '../data/stallTuning.js';
import { addText } from './text.js';
import { sweetness } from './cup.js';
import { dialZones } from './dial.js';

const Z = ZONES;
// [label, from, to, kind] straight from ZONES (the same boundaries gradeCup uses);
// kind: none | lo | ok | hi (careful) | bad (gone too far)
const SWEET = [
  ['KOSONG', ...Z.sugar.none, 'none'],
  ['SIEW DAI', ...Z.sugar.less, 'lo'],
  ['NORMAL', ...Z.sugar.normal, 'ok'],
  ['GA DAI', ...Z.sugar.more, 'hi'],
  ['TOO SWEET', Z.sugar.tooMuch, 1.9, 'bad'],
];
const EVAP = [
  ['NONE (O)', ...Z.milk.none, 'none'],
  ['C · NORMAL', ...Z.milk.normal, 'ok'],
  ['TOO MILKY', Z.milk.tooMuch, 1.9, 'bad'],
];
const FILL = [
  ['FILLING…', 0, Z.fill.peng[0], 'none'],
  ['¾ PENG', ...Z.fill.peng, 'lo'],
  ['FULL', ...Z.fill.good, 'ok'],
  ['SPILL', Z.fill.good[1], 1.3, 'bad'],
];
// For a poh (weak) order the pot stops at about half, then the kettle's hot water tops it up.
const FILL_POH = [
  ['POURING…', 0, Z.pohPot[0], 'none'],
  ['½ POH', ...Z.pohPot, 'lo'],
  ['', Z.pohPot[1], Z.fill.good[0], 'none'],
  ['FULL', ...Z.fill.good, 'ok'],
  ['SPILL', Z.fill.good[1], 1.3, 'bad'],
];
const FILL_COLORS = { none: 0xf2f2f2, lo: 0xcfe9cf, ok: 0x66bb6a, hi: 0xf2c14e, bad: 0xe57368 };

const KIND = {
  kopi: { name: 'Kopi pot · fill', zones: FILL, pohZones: FILL_POH, value: (c) => c.fill },
  teh: { name: 'Teh pot · fill', zones: FILL, pohZones: FILL_POH, value: (c) => c.fill },
  milo: { name: 'Milo · fill', zones: FILL, value: (c) => c.fill },
  horlicks: { name: 'Horlicks · fill', zones: FILL, value: (c) => c.fill },
  condensed: { name: 'Condensed milk · sweetness', zones: SWEET, value: sweetness },
  sugar: { name: 'Sugar · sweetness', zones: SWEET, value: sweetness },
  gula: { name: 'Gula melaka · sweetness', zones: SWEET, value: sweetness },
  evap: { name: 'Evaporated milk · C', zones: EVAP, value: (c) => c.evap },
  water: { name: 'Hot water · fill', zones: FILL, value: (c) => c.fill },
};

// The zone a ticketed order is aiming for, for this ingredient (null = no ticket / no target).
const SWEET_ZONE = { none: 'KOSONG', less: 'SIEW DAI', normal: 'NORMAL', more: 'GA DAI' };
export function targetZone(ingredient, spec) {
  if (!spec) return null;
  if (['kopi', 'teh'].includes(ingredient) && spec.strength === 'poh' && !spec.iced) return '½ POH';
  if (['kopi', 'teh', 'milo', 'horlicks', 'water'].includes(ingredient)) return spec.iced ? '¾ PENG' : 'FULL';
  if (ingredient === 'evap') return spec.milk === 'evap' ? 'C · NORMAL' : 'NONE (O)';
  if (ingredient === 'gula') return spec.layered ? 'NORMAL' : 'KOSONG';
  if (ingredient === 'condensed' || ingredient === 'sugar') return spec.sugar ? SWEET_ZONE[spec.sugar] : null;
  return null;
}

// The timing dial's zones for a dosed ingredient (and what it measures: sweetness, or evap for the pump).
export const dialZonesFor = (ingredient) => dialZones(KIND[ingredient].zones);
export const measureOf = (ingredient, cup) => KIND[ingredient].value(cup);

const X = 8;
const W = GAME_W - 16;
const BAR_H = 22;

export class PourBar {
  constructor(scene, y, depth = 55) {
    this.scene = scene;
    this.y = y;
    this.c = scene.add.container(0, y).setDepth(depth).setAlpha(0);
    this.panel = scene.add.rectangle(X - 4, -4, W + 8, BAR_H + 26, COLORS.paper, 0.96).setOrigin(0).setStrokeStyle(2, COLORS.inkHex, 0.9);
    this.label = addText(scene, X, -1, '', { size: 11, bold: true });
    this.now = addText(scene, X + W, -1, '', { size: 11, bold: true, color: '#c8562e', origin: [1, 0] });
    this.g = scene.add.graphics();
    this.marker = scene.add.graphics();
    this.c.add([this.panel, this.g, this.marker, this.label, this.now]);
    this.zoneTexts = [];
    this.kind = null;
    this.hideAt = 0;
  }

  // Called every frame while pouring: ingredient key, the cup, the slot number (1-3) and, for a
  // ticketed cup, the ticket ({ spec, who }) so the order's target zone is outlined.
  // dial = { value }: the timing dial (Sugar Scoop / Milk Pump / gula): the needle at value, red zone cut short.
  show(ingredient, cup, slotNo, ticket = null, dial = null) {
    const k = KIND[ingredient];
    if (!k || !cup) return;
    const zones = dial ? dialZonesFor(ingredient) : k.pohZones && ticket?.spec?.strength === 'poh' && !ticket.spec.iced ? k.pohZones : k.zones;
    const key = `${ingredient}:${dial ? 'dial' : zones === k.zones ? '' : 'poh'}`;
    if (this.kind !== key) this.layout(key, zones);
    const v = dial ? dial.value : k.value(cup);
    const max = zones.at(-1)[2];
    const mx = X + (Math.min(v, max) / max) * W;
    const zone = zones.find((z) => v >= z[1] && v < z[2]) ?? zones.at(-1);
    this.label.setText(dial ? `Cup ${slotNo} · ${k.name.split(' ·')[0]} · TAP to stop!` : ticket ? `Cup ${slotNo} · ${ticket.who} · ${k.name}` : `Cup ${slotNo} · ${k.name}`);
    this.now.setText(zone[0]);
    this.marker.clear();
    const target = zones.find((z) => z[0] === targetZone(ingredient, ticket?.spec));
    if (target) {
      const x0 = X + (target[1] / max) * W;
      const x1 = X + (target[2] / max) * W;
      this.marker.lineStyle(3, 0xffd23f, 1).strokeRect(x0 + 1.5, 17.5, x1 - x0 - 3, BAR_H - 3);
      this.now.setText(zone === target ? `★ ${zone[0]}` : `${zone[0]}  → ★ ${target[0]}`);
    }
    this.marker.fillStyle(0x111111, 1).fillRect(mx - 2.5, 12, 5, BAR_H + 8).lineStyle(1, 0xffffff, 1).strokeRect(mx - 2.5, 12, 5, BAR_H + 8);
    // tremble in the careful zone, shake in the red one (never wild)
    const t = this.scene.time.now;
    const amp = dial ? 0 : zone[3] === 'bad' ? 2.6 : zone[3] === 'hi' ? 0.9 : 0;
    this.c.setPosition(amp ? Math.sin(t / (zone[3] === 'bad' ? 22 : 38)) * amp : 0, this.y + (amp ? Math.cos(t / 31) * amp * 0.35 : 0));
    this.c.setAlpha(1);
    this.hideAt = t + 700;
  }

  layout(key, zones) {
    this.kind = key;
    const max = zones.at(-1)[2];
    this.g.clear();
    this.zoneTexts.forEach((t) => t.destroy());
    this.zoneTexts = [];
    for (const [label, a, b, kind] of zones) {
      const x0 = X + (a / max) * W;
      const x1 = X + (b / max) * W;
      this.g.fillStyle(FILL_COLORS[kind], 1).fillRect(x0, 16, x1 - x0, BAR_H);
      this.g.lineStyle(1, 0x000000, 0.18).lineBetween(x1, 16, x1, 16 + BAR_H);
      const t = addText(this.scene, (x0 + x1) / 2, 16 + BAR_H / 2, label, { size: 9, bold: true, color: '#1f1f1f', origin: 0.5 });
      this.zoneTexts.push(t);
      this.c.add(t);
    }
    this.g.lineStyle(2, COLORS.inkHex, 1).strokeRoundedRect(X, 16, W, BAR_H, 4);
    this.c.bringToTop(this.marker);
  }

  // Fade out shortly after the pour stops.
  update() {
    if (this.c.alpha > 0 && this.scene.time.now > this.hideAt) this.c.setAlpha(Math.max(0, this.c.alpha - 0.08));
  }
}
