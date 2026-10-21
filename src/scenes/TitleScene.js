import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite } from '../systems/sprites.js';
import { makeButton } from '../systems/ui.js';
import { load, save } from '../systems/save.js';
import { OWNERS } from '../data/owners.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    fitCamera(this);
    const cx = GAME_W / 2;
    this.owner = load('owner', 'mei');
    if (!OWNERS[this.owner]) this.owner = 'mei';

    this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.sky).setOrigin(0);
    this.add.rectangle(0, 420, GAME_W, GAME_H - 420, COLORS.floorA).setOrigin(0);

    addText(this, cx, 96, 'Kopi Stall\nEmpire', { size: 40, bold: true, align: 'center', origin: 0.5 });
    addText(this, cx, 162, '咖啡摊帝国', { size: 18, align: 'center', origin: 0.5 });
    addText(this, cx, 206, "Who's opening the stall today?", { size: 15, align: 'center', origin: 0.5 });
    addText(this, cx, 228, '今天谁开档?', { size: 14, align: 'center', origin: 0.5, color: '#6b5a50' });

    this.picks = {};
    [['jun', 100], ['mei', 260]].forEach(([key, x]) => {
      const sprite = addSprite(this, OWNERS[key].sprite, x, 412, 150).setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.choose(key));
      const base = sprite.y;
      this.tweens.add({ targets: sprite, y: base - 4, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: key === 'mei' ? 300 : 0 });
      const btn = makeButton(this, x - 60, 432, 120, 44, OWNERS[key].name, () => this.choose(key), { size: 18, bold: true });
      this.picks[key] = { sprite, btn };
    });
    this.choose(this.owner);

    makeButton(this, cx - 110, 512, 220, 58, 'Open stall  开档!', () => this.start(), { size: 20, bold: true, fill: 0xbfe3c0 });
  }

  choose(key) {
    this.owner = key;
    for (const [k, { sprite, btn }] of Object.entries(this.picks)) {
      btn.setSelected(k === key);
      sprite.setAlpha(k === key ? 1 : 0.55);
    }
  }

  start() {
    save('owner', this.owner);
    this.registry.set('owner', this.owner);
    this.scene.start('Day', { day: 1 });
  }
}
