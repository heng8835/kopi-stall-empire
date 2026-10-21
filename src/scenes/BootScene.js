import Phaser from 'phaser';
import { buildTextures } from '../systems/spriteFactory.js';
import { preloadSprites } from '../systems/sprites.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    preloadSprites(this);
  }

  create() {
    buildTextures(this);
    this.scene.start('Title');
  }
}
