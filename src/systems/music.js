// Background music (src/data/music.js): decoded once, looped with a cross-fade. Two channels:
//   bg     the scene's music (title, stall day, night, prologue)
//   story  an episode's music, laid over the scene; bg dips under it and comes back after
// Plays through the sound effects' master volume, so the ♪ on/off toggle mutes it too. Safe
// everywhere: no audio, a failed download or a decode error just means silence.
import { MUSIC, DUCK, DUCK_UNDER_STORY } from '../data/music.js';
import { audioOut, onAudioReady } from './sfx.js';

const bytes = {}; // key -> Promise<ArrayBuffer> (downloaded at boot, before audio is allowed)
const buffers = {}; // key -> Promise<AudioBuffer>
const channels = { bg: null, story: null }; // channel -> { key, gain, sources, timer, stopped }
const wanted = { bg: null, story: null }; // what to play once audio is unlocked
let ducked = false; // a story is on

const download = (key) =>
  (bytes[key] ??= fetch(`audio/${MUSIC[key].file}`).then((r) => {
    if (!r.ok) throw new Error(r.status);
    return r.arrayBuffer();
  }));

// decodeAudioData takes the buffer over, so it gets a copy (the downloaded bytes stay reusable)
function decode(key) {
  const out = audioOut();
  if (!out) return null;
  buffers[key] ??= download(key).then((b) => out.ctx.decodeAudioData(b.slice(0)));
  buffers[key].catch(() => delete buffers[key]); // a failed download or decode can try again next time
  return buffers[key];
}

// Download the tracks one after another as soon as the game loads (playtest: the music came in seconds
// late, every scene, because each mp3 was only fetched when its scene started). Once audio is
// unlocked, the first `decodeNow` tracks are decoded straight away too.
export function preloadMusic(keys, decodeNow = 2) {
  keys.reduce((prev, key) => prev.then(() => download(key)).catch(() => {}), Promise.resolve());
  onAudioReady(() => keys.slice(0, decodeNow).forEach((k) => decode(k)?.catch(() => {})));
}

// Equal-power fade curves (fading one pass out while the next fades in keeps the loudness steady).
const curve = (up) => Float32Array.from({ length: 64 }, (_, i) => Math.sin(((up ? i : 63 - i) / 63) * Math.PI / 2));

function level(channel) {
  const t = channels[channel];
  if (!t) return 0;
  const v = MUSIC[t.key].volume;
  if (channel !== 'bg' || !ducked) return v;
  return v * (channels.story ? DUCK_UNDER_STORY : DUCK);
}

function start(key, channel) {
  if (channels[channel]?.key === key) return;
  halt(channel);
  wanted[channel] = key;
  const out = audioOut();
  if (!out) return onAudioReady(() => wanted[channel] === key && !channels[channel] && start(key, channel));
  const track = { key, sources: [], timer: null, stopped: false };
  channels[channel] = track;
  const { ctx, master } = out;
  track.gain = ctx.createGain();
  track.gain.gain.value = 0;
  track.gain.connect(master);
  decode(key)
    ?.then((buf) => {
      if (track.stopped) return;
      const { loopStart, loopEnd, crossfade: xf = 2, loop = true } = MUSIC[key];
      track.gain.gain.setTargetAtTime(level(channel), ctx.currentTime, 0.15); // up in under half a second
      if (!loop) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(track.gain);
        src.start(ctx.currentTime + 0.05);
        track.sources.push(src);
        return;
      }
      const end = Math.min(loopEnd, buf.duration);
      // one pass: from `from` to the loop end; the next pass starts xf early and fades in over it
      const pass = (when, from) => {
        if (track.stopped) return;
        const src = ctx.createBufferSource();
        const g = ctx.createGain();
        src.buffer = buf;
        src.connect(g);
        g.connect(track.gain);
        if (from > 0) g.gain.setValueCurveAtTime(curve(true), when, xf);
        const dur = end - from;
        g.gain.setValueCurveAtTime(curve(false), when + dur - xf, xf);
        src.start(when, from, dur);
        track.sources.push(src);
        src.onended = () => (track.sources = track.sources.filter((s) => s !== src));
        const next = when + dur - xf;
        track.timer = setTimeout(() => pass(next, loopStart - xf), Math.max(0, (next - ctx.currentTime - 3) * 1000));
      };
      pass(ctx.currentTime + 0.05, 0);
    })
    .catch(() => {});
}

// Fade a channel out and forget it.
function halt(channel, fade = 0.8) {
  const track = channels[channel];
  if (!track) return;
  channels[channel] = null;
  track.stopped = true;
  clearTimeout(track.timer);
  try {
    const { ctx } = audioOut();
    track.gain.gain.cancelScheduledValues(ctx.currentTime);
    track.gain.gain.setTargetAtTime(0, ctx.currentTime, fade / 4);
    setTimeout(() => {
      track.sources.forEach((s) => s.stop());
      track.gain.disconnect();
    }, fade * 1000 + 200);
  } catch {
    /* ignore */
  }
}

function relevel() {
  try {
    const { ctx } = audioOut();
    for (const ch of ['bg', 'story']) channels[ch]?.gain.gain.setTargetAtTime(level(ch), ctx.currentTime, 0.4);
  } catch {
    /* ignore */
  }
}

// The scene's music (the same key keeps playing across scenes without restarting). A new scene
// never inherits a story's music: any left over fades out.
export function playMusic(key) {
  // the story's song becomes the scene's (Day 30: the finale plays on into the last summary)
  if (channels.story?.key === key) {
    halt('bg');
    channels.bg = channels.story;
    channels.story = null;
    ducked = false;
    wanted.story = null;
    return relevel();
  }
  if (channels.story || ducked) endStoryMusic();
  start(key, 'bg');
}

export function stopMusic(fade = 0.8) {
  wanted.bg = null;
  halt('bg', fade);
}

// A story starts: its own music over the scene's (which dips), or just the dip if it has none.
export function storyMusic(key) {
  ducked = true;
  if (key) start(key, 'story');
  relevel();
}

// The story is over: its music fades and the scene's comes back up.
export function endStoryMusic() {
  ducked = false;
  wanted.story = null;
  halt('story', 1.2);
  relevel();
}

// For debugging / playtests: what's playing on each channel.
export const musicState = () => ({
  bg: channels.bg && { key: channels.bg.key, passes: channels.bg.sources.length },
  story: channels.story && { key: channels.story.key, passes: channels.story.sources.length },
  ducked,
});
