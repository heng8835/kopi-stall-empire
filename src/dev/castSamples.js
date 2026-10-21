// Cast style samples: 16x24, dark outline + one shadow tone. Dev-only (cast-samples.html).
// Chosen variants get baked into src/data/sprites.js later.
// Each sprite = hair rows 0-6 + face rows 7-12 + torso rows 13-17 + lower rows 18-23.

export const PALETTE16 = {
  O: '#2e2220', // outline
  s: '#f6cfa8', S: '#dba67e', // skin
  b: '#f4a0a0', e: '#2b2220', m: '#b0504a', // blush, eyes / shoes, mouth
  k: '#3a2e2a', K: '#5c4a42', // dark hair
  g: '#dcdcdc', G: '#a8a8a8', // grey hair
  j: '#6b5a50', // glasses frame
  w: '#f7f4ee', W: '#d6d0c4', // white cloth
  t: '#86c8dc', T: '#5ea6bd', // towel
  p: '#34507a', P: '#24395a', // uncle shorts
  f: '#4a7fc0', // blue slippers
  r: '#ec86a4', R: '#c9637f', y: '#fff1a8', // floral blouse
  q: '#4a4060', Q: '#352d47', // aunty pants
  o: '#9cc3e8', L: '#7099c4', n: '#d0463c', E: '#a8342c', v: '#3caa6e', // office shirt, tie, cap red, lanyard
  d: '#3d4250', D: '#2a2e38', // trousers
  x: '#24365e', X: '#18264a', // school navy
  u: '#e0d4a6', U: '#bfb27f', // polo / old-man shirt
  z: '#f2f0e6', Z: '#9a9a9a', // newspaper / map
  h: '#ecd078', H: '#c46a3a', // sun hat + band
  a: '#5cc0b0', A: '#3f9a8c', // tee
  V: '#3a3a44', // camera / phone / radio / sunglasses
  i: '#cdb88c', I: '#a8946a', // khaki
  l: '#b57a4a', J: '#8e5a32', // light-brown hair
  B: '#8a6a4a', Y: '#6a4e34', // cap / cardigan / noodles
  c: '#f0a24a', C: '#c97a2c', // Oyen
};

const swap = (rows, from, to) => rows.map((r) => r.split(from).join(to));

// ---------- hair / hats (rows 0-6) ----------
const HAIR = {
  sidePart: ['................', '.....OOOOOO.....', '...OOkkkkkkOO...', '..OkkkkkkkkkkO..', '.OkkKKKkkkkkkkO.', '.OkkkkkkkkkkkkO.', '.OkksssskkkkkkO.'],
  spiky: ['....O.O..O.O....', '...OkOkOOkOkO...', '..OkkkkkkkkkkO..', '.OkkkKkkkkKkkkO.', '.OkkkkkkkkkkkkO.', '.OkkkkkkkkkkkkO.', '.Ok' + 'skkskkskks' + 'kO.'],
  bowl: ['................', '.....OOOOOO.....', '...OOkkkkkkOO...', '..OkkkKkkkkkkO..', '.OkkkkkkkkkkkkO.', '.OkkkkkkkkkkkkO.', '.OkkkkkkkkkkkkO.'],
  bald: ['................', '.....OOOOOO.....', '...OOssssssOO...', '..OsswsssssssO..', '.OssssssssssssO.', '.Ok' + 'ssssssssss' + 'kO.', '.Okk' + 'ssssssss' + 'kkO.'],
  crewGrey: ['................', '.....OOOOOO.....', '...OOggggggOO...', '..OgGgGgGgGgGO..', '.OggggggggggggO.', '.OggggggggggggO.', '.OgssssssssssgO.'],
  towelHead: ['................', '.....OOOOOO.....', '...OOttttttOO...', '..OttTttttTttO..', '.OttttttttttttOO', '.OTTTTTTTTTTTTOt', '.Ok' + 'ssssssssss' + 'kO.'],
  combed: ['................', '.....OOOOOO.....', '...OOggggggOO...', '..OgggGggggggO..', '.OgggGgggggggGO.', '.OggggggggggggO.', '.OgssssssssssgO.'],
  flatCap: ['................', '....OOOOOOOO....', '...OBBBBBBBBO...', '..OBBBBBBBBBBO..', '.OYYYYYYYYYYYYOO', '.OOOOOOOOOOOOOO.', '.OgssssssssssgO.'],
  perm: ['....OO.OO.OO....', '...OkkOkkOkkO...', '..OkkkkkkkkkkO..', '.OkkKkkkkKkkkkO.', 'OkkkkkkkkkkkkkkO', 'OkkKkkkkkkkKkkkO', 'Okkk' + 'ssssssss' + 'kkkO'],
  bob: ['................', '.....OOOOOO.....', '...OOkkkkkkOO...', '..OkkkkkkkkyyO..', '.OkkkkkkkkkkkkO.', '.OkkKkkkkkkkkkO.', '.OkkkkkkkkkkkkO.'],
  sunHat: ['....OOOOOOOO....', '...OhhhhhhhhO...', '...OhhhhhhhhO...', '..OHHHHHHHHHHO..', 'OOhhhhhhhhhhhhOO', '.OOOOOOOOOOOOOO.', '.OkkkkkkkkkkkkO.'],
  cap: ['................', '.....OOOOOO.....', '...OOnnnnnnOO...', '..OnnnnnnnnnnO..', '.OnnnEnnnnnnnnO.', '.OEEEEEEEEEEEEOO', '.OkkkkkkkkkkkkO.'],
  shadesOnHead: ['................', '.....OOOOOO.....', '...OOllllllOO...', '..OllllllllllO..', '.OlVVVVllVVVVlO.', '.OllllllllllllO.', '.Ol' + 'ssssssssss' + 'lO.'],
  ponytail: ['................', '.....OOOOOO.....', '...OOkkkkkkOO...', '..OkkkkkkkkkkOOO', '.OkkKKkkkkkkkkOk', '.OkkkkkkkkkkkkOk', '.Ok' + 'sssssssskk' + 'kOk'],
};
HAIR.permGrey = swap(HAIR.perm, 'K', 'g');
HAIR.baldWhite = [...HAIR.bald.slice(0, 5), '.Ow' + 'ssssssssss' + 'wO.', '.Oww' + 'ssssssss' + 'wwO.'];

// ---------- face (rows 7-12) ----------
function face({ side = 'k', eyes = 'dot', wide = false, over = {} } = {}) {
  // glasses = thin frame: top bar on the forehead row, sides around the 1x2 eyes
  const glasses = eyes === 'glasses';
  const eyeRow = glasses ? 'sjejjjjejs' : 'ssessssess';
  const eyeA = eyeRow;
  const eyeB = glasses ? 'sjejssjejs' : eyeRow;
  const mid = (inner) => (wide ? `Okk${inner}kkO` : `.O${side}${inner}${side}O.`);
  const rows = [
    mid('ssssssssss'),
    mid(eyeA),
    mid(eyeB),
    wide ? 'Okk' + 'bsssmmsssb' + 'kkO' : '.Os' + 'bsssmmsssb' + 'sO.',
    wide ? '.Ok' + 'SssssssssS' + 'kO.' : '..O' + 'SssssssssS' + 'O..',
    wide ? '..OOOOssssOOOO..' : '...OOOssssOOO...',
  ];
  for (const [i, r] of Object.entries(over)) rows[i] = r;
  return rows;
}

// ---------- torso (rows 13-17) ----------
const TORSO = {
  singletTowel: ['..OOwwwwwwttOO..', '.OsOwwwwwwttTsO.', '.OsOwwwwwwwtTsO.', '.OsOWwwwwwwwTsO.', 'OsSOWWWWWWWWOSsO'],
  neckTowel: ['..OOttttttttOO..', '.OsOTwwwwwwTOsO.', '.OsOwwwwwwwwOsO.', 'OssOwwwwwwwwOssO', 'OsSOWWWWWWWWOSsO'],
  apron: ['..OOwwwwwwwwOO..', '.OsOwiwwwwiwOsO.', '.OsOiiiiiiiiOsO.', '.OsOiiiIIiiiOsO.', 'OsSOIIIIIIIIOSsO'],
  floral: ['..OOrrryrrrrOO..', '.OrrryrrrrryrrO.', '.ORrrrrryrrrrRO.', '.ORryrrrrrryrRO.', 'OsORRRRRRRRRROsO'],
  plate: ['..OOrrryrrrrOO..', '.OrrryrrrrryrrO.', 'OOOOOOOOOOOOrRO.', 'OsYBYBYBYsOrrRO.', 'OOwwwwwwwwORRRO.'],
  newspaper: ['..OOuuwwwwuuOO..', '.OuuuuuwwuuuuuO.', 'OOOOOOOOOOOOOOOO', 'OszzZZzzZZZzzzsO', 'OszZZZzzzZZzzzsO'],
  openShirt: ['..OOuuwwwwuuOO..', '.OuuuOwwwwOuuuO.', '.OUuuOwwwwOuuUO.', '.OUuuOwwwwOuuUO.', 'OsOUUOWWWWOUUOsO'],
  radio: ['..OOBBwwwwBBOO..', '.OBBBBOwwOBBBBO.', '.OYBBBBOOBBBBYO.', 'OsOVVVVVVVVOYYO.', '..OVgVgVgVVOYYO.'],
  officeTie: ['..OOooonnoooOO..', '.OoooovnnvooooO.', '.OLooovnnvoooLO.', '.OLoooynnooooLO.', 'OsOLLLLnnLLLLOsO'],
  officePhone: ['..OOwwwnnwwwOO..', '.OwwwwvnnvwwwwO.', '.OWwwwvnnvwwVVO.', '.OWwwwynnwwsVVO.', 'OsOWWWWnnWWWWO..'],
  camera: ['..OOaaVaaVaaOO..', '.OaaaaVaaVaaaaO.', '.OAaaaaVVaaaaAO.', '.OAaaVVVVVVaaAO.', 'OsOAAVVgVVAAAOsO'],
  map: ['..OOaDaaaaDaOO..', '.OaaaDaaaaDaaaO.', '.OAaaDaaaaDaaAO.', 'OzzZzzOaaaDaaAO.', 'OzZzzsOAAAAAAOsO'],
  kidShirt: ['..OOwwwwwwwwOO..', '.OwwwwwwwwwywwO.', '.OWwwwwwwwwwwWO.', '.OWwwwwwwwwwwWO.', 'OsOWWWWWWWWWWOsO'],
  pinafore: ['..OOwwwwwwwwOO..', '.OwwxwwwwwwxwwO.', '.OWwxxxxxxxxwWO.', '.OWwxxxyxxxxwWO.', 'OsOWxxxxxxxxWOsO'],
};

// ---------- lower body (rows 18-23) ----------
function lower(kind, c, sh, foot = 'f') {
  const c3 = c.repeat(3), c4 = c.repeat(4), f4 = foot.repeat(4);
  const top = `.OO${c.repeat(10)}OO.`;
  const hip = `..O${c4}${sh}${sh}${c4}O..`;
  const bottom = '.OOOOOO..OOOOOO.';
  if (kind === 'long') return [top, hip, `..O${c3}${sh}OO${sh}${c3}O..`, `..O${c3}O..O${c3}O..`, `.O${f4}O..O${f4}O.`, bottom];
  if (kind === 'shorts') return [top, hip, `..O${sh.repeat(3)}O..O${sh.repeat(3)}O..`, '..OsssO..OsssO..', `.O${f4}O..O${f4}O.`, bottom];
  if (kind === 'kid') return [top, hip, '..OsssO..OsssO..', '..OwwwO..OwwwO..', '..OeeeO..OeeeO..', '..OOOOO..OOOOO..'];
  if (kind === 'skirt') return [`.O${c.repeat(12)}O.`, `O${c}${c}${sh}${c.repeat(7)}${sh}${c}${c}${c}O`, 'OOOOOOOOOOOOOOOO', '..OsssO..OsssO..', '..OeeeO..OeeeO..', '..OOOOO..OOOOO..'];
  throw new Error(kind);
}

const build = (hair, faceOpts, torso, low) => [...hair, ...face(faceOpts), ...torso, ...low];

// ---------- Oyen ----------
const E = '................';
const OYEN_SIDE = [
  ...Array(12).fill(E),
  '..........O...O.', '.........OcO.OcO', '.........OccccCO', '.O.......OcecceO',
  'OcO......OccbccO', 'OcOOOOOOOOOcccO.', '.OcCcccCcccccCO.', '.OccCcccCcccccO.',
  '..OcccccccccccO.', '..OcOOcO..OcOOcO', '..OwOOwO..OwOOwO', '..OOOOOO..OOOOOO',
];
const OYEN_SIT = [
  ...Array(11).fill(E),
  '..OO......OO....', '..OcO....OcO....', '..OccOOOOccO....', '.OcCcccccCcO....',
  '.OcceccccecO....', '.OccccbbccccO...', '..OccccccccO....', '..OCcwwwwcCO....',
  '.OcCcwwwwcCcO...', '.OccCwwwwCccOcO.', '.OcccwwwwcccOcO.', '.OccwwccwwccOO..',
  '..OOOOOOOOOOO...',
];
// trim / pad Oyen rows to exactly 16 chars and 24 rows
const fit = (rows) => rows.slice(0, 24).map((r) => (r + E).slice(0, 16));

// ---------- the cast ----------
export const CAST = [
  {
    id: 'uncleTan',
    name: 'Uncle Tan (you)',
    trait: 'Stall owner. White singlet, towel on shoulder.',
    variants: [
      { key: 'A', label: 'Classic', note: 'Balding, singlet, towel on shoulder', map: build(HAIR.bald, { side: 'k' }, TORSO.singletTowel, lower('shorts', 'p', 'P')) },
      { key: 'B', label: 'Old-school', note: 'Grey crew cut, towel round neck, small belly', map: build(HAIR.crewGrey, { side: 'g' }, TORSO.neckTowel, lower('shorts', 'p', 'P')) },
      { key: 'C', label: 'Hard at work', note: 'Towel bandana, apron over singlet', map: build(HAIR.towelHead, { side: 'k' }, TORSO.apron, lower('long', 'd', 'D')) },
    ],
  },
  {
    id: 'auntyLim',
    name: 'Aunty Lim',
    trait: 'Unbothered by everything. Teh C siew dai.',
    variants: [
      { key: 'A', label: 'Perm + florals', note: 'Curly perm, pink floral blouse', map: build(HAIR.perm, { wide: true }, TORSO.floral, lower('long', 'q', 'Q')) },
      { key: 'B', label: 'With her CKT', note: 'Grey-streak perm, holding char kway teow', palette: { r: '#a98bd6', R: '#8669b8' }, map: build(HAIR.permGrey, { wide: true }, TORSO.plate, lower('long', 'q', 'Q')) },
      { key: 'C', label: 'Neat bob', note: 'Bob with hair clip, green floral top', palette: { r: '#86c9a0', R: '#5ea67c', y: '#ffffff' }, map: build(HAIR.bob, { side: 'k', over: { 3: '.Ok' + 'bsssmmsssb' + 'kO.' } }, TORSO.floral, lower('long', 'q', 'Q')) },
    ],
  },
  {
    id: 'ahGong',
    name: 'Ah Gong',
    trait: 'Reads the paper for hours on one Kopi O. Argues with the radio.',
    variants: [
      { key: 'A', label: 'Newspaper', note: 'Combed grey hair, glasses, newspaper', map: build(HAIR.combed, { side: 'g', eyes: 'glasses' }, TORSO.newspaper, lower('long', 'd', 'D')) },
      { key: 'B', label: 'Kopitiam regular', note: 'Bald with white sides, open shirt over singlet', map: build(HAIR.baldWhite, { side: 'w' }, TORSO.openShirt, lower('long', 'd', 'D')) },
      { key: 'C', label: 'Radio fan', note: 'Flat cap, glasses, cardigan, little radio', map: build(HAIR.flatCap, { side: 'g', eyes: 'glasses' }, TORSO.radio, lower('long', 'd', 'D')) },
    ],
  },
  {
    id: 'officeGuy',
    name: 'Office guy',
    trait: 'Lanyard, on a work call, "fast fast".',
    variants: [
      { key: 'A', label: 'Tie + lanyard', note: 'Side part, blue shirt, red tie', map: build(HAIR.sidePart, { side: 'k' }, TORSO.officeTie, lower('long', 'd', 'D', 'e')) },
      { key: 'B', label: 'On the phone', note: 'Spiky hair, white shirt, phone in hand', map: build(HAIR.spiky, { side: 'k' }, TORSO.officePhone, lower('long', 'd', 'D', 'e')) },
      { key: 'C', label: 'Casual Friday', note: 'Glasses, pink shirt, no tie', palette: { o: '#f2b8c6', L: '#d8919f' }, map: build(HAIR.bowl, { side: 'k', eyes: 'glasses' }, swap(TORSO.officeTie, 'n', 'o'), lower('long', 'd', 'D', 'e')) },
    ],
  },
  {
    id: 'tourist',
    name: 'Tourist',
    trait: '"Coffee, no milk, no sugar?" Learns the lingo with you.',
    variants: [
      { key: 'A', label: 'Sun hat', note: 'Sun hat, tee, camera', map: build(HAIR.sunHat, { side: 'k' }, TORSO.camera, lower('shorts', 'i', 'I')) },
      { key: 'B', label: 'Backpacker', note: 'Cap, backpack straps, paper map', palette: { a: '#f2a65a', A: '#d0843c' }, map: build(HAIR.cap, { side: 'k' }, TORSO.map, lower('shorts', 'i', 'I')) },
      { key: 'C', label: 'Holiday mode', note: 'Shades on head, holiday shirt', palette: { r: '#5ab0e0', R: '#3a8cc0', y: '#ffffff' }, map: build(HAIR.shadesOnHead, { side: 'l' }, TORSO.floral, lower('shorts', 'i', 'I')) },
    ],
  },
  {
    id: 'schoolKids',
    name: 'Sec school kids',
    trait: 'A group of 4. 4x Milo Dinosaur, short by 20 cents.',
    group: true,
    variants: [
      { key: 'A', label: 'Boy', note: 'Side part, school shirt + shorts', map: build(HAIR.sidePart, { side: 'k' }, TORSO.kidShirt, lower('kid', 'x', 'X')) },
      {
        key: 'B', label: 'Girl', note: 'Ponytail, pinafore',
        map: build(HAIR.ponytail, { side: 'k', over: { 0: '.Ok' + 'ssssssssss' + 'kOk', 1: '.Ok' + 'ssessssess' + 'kOk', 2: '.Ok' + 'ssessssess' + 'kOO' } }, TORSO.pinafore, lower('skirt', 'x', 'X')),
      },
      { key: 'C', label: 'Boy w/ specs', note: 'Bowl cut, glasses', map: build(HAIR.bowl, { side: 'k', eyes: 'glasses' }, TORSO.kidShirt, lower('kid', 'x', 'X')) },
    ],
  },
  {
    id: 'oyen',
    name: 'Oyen',
    trait: 'Orange stall cat. Steals kaya toast, sleeps in the cash drawer.',
    variants: [
      { key: 'A', label: 'On the prowl', note: 'Side view, walking', map: fit(OYEN_SIDE) },
      { key: 'B', label: 'Loaf mode', note: 'Sitting, white chest + paws', map: fit(OYEN_SIT) },
    ],
  },
];
