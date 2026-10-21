import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { CUSTOMERS } from '../data/customers.js';
import { pickLine, UI } from '../i18n/lines.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { makeButton, layoutLine, showGlossary } from '../systems/ui.js';
import { parseOrder, formatOrder } from '../systems/order.js';
import { scoreDrink } from '../systems/scoring.js';
import { createDayState, applyServe, applyTimeout, formatMoney } from '../systems/economy.js';
import { ensureCupTexture } from '../systems/drinkSprite.js';
import { weightedPick, randBetween } from '../systems/random.js';

const DAY_MS = 180_000; // ~3 real minutes per day
const OPEN_MIN = 7 * 60; // 7:00am
const CLOSE_MIN = 19 * 60; // 7:00pm
const LAST_SPAWN_MS = DAY_MS - 15_000;
const BREW_MS = 1200; // "faster kettle" upgrade will shorten this (M3)
const MAX_QUEUE = 2;

// Layout (logical px, 180x320)
const HUD_H = 14;
const COUNTER_Y = 116;
const STATION_Y = 146;
const FEET_Y = 124; // counter hides only legs + slippers
const FRONT_X = 64;
const BACK_X = 6; // peeks in from the left edge
const CHAR_SCALE = 3;
const GROUP_OFFSETS = [-24, -8, 8, 24];
const BUBBLE = { x: 4, y: HUD_H + 4, w: 124, pad: 4 };

const freshBuild = () => ({ base: null, milk: 'condensed', sugar: 'normal', iced: false, topping: null });

export default class DayScene extends Phaser.Scene {
  constructor() {
    super('Day');
  }

  create(data) {
    fitCamera(this);
    this.day = data?.day ?? 1;
    this.econ = createDayState(data?.carry);
    this.clockMs = 0;
    this.spawnInMs = 1500;
    this.queue = [];
    this.build = freshBuild();
    this.brewing = false;
    this.paused = false;
    this.ended = false;
    this.bubbleObjs = [];

    this.drawBackdrop();
    this.drawHud();
    this.drawStation();
    this.refreshBuild();
  }

  // ---------- drawing ----------

  drawBackdrop() {
    this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.sky).setOrigin(0);
    // wainscot tiles behind the counter
    for (let x = 0; x < GAME_W; x += 10) {
      this.add.rectangle(x, 98, 10, 18, x % 20 ? 0xdff1e4 : 0xc9e6d2).setOrigin(0);
    }
    // stall signboard
    this.add.rectangle(128, 24, 48, 22, 0xd0463c).setOrigin(0).setStrokeStyle(1, 0x8c2a22);
    addText(this, 152, 29, '陈记 TAN', { size: 7, bold: true, color: '#fff1a8', origin: [0.5, 0] });
    addText(this, 152, 37, 'KOPI', { size: 6, bold: true, color: '#fff1a8', origin: [0.5, 0] });

    this.uncle = this.add.image(152, FEET_Y, 'uncleTan').setOrigin(0.5, 1).setScale(CHAR_SCALE).setDepth(1);
    this.tweens.add({ targets: this.uncle, y: FEET_Y - 1, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // counter (customers stand behind it, so it hides their legs)
    this.add.rectangle(0, COUNTER_Y, GAME_W, 4, COLORS.counterTop).setOrigin(0).setDepth(5);
    this.add.rectangle(0, COUNTER_Y + 4, GAME_W, STATION_Y - COUNTER_Y - 4, COLORS.counter).setOrigin(0).setDepth(5);
    this.add.rectangle(0, STATION_Y, GAME_W, GAME_H - STATION_Y, COLORS.paper).setOrigin(0).setDepth(5);
  }

  drawHud() {
    this.add.rectangle(0, 0, GAME_W, HUD_H, 0x2e5e63).setOrigin(0).setDepth(20);
    const opts = { size: 7, bold: true, color: '#ffffff' };
    this.hudClock = addText(this, 4, 3, '', opts).setDepth(21);
    this.hudHappy = addText(this, GAME_W / 2 + 14, 3, '', { ...opts, origin: [0.5, 0] }).setDepth(21);
    this.hudMoney = addText(this, GAME_W - 4, 3, '', { ...opts, origin: [1, 0] }).setDepth(21);
    this.refreshHud();
  }

  drawStation() {
    const D = 6;
    const bx = 54;
    const bw = 39;
    const gap = 2;
    const h = 22;
    const col = (i) => bx + i * (bw + gap);
    const row = (i) => STATION_Y + 3 + i * (h + 2);

    this.add.rectangle(4, STATION_Y + 3, 44, 70, 0xe8d9bd).setOrigin(0).setStrokeStyle(1, 0xcdb48c).setDepth(D);
    this.cup = this.add.image(26, STATION_Y + 2, 'cup:empty').setOrigin(0.5, 0).setScale(CHAR_SCALE).setDepth(D);
    this.cupName = addText(this, 26, STATION_Y + 52, '', { size: 6, bold: true, align: 'center', origin: [0.5, 0], wrap: 50 }).setDepth(D);
    this.brewBg = this.add.rectangle(8, STATION_Y + 76, 36, 4, 0xe0d6c4).setOrigin(0).setDepth(D);
    this.brewBar = this.add.rectangle(8, STATION_Y + 76, 0, 4, COLORS.good).setOrigin(0).setDepth(D);

    const mk = (i, r, label, fn, w = bw, x = col(i)) => {
      const b = makeButton(this, x, row(r), w, h, label, fn);
      b.bg.setDepth(D);
      b.txt.setDepth(D + 1);
      return b;
    };

    this.baseBtns = {
      kopi: mk(0, 0, 'Kopi', () => this.pickBase('kopi')),
      teh: mk(1, 0, 'Teh', () => this.pickBase('teh')),
      milo: mk(2, 0, 'Milo', () => this.pickBase('milo')),
    };
    this.milkBtns = {
      condensed: mk(0, 1, 'Milk', () => this.setBuild({ milk: 'condensed' })),
      evap: mk(1, 1, 'C', () => this.setBuild({ milk: 'evap' })),
      none: mk(2, 1, 'O', () => this.setBuild({ milk: 'none' })),
    };
    this.sugarBtns = {
      normal: mk(0, 2, 'Sugar', () => this.setBuild({ sugar: 'normal' })),
      less: mk(1, 2, 'Siew dai', () => this.setBuild({ sugar: 'less' })),
      none: mk(2, 2, 'Kosong', () => this.setBuild({ sugar: 'none' })),
    };
    const half = (bw * 3 + gap * 2 - gap) / 2;
    this.pengBtn = mk(0, 3, 'Peng (ice)', () => this.setBuild({ iced: !this.build.iced }), half, col(0));
    this.powderBtn = mk(0, 3, 'Milo powder', () => this.setBuild({ topping: this.build.topping ? null : 'milo' }), half, col(0) + half + gap);

    const sy = row(4) + 2;
    this.throwBtn = mk(0, 0, 'Throw', () => this.throwAway(), 46, 4);
    this.throwBtn.bg.setY(sy);
    this.throwBtn.txt.setY(sy + h / 2);
    this.serveBtn = makeButton(this, 54, sy, 122, h + 4, 'SERVE', () => this.serve(), { size: 9, bold: true, fill: 0xbfe3c0 });
    this.serveBtn.bg.setDepth(D);
    this.serveBtn.txt.setDepth(D + 1).setY(sy + (h + 4) / 2);

    this.feedback = addText(this, GAME_W / 2, sy + 32, '', { size: 7, bold: true, align: 'center', origin: [0.5, 0] }).setDepth(D);
    this.hint = addText(this, GAME_W / 2, GAME_H - 10, UI.tapHint, { size: 6, color: '#8a7a70', origin: [0.5, 0] }).setDepth(D);
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
    this.brewBar.width = 0;
    this.brewTween = this.tweens.add({
      targets: this.brewBar,
      width: 36,
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
    const front = this.queue[0];
    this.serveBtn.setEnabled(!!this.build.base && !this.brewing && front?.state === 'waiting' && !this.ended);
  }

  // ---------- customers ----------

  // forcedId lets drama events (and tests) bring in a specific character.
  spawnCustomer(forcedId = null) {
    const pool = CUSTOMERS.filter((c) => c.enabled && c.sprite);
    const def = (forcedId && CUSTOMERS.find((c) => c.id === forcedId)) || weightedPick(pool);
    const orderText = weightedPick(def.orders).text;
    const n = def.groupSize;
    const sprites = (n > 1 ? GROUP_OFFSETS.slice(0, n) : [0]).map((dx, i) =>
      this.add
        .image(-30 + dx, FEET_Y - (i % 2) * 2, def.sprite)
        .setOrigin(0.5, 1)
        .setScale(CHAR_SCALE)
        .setDepth(2 + (i % 2 ? 0 : 0.5))
        .setData('dx', dx)
        .setData('dy', (i % 2) * 2),
    );
    const c = {
      def,
      orderText,
      spec: parseOrder(orderText),
      n,
      served: 0,
      sprites,
      state: 'walking',
      patienceMax: def.patience * 1000,
      patienceMs: def.patience * 1000,
    };
    c.orderLine = pickLine(def.lines, 'order', { order: orderText, n });
    this.queue.push(c);
    this.walkTo(c, this.queue.length === 1 ? FRONT_X : BACK_X);
  }

  walkTo(c, x) {
    const front = x === FRONT_X;
    const dist = Math.abs(c.sprites[0].x - (x + c.sprites[0].getData('dx')));
    const duration = Math.max(400, dist * 18);
    c.sprites.forEach((s, i) => {
      this.tweens.add({ targets: s, x: x + s.getData('dx'), duration, ease: 'Linear' });
      this.tweens.add({ targets: s, y: FEET_Y - s.getData('dy') - 2, duration: 110, yoyo: true, repeat: Math.floor(duration / 220), delay: i * 40 });
    });
    this.time.delayedCall(duration + 60, () => {
      if (c.state === 'gone') return;
      if (front) this.arriveAtFront(c);
      else c.state = 'queued';
    });
  }

  arriveAtFront(c) {
    c.state = 'waiting';
    this.showBubble(c.orderLine, c);
    this.refreshServe();
  }

  showBubble(text, c, kind = 'order') {
    this.clearBubble();
    const { x, y, w, pad } = BUBBLE;
    const words = layoutLine(this, text, x + pad, y + pad, w - pad * 2, (key) => this.openGlossary(key));
    let h = words.height + pad * 2;
    const extras = [];
    if (kind === 'order' && c.n > 1) {
      extras.push(addText(this, x + pad, y + pad + words.height, `Cup ${c.served + 1}/${c.n}`, { size: 6, color: '#8a7a70' }));
      h += 8;
    }
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1).lineStyle(1, COLORS.inkHex, 0.7);
    g.fillRoundedRect(x, y, w, h, 4).strokeRoundedRect(x, y, w, h, 4);
    g.fillTriangle(FRONT_X - 4, y + h - 1, FRONT_X + 4, y + h - 1, FRONT_X, y + h + 5);
    g.lineBetween(FRONT_X - 4, y + h, FRONT_X, y + h + 5).lineBetween(FRONT_X + 4, y + h, FRONT_X, y + h + 5);
    g.setDepth(8);
    [...words.objects, ...extras].forEach((o) => o.setDepth(9));
    this.bubbleObjs = [g, ...words.objects, ...extras];

    if (kind === 'order') {
      const by = y + h + 8;
      const bg = this.add.rectangle(FRONT_X - 16, by, 32, 3, 0xe0d6c4).setOrigin(0).setDepth(8);
      this.patienceBar = this.add.rectangle(FRONT_X - 16, by, 32, 3, COLORS.good).setOrigin(0).setDepth(9);
      this.bubbleObjs.push(bg, this.patienceBar);
      this.updatePatienceBar(c);
    } else {
      this.patienceBar = null;
    }
  }

  clearBubble() {
    this.bubbleObjs.forEach((o) => o.destroy());
    this.bubbleObjs = [];
    this.patienceBar = null;
  }

  updatePatienceBar(c) {
    if (!this.patienceBar) return;
    const f = Phaser.Math.Clamp(c.patienceMs / c.patienceMax, 0, 1);
    this.patienceBar.width = Math.max(0, Math.round(32 * f));
    this.patienceBar.fillColor = f > 0.35 ? COLORS.good : COLORS.accent;
  }

  serve() {
    const c = this.queue[0];
    if (!c || c.state !== 'waiting' || !this.build.base || this.brewing) return;

    const made = { ...this.build };
    const tier = scoreDrink(made, c.spec);
    const res = applyServe(this.econ, tier, c.spec);
    c.served += 1;
    c.state = 'reacting';

    this.showBubble(pickLine(c.def.lines, tier), c, 'reaction');
    this.floatText(`+${formatMoney(res.paid + res.tip)}`, FRONT_X, 68);
    const label = { perfect: 'Perfect!', close: 'Close enough~', oops: 'Oops, wrong drink' }[tier];
    const extra = res.tip ? ` (tip ${formatMoney(res.tip)})` : '';
    this.setFeedback(`${label} +${formatMoney(res.paid)}${extra}  ♥${res.happy > 0 ? '+' : ''}${res.happy}`);
    this.tweens.add({ targets: this.uncle, scaleY: CHAR_SCALE * 0.92, duration: 80, yoyo: true });

    this.throwAway();
    this.refreshHud();

    if (c.served < c.n) {
      this.time.delayedCall(1300, () => {
        if (c.state === 'gone' || this.ended) return;
        c.state = 'waiting';
        c.patienceMs = Math.min(c.patienceMax, c.patienceMs + 8000);
        this.showBubble(c.orderLine, c);
        this.refreshServe();
      });
    } else {
      this.time.delayedCall(1500, () => this.leave(c));
    }
  }

  timeout(c) {
    c.state = 'reacting';
    applyTimeout(this.econ);
    this.showBubble(pickLine(c.def.lines, 'timeout'), c, 'reaction');
    this.setFeedback('They wandered off... ♥-1');
    this.refreshHud();
    this.refreshServe();
    this.time.delayedCall(1600, () => this.leave(c));
  }

  leave(c) {
    if (c.state === 'gone') return;
    c.state = 'gone';
    if (this.queue[0] === c) this.clearBubble();
    this.queue = this.queue.filter((q) => q !== c);
    c.sprites.forEach((s) => {
      this.tweens.add({ targets: s, alpha: 0, y: s.y - 6, duration: 450, onComplete: () => s.destroy() });
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
    this.tweens.pauseAll();
    this.time.paused = true;
    showGlossary(this, key, () => {
      this.paused = false;
      this.tweens.resumeAll();
      this.time.paused = false;
    });
  }

  floatText(str, x, y) {
    const t = addText(this, x, y, str, { size: 8, bold: true, color: '#2f7a3a', origin: 0.5 }).setDepth(30);
    this.tweens.add({ targets: t, y: y - 16, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
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
    const mm = String(Math.floor(mins % 60 / 15) * 15).padStart(2, '0');
    const h12 = ((h24 + 11) % 12) + 1;
    this.hudClock.setText(`Day ${this.day}  ${h12}:${mm}${h24 < 12 ? 'am' : 'pm'}`);
    this.hudHappy.setText(`♥ ${this.econ.happiness}`);
    this.hudMoney.setText(formatMoney(this.econ.money));
  }

  update(_time, delta) {
    if (this.ended || this.paused) return;

    this.clockMs = Math.min(DAY_MS, this.clockMs + delta);
    this.refreshHud();
    if (this.clockMs >= DAY_MS) {
      this.endDay();
      return;
    }

    this.spawnInMs -= delta;
    if (this.spawnInMs <= 0) {
      if (this.queue.length < MAX_QUEUE && this.clockMs < LAST_SPAWN_MS) {
        this.spawnCustomer();
        this.spawnInMs = randBetween(6000, 12000);
      } else {
        this.spawnInMs = 1500;
      }
    }

    const front = this.queue[0];
    if (front?.state === 'waiting') {
      front.patienceMs -= delta;
      this.updatePatienceBar(front);
      if (front.patienceMs <= 0) this.timeout(front);
    }
  }

  // ---------- day end ----------

  endDay() {
    this.ended = true;
    this.throwAway();
    this.clearBubble();
    this.queue.forEach((c) => {
      c.state = 'gone';
      c.sprites.forEach((s) => this.tweens.add({ targets: s, alpha: 0, duration: 400, onComplete: () => s.destroy() }));
    });
    this.queue = [];
    this.refreshServe();
    this.setFeedback(UI.closing);

    const depth = 50;
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.35).setOrigin(0).setDepth(depth).setInteractive();
    const cx = GAME_W / 2;
    const cardW = 150;
    const top = 70;
    this.add.rectangle(cx - cardW / 2, top, cardW, 150, COLORS.paper).setOrigin(0).setStrokeStyle(1, COLORS.inkHex).setDepth(depth + 1);
    const t = (y, str, o = {}) => addText(this, cx, top + y, str, { size: 8, align: 'center', origin: [0.5, 0], ...o }).setDepth(depth + 2);
    t(10, UI.dayDone.replace('{day}', this.day), { size: 12, bold: true });
    t(28, UI.dayDoneZh, { size: 8 });
    const e = this.econ;
    t(48, `Cups served: ${e.served}  (perfect ${e.perfect})`);
    t(62, `Earned today: ${formatMoney(e.earnedToday)}`);
    t(76, `Happiness: ♥ ${e.happiness}`);
    if (e.walkedOut) t(90, `${e.walkedOut} wandered off — no worries lah`, { size: 6, color: '#8a7a70' });

    const btn = makeButton(this, cx - 45, top + 112, 90, 26, UI.closeStall, () => this.scene.start('Title'), { size: 9, bold: true, fill: 0xbfe3c0 });
    btn.bg.setDepth(depth + 2);
    btn.txt.setDepth(depth + 3);
  }
}
