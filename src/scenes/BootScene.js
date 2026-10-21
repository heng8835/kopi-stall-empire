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
    this.scene.start('Title');
  }
}
