// Uncle Tan's advice on the day-end card, keyed by the most common slip (reasons from gradeCup).
// First match wins; `match` is a substring of the reason text.
export const TIPS = [
  { match: 'forgot to stir', en: 'Drop the spoon on the cup after milk or sugar! Unstirred kopi is just kopi with a milk cloud.', zh: '加了奶或糖要搅一搅！' },
  { match: 'too sweet', en: 'Watch the bar: stop in your ★ zone. Condensed milk IS the sweetness for Kopi and Teh.', zh: '看着条子，停在 ★ 区。炼奶就是甜度。' },
  { match: 'not sweet enough', en: 'A bit more sugar or condensed milk: hold it till the ★ zone.', zh: '再多一点糖或炼奶，按到 ★ 区。' },
  { match: 'spilled', en: 'Peng: pour only to the ¾ line, the ice tops it up to full.', zh: '加冰的：倒到 ¾ 线就好，冰块会补满。' },
  { match: 'forgot the ice', en: '"Peng" means iced. Drop the ice in last.', zh: 'peng = 加冰，最后放冰。' },
  { match: 'not quite full', en: 'Hold the pot a little longer, till the bar says FULL.', zh: '壶多按一会儿，到 FULL。' },
  { match: 'half empty', en: 'Hold the pot a little longer, till the bar says FULL.', zh: '壶多按一会儿，到 FULL。' },
  { match: 'should be no milk', en: '"O" means no milk at all: sugar can only.', zh: 'O = 不加奶，只加糖。' },
  { match: 'instead of condensed', en: 'Plain Kopi / Teh uses condensed milk (the red can). "C" is the blue evap can.', zh: '普通的用炼奶（红罐），C 才用淡奶（蓝罐）。' },
  { match: 'instead of evaporated', en: '"C" means evaporated milk: the blue can.', zh: 'C = 淡奶（蓝罐）。' },
  { match: 'forgot the milk', en: 'Kopi and Teh need milk: condensed for plain, evap for C.', zh: '记得加奶。' },
  { match: 'mixed', en: 'Kopi pot and teh pot look alike. Check the label before you pour!', zh: '咖啡壶和茶壶很像，倒之前看标签！' },
  { match: 'powder', en: 'Milo Dinosaur needs its mountain of powder on top.', zh: '美禄恐龙要堆满粉！' },
];

export const DEFAULT_TIP = { en: 'Shiok! Steady hands today. Tomorrow more customers will come.', zh: '不错！明天会有更多客人。' };
