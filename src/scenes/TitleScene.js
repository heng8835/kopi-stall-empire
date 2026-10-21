import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    fitCamera(this);
    const cx = GAME_W / 2;
    this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.sky).setOrigin(0);
    this.add.rectangle(0, 210, GAME_W, GAME_H - 210, COLORS.floorA).setOrigin(0);

    addText(this, cx, 52, 'Kopi Stall\nEmpire', { size: 20, bold: true, align: 'center', origin: 0.5 });
    addText(this, cx, 90, '咖啡摊帝国', { size: 9, align: 'center', origin: 0.5 });

    const uncle = this.add.image(cx, 176, 'uncleTan').setScale(4);
    this.tweens.add({ targets: uncle, y: 172, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.add.image(cx + 36, 200, 'kopiC').setScale(2);

    const prompt = addText(this, cx, 250, 'Tap to open stall', { size: 9, bold: true, origin: 0.5 });
    addText(this, cx, 264, '开档啦!', { size: 8, origin: 0.5 });
    this.tweens.add({ targets: prompt, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });

    this.input.once('pointerdown', () => this.scene.start('Day', { day: 1 }));
  }
}
