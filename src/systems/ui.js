import { COLORS, GAME_W, GAME_H } from '../config.js';
import { GLOSSARY } from '../data/glossary.js';
import { addText } from './text.js';
import { tokenize } from './order.js';

export const TERM_COLOR = '#c8562e';

// Chunky tap button. Returns a small handle with setSelected / setEnabled.
export function makeButton(scene, x, y, w, h, label, onTap, opts = {}) {
  const fill = opts.fill ?? COLORS.button;
  const bg = scene.add.rectangle(x, y, w, h, fill).setOrigin(0).setStrokeStyle(1, COLORS.inkHex, 0.5);
  const txt = addText(scene, x + w / 2, y + h / 2, label, { size: opts.size ?? 7, bold: opts.bold, origin: 0.5, align: 'center' });
  bg.setInteractive({ useHandCursor: true });

  const btn = {
    bg,
    txt,
    selected: false,
    enabled: true,
    setSelected(v) {
      this.selected = v;
      return this.refresh();
    },
    setEnabled(v) {
      if (this.enabled === v) return this;
      this.enabled = v;
      return this.refresh();
    },
    refresh() {
      bg.setFillStyle(!this.enabled ? COLORS.buttonDisabled : this.selected ? COLORS.buttonOn : fill);
      txt.setAlpha(this.enabled ? 1 : 0.45);
      return this;
    },
  };
  bg.on('pointerdown', () => {
    if (!btn.enabled) return;
    scene.tweens.add({ targets: [bg, txt], y: '+=1', duration: 50, yoyo: true });
    onTap();
  });
  btn.refresh();
  return btn;
}

// Lay out a dialogue line word by word inside maxW, colouring glossary terms and making
// them tappable. Returns { objects, width, height }.
export function layoutLine(scene, text, x, y, maxW, onTerm, opts = {}) {
  const size = opts.size ?? 7;
  const lineH = size + 3;
  const space = Math.round(size * 0.35);
  const objects = [];
  let cx = 0;
  let cy = 0;
  let widest = 0;

  for (const tok of tokenize(text)) {
    const t = addText(scene, 0, 0, tok.text, {
      size,
      bold: !!tok.glossaryKey,
      color: tok.glossaryKey ? TERM_COLOR : COLORS.ink,
    });
    if (cx > 0 && cx + t.width > maxW) {
      cx = 0;
      cy += lineH;
    }
    t.setPosition(x + cx, y + cy);
    if (tok.glossaryKey && onTerm) {
      t.setInteractive({ useHandCursor: true });
      t.on('pointerdown', (p, lx, ly, e) => {
        e?.stopPropagation?.();
        onTerm(tok.glossaryKey);
      });
    }
    cx += t.width + space;
    widest = Math.max(widest, cx - space);
    objects.push(t);
  }
  return { objects, width: widest, height: cy + lineH };
}

// Modal glossary card. Blocks input underneath; tap anywhere to close.
export function showGlossary(scene, key, onClose) {
  const g = GLOSSARY[key];
  if (!g) return;
  const depth = 100;
  const objs = [];
  const shade = scene.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.35).setOrigin(0).setDepth(depth).setInteractive();
  objs.push(shade);

  const cardW = 156;
  const x = (GAME_W - cardW) / 2;
  const pad = 8;
  const title = addText(scene, x + pad, 0, g.term, { size: 11, bold: true, color: TERM_COLOR });
  const en = addText(scene, x + pad, 0, g.en, { size: 7, wrap: cardW - pad * 2 });
  const zh = addText(scene, x + pad, 0, g.zh, { size: 8, wrap: cardW - pad * 2 });
  const hint = addText(scene, GAME_W / 2, 0, 'tap to close', { size: 6, color: '#8a7a70', origin: [0.5, 0] });
  const cardH = pad + title.height + 4 + en.height + 4 + zh.height + 6 + hint.height + pad;
  const top = Math.round((GAME_H - cardH) / 2) - 30;

  const card = scene.add.rectangle(x, top, cardW, cardH, COLORS.paper).setOrigin(0).setStrokeStyle(1, COLORS.inkHex);
  let cy = top + pad;
  for (const [t, gap] of [[title, 4], [en, 4], [zh, 6], [hint, 0]]) {
    t.setY(cy);
    cy += t.height + gap;
  }
  objs.push(card, title, en, zh, hint);
  card.setDepth(depth + 1);
  [title, en, zh, hint].forEach((t) => t.setDepth(depth + 2));

  // No fade-in: the Day scene pauses its tween manager while the card is open.
  shade.once('pointerdown', () => {
    objs.forEach((o) => o.destroy());
    onClose?.();
  });
}
