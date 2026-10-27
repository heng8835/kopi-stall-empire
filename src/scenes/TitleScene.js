import Phaser from 'phaser';
import { openingSeen } from './OpeningScene.js';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite } from '../systems/sprites.js';
import { makeButton, addMuteToggle } from '../systems/ui.js';
import { load, save } from '../systems/save.js';
import { playMusic } from '../systems/music.js';
import { OWNERS } from '../data/owners.js';
import { newRun, loadRun, saveRun, monthOver, runFromQuery, midDayOf, dayClock } from '../systems/run.js';
import { UI } from '../i18n/lines.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    fitCamera(this);
    playMusic('title');
    const cx = GAME_W / 2;
    this.confirming = false;
    this.owner = load('owner', 'mei');
    if (!OWNERS[this.owner]) this.owner = 'mei';

    // the corner kopitiam at sunrise, and the hand-painted sign with the name on it
    const bg = this.add.image(cx, GAME_H / 2, 'openingSunrise');
    bg.setScale(Math.max(GAME_W / bg.width, GAME_H / bg.height));
    const sign = addSprite(this, 'titleSign', cx, 132);
    this.tweens.add({ targets: sign, angle: { from: -1.2, to: 1.2 }, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const signX = cx + sign.displayWidth * 0.12; // the blank board, right of the cup emblem
    const name = addText(this, signX, 92, 'Kopi Stall Empire', { size: 22, bold: true, color: '#ffe7a8', align: 'center', origin: 0.5 });
    name.setStroke('#4a1a10', 4);
    const zh = addText(this, signX, 115, '咖啡摊帝国', { size: 14, bold: true, color: '#ffe7a8', align: 'center', origin: 0.5 });
    zh.setStroke('#4a1a10', 3);

    addMuteToggle(this, GAME_W - 12, 150, { origin: [1, 0], color: '#fff6dc' });
    this.add.rectangle(cx, 222, 280, 52, COLORS.paper, 0.9).setStrokeStyle(2, COLORS.inkHex, 0.6);
    addText(this, cx, 210, "Who's opening the stall today?", { size: 15, align: 'center', origin: 0.5 });
    addText(this, cx, 232, '今天谁开档?', { size: 14, align: 'center', origin: 0.5, color: '#6b5a50' });

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

    // a brand-new player: fetch the prologue's pictures now, so it doesn't open on a black screen
    if (!openingSeen()) {
      for (const key of ['openingDawn', 'openingFlashback', 'openingOffice']) if (!this.textures.exists(key)) this.load.image(key, `bg/${key}.webp`);
      this.load.start();
    }

    // Continue the month, or start a new one (a finished month can only start again).
    const run = loadRun();
    if (run && !monthOver(run)) {
      const mid = midDayOf(run);
      const where = run.night ? `Night shop (Day ${run.day - 1})` : `Day ${run.day}${mid ? `, ${dayClock(mid.clockMs)}` : ''}`;
      makeButton(this, cx - 130, 500, 260, 54, `Continue  ·  ${where}`, () => this.start(run), { size: mid || run.night ? 16 : 19, bold: true, fill: 0xbfe3c0 });
      // well away from Continue, and it asks first
      makeButton(this, 8, 8, 104, 24, 'New month…', () => this.confirmRestart(run), { size: 11 });
    } else {
      if (run) addText(this, cx, 484, 'Month 1 complete ✓  完', { size: 13, bold: true, color: '#2f7a3a', origin: 0.5 });
      makeButton(this, cx - 110, 500, 220, 58, 'Open stall  开档!', () => this.start(newRun()), { size: 20, bold: true, fill: 0xbfe3c0 });
    }

    // Returning players can replay Uncle Tan's Day-1 notes.
    if (load('tutorialDone', false)) {
      const replay = addText(this, cx, 612, 'Replay intro + tutorial', { size: 13, bold: true, color: '#fff6dc', origin: 0.5 });
      replay.setStroke('#3a2414', 3);
      replay.setInteractive({ useHandCursor: true }).once('pointerdown', () => {
        save('tutorialDone', false);
        save('openingSeen', false);
        save('demosOff', false); // the watch-first demos come back too
        save('demosSeen', []);
        save('combosSeen', []); // and the new-order cards
        save('featuresSeen', []);
        replay.setText('Intro + tutorial will play on Day 1 ✓');
      });
    }
  }

  // "Start over?" — keeping the save is the big, safe button.
  confirmRestart(run) {
    if (this.confirming) return;
    this.confirming = true;
    const cx = GAME_W / 2;
    const objs = [this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.5).setOrigin(0).setInteractive().setDepth(50)];
    objs.push(this.add.rectangle(cx, 320, 290, 190, COLORS.paper).setStrokeStyle(2, COLORS.inkHex).setDepth(51));
    objs.push(addText(this, cx, 252, UI.restartTitle, { size: 18, bold: true, origin: 0.5 }).setDepth(52));
    objs.push(addText(this, cx, 282, UI.restartBody.replace('{day}', run.day), { size: 13, origin: 0.5, color: '#6b5a50' }).setDepth(52));
    const close = () => {
      objs.forEach((o) => o.destroy());
      this.confirming = false;
    };
    const keep = makeButton(this, cx - 120, 306, 240, 48, UI.restartKeep, close, { size: 16, bold: true, fill: 0xbfe3c0 });
    const wipe = makeButton(this, cx - 70, 366, 140, 30, UI.restartYes, () => this.start(newRun()), { size: 12 });
    for (const b of [keep, wipe]) {
      b.bg.setDepth(52);
      b.txt.setDepth(53);
      objs.push(b.bg, b.txt);
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
    // A brand-new month: the opening cutscene plays once first.
    if (!jump && today.day === 1 && !openingSeen()) return this.scene.start('Opening', { run: today });
    if (!jump && today.night) return this.scene.start('Shop', { run: today }); // left from the day-end card: tonight's shop first
    this.scene.start('Day', { run: today });
  }
}
