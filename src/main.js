import Phaser from 'phaser';
import { backbufferSize, watchResize } from './systems/view.js';
import * as sfx from './systems/sfx.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import StallScene from './scenes/StallScene.js';
import DramaScene from './scenes/DramaScene.js';

// Logical world is GAME_W x GAME_H (360x640); the backbuffer is that times the render scale
// (see view.js). HD sprites use linear filtering.
const { width, height } = backbufferSize();
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width,
  height,
  backgroundColor: '#bfe6f5',
  pixelArt: false,
  antialias: true,
  roundPixels: true,
  mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
  scale: { mode: Phaser.Scale.NONE },
  scene: [BootScene, TitleScene, StallScene, DramaScene],
});

watchResize(game);
// Browsers only start audio after a tap.
window.addEventListener('pointerdown', sfx.unlock, { passive: true });

if (import.meta.env.DEV) {
  window.__game = game;
  window.__sfx = sfx;
}
