// Background music: one track at a time (src/data/music.js), decoded once, looped with a cross-fade.
// Plays through the sound effects' master volume, so the ♪ on/off toggle mutes it too. Safe
// everywhere: no audio, a failed download or a decode error just means silence.
import { MUSIC, DUCK } from '../data/music.js';
import { audioOut, onAudioReady } from './sfx.js';

const buffers = {}; // key -> Promise<AudioBuffer>
let current = null; // { key, gain, sources, timer, stopped }
let wanted = null; // the track to play once audio is unlocked
let ducked = false;

function decode(key) {
  const out = audioOut();
  if (!out) return null;
  buffers[key] ??= fetch(`audio/${MUSIC[key].file}`)
    .then((r) => r.arrayBuffer())
    .then((b) => out.ctx.decodeAudioData(b));
  return buffers[key];
}

// Equal-power fade curves (fading one pass out while the next fades in keeps the loudness steady).
const curve = (up) => Float32Array.from({ length: 64 }, (_, i) => Math.sin(((up ? i : 63 - i) / 63) * Math.PI / 2));

const level = (key) => MUSIC[key].volume * (ducked ? DUCK : 1);

export function playMusic(key) {
  if (current?.key === key) return;
  stopMusic();
  wanted = key;
  const out = audioOut();
  if (!out) return onAudioReady(() => wanted === key && !current && playMusic(key));
  const track = { key, sources: [], timer: null, stopped: false };
  current = track;
  const { ctx, master } = out;
  track.gain = ctx.createGain();
  track.gain.gain.value = 0;
  track.gain.connect(master);
  decode(key)
    ?.then((buf) => {
      if (track.stopped) return;
      const { loopStart, loopEnd, crossfade: xf } = MUSIC[key];
      const end = Math.min(loopEnd, buf.duration);
      track.gain.gain.setTargetAtTime(level(key), ctx.currentTime, 0.6);
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

// Fade the music out (e.g. leaving the stall for the night).
export function stopMusic(fade = 0.8) {
  wanted = null;
  const track = current;
  if (!track) return;
  current = null;
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

// A story over the stall: the music dips under it, and comes back after.
export function duckMusic(on) {
  ducked = on;
  try {
    if (current) current.gain.gain.setTargetAtTime(level(current.key), audioOut().ctx.currentTime, 0.4);
  } catch {
    /* ignore */
  }
}

// For debugging / playtests: what's playing and how many passes are scheduled.
export const musicState = () => (current ? { key: current.key, passes: current.sources.length, ducked } : null);
