import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { OPENING } from '../data/opening.js';
import { OWNERS } from '../data/owners.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite } from '../systems/sprites.js';
import { layoutLine, showGlossary } from '../systems/ui.js';
import { play } from '../systems/sfx.js';
import { fill } from '../systems/story.js';
import { load, save } from '../systems/save.js';

// The opening cutscene (src/data/opening.js): full-screen backgrounds that slowly drift, a
// narration box at the bottom, tap to go on, Skip at any time. Then Day 1 starts.
// Started by TitleScene with { run } the first time a month starts (save key 'openingSeen').

const BOX_Y = 470;
const BOX_H = 150;
const FADE_MS = 700;

export const openingSeen = () => load('openingSeen', false);

export default class OpeningScene extends Phaser.Scene {
  constructor() {
    super('Opening');
  }

  preload() {
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
    this.done = false;
    this.glossaryOpen = false;

    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000).setOrigin(0).setInteractive().on('pointerdown', () => this.advance());
    const skip = addText(this, GAME_W - 10, 12, 'Skip ▸▸', { size: 13, bold: true, color: '#fff6dc', origin: [1, 0] }).setDepth(30);
    skip.setStroke('#2b2420', 3);
    skip.setInteractive({ useHandCursor: true }).on('pointerdown', (p, x, y, e) => {
      e?.stopPropagation?.();
      this.finish();
    });
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.nextPanel();
  }

  advance() {
    if (this.done || this.glossaryOpen) return;
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
    if (this.bg?.texture.key !== p.bg) this.showBackground(p.bg);
    if (p.phone) this.showPhone(p.phone);
    if (p.owner) this.showOwner();
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

  // A phone drawn in code, held up in the middle of the screen, with one chat message.
  showPhone({ from, text }) {
    const w = 210;
    const h = 300;
    const x = GAME_W / 2 - w / 2;
    const y = 120;
    const phone = this.add.graphics().setDepth(5);
    phone.fillStyle(0x1f1f24, 1).fillRoundedRect(x, y, w, h, 22).lineStyle(3, COLORS.inkHex).strokeRoundedRect(x, y, w, h, 22);
    phone.fillStyle(0xe9f1ea, 1).fillRoundedRect(x + 10, y + 26, w - 20, h - 46, 10);
    phone.fillStyle(0x3d7a55, 1).fillRect(x + 10, y + 26, w - 20, 34);
    const head = addText(this, x + 22, y + 35, from, { size: 13, bold: true, color: '#ffffff' }).setDepth(6);
    const words = layoutLine(this, fill(text, this.vars), x + 28, y + 84, w - 64, (k) => this.openGlossary(k), { size: 13 });
    const bh = words.height + 20;
    const bubble = this.add.graphics().setDepth(6);
    bubble.fillStyle(0xffffff, 1).fillRoundedRect(x + 18, y + 74, w - 44, bh, 10).lineStyle(2, 0xc9d6cc).strokeRoundedRect(x + 18, y + 74, w - 44, bh, 10);
    words.objects.forEach((o) => o.setDepth(7));
    const time = addText(this, x + w - 30, y + 78 + bh, '11:47 pm ✓✓', { size: 9, color: '#6b7d70', origin: [1, 0] }).setDepth(6);
    const all = [phone, head, bubble, ...words.objects, time];
    all.forEach((o) => o.setAlpha(0).setY(o.y + 40));
    this.tweens.add({ targets: all, y: '-=40', alpha: 1, duration: 500, ease: 'Back.out', delay: 300 });
    play('tap');
    this.layer.push(...all);
  }

  // The owner walks in from the left, towards the shutter.
  showOwner() {
    const s = addSprite(this, this.owner.sprite, -60, BOX_Y - 18, 150).setDepth(5);
    this.tweens.add({ targets: s, x: GAME_W * 0.36, duration: 1800, ease: 'Sine.out', delay: 400 });
    this.layer.push(s);
  }

  showLine() {
    this.box.forEach((o) => o.destroy());
    const p = OPENING[this.panel];
    const last = this.line === p.lines.length - 1;
    const end = last && this.panel === OPENING.length - 1;
    const box = this.add.rectangle(12, BOX_Y, GAME_W - 24, BOX_H, 0x2b2420, 0.92).setOrigin(0).setStrokeStyle(3, COLORS.inkHex).setDepth(10);
    const words = layoutLine(this, fill(p.lines[this.line], this.vars), 28, BOX_Y + 20, GAME_W - 56, (k) => this.openGlossary(k), { size: 16, color: '#fff6dc', termColor: '#f2c14e' });
    words.objects.forEach((o) => o.setDepth(11).setAlpha(0));
    this.tweens.add({ targets: words.objects, alpha: 1, duration: 350 });
    const more = addText(this, GAME_W - 26, BOX_Y + BOX_H - 22, end ? 'tap to open the stall ▸' : '▼', { size: 12, color: '#d8cbb5', origin: [1, 0] }).setDepth(11);
    this.box = [box, ...words.objects, more];
    if (last && p.title) {
      const t = addText(this, GAME_W / 2, 90, p.title, { size: 34, bold: true, color: '#fff6dc', align: 'center', origin: 0.5 }).setDepth(12).setAlpha(0);
      t.setStroke('#3a2414', 6);
      this.tweens.add({ targets: t, alpha: 1, y: 100, duration: 700, delay: 300 });
      this.layer.push(t);
      play('dayEnd');
    }
  }

  openGlossary(key) {
    this.glossaryOpen = true;
    showGlossary(this, key, () => this.time.delayedCall(0, () => (this.glossaryOpen = false)));
  }

  finish() {
    if (this.done) return;
    this.done = true;
    save('openingSeen', true);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Day', { run: this.run }));
  }
}
