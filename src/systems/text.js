import { FONT, COLORS } from '../config.js';
import { getRenderScale } from './view.js';

// Small helper so every Text object shares the same crisp style.
// Resolution matches the render scale so text is drawn 1:1 with real screen pixels.
export function addText(scene, x, y, str, opts = {}) {
  const t = scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: `${opts.size ?? 16}px`,
    color: opts.color ?? COLORS.ink,
    align: opts.align ?? 'left',
    fontStyle: opts.bold ? 'bold' : 'normal',
    wordWrap: opts.wrap ? { width: opts.wrap, useAdvancedWrap: true } : undefined,
    lineSpacing: opts.lineSpacing ?? 2,
  });
  t.setResolution(Math.ceil(getRenderScale()));
  if (opts.origin !== undefined) t.setOrigin(...[].concat(opts.origin));
  return t;
}
