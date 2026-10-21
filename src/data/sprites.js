// Pixel sprite maps for v0.1 (12x16 chibi). One character = one pixel, '.' = transparent.

export const PALETTE = {
  k: '#3a2e2a', // hair
  s: '#f2c9a0', // skin
  e: '#2b2220', // eyes / dark shoes
  b: '#f2a0a0', // blush
  m: '#c0605a', // mouth
  w: '#f4f1ea', // white singlet / uniform
  t: '#7fc4d8', // towel
  p: '#2f4a6b', // uncle shorts
  f: '#5a4a40', // slippers
  r: '#e57a9a', // aunty floral blouse
  y: '#fff1a8', // flower dots / badge
  q: '#4a4060', // aunty pants
  o: '#6d9bd1', // office shirt
  n: '#d0463c', // tie
  d: '#3d4250', // office trousers
  x: '#1f2a44', // school shorts
  c: '#e8a04c', // Oyen the cat
  u: '#7a4a2a', // kopi
  h: '#fafafa', // cup
  g: '#b9c2c9', // saucer
  z: '#cfd6db', // steam
};

// Big chibi head: full 12px wide, 8 rows (uses the old empty top row).
const HEAD = [
  '...kkkkkk...', '.kkkkkkkkkk.', 'kkkkkkkkkkkk', 'kssssssssssk',
  'ssssssssssss', 'sssessssesss', 'ssbssmmssbss', '.ssssssssss.',
];

export const SPRITES = {
  uncleTan: [
    '...ssssss...', '.ssssssssss.', 'kssssssssssk', 'kssssssssssk',
    'ssssssssssss', 'sssessssesss', 'ssbssmmssbss', '.ssssssssss.',
    '..wwwwwwtt..', '.swwwwwwwtts', '.swwwwwwwwws', '.swwwwwwwwws',
    '..pppppppp..', '..pppppppp..', '..ss....ss..', '..ff....ff..',
  ],
  // Perm hair already filled the width, so her head grows one row taller (blouse one shorter).
  auntyLim: [
    '..kk.kk.kk..', '.kkkkkkkkkk.', 'kkkkkkkkkkkk', 'kksssssssskk',
    'kssssssssssk', 'kssessssessk', 'ksbssmmssbsk', 'kssssssssssk',
    '.kssssssssk.', '..rryrryrr..', '.srrrryrrrrs', '.srryrrrryrs',
    '..qqqqqqqq..', '..qqqqqqqq..', '..ss....ss..', '..ff....ff..',
  ],
  officeGuy: HEAD.concat([
    '..oooooooo..', '.soooonoooos', '.soooonoooos', '..oooooooo..',
    '..dddddddd..', '..dddddddd..', '..dd....dd..', '..ee....ee..',
  ]),
  schoolKid: HEAD.concat([
    '..wwwwwwww..', '.swwwwwwwyws', '.swwwwwwwwws', '..wwwwwwww..',
    '..xxxxxxxx..', '..xxxxxxxx..', '..ss....ss..', '..ww....ww..',
  ]),
  oyen: [
    '............', '............', '............', '............',
    '............', '............', '............', '............',
    '........c..c', '........cccc', '.c......cece', 'c.......cccc',
    'c.cccccccc..', '.ccccccccc..', '.c.c...c.c..', '.c.c...c.c..',
  ],
  kopiC: [
    '............', '............', '............', '............',
    '............', '............', '............', '....z.z.....',
    '...z.z......', '............', '..uuuuuuu...', '..hhhhhhhhh.',
    '..hhhhhhh.h.', '..hhhhhhhhh.', '..hhhhhhh...', '.ggggggggg..',
  ],
};
