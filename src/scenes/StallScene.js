import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { CUSTOMERS } from '../data/customers.js';
import { OWNERS } from '../data/owners.js';
import { TOOLS, SLOT_X, SPOT_X } from '../data/tools.js';
import { TUNING, ZONES } from '../data/stallTuning.js';
import { pickLine, UI } from '../i18n/lines.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite } from '../systems/sprites.js';
import { makeButton, layoutLine, showGlossary, addMuteToggle } from '../systems/ui.js';
import { play } from '../systems/sfx.js';
import { parseOrder } from '../systems/order.js';
import { newCup, pour, addIce, addPowder, stirStep, gradeCup, formatCup, liquidColor, needsStir } from '../systems/cup.js';
import { createDayState, applyServe, applyTimeout, formatMoney } from '../systems/economy.js';
import { weightedPick, randBetween } from '../systems/random.js';
import { startDay, logEvent, finishDay, summarize } from '../systems/playlog.js';
import { Tutorial } from '../systems/tutorial.js';
import { TUTORIAL_STEPS, TOOL_IDS } from '../data/tutorial.js';
import { load } from '../systems/save.js';

// The kopi stall, seen from behind the counter: customers across the counter at the top,
// a tray of 3 cup spots in the middle, and the tools along the bottom. Drinks are made by
// dragging: hold a pot/can/sugar over a cup to pour, drop ice/powder, wiggle the spoon to
// stir, then drag the cup to the customer who ordered it.

const OPEN_MIN = 7 * 60; // 7:00am
const CLOSE_MIN = 19 * 60; // 7:00pm

// Layout (logical px, 360x640), matched to the stall background art (901x1600 = 2.5x).
const HUD_H = 28;
const COUNTER_Y = 282; // top of the wooden counter in the background
const FEET_Y = 318; // counter customers stand behind the counter (legs hidden)
const CUP_BOTTOM = 384; // cups sit on the tray plates
const CUP_W = 50;
const CUP_H = 62;
// Inside of the glass in the cup sprite (measured from the art), relative to the cup's bottom centre.
const GLASS = { x0: -17, x1: 9, bottom: -9, top: -52 };
const TABLE = { x: 46, feetY: 112, h: 80, bubble: { x: 96, y: 36, w: 176 } }; // Ah Gong by the window, above the order bubbles
const GROUP_X = [40, 130, 220, 310];
const BUBBLE_BOTTOM = 172;
const LIFT = 36; // dragged things float above the finger so you can see them
const METER_H = 58;
const METER_MAX = 1.6;
const TABLE_LINGER_MS = 3500;
const BG_SCALE = 901 / GAME_W; // background art pixels per logical px

export default class StallScene extends Phaser.Scene {
  constructor() {
    super('Day');
  }

  create(data) {
    fitCamera(this);
    this.day = data?.day ?? 1;
    this.owner = OWNERS[this.registry.get('owner')] ?? OWNERS.mei;
    this.econ = createDayState(data?.carry);
    this.clockMs = 0;
    this.spawnInMs = TUNING.firstSpawnMs;
    this.spots = [null, null, null]; // counter customers by spot
    this.tableGuest = null;
    this.paused = false;
    this.ended = false;
    this.pouring = null; // { tool, slot }
    this.lastPourSound = 0;
    this.log = startDay({ day: this.day, owner: this.owner.name });
    this.input.dragDistanceThreshold = 6; // taps don't start drags

    this.drawBackdrop();
    this.drawHud();
    this.drawTray();
    this.drawTools();
    this.feedback = addText(this, GAME_W / 2, COUNTER_Y + 10, '', { size: 12, bold: true, align: 'center', origin: [0.5, 0], color: '#fff6dc', wrap: 340 }).setDepth(40);
    this.feedback.setStroke('#3a2414', 3);

    this.tutorial = new Tutorial(this, TUTORIAL_STEPS);
    if (this.day === 1 && !load('tutorialDone', false)) this.tutorial.start();

    if (import.meta.env.DEV) window.__stall = this;
  }

  // ---------- drawing ----------

  drawBackdrop() {
    this.add.image(0, 0, 'stallBg').setOrigin(0).setDisplaySize(GAME_W, GAME_H).setDepth(0);
    // The counter + our side of the stall again, as a front layer: customers stand behind it.
    const top = Math.round(COUNTER_Y * BG_SCALE);
    this.add.image(0, 0, 'stallBg').setOrigin(0).setDisplaySize(GAME_W, GAME_H).setCrop(0, top, 901, 1600 - top).setDepth(10);
  }

  drawHud() {
    this.add.rectangle(0, 0, GAME_W, HUD_H, 0x2e5e63).setOrigin(0).setDepth(50);
    const opts = { size: 14, bold: true, color: '#ffffff' };
    this.hudClock = addText(this, 8, 6, '', opts).setDepth(51);
    addMuteToggle(this, 156, 7, { color: '#ffffff', size: 12 }).setDepth(51);
    this.hudHappy = addText(this, GAME_W / 2 + 28, 6, '', { ...opts, origin: [0.5, 0] }).setDepth(51);
    this.hudMoney = addText(this, GAME_W - 8, 6, '', { ...opts, origin: [1, 0] }).setDepth(51);
    this.refreshHud();
  }

  drawTray() {
    this.slots = SLOT_X.map((x, i) => {
      const label = addText(this, x, CUP_BOTTOM + 6, '', { size: 10, bold: true, align: 'center', origin: [0.5, 0], color: '#fff6dc', wrap: 112 }).setDepth(16);
      label.setStroke('#3a2414', 3);
      const meter = this.add.graphics().setDepth(17);
      const container = this.add.container(x, CUP_BOTTOM).setDepth(14);
      const saucer = this.add.graphics();
      const glass = addSprite(this, 'cupGlass', 0, 0, CUP_H).setVisible(false);
      const g = this.add.graphics(); // liquid, ice, powder: drawn inside the glass
      container.add([saucer, glass, g]);
      // Hit box covers the whole cup + saucer: world y from CUP_BOTTOM - CUP_H - 8 to CUP_BOTTOM + 16.
      // (A container's local hit space starts at its position minus half its size.)
      const hitH = CUP_H + 24;
      container.setSize(CUP_W + 24, hitH);
      container.setInteractive(new Phaser.Geom.Rectangle(0, hitH / 2 - CUP_H - 8, CUP_W + 24, hitH), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(container);
      const slot = { i, x, cup: null, container, g, saucer, glass, label, meter, meterUntil: 0, meterKind: null };
      container.on('dragstart', () => this.onCupDragStart(slot));
      container.on('drag', (p) => this.onCupDrag(slot, p));
      container.on('dragend', (p) => this.onCupDragEnd(slot, p));
      this.redrawSlot(slot);
      return slot;
    });
  }

  drawTools() {
    this.tools = {};
    for (const t of TOOLS) {
      const c = this.add.container(t.x, t.y).setDepth(20);
      const parts = [];
      if (t.sprite) parts.push(addSprite(this, t.sprite, 0, t.h / 2 - 12, t.spriteH));
      else {
        const g = this.add.graphics();
        this.drawToolShape(g, t);
        parts.push(g);
      }
      // name tag so similar-looking cans are easy to tell apart
      const label = addText(this, 0, t.h / 2 - 12, t.label, { size: 9, bold: true, align: 'center', origin: [0.5, 0], color: '#fff6dc' });
      const tag = this.add.rectangle(0, t.h / 2 - 12, label.width + 8, 12, 0x2b2420, 0.75).setOrigin(0.5, 0);
      parts.push(tag, label);
      c.add(parts);
      c.setSize(t.w, t.h);
      c.setInteractive(new Phaser.Geom.Rectangle(0, 0, t.w, t.h), Phaser.Geom.Rectangle.Contains);
      c.tool = t;
      c.home = { x: t.x, y: t.y };
      c.area = () => new Phaser.Geom.Rectangle(t.x - t.w / 2, t.y - t.h / 2, t.w, t.h);
      this.tools[t.id] = c;
      if (t.kind === 'bin') continue;
      this.input.setDraggable(c);
      c.on('dragstart', () => this.onToolDragStart(c));
      c.on('drag', (p) => this.onToolDrag(c, p));
      c.on('dragend', (p) => this.onToolDragEnd(c, p));
      if (t.kind === 'rack') c.on('pointerup', (p) => p.getDistance() < 6 && this.placeCupInFreeSlot());
    }
    if (import.meta.env.DEV) TOOL_IDS.filter((id) => !this.tools[id]).forEach((id) => console.warn('[tutorial] no tool for id', id));
  }

  // Shape for tools without art yet (the bin).
  drawToolShape(g, t) {
    const w = t.w - 10;
    const h = t.h - 18;
    const top = -t.h / 2 + 2;
    g.fillStyle(t.color ?? 0x6c757d, 1).fillRoundedRect(-w / 2, top + 6, w, h - 6, 6).lineStyle(2, 0x2b2b2b, 0.8).strokeRoundedRect(-w / 2, top + 6, w, h - 6, 6);
    g.fillStyle(0x4a4f55, 1).fillRoundedRect(-w / 2 - 3, top, w + 6, 8, 3);
    g.lineStyle(2, 0x3a3a3a).lineBetween(-7, top + 14, -7, top + h - 6).lineBetween(0, top + 14, 0, top + h - 6).lineBetween(7, top + 14, 7, top + h - 6);
  }

  // Draw a cup into its slot: saucer under the glass sprite, the drink drawn inside the glass.
  redrawSlot(slot) {
    const { g, saucer, glass, cup } = slot;
    g.clear();
    saucer.clear();
    glass.setVisible(!!cup);
    if (!cup) {
      slot.label.setText('');
      return;
    }
    saucer.fillStyle(0xffffff, 1).fillEllipse(-4, 0, 66, 12).lineStyle(1, 0x9aa3ab).strokeEllipse(-4, 0, 66, 12);
    const full = GLASS.bottom - GLASS.top;
    const fillFrac = Math.min(cup.fill, ZONES.fill.spill) / ZONES.fill.spill;
    const lh = Math.round(full * fillFrac);
    const w = GLASS.x1 - GLASS.x0;
    const surface = GLASS.bottom - lh;
    if (cup.base && lh > 0) {
      g.fillStyle(liquidColor(cup), 0.93).fillRect(GLASS.x0, surface, w, lh);
      g.fillStyle(0xffffff, 0.22).fillRect(GLASS.x0 + 2, surface + 2, 3, Math.max(0, lh - 4)); // glass shine
    }
    if (cup.fill > ZONES.fill.spill) g.fillStyle(liquidColor(cup), 0.8).fillEllipse(18, 0, 22, 6); // spill on the saucer
    if (needsStir(cup) && lh > 6) g.fillStyle(0xffffff, 0.45).fillRect(GLASS.x0 + 4, surface + 3, w - 8, 3); // unmixed streak
    if (cup.ice) g.fillStyle(0xe6f6ff, 0.95).fillRect(GLASS.x0 + 3, surface - 2, 9, 9).fillRect(GLASS.x0 + 13, surface + 2, 9, 9);
    if (cup.powder) g.fillStyle(0x5a3a28, 1).fillEllipse((GLASS.x0 + GLASS.x1) / 2, GLASS.top - 2, w + 8, 16);
    slot.label.setText(formatCup(cup));
  }

  // Vertical gauge beside a cup for the ingredient being poured (like the mockup).
  drawMeter(slot, kind) {
    const m = slot.meter;
    m.clear();
    if (!slot.cup || !kind) return;
    const x = slot.x + 34;
    const top = CUP_BOTTOM - METER_H;
    const yOf = (v) => top + METER_H - (Math.min(v, METER_MAX) / METER_MAX) * METER_H;
    const band = (a, b, color) => m.fillStyle(color, 1).fillRect(x, yOf(b), 10, yOf(a) - yOf(b));
    m.fillStyle(0x2b2b2b, 0.85).fillRect(x - 2, top - 2, 14, METER_H + 4);
    let value;
    if (kind === 'fill') {
      band(0, ZONES.fill.good[0], 0xbfc6cc);
      band(ZONES.fill.good[0], ZONES.fill.good[1], 0x5fbf6a);
      band(ZONES.fill.good[1], ZONES.fill.spill, 0xf2c14e);
      band(ZONES.fill.spill, METER_MAX, 0xe0574f);
      value = slot.cup.fill;
    } else {
      const z = kind === 'sugar' ? ZONES.sugar : ZONES.milk;
      band(0, METER_MAX, 0xbfc6cc);
      band(z.none[0], z.none[1], 0xffffff);
      if (z.less) band(z.less[0], z.less[1], 0x9fd8a6);
      band(z.normal[0], z.normal[1], 0x3fa356);
      band(z.tooMuch, METER_MAX, 0xe0574f);
      value = kind === 'sugar' ? slot.cup.sugar : slot.cup.condensed + slot.cup.evap;
    }
    const ay = yOf(value);
    m.fillStyle(0xffffff, 1).fillTriangle(x + 12, ay, x + 20, ay - 5, x + 20, ay + 5).lineStyle(1, 0x2b2b2b).strokeTriangle(x + 12, ay, x + 20, ay - 5, x + 20, ay + 5);
    slot.meterKind = kind;
    slot.meterUntil = this.time.now + 1400;
  }

  // ---------- cups on the tray ----------

  freeSlot() {
    return this.slots.find((s) => !s.cup);
  }

  placeCup(slot) {
    if (!slot || slot.cup || this.ended) return false;
    slot.cup = newCup();
    this.redrawSlot(slot);
    play('cupDown');
    this.tweens.add({ targets: slot.container, y: { from: CUP_BOTTOM - 10, to: CUP_BOTTOM }, duration: 120 });
    return true;
  }

  placeCupInFreeSlot() {
    return this.placeCup(this.freeSlot());
  }

  removeCup(slot) {
    slot.cup = null;
    slot.meter.clear();
    this.redrawSlot(slot);
  }

  slotAt(x, y) {
    return this.slots.find((s) => Math.abs(x - s.x) < 52 && y > CUP_BOTTOM - CUP_H - 46 && y < CUP_BOTTOM + 18);
  }

  onCupDragStart(slot) {
    if (!slot.cup) return;
    play('pickup');
    slot.container.setDepth(45);
  }

  onCupDrag(slot, p) {
    if (!slot.cup) return;
    slot.container.setPosition(p.worldX, p.worldY + 20);
    const c = this.customerAt(p.worldX, p.worldY);
    this.highlightCustomer(c);
  }

  onCupDragEnd(slot, p) {
    this.highlightCustomer(null);
    const back = () => {
      slot.container.setDepth(14);
      this.tweens.add({ targets: slot.container, x: slot.x, y: CUP_BOTTOM, duration: 160, ease: 'Quad.out' });
    };
    if (!slot.cup) return back();
    if (Phaser.Geom.Rectangle.Contains(Phaser.Geom.Rectangle.Inflate(this.tools.bin.area(), 8, 8), p.worldX, p.worldY)) {
      play('bin');
      logEvent(this.log, 'bin', { made: formatCup(slot.cup) }, this.clockMs);
      this.removeCup(slot);
      slot.container.setPosition(slot.x, CUP_BOTTOM).setDepth(14);
      return;
    }
    const c = this.customerAt(p.worldX, p.worldY);
    if (c && c.state === 'waiting') {
      this.serveCup(slot, c);
      slot.container.setPosition(slot.x, CUP_BOTTOM).setDepth(14);
      return;
    }
    back();
  }

  // ---------- tools ----------

  onToolDragStart(tool) {
    play('pickup');
    tool.setDepth(46);
    this.tweens.add({ targets: tool, scale: 1.08, duration: 80 });
    tool.lastStirDir = 0;
    tool.lastX = null;
  }

  onToolDrag(tool, p) {
    tool.setPosition(p.worldX, p.worldY - LIFT);
    const t = tool.tool;
    // the "business end" of the tool (spout / spoon tip) is its bottom edge
    const slot = this.slotAt(p.worldX, p.worldY - LIFT + t.h / 2);
    const target = slot?.cup ? slot : null;
    if (t.kind === 'pour') {
      this.pouring = target ? { tool, slot: target } : null;
      tool.setAngle(target ? -38 : 0);
    } else if (t.kind === 'stir' && target?.cup.base) {
      const x = p.worldX;
      if (tool.lastX !== null && Math.abs(x - tool.lastX) > 5) {
        const dir = Math.sign(x - tool.lastX);
        if (tool.lastStirDir && dir !== tool.lastStirDir) this.stirCup(target);
        tool.lastStirDir = dir;
        tool.lastX = x;
      } else if (tool.lastX === null) tool.lastX = x;
    }
    tool.hoverSlot = target;
  }

  onToolDragEnd(tool, p) {
    const t = tool.tool;
    const slot = this.slotAt(p.worldX, p.worldY - LIFT + t.h / 2);
    if (t.kind === 'drop' && slot?.cup) this.dropOnCup(slot, t.apply);
    if (t.kind === 'rack' && slot && !slot.cup) this.placeCup(slot);
    this.pouring = null;
    tool.setAngle(0);
    // While it glides home it passes BEHIND the cups (depth 14), so a quick tap on a cup still
    // grabs the cup, but the tool itself can be grabbed again straight away.
    tool.setDepth(13);
    this.tweens.add({ targets: tool, x: tool.home.x, y: tool.home.y, scale: 1, duration: 160, ease: 'Quad.out', onComplete: () => tool.setDepth(20) });
  }

  // Shared by the drag UI, the tutorial and tests (window.__stall in dev).
  pourInto(slot, ingredient, dtMs) {
    if (!slot?.cup) return;
    pour(slot.cup, ingredient, dtMs);
    this.redrawSlot(slot);
    this.drawMeter(slot, ['kopi', 'teh', 'milo'].includes(ingredient) ? 'fill' : ingredient === 'sugar' ? 'sugar' : 'milk');
  }

  dropOnCup(slot, what) {
    if (what === 'ice') addIce(slot.cup);
    else addPowder(slot.cup);
    play('ice');
    this.redrawSlot(slot);
  }

  stirCup(slot) {
    stirStep(slot.cup);
    play('stir');
    this.redrawSlot(slot);
    this.tweens.add({ targets: slot.container, angle: { from: -3, to: 3 }, duration: 60, yoyo: true, onComplete: () => slot.container.setAngle(0) });
  }

  pourParticles(tool, slot, ingredient) {
    const colors = { kopi: 0x3b2416, teh: 0x9a4a1e, milo: 0x5a3a28, sugar: 0xffffff, condensed: 0xf3e2c0, evap: 0xf7efe2 };
    const sx = tool.x + (ingredient === 'sugar' ? 0 : 18);
    const sy = tool.y + tool.tool.h / 2 - 8;
    const drop = this.add.circle(sx, sy, ingredient === 'sugar' ? 2 : 3, colors[ingredient]).setDepth(44);
    this.tweens.add({ targets: drop, x: slot.x + Phaser.Math.Between(-6, 6), y: CUP_BOTTOM - CUP_H + 10, duration: 160, onComplete: () => drop.destroy() });
  }

  // ---------- customers ----------

  waitingCustomers() {
    return [...new Set([...this.spots, this.tableGuest])].filter((c) => c?.state === 'waiting');
  }

  allCustomers() {
    return [...new Set([...this.spots, this.tableGuest])].filter(Boolean);
  }

  // forcedId / forcedOrder let the tutorial (and tests) bring in a specific character + order.
  spawnCustomer(forcedId = null, forcedOrder = null) {
    const freeSpots = this.spots.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
    const fits = (d) => (d.slot === 'table' ? !this.tableGuest : d.groupSize > 1 ? freeSpots.length === 3 : freeSpots.length > 0);
    const forced = forcedId && CUSTOMERS.find((c) => c.id === forcedId);
    const pool = CUSTOMERS.filter((c) => c.enabled && c.sprite && fits(c));
    const def = forcedId ? (forced && fits(forced) ? forced : null) : pool.length ? weightedPick(pool) : null;
    if (!def) return null;

    const orderText = forcedOrder ?? weightedPick(def.orders).text;
    const n = def.groupSize;
    const atTable = def.slot === 'table';
    const spot = atTable ? 'table' : n > 1 ? 'all' : Phaser.Utils.Array.GetRandom(freeSpots);
    const c = {
      def,
      spot,
      orderText,
      spec: parseOrder(orderText),
      n,
      served: 0,
      state: 'walking',
      patienceMax: def.patience * 1000 * TUNING.patienceScale,
      patienceMs: def.patience * 1000 * TUNING.patienceScale,
      bubble: null,
    };
    c.orderLine = pickLine(def.lines, 'order', this.lineVars({ order: orderText, n }));

    if (atTable) {
      this.tableGuest = c;
      c.sprites = [addSprite(this, def.sprite, TABLE.x, TABLE.feetY, TABLE.h).setDepth(2).setAlpha(0)];
      this.tweens.add({ targets: c.sprites, alpha: 1, duration: 500, onComplete: () => this.arrive(c) });
    } else {
      const keys = n > 1 ? (def.sprites ?? Array(n).fill(def.sprite)).slice(0, n) : [def.sprite];
      const xs = n > 1 ? GROUP_X.slice(0, n) : [SPOT_X[spot]];
      if (n > 1) this.spots = [c, c, c];
      else this.spots[spot] = c;
      const fromX = (n > 1 ? -1 : spot <= 1 ? -1 : 1) * 80 + (n > 1 || spot <= 1 ? 0 : GAME_W);
      c.sprites = keys.map((key, i) => addSprite(this, key, fromX + (xs[i] - xs[0]), FEET_Y - (i % 2) * 4).setDepth(3 + (i % 2 ? 0 : 0.5)).setData('homeX', xs[i]));
      const duration = 700;
      c.sprites.forEach((s, i) => {
        this.tweens.add({ targets: s, x: s.getData('homeX'), duration, ease: 'Quad.out' });
        this.tweens.add({ targets: s, y: s.y - 4, duration: 110, yoyo: true, repeat: 2, delay: i * 40 });
      });
      this.time.delayedCall(duration + 40, () => this.arrive(c));
    }
    return c;
  }

  lineVars(extra = {}) {
    return { owner: this.owner.address, ...extra };
  }

  arrive(c) {
    if (c.state === 'gone') return;
    c.state = 'waiting';
    this.showBubble(c, c.orderLine, 'order');
  }

  centerX(c) {
    return c.spot === 'table' ? TABLE.x : c.spot === 'all' ? GAME_W / 2 : SPOT_X[c.spot];
  }

  showBubble(c, text, kind) {
    this.clearBubble(c);
    const pad = 6;
    const table = c.spot === 'table';
    const w = table ? TABLE.bubble.w : c.spot === 'all' ? 220 : 114;
    const x = table ? TABLE.bubble.x : Phaser.Math.Clamp(this.centerX(c) - w / 2, 4, GAME_W - w - 4);
    const words = layoutLine(this, text, x + pad, 0, w - pad * 2, (key) => this.openGlossary(key), { size: 11 });
    const extras = [];
    let h = words.height + pad * 2;
    if (kind === 'order' && c.n > 1) {
      extras.push(addText(this, x + pad, 0, `Cup ${c.served + 1}/${c.n}`, { size: 10, color: '#8a7a70' }));
      h += 13;
    }
    if (kind === 'order') h += 8; // patience bar
    const y = table ? TABLE.bubble.y : BUBBLE_BOTTOM - h;
    words.objects.forEach((o) => o.setY(o.y + y + pad));
    extras.forEach((o) => o.setY(y + pad + words.height));
    const frame = this.add.rectangle(x, y, w, h, 0xffffff).setOrigin(0).setStrokeStyle(2, COLORS.inkHex, 0.8).setDepth(30);
    const tx = table ? x + 6 : Phaser.Math.Clamp(this.centerX(c), x + 12, x + w - 12);
    const tail = table
      ? this.add.triangle(0, 0, x + 1, y + 16, x + 1, y + 28, x - 9, y + 24, 0xffffff).setOrigin(0).setDepth(30)
      : this.add.triangle(0, 0, tx - 7, y + h - 1, tx + 7, y + h - 1, tx, y + h + 8, 0xffffff).setOrigin(0).setDepth(30);
    [...words.objects, ...extras].forEach((o) => o.setDepth(31));
    const objs = [frame, tail, ...words.objects, ...extras];
    let bar = null;
    if (kind === 'order') {
      objs.push(this.add.rectangle(x + pad, y + h - 9, w - pad * 2, 5, 0xe0d6c4).setOrigin(0).setDepth(31));
      bar = this.add.rectangle(x + pad, y + h - 9, w - pad * 2, 5, COLORS.good).setOrigin(0).setDepth(32);
      bar.fullW = w - pad * 2;
      objs.push(bar);
    }
    c.bubble = { objs, frame, bar };
    this.updatePatienceBar(c);
  }

  clearBubble(c) {
    c?.bubble?.objs.forEach((o) => {
      this.tweens.killTweensOf(o);
      o.destroy();
    });
    if (c) c.bubble = null;
  }

  updatePatienceBar(c) {
    const bar = c.bubble?.bar;
    if (!bar) return;
    const f = Phaser.Math.Clamp(c.patienceMs / c.patienceMax, 0, 1);
    bar.width = Math.max(0, Math.round(bar.fullW * f));
    bar.fillColor = f > 0.35 ? COLORS.good : COLORS.accent;
    if (f <= 0.35 && !c.bubble.shaking) {
      c.bubble.shaking = true;
      this.tweens.add({ targets: bar, x: '+=2', duration: 70, yoyo: true, repeat: -1 });
    }
  }

  // Which waiting customer is at this point (their sprites or their bubble)?
  customerAt(x, y) {
    for (const c of this.waitingCustomers()) {
      const rects = [...c.sprites.map((s) => s.getBounds()), c.bubble?.frame.getBounds()].filter(Boolean);
      if (rects.some((r) => Phaser.Geom.Rectangle.Contains(Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(r), 6, 6), x, y))) return c;
    }
    return null;
  }

  highlightCustomer(c) {
    for (const o of this.allCustomers()) o.bubble?.frame.setStrokeStyle(o === c ? 4 : 2, o === c ? COLORS.accent : COLORS.inkHex, 0.9);
  }

  serveCup(slot, c) {
    const cup = slot.cup;
    const { tier, reasons } = gradeCup(cup, c.spec);
    const res = applyServe(this.econ, tier, c.spec);
    c.served += 1;
    c.state = 'reacting';
    logEvent(this.log, 'serve', { who: c.def.id, wanted: c.orderText, made: formatCup(cup), tier, reasons, waitMs: Math.round(c.patienceMax - c.patienceMs) }, this.clockMs);
    this.tutorial?.onServed(c, tier);
    this.removeCup(slot);

    play('clink');
    this.time.delayedCall(140, () => play('coin'));
    this.time.delayedCall(420, () => play(tier === 'oops' ? 'oops' : tier === 'perfect' ? 'perfect' : 'tap'));
    this.showBubble(c, pickLine(c.def.lines, tier, this.lineVars()), 'reaction');
    this.floatText(`+${formatMoney(res.paid + res.tip)}`, this.centerX(c), this.headTop(c) + 10);
    this.coinBurst(c);
    if (tier === 'perfect') this.happyHop(c);
    const label = { perfect: 'Perfect!', close: 'Close', oops: 'Oops' }[tier];
    const why = reasons.length ? ` — ${reasons.slice(0, 2).join(', ')}` : '';
    this.setFeedback(`${label}${why}  +${formatMoney(res.paid + res.tip)}  ♥${res.happy > 0 ? '+' : ''}${res.happy}`);
    this.refreshHud();

    if (c.served < c.n) {
      this.time.delayedCall(1200, () => {
        if (c.state === 'gone' || this.ended) return;
        c.state = 'waiting';
        c.patienceMs = Math.min(c.patienceMax, c.patienceMs + TUNING.groupCupBonusMs);
        this.showBubble(c, c.orderLine, 'order');
      });
    } else {
      this.time.delayedCall(c.spot === 'table' ? TABLE_LINGER_MS : 1400, () => this.leave(c));
    }
  }

  headTop(c) {
    return Math.min(...c.sprites.map((s) => s.getBounds().top));
  }

  timeout(c) {
    c.state = 'reacting';
    applyTimeout(this.econ);
    logEvent(this.log, 'timeout', { who: c.def.id }, this.clockMs);
    play('walkout');
    this.showBubble(c, pickLine(c.def.lines, 'timeout', this.lineVars()), 'reaction');
    this.setFeedback('They wandered off... ♥-1');
    this.refreshHud();
    this.time.delayedCall(1600, () => this.leave(c));
  }

  leave(c) {
    if (c.state === 'gone') return;
    c.state = 'gone';
    this.clearBubble(c);
    if (c === this.tableGuest) this.tableGuest = null;
    this.spots = this.spots.map((s) => (s === c ? null : s));
    c.sprites.forEach((s) => this.tweens.add({ targets: s, alpha: 0, y: s.y - 12, duration: 450, onComplete: () => s.destroy() }));
  }

  // ---------- juice / feedback ----------

  floatText(str, x, y) {
    const t = addText(this, x, y, str, { size: 16, bold: true, color: '#2f7a3a', origin: 0.5 }).setDepth(60);
    this.tweens.add({ targets: t, y: y - 32, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
  }

  coinBurst(c) {
    const from = { x: this.centerX(c), y: this.headTop(c) + 30 };
    for (let i = 0; i < 4; i++) {
      const coin = this.add.circle(from.x, from.y, 5, 0xf2c14e).setStrokeStyle(1, 0xb8862b).setDepth(61);
      this.tweens.add({
        targets: coin, x: GAME_W - 30, y: 14, duration: 520, delay: 120 + i * 70, ease: 'Cubic.in',
        onComplete: () => {
          coin.destroy();
          if (i === 3) this.tweens.add({ targets: this.hudMoney, scale: 1.18, duration: 90, yoyo: true });
        },
      });
    }
  }

  happyHop(c) {
    c.sprites.forEach((s, i) => this.tweens.add({ targets: s, y: s.y - 10, duration: 110, yoyo: true, repeat: 1, delay: 300 + i * 50, ease: 'Quad.out' }));
  }

  setFeedback(str) {
    this.feedback.setText(str).setAlpha(1);
    this.tweens.killTweensOf(this.feedback);
    this.tweens.add({ targets: this.feedback, alpha: 0, delay: 3000, duration: 600 });
  }

  openGlossary(key) {
    if (this.paused) return;
    this.paused = true;
    logEvent(this.log, 'glossary', { key }, this.clockMs);
    this.tweens.pauseAll();
    this.time.paused = true;
    showGlossary(this, key, () => {
      this.paused = false;
      this.tweens.resumeAll();
      this.time.paused = false;
    });
  }

  // ---------- clock / HUD ----------

  refreshHud() {
    const mins = OPEN_MIN + Math.floor((this.clockMs / TUNING.dayMs) * (CLOSE_MIN - OPEN_MIN));
    const h24 = Math.floor(mins / 60);
    const mm = String(Math.floor((mins % 60) / 15) * 15).padStart(2, '0');
    const h12 = ((h24 + 11) % 12) + 1;
    this.hudClock.setText(`Day ${this.day}  ${h12}:${mm}${h24 < 12 ? 'am' : 'pm'}`);
    this.hudHappy.setText(`♥ ${this.econ.happiness}`);
    this.hudMoney.setText(formatMoney(this.econ.money));
  }

  update(time, delta) {
    if (this.ended || this.paused) return;

    // pouring while a tool is held over a cup
    if (this.pouring) {
      const { tool, slot } = this.pouring;
      const ing = tool.tool.ingredient;
      this.pourInto(slot, ing, delta);
      if (Math.random() < 0.6) this.pourParticles(tool, slot, ing);
      const gap = ing === 'sugar' ? 220 : 900;
      if (time - this.lastPourSound > gap) {
        play(ing === 'sugar' ? 'sugar' : ['condensed', 'evap'].includes(ing) ? 'milk' : 'pour');
        this.lastPourSound = time;
      }
    }
    for (const s of this.slots) if (s.meterKind && time > s.meterUntil && this.pouring?.slot !== s) (s.meter.clear(), (s.meterKind = null));

    // The tutorial is a calm intro: the day clock and random spawns wait for it.
    const teaching = this.tutorial?.active;
    if (!teaching) this.clockMs = Math.min(TUNING.dayMs, this.clockMs + delta);
    this.refreshHud();
    if (this.clockMs >= TUNING.dayMs) return this.endDay();

    if (!teaching) this.spawnInMs -= delta;
    if (this.spawnInMs <= 0) {
      const late = this.clockMs > TUNING.dayMs - TUNING.lastSpawnBeforeEndMs;
      if (!late && this.spawnCustomer()) this.spawnInMs = randBetween(TUNING.spawnMinMs, TUNING.spawnMaxMs);
      else this.spawnInMs = 1500;
    }

    for (const c of this.waitingCustomers()) {
      if (c.tutorial) continue; // no time pressure while learning
      c.patienceMs -= delta;
      this.updatePatienceBar(c);
      if (c.patienceMs <= 0) this.timeout(c);
    }
  }

  // ---------- day end ----------

  endDay() {
    this.ended = true;
    this.pouring = null;
    finishDay(this.log, this.econ);
    play('dayEnd');
    for (const c of this.allCustomers()) {
      c.state = 'gone';
      this.clearBubble(c);
      c.sprites.forEach((s) => this.tweens.add({ targets: s, alpha: 0, duration: 400, onComplete: () => s.destroy() }));
    }
    this.spots = [null, null, null];
    this.tableGuest = null;
    this.setFeedback(UI.closing);

    const depth = 70;
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.35).setOrigin(0).setDepth(depth).setInteractive();
    const cx = GAME_W / 2;
    const cardW = 300;
    const top = 140;
    this.add.rectangle(cx - cardW / 2, top, cardW, 340, COLORS.paper).setOrigin(0).setStrokeStyle(2, COLORS.inkHex).setDepth(depth + 1);
    const t = (y, str, o = {}) => addText(this, cx, top + y, str, { size: 16, align: 'center', origin: [0.5, 0], ...o }).setDepth(depth + 2);
    t(20, UI.dayDone.replace('{day}', this.day), { size: 24, bold: true });
    t(56, UI.dayDoneZh, { size: 16 });
    const e = this.econ;
    t(96, `Cups served: ${e.served}  (perfect ${e.perfect})`);
    t(124, `Earned today: ${formatMoney(e.earnedToday)}`);
    t(152, `Happiness: ♥ ${e.happiness}`);
    if (e.walkedOut) t(180, `${e.walkedOut} wandered off — no worries lah`, { size: 12, color: '#8a7a70' });

    const btn = makeButton(this, cx - 90, top + 224, 180, 52, UI.closeStall, () => this.scene.start('Title'), { size: 18, bold: true, fill: 0xbfe3c0 });
    btn.bg.setDepth(depth + 2);
    btn.txt.setDepth(depth + 3);
    const copy = makeButton(this, cx - 90, top + 286, 180, 36, 'Copy playtest notes', () => this.copyNotes(copy), { size: 13 });
    copy.bg.setDepth(depth + 2);
    copy.txt.setDepth(depth + 3);
  }

  copyNotes(btn) {
    const text = summarize(this.log);
    try {
      navigator.clipboard.writeText(text).then(() => btn.txt.setText('Copied!'), () => window.prompt('Copy these playtest notes:', text));
    } catch {
      window.prompt('Copy these playtest notes:', text);
    }
  }
}
