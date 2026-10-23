// Day-1 tutorial: "Uncle Tan's notes". Each step brings one scripted customer whose order
// teaches the next hands-on action. highlight = tool ids (TOOL_IDS below) that pulse while
// the step is active.

// Tool ids the tutorial can highlight. StallScene registers its tools under these ids.
export const TOOL_IDS = ['kopi', 'teh', 'sugar', 'condensed', 'evap', 'milo', 'ice', 'powder', 'stir', 'rack', 'bin'];

export const TUTORIAL_STEPS = [
  {
    customer: 'auntyLim',
    order: 'Teh',
    highlight: ['teh', 'condensed', 'stir'],
    note: {
      en: 'TAP Aunty to take her order: a cup with her ticket appears. HOLD the teh pot to the ★, condensed milk to the ★ (it IS the sweetness), drop the spoon on the cup, drag to Aunty!',
      zh: '点阿姨接单，会出现带单子的杯子。按住茶壶到 ★，炼奶到 ★（炼奶就是甜度），把汤匙放到杯上搅一搅，拖给阿姨！',
    },
  },
  {
    customer: 'officeGuy',
    order: 'Kopi',
    highlight: ['kopi', 'condensed', 'stir'],
    note: {
      en: 'Kopi = coffee + condensed milk. Tap Marcus for his ticket, same steps with the kopi pot. Fast fast, he is rushing!',
      zh: 'Kopi = 咖啡 + 炼奶。步骤一样，这次用咖啡壶。他赶时间！',
    },
  },
  {
    customer: 'auntyLim',
    order: 'Kopi O',
    highlight: ['kopi', 'sugar', 'stir'],
    note: {
      en: "'O' = no milk. Use the sugar can instead, to NORMAL, then drop the spoon on it.",
      zh: 'O = 不加奶。改用糖罐，加到 NORMAL，再搅一搅。',
    },
  },
  // Info cards: no customer, tap Next.
  {
    info: true,
    note: {
      en: "Today's menu: Kopi, Teh, Kopi O, Teh O. Regulars will teach you more, one by one. Tap the book (top right) any time to see your recipes.",
      zh: '今天的菜单：Kopi、Teh、Kopi O、Teh O。熟客会一个个教你新的。随时点右上角的本子看配方。',
    },
  },
  {
    info: true,
    note: {
      en: '名气 Fame: perfect drinks raise it, and more fame brings more customers tomorrow. Walk-outs dip it a little. No stress lah.',
      zh: '名气：做得完美会上升，名气越高明天客人越多。客人走掉会掉一点点。不用紧张。',
    },
  },
  {
    info: true,
    note: {
      en: 'The clock runs 7am to 7pm: morning, lunch rush, teatime, closing. Every few days, something happens. Open the stall!',
      zh: '营业时间早上7点到晚上7点：早上、午餐高峰、下午茶、打烊。每隔几天就会发生些事。开档！',
    },
  },
];

export const TUTORIAL_TEXT = {
  title: "Uncle Tan's note",
  skip: 'Skip',
  next: 'Next ▸',
  almost: 'Almost! Check the gauge zones.',
  done: {
    en: 'Not bad leh! You can make up to 3 cups at once. Now the real crowd comes!',
    zh: '不错哦！最多可以同时做 3 杯。真正的人潮来了！',
  },
};
