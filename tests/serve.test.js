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
