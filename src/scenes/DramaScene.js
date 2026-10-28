import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { CAST, EVENTS, FACE_X } from '../data/events.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite } from '../systems/sprites.js';
import { makeButton, layoutLine, showGlossary } from '../systems/ui.js';
import { play } from '../systems/sfx.js';
import { visibleBeats, endingFor, fill, nextEpisode } from '../systems/story.js';

const GLOSS_SETTLE_MS = 900; // see openGlossary

// One story episode, played as a short-drama overlay on top of the paused stall:
// title card -> lines (tap to advance) -> choice -> reply -> ending (finale) -> "下集" card (next
// episode's number + title only, so nothing is given away early).
// Launched by StallScene with { ep, flags, fame, vars, owner, onChoice, onDone }.
// Everything eases in and out: the stall dims, the title card rises and moves on by itself, lines
// crossfade, and at the end the overlay fades away before the stall carries on.

const BOX_Y = 446;
const BOX_H = 168;
const PORTRAIT_H = 190;
const FACE = 62; // the speaker's face beside their name tag
const PERCH_H = 150; // a cat on the counter: big enough to see, his box hidden behind the ledge
const OYEN_BODY = 0.74; // Oyen's art: the cat is the top 74%, his fish box the rest
// The speaker stands behind the stall's wooden counter ledge, like a customer: feet hidden,
// head and body above it. The ledge is redrawn from the background art in front of them.
const LEDGE = { top: 282, bottom: 318 }; // logical px, matches StallScene COUNTER_Y
const FEET_Y = 312;
const BG_SCALE = 901 / GAME_W; // background art pixels per logical px
const MOODS = { dark: [0x05060f, 0.82], rain: [0x1d3b5c, 0.62], fire: [0x6b1e05, 0.58] };
const FADE_IN_MS = 450; // the stall dims
const TITLE_HOLD_MS = 2300; // the title card moves on by itself after this (a tap skips it)
const SWAP_MS = 140; // old card out / new card in
const TAP_GRACE_MS = 900; // taps still coming from the stall (a rush) can't skip the opening (round 4: 350 wasn't enough)
const LINE_GRACE_MS = 250; // ...and a fresh line can't be skipped by the same burst of taps
const CHOICE_GRACE_MS = 500; // ...or pick a choice the player hasn't seen yet

// When the next episode comes, so a teaser never reads as "tomorrow" when it's days away.
const whenNext = (ep, next) =>
  next.day === ep.day ? (next.when === 'end' ? 'tonight' : 'later today') : next.day === ep.day + 1 ? 'tomorrow' : `Day ${next.day}`;

export default class DramaScene extends Phaser.Scene {
  constructor() {
    super('Drama');
  }

  create(data) {
    fitCamera(this);
    this.d = data;
    this.flags = new Set(data.flags);
    const [tint, alpha] = MOODS[data.ep.mood] ?? [0x000000, 0.55];
    this.shade = { tint, alpha };
    this.shadeRect = this.add.rectangle(0, 0, GAME_W, GAME_H, tint, alpha).setOrigin(0).setAlpha(0).setInteractive().on('pointerdown', () => this.tapReady() && this.advance());
    this.tweens.add({ targets: this.shadeRect, alpha: 1, duration: FADE_IN_MS, ease: 'Sine.out' });
    // Phaser reuses this scene object for every episode: reset all per-episode state.
    this.layer = []; // what the current card drew
    this.queue = [];
    this.stage = 'title';
    this.ending = null;
    this.finished = false;
    this.waitingChoice = false;
    this.glossaryOpen = false;
    this.lastWho = null;
    this.bornAt = this.time.now;

    // top-right corner: clear of the choice buttons and the name tag (playtest: it sat on the 2nd choice)
    const skip = addText(this, GAME_W - 16, 50, 'Skip ▸▸', { size: 14, bold: true, color: '#fff6dc', origin: [1, 0] }).setDepth(21);
    const pill = this.add.rectangle(GAME_W - 8, 45, skip.width + 16, skip.height + 10, 0x2b2420, 0.9).setOrigin(1, 0).setStrokeStyle(2, 0xfff6dc, 0.6).setDepth(20);
    this.skipText = { setVisible: (v) => (skip.setVisible(v), pill.setVisible(v)) };
    skip.setStroke('#2b2420', 3);
    skip.setInteractive({ useHandCursor: true }).on('pointerdown', (p, x, y, e) => {
      e?.stopPropagation?.();
      if (this.time.now - this.bornAt >= TAP_GRACE_MS) this.skip();
    });

    if (data.ep.noTitle) this.skipTitle(); // the second part of an episode that already had its title card
    else this.titleCard();
  }

  // A tap counts once the scene has been up a moment and the current line has been seen.
  tapReady() {
    const now = this.time.now;
    return now - this.bornAt >= TAP_GRACE_MS && now - (this.lineAt ?? 0) >= LINE_GRACE_MS;
  }

  skipTitle() {
    this.queue = visibleBeats(this.d.ep.beats, this.flags);
    this.stage = 'beats';
    this.time.delayedCall(FADE_IN_MS, () => this.advance());
  }

  // ---------- cards ----------

  // Fade the current card out (the next one fades in over it).
  clear() {
    const old = this.layer;
    this.layer = [];
    this.tweens.add({ targets: old, alpha: 0, duration: SWAP_MS, onComplete: () => old.forEach((o) => o.destroy()) });
  }

  // Ease freshly drawn objects in: up from `rise` px below, after `delay` ms.
  easeIn(objs, { rise = 8, delay = 0, duration = 220 } = {}) {
    objs.forEach((o) => {
      const a = o.alpha;
      o.setAlpha(0).setY(o.y + rise);
      this.tweens.add({ targets: o, alpha: a, y: o.y - rise, duration, delay, ease: 'Cubic.out' });
    });
  }

  titleCard() {
    const { ep } = this.d;
    play('dayEnd');
    const t = (y, s, o) => this.layer.push(addText(this, GAME_W / 2, y, s, { align: 'center', origin: 0.5, color: '#fff6dc', ...o }));
    const total = Math.max(...EVENTS.map((e) => e.ep));
    const parts = EVENTS.filter((e) => e.ep === ep.ep);
    const part = parts.findIndex((e) => e.id === ep.id);
    t(250, `EP ${ep.ep} / ${total}${part > 0 ? `  ·  Part ${part + 1}` : ''}`, { size: 14, bold: true, color: '#f2c14e' });
    t(284, ep.title.zh, { size: 30, bold: true });
    t(322, ep.title.en, { size: 17 });
    this.layer.forEach((o, i) => this.easeIn([o], { rise: 12, delay: FADE_IN_MS * 0.6 + i * 110, duration: 380 }));
    this.queue = visibleBeats(ep.beats, this.flags);
    this.stage = 'beats';
    this.onTitle = true;
    this.time.delayedCall(TITLE_HOLD_MS, () => this.onTitle && this.advance());
  }

  advance() {
    if (this.glossaryOpen || this.waitingChoice) return;
    if (this.stage === 'done') return this.finish();
    this.onTitle = false;
    const next = this.queue.shift();
    if (next) return this.showBeat(next);
    this.nextStage();
  }

  // What comes after the current list of beats runs out.
  nextStage() {
    const { ep } = this.d;
    if (this.stage === 'beats' && ep.choice) return this.showChoice();
    if (this.stage === 'beats' || this.stage === 'reply') {
      this.stage = 'after';
      this.queue = visibleBeats(ep.after, this.flags);
      return this.advance();
    }
    if (this.stage === 'after' && ep.endings) {
      this.stage = 'ending';
      this.ending = endingFor(ep.endings, this.d.fame);
      this.queue = visibleBeats(this.ending?.beats, this.flags);
      if (this.ending) return this.endingCard();
      return this.advance();
    }
    if (this.stage === 'ending' || (this.stage === 'after' && ep.epilogue)) {
      this.stage = 'epilogue';
      this.queue = visibleBeats(ep.epilogue, this.flags);
      return this.advance();
    }
    this.captionCard();
  }

  speaker(who, beat) {
    if (who === 'narrator' || who === 'note') return null;
    const cast = CAST[who];
    if (who === 'owner') return { name: this.d.owner.name, sprite: this.d.owner.sprite };
    const has = this.textures.exists(cast.sprite);
    return { name: beat.name ?? cast.name, sprite: has ? cast.sprite : cast.fallback, silhouette: beat.silhouette || !has, perch: cast.perch };
  }

  showBeat(beat) {
    const fresh = this.lastWho === null; // first line after the title card
    const newSpeaker = beat.who !== this.lastWho;
    this.lastWho = beat.who;
    this.clear();
    const who = this.speaker(beat.who, beat);
    const text = fill(beat.text, this.d.vars);
    this.lineAt = this.time.now; // an orange word only opens once the line has settled (openGlossary)
    const start = this.layer.length;
    if (beat.show) this.layer.push(...this.prop(beat.show));
    const inProp = beat.show === 'tinOyen' && beat.who === 'oyen'; // he's already there, asleep on the tin
    if (who?.sprite && this.textures.exists(who.sprite) && !inProp) {
      const s = addSprite(this, who.sprite, GAME_W / 2, who.perch ? LEDGE.bottom : FEET_Y);
      s.setScale(s.scaleX * (who.perch ? PERCH_H / s.displayHeight : Math.min(1.5, PORTRAIT_H / s.displayHeight)));
      if (s.displayWidth > GAME_W - 20) s.setScale(s.scaleX * ((GAME_W - 20) / s.displayWidth));
      if (who.silhouette) s.setTintFill(0x14110f);
      // a new speaker steps up; the same speaker just stays put
      if (newSpeaker) {
        s.setAlpha(0).y += 10;
        this.tweens.add({ targets: s, alpha: 1, y: s.y - 10, duration: 260, ease: 'Back.out' });
      }
      // the counter ledge in front of them, shaded like the rest of the stall
      const top = Math.round(LEDGE.top * BG_SCALE);
      const ledge = this.add.image(0, 0, 'stallBg').setOrigin(0).setDisplaySize(GAME_W, GAME_H).setCrop(0, top, 901, Math.round(LEDGE.bottom * BG_SCALE) - top);
      const shade = this.add.rectangle(0, LEDGE.top, GAME_W, LEDGE.bottom - LEDGE.top, this.shade.tint, this.shade.alpha).setOrigin(0);
      this.layer.push(s, ledge, shade);
    }

    const note = beat.who === 'note';
    const x = 12;
    const w = GAME_W - 24;
    const box = this.add.rectangle(x, BOX_Y, w, BOX_H, note ? 0xfff3c4 : beat.who === 'narrator' ? 0x2b2420 : COLORS.paper).setOrigin(0).setStrokeStyle(3, COLORS.inkHex);
    this.layer.push(box);
    const name = note ? `${beat.name ?? 'Note'} ✎` : who?.name;
    const face = !note && who?.sprite && this.textures.exists(who.sprite);
    if (face) this.layer.push(...this.face(who.sprite, x + 8, BOX_Y - FACE - 6, who.silhouette));
    if (name) {
      const tagX = face ? x + FACE + 14 : x + 8;
      const tag = addText(this, tagX + 6, BOX_Y - 12, name, { size: 14, bold: true, color: '#fff6dc' });
      const bg = this.add.rectangle(tagX, BOX_Y - 15, tag.width + 14, 24, 0xc8562e).setOrigin(0).setStrokeStyle(2, COLORS.inkHex);
      tag.setDepth(2);
      this.layer.push(bg, tag);
    }
    if (beat.who === 'narrator') {
      this.layer.push(addText(this, x + 14, BOX_Y + 18, text, { size: 15, color: '#fff6dc', wrap: w - 28, lineSpacing: 5 }));
    } else {
      const words = layoutLine(this, text, x + 14, BOX_Y + 20, w - 28, (key) => this.openGlossary(key), { size: 16 });
      this.layer.push(...words.objects);
    }
    const more = addText(this, GAME_W - 18, BOX_Y + BOX_H - 18, '▼', { size: 12, color: beat.who === 'narrator' ? '#d8cbb5' : '#8a7a70', origin: [1, 0] });
    this.layer.push(more);
    this.tweens.add({ targets: more, y: more.y + 3, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // the box rises in after the title; later lines crossfade in place
    const card = this.layer.slice(start).filter((o) => o.type !== 'Sprite' && o.type !== 'Image');
    this.easeIn(card, fresh ? { rise: 24, duration: 280 } : { rise: 0, duration: SWAP_MS });
    play('tap');
  }

  // Something on the counter for this beat (drawn in code until its art arrives): Uncle Tan's
  // biscuit tin with the note taped on, and maybe Oyen asleep on top.
  prop(kind) {
    const cx = GAME_W / 2;
    const base = LEDGE.top + 12; // the tin stands on the counter top
    const w = 128;
    const h = 72;
    const top = base - h;
    const g = this.add.graphics();
    // tin: dark outline, red body, gold bands, a shine on the left, a lid
    g.fillStyle(0x3a2e2a, 1).fillRoundedRect(cx - w / 2 - 3, top - 3, w + 6, h + 6, 12);
    g.fillStyle(0xb8402c, 1).fillRoundedRect(cx - w / 2, top, w, h, 10);
    g.fillStyle(0xe2b65a, 1).fillRect(cx - w / 2, top + 14, w, 6).fillRect(cx - w / 2, base - 14, w, 6);
    g.fillStyle(0xd9604a, 1).fillRect(cx - w / 2 + 8, top + 22, 8, h - 40);
    g.fillStyle(0x3a2e2a, 1).fillRoundedRect(cx - w / 2 - 6, top - 10, w + 12, 14, 6);
    g.fillStyle(0xc9503a, 1).fillRoundedRect(cx - w / 2 - 3, top - 7, w + 6, 8, 4);
    // the note, taped to the front, with a scribble of handwriting
    g.fillStyle(0x3a2e2a, 1).fillRect(cx - 32, top + 24, 64, 36);
    g.fillStyle(0xfff6dc, 1).fillRect(cx - 30, top + 26, 60, 32);
    g.fillStyle(0xf2e3a8, 0.9).fillRect(cx - 12, top + 21, 24, 8);
    g.lineStyle(2, 0x6b5a50, 0.8);
    for (let i = 0; i < 3; i++) g.lineBetween(cx - 24, top + 36 + i * 7, cx + (i === 2 ? 4 : 22), top + 36 + i * 7);
    const objs = [g];
    if (kind === 'tinOyen') {
      // Oyen, asleep on the lid: only the cat part of his art (his fish box is cut away)
      const o = this.add.image(cx, 0, 'oyen').setOrigin(0.5, 0);
      o.setScale((w * 1.15) / o.width);
      o.setCrop(0, 0, o.width, o.height * OYEN_BODY);
      o.setY(top - 4 - o.displayHeight * OYEN_BODY);
      this.tweens.add({ targets: o, scaleY: o.scaleY * 1.03, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' }); // breathing
      objs.push(o);
    }
    objs.forEach((o) => {
      o.setAlpha(0);
      this.tweens.add({ targets: o, alpha: 1, duration: 300 });
    });
    return objs;
  }

  // A square crop of the top of the speaker's sprite (their face), framed, so it's clear who is talking.
  face(key, x, y, silhouette) {
    const src = this.textures.get(key).getSourceImage();
    const side = Math.min(src.height * 0.5, src.width);
    const left = Phaser.Math.Clamp((FACE_X[key] ?? 0.48) * src.width - side / 2, 0, src.width - side);
    const scale = FACE / side;
    const frame = this.add.rectangle(x - 3, y - 3, FACE + 6, FACE + 6, 0xfff6dc).setOrigin(0).setStrokeStyle(3, COLORS.inkHex);
    const img = this.add.image(x - left * scale, y, key).setOrigin(0).setScale(scale).setCrop(left, 0, side, side);
    if (silhouette) img.setTintFill(0x14110f);
    img.y += 6;
    this.tweens.add({ targets: img, y, duration: 160, ease: 'Back.out' });
    return [frame, img];
  }

  showChoice() {
    this.clear();
    this.waitingChoice = true;
    this.skipText.setVisible(false); // a choice has to be made
    this.choiceAt = this.time.now;
    this.layer.push(addText(this, GAME_W / 2, 250, 'What do you do?', { size: 18, bold: true, color: '#fff6dc', origin: 0.5 }));
    this.layer.push(addText(this, GAME_W / 2, 276, '你会怎么做?', { size: 14, color: '#d8cbb5', origin: 0.5 }));
    this.d.ep.choice.options.forEach((opt, i) => {
      const btn = makeButton(this, 24, 310 + i * 70, GAME_W - 48, 58, fill(opt.label, this.d.vars ?? {}), () => this.choose(opt), { size: 15, bold: true });
      this.layer.push(btn.bg, btn.txt);
    });
    this.lastWho = null;
    this.layer.forEach((o, i) => this.easeIn([o], { rise: 10, delay: Math.floor(i / 2) * 70, duration: 260 }));
  }

  choose(opt) {
    if (!this.waitingChoice || this.time.now - this.choiceAt < CHOICE_GRACE_MS) return;
    this.waitingChoice = false;
    this.skipText.setVisible(true);
    this.d.onChoice?.(opt);
    for (const f of opt.flags ?? []) this.flags.add(f);
    this.stage = 'reply';
    this.queue = visibleBeats(opt.beats, this.flags);
    this.advance();
  }

  endingCard() {
    this.clear();
    play('perfect');
    const t = (y, s, o) => this.layer.push(addText(this, GAME_W / 2, y, s, { align: 'center', origin: 0.5, color: '#fff6dc', ...o }));
    t(260, 'ENDING', { size: 14, bold: true, color: '#f2c14e' });
    t(300, this.ending.title, { size: 24, bold: true, wrap: 320 });
    t(360, 'tap to continue', { size: 11, color: '#d8cbb5' });
    this.lastWho = null;
    this.layer.forEach((o, i) => this.easeIn([o], { rise: 12, delay: i * 120, duration: 380 }));
  }

  // After an episode's last part: 下集 + the next episode's number and title (or the finale's caption).
  captionCard() {
    this.clear();
    this.stage = 'done';
    const next = nextEpisode(EVENTS, this.d.ep);
    const cap = this.d.ep.caption;
    if (!next && !cap) return this.finish();
    const t = (y, s, o) => this.layer.push(addText(this, GAME_W / 2, y, s, { align: 'center', origin: 0.5, wrap: 320, ...o }));
    this.layer.push(this.add.rectangle(0, 250, GAME_W, 130, 0x000000, 0.75).setOrigin(0));
    if (next) {
      t(276, `${next.endings ? '下集 · 大结局' : '下集'}  ·  ${whenNext(this.d.ep, next)}`, { size: 13, bold: true, color: '#f2c14e' });
      t(310, `EP ${next.ep} 《${next.title.zh}》`, { size: 22, bold: true, color: '#fff6dc' });
      t(344, next.title.en, { size: 14, color: '#fff6dc' });
    } else t(315, cap, { size: 17, bold: true, color: '#f2c14e' });
    t(400, 'tap to continue', { size: 11, color: '#d8cbb5' });
    this.lastWho = null;
    this.layer.forEach((o, i) => this.easeIn([o], { rise: i ? 10 : 0, delay: i * 110, duration: 360 }));
  }

  // Skip the lines: a pending choice still has to be made (it changes the story).
  skip() {
    if (this.glossaryOpen) return;
    if (this.waitingChoice) return;
    if (this.stage === 'beats' && this.d.ep.choice) {
      this.queue = [];
      return this.showChoice();
    }
    this.finish();
  }

  // A tap on an orange word right as its line comes up was meant to move on (round 3: the word stole it).
  openGlossary(key) {
    if (this.time.now - (this.lineAt ?? 0) < GLOSS_SETTLE_MS) return this.tapReady() && this.advance();
    this.glossaryOpen = true;
    showGlossary(this, key, () => this.time.delayedCall(0, () => (this.glossaryOpen = false)));
  }

  // Fade the overlay away, then hand back to the stall.
  finish() {
    if (this.finished) return;
    this.finished = true;
    const ending = this.ending ?? endingFor(this.d.ep.endings, this.d.fame);
    if (ending) this.d.onEnding?.(ending);
    this.tweens.add({ targets: [this.shadeRect, ...this.layer, ...this.children.list.filter((o) => o.type === 'Text')], alpha: 0, duration: 380, ease: 'Sine.in', onComplete: () => this.d.onDone?.() });
  }
}
