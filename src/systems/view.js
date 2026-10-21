import { GAME_W, GAME_H } from '../config.js';

// The canvas backbuffer is GAME_W*zoom x GAME_H*zoom real pixels, and every scene camera
// is zoomed by the same integer. Sprites stay pixel-perfect; text rasterises at full res.

export function fitZoom() {
  return Math.max(1, Math.floor(Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H)));
}

let currentZoom = fitZoom();
export const getZoom = () => currentZoom;

// Call at the top of every scene's create().
export function fitCamera(scene) {
  const apply = () => scene.cameras.main.setOrigin(0, 0).setZoom(currentZoom);
  apply();
  scene.scale.on('resize', apply);
  scene.events.once('shutdown', () => scene.scale.off('resize', apply));
}

export function watchResize(game) {
  window.addEventListener('resize', () => {
    const z = fitZoom();
    if (z === currentZoom) return;
    currentZoom = z;
    game.scale.resize(GAME_W * z, GAME_H * z);
  });
}
