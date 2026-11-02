import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Phaser reuses the scene object every day, so anything cached on it must be reset before create() draws
// (round 6: yesterday's destroyed goal chip froze every morning after a goal day).
describe('StallScene starts each day clean', () => {
  const src = readFileSync('src/scenes/StallScene.js', 'utf8');
  const create = src.slice(src.indexOf('create(data) {'), src.indexOf('this.drawBackdrop();'));
  it.each(['goalChip', 'tarik', 'tapHinted', 'emptyMs'])('resets %s before drawing', (k) => {
    expect(create).toMatch(new RegExp(`this\.${k} = `));
  });
});
