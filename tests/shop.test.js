import { describe, it, expect } from 'vitest';
import { SHOP, AISLES } from '../src/data/shop.js';
import { shopState, buy, gift, perks, itemById, nextGoal } from '../src/systems/shop.js';

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
    expect(shopState(itemById('neon'), run({ day: 20 }))).toBe('fame');
    expect(shopState(itemById('neon'), run({ day: 5, fame: 80 }))).toBe('soon'); // not in stock till Day 18
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
    expect(buy(run(), itemById('fan')).bought).toEqual(['fan']); // shown off at the stall next morning
    expect(gift(run(), 'towel').owned).toEqual(['towel']);
  });

  it('adds up power-ups', () => {
    const p = perks(['radio', 'catBed', 'plants', 'tipJar', 'fan', 'longSpout', 'sugarScoop', 'brassSpoon', 'horlicksShelf', 'bell']);
    expect(p).toMatchObject({ famePerDay: 1.8, tipMult: 1.5, patienceMult: 1.15, pourMult: 1.4, sugarScoop: true, stirMs: 600, queueBonus: 1 });
    expect(p.features).toEqual(['horlicks', 'horlicksDino']);
    expect(perks([])).toMatchObject({ famePerDay: 0, pourMult: 1, features: [], plates: 3, tables: 1 });
    expect(perks(['fourthPlate', 'secondTable'])).toMatchObject({ plates: 4, tables: 2 });
  });
});

describe('nextGoal', () => {
  it('points at the cheapest machine in reach, with what is still to go', () => {
    const g = nextGoal(run({ fame: 10, money: 500 }));
    expect(g.item.aisle).toBe('machine');
    expect(g.item.tier).toBe(0);
    const cheapest = Math.min(...SHOP.filter((i) => i.aisle === 'machine' && i.tier === 0).map((i) => i.price));
    expect(g.item.price).toBe(cheapest);
    expect(g.short).toBe(cheapest - 500);
  });
  it('something affordable tonight beats a machine you cannot afford yet (round 5)', async () => {
    const { openingAisle } = await import('../src/systems/shop.js');
    const g = nextGoal(run({ day: 2, fame: 10, money: 1170 }));
    expect(g.short).toBe(0);
    expect(g.item.price).toBeLessThanOrEqual(1170);
    expect(openingAisle(run({ day: 2, fame: 10, money: 1170 }))).toBe(g.item.aisle);
  });
  it('says 0 to go when it can be bought tonight', () => {
    expect(nextGoal(run({ fame: 10, money: 99999 })).short).toBe(0);
  });
  it('when everything in reach is owned: the next fame tier and how much it unlocks', () => {
    const owned = SHOP.filter((i) => i.tier === 0).map((i) => i.id);
    const g = nextGoal(run({ fame: 10, owned }));
    expect(g.tier).toBe(25);
    expect(g.unlocks).toBe(SHOP.filter((i) => i.tier === 25 && !i.gift && !i.soon).length);
  });
});
