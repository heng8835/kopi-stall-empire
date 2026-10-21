// Procedural sound effects + a quiet kopitiam ambience, synthesized with WebAudio (no files).
// Safe everywhere: if audio is unavailable, muted, or throws, every call is a silent no-op.
import { load, save } from './save.js';

const VOLUME = 0.6;
let ctx = null;
let master = null;
let noiseBuf = null;
let ambienceOn = false;
let muted = load('muted', false);

const AudioCtor = () => (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) || null;

// Browsers only allow audio after a user gesture: call this from a pointerdown handler.
export function unlock() {
  try {
    if (!ctx) {
      const C = AudioCtor();
      if (!C) return;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : VOLUME;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    startAmbience();
  } catch {
    /* no audio: fine */
  }
}

export const isMuted = () => muted;

// For debugging / playtests: audio state and how often each sound actually played.
export const audioState = () => (ctx ? ctx.state : 'none');
export const playCounts = {};

export function setMuted(value) {
  muted = !!value;
  save('muted', muted);
  try {
    if (master) master.gain.setTargetAtTime(muted ? 0 : VOLUME, ctx.currentTime, 0.05);
  } catch {
    /* ignore */
  }
}

export function play(name) {
  try {
    if (muted || !ctx || ctx.state !== 'running') return;
    if (!SOUNDS[name]) return;
    SOUNDS[name](ctx.currentTime);
    playCounts[name] = (playCounts[name] ?? 0) + 1;
  } catch {
    /* never let sound break the game */
  }
}

// ---------- building blocks ----------

function tone(t, freq, dur, { type = 'sine', gain = 0.12, slideTo = null, dest = master } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(t, dur, { freq = 1000, q = 1, gain = 0.1, type = 'bandpass', dest = master } = {}) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.15, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(dest);
  src.start(t);
  src.stop(t + dur + 0.05);
}

const notes = (t, freqs, step, opts) => freqs.forEach((f, i) => tone(t + i * step, f, step * 1.6, opts));

const SOUNDS = {
  tap: (t) => tone(t, 880, 0.05, { gain: 0.08 }),
  pour: (t) => noise(t, 1.1, { freq: 900, q: 0.8, gain: 0.06 }),
  clink: (t) => {
    tone(t, 2400, 0.09, { type: 'triangle', gain: 0.1 });
    tone(t + 0.05, 3200, 0.12, { type: 'triangle', gain: 0.07 });
  },
  coin: (t) => {
    tone(t, 988, 0.08, { type: 'square', gain: 0.05 });
    tone(t + 0.08, 1319, 0.28, { type: 'square', gain: 0.05 });
  },
  perfect: (t) => notes(t, [523, 659, 784, 1047], 0.08, { gain: 0.09 }),
  oops: (t) => notes(t, [330, 294], 0.14, { type: 'triangle', gain: 0.08 }),
  walkout: (t) => tone(t, 600, 0.35, { slideTo: 300, gain: 0.07 }),
  sugar: (t) => {
    for (let i = 0; i < 3; i++) tone(t + i * 0.04, 4200 + Math.random() * 1500, 0.03, { type: 'triangle', gain: 0.025 });
  },
  milk: (t) => noise(t, 0.5, { freq: 500, q: 1.2, gain: 0.05 }),
  ice: (t) => {
    tone(t, 1500, 0.08, { type: 'triangle', gain: 0.08 });
    tone(t + 0.06, 1900, 0.1, { type: 'triangle', gain: 0.06 });
  },
  stir: (t) => noise(t, 0.12, { freq: 2400, q: 2, gain: 0.04 }),
  cupDown: (t) => tone(t, 700, 0.07, { type: 'triangle', gain: 0.08 }),
  bin: (t) => tone(t, 220, 0.25, { type: 'square', slideTo: 110, gain: 0.05 }),
  pickup: (t) => tone(t, 520, 0.05, { gain: 0.05, slideTo: 660 }),
  dayEnd: (t) => notes(t, [784, 659, 523, 659, 784, 1047], 0.12, { type: 'triangle', gain: 0.08 }),
};

// ---------- ambience: soft murmur + the odd distant cup clink ----------

function startAmbience() {
  if (ambienceOn || !ctx) return;
  ambienceOn = true;
  const bed = ctx.createGain();
  bed.gain.value = 0.02;
  bed.connect(master);
  const loop = () => {
    if (!ctx) return;
    // overlapping low-passed noise swells read as distant chatter
    noise(ctx.currentTime, 6, { freq: 380, q: 0.4, gain: 1, type: 'lowpass', dest: bed });
    setTimeout(loop, 5000);
  };
  const clinks = () => {
    if (!ctx) return;
    if (!muted && ctx.state === 'running') tone(ctx.currentTime, 2600 + Math.random() * 900, 0.08, { type: 'triangle', gain: 0.012 });
    setTimeout(clinks, 3500 + Math.random() * 6000);
  };
  loop();
  clinks();
}
