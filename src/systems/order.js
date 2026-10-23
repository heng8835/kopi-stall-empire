import { DRINKS, MODIFIERS } from '../data/drinks.js';
import { GLOSSARY } from '../data/glossary.js';

// A drink spec is { base, milk, sugar, iced, topping }.
//   base:  'kopi' | 'teh' | 'milo'
//   milk:  'condensed' | 'evap' | 'none'   (null for milo)
//   sugar: 'normal' | 'less' | 'none' | 'more'   (null for milo)
//   For condensed-milk drinks (Kopi, Teh) the condensed milk is the sweetness; O and C use the sugar can.

const MILK_WORD = { O: 'none', C: 'evap' };
const MILK_TO_WORD = { none: 'O', evap: 'C', condensed: '' };
const SUGAR_TO_WORD = { none: 'kosong', less: 'siew dai', normal: '', more: 'ga dai' };

export function findDrink(spec) {
  if (spec.base === 'milo') return spec.topping ? DRINKS.miloDino : DRINKS.milo;
  return Object.values(DRINKS).find((d) => d.base === spec.base && d.milk === spec.milk) ?? null;
}

// "Teh C siew dai peng" -> { base: 'teh', milk: 'evap', sugar: 'less', iced: true, topping: null }
export function parseOrder(text) {
  const words = text.trim().split(/\s+/);
  const first = words.shift()?.toLowerCase();

  if (first === 'milo') {
    // "Milo", "Milo peng", "Milo Dinosaur" (iced, powder on top)
    const rest = words.join(' ').toLowerCase();
    if (rest === 'dinosaur') return { base: 'milo', milk: null, sugar: null, iced: true, topping: 'milo' };
    if (rest === '' || rest === 'peng') return { base: 'milo', milk: null, sugar: null, iced: rest === 'peng', topping: null };
    throw new Error(`Unknown Milo order: "${text}"`);
  }
  if (first !== 'kopi' && first !== 'teh') throw new Error(`Unknown drink: "${text}"`);

  const spec = { base: first, milk: 'condensed', sugar: 'normal', iced: false, topping: null };
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const two = `${w} ${words[i + 1] ?? ''}`.toLowerCase();
    if (MILK_WORD[w.toUpperCase()]) spec.milk = MILK_WORD[w.toUpperCase()];
    else if (MODIFIERS[two]) { Object.assign(spec, MODIFIERS[two]); i++; }
    else if (MODIFIERS[w.toLowerCase()]) Object.assign(spec, MODIFIERS[w.toLowerCase()]);
    else throw new Error(`Unknown order word "${w}" in "${text}"`);
  }
  return spec;
}

// Inverse of parseOrder: spec -> real kopitiam lingo.
export function formatOrder(spec) {
  if (!spec?.base) return '';
  if (spec.base === 'milo') return spec.iced && spec.topping ? 'Milo Dinosaur' : spec.iced ? 'Milo peng' : 'Milo';
  const name = spec.base === 'kopi' ? 'Kopi' : 'Teh';
  return [name, MILK_TO_WORD[spec.milk], SUGAR_TO_WORD[spec.sugar], spec.iced ? 'peng' : '']
    .filter(Boolean)
    .join(' ');
}

const stripPunct = (w) => w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

// Split a dialogue line into words, tagging the ones that have a glossary entry.
// Two-word phrases ("siew dai", "fast fast") are matched before single words.
export function tokenize(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const pair = words[i + 1] ? `${stripPunct(words[i])} ${stripPunct(words[i + 1])}` : null;
    if (pair && GLOSSARY[pair]) {
      out.push({ text: `${words[i]} ${words[i + 1]}`, glossaryKey: pair });
      i++;
      continue;
    }
    const one = stripPunct(words[i]);
    out.push({ text: words[i], glossaryKey: GLOSSARY[one] ? one : null });
  }
  return out;
}
