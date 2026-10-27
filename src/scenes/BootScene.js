import Phaser from 'phaser';
import { preloadSprites } from '../systems/sprites.js';
import { preloadMusic } from '../systems/music.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    preloadSprites(this);
  }

  create() {
    // title and the intro's song first, then the stall's, then the rest
    preloadMusic(['title', 'finale', 'day', 'storyWarm', 'night', 'storyComic']);
    for (const key of ['heart', 'heartEmpty']) this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.scene.start('Title');
  }
}
