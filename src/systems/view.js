import { GAME_W, GAME_H } from '../config.js';

// Logical world is GAME_W x GAME_H. The canvas is shown at cssFit (fits the window) and its
// backbuffer is rendered at renderScale = cssFit * devicePixelRatio (capped), so HD sprites and
// text stay sharp on retina phones. Every scene camera zooms by renderScale.

const MAX_RENDER_SCALE = 3;

function measure() {
  const cssFit = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H);
  const dpr = window.devicePixelRatio || 1;
  const renderScale = Math.min(MAX_RENDER_SCALE, Math.max(0.5, cssFit * dpr));
  return { cssFit, renderScale };
}

let current = measure();
export const getRenderScale = () => current.renderScale;
export const backbufferSize = () => ({ width: Math.round(GAME_W * current.renderScale), height: Math.round(GAME_H * current.renderScale) });

function applyCss(game) {
  const c = game.canvas;
  if (!c) return;
  c.style.width = `${Math.round(GAME_W * current.cssFit)}px`;
  c.style.height = `${Math.round(GAME_H * current.cssFit)}px`;
}

// Call at the top of every scene's create().
export function fitCamera(scene) {
  const apply = () => scene.cameras.main.setOrigin(0, 0).setZoom(current.renderScale);
  apply();
  scene.scale.on('resize', apply);
  scene.events.once('shutdown', () => scene.scale.off('resize', apply));
}

export function watchResize(game) {
  game.events.once('ready', () => applyCss(game));
  window.addEventListener('resize', () => {
    const next = measure();
    const scaleChanged = next.renderScale !== current.renderScale;
    current = next;
    if (scaleChanged) {
      const { width, height } = backbufferSize();
      game.scale.resize(width, height);
    }
    applyCss(game);
  });
}
