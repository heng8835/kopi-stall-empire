import { describe, it, expect } from 'vitest';
import { pickServeTarget } from '../src/systems/serve.js';

const zone = (c, x, y, w, h) => ({ c, rect: { x, y, w, h }, cx: x + w / 2, cy: y + h / 2 });
const ahGong = { id: 'ahGong' };
const front = { id: 'jcGirl' };
const kids = { id: 'kids' };
// Ah Gong's table is behind the front customer: their zones overlap
const zones = [zone(front, 100, 120, 110, 180), zone(ahGong, 150, 140, 90, 130), zone(kids, 0, 120, 90, 180)];

describe('pickServeTarget', () => {
  it('a cup for Ah Gong dropped where he overlaps the front customer goes to him', () => {
    expect(pickServeTarget({ zones, ticket: ahGong, point: { x: 180, y: 200 } })).toBe(ahGong);
  });
  it('a cup for someone else dropped on the overlap goes to the nearest', () => {
    expect(pickServeTarget({ zones, ticket: kids, point: { x: 120, y: 200 } })).toBe(front);
  });
  it('an unticketed cup goes to whoever is under it', () => {
    expect(pickServeTarget({ zones, point: { x: 40, y: 200 } })).toBe(kids);
  });
  it('anywhere up in the customer area serves the cup\'s own customer', () => {
    expect(pickServeTarget({ zones, ticket: ahGong, point: { x: 330, y: 60 }, inArea: true })).toBe(ahGong);
  });
  it('misses when nobody is there and there is no ticket', () => {
    expect(pickServeTarget({ zones, point: { x: 330, y: 60 }, inArea: true })).toBe(null);
  });
  it('a ticket customer who is not waiting is not served', () => {
    expect(pickServeTarget({ zones: zones.slice(0, 1), ticket: ahGong, point: { x: 330, y: 60 }, inArea: true })).toBe(null);
  });
});

describe('pickServeTarget: a labelled cup goes to its customer', () => {
  // the front customer's bubble covers Ah Gong; their body stands in front of his table
  const fz = (c, rect, body) => ({ c, rect, body, cx: body.x + body.w / 2, cy: body.y + body.h / 2 });
  const officeGuy = { id: 'officeGuy' };
  const twin = { id: 'otherKopiO' };
  const z2 = [
    fz(officeGuy, { x: 230, y: 80, w: 130, h: 250 }, { x: 245, y: 175, w: 100, h: 145 }),
    fz(ahGong, { x: 200, y: 105, w: 70, h: 75 }, { x: 205, y: 105, w: 60, h: 70 }),
    fz(twin, { x: 0, y: 110, w: 135, h: 220 }, { x: 10, y: 185, w: 105, h: 135 }),
  ];
  const fits = { ahGong: 9, officeGuy: -5, otherKopiO: 9 };
  const fit = (c) => fits[c.id];
  it('dropped on the front customer\'s bubble: Ah Gong', () => {
    expect(pickServeTarget({ zones: z2, ticket: ahGong, point: { x: 300, y: 120 }, inArea: true, fit })).toBe(ahGong);
  });
  it('dropped on the front customer\'s body (a wrong drink for them): Ah Gong', () => {
    expect(pickServeTarget({ zones: z2, ticket: ahGong, point: { x: 290, y: 250 }, inArea: true, fit })).toBe(ahGong);
  });
  it('dropped on someone who wants the same drink: them', () => {
    expect(pickServeTarget({ zones: z2, ticket: ahGong, point: { x: 60, y: 250 }, inArea: true, fit })).toBe(twin);
  });
  it('dropped on that person\'s bubble only: still Ah Gong', () => {
    expect(pickServeTarget({ zones: z2, ticket: ahGong, point: { x: 60, y: 130 }, inArea: true, fit })).toBe(ahGong);
  });
});
