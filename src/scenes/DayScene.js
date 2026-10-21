import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { CUSTOMERS } from '../data/customers.js';
import { OWNERS } from '../data/owners.js';
import { pickLine, UI } from '../i18n/lines.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite } from '../systems/sprites.js';
import { makeButton, layoutLine, showGlossary, addMuteToggle } from '../systems/ui.js';
import { play } from '../systems/sfx.js';
import { parseOrder, formatOrder } from '../systems/order.js';
import { scoreDrink } from '../systems/scoring.js';
import { createDayState, applyServe, applyTimeout, formatMoney } from '../systems/economy.js';
import { ensureCupTexture } from '../systems/drinkSprite.js';
import { weightedPick, randBetween } from '../systems/random.js';
import { startDay, logEvent, finishDay, summarize } from '../systems/playlog.js';
import { Tutorial } from '../systems/tutorial.js';
import { TUTORIAL_STEPS, BUTTON_IDS } from '../data/tutorial.js';
import { load } from '../systems/save.js';

const DAY_MS = 180_000; // ~3 real minutes per day
const OPEN_MIN = 7 * 60; // 7:00am
const CLOSE_MIN = 19 * 60; // 7:00pm
const LAST_SPAWN_MS = DAY_MS - 15_000;
const BREW_MS = 1200; // "faster kettle" upgrade will shorten this (M3)
const MAX_QUEUE = 2;
const TABLE_LINGER_MS = 4000; // table regulars sit with their kopi a bit after being served

// Layout (logical px, 360x640)
const HUD_H = 28;
const COUNTER_Y = 262;
const STATION_Y = 300;
const FEET_Y = 286; // counter hides feet; the table guest's feet show on the floor
const FRONT_X = 206;
const BACK_X = 150;
const TABLE_X = 62;
const OWNER_X = 316;
const GROUP_OFFSETS = [-54, -18, 18, 54];
const BUBBLE = {
  counter: { x: 182, w: 174 },
  table: { x: 4, w: 170 },
  y: HUD_H + 8,
  pad: 8,
  text: 13,
};

const freshBuild = () => ({ base: null, milk: 'condensed', sugar: 'normal', iced: false, topping: null });

export default class DayScene extends Phaser.Scene {
  constructor() {
    super('Day');
  }

  create(data) {
    fitCamera(this);
    this.day = data?.day ?? 1;
    this.owner = OWNERS[this.registry.get('owner')] ?? OWNERS.mei;
    this.econ = createDayState(data?.carry);
    this.clockMs = 0;
    this.spawnInMs = 1500;
    this.queue = []; // counter customers, front first
    this.tableGuest = null;
    this.target = null; // who SERVE gives the drink to
    this.build = freshBuild();
    this.brewing = false;
    this.paused = false;
    this.ended = false;
    this.log = startDay({ day: this.day, owner: this.owner.name });

    this.drawBackdrop();
    this.drawHud();
    this.drawStation();
    this.refreshBuild();

    this.tutorial = new Tutorial(this, TUTORIAL_STEPS);
    if (this.day === 1 && !load('tutorialDone', false)) this.tutorial.start();
  }

  // ---------- drawing ----------

  drawBackdrop() {
    this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.sky).setOrigin(0);
    for (let x = 0; x < GAME_W; x += 20) {
      this.add.rectangle(x, 196, 20, 66, (x / 20) % 2 ? 0xdff1e4 : 0xc9e6d2).setOrigin(0);
    }
    this.add.rectangle(0, FEET_Y - 24, 120, STATION_Y - FEET_Y + 24, COLORS.floorA).setOrigin(0); // floor by the table

    this.ownerSprite = addSprite(this, this.owner.sprite, OWNER_X, FEET_Y).setDepth(1);
    this.tweens.add({ targets: this.ownerSprite, y: FEET_Y - 2, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // counter (customers stand behind it), with the stall name painted on the front
    this.add.rectangle(120, COUNTER_Y, GAME_W - 120, 8, COLORS.counterTop).setOrigin(0).setDepth(5);
    this.add.rectangle(120, COUNTER_Y + 8, GAME_W - 120, STATION_Y - COUNTER_Y - 8, COLORS.counter).setOrigin(0).setDepth(5);
    addText(this, 240, COUNTER_Y + 19, '陈记咖啡  TAN KOPI', { size: 13, bold: true, color: '#fff1a8', origin: 0.5 }).setDepth(6);
    this.add.rectangle(0, STATION_Y, GAME_W, GAME_H - STATION_Y, COLORS.paper).setOrigin(0).setDepth(5);
  }

  drawHud() {
    this.add.rectangle(0, 0, GAME_W, HUD_H, 0x2e5e63).setOrigin(0).setDepth(20);
    const opts = { size: 14, bold: true, color: '#ffffff' };
    this.hudClock = addText(this, 8, 6, '', opts).setDepth(21);
    this.hudHappy = addText(this, GAME_W / 2 + 28, 6, '', { ...opts, origin: [0.5, 0] }).setDepth(21);
    this.hudMoney = addText(this, GAME_W - 8, 6, '', { ...opts, origin: [1, 0] }).setDepth(21);
    addMuteToggle(this, 156, 7, { color: '#ffffff', size: 12 }).setDepth(21);
    this.refreshHud();
  }

  drawStation() {
    const D = 6;
    const bx = 108;
    const bw = 78;
    const gap = 4;
    const h = 44;
    const col = (i) => bx + i * (bw + gap);
    const row = (i) => STATION_Y + 6 + i * (h + 4);

    this.add.rectangle(8, STATION_Y + 6, 92, 186, 0xe8d9bd).setOrigin(0).setStrokeStyle(2, 0xcdb48c).setDepth(D);
    this.cup = this.add.image(54, STATION_Y + 10, ensureCupTexture(this, null)).setOrigin(0.5, 0).setScale(6).setDepth(D);
    this.cupName = addText(this, 54, STATION_Y + 112, '', { size: 12, bold: true, align: 'center', origin: [0.5, 0], wrap: 84 }).setDepth(D);
    this.brewBg = this.add.rectangle(16, STATION_Y + 172, 76, 8, 0xe0d6c4).setOrigin(0).setDepth(D);
    this.brewBar = this.add.rectangle(16, STATION_Y + 172, 0, 8, COLORS.good).setOrigin(0).setDepth(D);

    const mk = (x, y, w, label, fn) => {
      const b = makeButton(this, x, y, w, h, label, fn, { size: 14 });
      b.bg.setDepth(D);
      b.txt.setDepth(D + 1);
      return b;
    };

    this.baseBtns = {
      kopi: mk(col(0), row(0), bw, 'Kopi', () => this.pickBase('kopi')),
      teh: mk(col(1), row(0), bw, 'Teh', () => this.pickBase('teh')),
      milo: mk(col(2), row(0), bw, 'Milo', () => this.pickBase('milo')),
    };
    this.milkBtns = {
      condensed: mk(col(0), row(1), bw, 'Milk', () => this.setBuild({ milk: 'condensed' })),
      evap: mk(col(1), row(1), bw, 'C', () => this.setBuild({ milk: 'evap' })),
      none: mk(col(2), row(1), bw, 'O', () => this.setBuild({ milk: 'none' })),
    };
    this.sugarBtns = {
      normal: mk(col(0), row(2), bw, 'Sugar', () => this.setBuild({ sugar: 'normal' })),
      less: mk(col(1), row(2), bw, 'Siew dai', () => this.setBuild({ sugar: 'less' })),
      none: mk(col(2), row(2), bw, 'Kosong', () => this.setBuild({ sugar: 'none' })),
    };
    const half = (bw * 3 + gap * 2 - gap) / 2;
    this.pengBtn = mk(col(0), row(3), half, 'Peng (ice)', () => this.setBuild({ iced: !this.build.iced }));
    this.powderBtn = mk(col(0) + half + gap, row(3), half, 'Milo powder', () => this.setBuild({ topping: this.build.topping ? null : 'milo' }));

    const sy = row(4) + 6;
    this.throwBtn = mk(8, sy, 92, 'Throw', () => this.throwAway());
    this.serveBtn = makeButton(this, col(0), sy, bw * 3 + gap * 2, h + 8, 'SERVE', () => this.serve(), { size: 18, bold: true, fill: 0xbfe3c0 });
    this.serveBtn.bg.setDepth(D);
    this.serveBtn.txt.setDepth(D + 1);

    // Ids used by the tutorial to point at buttons (see BUTTON_IDS in src/data/tutorial.js).
    this.buttons = {
      kopi: this.baseBtns.kopi, teh: this.baseBtns.teh, milo: this.baseBtns.milo,
      milk: this.milkBtns.condensed, c: this.milkBtns.evap, o: this.milkBtns.none,
      sugar: this.sugarBtns.normal, siewdai: this.sugarBtns.less, kosong: this.sugarBtns.none,
      peng: this.pengBtn, powder: this.powderBtn, serve: this.serveBtn, throw: this.throwBtn,
    };
    if (import.meta.env.DEV) BUTTON_IDS.filter((id) => !this.buttons[id]).forEach((id) => console.warn('[tutorial] no button for id', id));

    // Oyen naps by the cash drawer (decor only)
    this.oyen = addSprite(this, 'oyen', 44, GAME_H - 6).setDepth(D + 1);
    this.tweens.add({ targets: this.oyen, scaleY: this.oyen.scaleY * 1.03, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    this.feedback = addText(this, 214, sy + 70, '', { size: 14, bold: true, align: 'center', origin: [0.5, 0], wrap: 270 }).setDepth(D);
    this.hint = addText(this, 214, GAME_H - 24, UI.tapHint, { size: 12, color: '#8a7a70', origin: [0.5, 0] }).setDepth(D);
  }

  // ---------- drink building ----------

  pickBase(base) {
    const b = { base };
    if (base === 'milo') Object.assign(b, { milk: null, sugar: null });
    else if (this.build.base === 'milo' || this.build.base === null) Object.assign(b, { milk: this.build.milk ?? 'condensed', sugar: this.build.sugar ?? 'normal', topping: null });
    if (base !== 'milo') b.topping = null;
    this.setBuild(b);
    this.startBrew();
  }

  setBuild(patch) {
    Object.assign(this.build, patch);
    this.refreshBuild();
  }

  startBrew() {
    this.brewTween?.stop();
    this.brewing = true;
    play('pour');
    this.brewBar.width = 0;
    this.brewTween = this.tweens.add({
      targets: this.brewBar,
      width: 76,
      duration: BREW_MS,
      onComplete: () => {
        this.brewing = false;
        this.refreshBuild();
      },
    });
    this.refreshBuild();
  }

  throwAway() {
    this.brewTween?.stop();
    this.brewing = false;
    this.brewBar.width = 0;
    this.build = freshBuild();
    this.refreshBuild();
  }

  refreshBuild() {
    const b = this.build;
    const milo = b.base === 'milo';
    for (const [k, btn] of Object.entries(this.baseBtns)) btn.setSelected(b.base === k);
    for (const [k, btn] of Object.entries(this.milkBtns)) btn.setEnabled(!milo).setSelected(!milo && b.milk === k);
    for (const [k, btn] of Object.entries(this.sugarBtns)) btn.setEnabled(!milo).setSelected(!milo && b.sugar === k);
    this.pengBtn.setSelected(b.iced);
    this.powderBtn.setEnabled(milo).setSelected(milo && !!b.topping);

    const shown = this.brewing || !b.base ? null : b;
    this.cup.setTexture(ensureCupTexture(this, shown));
    this.cupName.setText(b.base ? (this.brewing ? 'brewing...' : formatOrder(b)) : 'pick a base');
    this.refreshServe();
  }

  refreshServe() {
    this.refreshTarget();
    this.serveBtn.setEnabled(!!this.build.base && !this.brewing && !!this.target && !this.ended);
  }

  // ---------- customers ----------

  waitingCustomers() {
    return [this.queue[0], this.tableGuest].filter((c) => c?.state === 'waiting');
  }

  // Keep the chosen target if still waiting; otherwise counter first, then table.
  // With two people waiting, the target's bubble gets a pink border (tap a person to switch).
  refreshTarget() {
    const waiting = this.waitingCustomers();
    if (!waiting.includes(this.target)) this.target = waiting[0] ?? null;
    const highlight = waiting.length > 1;
    for (const c of [this.queue[0], this.tableGuest]) {
      const isTarget = highlight && c === this.target;
      c?.bubble?.frame?.setStrokeStyle(isTarget ? 3 : 2, isTarget ? COLORS.accent : COLORS.inkHex, 0.8);
    }
  }

  setTarget(c) {
    if (c?.state !== 'waiting') return;
    this.target = c;
    this.refreshServe();
  }

  // forcedId lets drama events (and tests) bring in a specific character.
  spawnCustomer(forcedId = null, forcedOrder = null) {
    // Groups take the whole counter: they only come when it's empty, and nobody queues behind them.
    const tableFree = !this.tableGuest;
    const groupAtCounter = this.queue.some((q) => q.n > 1);
    const fits = (c) => {
      if (c.slot === 'table') return tableFree;
      if (c.groupSize > 1) return this.queue.length === 0;
      return this.queue.length < MAX_QUEUE && !groupAtCounter;
    };
    const pool = CUSTOMERS.filter((c) => c.enabled && c.sprite && fits(c));
    // A forced spawn (events, tests) brings exactly that character, or nobody if there's no room.
    const forced = forcedId && CUSTOMERS.find((c) => c.id === forcedId);
    const def = forcedId ? (forced && fits(forced) ? forced : null) : pool.length ? weightedPick(pool) : null;
    if (!def) return null;

    const orderText = forcedOrder ?? weightedPick(def.orders).text;
    const n = def.groupSize;
    const slot = def.slot === 'table' ? 'table' : 'counter';
    const keys = n > 1 ? (def.sprites ?? Array(n).fill(def.sprite)).slice(0, n) : [def.sprite];
    const offsets = n > 1 ? GROUP_OFFSETS.slice(0, n) : [0];
    const startX = slot === 'table' ? TABLE_X : -60;
    const sprites = keys.map((key, i) =>
      addSprite(this, key, startX + offsets[i], FEET_Y - (i % 2) * 4)
        .setDepth(slot === 'table' ? 3 : 2 + (i % 2 ? 0 : 0.5))
        .setData('dx', offsets[i])
        .setData('dy', (i % 2) * 4)
        .setInteractive({ useHandCursor: true }),
    );
    const c = {
      def,
      slot,
      orderText,
      spec: parseOrder(orderText),
      n,
      served: 0,
      sprites,
      state: 'walking',
      patienceMax: def.patience * 1000,
      patienceMs: def.patience * 1000,
      bubble: null,
    };
    c.orderLine = pickLine(def.lines, 'order', this.lineVars({ order: orderText, n }));
    sprites.forEach((s) => s.on('pointerdown', () => this.setTarget(c)));

    if (slot === 'table') {
      this.tableGuest = c;
      sprites.forEach((s) => s.setAlpha(0));
      this.tweens.add({ targets: sprites, alpha: 1, duration: 600, onComplete: () => this.arrive(c) });
    } else {
      this.queue.push(c);
      this.walkTo(c, this.queue.length === 1 ? FRONT_X : BACK_X);
    }
    return c;
  }

  lineVars(extra = {}) {
    return { owner: this.owner.address, ...extra };
  }

  walkTo(c, x) {
    const front = x === FRONT_X;
    const dist = Math.abs(c.sprites[0].x - (x + c.sprites[0].getData('dx')));
    const duration = Math.max(400, dist * 9);
    c.sprites.forEach((s, i) => {
      this.tweens.add({ targets: s, x: x + s.getData('dx'), duration, ease: 'Linear' });
      this.tweens.add({ targets: s, y: FEET_Y - s.getData('dy') - 4, duration: 110, yoyo: true, repeat: Math.floor(duration / 220), delay: i * 40 });
    });
    this.time.delayedCall(duration + 60, () => {
      if (c.state === 'gone') return;
      if (front) this.arrive(c);
      // The person ahead may have left while we were still walking in: carry on to the front.
      else if (this.queue[0] === c) this.walkTo(c, FRONT_X);
      else c.state = 'queued';
    });
  }

  arrive(c) {
    if (c.state === 'gone') return;
    c.state = 'waiting';
    this.showBubble(c, c.orderLine, 'order');
    this.refreshServe();
  }

  headTop(c) {
    return Math.min(...c.sprites.map((s) => s.getBounds().top));
  }

  showBubble(c, text, kind) {
    this.clearBubble(c);
    const box = BUBBLE[c.slot];
    const { pad } = BUBBLE;
    const y = BUBBLE.y;
    const words = layoutLine(this, text, box.x + pad, y + pad, box.w - pad * 2, (key) => this.openGlossary(key), { size: BUBBLE.text });
    let h = words.height + pad * 2;
    const extras = [];
    if (kind === 'order' && c.n > 1) {
      extras.push(addText(this, box.x + pad, y + pad + words.height, `Cup ${c.served + 1}/${c.n}`, { size: 12, color: '#8a7a70' }));
      h += 16;
    }
    const frame = this.add.rectangle(box.x, y, box.w, h, 0xffffff).setOrigin(0).setStrokeStyle(2, COLORS.inkHex, 0.8).setDepth(8);
    frame.setInteractive().on('pointerdown', () => this.setTarget(c));
    const anchorX = c.slot === 'table' ? TABLE_X : FRONT_X;
    const tailX = Phaser.Math.Clamp(anchorX, box.x + 14, box.x + box.w - 14);
    const tail = this.add.triangle(0, 0, tailX - 7, y + h - 1, tailX + 7, y + h - 1, tailX, y + h + 9, 0xffffff).setOrigin(0).setDepth(8);
    [...words.objects, ...extras].forEach((o) => o.setDepth(9));
    const objs = [frame, tail, ...words.objects, ...extras];

    let bar = null;
    if (kind === 'order') {
      const by = y + h + 14;
      const bx = tailX - 32;
      objs.push(this.add.rectangle(bx, by, 64, 6, 0xe0d6c4).setOrigin(0).setDepth(8));
      bar = this.add.rectangle(bx, by, 64, 6, COLORS.good).setOrigin(0).setDepth(9);
      objs.push(bar);
    }
    c.bubble = { objs, frame, bar };
    this.updatePatienceBar(c);
    this.refreshTarget();
  }

  clearBubble(c) {
    c?.bubble?.objs.forEach((o) => o.destroy());
    if (c) c.bubble = null;
  }

  updatePatienceBar(c) {
    const bar = c.bubble?.bar;
    if (!bar) return;
    const f = Phaser.Math.Clamp(c.patienceMs / c.patienceMax, 0, 1);
    bar.width = Math.max(0, Math.round(64 * f));
    bar.fillColor = f > 0.35 ? COLORS.good : COLORS.accent;
  }

  serve() {
    this.refreshTarget();
    const c = this.target;
    if (!c || c.state !== 'waiting' || !this.build.base || this.brewing) return;

    const made = { ...this.build };
    const tier = scoreDrink(made, c.spec);
    const res = applyServe(this.econ, tier, c.spec);
    c.served += 1;
    c.state = 'reacting';
    logEvent(this.log, 'serve', { who: c.def.id, wanted: c.orderText, made: formatOrder(made), tier, waitMs: Math.round(c.patienceMax - c.patienceMs) }, this.clockMs);
    this.tutorial?.onServed(c, tier);
    play('clink');
    this.time.delayedCall(140, () => play('coin'));
    this.time.delayedCall(420, () => play(tier === 'oops' ? 'oops' : tier === 'perfect' ? 'perfect' : 'tap'));

    this.showBubble(c, pickLine(c.def.lines, tier, this.lineVars()), 'reaction');
    this.floatText(`+${formatMoney(res.paid + res.tip)}`, c.slot === 'table' ? TABLE_X : FRONT_X, this.headTop(c) - 8);
    const label = { perfect: 'Perfect!', close: 'Close enough~', oops: 'Oops, wrong drink' }[tier];
    const extra = res.tip ? ` (tip ${formatMoney(res.tip)})` : '';
    this.setFeedback(`${label} +${formatMoney(res.paid)}${extra}  ♥${res.happy > 0 ? '+' : ''}${res.happy}`);
    this.tweens.add({ targets: this.ownerSprite, scaleY: this.ownerSprite.scaleY * 0.94, duration: 80, yoyo: true });

    this.throwAway();
    this.refreshHud();

    if (c.served < c.n) {
      this.time.delayedCall(1300, () => {
        if (c.state === 'gone' || this.ended) return;
        c.state = 'waiting';
        c.patienceMs = Math.min(c.patienceMax, c.patienceMs + 8000);
        this.showBubble(c, c.orderLine, 'order');
        this.refreshServe();
      });
    } else {
      this.time.delayedCall(c.slot === 'table' ? TABLE_LINGER_MS : 1500, () => this.leave(c));
    }
  }

  timeout(c) {
    c.state = 'reacting';
    applyTimeout(this.econ);
    logEvent(this.log, 'timeout', { who: c.def.id }, this.clockMs);
    play('walkout');
    this.showBubble(c, pickLine(c.def.lines, 'timeout', this.lineVars()), 'reaction');
    this.setFeedback('They wandered off... ♥-1');
    this.refreshHud();
    this.refreshServe();
    this.time.delayedCall(1600, () => this.leave(c));
  }

  leave(c) {
    if (c.state === 'gone') return;
    c.state = 'gone';
    this.clearBubble(c);
    if (c === this.tableGuest) this.tableGuest = null;
    this.queue = this.queue.filter((q) => q !== c);
    c.sprites.forEach((s) => {
      this.tweens.add({ targets: s, alpha: 0, y: s.y - 12, duration: 450, onComplete: () => s.destroy() });
    });
    const next = this.queue[0];
    if (next && next.state === 'queued') {
      next.state = 'walking';
      this.walkTo(next, FRONT_X);
    }
    this.refreshServe();
  }

  // ---------- glossary / feedback ----------

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

  floatText(str, x, y) {
    const t = addText(this, x, y, str, { size: 16, bold: true, color: '#2f7a3a', origin: 0.5 }).setDepth(30);
    this.tweens.add({ targets: t, y: y - 32, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
  }

  setFeedback(str) {
    this.feedback.setText(str).setAlpha(1);
    this.tweens.killTweensOf(this.feedback);
    this.tweens.add({ targets: this.feedback, alpha: 0, delay: 2600, duration: 600 });
  }

  // ---------- clock / HUD ----------

  refreshHud() {
    const mins = OPEN_MIN + Math.floor((this.clockMs / DAY_MS) * (CLOSE_MIN - OPEN_MIN));
    const h24 = Math.floor(mins / 60);
    const mm = String(Math.floor((mins % 60) / 15) * 15).padStart(2, '0');
    const h12 = ((h24 + 11) % 12) + 1;
    this.hudClock.setText(`Day ${this.day}  ${h12}:${mm}${h24 < 12 ? 'am' : 'pm'}`);
    this.hudHappy.setText(`♥ ${this.econ.happiness}`);
    this.hudMoney.setText(formatMoney(this.econ.money));
  }

  update(_time, delta) {
    if (this.ended || this.paused) return;

    // The tutorial is a calm intro: the day clock and random spawns wait for it.
    const teaching = this.tutorial?.active;
    if (!teaching) this.clockMs = Math.min(DAY_MS, this.clockMs + delta);
    this.refreshHud();
    if (this.clockMs >= DAY_MS) {
      this.endDay();
      return;
    }

    if (!teaching) this.spawnInMs -= delta;
    if (this.spawnInMs <= 0) {
      const room = this.queue.length < MAX_QUEUE || !this.tableGuest;
      if (room && this.clockMs < LAST_SPAWN_MS && this.spawnCustomer()) this.spawnInMs = randBetween(6000, 12000);
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
    finishDay(this.log, this.econ);
    play('dayEnd');
    this.throwAway();
    for (const c of [...this.queue, this.tableGuest].filter(Boolean)) {
      c.state = 'gone';
      this.clearBubble(c);
      c.sprites.forEach((s) => this.tweens.add({ targets: s, alpha: 0, duration: 400, onComplete: () => s.destroy() }));
    }
    this.queue = [];
    this.tableGuest = null;
    this.refreshServe();
    this.setFeedback(UI.closing);

    const depth = 50;
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

    // Playtesters: copy a short summary of the day and paste it back for tuning.
    const copy = makeButton(this, cx - 90, top + 286, 180, 36, 'Copy playtest notes', () => this.copyNotes(copy), { size: 13 });
    copy.bg.setDepth(depth + 2);
    copy.txt.setDepth(depth + 3);
  }

  copyNotes(btn) {
    const text = summarize(this.log);
    const done = (label) => btn.txt.setText(label);
    try {
      navigator.clipboard.writeText(text).then(() => done('Copied!'), () => this.showNotes(text));
    } catch {
      this.showNotes(text);
    }
  }

  // Fallback when the clipboard is blocked: show the notes so they can be long-pressed and copied.
  showNotes(text) {
    window.prompt('Copy these playtest notes:', text);
  }
}
