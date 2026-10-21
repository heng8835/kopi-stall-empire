// Day-1 tutorial: "Uncle Tan's notes". Each step brings one scripted customer whose order
// teaches the next hands-on action. highlight = tool ids (TOOL_IDS below) that pulse while
// the step is active.

// Tool ids the tutorial can highlight. StallScene registers its tools under these ids.
export const TOOL_IDS = ['kopi', 'teh', 'sugar', 'condensed', 'evap', 'milo', 'ice', 'powder', 'stir', 'rack', 'bin'];

export const TUTORIAL_STEPS = [
  {
    customer: 'auntyLim',
    order: 'Teh',
    highlight: ['rack', 'teh', 'condensed', 'sugar', 'stir'],
    note: {
      en: "Drag a cup to the tray. HOLD the teh pot over it till green, then condensed + sugar. Wiggle the spoon, then drag the cup to Aunty!",
      zh: '拖杯到托盘，按住茶壶倒到绿色，再加炼奶和糖。搅一搅，拖给阿姨！',
    },
  },
  {
    customer: 'officeGuy',
    order: 'Kopi O kosong',
    highlight: ['rack', 'kopi'],
    note: {
      en: "'O' = no milk, 'kosong' = no sugar. Just kopi — no stirring needed. Fast fast, he's rushing!",
      zh: 'O = 不加奶，kosong = 不加糖。只倒咖啡就好，不用搅。',
    },
  },
  {
    customer: 'auntyLim',
    order: 'Teh C siew dai peng',
    highlight: ['teh', 'evap', 'sugar', 'stir', 'ice'],
    note: {
      en: "'C' = evaporated milk. 'Siew dai' = less sugar: stop in the LIGHT green zone. 'Peng' = drop ice in.",
      zh: 'C = 淡奶。siew dai = 少甜（停在浅绿色）。peng = 加冰。',
    },
  },
];

export const TUTORIAL_TEXT = {
  title: "Uncle Tan's note",
  skip: 'Skip',
  almost: 'Almost! Check the gauge zones.',
  done: {
    en: 'Not bad leh! You can make up to 3 cups at once. Now the real crowd comes!',
    zh: '不错哦！最多可以同时做 3 杯。真正的人潮来了！',
  },
};
