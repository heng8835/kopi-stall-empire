// Modal cards for the recipe calendar: the "new recipe" card a regular brings, and the recipe book.
// Both block input underneath; the caller pauses the day (like the glossary card).
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { BOOK } from '../data/recipes.js';
import { addText } from './text.js';
import { makeButton } from './ui.js';
import { unlockedFeatures } from './menu.js';
import { play } from './sfx.js';

const DEPTH = 90;
const CARD_W = 316;

function modal(scene) {
  const objs = [scene.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.45).setOrigin(0).setDepth(DEPTH).setInteractive()];
  const add = (o, d = 2) => (objs.push(o.setDepth(DEPTH + d)), o);
  const close = () => objs.forEach((o) => o.destroy());
  return { objs, add, close };
}

// The "new recipe" card. lesson: from src/data/recipes.js; showLine: false when a stand-in teacher brought it.
export function showRecipeCard(scene, lesson, { showLine = true, onClose } = {}) {
  const m = modal(scene);
  const c = lesson.card;
  const x = (GAME_W - CARD_W) / 2;
  const pad = 16;
  const items = [];
  const push = (t, gap) => items.push([m.add(t), gap]);
  push(addText(scene, x + pad, 0, `NEW RECIPE · DAY ${lesson.day}`, { size: 11, bold: true, color: '#c8402c' }), 4);
  push(addText(scene, x + pad, 0, c.title, { size: 19, bold: true, wrap: CARD_W - pad * 2 }), 2);
  push(addText(scene, x + pad, 0, c.zh, { size: 14, color: '#6b5a50' }), 10);
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

// The recipe book: every order word taught so far.
export function showRecipeBook(scene, day, onClose) {
  const m = modal(scene);
  const known = [...unlockedFeatures(day)];
  const x = (GAME_W - CARD_W) / 2;
  const pad = 14;
  const rows = [];
  const title = m.add(addText(scene, x + pad, 0, "Uncle Tan's recipe book", { size: 17, bold: true }));
  const sub = m.add(addText(scene, x + pad, 0, '配方本 · tap anywhere to close', { size: 11, color: '#8a7a70' }));
  for (const f of known) {
    const b = BOOK[f];
    if (!b) continue;
    const name = m.add(addText(scene, x + pad, 0, `${b.name}  ${b.zh}`, { size: 13, bold: true, color: '#c8562e' }));
    const text = m.add(addText(scene, x + pad + 8, 0, b.text, { size: 12, wrap: CARD_W - pad * 2 - 8 }));
    rows.push(name, text);
  }
  const h = pad + title.height + sub.height + 10 + rows.reduce((s, t, i) => s + t.height + (i % 2 ? 8 : 1), 0) + pad;
  const top = Math.max(40, Math.round((GAME_H - h) / 2) - 20);
  m.add(scene.add.rectangle(x, top, CARD_W, h, 0xfff8e6).setOrigin(0).setStrokeStyle(3, 0x8a5a2b), 1);
  let y = top + pad;
  title.setY(y);
  y += title.height;
  sub.setY(y);
  y += sub.height + 10;
  rows.forEach((t, i) => {
    t.setY(y);
    y += t.height + (i % 2 ? 8 : 1);
  });
  m.objs[0].once('pointerdown', () => {
    m.close();
    onClose?.();
  });
}
