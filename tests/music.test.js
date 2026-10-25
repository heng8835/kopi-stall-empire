import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { MUSIC, EPISODE_MUSIC } from '../src/data/music.js';
import { EVENTS } from '../src/data/events.js';

describe('music data', () => {
  it('every track has its file and sensible loop points', () => {
    for (const [key, m] of Object.entries(MUSIC)) {
      expect(existsSync(new URL(`../public/audio/${m.file}`, import.meta.url)), key).toBe(true);
      if (m.loop === false) continue;
      expect(m.loopStart - m.crossfade, key).toBeGreaterThanOrEqual(0);
      expect(m.loopEnd - m.loopStart, key).toBeGreaterThan(40); // long enough not to notice the repeat
    }
  });
  it('every episode has music', () => {
    for (const e of EVENTS) expect(MUSIC[EPISODE_MUSIC[e.ep]], `ep ${e.ep}`).toBeTruthy();
  });
});
