// Modal cards for the recipe calendar: the "new recipe" card a regular brings, and the recipe book.
// Both block input underneath; the caller pauses the day (like the glossary card).
import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { addText } from './text.js';
import { makeButton, addMuteToggle } from './ui.js';
import { play } from './sfx.js';

const DEPTH = 90;
const CARD_W = 316;

// A drink's combination as pictures in one row: tool + tool + ... = cup, each tool with its zone under it.
// items: [{ key, tint?, zone }]. Centred on cx, middle of the pictures at cy. Returns the objects (added to m).
function comboStrip(scene, m, items, { cx, cy, size = 30, cupTint = null, span = null }) {
  const n = items.length + 1; // + the cup
  const step = span ?? Math.min(size + 22, (CARD_W - 40) / n);
  const objs = [];
  const add = (o) => (objs.push(m.add(o)), o);
  const pic = (key, x, tint) => {
    const img = add(scene.add.image(x, cy, key));
    img.setScale(Math.min(size / img.height, size / img.width));
    if (tint) img.setTint(tint);
  };
  const x0 = cx - ((n - 1) * step) / 2;
  items.forEach((it, i) => {
    const x = x0 + i * step;
    pic(it.key, x, it.tint);
    add(addText(scene, x, cy + size / 2 + 2, it.zone ?? '', { size: Math.max(8, Math.round(size / 4)), bold: true, color: '#2f7a3a', origin: [0.5, 0] }));
    add(addText(scene, x + step / 2, cy, i < items.length - 1 ? '+' : '=', { size: Math.round(size / 2.2), bold: true, color: '#8a5a1e', origin: 0.5 }));
  });
  pic('cupGlass', x0 + items.length * step, cupTint);
  return objs;
}

function modal(scene) {
  const objs = [scene.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.45).setOrigin(0).setDepth(DEPTH).setInteractive()];
  const add = (o, d = 2) => (objs.push(o.setDepth(DEPTH + d)), o);
  const close = () => objs.forEach((o) => o.destroy());
  return { objs, add, close };
}

// The "new recipe" card. lesson: from src/data/recipes.js; showLine: false when a stand-in teacher brought it.
// combo = { items, cupTint }: the teacher's order as pictures (StallScene.comboItems).
export function showRecipeCard(scene, lesson, { showLine = true, combo = null, onClose } = {}) {
  const m = modal(scene);
  const c = lesson.card;
  const x = (GAME_W - CARD_W) / 2;
  const pad = 16;
  const items = [];
  const push = (t, gap) => items.push([m.add(t), gap]);
  push(addText(scene, x + pad, 0, `NEW RECIPE · DAY ${lesson.day}`, { size: 11, bold: true, color: '#c8402c' }), 4);
  push(addText(scene, x + pad, 0, c.title, { size: 19, bold: true, wrap: CARD_W - pad * 2 }), 2);
  push(addText(scene, x + pad, 0, c.zh, { size: 14, color: '#6b5a50' }), 10);
  const strip = combo && m.add(scene.add.rectangle(GAME_W / 2, 0, 10, 58, 0, 0).setOrigin(0.5, 0)); // room for the pictures
  if (strip) items.push([strip, 8]);
  if (showLine) push(addText(scene, x + pad, 0, c.line, { size: 12, wrap: CARD_W - pad * 2, color: '#3a2e2a' }), 10);
  c.steps.forEach((s, i) => push(addText(scene, x + pad, 0, `${i + 1}.  ${s}`, { size: 13, wrap: CARD_W - pad * 2 }), 4));
  push(addText(scene, x + pad, 0, `Aim for: ${c.zone}`, { size: 12, bold: true, color: '#2f7a3a' }), 14);
  const contentH = items.reduce((h, [t, gap]) => h + t.height + gap, 0);
  const h = pad + contentH + 44 + pad;
  const top = Math.round((GAME_H - h) / 2) - 20;
  m.add(scene.add.rectangle(x, top, CARD_W, h, COLORS.paper).setOrigin(0).setStrokeStyle(3, COLORS.inkHex), 1);
  // a strip of tape on top, like a note stuck on the stall
  m.add(scene.add.rectangle(GAME_W / 2, top - 2, 70, 16, 0xf2e3a8, 0.9).setAngle(-3), 3);
  let y = top + pad;
  for (const [t, gap] of items) {
    t.setY(y);
    y += t.height + gap;
  }
  if (strip) comboStrip(scene, m, combo.items, { cx: GAME_W / 2, cy: strip.y + 20, size: 34, cupTint: combo.cupTint });
  const btn = makeButton(scene, GAME_W / 2 - 70, top + h - pad - 40, 140, 40, 'Got it ▸', () => {
    m.close();
    btn.bg.destroy();
    btn.txt.destroy();
    onClose?.();
  }, { size: 15, bold: true, fill: 0xbfe3c0 });
  btn.bg.setDepth(DEPTH + 2);
  btn.txt.setDepth(DEPTH + 3);
  play('perfect');
}

// Day 1's starter menu: each drink as its tools, "pot + milk + spoon = drink" (src/data/tutorial.js).
export function showStarterCard(scene, { title, rows, note, button, onClose }) {
  const m = modal(scene);
  const W = 336;
  const x = (GAME_W - W) / 2;
  const rowH = 62;
  const h = 56 + rows.length * rowH + 64 + 56;
  const top = Math.round((GAME_H - h) / 2) - 10;
  m.add(scene.add.rectangle(x, top, W, h, COLORS.paper).setOrigin(0).setStrokeStyle(3, COLORS.inkHex), 1);
  m.add(scene.add.rectangle(GAME_W / 2, top - 2, 70, 16, 0xf2e3a8, 0.9).setAngle(-3), 3);
  m.add(addText(scene, GAME_W / 2, top + 16, title, { size: 18, bold: true, origin: [0.5, 0] }));
  const pic = (key, cx, cy, size, tint) => {
    const img = m.add(scene.add.image(cx, cy, key));
    img.setScale(Math.min(size / img.height, size / img.width));
    if (tint) img.setTint(tint);
    return img;
  };
  const sign = (s, cx, cy) => m.add(addText(scene, cx, cy, s, { size: 18, bold: true, color: '#8a5a1e', origin: 0.5 }));
  rows.forEach((r, i) => {
    const cy = top + 56 + i * rowH + rowH / 2;
    if (i) m.add(scene.add.rectangle(x + 14, cy - rowH / 2, W - 28, 1, 0xd9c9a8).setOrigin(0));
    const xs = [x + 30, x + 82, x + 134];
    r.tools.forEach((key, j) => {
      pic(key, xs[j], cy, 44);
      if (j < r.tools.length - 1) sign('+', (xs[j] + xs[j + 1]) / 2, cy);
    });
    sign('=', x + 165, cy);
    pic('cupGlass', x + 196, cy, 42, r.tint);
    m.add(addText(scene, x + 222, cy, r.name, { size: 16, bold: true, origin: [0, 0.5] }));
    // pop in one row after another
    scene.tweens.add({ targets: m.objs.slice(-9), alpha: { from: 0, to: 1 }, duration: 250, delay: 150 + i * 180 });
  });
  m.add(addText(scene, x + 16, top + 56 + rows.length * rowH + 8, note, { size: 12, wrap: W - 32, color: '#3a2e2a' }));
  const btn = makeButton(scene, GAME_W / 2 - 100, top + h - 52, 200, 40, button, () => {
    m.close();
    btn.bg.destroy();
    btn.txt.destroy();
    onClose?.();
  }, { size: 15, bold: true, fill: 0xbfe3c0 });
  btn.bg.setDepth(DEPTH + 2);
  btn.txt.setDepth(DEPTH + 3);
  play('perfect');
}

// The first time an order comes up: its combination, tool + tool + ... = the drink, each tool with
// the zone to pour to, and a line on what the new words mean. items: [{ key, zone, tint? }].
export function showComboCard(scene, { name, items, cupTint, notes, onClose }) {
  const m = modal(scene);
  const W = 336;
  const x = (GAME_W - W) / 2;
  const perRow = 4;
  const rows = Math.ceil(items.length / perRow);
  const rowH = 74;
  const noteObjs = notes.map((n) => addText(scene, 0, 0, n, { size: 12, wrap: W - 32, color: '#3a2e2a' }));
  const notesH = noteObjs.reduce((h, t) => h + t.height + 4, 0);
  const h = 70 + rows * rowH + 64 + notesH + 60;
  const top = Math.round((GAME_H - h) / 2) - 10;
  m.add(scene.add.rectangle(x, top, W, h, COLORS.paper).setOrigin(0).setStrokeStyle(3, COLORS.inkHex), 1);
  m.add(scene.add.rectangle(GAME_W / 2, top - 2, 70, 16, 0xf2e3a8, 0.9).setAngle(-3), 3);
  m.add(addText(scene, GAME_W / 2, top + 12, 'NEW ORDER · 新的点单', { size: 11, bold: true, color: '#c8402c', origin: [0.5, 0] }));
  m.add(addText(scene, GAME_W / 2, top + 30, name, { size: 20, bold: true, origin: [0.5, 0] }));
  const pic = (key, cx, cy, size, tint) => {
    const img = m.add(scene.add.image(cx, cy, key));
    img.setScale(Math.min(size / img.height, size / img.width));
    if (tint) img.setTint(tint);
    return img;
  };
  const sign = (s, cx, cy) => m.add(addText(scene, cx, cy, s, { size: 18, bold: true, color: '#8a5a1e', origin: 0.5 }));
  // the tools, four to a row, each with its zone underneath
  items.forEach((it, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const inRow = Math.min(perRow, items.length - row * perRow);
    const span = 78;
    const cx = GAME_W / 2 + (col - (inRow - 1) / 2) * span;
    const cy = top + 70 + row * rowH + 24;
    if (it.key) pic(it.key, cx, cy, 44, it.tint);
    else m.add(addText(scene, cx, cy, it.label, { size: 13, bold: true, color: '#5a5f66', origin: 0.5 })); // a tool with no art yet
    m.add(addText(scene, cx, cy + 30, it.zone, { size: 10, bold: true, color: '#2f7a3a', origin: [0.5, 0] }));
    if (col < inRow - 1) sign('+', cx + span / 2, cy);
  });
  // = the drink
  const ry = top + 70 + rows * rowH + 22;
  sign('=', GAME_W / 2 - 64, ry);
  pic('cupGlass', GAME_W / 2 - 30, ry, 46, cupTint);
  m.add(addText(scene, GAME_W / 2, ry, name, { size: 15, bold: true, origin: [0, 0.5], wrap: 150 }));
  let ny = top + 70 + rows * rowH + 56;
  noteObjs.forEach((t) => {
    m.add(t.setPosition(x + 16, ny));
    ny += t.height + 4;
  });
  const btn = makeButton(scene, GAME_W / 2 - 70, top + h - 50, 140, 40, 'Got it ▸', () => {
    m.close();
    btn.bg.destroy();
    btn.txt.destroy();
    onClose?.();
  }, { size: 15, bold: true, fill: 0xbfe3c0 });
  btn.bg.setDepth(DEPTH + 2);
  btn.txt.setDepth(DEPTH + 3);
  play('tap');
}

// The recipe book (the 📖 tab, game paused): every order word learnt so far, each with one example order
// as its combination in pictures. entries: [{ name, zh, text, example, items, cupTint }]. Drag to scroll.
export function showRecipeBook(scene, { entries, onClose }) {
  const m = modal(scene);
  const W = 340;
  const x = (GAME_W - W) / 2;
  const top = 46;
  const bottom = GAME_H - 64;
  const pad = 12;
  m.add(scene.add.rectangle(x, top, W, GAME_H - top - 10, 0xfff8e6).setOrigin(0).setStrokeStyle(3, 0x8a5a2b), 1);
  m.add(addText(scene, x + pad, top + 8, "📖 Uncle Tan's recipe book", { size: 16, bold: true }));
  m.add(addText(scene, x + pad, top + 30, '配方本 · the stall is paused · drag to scroll', { size: 11, color: '#6b5a50' }));
  m.add(addMuteToggle(scene, x + W - pad, top + 10, { size: 14, origin: [1, 0] }), 4); // sound on / off lives here
  const viewTop = top + 50;
  // everything that scrolls lives in one container, masked to the page
  const list = scene.add.container(0, 0);
  m.add(list, 3);
  const maskShape = scene.make.graphics({}, false).fillRect(x, viewTop, W, bottom - viewTop);
  list.setMask(maskShape.createGeometryMask());
  const sub = { add: (o) => (list.add(o), o) };
  let y = viewTop + 6;
  entries.forEach((e, i) => {
    if (i) list.add(scene.add.rectangle(x + pad, y - 6, W - pad * 2, 1, 0xd9c9a8).setOrigin(0));
    const name = sub.add(addText(scene, x + pad, y, `${e.name}  ${e.zh}`, { size: 13, bold: true, color: '#c8562e' }));
    const eg = sub.add(addText(scene, x + W - pad, y + 2, `e.g. ${e.example}`, { size: 11, color: '#6b5a50', origin: [1, 0] }));
    y += Math.max(name.height, eg.height) + 2;
    const text = sub.add(addText(scene, x + pad, y, e.text, { size: 12, wrap: W - pad * 2, color: '#3a2e2a' }));
    y += text.height + 6;
    comboStrip(scene, sub, e.items, { cx: GAME_W / 2, cy: y + 15, size: 28, cupTint: e.cupTint });
    y += 52;
  });
  const contentH = y - viewTop;
  const minY = Math.min(0, bottom - viewTop - contentH);
  let dragFrom = null;
  const scrollTo = (v) => list.setY(Phaser.Math.Clamp(v, minY, 0));
  m.objs[0].on('pointerdown', (p) => (dragFrom = { y: p.worldY, at: list.y }));
  m.objs[0].on('pointermove', (p) => dragFrom && p.isDown && scrollTo(dragFrom.at + (p.worldY - dragFrom.y)));
  m.objs[0].on('pointerup', () => (dragFrom = null));
  const wheel = (p, over, dx, dy) => scrollTo(list.y - dy * 0.5);
  scene.input.on('wheel', wheel);
  const btn = makeButton(scene, GAME_W / 2 - 100, GAME_H - 56, 200, 40, 'Back to the stall ▸', () => {
    scene.input.off('wheel', wheel);
    maskShape.destroy();
    m.close();
    btn.bg.destroy();
    btn.txt.destroy();
    onClose?.();
  }, { size: 15, bold: true, fill: 0xbfe3c0 });
  btn.bg.setDepth(DEPTH + 4);
  btn.txt.setDepth(DEPTH + 5);
  play('tap');
}
