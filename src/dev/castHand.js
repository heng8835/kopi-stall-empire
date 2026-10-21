// Hand-drawn chibi samples (no templates), 3/4 view facing right. 16x24.
import { PALETTE16 } from './castSamples.js';
export { PALETTE16 };

export const KID = [
  '.....OOOO.OO....',
  '....OkkkkOkkO...',
  '..OOkkKKkkkkkO..',
  '.OkkkkkKkkkkkkO.',
  '.OkkkkkkkkkkkkO.',
  'OkkkkkkkkkkkkkkO',
  'OkkkkssksssksskO',
  'OkkSssss' + 'e' + 'sss' + 'e' + 'ss' + 'O',
  'OkkSssss' + 'e' + 'sss' + 'e' + 'ss' + 'O',
  'OkkSsss' + 'b' + 'ss' + 'm' + 'ss' + 'b' + 's' + 'O',
  '.Okk' + 'sssssssss' + 'O..',
  '...OO' + 'SSssss' + 'OO...',
  '....OwwSSwwO....',
  '...OwwwwwwwwwO..',
  '..OwOwwwwwwwOwO.',
  '..O' + 'W' + 'O' + 'wwwww' + 'y' + 'w' + 'O' + 'W' + 'O' + '.',
  '..OsOWWWWWWWOsO.',
  '..OOOxxxxxxxOOO.',
  '....OxxxXxxxO...',
  '....OxxO.OxxO...',
  '....OssO.OssO...',
  '....OwwO.OwwO...',
  '...OeeeO.OeeeeO.',
  '...OOOOO.OOOOOO.',
];

export const UNCLE = [
  '................',
  '.....OOOOOO.....',
  '...OOssswwsOO...',
  '..OssssswssssO..',
  '.OssssssssssssO.',
  '.OssssssssssssO.',
  'Okk' + 'ssssssssssss' + 'O',
  'OkkS' + 'sssssssssss' + 'O',
  'OkkS' + 'ssss' + 'e' + 'sss' + 'e' + 'ss' + 'O',
  'OkkS' + 'ssss' + 'e' + 'sss' + 'e' + 'ss' + 'O',
  'OkkS' + 'sss' + 'b' + 'ss' + 'm' + 'ss' + 'b' + 's' + 'O',
  '.Ok' + 'sssssssssss' + 'O.',
  '..OO' + 'sssssss' + 'OOO..',
  '...O' + 's' + 'ww' + 'SS' + 'ww' + 'tt' + 'O' + '..',
  '..OsOwwwwwwtTsO.',
  '..OsOwwwwwwwTsO.',
  '..OsO' + 'wwwwwwww' + 'OsO',
  '..OsO' + 'WWWWWWWW' + 'OsO',
  '...OOppppppppOO.',
  '....OppppPpppO..',
  '....OpppOpppO...',
  '....OssOOssO....',
  '...OfffO.OffffO.',
  '...OOOOO.OOOOOO.',
];

export const CAST = [
  { id: 'schoolKids', variants: [{ key: 'KID', map: KID }] },
  { id: 'uncleTan', variants: [{ key: 'UNCLE', map: UNCLE }] },
];
