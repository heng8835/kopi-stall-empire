import { describe, it, expect } from 'vitest';
import { SHOP, AISLES } from '../src/data/shop.js';
import { shopState, buy, gift, perks, itemById } from '../src/systems/shop.js';

const run = (o = {}) => ({ day: 5, money: 5000, fame: 30, owned: [], newItems: [], ...o });

describe('night shop', () => {
  it('every item is well formed', () => {
    expect(new Set(SHOP.map((i) => i.id)).size).toBe(SHOP.length);
    for (const i of SHOP) {
      expect(AISLES.some((a) => a.id === i.aisle), i.id).toBe(true);
      expect(i.name && i.zh && i.text && i.icon, i.id).toBeTruthy();
      if (!i.soon) expect(i.effect, i.id).toBeTruthy();
      if (!i.gift && !i.soon) expect(i.price, i.id).toBeGreaterThan(0);
    }
  });

  it('knows what you can buy', () => {
    expect(shopState(itemById('fan'), run())).toBe('buy');
    expect(shopState(itemById('fan'), run({ money: 100 }))).toBe('money');
    expect(shopState(itemById('neon'), run())).toBe('fame');
    expect(shopState({ ...itemById('haliaPot'), soon: true }, run({ fame: 30 }))).toBe('soon');
    expect(SHOP.filter((i) => i.soon)).toEqual([]); // phase D: everything is buyable
    expect(shopState(itemById('towel'), run())).toBe('gift');
    expect(shopState(itemById('fan'), run({ owned: ['fan'] }))).toBe('owned');
  });

  it('buying spends money, owns it, and queues machine cards', () => {
    const r = buy(run(), itemById('horlicksShelf'));
    expect(r).toMatchObject({ money: 1500, owned: ['horlicksShelf'], newItems: ['horlicksShelf'] });
    expect(buy(r, itemById('horlicksShelf'))).toBe(null); // already owned
    expect(buy(run({ money: 10 }), itemById('fan'))).toBe(null);
    expect(buy(run(), itemById('fan')).newItems).toEqual([]);
    expect(gift(run(), 'towel').owned).toEqual(['towel']);
  });

  it('adds up power-ups', () => {
    const p = perks(['radio', 'catBed', 'plants', 'tipJar', 'fan', 'longSpout', 'sugarScoop', 'brassSpoon', 'horlicksShelf', 'bell']);
    expect(p).toMatchObject({ famePerDay: 1.8, tipMult: 1.5, patienceMult: 1.15, pourMult: 1.25, sugarScoop: true, stirMs: 600, queueBonus: 1 });
    expect(p.features).toEqual(['horlicks', 'horlicksDino']);
    expect(perks([])).toMatchObject({ famePerDay: 0, pourMult: 1, features: [], plates: 3, tables: 1 });
    expect(perks(['fourthPlate', 'secondTable'])).toMatchObject({ plates: 4, tables: 2 });
  });
});
