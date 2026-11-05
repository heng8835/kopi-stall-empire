import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { CUSTOMERS, WALK_INS } from '../data/customers.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { makeButton } from '../systems/ui.js';
import { formatMoney } from '../systems/economy.js';
import { hearts, cupsToNext, favourite, FAVOURITE_AT, FRIEND_GIFT, MAX_HEARTS } from '../systems/friends.js';

// Regulars: who you've got to know, from the night shop (round 6: the hearts were never explained).
// Started with { run, aisle }; goes back to the shop on the same aisle.

const LIST = { top: 96, bottom: 572 };
const ROW_H = 74;
const DEPTH = 10;

export default class RegularsScene extends Phaser.Scene {
  constructor() {
    super('Regulars');
  }

  create(data) {
    fitCamera(this);
    this.run = data.run;
    this.scroll = 0;
    this.add.image(0, 0, 'stallNight').setOrigin(0).setDisplaySize(GAME_W, GAME_H);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x0b1430, 0.5).setOrigin(0);
    addText(this, GAME_W / 2, 12, 'Regulars 老朋友', { size: 18, bold: true, color: '#fff6dc', origin: [0.5, 0] });
    addText(this, GAME_W / 2, 38, `Good cups earn ♥. Each ♥: waits 8% longer, +5¢ a cup. ♥${FAVOURITE_AT}: their favourite. ♥${MAX_HEARTS}: the regulars' thanks, ${formatMoney(FRIEND_GIFT.cents)} and 名气 +${FRIEND_GIFT.fame}, once.`, { size: 11, color: '#ffe7a8', origin: [0.5, 0], align: 'center', wrap: 336 });

    this.list = this.add.container(0, LIST.top);
    const maskShape = this.make.graphics({ add: false }).fillRect(0, LIST.top, GAME_W, LIST.bottom - LIST.top);
    this.list.setMask(maskShape.createGeometryMask());
    const people = [...CUSTOMERS.filter((c) => c.enabled !== false), ...WALK_INS];
    people.forEach((def, i) => this.row(def, i * (ROW_H + 6)));
    this.listH = people.length * (ROW_H + 6);

    this.input.on('pointerdown', (p) => (this.dragFrom = p.worldY >= LIST.top && p.worldY <= LIST.bottom ? { y: p.worldY, scroll: this.scroll } : null));
    this.input.on('pointermove', (p) => {
      if (!this.dragFrom || !p.isDown) return;
      this.setScroll(this.dragFrom.scroll + (this.dragFrom.y - p.worldY));
    });
    this.input.on('pointerup', () => (this.dragFrom = null));
    this.input.on('wheel', (p, over, dx, dy) => this.setScroll(this.scroll + dy * 0.5));

    const back = makeButton(this, GAME_W / 2 - 120, GAME_H - 58, 240, 46, '◂ Back to the shop', () => this.scene.start('Shop', { run: this.run, aisle: data.aisle }), { size: 16, bold: true, onRelease: true });
    back.bg.setDepth(DEPTH);
    back.txt.setDepth(DEPTH + 1);
  }

  setScroll(v) {
    this.scroll = Phaser.Math.Clamp(v, 0, Math.max(0, this.listH - (LIST.bottom - LIST.top)));
    this.list.y = LIST.top - this.scroll;
  }

  row(def, y) {
    const x = 8;
    const w = GAME_W - 16;
    const points = this.run.friends?.[def.id];
    const met = points !== undefined;
    const h = hearts(points);
    const objs = [this.add.rectangle(x, y, w, ROW_H, COLORS.paper, met ? 1 : 0.72).setOrigin(0).setStrokeStyle(2, COLORS.inkHex, 0.9)];
    const pic = this.add.image(x + 32, y + ROW_H / 2, def.sprite);
    pic.setScale(Math.min(58 / pic.width, 64 / pic.height));
    if (!met) pic.setTint(0x3a2e2a); // a silhouette until you've met
    objs.push(pic);
    objs.push(addText(this, x + 66, y + 7, met ? def.name : '???', { size: 14, bold: true, color: met ? '#3a2e2a' : '#8a7a70' }));
    if (!met) {
      objs.push(addText(this, x + 66, y + 30, 'Not met yet', { size: 11, color: '#8a7a70' }));
    } else {
      for (let i = 0; i < MAX_HEARTS; i++) objs.push(this.add.image(x + w - 16 - (MAX_HEARTS - i) * 16, y + 9, i < h ? 'heart' : 'heartEmpty').setOrigin(0).setDisplaySize(15, 14));
      const next = cupsToNext(points);
      const given = this.run.friendGifts?.includes(def.id);
      const status = next != null ? `${next} perfect cup${next === 1 ? '' : 's'} to ♥${h + 1}` : !def.giftLine ? 'Old friend' : given ? 'Old friend · thanks given ✓' : 'Old friend · a thank-you on their next cup';
      objs.push(addText(this, x + 66, y + 31, status, { size: 11, color: '#5e4e44' }));
      objs.push(addText(this, x + 66, y + 50, h >= FAVOURITE_AT ? `Favourite: ${favourite(def)}` : `Favourite: ♥${FAVOURITE_AT} to find out`, { size: 11, bold: h >= FAVOURITE_AT, color: h >= FAVOURITE_AT ? '#b0405a' : '#8a7a70' }));
    }
    this.list.add(objs);
  }
}
