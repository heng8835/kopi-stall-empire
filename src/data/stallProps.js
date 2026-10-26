// What night-shop items look like at the stall: once bought, they appear on the wall, the floor or the
// counter ledge every day. Keyed by shop item id (src/data/shop.js); positions in logical px (360x640).
//   key    HD sprite key (spriteSizes.json)        x, feet   centre x and bottom y
//   h      display height override                  layer     'wall' (behind customers), 'floor'
//                                                             (behind customers), 'ledge' (on the counter)
//   anim   'sway' (hangs, swings) · 'flicker' (neon) · 'twinkle' (lights) · 'breathe' (sleeping cat)
//   sign   true = the owner's stall name is painted on it
//   back   where it goes instead once phase D machines take over the counter top: the wooden ledge
//          on the back wall, smaller (far away). Tip jar, bell and fan stay at the counter's ends.
// The Wall Menu Board is drawn by StallScene.drawMenuBoard (its size follows the menu).
export const STALL_PROPS = {
  signboard: [{ key: 'propSignboard', x: 196, feet: 82, h: 40, layer: 'wall', sign: true }],
  lanterns: [
    { key: 'propLantern', x: 122, feet: 96, layer: 'wall', anim: 'sway' },
    { key: 'propLantern2', x: 270, feet: 96, layer: 'wall', anim: 'sway' },
  ],
  fairyLights: [45, 135, 225, 315].map((x) => ({ key: 'propLights', x, feet: 66, h: 30, layer: 'wall', anim: 'twinkle' })),
  neon: [{ key: 'propNeon', x: 324, feet: 156, layer: 'wall', anim: 'flicker' }],
  plants: [
    { key: 'propPlantMoney', x: 18, feet: 250, layer: 'floor' },
    { key: 'propPlantPalm', x: 346, feet: 246, layer: 'floor' },
  ],
  catBed: [
    { key: 'propCatBed', x: 180, feet: 304, h: 26, layer: 'ledge', back: { x: 168, feet: 124, h: 17 } },
    { key: 'oyen', x: 180, feet: 297, h: 34, layer: 'ledge', anim: 'breathe', back: { x: 168, feet: 119, h: 23 } },
  ],
  tipJar: [{ key: 'propTipJar', x: 16, feet: 302, layer: 'ledge' }],
  bell: [{ key: 'propBell', x: 44, feet: 300, layer: 'ledge' }],
  radio: [{ key: 'propRadio', x: 122, feet: 300, layer: 'ledge', back: { x: 128, feet: 123, h: 20 } }],
  cupWarmer: [{ key: 'propCupWarmer', x: 238, feet: 302, layer: 'ledge', back: { x: 248, feet: 123, h: 27 } }],
  fan: [{ key: 'propFan', x: 342, feet: 302, layer: 'ledge' }],
};

export const PROP_DEPTH = { wall: 1, floor: 1.5, ledge: 11 };
