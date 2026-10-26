// Stall tools. Positions are tool centres in logical px (360x640), laid out on the shelf of
// the stall background (public/bg/stall.webp). sprite = HD sprite key (spriteSizes.json);
// tools without a sprite are drawn as simple shapes. pourSprite = the tilted mid-pour picture swapped in
// while pouring (tools without one just tilt). liftSprite = what you hold once it's picked up (the spoon
// leaves its cup). kind:
//   pour  - hold over a cup to pour `ingredient` (meter shows how much)
//   drop  - release over a cup to add once (ice / Milo powder; `apply` = what it adds, see cup.js)
//   stir  - drop it on a cup and it stirs by itself (wiggling over the cup works too)
//   tarik - drop the mugs on a cup and it's pulled until frothy (up-and-down over the cup works too)
//   rack  - drag (or tap) to put a new empty cup on the tray
//   bin   - drop a cup here to throw it away (not draggable)

const SHELF = 534; // feet line of the tools standing on the metal shelf
const RAIL = 626; // feet line of the tools on the bottom rail
export const COUNTER = 310; // feet line of the counter-top machines (in front of the customers)

export const TOOLS = [
  { id: 'kopi', label: 'Kopi', kind: 'pour', ingredient: 'kopi', sprite: 'toolKopiPot', pourSprite: 'pourKopiPot', x: 38, feet: SHELF, w: 64, h: 86 },
  { id: 'teh', label: 'Teh', kind: 'pour', ingredient: 'teh', sprite: 'toolTehPot', pourSprite: 'pourTehPot', x: 104, feet: SHELF, w: 70, h: 76 },
  { id: 'sugar', label: 'Sugar', kind: 'pour', ingredient: 'sugar', sprite: 'toolSugar', pourSprite: 'pourSugar', x: 162, feet: SHELF, w: 48, h: 78 },
  { id: 'condensed', label: 'Condensed', kind: 'pour', ingredient: 'condensed', sprite: 'toolCondensed', pourSprite: 'pourCondensed', x: 212, feet: SHELF, w: 48, h: 66 },
  { id: 'evap', label: 'Evap (C)', kind: 'pour', ingredient: 'evap', sprite: 'toolEvap', pourSprite: 'pourEvap', x: 264, feet: SHELF, w: 48, h: 66 },
  { id: 'milo', label: 'Milo', kind: 'pour', ingredient: 'milo', sprite: 'toolMilo', pourSprite: 'pourMilo', x: 318, feet: SHELF, w: 52, h: 70 },
  { id: 'ice', label: 'Ice', kind: 'drop', apply: 'ice', sprite: 'toolIce', liftSprite: 'toolIceScoop', liftH: 40, liftAngle: -8, x: 122, feet: RAIL, w: 64, h: 66 },
  { id: 'stir', label: 'Spoon', kind: 'stir', sprite: 'toolStir', liftSprite: 'toolSpoon', liftH: 62, x: 172, feet: RAIL, w: 50, h: 72 },
  { id: 'rack', label: 'Cups', kind: 'rack', sprite: 'toolRack', x: 238, feet: RAIL, w: 76, h: 76 },
  { id: 'powder', label: 'Powder', kind: 'drop', apply: 'powder', sprite: 'toolMilo', spriteH: 48, x: 296, feet: RAIL, w: 46, h: 58 },
  { id: 'bin', label: 'Bin', kind: 'bin', x: 336, feet: RAIL, w: 42, h: 56, color: 0x6c757d },
].map((t) => ({ ...t, y: t.feet - t.h / 2 })); // y = centre (drag/hit maths use the centre)

// Tools that come with a night-shop machine (shown only when it's owned), keyed by shop item id.
export const MACHINE_TOOLS = {
  kettle: { id: 'water', label: 'Hot water', kind: 'pour', ingredient: 'water', sprite: 'toolTehPot', tint: 0xf2c46b, spriteH: 50, x: 70, feet: RAIL, w: 44, h: 58 }, // brass stand-in until its own art
  tarikMugs: { id: 'tarik', label: 'Tarik', kind: 'tarik', x: 200, feet: RAIL, w: 44, h: 58, color: 0xc9ced4 }, // drawn in code until its art
  horlicksShelf: { id: 'horlicks', label: 'Horlicks', kind: 'pour', ingredient: 'horlicks', sprite: 'toolHorlicks', pourSprite: 'pourHorlicks', x: 22, feet: RAIL, w: 46, h: 58, color: 0xd9c49a },
  // phase D: small machines standing on the counter top, drawn in code until their art arrives (shape = drawToolShape)
  gulaMelaka: { id: 'gula', label: 'Gula', kind: 'pour', ingredient: 'gula', // always poured in doses (StallScene.dosed)
    shape: 'bottle', x: 40, feet: COUNTER, w: 40, h: 50, color: 0x5c3216 },
  haliaPot: { id: 'halia', label: 'Halia', kind: 'drop', apply: 'halia', shape: 'pot', x: 90, feet: COUNTER, w: 44, h: 44, color: 0xe8c872 },
  limau: { id: 'limau', label: 'Limau', kind: 'drop', apply: 'limau', shape: 'bowl', x: 140, feet: COUNTER, w: 44, h: 40, color: 0x7cb342 },
  butter: { id: 'butter', label: 'Butter', kind: 'drop', apply: 'butter', shape: 'dish', x: 190, feet: COUNTER, w: 44, h: 38, color: 0xf6d860 },
  freezer: { id: 'icecream', label: 'Ice cream', kind: 'drop', apply: 'scoop', shape: 'tub', x: 250, feet: COUNTER, w: 50, h: 46, color: 0xfff4dc },
  tapau: { id: 'bag', label: 'Tapau', kind: 'drop', apply: 'tapau', shape: 'bag', x: 312, feet: COUNTER, w: 44, h: 48, color: 0xeef3f6 },
};
for (const t of Object.values(MACHINE_TOOLS)) t.y = t.feet - t.h / 2;

// The bottom rail fits 7 tools at their own spots. With more (machines bought), they share it evenly,
// in their usual left-to-right order, and shrink a little to fit. Returns { id: { x, scale } }.
export const layoutRail = (tools) => layoutRow(tools, RAIL, 7);

// The counter top: whatever is owned spreads out evenly across it, in the usual order.
export function layoutCounter(tools, left = 6, right = 354) {
  const row = tools.filter((t) => t.feet === COUNTER).sort((a, b) => a.x - b.x);
  const gap = (right - left) / Math.max(1, row.length);
  return Object.fromEntries(row.map((t, i) => [t.id, { x: left + gap * (i + 0.5), scale: Math.min(1, (gap - 4) / t.w) }]));
}

export function layoutRow(tools, feet, fits, left = 4, right = 356) {
  const rail = tools.filter((t) => t.feet === feet).sort((a, b) => a.x - b.x);
  if (rail.length <= fits) return Object.fromEntries(rail.map((t) => [t.id, { x: t.x, scale: 1 }]));
  const total = rail.reduce((s, t) => s + t.w, 0);
  const scale = Math.min(1, (right - left) / total);
  const out = {};
  let x = left;
  for (const t of rail) {
    out[t.id] = { x: x + (t.w * scale) / 2, scale };
    x += t.w * scale;
  }
  return out;
}

// Cup spots on the tray plates of the background (x of each cup's centre). The Fourth Tray Plate
// lays its own 4-plate tray over them (StallScene.drawFourPlates).
export const SLOT_X = [70, 182, 290];
export const SLOT_X4 = [48, 136, 224, 312];
// Counter spots where customers stand (x of each customer).
export const SPOT_X = [64, 180, 296];
