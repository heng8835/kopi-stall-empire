import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { CAST } from '../data/events.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite } from '../systems/sprites.js';
import { makeButton, layoutLine, showGlossary } from '../systems/ui.js';
import { play } from '../systems/sfx.js';
import { visibleBeats, endingFor, fill } from '../systems/story.js';

// One story episode, played as a short-drama overlay on top of the paused stall:
// title card -> lines (tap to advance) -> choice -> reply -> ending (finale) -> "下集" caption.
// Launched by StallScene with { ep, flags, fame, vars, owner, onChoice, onDone }.

const BOX_Y = 446;
const BOX_H = 168;
const PORTRAIT_H = 200;
const MOODS = { dark: [0x05060f, 0.82], rain: [0x1d3b5c, 0.62], fire: [0x6b1e05, 0.58] };

export default class DramaScene extends Phaser.Scene {
  constructor() {
    super('Drama');
  }

  create(data) {
    fitCamera(this);
    this.d = data;
    this.flags = new Set(data.flags);
    const [tint, alpha] = MOODS[data.ep.mood] ?? [0x000000, 0.55];
    this.add.rectangle(0, 0, GAME_W, GAME_H, tint, alpha).setOrigin(0).setInteractive().on('pointerdown', () => this.advance());
    // Phaser reuses this scene object for every episode: reset all per-episode state.
    this.layer = []; // what the current card drew
    this.queue = [];
    this.stage = 'title';
    this.ending = null;
    this.finished = false;
    this.waitingChoice = false;
    this.glossaryOpen = false;

    const skip = addText(this, GAME_W - 10, 36, 'Skip ▸▸', { size: 13, bold: true, color: '#fff6dc', origin: [1, 0] }).setDepth(20);
    skip.setInteractive({ useHandCursor: true }).on('pointerdown', (p, x, y, e) => {
      e?.stopPropagation?.();
      this.skip();
    });

    this.titleCard();
  }

  // ---------- cards ----------

  clear() {
    this.layer.forEach((o) => o.destroy());
    this.layer = [];
  }

  titleCard() {
    const { ep } = this.d;
    play('dayEnd');
    const t = (y, s, o) => this.layer.push(addText(this, GAME_W / 2, y, s, { align: 'center', origin: 0.5, color: '#fff6dc', ...o }));
    t(250, `EP ${ep.ep}`, { size: 14, bold: true, color: '#f2c14e' });
    t(284, ep.title.zh, { size: 30, bold: true });
    t(322, ep.title.en, { size: 17 });
    t(372, 'tap to continue', { size: 11, color: '#d8cbb5' });
    this.queue = visibleBeats(ep.beats, this.flags);
    this.stage = 'beats';
  }

  advance() {
    if (this.glossaryOpen || this.waitingChoice) return;
    if (this.stage === 'done') return this.finish();
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
    return { name: beat.name ?? cast.name, sprite: has ? cast.sprite : cast.fallback, silhouette: beat.silhouette || !has };
  }

  showBeat(beat) {
    this.clear();
    const who = this.speaker(beat.who, beat);
    const text = fill(beat.text, this.d.vars);
    if (who?.sprite && this.textures.exists(who.sprite)) {
      const s = addSprite(this, who.sprite, GAME_W / 2, BOX_Y + 14);
      s.setScale(s.scaleX * Math.min(1.5, PORTRAIT_H / s.displayHeight));
      if (s.displayWidth > GAME_W - 20) s.setScale(s.scaleX * ((GAME_W - 20) / s.displayWidth));
      if (who.silhouette) s.setTintFill(0x14110f);
      s.y += 8;
      this.tweens.add({ targets: s, y: s.y - 8, duration: 160, ease: 'Back.out' });
      this.layer.push(s);
    }

    const note = beat.who === 'note';
    const x = 12;
    const w = GAME_W - 24;
    const box = this.add.rectangle(x, BOX_Y, w, BOX_H, note ? 0xfff3c4 : beat.who === 'narrator' ? 0x2b2420 : COLORS.paper).setOrigin(0).setStrokeStyle(3, COLORS.inkHex);
    this.layer.push(box);
    const name = note ? `${beat.name ?? 'Note'} ✎` : who?.name;
    if (name) {
      const tag = addText(this, x + 14, BOX_Y - 12, name, { size: 14, bold: true, color: '#fff6dc' });
      const bg = this.add.rectangle(x + 8, BOX_Y - 15, tag.width + 14, 24, 0xc8562e).setOrigin(0).setStrokeStyle(2, COLORS.inkHex);
      tag.setDepth(2);
      this.layer.push(bg, tag);
    }
    if (beat.who === 'narrator') {
      this.layer.push(addText(this, x + 14, BOX_Y + 18, text, { size: 15, color: '#fff6dc', wrap: w - 28, lineSpacing: 5 }));
    } else {
      const words = layoutLine(this, text, x + 14, BOX_Y + 20, w - 28, (key) => this.openGlossary(key), { size: 16 });
      this.layer.push(...words.objects);
    }
    this.layer.push(addText(this, GAME_W - 18, BOX_Y + BOX_H - 18, '▼', { size: 12, color: beat.who === 'narrator' ? '#d8cbb5' : '#8a7a70', origin: [1, 0] }));
    play('tap');
  }

  showChoice() {
    this.clear();
    this.waitingChoice = true;
    this.layer.push(addText(this, GAME_W / 2, 250, 'What do you do?', { size: 18, bold: true, color: '#fff6dc', origin: 0.5 }));
    this.layer.push(addText(this, GAME_W / 2, 276, '你会怎么做?', { size: 14, color: '#d8cbb5', origin: 0.5 }));
    this.d.ep.choice.options.forEach((opt, i) => {
      const btn = makeButton(this, 24, 310 + i * 70, GAME_W - 48, 58, opt.label, () => this.choose(opt), { size: 15, bold: true });
      this.layer.push(btn.bg, btn.txt);
    });
  }

  choose(opt) {
    this.waitingChoice = false;
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
  }

  captionCard() {
    this.clear();
    this.stage = 'done';
    const cap = this.d.ep.caption;
    if (!cap) return this.finish();
    this.layer.push(this.add.rectangle(0, 270, GAME_W, 100, 0x000000, 0.75).setOrigin(0));
    this.layer.push(addText(this, GAME_W / 2, 320, cap, { size: 17, bold: true, color: '#f2c14e', align: 'center', origin: 0.5, wrap: 320 }));
    this.layer.push(addText(this, GAME_W / 2, 384, 'tap to continue', { size: 11, color: '#d8cbb5', origin: 0.5 }));
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

  openGlossary(key) {
    this.glossaryOpen = true;
    showGlossary(this, key, () => this.time.delayedCall(0, () => (this.glossaryOpen = false)));
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    const ending = this.ending ?? endingFor(this.d.ep.endings, this.d.fame);
    if (ending) this.d.onEnding?.(ending);
    this.d.onDone?.();
  }
}
