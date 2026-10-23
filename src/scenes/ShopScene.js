import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { AISLES, SHOP } from '../data/shop.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { makeButton } from '../systems/ui.js';
import { play } from '../systems/sfx.js';
import { formatMoney } from '../systems/economy.js';
import { shopState, buy } from '../systems/shop.js';
import { saveRun } from '../systems/run.js';

// The night shop: Uncle Tan's Supplier Catalogue, between a day's summary and the next morning.
// Started with { run } = tomorrow's run; purchases are saved straight into it.

const LIST = { top: 116, bottom: 560 };
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

    // the stall at night: the day background, dimmed, with one warm bulb
    this.add.image(0, 0, 'stallBg').setOrigin(0).setDisplaySize(GAME_W, GAME_H);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x0b1430, 0.62).setOrigin(0);
    const glow = this.add.graphics();
    for (let r = 120; r > 0; r -= 12) glow.fillStyle(0xffd28a, 0.02).fillCircle(GAME_W / 2, 40, r);

    addText(this, GAME_W / 2, 14, "Uncle Tan's Supplier Catalogue", { size: 17, bold: true, color: '#fff6dc', origin: [0.5, 0] });
    addText(this, GAME_W / 2, 36, '供应商目录 · the stall is closed, time to shop', { size: 11, color: '#d8cbb5', origin: [0.5, 0] });
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
    this.input.on('pointerdown', (p) => (this.dragFrom = p.y >= LIST.top && p.y <= LIST.bottom ? { y: p.y, scroll: this.scroll } : null));
    this.input.on('pointermove', (p) => {
      if (!this.dragFrom || !p.isDown) return;
      this.setScroll(this.dragFrom.scroll + (this.dragFrom.y - p.y));
    });
    this.input.on('pointerup', () => (this.dragFrom = null));
    this.input.on('wheel', (p, over, dx, dy) => this.setScroll(this.scroll + dy * 0.5));

    this.note = addText(this, GAME_W / 2, LIST.bottom + 4, '', { size: 11, color: '#ffd28a', origin: [0.5, 0], align: 'center', wrap: 330 });
    const open = makeButton(this, GAME_W / 2 - 120, GAME_H - 54, 240, 46, `Open stall ▸  Day ${this.run.day}`, () => this.scene.start('Day', { run: this.run }), { size: 17, bold: true, fill: 0xbfe3c0 });
    open.bg.setDepth(DEPTH);
    open.txt.setDepth(DEPTH + 1);
    // cover strips so cards scrolled out of the list can't be tapped through the header or footer
    this.add.rectangle(0, 0, GAME_W, LIST.top, 0x000000, 0.001).setOrigin(0).setDepth(DEPTH - 1).setInteractive();
    this.add.rectangle(0, LIST.bottom, GAME_W, GAME_H - LIST.bottom, 0x000000, 0.001).setOrigin(0).setDepth(DEPTH - 1).setInteractive();

    this.showAisle(this.aisle);
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
    this.fameText.setText(`名气 ${Math.floor(this.run.fame)}`);
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
    const text = addText(this, x + 52, y + 27, item.text, { size: 11, wrap: w - 52 - 96, color: '#3a2e2a', lineSpacing: 1 });
    const h = Math.max(CARD_H, 27 + text.height + 22);
    const bg = this.add.rectangle(x, y, w, h, state === 'owned' ? 0xe6f2e1 : COLORS.paper, dim ? 0.82 : 1).setOrigin(0).setStrokeStyle(2, state === 'owned' ? 0x2f7a3a : COLORS.inkHex, 0.9);
    const icon = addText(this, x + 26, y + h / 2, item.icon, { size: 26, origin: 0.5 });
    const name = addText(this, x + 52, y + 8, item.name, { size: 14, bold: true, color: dim ? '#8a7a70' : '#3a2e2a' });
    const zh = addText(this, x + 52 + name.width + 6, y + 10, item.zh, { size: 11, color: '#8a7a70' });
    const tier = addText(this, x + 52, y + h - 16, item.tier ? `Fame ${item.tier}+` : 'Any fame', { size: 9, bold: true, color: '#8a5a1e' });
    this.list.add([bg, icon, name, zh, text, tier]); // bg first so it sits behind

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
    this.list.add([btn.bg, btn.txt]);
    if (state === 'money') this.list.add(addText(this, x + w - bw / 2 - 8, y + h / 2 + 20, 'not enough yet', { size: 9, color: '#c8402c', origin: [0.5, 0] }));
    return h;
  }

  tryBuy(item) {
    if (this.dragFrom && Math.abs(this.input.activePointer.y - this.dragFrom.y) > 8) return; // it was a scroll
    const next = buy(this.run, item);
    if (!next) return;
    this.run = next;
    saveRun(this.run);
    play('coin');
    this.note.setText(item.unlocks ? `${item.name} bought! Tomorrow a regular will order the new drink.` : `${item.name} bought! It works from tomorrow.`);
    const keep = this.scroll;
    this.renderList();
    this.setScroll(keep);
  }
}
