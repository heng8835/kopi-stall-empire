// Stall tools (greybox shapes for now; art comes later). Positions are tool centres in
// logical px (360x640). kind:
//   pour  - hold over a cup to pour `ingredient` (meter shows how much)
//   drop  - release over a cup to add once (ice / Milo powder)
//   stir  - wiggle left/right over a cup
//   rack  - drag (or tap) to put a new empty cup on the tray
//   bin   - drop a cup here to throw it away (not draggable)

const ROW1 = 498;
const ROW2 = 590;

export const TOOLS = [
  { id: 'kopi', label: 'Kopi pot', kind: 'pour', ingredient: 'kopi', x: 35, y: ROW1, w: 54, h: 76, color: 0xa8b0b8, accent: 0x3b2416 },
  { id: 'teh', label: 'Teh pot', kind: 'pour', ingredient: 'teh', x: 93, y: ROW1, w: 54, h: 76, color: 0xa8b0b8, accent: 0x9a4a1e },
  { id: 'sugar', label: 'Sugar', kind: 'pour', ingredient: 'sugar', x: 151, y: ROW1, w: 54, h: 76, color: 0xeef2f4, accent: 0xffffff },
  { id: 'condensed', label: 'Condensed', kind: 'pour', ingredient: 'condensed', x: 209, y: ROW1, w: 54, h: 76, color: 0xf3e2c0, accent: 0xc0392b },
  { id: 'evap', label: 'Evap (C)', kind: 'pour', ingredient: 'evap', x: 267, y: ROW1, w: 54, h: 76, color: 0xeaf0f8, accent: 0x2e5fa8 },
  { id: 'milo', label: 'Milo tin', kind: 'pour', ingredient: 'milo', x: 325, y: ROW1, w: 54, h: 76, color: 0x3f8a4a, accent: 0x5a3a28 },
  { id: 'ice', label: 'Ice', kind: 'drop', apply: 'ice', x: 38, y: ROW2, w: 60, h: 76, color: 0xd9eef5, accent: 0xffffff },
  { id: 'powder', label: 'Milo powder', kind: 'drop', apply: 'powder', x: 104, y: ROW2, w: 60, h: 76, color: 0x3f8a4a, accent: 0x5a3a28 },
  { id: 'stir', label: 'Spoon', kind: 'stir', x: 168, y: ROW2, w: 56, h: 76, color: 0xc9d1d8, accent: 0x8a949e },
  { id: 'rack', label: 'Cups', kind: 'rack', x: 252, y: ROW2, w: 96, h: 76, color: 0xe7ddc9, accent: 0xffffff },
  { id: 'bin', label: 'Bin', kind: 'bin', x: 326, y: ROW2, w: 56, h: 76, color: 0x8c8c8c, accent: 0x5a5a5a },
];

// Cup spots on the tray (x of each cup's centre).
export const SLOT_X = [62, 180, 298];
// Counter spots where customers stand (x of each customer).
export const SPOT_X = [62, 180, 298];
