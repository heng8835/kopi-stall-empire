import { COLORS } from '../config.js';
import { TUTORIAL_TEXT } from '../data/tutorial.js';
import { addText } from './text.js';
import { makeButton } from './ui.js';
import { save } from './save.js';

const CARD = { x: 6, w: 348, top: 44 }; // full width, under the HUD (40 tall), sized to its text
const DEPTH = 47; // above the recipe-book / sound buttons

// Drives the Day-1 tutorial inside StallScene: spawns scripted customers one by one, shows
// Uncle Tan's note card, pulses the relevant tools. While active, StallScene pauses the
// day clock, random spawns and the tutorial customers' patience.
export class Tutorial {
  constructor(scene, steps) {
    this.scene = scene;
    this.steps = steps;
    this.i = -1;
    this.active = false;
    this.objs = [];
    this.glows = [];
  }

  start() {
    this.active = true;
    this.next();
  }

  next() {
    this.i += 1;
    if (this.i >= this.steps.length) return this.finish();
    const step = this.steps[this.i];
    if (step.info) {
      this.clearGlows();
      return this.showNote(step.note, true, () => this.next());
    }
    this.clearNote();
    this.clearGlows();
    this.trySpawn(step);
  }

  // The step's customer: already at the counter (Aunty Lim, from Episode 1) or walking in now.
  // First a ghost hand makes their order (Skip-able); then the note says "your turn".
  trySpawn(step) {
    if (!this.active) return;
    const s = this.scene;
    const here = s.allCustomers().find((x) => x.def.id === step.customer && x.state === 'waiting' && !x.served && x.orderText === step.order);
    const c = here ?? s.spawnCustomer(step.customer, step.order);
    if (!c) return s.time.delayedCall(500, () => this.trySpawn(step)); // slot still busy
    c.tutorial = true;
    const after = (made) => {
      if (!this.active) return;
      this.showNote(made ? step.after : step.note);
      this.highlight(made ? [] : step.highlight);
    };
    if (here) s.time.delayedCall(500, () => s.runDemo(c, after));
    else c.demoNext = after;
  }

  // Called by StallScene.serveCup() for every serve.
  onServed(c, tier) {
    if (!this.active || !c.tutorial || c.served < c.n) return;
    if (tier !== 'perfect') this.status.setText(TUTORIAL_TEXT.almost);
    this.scene.time.delayedCall(1800, () => this.active && this.next());
  }

  finish() {
    this.active = false;
    save('tutorialDone', true);
    this.clearGlows();
    this.showNote(TUTORIAL_TEXT.done, false);
    this.scene.time.delayedCall(5000, () => this.clearNote());
    this.scene.onTutorialDone?.();
  }

  skip() {
    if (this.scene.demo) this.scene.demo.cancelled = true;
    this.active = false;
    save('tutorialDone', true);
    this.clearGlows();
    this.clearNote();
    for (const c of this.scene.allCustomers()) c.tutorial = false;
    this.scene.onTutorialDone?.();
  }

  // onNext: show a Next button (info cards) instead of waiting for a serve.
  showNote(note, withSkip = true, onNext = null) {
    this.clearNote();
    const s = this.scene;
    const { x, w } = CARD;
    // Lay text out first (at y=0) to measure, then pin the card to the bottom of the screen.
    const title = addText(s, x + 8, 0, TUTORIAL_TEXT.title, { size: 11, bold: true, color: '#8a5a1e' }).setDepth(DEPTH + 1);
    const en = addText(s, x + 8, 0, note.en, { size: 12, wrap: w - 16, lineSpacing: 1 }).setDepth(DEPTH + 1);
    const zh = addText(s, x + 8, 0, note.zh, { size: 11, color: '#6b5a50', wrap: w - 16 }).setDepth(DEPTH + 1);
    this.status = addText(s, x + 120, 0, '', { size: 11, bold: true, color: '#c8562e' }).setDepth(DEPTH + 1);
    // Notes are written to fit 2 English lines + 1 Chinese line, so the card stays below SERVE.
    const h = 6 + 16 + en.height + 3 + zh.height + 6 + (onNext ? 28 : 0);
    const y = CARD.top;
    title.setY(y + 6);
    this.status.setY(y + 6);
    en.setY(y + 22);
    zh.setY(y + 25 + en.height);
    this.top = y;
    const card = s.add.rectangle(x, y, w, h, 0xfff1a8).setOrigin(0).setStrokeStyle(2, 0xd9b44a).setDepth(DEPTH);
    this.objs = [card, title, en, zh, this.status];
    if (onNext) {
      const next = makeButton(s, x + w - 78, y + h - 28, 70, 22, TUTORIAL_TEXT.next, onNext, { size: 11, bold: true, fill: 0xbfe3c0 });
      next.bg.setDepth(DEPTH + 1);
      next.txt.setDepth(DEPTH + 2);
      this.objs.push(next.bg, next.txt);
    }
    if (withSkip) {
      const btn = makeButton(s, x + w - 52, y + 4, 46, 20, TUTORIAL_TEXT.skip, () => this.skip(), { size: 11 });
      btn.bg.setDepth(DEPTH + 1);
      btn.txt.setDepth(DEPTH + 2);
      this.objs.push(btn.bg, btn.txt);
    }
    // Pop in gently
    s.tweens.add({ targets: this.objs, alpha: { from: 0, to: 1 }, duration: 250 });
  }

  clearNote() {
    this.objs.forEach((o) => o.destroy());
    this.objs = [];
  }

  highlight(ids) {
    this.clearGlows();
    for (const id of ids) {
      const target = this.scene.tools?.[id];
      if (!target) continue;
      const b = target.area ? target.area() : target.getBounds();
      const glow = this.scene.add.rectangle(b.x - 3, b.y - 3, b.width + 6, b.height + 6).setOrigin(0).setStrokeStyle(3, COLORS.accent).setDepth(target.depth + 1);
      this.scene.tweens.add({ targets: glow, alpha: { from: 1, to: 0.25 }, duration: 600, yoyo: true, repeat: -1 });
      this.glows.push(glow);
    }
  }

  clearGlows() {
    this.glows.forEach((g) => g.destroy());
    this.glows = [];
  }
}
