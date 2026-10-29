import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { OPENING, OPENING_SUMMARY } from '../data/opening.js';
import { OWNERS } from '../data/owners.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite } from '../systems/sprites.js';
import { layoutLine, showGlossary } from '../systems/ui.js';
import { play } from '../systems/sfx.js';
import { fill } from '../systems/story.js';
import { load, save } from '../systems/save.js';
import { playMusic } from '../systems/music.js';

const GLOSS_SETTLE_MS = 900; // see openGlossary

// The opening cutscene, the month's prologue (src/data/opening.js): an episode-style title card,
// full-screen backgrounds that slowly drift, narration and spoken lines in a box at the bottom,
// a phone chat that fills up message by message, tap to go on, Skip at any time. Then Day 1.
// Started by TitleScene with { run } the first time a month starts (save key 'openingSeen').

const BOX_Y = 470;
const BOX_H = 150;
const FADE_MS = 700;
const TITLE_HOLD_MS = 1800; // the title card moves on by itself (a tap skips it)
const PHONE = { x: GAME_W / 2 - 112, y: 64, w: 224, h: 360 }; // the chat area runs to the bottom less 18
const CHAT_TOP = PHONE.y + 70;
const CHAT_W = 156;

export const openingSeen = () => load('openingSeen', false);

export default class OpeningScene extends Phaser.Scene {
  constructor() {
    super('Opening');
  }

  preload() {
    this.cameras.main.setBackgroundColor('#000000'); // black (not the game's sky blue) while the pictures load
    for (const key of new Set(OPENING.map((p) => p.bg))) if (!this.textures.exists(key)) this.load.image(key, `bg/${key}.webp`);
  }

  create(data) {
    fitCamera(this);
    this.run = data.run;
    this.owner = OWNERS[this.registry.get('owner') ?? load('owner', 'mei')] ?? OWNERS.mei;
    this.vars = { name: this.owner.name, owner: this.owner.address };
    // Phaser reuses this scene object: reset per-play state.
    this.panel = -1;
    this.line = 0;
    this.bg = null;
    this.box = [];
    this.layer = [];
    this.chat = []; // bubbles on the phone, oldest first: { objs, h }
    this.titleCard = null;
    this.done = false;
    this.glossaryOpen = false;

    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000).setOrigin(0).setInteractive().on('pointerdown', () => this.time.now - (this.lineAt ?? 0) >= 200 && this.advance()); // a double tap can't skip a line
    const skip = addText(this, GAME_W - 10, 12, 'Skip ▸▸', { size: 13, bold: true, color: '#fff6dc', origin: [1, 0] }).setDepth(30);
    skip.setStroke('#2b2420', 3);
    skip.setInteractive({ useHandCursor: true }).on('pointerdown', (p, x, y, e) => {
      e?.stopPropagation?.();
      this.skipToSummary();
    });
    playMusic('finale'); // One Month to Try
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.nextPanel();
  }

  advance() {
    if (this.done || this.glossaryOpen) return;
    if (this.summary) return this.finish();
    if (this.titleCard) return this.closeTitle();
    if (this.line < OPENING[this.panel].lines.length - 1) {
      this.line++;
      return this.showLine();
    }
    this.nextPanel();
  }

  nextPanel() {
    this.panel++;
    if (this.panel >= OPENING.length) return this.finish();
    const p = OPENING[this.panel];
    this.line = 0;
    this.layer.forEach((o) => o.destroy());
    this.layer = [];
    this.chat = [];
    if (this.bg?.texture.key !== p.bg) this.showBackground(p.bg);
    if (p.phone) this.showPhone();
    if (p.owner) this.showOwner();
    if (p.title) return this.showTitle(p.title);
    this.showLine();
  }

  // Cover the screen with the background (its sides cropped), fade it in over the last one and
  // let it drift slowly closer.
  showBackground(key) {
    const old = this.bg;
    const img = this.add.image(GAME_W / 2, GAME_H / 2, key).setDepth(1).setAlpha(0);
    const cover = Math.max(GAME_W / img.width, GAME_H / img.height);
    img.setScale(cover);
    this.tweens.add({ targets: img, alpha: 1, duration: FADE_MS, onComplete: () => old?.destroy() });
    this.tweens.add({ targets: img, scale: cover * 1.08, duration: 14000, ease: 'Sine.inOut' });
    this.bg = img;
  }

  // Like an episode: a dark band with the title, then the panel's first line.
  showTitle({ ep, zh, en }) {
    const band = this.add.rectangle(0, GAME_H / 2 - 80, GAME_W, 160, 0x000000, 0.6).setOrigin(0).setDepth(20);
    const t = (y, s, o) => addText(this, GAME_W / 2, y, s, { align: 'center', origin: 0.5, color: '#fff6dc', ...o }).setDepth(21);
    const objs = [band, t(GAME_H / 2 - 44, ep, { size: 14, bold: true, color: '#f2c14e' }), t(GAME_H / 2 - 8, zh, { size: 30, bold: true }), t(GAME_H / 2 + 32, en, { size: 17 })];
    objs.forEach((o, i) => {
      o.setAlpha(0);
      this.tweens.add({ targets: o, alpha: 1, duration: 450, delay: 300 + i * 140 });
    });
    play('dayEnd');
    this.titleCard = objs;
    this.time.delayedCall(TITLE_HOLD_MS, () => this.titleCard === objs && this.closeTitle());
  }

  closeTitle() {
    const objs = this.titleCard;
    this.titleCard = null;
    this.tweens.add({ targets: objs, alpha: 0, duration: 300, onComplete: () => objs.forEach((o) => o.destroy()) });
    this.showLine();
  }

  // A phone drawn in code, held up in the middle of the screen; chat lines appear on it.
  showPhone() {
    const { x, y, w, h } = PHONE;
    const phone = this.add.graphics().setDepth(5);
    phone.fillStyle(0x1f1f24, 1).fillRoundedRect(x, y, w, h, 22).lineStyle(3, COLORS.inkHex).strokeRoundedRect(x, y, w, h, 22);
    phone.fillStyle(0xe9f1ea, 1).fillRoundedRect(x + 10, y + 26, w - 20, h - 46, 10);
    phone.fillStyle(0x3d7a55, 1).fillRect(x + 10, y + 26, w - 20, 34);
    const head = addText(this, x + 22, y + 35, 'Uncle Tan', { size: 13, bold: true, color: '#ffffff' }).setDepth(6);
    const time = addText(this, x + w - 22, y + 37, '11:47 pm', { size: 10, color: '#d7eadc', origin: [1, 0] }).setDepth(6);
    const all = [phone, head, time];
    all.forEach((o) => o.setAlpha(0).setY(o.y + 40));
    this.tweens.add({ targets: all, y: '-=40', alpha: 1, duration: 500, ease: 'Back.out', delay: 200 });
    // chat bubbles scroll inside the screen
    const mask = this.make.graphics({ add: false }).fillRect(x + 10, CHAT_TOP - 8, w - 20, y + h - 20 - (CHAT_TOP - 8));
    this.chatMask = mask.createGeometryMask();
    this.layer.push(...all);
  }

  // One message on the phone: theirs on the left (white), mine on the right (green).
  addChat({ chat, text }) {
    const mine = chat === 'me';
    const words = layoutLine(this, fill(text, this.vars), 0, 0, CHAT_W - 20, (k) => this.openGlossary(k), { size: 12 });
    const bw = Math.min(CHAT_W, words.width + 20);
    const bh = words.height + 14;
    const bx = mine ? PHONE.x + PHONE.w - 18 - bw : PHONE.x + 18;
    const last = this.chat.at(-1);
    const by = last ? last.y + last.h + 8 : CHAT_TOP;
    const bubble = this.add.graphics().setDepth(6);
    bubble.fillStyle(mine ? 0xd4f5c4 : 0xffffff, 1).fillRoundedRect(0, 0, bw, bh, 9).lineStyle(2, 0xc2d3c6).strokeRoundedRect(0, 0, bw, bh, 9);
    bubble.setPosition(bx, by);
    words.objects.forEach((o) => o.setPosition(o.x + bx + 10, o.y + by + 7).setDepth(7));
    const objs = [bubble, ...words.objects];
    objs.forEach((o) => o.setMask(this.chatMask));
    const msg = { objs, y: by, h: bh };
    this.chat.push(msg);
    this.layer.push(...objs);
    // pop in, then scroll everything up if the screen is full
    objs.forEach((o) => {
      o.setAlpha(0);
      this.tweens.add({ targets: o, alpha: 1, duration: 220 });
    });
    const overflow = by + bh - (PHONE.y + PHONE.h - 26);
    if (overflow > 0) {
      for (const m of this.chat) {
        m.y -= overflow;
        this.tweens.add({ targets: m.objs, y: `-=${overflow}`, duration: 260, ease: 'Cubic.out' });
      }
    }
    play(mine ? 'pickup' : 'tap');
  }

  // The owner walks in from the left, towards the shutter.
  showOwner() {
    const s = addSprite(this, this.owner.sprite, -60, BOX_Y - 18, 150).setDepth(5);
    this.tweens.add({ targets: s, x: GAME_W * 0.36, duration: 1800, ease: 'Sine.out', delay: 400 });
    this.layer.push(s);
  }

  // The current line: narration (dark box), a spoken line (paper box + name tag) or a chat message.
  showLine() {
    const p = OPENING[this.panel];
    const entry = p.lines[this.line];
    const last = this.line === p.lines.length - 1;
    const end = last && this.panel === OPENING.length - 1;
    if (entry.chat) {
      this.lineAt = this.time.now; // a tap on a word in a fresh message moves on (round 5: "OK! I try!" took 3-4 taps)
      this.box.forEach((o) => o.destroy());
      this.box = [addText(this, GAME_W / 2, PHONE.y + PHONE.h + 12, '▼ tap', { size: 12, bold: true, color: '#fff6dc', origin: [0.5, 0] }).setDepth(11)];
      this.box[0].setStroke('#2b2420', 3);
      return this.addChat(entry);
    }
    this.box.forEach((o) => o.destroy());
    const spoken = typeof entry === 'object';
    const text = fill(spoken ? entry.text : entry, this.vars);
    const box = this.add.rectangle(12, BOX_Y, GAME_W - 24, BOX_H, spoken ? COLORS.paper : 0x2b2420, spoken ? 1 : 0.92).setOrigin(0).setStrokeStyle(3, COLORS.inkHex).setDepth(10);
    this.lineAt = this.time.now; // an orange word only opens once the line has settled (openGlossary)
    const words = layoutLine(this, text, 28, BOX_Y + 22, GAME_W - 56, (k) => this.openGlossary(k), spoken ? { size: 16 } : { size: 16, color: '#fff6dc', termColor: '#f2c14e' });
    words.objects.forEach((o) => o.setDepth(11).setAlpha(0));
    this.tweens.add({ targets: words.objects, alpha: 1, duration: 300 });
    const more = addText(this, GAME_W - 26, BOX_Y + BOX_H - 22, end ? 'tap to open the stall ▸' : '▼', { size: 12, color: spoken ? '#8a7a70' : '#d8cbb5', origin: [1, 0] }).setDepth(11);
    this.box = [box, ...words.objects, more];
    if (spoken) {
      const name = entry.who === 'kid' ? `Little ${this.vars.name}` : 'Uncle Tan';
      const tag = addText(this, 26, BOX_Y - 12, name, { size: 14, bold: true, color: '#fff6dc' }).setDepth(12);
      const bg = this.add.rectangle(20, BOX_Y - 15, tag.width + 14, 24, 0xc8562e).setOrigin(0).setStrokeStyle(2, COLORS.inkHex).setDepth(11);
      this.box.push(bg, tag);
    }
    play('tap');
    if (last && p.day) {
      const t = addText(this, GAME_W / 2, 90, p.day, { size: 34, bold: true, color: '#fff6dc', align: 'center', origin: 0.5 }).setDepth(12).setAlpha(0);
      t.setStroke('#3a2414', 6);
      this.tweens.add({ targets: t, alpha: 1, y: 100, duration: 700, delay: 300 });
      this.layer.push(t);
      play('dayEnd');
    }
  }

  // A tap on an orange word right as its line comes up was meant to move on (round 3: the word stole it).
  openGlossary(key) {
    if (this.time.now - (this.lineAt ?? 0) < GLOSS_SETTLE_MS) return this.advance();
    this.glossaryOpen = true;
    showGlossary(this, key, () => this.time.delayedCall(0, () => (this.glossaryOpen = false)));
  }

  // Skip: the story so far in one card (round 5: skipping lost who gave you the stall and why), then Day 1.
  skipToSummary() {
    if (this.done || this.summary) return this.finish();
    this.summary = true;
    this.titleCard = null;
    [...this.layer, ...this.box].forEach((o) => o.destroy());
    this.layer = [];
    this.box = [];
    const card = this.add.rectangle(20, 200, GAME_W - 40, 230, 0x2b2420, 0.94).setOrigin(0).setStrokeStyle(3, COLORS.inkHex).setDepth(20);
    const head = addText(this, GAME_W / 2, 226, '序章 · The story so far', { size: 15, bold: true, color: '#f2c14e', origin: [0.5, 0] }).setDepth(21);
    const body = addText(this, GAME_W / 2, 262, fill(OPENING_SUMMARY, this.vars), { size: 15, color: '#fff6dc', origin: [0.5, 0], align: 'center', wrap: GAME_W - 76, lineSpacing: 5 }).setDepth(21);
    const more = addText(this, GAME_W / 2, 400, 'tap to open the stall ▸', { size: 12, color: '#d8cbb5', origin: [0.5, 0] }).setDepth(21);
    this.lineAt = this.time.now;
    [card, head, body, more].forEach((o) => {
      o.setAlpha(0);
      this.tweens.add({ targets: o, alpha: 1, duration: 300 });
    });
  }

  finish() {
    if (this.done) return;
    this.done = true;
    save('openingSeen', true);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Day', { run: this.run }));
  }
}
