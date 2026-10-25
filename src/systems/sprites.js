import SIZES from '../data/spriteSizes.json';

// HD character sprites (public/sprites/<key>.png, exported at 3x by tools/build_sprites.py).
export const SPRITE_KEYS = Object.keys(SIZES).filter((k) => !k.startsWith('_'));
export const displayHeight = (key) => SIZES[key];

export function preloadSprites(scene) {
  for (const key of SPRITE_KEYS) scene.load.image(key, `sprites/${key}.png`);
  scene.load.image('stallBg', 'bg/stall.webp'); // full-screen stall background (901x1600)
  scene.load.image('stallNight', 'bg/stallNight.webp'); // the same stall after closing (night shop)
  scene.load.image('openingSunrise', 'bg/openingSunrise.webp'); // title screen + the opening's last panel
  scene.load.image('iceCluster', 'sprites/iceCluster.png'); // code-drawn pixel ice (art/code/), drawn unsmoothed
}

// Sprite anchored at its feet (bottom centre), scaled to its manifest display height.
// (A Sprite, not an Image, so walkers can play a `<key>-walk` animation when one exists.)
export function addSprite(scene, key, x, yFeet, heightOverride) {
  const img = scene.add.sprite(x, yFeet, key).setOrigin(0.5, 1);
  const h = heightOverride ?? displayHeight(key) ?? img.height;
  img.setScale(h / img.height);
  img.baseScale = img.scaleX;
  return img;
}
