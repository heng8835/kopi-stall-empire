// Day-1 tutorial. No note cards: the customers teach you in their own chat bubbles.
// Each step brings one scripted customer (the first is Aunty Lim, who walked in during Episode 1).
//   demo: true   a ghost hand makes their order while they say each step (systems/demo.js
//                `teach` lines); then they ask for the cup. Skip-able.
//   say          what they say instead when there's no demo (you make it, the thought bubble helps)
//   highlight    tool ids (TOOL_IDS below) that pulse while it's your turn
// Info steps are short lines in your own thought bubble, one after another.

// Tool ids the tutorial can highlight. StallScene registers its tools under these ids.
export const TOOL_IDS = ['kopi', 'teh', 'sugar', 'condensed', 'evap', 'milo', 'ice', 'powder', 'stir', 'rack', 'bin'];

export const TUTORIAL_STEPS = [
  { customer: 'auntyLim', order: 'Teh', demo: true, highlight: ['rack', 'teh', 'condensed', 'stir'] },
  { customer: 'officeGuy', order: 'Kopi', say: 'Boss, same as teh, but the kopi pot! Fast fast ah!', highlight: ['rack', 'kopi', 'condensed', 'stir'] },
  { customer: 'auntyLim', order: 'Kopi O', demo: true, highlight: ['rack', 'kopi', 'sugar', 'stir'] },
  { info: "Today's menu: Kopi, Teh, Kopi O, Teh O. My recipes are in the book, top right." },
  { info: '名气 Fame: perfect cups bring more customers tomorrow. No stress lah.' },
  { info: '7am to 7pm. Every few days, something happens… OK, open the stall!' },
];

export const TUTORIAL_TEXT = {
  skip: 'Skip tutorial',
  almost: 'Almost! Check the gauge zones next time.',
  done: 'Not bad leh! Up to 3 cups at once. Here comes the crowd!',
  infoMs: 3800, // each info line stays this long
};
