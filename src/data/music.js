// Background music (public/audio/). Made in Suno (prompts: docs/audio/SUNO_PROMPTS.md), trimmed with
// tools/trim_mp3.py (sources in art/audio/). A track plays once from the start, then loops
// loopStart -> loopEnd forever, cross-fading `crossfade` seconds over the seam so it never clicks.
// loop: false = it plays through once (then the scene decides).
//   volume   0..1, under the sound effects (the game's master volume applies on top)
// Loop points were found by matching the music's rhythm and tone (two places that sound alike).
export const MUSIC = {
  title: { file: 'title.mp3', loopStart: 23, loopEnd: 102.1, crossfade: 2, volume: 0.5 }, // Kopi at Sunrise
  day: { file: 'day.mp3', loopStart: 12.0, loopEnd: 111.68, crossfade: 2, volume: 0.45 }, // Corner Kopitiam
  night: { file: 'night.mp3', loopStart: 20, loopEnd: 148, crossfade: 2, volume: 0.45 }, // Shutters Down
  storyWarm: { file: 'story-warm.mp3', loopStart: 30, loopEnd: 83.42, crossfade: 2, volume: 0.5 }, // Uncle Tan's Teh
  storyComic: { file: 'story-comic.mp3', loopStart: 25, loopEnd: 80, crossfade: 2, volume: 0.5 }, // Kopi Ninja
  finale: { file: 'finale.mp3', loop: false, volume: 0.55 }, // One Month to Try
};

// Which music plays under each story episode (by episode number). The stall's own music dips under it.
export const EPISODE_MUSIC = {
  1: 'storyWarm', // the note on the pot, Aunty Lim's welcome
  2: 'storyWarm', // twenty cents
  3: 'storyComic', // fast fast
  4: 'storyComic', // Oyen's double life
  5: 'storyComic', // the 1987 tissue packet
  6: 'storyComic', // the offer
  7: 'storyComic', // kopi ninja
  8: 'storyWarm', // the red notebook
  9: 'storyComic', // surprise inspection
  10: 'storyComic', // blackout
  11: 'storyWarm', // the rain uncle
  12: 'storyComic', // fire!
  13: 'storyWarm', // the crossword
  14: 'storyWarm', // father and son
  15: 'finale', // the tin
};

export const DUCK = 0.55; // the stall's music under a story with no music of its own
export const DUCK_UNDER_STORY = 0.12; // ...and under a story's own music
