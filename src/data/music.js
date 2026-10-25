// Background music (public/audio/). Made in Suno (prompts: docs/audio/SUNO_PROMPTS.md), trimmed with
// tools/trim_mp3.py. Each track plays once from the start, then loops loopStart -> loopEnd forever,
// cross-fading `crossfade` seconds over the seam so it never clicks or gaps.
//   volume   0..1, under the sound effects (the game's master volume applies on top)
// Loop points are found by matching the music's rhythm and tone (two places that sound alike).
export const MUSIC = {
  day: { file: 'day.mp3', loopStart: 12.0, loopEnd: 111.68, crossfade: 2, volume: 0.45 },
};

export const DUCK = 0.55; // a story playing over the stall: the music drops to this share
