// Day-1 tutorial: "Uncle Tan's notes". Each step brings one scripted customer whose order
// teaches one more piece of the kopi grammar. highlight = button ids (BUTTON_IDS below)
// that pulse while the step is active.

// Button ids the tutorial can highlight. DayScene registers its buttons under these ids.
export const BUTTON_IDS = ['kopi', 'teh', 'milo', 'milk', 'c', 'o', 'sugar', 'siewdai', 'kosong', 'peng', 'powder', 'serve', 'throw'];

export const TUTORIAL_STEPS = [
  {
    customer: 'auntyLim',
    order: 'Teh',
    highlight: ['teh', 'serve'],
    note: {
      en: "'Teh' = tea, already with condensed milk + sugar. Tap Teh, wait for the brew, then SERVE!",
      zh: 'Teh = 茶，默认加炼奶和糖。点 Teh，等泡好，再按 SERVE！',
    },
  },
  {
    customer: 'ahGong',
    order: 'Kopi O',
    highlight: ['kopi', 'o', 'serve'],
    note: {
      en: "Ah Gong sits at his table. 'O' = no milk (still sweet). Kopi → O → SERVE.",
      zh: 'O = 不加奶（有糖）。Kopi → O → SERVE。',
    },
  },
  {
    customer: 'officeGuy',
    order: 'Kopi C kosong',
    highlight: ['kopi', 'c', 'kosong', 'serve'],
    note: {
      en: "'C' = evaporated milk, 'kosong' = no sugar. Kopi → C → Kosong → SERVE. He's rushing!",
      zh: 'C = 淡奶，kosong = 不加糖。',
    },
  },
  {
    customer: 'auntyLim',
    order: 'Teh C siew dai peng',
    highlight: ['teh', 'c', 'siewdai', 'peng', 'serve'],
    note: {
      en: "'Siew dai' = less sugar, 'peng' = iced. Teh → C → Siew dai → Peng → SERVE.",
      zh: 'siew dai = 少甜，peng = 加冰。',
    },
  },
];

export const TUTORIAL_TEXT = {
  title: "Uncle Tan's note",
  skip: 'Skip',
  almost: 'Almost! Check the orange words.',
  done: {
    en: 'Not bad leh! Tap orange words anytime to learn more. Now the real crowd comes!',
    zh: '不错哦！随时点橙色的字学更多。真正的人潮来了！',
  },
};
