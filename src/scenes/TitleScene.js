import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite } from '../systems/sprites.js';
import { makeButton, addMuteToggle } from '../systems/ui.js';
import { load, save } from '../systems/save.js';
import { OWNERS } from '../data/owners.js';
import { newRun, loadRun, saveRun, monthOver, runFromQuery } from '../systems/run.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    fitCamera(this);
    const cx = GAME_W / 2;
    this.owner = load('owner', 'mei');
    if (!OWNERS[this.owner]) this.owner = 'mei';

    this.add.rectangle(0, 0, GAME_W, GAME_H, COLORS.sky).setOrigin(0);
    this.add.rectangle(0, 420, GAME_W, GAME_H - 420, COLORS.floorA).setOrigin(0);

    addMuteToggle(this, GAME_W - 12, 12, { origin: [1, 0] });
    addText(this, cx, 96, 'Kopi Stall\nEmpire', { size: 40, bold: true, align: 'center', origin: 0.5 });
    addText(this, cx, 162, '咖啡摊帝国', { size: 18, align: 'center', origin: 0.5 });
    addText(this, cx, 206, "Who's opening the stall today?", { size: 15, align: 'center', origin: 0.5 });
    addText(this, cx, 228, '今天谁开档?', { size: 14, align: 'center', origin: 0.5, color: '#6b5a50' });

    this.picks = {};
    [['jun', 100], ['mei', 260]].forEach(([key, x]) => {
      const sprite = addSprite(this, OWNERS[key].sprite, x, 412, 150).setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.choose(key));
      const base = sprite.y;
      this.tweens.add({ targets: sprite, y: base - 4, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: key === 'mei' ? 300 : 0 });
      const btn = makeButton(this, x - 60, 432, 120, 44, OWNERS[key].name, () => this.choose(key), { size: 18, bold: true });
      this.picks[key] = { sprite, btn };
    });
    this.choose(this.owner);

    // Continue the month, or start a new one (a finished month can only start again).
    const run = loadRun();
    if (run && !monthOver(run)) {
      makeButton(this, cx - 110, 500, 220, 54, `Continue  ·  Day ${run.day}`, () => this.start(run), { size: 19, bold: true, fill: 0xbfe3c0 });
      makeButton(this, cx - 80, 560, 160, 32, 'New month (restart)', () => this.start(newRun()), { size: 12 });
    } else {
      if (run) addText(this, cx, 484, 'Month 1 complete ✓  完', { size: 13, bold: true, color: '#2f7a3a', origin: 0.5 });
      makeButton(this, cx - 110, 500, 220, 58, 'Open stall  开档!', () => this.start(newRun()), { size: 20, bold: true, fill: 0xbfe3c0 });
    }

    // Returning players can replay Uncle Tan's Day-1 notes.
    if (load('tutorialDone', false)) {
      const replay = addText(this, cx, 612, "Replay tutorial (Uncle Tan's notes)", { size: 13, color: '#8a5a1e', origin: 0.5 });
      replay.setInteractive({ useHandCursor: true }).once('pointerdown', () => {
        save('tutorialDone', false);
        replay.setText('Tutorial will play on Day 1 ✓');
      });
    }
  }

  choose(key) {
    this.owner = key;
    for (const [k, { sprite, btn }] of Object.entries(this.picks)) {
      btn.setSelected(k === key);
      sprite.setAlpha(k === key ? 1 : 0.55);
    }
  }

  start(run) {
    save('owner', this.owner);
    this.registry.set('owner', this.owner);
    // Testing shortcut: ?day=14&fame=60&flags=kidsOwe starts straight on that day.
    const jump = runFromQuery(window.location.search);
    const today = jump ?? run;
    saveRun(today);
    this.scene.start('Day', { run: today });
  }
}
