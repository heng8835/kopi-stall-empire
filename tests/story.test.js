import { describe, it, expect } from 'vitest';
import { eventsFor, visibleBeats, applyChoice, endingFor, fill, scriptFor } from '../src/systems/story.js';

const events = [
  { id: 'a', day: 1, when: 'start' },
  { id: 'b', day: 1, when: 'end' },
  { id: 'c', day: 3, when: 'mid' },
];

describe('story', () => {
  it('finds the episode for a day and moment', () => {
    expect(eventsFor(events, 1, 'end').map((e) => e.id)).toEqual(['b']);
    expect(eventsFor(events, 2, 'mid')).toEqual([]);
  });

  it('shows [if] lines only when a flag is set', () => {
    const beats = [{ text: 'all' }, { text: 'owe', if: 'kidsOwe' }, { text: 'either', if: ['kidsOwe', 'kidsFree'] }];
    expect(visibleBeats(beats, []).map((b) => b.text)).toEqual(['all']);
    expect(visibleBeats(beats, ['kidsFree']).map((b) => b.text)).toEqual(['all', 'either']);
    expect(visibleBeats(beats, new Set(['kidsOwe'])).map((b) => b.text)).toEqual(['all', 'owe', 'either']);
  });

  it('a choice sets flags and changes fame and money', () => {
    const s = applyChoice({ flags: ['humble'], fame: 98, money: 1000 }, { flags: ['kidsFree', 'humble'], fame: 3, money: -980 });
    expect(s).toEqual({ flags: ['humble', 'kidsFree'], fame: 100, money: 20 });
  });

  it('picks the ending by fame band', () => {
    const endings = [{ id: 'low', min: 0 }, { id: 'top', min: 70 }, { id: 'mid', min: 40 }];
    expect(endingFor(endings, 85).id).toBe('top');
    expect(endingFor(endings, 70).id).toBe('top');
    expect(endingFor(endings, 69.9).id).toBe('mid');
    expect(endingFor(endings, 12).id).toBe('low');
  });

  it('fills placeholders', () => expect(fill('{owner}, {rating}/10 {x}', { owner: 'Ah Girl', rating: 6 })).toBe('Ah Girl, 6/10 {x}'));

  it('builds the full script for a choice and fame', () => {
    const ep = {
      beats: [{ text: '1' }],
      after: [{ text: '3' }, { text: 'x', if: 'nope' }],
      endings: [{ min: 0, beats: [{ text: 'end' }] }],
      epilogue: [{ text: 'epi', if: 'cupid' }],
    };
    const option = { beats: [{ text: '2' }] };
    expect(scriptFor(ep, { flags: ['cupid'], fame: 50, option }).map((b) => b.text)).toEqual(['1', '2', '3', 'end', 'epi']);
  });
});
