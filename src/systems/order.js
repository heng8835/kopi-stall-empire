import { DRINKS, MODIFIERS } from '../data/drinks.js';
import { GLOSSARY, NAMES, CLAUSE_END_ONLY, PARTICLES } from '../data/glossary.js';

// A drink spec is { base, milk, sugar, iced, topping, strength }.
//   base:  'kopi' | 'teh' | 'cham' (kopi + teh) | 'milo' | 'horlicks'
//   milk:  'condensed' | 'evap' | 'none'   (null for the malt drinks, Milo and Horlicks)
//   sugar: 'normal' | 'less' | 'none' | 'more'   (null for the malt drinks)
//   strength: 'normal' | 'gao' (strong, no water) | 'poh' (weak, hot water added)   (null for malt drinks)
//   tarik: true when it's pulled until frothy ("Teh tarik"); absent otherwise
//   halia / limau / butter: ginger, calamansi lime, a cube of butter dropped in (counter-top machines)
//   layered: "Teh C Special", gula melaka + evap + teh in three layers, never stirred
//   scoop: a scoop of ice cream on a Dinosaur ("Milo Godzilla")
//   tapau: takeaway, bagged when it's done ("... tapau", any drink)
//   For condensed-milk drinks (Kopi, Teh) the condensed milk is the sweetness; O and C use the sugar can.

const MILK_WORD = { O: 'none', C: 'evap' };
const MILK_TO_WORD = { none: 'O', evap: 'C', condensed: '' };
export const MALT = ['milo', 'horlicks']; // malt drinks: one tin, no milk or sugar to judge
const NAME = { kopi: 'Kopi', teh: 'Teh', cham: 'Cham', milo: 'Milo', horlicks: 'Horlicks' };
const SUGAR_TO_WORD = { none: 'kosong', less: 'siew dai', normal: '', more: 'ga dai' };
const STRENGTH_TO_WORD = { gao: 'gao', poh: 'poh', normal: '' };

export function findDrink(spec) {
  if (spec.base === 'milo') return spec.scoop ? DRINKS.miloGodzilla : spec.topping ? DRINKS.miloDino : DRINKS.milo;
  if (spec.layered) return DRINKS.tehCSpecial;
  if (spec.base === 'horlicks') return spec.topping ? DRINKS.horlicksDino : DRINKS.horlicks;
  return Object.values(DRINKS).find((d) => d.base === spec.base && d.milk === spec.milk) ?? null;
}

// "Teh C siew dai peng" -> { base: 'teh', milk: 'evap', sugar: 'less', iced: true, topping: null }
export function parseOrder(text) {
  const words = text.trim().split(/\s+/);
  const first = words.shift()?.toLowerCase();
  const tapau = words.at(-1)?.toLowerCase() === 'tapau' ? (words.pop(), { tapau: true }) : {}; // any drink can be takeaway

  if (MALT.includes(first)) {
    // "Milo", "Milo peng", "Milo Dinosaur" (iced, powder on top), "Milo Godzilla" (+ ice cream); Horlicks the same
    const rest = words.join(' ').toLowerCase();
    const malt = { base: first, milk: null, sugar: null, topping: null, strength: null, ...tapau };
    if (rest === 'dinosaur') return { ...malt, iced: true, topping: first };
    if (rest === 'godzilla' && first === 'milo') return { ...malt, iced: true, topping: first, scoop: true };
    if (rest === '' || rest === 'peng') return { ...malt, iced: rest === 'peng' };
    throw new Error(`Unknown ${first} order: "${text}"`);
  }
  if (!['kopi', 'teh', 'cham'].includes(first)) throw new Error(`Unknown drink: "${text}"`);

  const spec = { base: first, milk: 'condensed', sugar: 'normal', iced: false, topping: null, strength: 'normal' };
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const two = `${w} ${words[i + 1] ?? ''}`.toLowerCase();
    if (MILK_WORD[w.toUpperCase()]) spec.milk = MILK_WORD[w.toUpperCase()];
    else if (MODIFIERS[two]) { Object.assign(spec, MODIFIERS[two]); i++; }
    else if (MODIFIERS[w.toLowerCase()]) Object.assign(spec, MODIFIERS[w.toLowerCase()]);
    else throw new Error(`Unknown order word "${w}" in "${text}"`);
  }
  if (spec.layered && (spec.base !== 'teh' || spec.milk !== 'evap')) throw new Error(`Only "Teh C Special" is layered: "${text}"`);
  return Object.assign(spec, tapau);
}

// Inverse of parseOrder: spec -> real kopitiam lingo.
export function formatOrder(spec) {
  if (!spec?.base) return '';
  const bag = spec.tapau ? ' tapau' : '';
  if (MALT.includes(spec.base)) return `${NAME[spec.base]}${spec.iced && spec.scoop ? ' Godzilla' : spec.iced && spec.topping ? ' Dinosaur' : spec.iced ? ' peng' : ''}${bag}`;
  if (spec.layered) return `Teh C Special${bag}`;
  const name = NAME[spec.base];
  return [name, MILK_TO_WORD[spec.milk], spec.butter ? 'gu you' : '', spec.halia ? 'halia' : '', spec.limau ? 'limau' : '', spec.tarik ? 'tarik' : '',
    STRENGTH_TO_WORD[spec.strength ?? 'normal'], SUGAR_TO_WORD[spec.sugar], spec.iced ? 'peng' : '', spec.tapau ? 'tapau' : '']
    .filter(Boolean)
    .join(' ');
}

// An order in plain English (for tourists, and anyone learning): "Kopi O kosong" -> "black coffee, no sugar".
export function plainOrder(spec) {
  const away = spec.tapau ? ', to take away' : '';
  if (MALT.includes(spec.base)) {
    const name = spec.base === 'milo' ? 'Milo' : 'Horlicks';
    if (spec.scoop) return `iced ${name} with a mountain of powder and a scoop of ice cream${away}`;
    return (spec.topping ? `iced ${name} with a mountain of powder on top` : `${spec.iced ? 'iced ' : 'hot '}${name}`) + away;
  }
  if (spec.layered) return `three-layer tea: palm sugar, evaporated milk and tea, not stirred${away}`;
  const drink = { kopi: 'coffee', teh: 'tea', cham: 'coffee and tea mixed' }[spec.base];
  const black = spec.milk === 'none';
  const first = [spec.iced ? 'iced' : '', spec.strength === 'gao' ? 'strong' : spec.strength === 'poh' ? 'weak' : '', spec.tarik ? 'pulled' : '', black ? 'black' : '', drink].filter(Boolean).join(' ');
  const milk = spec.milk === 'evap' ? 'with evaporated milk' : black ? '' : 'with condensed milk';
  const sugar = { none: 'no sugar', less: 'less sweet', normal: '', more: 'extra sweet' }[spec.sugar];
  const extra = [spec.halia && 'with ginger', spec.limau && 'with calamansi lime', spec.butter && 'with a cube of butter'].filter(Boolean).join(', ');
  return [first, milk, extra, sugar].filter(Boolean).join(', ') + away;
}

const stripPunct = (w) => w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

const bare = (w) => stripPunct(w).replace(/['’]s$/, ''); // "Tan's" -> "tan"

// Split a dialogue line into words, tagging the ones that have a glossary entry.
// Names ("Uncle Tan") stay plain; two-word phrases ("siew dai", "fast fast") are matched before
// single words; clause-end words ("can") only count before punctuation or a particle.
export function tokenize(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const pair = words[i + 1] ? `${stripPunct(words[i])} ${stripPunct(words[i + 1])}` : null;
    // a listed name, or an honorific + a capitalised name ("Ah Huat", "Aunty May"), but not "Ah Girl"
    const honorific = /^(Ah|Uncle|Aunty|Auntie)$/.test(words[i]) && /^[A-Z][a-z]/.test(words[i + 1] ?? '') && !GLOSSARY[pair];
    if (words[i + 1] && (honorific || NAMES.includes(`${bare(words[i])} ${bare(words[i + 1])}`))) {
      out.push({ text: words[i], glossaryKey: null }, { text: words[i + 1], glossaryKey: null });
      i++;
      continue;
    }
    if (pair && GLOSSARY[pair]) {
      out.push({ text: `${words[i]} ${words[i + 1]}`, glossaryKey: pair });
      i++;
      continue;
    }
    const one = stripPunct(words[i]);
    let key = GLOSSARY[one] ? one : null;
    if (key && CLAUSE_END_ONLY.includes(key)) {
      const endsClause = /[?!.,…~]$/.test(words[i]) || !words[i + 1] || PARTICLES.includes(stripPunct(words[i + 1]));
      if (!endsClause) key = null;
    }
    out.push({ text: words[i], glossaryKey: key });
  }
  return out;
}
