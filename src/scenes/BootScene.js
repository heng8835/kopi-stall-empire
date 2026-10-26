import Phaser from 'phaser';
import { preloadSprites } from '../systems/sprites.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    preloadSprites(this);
  }

  create() {
    for (const key of ['heart', 'heartEmpty']) this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.scene.start('Title');
  }
}
