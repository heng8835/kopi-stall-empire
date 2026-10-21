import { describe, it, expect } from 'vitest';
import { unlock, play, setMuted, isMuted } from '../src/systems/sfx.js';

describe('sfx without audio support (node)', () => {
  it('never throws and mute toggles', () => {
    expect(() => unlock()).not.toThrow();
    expect(() => play('perfect')).not.toThrow();
    expect(() => play('no-such-sound')).not.toThrow();
    setMuted(true);
    expect(isMuted()).toBe(true);
    expect(() => play('coin')).not.toThrow();
    setMuted(false);
    expect(isMuted()).toBe(false);
  });
});
