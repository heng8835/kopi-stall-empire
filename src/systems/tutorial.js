import { COLORS } from '../config.js';
import { TUTORIAL_TEXT } from '../data/tutorial.js';
import { makeButton } from './ui.js';
import { save } from './save.js';

const DEPTH = 47; // above the recipe-book / sound buttons

// Drives the Day-1 tutorial inside StallScene (src/data/tutorial.js): brings the scripted customers
// one by one; they teach in their own chat bubbles (with the ghost-hand demo) and your thought
// bubble adds the short tips. The stall stays locked until a customer hands you the turn. While
// active, StallScene pauses the day clock, random spawns and the tutorial customers' patience.
export class Tutorial {
  constructor(scene, steps) {
    this.scene = scene;
    this.steps = steps;
    this.i = -1;
    this.active = false;
    this.glows = [];
    this.skipBtn = null;
  }

  start() {
    this.active = true;
    const s = this.scene;
    const b = makeButton(s, 6, 74, 96, 22, TUTORIAL_TEXT.skip, () => this.skip(), { size: 10 });
    b.bg.setDepth(DEPTH);
    b.txt.setDepth(DEPTH + 1);
    this.skipBtn = b;
    this.next();
  }

  next() {
    this.i += 1;
    this.clearGlows();
    if (this.i >= this.steps.length) return this.finish();
    const step = this.steps[this.i];
    if (step.info) {
      this.scene.think(step.info, TUTORIAL_TEXT.infoMs);
      return this.scene.time.delayedCall(TUTORIAL_TEXT.infoMs, () => this.active && this.next());
    }
    this.trySpawn(step);
  }

  // The step's customer: already at the counter (Aunty Lim, from Episode 1) or walking in now.
  trySpawn(step) {
    if (!this.active) return;
    const s = this.scene;
    const here = s.allCustomers().find((x) => x.def.id === step.customer && x.state === 'waiting' && !x.served && x.orderText === step.order);
    const c = here ?? s.spawnCustomer(step.customer, step.order);
    if (!c) return s.time.delayedCall(500, () => this.trySpawn(step)); // slot still busy
    c.tutorial = true;
    const yourTurn = () => {
      if (!this.active) return;
      s.lockStall(false);
      this.highlight(step.highlight);
    };
    const begin = () => {
      if (!this.active) return;
      if (step.demo) return s.runDemo(c, yourTurn);
      s.showBubble(c, step.say, 'say');
      s.time.delayedCall(2800, () => c.state === 'waiting' && !c.served && s.showBubble(c, c.orderLine, 'order'));
      yourTurn();
    };
    if (here) s.time.delayedCall(500, begin);
    else c.onArrive = begin;
  }

  // Called by StallScene.serveCup() for every serve.
  onServed(c, tier) {
    if (!this.active || !c.tutorial || c.served < c.n) return;
    if (tier !== 'perfect') this.scene.think(TUTORIAL_TEXT.almost, 2500);
    this.scene.lockStall(true); // until the next customer hands over
    this.scene.time.delayedCall(1800, () => this.active && this.next());
  }

  finish() {
    this.close();
    this.scene.think(TUTORIAL_TEXT.done, 4500);
    this.scene.onTutorialDone?.();
  }

  skip() {
    if (this.scene.demo) this.scene.demo.cancelled = true;
    for (const c of this.scene.allCustomers()) c.tutorial = false;
    this.close();
    this.scene.onTutorialDone?.();
  }

  close() {
    this.active = false;
    save('tutorialDone', true);
    this.clearGlows();
    this.skipBtn?.bg.destroy();
    this.skipBtn?.txt.destroy();
    this.skipBtn = null;
    this.scene.lockStall(false);
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
