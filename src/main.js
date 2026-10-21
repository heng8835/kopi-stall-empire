import Phaser from 'phaser';
import { GAME_W, GAME_H } from './config.js';
import { getZoom, watchResize } from './systems/view.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import DayScene from './scenes/DayScene.js';

// Logical world is GAME_W x GAME_H; the canvas is that times an integer zoom (see view.js).
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W * getZoom(),
  height: GAME_H * getZoom(),
  backgroundColor: '#bfe6f5',
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.NONE },
  scene: [BootScene, TitleScene, DayScene],
});

watchResize(game);

if (import.meta.env.DEV) window.__game = game;
