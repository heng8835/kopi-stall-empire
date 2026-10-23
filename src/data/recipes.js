// The recipe calendar: the menu starts small and opens up one order word at a time.
// A regular orders it "their way", a short card teaches it, then it's in the recipe book.
// Features are the building blocks of an order (see systems/menu.js featuresOf):
//   kopi, teh, milo        bases          O, C        no milk / evaporated milk
//   kosong, siewDai, gaDai sweetness      peng        iced          miloDino   Milo Dinosaur
//
// Lesson fields:
//   day        the day it's taught (and unlocked from then on)
//   features   what it unlocks
//   teacher    customer id who orders it that day; their order is `order`
//   fallback   customer to use while the teacher has no counter art yet
//   afterStory the card plays after this story episode instead (its guest is the teacher)
//   card       the "new recipe" card: title, line (the teacher's words), steps, zone (pour-bar zone to aim for)

export const STARTER = ['kopi', 'teh', 'O']; // Day 1: Kopi, Kopi O, Teh, Teh O, hot, normal sweetness

export const LESSONS = [
  {
    day: 2,
    features: ['miloDino'],
    afterStory: 'ep2-twenty-cents',
    teacher: 'schoolKids',
    order: 'Milo Dinosaur',
    card: {
      title: 'Milo Dinosaur',
      zh: '美禄恐龙',
      line: 'Darren: "Boss, four Milo Dinosaur! The mountain must be BIG!"',
      steps: ['Milo tin to the ¾ line', 'Drop in the ice: it tops up to FULL', 'Shake Milo powder on top', 'No stirring!'],
      zone: '¾ PENG',
    },
  },
  {
    day: 3,
    features: ['C', 'kosong'],
    teacher: 'officeGuy',
    order: 'Kopi C kosong',
    card: {
      title: 'C = evaporated milk · Kosong = no sugar',
      zh: '咖啡西 · 无糖',
      line: 'Marcus: "Boss, kopi C kosong, fast fast! Doctor says no sugar."',
      steps: ['Kopi pot to FULL', 'Evap milk to C · NORMAL', 'Kosong: skip the sugar', 'Stir, serve'],
      zone: 'C · NORMAL',
    },
  },
  {
    day: 4,
    features: ['siewDai'],
    teacher: 'auntyLim',
    order: 'Teh siew dai',
    card: {
      title: 'Siew dai = less sweet',
      zh: '少甜',
      line: 'Aunty Lim: "Teh siew dai ah. Doctor say I must cut sweet."',
      steps: ['Teh pot to FULL', 'Condensed milk only to SIEW DAI (it is the sweetness)', 'For O or C drinks: sugar to SIEW DAI', 'Stir, serve'],
      zone: 'SIEW DAI',
    },
  },
  {
    day: 5,
    features: ['peng'],
    teacher: 'makcik',
    fallback: 'officeGuy',
    order: 'Kopi peng',
    card: {
      title: 'Peng = iced',
      zh: '加冰',
      line: 'Makcik: "Panas lah today! Kopi peng, extra cold."',
      steps: ['Pot only to the ¾ PENG line', 'Milk and sweetness as usual, stir', 'Drop in the ice: it rises to FULL', 'Full + ice = spill!'],
      zone: '¾ PENG',
    },
  },
  {
    day: 6,
    features: ['milo'],
    teacher: 'schoolKids',
    order: 'Milo',
    card: {
      title: 'Milo · Milo peng',
      zh: '美禄',
      line: 'Darren: "Just Milo today. No dinosaur. I\'m on a diet."',
      steps: ['Milo tin to FULL (or ¾ + ice for peng)', 'No powder on top', 'Serve'],
      zone: 'FULL',
    },
  },
  {
    day: 8,
    features: ['gaDai'],
    teacher: 'taxiUncle',
    fallback: 'auntyLim',
    order: 'Kopi ga dai',
    card: {
      title: 'Ga dai = more sweet',
      zh: '加甜',
      line: 'Taxi Uncle: "Kopi ga dai! Long day driving, need energy."',
      steps: ['Kopi pot to FULL', 'Condensed milk past NORMAL to GA DAI', 'Not too much: the red zone is too sweet', 'Stir, serve'],
      zone: 'GA DAI',
    },
  },
];

// What each feature means, for the recipe book.
export const BOOK = {
  kopi: { name: 'Kopi', zh: '咖啡', text: 'Coffee + condensed milk. The condensed milk is the sweetness.' },
  teh: { name: 'Teh', zh: '茶', text: 'Tea + condensed milk. Same as kopi, teh pot.' },
  O: { name: 'O', zh: '乌', text: 'No milk. Sweeten with the sugar can instead.' },
  C: { name: 'C', zh: '西', text: 'Evaporated milk (to C · NORMAL) + sugar can for sweetness.' },
  kosong: { name: 'Kosong', zh: '无糖', text: 'No sugar at all (O and C drinks).' },
  siewDai: { name: 'Siew dai', zh: '少甜', text: 'Less sweet: stop in the SIEW DAI zone.' },
  gaDai: { name: 'Ga dai', zh: '加甜', text: 'More sweet: the GA DAI zone, before the red.' },
  peng: { name: 'Peng', zh: '加冰', text: 'Iced: pour to the ¾ line, then ice tops it up.' },
  milo: { name: 'Milo', zh: '美禄', text: 'Milo tin to FULL. Peng: ¾ + ice.' },
  miloDino: { name: 'Milo Dinosaur', zh: '美禄恐龙', text: 'Iced Milo with a mountain of powder on top. No stirring.' },
};
