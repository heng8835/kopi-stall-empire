import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import SIZES from '../src/data/spriteSizes.json';
import { CUSTOMERS } from '../src/data/customers.js';
import { OWNERS } from '../src/data/owners.js';

const keys = Object.keys(SIZES).filter((k) => !k.startsWith('_'));

describe('HD sprite manifest', () => {
  it('every manifest key has an exported PNG', () => {
    const missing = keys.filter((k) => !existsSync(new URL(`../public/sprites/${k}.png`, import.meta.url)));
    expect(missing).toEqual([]);
  });

  it('every enabled customer and owner sprite is in the manifest', () => {
    const used = [
      ...CUSTOMERS.filter((c) => c.enabled).flatMap((c) => [c.sprite, ...(c.sprites ?? [])]),
      ...Object.values(OWNERS).map((o) => o.sprite),
      'oyen',
    ];
    expect(used.filter((k) => !keys.includes(k))).toEqual([]);
  });
});
