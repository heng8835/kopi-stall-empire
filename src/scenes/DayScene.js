import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';

// M0 stub — the serving loop lands in M1.
export default class DayScene extends Phaser.Scene {
  constructor() {
    super('Day');
  }

  create(data) {
    fitCamera(this);
    this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.sky).setOrigin(0);
    addText(this, GAME_W / 2, 140, `Day ${data?.day ?? 1}\n(serving loop coming soon)`, { size: 9, align: 'center', origin: 0.5 });
    this.add.image(GAME_W / 2, 200, 'uncleTan').setScale(3);
  }
}
