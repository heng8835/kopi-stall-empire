import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import SIZES from '../src/data/spriteSizes.json';
import { CUSTOMERS } from '../src/data/customers.js';
import { OWNERS } from '../src/data/owners.js';
import { STALL_PROPS } from '../src/data/stallProps.js';
import { SHOP } from '../src/data/shop.js';
import { TOOLS, MACHINE_TOOLS } from '../src/data/tools.js';
import { CAST } from '../src/data/events.js';

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

  it('stall props, pour poses and story cast all have art', () => {
    const ids = new Set(SHOP.map((i) => i.id));
    for (const id of Object.keys(STALL_PROPS)) expect(ids.has(id), id).toBe(true);
    const used = [
      ...Object.values(STALL_PROPS).flat().map((p) => p.key),
      ...[...TOOLS, ...Object.values(MACHINE_TOOLS)].flatMap((t) => [t.sprite, t.pourSprite]).filter(Boolean),
      ...Object.values(CAST).map((c) => c.sprite).filter((k) => !k.startsWith('{')),
    ];
    expect(used.filter((k) => !keys.includes(k))).toEqual([]);
  });
});
