// v0.1 cast. Orders are written in real kopitiam lingo and parsed by systems/order.js.
//   weight      how often they show up (relative)
//   patience    seconds they wait at the counter before wandering off (gently)
//   groupSize   cups in one order (the sec school kids order 4 at once)
//   lines       key into src/i18n/lines.js
//   enabled     false = defined but not in the spawn pool yet (sprite comes in M2)

export const CUSTOMERS = [
  {
    id: 'auntyLim',
    name: 'Aunty Lim',
    sprite: 'auntyLim',
    enabled: true,
    weight: 3,
    patience: 40,
    groupSize: 1,
    orders: [
      { text: 'Teh C siew dai', weight: 4 },
      { text: 'Teh C siew dai peng', weight: 1 },
      { text: 'Teh', weight: 1 },
    ],
    lines: 'auntyLim',
  },
  {
    id: 'officeGuy',
    name: 'Office guy',
    sprite: 'officeGuy',
    enabled: true,
    weight: 3,
    patience: 22,
    groupSize: 1,
    orders: [
      { text: 'Kopi C kosong', weight: 4 },
      { text: 'Kopi C kosong peng', weight: 2 },
      { text: 'Kopi O kosong', weight: 1 },
    ],
    lines: 'officeGuy',
  },
  {
    id: 'schoolKids',
    name: 'Sec school kids',
    sprite: 'schoolKid',
    enabled: true,
    weight: 1,
    patience: 50,
    groupSize: 4,
    orders: [{ text: 'Milo Dinosaur', weight: 1 }],
    lines: 'schoolKids',
  },
  {
    id: 'ahGong',
    name: 'Ah Gong',
    sprite: null, // TODO M2: draw ahGong map
    enabled: false,
    weight: 2,
    patience: 60,
    groupSize: 1,
    orders: [{ text: 'Kopi O', weight: 1 }],
    lines: 'ahGong',
  },
  {
    id: 'tourist',
    name: 'Tourist',
    sprite: null, // TODO M2: draw tourist map
    enabled: false,
    weight: 1,
    patience: 45,
    groupSize: 1,
    orders: [{ text: 'Kopi O kosong', weight: 1 }],
    lines: 'tourist',
  },
];
