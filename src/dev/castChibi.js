// Chibi base v3: round head (16x14), small inverted-triangle body, arms spread to head width.
// Views: front, angle (45 deg, facing right; left = mirror), back.
// Region digits: 1 top, 2 top shadow, 3 bottom, 4 bottom shadow, 5 footwear.
// Overlays are { row: string }: '.' keeps the base pixel, '-' clears it.

import { PALETTE16 } from './castSamples.js';
export { PALETTE16 };

const HEAD_TOP = [
  '................',
  '.....OOOOOO.....',
  '...OOssssssOO...',
  '..OssssssssssO..',
  '.OssssssssssssO.',
  '.OssssssssssssO.',
  'OssssssssssssssO',
  'OssssssssssssssO',
];
const HEAD_BOTTOM = ['..OssssssssssO..', '...OOssssssOO...', '.....OOOOOO.....'];

// collar, shoulders (8 wide) narrowing to a 6-wide shirt; arms go sleeve -> forearm -> hand
const BODY_FRONT = [
  '....OO1111OO....',
  '...O11111111O...',
  '..O1O111111O1O..',
  '.O1OO222222OO1O.',
  'OsO.O222222O.OsO',
  'OO..O333333O..OO',
  '....O34OO43O....',
  '....O33OO33O....',
  '...O555OO555O...',
  '...OOOO..OOOO...',
];

const BASE = {
  front: [
    ...HEAD_TOP,
    'O' + 'ssss' + 'e' + 'ssss' + 'e' + 'ssss' + 'O',
    'O' + 'ssss' + 'e' + 'ssss' + 'e' + 'ssss' + 'O',
    '.O' + 'sbsssmmsssbs' + 'O.',
    ...HEAD_BOTTOM,
    ...BODY_FRONT,
  ],
  angle: [
    ...HEAD_TOP,
    'O' + 's' + 'SS' + 'sss' + 'e' + 'sss' + 'e' + 'sss' + 'O',
    'O' + 's' + 'SS' + 'sss' + 'e' + 'sss' + 'e' + 'sss' + 'O',
    '.O' + 'ssssbssmsssb' + 'O.',
    ...HEAD_BOTTOM,
    '....OO1111OO....',
    '...O11111111O...',
    '..O1O111111O1O..',
    '.O1OO222222O1O..',
    'OsO.O222222OsO..',
    'OO..O333333OO...',
    '....O34OO43O....',
    '....O33O.O33O...',
    '...O555O.O5555O.',
    '...OOOOO.OOOOOO.',
  ],
  back: [
    ...HEAD_TOP,
    'OssssssssssssssO',
    'OssssssssssssssO',
    '.OssssssssssssO.',
    ...HEAD_BOTTOM,
    ...BODY_FRONT,
  ],
};

// ---------- shared overlays ----------
const SHORTS = {
  front: { 21: '.....ss..ss.....' },
  angle: { 21: '.....ss...ss....' },
  back: { 21: '.....ss..ss.....' },
};
const BARE_ARMS = {
  front: { 16: '...s........s...', 17: '..s..........s..' },
  angle: { 16: '...s........s...', 17: '..s.........s...' },
  back: { 16: '...s........s...', 17: '..s..........s..' },
};
const SHORT_SLEEVES = {
  front: { 17: '..s..........s..' },
  angle: { 17: '..s.........s...' },
  back: { 17: '..s..........s..' },
};

// Short dark hair (school kid / office guy share the back).
const HAIR_BACK_DARK = {
  1: '.....OOOOOO.....',
  2: '...OOkkkkkkOO...',
  3: '..O' + 'kkkKKkkkkk' + 'O..',
  4: '.O' + 'kkkkkkkkkkkk' + 'O.',
  5: '.O' + 'kkKkkkkkkKkk' + 'O.',
  6: 'O' + 'kkkkkkkkkkkkkk' + 'O',
  7: 'O' + 'kkkkkkkkkkkkkk' + 'O',
  8: 'O' + 'kkkkkkkkkkkkkk' + 'O',
  9: 'O' + 'kkkkkkkkkkkkkk' + 'O',
  10: '.O' + 'kkkkkkkkkkkk' + 'O.',
  11: '..O' + 'kkkkkkkkkk' + 'O..',
};

const KID_HAIR = {
  front: {
    2: '...OOkkkkkkOO...',
    3: '..O' + 'kkkkKKkkkk' + 'O..',
    4: '.O' + 'kkkkkkkkkkkk' + 'O.',
    5: '.O' + 'kkkkkkkkkkkk' + 'O.',
    6: 'O' + 'kkkkkkkkkkkkkk' + 'O',
    7: 'O' + 'kkk' + 'ssss' + 'k' + 'ssss' + 'kk' + 'O',
    8: 'Ok' + 'sss' + 'e' + 'ssss' + 'e' + 'sss' + 'kO',
    9: 'Ok' + 'sss' + 'e' + 'ssss' + 'e' + 'sss' + 'kO',
  },
  angle: {
    2: '...OOkkkkkkOO...',
    3: '..O' + 'kkkKKkkkkk' + 'O..',
    4: '.O' + 'kkkkkkkkkkkk' + 'O.',
    5: '.O' + 'kkkkkkkkkkkk' + 'O.',
    6: 'O' + 'kkkkkkkkkkkkkk' + 'O',
    7: 'O' + 'kkkkk' + 'ssskssss' + 'k' + 'O',
    8: 'O' + 'k' + 'SS' + 'sss' + 'e' + 'sss' + 'e' + 'sss' + 'O',
    9: 'O' + 'k' + 'SS' + 'sss' + 'e' + 'sss' + 'e' + 'sss' + 'O',
  },
  back: HAIR_BACK_DARK,
};

const OFFICE_HAIR = {
  front: {
    ...KID_HAIR.front,
    3: '..O' + 'kKKKkkkkkk' + 'O..',
    6: 'O' + 'kkkkkkkkkkkkkk' + 'O',
    7: 'O' + 'kkkkkk' + 'sssssss' + 'k' + 'O',
  },
  angle: {
    ...KID_HAIR.angle,
    3: '..O' + 'kkKKKkkkkk' + 'O..',
    7: 'O' + 'kkkkkkk' + 'sssssss' + 'O',
  },
  back: HAIR_BACK_DARK,
};

export const CHIBI = [
  {
    id: 'uncleTan',
    colors: { 1: 'w', 2: 'W', 3: 'p', 4: 'P', 5: 'f' },
    layers: [
      BARE_ARMS,
      SHORTS,
      {
        // balding: shine on top, dark hair round the sides / back
        front: {
          3: '..O' + 'sswwssssss' + 'O..',
          4: '.O' + 'swssssssssss' + 'O.',
          6: 'Ok' + 'ssssssssssss' + 'kO',
          7: 'Okk' + 'ssssssssss' + 'kkO',
          8: 'Okk' + 'ss' + 'e' + 'ssss' + 'e' + 'ss' + 'kkO',
          9: 'Ok' + 'sss' + 'e' + 'ssss' + 'e' + 'sss' + 'kO',
        },
        angle: {
          3: '..O' + 'sssssswwss' + 'O..',
          4: '.O' + 'ssssssssswss' + 'O.',
          6: 'O' + 'kkk' + 'sssssssssss' + 'O',
          7: 'O' + 'kkk' + 'sssssssssss' + 'O',
          8: 'O' + 'k' + 'SS' + 'sss' + 'e' + 'sss' + 'e' + 'sss' + 'O',
          9: 'O' + 'k' + 'SS' + 'sss' + 'e' + 'sss' + 'e' + 'sss' + 'O',
          10: '.O' + 'k' + 'sssbssmsssb' + 'O.',
        },
        back: {
          3: '..O' + 'ssswwsssss' + 'O..',
          7: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          8: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          9: 'O' + 'kkkKkkkkkkKkkk' + 'O',
          10: '.O' + 'kkkkkkkkkkkk' + 'O.',
          11: '..O' + 'kkkkkkkkkk' + 'O..',
        },
      },
      {
        // singlet neckline + towel on his shoulder
        front: { 14: '......ssss......', 15: '......ss..tt....', 16: '.........tT.....', 17: '.........tT.....', 18: '..........T.....' },
        angle: { 14: '......ssss......', 15: '.......ss.tt....', 16: '.........tT.....', 17: '.........tT.....', 18: '..........T.....' },
        back: { 15: '..........tt....', 16: '.........tT.....', 17: '.........tT.....', 18: '..........T.....' },
      },
    ],
  },
  {
    id: 'auntyLim',
    colors: { 1: 'r', 2: 'R', 3: 'q', 4: 'Q', 5: 'f' },
    layers: [
      {
        // curly perm
        front: {
          0: '....OO.OO.OO....',
          1: '...OkkOkkOkkO...',
          2: '..O' + 'kkkkkkkkkk' + 'O..',
          3: '.O' + 'kkKkkkkkKkkk' + 'O.',
          4: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          5: 'O' + 'kkKkkkkkkkkKkk' + 'O',
          6: 'Okkk' + 'ssssssss' + 'kkkO',
          7: 'Okk' + 'ssssssssss' + 'kkO',
          8: 'Okk' + 'ss' + 'e' + 'ssss' + 'e' + 'ss' + 'kkO',
          9: 'Okk' + 'ss' + 'e' + 'ssss' + 'e' + 'ss' + 'kkO',
          10: 'Okk' + 'bsssmmsssb' + 'kkO',
          11: '.Okk' + 'ssssssss' + 'kkO.',
          12: '..OkO' + 'ssssss' + 'OkO..',
        },
        angle: {
          0: '....OO.OO.OO....',
          1: '...OkkOkkOkkO...',
          2: '..O' + 'kkkkkkkkkk' + 'O..',
          3: '.O' + 'kkKkkkkkKkkk' + 'O.',
          4: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          5: 'O' + 'kkKkkkkkkkkkkk' + 'O',
          6: 'O' + 'kkkkkk' + 'ssssssss' + 'O',
          7: 'O' + 'kkkkk' + 'sssssssss' + 'O',
          8: 'O' + 'kkkk' + 'ss' + 'e' + 'sss' + 'e' + 'sss' + 'O',
          9: 'O' + 'kkkk' + 'ss' + 'e' + 'sss' + 'e' + 'sss' + 'O',
          10: 'O' + 'kkkk' + 's' + 'b' + 'ss' + 'm' + 'sss' + 'b' + 's' + 'O',
          11: '..O' + 'kkk' + 'sssssss' + 'O..',
          12: '..OkkOssssssOO..',
        },
        back: {
          0: '....OO.OO.OO....',
          1: '...OkkOkkOkkO...',
          2: '..O' + 'kkkkkkkkkk' + 'O..',
          3: '.O' + 'kkKkkkkkKkkk' + 'O.',
          4: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          5: 'O' + 'kkKkkkkkkkkKkk' + 'O',
          6: 'O' + 'kkkkkKkkkkkkkk' + 'O',
          7: 'O' + 'kkkkkkkkkKkkkk' + 'O',
          8: 'O' + 'kKkkkkkkkkkkKk' + 'O',
          9: 'O' + 'kkkkkkKkkkkkkk' + 'O',
          10: '.O' + 'kkkkkkkkkkkk' + 'O.',
          11: '.O' + 'kkKkkkkkkkkk' + 'O.',
          12: '..OkkkkkkkkkkO..',
        },
      },
      SHORT_SLEEVES,
      {
        // floral dots
        front: { 15: '.....y....y.....', 16: '.......y........', 17: '.....y....y.....' },
        angle: { 15: '......y...y.....', 16: '........y.......', 17: '.....y....y.....' },
        back: { 15: '.....y....y.....', 16: '.......y........', 17: '.....y....y.....' },
      },
    ],
  },
  {
    id: 'officeGuy',
    colors: { 1: 'o', 2: 'L', 3: 'd', 4: 'D', 5: 'e' },
    layers: [
      OFFICE_HAIR,
      {
        // red tie, green lanyard + ID card
        front: { 14: '......vnnv......', 15: '......vnnv......', 16: '......ynn.......', 17: '.......nn.......', 18: '.......EE.......' },
        angle: { 14: '.......nn.......', 15: '.......vnnv.....', 16: '.......ynn......', 17: '........nn......', 18: '........EE......' },
        back: { 14: '......vvvv......' },
      },
    ],
  },
  {
    id: 'schoolKids',
    colors: { 1: 'w', 2: 'W', 3: 'x', 4: 'X', 5: 'e' },
    layers: [KID_HAIR, SHORTS, SHORT_SLEEVES, { front: { 16: '.........y......' }, angle: { 16: '.........y......' }, back: {} }],
  },
];

export function compose(spec, view) {
  const rows = BASE[view].map((r) => [...r].map((ch) => spec.colors[ch] ?? ch));
  for (const layer of spec.layers) {
    for (const [y, str] of Object.entries(layer[view] ?? {})) {
      [...str].forEach((ch, x) => {
        if (ch === '.') return;
        rows[y][x] = ch === '-' ? '.' : ch;
      });
    }
  }
  return rows.map((r) => r.join(''));
}

// CAST-shaped export for the sheet renderer: one row per character, 3 views.
export const CAST = CHIBI.map((c) => ({
  id: c.id,
  variants: [
    { key: 'FRONT', map: compose(c, 'front') },
    { key: 'ANGLE', map: compose(c, 'angle') },
    { key: 'BACK', map: compose(c, 'back') },
  ],
}));
