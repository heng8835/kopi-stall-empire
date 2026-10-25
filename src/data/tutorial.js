// Day-1 tutorial: "Uncle Tan's notes". Each step brings one scripted customer (the first is Aunty
// Lim, who walked in during Episode 1). A ghost hand first makes their order step by step
// (systems/demo.js, Skip-able); then `after` says "your turn". If the demo is skipped, `note`
// explains the steps instead and the `highlight` tools (TOOL_IDS below) pulse.

// Tool ids the tutorial can highlight. StallScene registers its tools under these ids.
export const TOOL_IDS = ['kopi', 'teh', 'sugar', 'condensed', 'evap', 'milo', 'ice', 'powder', 'stir', 'rack', 'bin'];

export const TUTORIAL_STEPS = [
  {
    customer: 'auntyLim',
    order: 'Teh',
    highlight: ['rack', 'teh', 'condensed', 'stir'],
    after: { en: 'That is how Uncle Tan made teh. Your turn: drag the cup to Aunty Lim!', zh: '陈伯就是这样泡茶的。轮到你了：把杯子拖给林阿姨！' },
    note: {
      en: 'Tap the Cups rack for a cup. HOLD the teh pot to the ★, condensed milk to the ★ (it IS the sweetness), drop the spoon on the cup, drag to Aunty! Your thought bubble below says each step.',
      zh: '点杯架拿杯子。按住茶壶到 ★，炼奶到 ★（炼奶就是甜度），把汤匙放到杯上，拖给阿姨！下面的小泡泡会提示每一步。',
    },
  },
  {
    customer: 'officeGuy',
    order: 'Kopi',
    highlight: ['kopi', 'condensed', 'stir'],
    after: { en: 'Kopi = same steps, kopi pot. Drag it to Marcus, fast fast!', zh: 'Kopi 步骤一样，用咖啡壶。快快拖给 Marcus！' },
    note: {
      en: 'Kopi = coffee + condensed milk. Same steps with the kopi pot. Fast fast, he is rushing!',
      zh: 'Kopi = 咖啡 + 炼奶。步骤一样，这次用咖啡壶。他赶时间！',
    },
  },
  {
    customer: 'auntyLim',
    order: 'Kopi O',
    highlight: ['kopi', 'sugar', 'stir'],
    after: { en: "'O' = no milk, so the sugar can is the sweetness. Serve it, then you're on your own!", zh: 'O = 不加奶，所以用糖罐加甜。端给她吧，接下来靠你自己了！' },
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
