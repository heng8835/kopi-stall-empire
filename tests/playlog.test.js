import { describe, it, expect } from 'vitest';
import { startDay, logEvent, finishDay, summarize } from '../src/systems/playlog.js';

describe('playlog', () => {
  it('summarizes serves, timeouts, mistakes and glossary use', () => {
    const d = startDay({ day: 1, owner: 'Mei' });
    logEvent(d, 'serve', { who: 'auntyLim', wanted: 'Teh C siew dai', made: 'Teh C siew dai', tier: 'perfect', waitMs: 4000 }, 5000);
    logEvent(d, 'serve', { who: 'auntyLim', wanted: 'Teh C siew dai', made: 'Teh C', tier: 'close', waitMs: 6000 }, 9000);
    logEvent(d, 'timeout', { who: 'officeGuy' }, 30000);
    logEvent(d, 'glossary', { key: 'siew dai' }, 2000);
    finishDay(d, { served: 2, perfect: 1, walkedOut: 1, earnedToday: 330, fame: 11 }); // storage may be absent: must not throw

    const text = summarize(d);
    expect(text).toContain('day 1 as Mei');
    expect(text).toContain('served 2 (perfect 1), walked out 1, earned $3.30');
    expect(text).toContain('- auntyLim: perfect 1, close 1, oops 0, timeout 0, avg wait 5s');
    expect(text).toContain('- officeGuy: perfect 0, close 0, oops 0, timeout 1');
    expect(text).toContain('mistakes: Teh C siew dai -> made Teh C');
    expect(text).toContain('glossary opened: siew dai');
  });
});
