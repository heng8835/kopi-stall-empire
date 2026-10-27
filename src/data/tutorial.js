// Day-1 tutorial: Aunty Lim (who walked in during Episode 1) tells you her teh in one line and you make
// it yourself straight away: the tools to use pulse and your thought bubble says each next step
// (playtest: the watch-first demo kept new players from their first pour for too long). You serve it, she says you're
// ready, then the starter menu card shows the four drinks as tools: pot + milk/sugar + spoon = drink.
// OK opens the stall and Day 1 begins.
//   customer, order   who comes and what they order       demo   the ghost hand makes it first
//   say               what they say first (no demo)
//   highlight         tool ids (TOOL_IDS) that pulse if you make it yourself (demo skipped)
//   ready             what they say after you serve them
//   story: 'start'    play today's start episode here (Day 1: after the first cup, not before it)
//   card: 'starter'   the starter menu card (STARTER_MENU below)

// Tool ids the tutorial can highlight. StallScene registers its tools under these ids.
export const TOOL_IDS = ['kopi', 'teh', 'sugar', 'condensed', 'evap', 'milo', 'ice', 'powder', 'stir', 'rack', 'bin'];

export const TUTORIAL_STEPS = [
  { customer: 'auntyLim', order: 'Teh', say: 'First day ah? One teh: teh pot to FULL, condensed to NORMAL, stir. You try!', highlight: ['rack', 'teh', 'condensed', 'stir'] },
  { story: 'start' }, // Episode 1 (her intro, the note on the tin) right after your first cup
  { card: 'starter' },
];

// The starter menu card: each drink as its tools (HD sprite keys) and the drink it makes.
//   tint: the colour of the drink in the glass
export const STARTER_MENU = [
  { name: 'Kopi', tools: ['toolKopiPot', 'toolCondensed', 'toolStir'], tint: 0x9c6a48 },
  { name: 'Teh', tools: ['toolTehPot', 'toolCondensed', 'toolStir'], tint: 0xd09a62 },
  { name: 'Kopi O', tools: ['toolKopiPot', 'toolSugar', 'toolStir'], tint: 0x5a3622 },
  { name: 'Teh O', tools: ['toolTehPot', 'toolSugar', 'toolStir'], tint: 0xa8622e },
];

export const TUTORIAL_TEXT = {
  skip: 'Skip tutorial',
  almost: 'Almost! Check the gauge zones next time.',
  menuTitle: "Today's menu 今天的菜单",
  menuNote: 'Condensed milk IS the sweetness. O = no milk: sweeten it with the sugar jar instead. The book (top right) keeps these recipes.',
  open: 'Got it, open! 开档 ▸',
  done: '名气 Fame: perfect cups bring more customers tomorrow. Jia you!',
};
