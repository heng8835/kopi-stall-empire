import SIZES from '../data/spriteSizes.json';

// HD character sprites (public/sprites/<key>.png, exported at 3x by tools/build_sprites.py).
export const SPRITE_KEYS = Object.keys(SIZES).filter((k) => !k.startsWith('_'));
export const displayHeight = (key) => SIZES[key];

export function preloadSprites(scene) {
  for (const key of SPRITE_KEYS) scene.load.image(key, `sprites/${key}.png`);
}

// Image anchored at its feet (bottom centre), scaled to its manifest display height.
export function addSprite(scene, key, x, yFeet, heightOverride) {
  const img = scene.add.image(x, yFeet, key).setOrigin(0.5, 1);
  const h = heightOverride ?? displayHeight(key) ?? img.height;
  img.setScale(h / img.height);
  return img;
}
