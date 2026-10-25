// Stall tools. Positions are tool centres in logical px (360x640), laid out on the shelf of
// the stall background (public/bg/stall.webp). sprite = HD sprite key (spriteSizes.json);
// tools without a sprite are drawn as simple shapes. pourSprite = the tilted mid-pour picture swapped in
// while pouring (tools without one just tilt). liftSprite = what you hold once it's picked up (the spoon
// leaves its cup). kind:
//   pour  - hold over a cup to pour `ingredient` (meter shows how much)
//   drop  - release over a cup to add once (ice / Milo powder)
//   stir  - drop it on a cup and it stirs by itself (wiggling over the cup works too)
//   rack  - drag (or tap) to put a new empty cup on the tray
//   bin   - drop a cup here to throw it away (not draggable)

const SHELF = 534; // feet line of the tools standing on the metal shelf
const RAIL = 626; // feet line of the tools on the bottom rail

export const TOOLS = [
  { id: 'kopi', label: 'Kopi', kind: 'pour', ingredient: 'kopi', sprite: 'toolKopiPot', pourSprite: 'pourKopiPot', x: 38, feet: SHELF, w: 64, h: 86 },
  { id: 'teh', label: 'Teh', kind: 'pour', ingredient: 'teh', sprite: 'toolTehPot', pourSprite: 'pourTehPot', x: 104, feet: SHELF, w: 70, h: 76 },
  { id: 'sugar', label: 'Sugar', kind: 'pour', ingredient: 'sugar', sprite: 'toolSugar', pourSprite: 'pourSugar', x: 162, feet: SHELF, w: 48, h: 78 },
  { id: 'condensed', label: 'Condensed', kind: 'pour', ingredient: 'condensed', sprite: 'toolCondensed', pourSprite: 'pourCondensed', x: 212, feet: SHELF, w: 48, h: 66 },
  { id: 'evap', label: 'Evap (C)', kind: 'pour', ingredient: 'evap', sprite: 'toolEvap', pourSprite: 'pourEvap', x: 264, feet: SHELF, w: 48, h: 66 },
  { id: 'milo', label: 'Milo', kind: 'pour', ingredient: 'milo', sprite: 'toolMilo', pourSprite: 'pourMilo', x: 318, feet: SHELF, w: 52, h: 70 },
  { id: 'ice', label: 'Ice', kind: 'drop', apply: 'ice', sprite: 'toolIce', x: 122, feet: RAIL, w: 64, h: 66 },
  { id: 'stir', label: 'Spoon', kind: 'stir', sprite: 'toolStir', liftSprite: 'toolSpoon', liftH: 62, x: 172, feet: RAIL, w: 50, h: 72 },
  { id: 'rack', label: 'Cups', kind: 'rack', sprite: 'toolRack', x: 238, feet: RAIL, w: 76, h: 76 },
  { id: 'powder', label: 'Powder', kind: 'drop', apply: 'powder', sprite: 'toolMilo', spriteH: 48, x: 296, feet: RAIL, w: 46, h: 58 },
  { id: 'bin', label: 'Bin', kind: 'bin', x: 336, feet: RAIL, w: 42, h: 56, color: 0x6c757d },
].map((t) => ({ ...t, y: t.feet - t.h / 2 })); // y = centre (drag/hit maths use the centre)

// Tools that come with a night-shop machine (shown only when it's owned), keyed by shop item id.
export const MACHINE_TOOLS = {
  kettle: { id: 'water', label: 'Hot water', kind: 'pour', ingredient: 'water', sprite: 'toolTehPot', tint: 0xf2c46b, spriteH: 50, x: 70, feet: RAIL, w: 44, h: 58 }, // brass stand-in until its own art
  horlicksShelf: { id: 'horlicks', label: 'Horlicks', kind: 'pour', ingredient: 'horlicks', sprite: 'toolHorlicks', pourSprite: 'pourHorlicks', x: 22, feet: RAIL, w: 46, h: 58, color: 0xd9c49a },
};
for (const t of Object.values(MACHINE_TOOLS)) t.y = t.feet - t.h / 2;

// Cup spots on the tray plates of the background (x of each cup's centre).
export const SLOT_X = [70, 182, 290];
// Counter spots where customers stand (x of each customer).
export const SPOT_X = [64, 180, 296];
