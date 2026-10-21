// Turnaround samples (front / side / back) with chibi proportions:
// big round head (rows 0-12, 16px wide) on a small body (rows 13-23, torso 8px wide).
// Base templates use region digits that each character recolours:
//   1 = top, 2 = top shadow, 3 = bottom, 4 = bottom shadow, 5 = footwear
// Overlays are { row: string }, where '.' keeps the base pixel and '-' clears it.

import { PALETTE16 } from './castSamples.js';
export { PALETTE16 };

const HEAD_TOP = [
  '....OOOOOOOO....',
  '..OOssssssssOO..',
  '.OssssssssssssO.',
  '.OssssssssssssO.',
  'OssssssssssssssO',
  'OssssssssssssssO',
  'OssssssssssssssO',
];
const HEAD_BOTTOM = ['.OssssssssssssO.', '..OOssssssssOO..', '....OOOOOOOO....'];

const BODY_FRONT = [
  '...O11111111O...',
  '..O1111111111O..',
  '.O1O11111111O1O.',
  '.O2O11111111O2O.',
  '.OsO22222222OsO.',
  '..OO33333333OO..',
  '...O33333333O...',
  '...O333OO333O...',
  '...O334OO433O...',
  '...O555OO555O...',
  '...OOOO..OOOO...',
];

const BASE = {
  front: [
    ...HEAD_TOP,
    'Osss' + 'e' + 'ssssss' + 'e' + 'sssO',
    'Osss' + 'e' + 'ssssss' + 'e' + 'sssO',
    'O' + 'ssbsssmmsssbss' + 'O',
    ...HEAD_BOTTOM,
    ...BODY_FRONT,
  ],
  side: [
    ...HEAD_TOP,
    'O' + 'sssssssssss' + 'e' + 'ss' + 'O',
    'O' + 'sssssssssss' + 'e' + 'ss' + 'O',
    'O' + 'ssssssssss' + 'b' + 'ss' + 'm' + 'O',
    ...HEAD_BOTTOM,
    '....O111111O....',
    '...O11111111O...',
    '...O111O11O1O...',
    '...O222O22O2O...',
    '...O222OssO2O...',
    '...O33333333O...',
    '...O33333333O...',
    '..O333O..O333O..',
    '.O334O....O433O.',
    '.O555O....O5555O',
    '.OOOOO....OOOOOO',
  ],
  back: [...HEAD_TOP, 'OssssssssssssssO', 'OssssssssssssssO', 'OssssssssssssssO', ...HEAD_BOTTOM, ...BODY_FRONT],
};

// ---------- shared overlays ----------
const BARE_ARMS = {
  front: { 15: '..s..........s..', 16: '..s..........s..' },
  side: { 15: '........ss......', 16: '........ss......' },
  back: { 15: '..s..........s..', 16: '..s..........s..' },
};
const SHORT_SLEEVES = {
  front: { 16: '..s..........s..' },
  side: { 16: '........ss......' },
  back: { 16: '..s..........s..' },
};
const SHORTS = {
  front: { 21: '....sss..sss....' },
  side: { 21: '..sss......sss..' },
  back: { 21: '....sss..sss....' },
};
const KID_SHORTS = {
  front: { 20: '....sss..sss....', 21: '....www..www....' },
  side: { 20: '...sss....sss...', 21: '..www......www..' },
  back: { 20: '....sss..sss....', 21: '....www..www....' },
};

// Shared dark side-part hair (office guy, school boy).
const SIDE_PART = {
  front: {
    1: '..OOkkkkkkkkOO..',
    2: '.O' + 'kkKKKkkkkkkk' + 'O.',
    3: '.O' + 'kkkkkkkkkkkk' + 'O.',
    4: 'O' + 'kkkkkkkkkkkkkk' + 'O',
    5: 'O' + 'kkk' + 'sss' + 'kkkkkkkk' + 'O',
    6: 'O' + 'kk' + 'ssssssssss' + 'kk' + 'O',
    7: 'Ok' + 'ss' + 'e' + 'ssssss' + 'e' + 'ss' + 'kO',
    8: 'Ok' + 'ss' + 'e' + 'ssssss' + 'e' + 'ss' + 'kO',
  },
  side: {
    1: '..OOkkkkkkkkOO..',
    2: '.O' + 'kkkkkKKKkkkk' + 'O.',
    3: '.O' + 'kkkkkkkkkkkk' + 'O.',
    4: 'O' + 'kkkkkkkkkkkkkk' + 'O',
    5: 'O' + 'kkkkkkkkkk' + 'ssss' + 'O',
    6: 'O' + 'kkkkkk' + 'ssssssss' + 'O',
    7: 'O' + 'kkkk' + 'SS' + 'sssss' + 'e' + 'ss' + 'O',
    8: 'O' + 'kkkk' + 'SS' + 'sssss' + 'e' + 'ss' + 'O',
  },
  back: {
    1: '..OOkkkkkkkkOO..',
    2: '.O' + 'kkkKkkkkkkkk' + 'O.',
    3: '.O' + 'kkkkkkkkkkkk' + 'O.',
    4: 'O' + 'kkkkkkkkkkkkkk' + 'O',
    5: 'O' + 'kkkkkKkkkkkkkk' + 'O',
    6: 'O' + 'kkkkkkkkkkkkkk' + 'O',
    7: 'O' + 'kkkkkkkkkkkkkk' + 'O',
    8: 'O' + 'kkkkkkkkkkkkkk' + 'O',
    9: 'O' + 'kkkkkkkkkkkkkk' + 'O',
    10: '.O' + 'kkkkkkkkkkkk' + 'O.',
  },
};

// ---------- the cast (option A of each, in three views) ----------
export const TURNAROUNDS = [
  {
    id: 'uncleTan',
    colors: { 1: 'w', 2: 'W', 3: 'p', 4: 'P', 5: 'f' },
    layers: [
      BARE_ARMS,
      SHORTS,
      {
        // balding head: shine on top, dark hair around the sides / back
        front: { 2: '....w...........', 3: '...ww...........', 4: '.kk..........kk.', 5: '.kk..........kk.', 6: '.kk..........kk.', 7: '.k............k.' },
        side: { 2: '.......ww.......', 4: '.kkkk...........', 5: '.kkkk...........', 6: '.kkkkSS.........', 7: '.kkk.SS.........', 8: '..kk............' },
        back: { 2: '....ww..........', 5: '.k............k.', 6: '.kkkkkkkkkkkkkk.', 7: '.kkkkkkkkkkkkkk.', 8: '.kkkkkkkkkkkkkk.', 9: '.kkKkkkkkkkkKkk.', 10: '..kkkkkkkkkkkk..' },
      },
      {
        // singlet neckline + towel on his right shoulder
        front: { 13: '....s.sssstt....', 14: '...s......ttT...', 15: '..s........tTs..', 16: '..s........tTs..', 17: '...........TT...' },
        side: { 13: '.....tt.ss......', 14: '....tT..........', 15: '....tT..ss......' },
        back: { 13: '....tt..........', 14: '...stT......s...', 15: '..s.tT.......s..', 16: '..s..T.......s..' },
      },
    ],
  },
  {
    id: 'auntyLim',
    colors: { 1: 'r', 2: 'R', 3: 'q', 4: 'Q', 5: 'f' },
    layers: [
      SHORT_SLEEVES,
      {
        // big curly perm
        front: {
          0: '...OOO.OO.OOO...',
          1: '..OkkkOkkOkkkO..',
          2: '.O' + 'kkKkkkkkkKkk' + 'O.',
          3: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          4: 'Okk' + 'Kkkkkkkkk' + 'Kkk' + 'O',
          5: 'Okkk' + 'ssssssss' + 'kkkO',
          6: 'Okk' + 'ssssssssss' + 'kkO',
          7: 'Okk' + 's' + 'e' + 'ssssss' + 'e' + 's' + 'kkO',
          8: 'Okk' + 's' + 'e' + 'ssssss' + 'e' + 's' + 'kkO',
          9: 'Okk' + 'bsssmmsssb' + 'kkO',
          10: '.Ok' + 'ssssssssss' + 'kO.',
        },
        side: {
          0: '...OOO.OO.OOO...',
          1: '..OkkkOkkOkkkO..',
          2: '.O' + 'kkKkkkkkkKkk' + 'O.',
          3: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          4: 'O' + 'kkKkkkkkkkkkkk' + 'O',
          5: 'O' + 'kkkkkkkkkk' + 'ssss' + 'O',
          6: 'O' + 'kkkkkkkkk' + 'sssss' + 'O',
          7: 'O' + 'kkkkkkk' + 'ssss' + 'e' + 'ss' + 'O',
          8: 'O' + 'kkkkkkk' + 'ssss' + 'e' + 'ss' + 'O',
          9: 'O' + 'kkkkkk' + 'ssss' + 'b' + 'ss' + 'm' + 'O',
          10: '.O' + 'kkkk' + 'ssssssss' + 'O.',
          11: '..OO' + 'k' + 'sssssss' + 'OO..',
        },
        back: {
          0: '...OOO.OO.OOO...',
          1: '..OkkkOkkOkkkO..',
          2: '.O' + 'kkKkkkkkkKkk' + 'O.',
          3: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          4: 'Okk' + 'Kkkkkkkkk' + 'Kkk' + 'O',
          5: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          6: 'O' + 'kkkkKkkkkKkkkk' + 'O',
          7: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          8: 'O' + 'kkKkkkkkkkkKkk' + 'O',
          9: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          10: '.O' + 'kkkkkkkkkkkk' + 'O.',
          11: '..OOkkkkkkkkOO..',
        },
      },
      {
        // floral dots
        front: { 14: '.....y....y.....', 16: '....y....y......' },
        side: { 14: '.....y..y.......', 16: '....y...........' },
        back: { 14: '.....y....y.....', 16: '....y....y......' },
      },
    ],
  },
  {
    id: 'ahGong',
    colors: { 1: 'u', 2: 'U', 3: 'd', 4: 'D', 5: 'f' },
    layers: [
      {
        // combed grey hair, bushy brows, glasses
        front: {
          1: '..OOggggggggOO..',
          2: '.O' + 'ggGggggggggg' + 'O.',
          3: '.O' + 'gggGgggggggg' + 'O.',
          4: 'O' + 'gggggggggggggg' + 'O',
          5: 'Og' + 'ssssssssssss' + 'gO',
          6: 'Og' + 'sGGGssssGGGs' + 'gO',
          7: 'Oss' + 'jej' + 'sjjs' + 'jej' + 'ssO',
          8: 'Oss' + 'jej' + 'ssss' + 'jej' + 'ssO',
          9: 'Oss' + 'jjj' + 'ssmm' + 'jjj' + 'ssO',
        },
        side: {
          1: '..OOggggggggOO..',
          2: '.O' + 'ggggGggggggg' + 'O.',
          3: '.O' + 'gggggggGgggg' + 'O.',
          4: 'O' + 'gggggggggggggg' + 'O',
          5: 'O' + 'ggggggggg' + 'sssss' + 'O',
          6: 'O' + 'gggggggg' + 'ss' + 'GGG' + 's' + 'O',
          7: 'O' + 'ggggg' + 'S' + 'jjjj' + 'j' + 'e' + 'j' + 's' + 'O',
          8: 'O' + 'gggggg' + 'SS' + 'ss' + 'j' + 'e' + 'j' + 's' + 'O',
          9: 'O' + 'gggg' + 'ssssss' + 'b' + 'ss' + 'm' + 'O',
        },
        back: {
          1: '..OOggggggggOO..',
          2: '.O' + 'ggGgggggGggg' + 'O.',
          3: '.O' + 'gggggggggggg' + 'O.',
          4: 'O' + 'gggggggggggggg' + 'O',
          5: 'O' + 'ggggGggggGgggg' + 'O',
          6: 'O' + 'gggggggggggggg' + 'O',
          7: 'O' + 'jggggggggggggj' + 'O',
          8: 'O' + 'ggGgggggggggGg' + 'O',
          9: 'O' + 'gggggggggggggg' + 'O',
          10: '.O' + 'gggggggggggg' + 'O.',
        },
      },
      {
        // polo collar + newspaper
        front: { 13: '....ww....ww....', 14: '.......ww.......', 15: 'OOOOOOOOOOOOOOOO', 16: 'OszzZZzzZZZzzzsO', 17: 'OszZZZzzzZzzzzsO', 18: 'OOOOOOOOOOOOOOOO' },
        side: { 13: '.........ww.....', 14: '.........OOOOO..', 15: '........sOzZzO..', 16: '........sOZzZO..', 17: '.........OzZzO..', 18: '.........OOOOO..' },
        back: { 13: '....wwwwwwww....', 15: 'OOO..........OOO', 16: 'OzO..........OzO', 17: 'OzO..........OzO', 18: 'OOO..........OOO' },
      },
    ],
  },
  {
    id: 'officeGuy',
    colors: { 1: 'o', 2: 'L', 3: 'd', 4: 'D', 5: 'e' },
    layers: [
      SIDE_PART,
      {
        // red tie, green lanyard + ID card
        front: { 13: '.....v.nn.v.....', 14: '.....v.nn.v.....', 15: '......vnnv......', 16: '......ynn.......', 17: '.......EE.......' },
        side: { 13: '...........n....', 14: '..........vn....', 15: '..........yn....' },
        back: { 13: '......v..v......', 14: '.......vv.......' },
      },
    ],
  },
  {
    id: 'tourist',
    colors: { 1: 'a', 2: 'A', 3: 'i', 4: 'I', 5: 'f' },
    layers: [
      SHORT_SLEEVES,
      SHORTS,
      {
        // sun hat
        front: {
          0: '....OOOOOOOO....',
          1: '...OhhhhhhhhO...',
          2: '...OhhhhhhhhO...',
          3: '..OHHHHHHHHHHO..',
          4: 'OOhhhhhhhhhhhhOO',
          5: '.OOOOOOOOOOOOOO.',
          6: 'O' + 'kk' + 'ssssssssss' + 'kk' + 'O',
          7: 'Ok' + 'ss' + 'e' + 'ssssss' + 'e' + 'ss' + 'kO',
          8: 'Ok' + 'ss' + 'e' + 'ssssss' + 'e' + 'ss' + 'kO',
        },
        side: {
          0: '....OOOOOOOO....',
          1: '...OhhhhhhhhO...',
          2: '...OhhhhhhhhO...',
          3: '..OHHHHHHHHHHO..',
          4: 'OOhhhhhhhhhhhhOO',
          5: '.OOOOOOOOOOOOOO.',
          6: 'O' + 'kkkkkk' + 'ssssssss' + 'O',
          7: 'O' + 'kkkk' + 'SS' + 'sssss' + 'e' + 'ss' + 'O',
          8: 'O' + 'kkkk' + 'SS' + 'sssss' + 'e' + 'ss' + 'O',
        },
        back: {
          0: '....OOOOOOOO....',
          1: '...OhhhhhhhhO...',
          2: '...OhhhhhhhhO...',
          3: '..OHHHHHHHHHHO..',
          4: 'OOhhhhhhhhhhhhOO',
          5: '.OOOOOOOOOOOOOO.',
          6: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          7: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          8: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          9: 'O' + 'kkkkkkkkkkkkkk' + 'O',
          10: '.O' + 'kkkkkkkkkkkk' + 'O.',
        },
      },
      {
        // camera on a strap
        front: { 13: '.....V....V.....', 14: '......V..V......', 15: '.....VVVVVV.....', 16: '.....VVgVVV.....' },
        side: { 13: '.........V......', 14: '..........V.....', 15: '..........VVV...', 16: '..........VgV...' },
        back: { 13: '.....VVVVVV.....' },
      },
    ],
  },
  {
    id: 'schoolKid',
    colors: { 1: 'w', 2: 'W', 3: 'x', 4: 'X', 5: 'e' },
    layers: [SHORT_SLEEVES, KID_SHORTS, SIDE_PART, { front: { 14: '..........y.....' }, side: { 14: '..........y.....' }, back: {} }],
  },
];

// Oyen gets hand-drawn views (cats don't share the human base).
const E = '................';
export const OYEN_VIEWS = {
  front: [
    ...Array(11).fill(E),
    '..OO......OO....', '..OcO....OcO....', '..OccOOOOccO....', '.OcCcccccCcO....',
    '.OcceccccecO....', '.OccccbbccccO...', '..OccccccccO....', '..OCcwwwwcCO....',
    '.OcCcwwwwcCcO...', '.OccCwwwwCccOcO.', '.OcccwwwwcccOcO.', '.OccwwccwwccOO..',
    '..OOOOOOOOOOO...',
  ],
  side: [
    ...Array(12).fill(E),
    '..........O...O.', '.........OcO.OcO', '.........OccccCO', '.O.......OcecceO',
    'OcO......OccbccO', 'OcOOOOOOOOOcccO.', '.OcCcccCcccccCO.', '.OccCcccCcccccO.',
    '..OcccccccccccO.', '..OcOOcO..OcOOcO', '..OwOOwO..OwOOwO', '..OOOOOO..OOOOOO',
  ],
  back: [
    ...Array(11).fill(E),
    '..OO......OO....', '..OcO....OcO....', '..OccOOOOccO....', '.OcCcccccCcO....',
    '.O' + 'ccCccccCcc' + 'O...', '.O' + 'cccccccccc' + 'O...', '..O' + 'cCcccCcc' + 'O....', '..O' + 'CccCCccC' + 'O....',
    '.O' + 'cCccccccCc' + 'O...', '.O' + 'ccCccccCcc' + 'OcO.', '.O' + 'cccccccccc' + 'OcO.', '.O' + 'cccccccccc' + 'OcO.',
    '..OOOOOOOOOOOO..',
  ],
};

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

// CAST-shaped export so the sheet renderer can reuse it: one row per character, 3 views.
const NAMES = { uncleTan: 'uncleTan', auntyLim: 'auntyLim', ahGong: 'ahGong', officeGuy: 'officeGuy', tourist: 'tourist', schoolKid: 'schoolKids' };
export const CAST = [
  ...TURNAROUNDS.map((t) => ({
    id: NAMES[t.id],
    variants: ['front', 'side', 'back'].map((v) => ({ key: v.toUpperCase(), map: compose(t, v) })),
  })),
  { id: 'oyen', variants: ['front', 'side', 'back'].map((v) => ({ key: v.toUpperCase(), map: OYEN_VIEWS[v] })) },
];
