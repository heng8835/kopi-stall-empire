import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { AISLES, SHOP, SHOP_FROM_DAY } from '../data/shop.js';
import { addText } from '../systems/text.js';
import { STALL_PROPS } from '../data/stallProps.js';
import { MACHINE_TOOLS } from '../data/tools.js';
import { fitCamera } from '../systems/view.js';
import { makeButton, layoutLine, showGlossary } from '../systems/ui.js';
import { play } from '../systems/sfx.js';
import { formatMoney } from '../systems/economy.js';
import { shopState, buy, nextGoal, goalText } from '../systems/shop.js';
import { saveRun } from '../systems/run.js';
import { playMusic } from '../systems/music.js';

// Catalogue pictures borrowed from stall art until their own (docs/art/PROMPTS_2026-10.md part 5); the rest show their emoji.
const SHOP_ART = {
  menuBoard: 'propMenuBoard', cupRack: 'toolRack', markedGlass: 'cupGlass', longSpout: 'pourKopiPot', sugarScoop: 'toolSugar',
  milkPump: 'toolCondensed', brassSpoon: 'toolStir', iceMachine: 'iceCluster', twinSock: 'toolKopiPot',
};
const SHOP_TINT = { brassSpoon: 0xf0c060 }; // the same brass as the spoon at the stall

// The night shop: Uncle Tan's Supplier Catalogue, between a day's summary and the next morning.
// Started with { run } = tomorrow's run; purchases are saved straight into it.

const LIST = { top: 116, bottom: 546 };
const CONFIRM_MS = 8000; // a first tap on Buy asks; a second tap within this long buys (slow readers too)
const CARD_H = 84;
const DEPTH = 10;

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super('Shop');
  }

  create(data) {
    fitCamera(this);
    this.run = data.run;
    this.aisle = data.aisle ?? 'machine';
    this.scroll = 0;
    this.leaving = false; // Phaser reuses this scene object every night
    this.pending = null; // { id, at }: Buy tapped once, waiting for the confirming tap
    playMusic('night');

    // the stall at night, chairs up, one warm bulb; dimmed a little so the catalogue reads
    this.add.image(0, 0, 'stallNight').setOrigin(0).setDisplaySize(GAME_W, GAME_H);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x0b1430, 0.35).setOrigin(0);
    this.cameras.main.fadeIn(700, 11, 20, 48);

    // before SHOP_FROM_DAY: just the quiet stall at night
    if (this.run.day - 1 < SHOP_FROM_DAY) return this.quietNight();

    addText(this, GAME_W / 2, 14, "Uncle Tan's Supplier Catalogue", { size: 17, bold: true, color: '#fff6dc', origin: [0.5, 0] });
    // the subtitle line doubles as "what to save for next" (systems/shop.js nextGoal)
    this.goalText = addText(this, GAME_W / 2, 36, '', { size: 11, bold: true, color: '#bfe3ff', origin: [0.5, 0] });
    this.wallet = addText(this, 12, 54, '', { size: 14, bold: true, color: '#ffd28a' });
    this.fameText = addText(this, GAME_W - 12, 54, '', { size: 13, bold: true, color: '#fff6dc', origin: [1, 0] });

    // aisle tabs
    this.tabs = AISLES.map((a, i) => {
      const w = (GAME_W - 16 - 3 * 6) / 4;
      const b = makeButton(this, 8 + i * (w + 6), 78, w, 30, `${a.name}`, () => this.showAisle(a.id), { size: 12, bold: true });
      b.bg.setDepth(DEPTH);
      b.txt.setDepth(DEPTH + 1);
      return { id: a.id, b };
    });

    // the scrolling list of item cards (masked to the list area)
    this.list = this.add.container(0, LIST.top);
    const maskShape = this.make.graphics({ add: false }).fillRect(0, LIST.top, GAME_W, LIST.bottom - LIST.top);
    this.list.setMask(maskShape.createGeometryMask());
    this.input.on('pointerdown', (p) => (this.dragFrom = p.worldY >= LIST.top && p.worldY <= LIST.bottom ? { y: p.worldY, scroll: this.scroll } : null));
    this.input.on('pointermove', (p) => {
      if (!this.dragFrom || !p.isDown) return;
      this.setScroll(this.dragFrom.scroll + (this.dragFrom.y - p.worldY));
    });
    this.input.on('pointerup', () => (this.dragFrom = null));
    this.input.on('wheel', (p, over, dx, dy) => this.setScroll(this.scroll + dy * 0.5));

    this.note = addText(this, GAME_W / 2, LIST.bottom + 4, '', { size: 12, bold: true, color: '#ffd28a', origin: [0.5, 0], align: 'center', wrap: 340 });
    const open = makeButton(this, GAME_W / 2 - 120, GAME_H - 54, 240, 46, `Open stall ▸  Day ${this.run.day}`, () => this.openStall(), { size: 17, bold: true, fill: 0xbfe3c0 });
    open.bg.setDepth(DEPTH);
    open.txt.setDepth(DEPTH + 1);
    // cover strips so cards scrolled out of the list can't be tapped through the header or footer
    this.add.rectangle(0, 0, GAME_W, LIST.top, 0x000000, 0.001).setOrigin(0).setDepth(DEPTH - 1).setInteractive();
    this.add.rectangle(0, LIST.bottom, GAME_W, GAME_H - LIST.bottom, 0x000000, 0.001).setOrigin(0).setDepth(DEPTH - 1).setInteractive();

    this.showAisle(this.aisle);
  }

  quietNight() {
    const cx = GAME_W / 2;
    const card = [
      this.add.rectangle(cx, 300, 300, 150, COLORS.paper, 0.94).setStrokeStyle(3, COLORS.inkHex),
      addText(this, cx, 248, 'Shutters down. 收档啦.', { size: 18, bold: true, origin: 0.5 }),
      addText(this, cx, 290, `Day ${this.run.day - 1} done. The stall is quiet, the chairs are up.`, { size: 13, origin: 0.5, align: 'center', wrap: 270 }),
      addText(this, cx, 336, "Uncle Tan's supplier catalogue comes after Day 3: save up!", { size: 12, color: '#8a5a1e', origin: 0.5, align: 'center', wrap: 270 }),
    ];
    card.forEach((o, i) => {
      o.setAlpha(0);
      this.tweens.add({ targets: o, alpha: 1, duration: 400, delay: 150 + i * 90 });
    });
    const open = makeButton(this, cx - 120, GAME_H - 54, 240, 46, `Open stall ▸  Day ${this.run.day}`, () => this.openStall(), { size: 17, bold: true, fill: 0xbfe3c0 });
    open.bg.setDepth(DEPTH);
    open.txt.setDepth(DEPTH + 1);
  }

  // Morning: fade out of the night, the stall's shutter rolls up in StallScene.
  openStall() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(450, 11, 20, 48);
    this.run = { ...this.run, night: false }; // tonight's shopping is done: Continue goes to the day now
    saveRun(this.run);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Day', { run: this.run, morning: true }));
  }

  showAisle(id) {
    this.aisle = id;
    this.tabs.forEach((t) => t.b.setSelected(t.id === id));
    this.scroll = 0;
    this.renderList();
  }

  setScroll(v) {
    const max = Math.max(0, this.listH - (LIST.bottom - LIST.top));
    this.scroll = Phaser.Math.Clamp(v, 0, max);
    this.list.y = LIST.top - this.scroll;
  }

  renderList() {
    this.list.removeAll(true);
    this.wallet.setText(`Money ${formatMoney(this.run.money)}`);
    this.fameText.setText(`Fame 名气 ${Math.floor(this.run.fame)}`);
    this.goalText.setText(goalText(nextGoal(this.run)) ?? '供应商目录 · the stall is closed, time to shop');
    this.buttons = {}; // item id -> its Buy button (a first tap turns it into "Tap to confirm" in place)
    const items = SHOP.filter((i) => i.aisle === this.aisle);
    const blurb = AISLES.find((a) => a.id === this.aisle);
    this.list.add(addText(this, 12, 0, `${blurb.name} ${blurb.zh} · ${blurb.blurb}`, { size: 11, color: '#d8cbb5' }));
    let y = 18;
    for (const item of items) y += this.card(item, y) + 6;
    this.listH = y;
    this.setScroll(0);
  }

  // One item card at y; returns its height (it grows to fit the description).
  card(item, y) {
    const state = shopState(item, this.run);
    const x = 8;
    const w = GAME_W - 16;
    const dim = state === 'soon' || state === 'fame';
    // local words (pakciks, chope…) are tappable here too (round 4: Alex)
    const text = layoutLine(this, item.text, x + 52, y + 27, w - 52 - 96, (k) => showGlossary(this, k, () => {}), { size: 11, color: '#3a2e2a' });
    const h = Math.max(CARD_H, 27 + text.height + 18);
    const bg = this.add.rectangle(x, y, w, h, state === 'owned' ? 0xe6f2e1 : COLORS.paper, dim ? 0.82 : 1).setOrigin(0).setStrokeStyle(2, state === 'owned' ? 0x2f7a3a : COLORS.inkHex, 0.9);
    // the item's own art when it has some (stall props, machine tools), else its emoji
    const art = STALL_PROPS[item.id]?.[0]?.key ?? MACHINE_TOOLS[item.id]?.sprite ?? SHOP_ART[item.id] ?? null;
    const icon = art ? this.add.image(x + 26, y + h / 2, art) : addText(this, x + 26, y + h / 2, item.icon, { size: 26, origin: 0.5 });
    if (art) icon.setScale(Math.min(40 / icon.width, 40 / icon.height));
    const tint = MACHINE_TOOLS[item.id]?.tint ?? SHOP_TINT[item.id];
    if (art && tint) icon.setTint(tint);
    const name = addText(this, x + 52, y + 8, item.name, { size: 14, bold: true, color: dim ? '#8a7a70' : '#3a2e2a' });
    const zh = addText(this, x + 52 + name.width + 6, y + 10, item.zh, { size: 11, color: '#8a7a70' });
    const tier = addText(this, x + 52, y + h - 16, item.tier ? `Fame ${item.tier}+` : 'Any fame', { size: 9, bold: true, color: '#8a5a1e' });
    this.list.add([bg, icon, name, zh, ...text.objects, tier]); // bg first so it sits behind

    const label = {
      buy: `Buy ${formatMoney(item.price)}`,
      money: `${formatMoney(item.price)}`,
      owned: 'Owned ✓',
      fame: `🔒 Fame ${item.tier}`,
      soon: 'Coming soon',
      gift: 'Gift · Day 21',
    }[state];
    const bw = 88;
    const btn = makeButton(this, x + w - bw - 8, y + h / 2 - 18, bw, 36, label, () => this.tryBuy(item), {
      size: 11, bold: true, fill: state === 'buy' ? 0xbfe3c0 : state === 'owned' ? 0xd7ecd3 : 0xe8e0d0,
    });
    btn.setEnabled(state === 'buy');
    this.buttons[item.id] = { btn, label: label };
    this.list.add([btn.bg, btn.txt]);
    if (state === 'money') this.list.add(addText(this, x + w - bw / 2 - 8, y + h / 2 + 20, 'not enough yet', { size: 9, color: '#c8402c', origin: [0.5, 0] }));
    return h;
  }

  // id's Buy button shows "Tap to confirm" (gold); null puts the last one back.
  markPending(id) {
    const prev = this.pending && this.buttons[this.pending.id];
    if (prev && !id) {
      prev.btn.txt.setText(prev.label);
      prev.btn.refresh();
    }
    const b = id && this.buttons[id];
    if (b) {
      b.btn.txt.setText('Tap to confirm');
      b.btn.bg.setFillStyle(0xf2c14e);
    }
  }

  // First tap asks ("Tap to confirm"), the second buys: a scroll that starts on a button never buys.
  // The list is NOT rebuilt on the first tap (that used to shift the cards under a slow second tap):
  // just this button changes, in place.
  tryBuy(item) {
    const keep = this.scroll;
    if (this.pending?.id !== item.id || this.time.now - this.pending.at > CONFIRM_MS) {
      this.markPending(null);
      this.pending = { id: item.id, at: this.time.now };
      this.markPending(item.id);
      this.note.setText(`${item.name}: ${formatMoney(item.price)}. Tap again to buy.`);
      return;
    }
    this.pending = null;
    const next = buy(this.run, item);
    if (!next) return;
    this.run = next;
    saveRun(this.run);
    play('coin');
    this.note.setText(item.unlocks ? `${item.name} bought! A regular will order the new drink tomorrow.` : `${item.name} bought! It works from tomorrow.`);
    this.renderList();
    this.setScroll(keep);
    this.boughtPop(item);
  }

  // A purchase is a moment, not one line of text (round 4): a big "Bought!" pops over the list.
  boughtPop(item) {
    play('cheer');
    const cx = GAME_W / 2;
    const glow = this.add.circle(cx, 300, 70, 0xffe7a8, 0.85).setDepth(80).setScale(0.2);
    const t = addText(this, cx, 284, 'Bought!', { size: 30, bold: true, color: '#ffd23a', origin: 0.5 }).setDepth(81);
    const n = addText(this, cx, 318, item.name, { size: 15, bold: true, color: '#fff6dc', origin: 0.5, wrap: 260, align: 'center' }).setDepth(81);
    t.setStroke('#5a2e0e', 6);
    n.setStroke('#3a2414', 4);
    const objs = [glow, t, n];
    [t, n].forEach((o) => o.setScale(0.4));
    this.tweens.add({ targets: [t, n, glow], scale: 1, duration: 280, ease: 'Back.out' });
    this.tweens.add({ targets: objs, alpha: 0, y: '-=18', delay: 1100, duration: 450, onComplete: () => objs.forEach((o) => o.destroy()) });
  }
}
