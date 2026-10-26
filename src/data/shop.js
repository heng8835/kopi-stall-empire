// Uncle Tan's Supplier Catalogue: the night shop (scenes/ShopScene.js, rules in systems/shop.js).
//   aisle   machine | tool | comfort | decor
//   price   cents; 0 = a story gift (not for sale)
//   tier    fame needed before it can be bought
//   effect  what it does (read by systems/shop.js perks())
//   unlocks recipe features a machine adds (systems/menu.js)
//   soon    shown in the catalogue but not buyable yet (none right now)
//   icon    placeholder until the catalogue art arrives (docs/art/ASSET_LIST.md 5.4-5.7)

export const AISLES = [
  { id: 'machine', name: 'Machines', zh: '机器', blurb: 'new drinks' },
  { id: 'tool', name: 'Tools', zh: '工具', blurb: 'pour faster, pour truer' },
  { id: 'comfort', name: 'Comfort', zh: '舒适', blurb: 'patient, generous customers' },
  { id: 'decor', name: 'Decor', zh: '装饰', blurb: 'fame every day' },
];

export const SHOP = [
  // machines
  { id: 'twinSock', aisle: 'machine', name: 'Twin Sock Stand', zh: '双咖啡袋架', price: 5500, tier: 25, icon: '☕', text: 'Brew kopi and teh side by side. Pour both into one cup: Cham!', effect: {}, unlocks: ['cham'] },
  { id: 'horlicksShelf', aisle: 'machine', name: 'Horlicks Shelf', zh: '好立克架', price: 3500, tier: 0, icon: '🥛', text: 'A tin of Horlicks on the rail. Horlicks, Horlicks peng, Horlicks Dinosaur.', effect: {}, unlocks: ['horlicks', 'horlicksDino'] },
  { id: 'iceMachine', aisle: 'machine', name: 'Ice Machine', zh: '制冰机', price: 6000, tier: 25, icon: '🧊', text: 'Crystal-clear ice. Iced drinks earn +20¢.', effect: { icedTip: 20 } },
  { id: 'kettle', aisle: 'machine', name: 'Big Brass Kettle', zh: '大铜壶', price: 4500, tier: 0, icon: '🫖', text: 'Hot water on the rail. Kopi / teh poh (weak) and gao (strong): new orders the regulars love.', effect: {}, unlocks: ['gao', 'poh'] },
  { id: 'tarikMugs', aisle: 'machine', name: 'Tarik Mugs', zh: '拉茶杯', price: 4000, tier: 25, icon: '🍵', text: 'Pull teh between two mugs from up high until frothy: Teh tarik. The pakciks will love you.', effect: {}, unlocks: ['tarik'] },
  { id: 'haliaPot', aisle: 'machine', name: 'Halia Pot', zh: '姜茶壶', price: 3500, tier: 25, icon: '🫚', text: 'A pot of ginger brew on the counter. Teh halia, and Teh halia tarik for the pakciks.', effect: {}, unlocks: ['halia'] },
  { id: 'limau', aisle: 'machine', name: 'Limau Squeezer', zh: '酸柑榨汁器', price: 3000, tier: 0, icon: '🍋', text: 'Calamansi and a squeezer on the counter: Teh O limau, hot or peng.', effect: {}, unlocks: ['limau'] },
  { id: 'freezer', aisle: 'machine', name: 'Mini Freezer', zh: '小冰柜', price: 7000, tier: 50, icon: '🍨', text: 'Vanilla ice cream. A scoop on a Milo Dinosaur makes a Milo Godzilla!', effect: {}, unlocks: ['miloGodzilla'] },
  { id: 'gulaMelaka', aisle: 'machine', name: 'Gula Melaka Station', zh: '椰糖站', price: 5000, tier: 50, icon: '🍯', text: 'Palm sugar syrup for the three-layer Teh C Special. Pour it first, never stir!', effect: {}, unlocks: ['tehCSpecial'] },
  { id: 'butter', aisle: 'machine', name: 'Butter Dish', zh: '牛油碟', price: 2000, tier: 25, icon: '🧈', text: 'A cube of butter in the kopi: Kopi gu you, Hainanese style.', effect: {}, unlocks: ['guYou'] },
  { id: 'tapau', aisle: 'machine', name: 'Tapau Station', zh: '打包站', price: 4000, tier: 50, icon: '🛍️', text: 'Takeaway bags with a red string. Tapau orders, and delivery riders with bulk orders.', effect: {}, unlocks: ['tapau'] },
  { id: 'fourthPlate', aisle: 'machine', name: 'Fourth Tray Plate', zh: '第四个杯位', price: 6500, tier: 50, icon: '🍽️', text: 'Make 4 cups at once.', effect: { plates: 4 } },
  // tools
  { id: 'longSpout', aisle: 'tool', name: 'Long-Spout Pot', zh: '长嘴壶', price: 2500, tier: 0, icon: '🫗', text: 'Kopi, teh and malt drinks pour 25% faster.', effect: { pourMult: 1.25 } },
  { id: 'sugarScoop', aisle: 'tool', name: 'Sugar Scoop', zh: '糖匙', price: 1500, tier: 0, icon: '🥄', text: 'Drop the scoop on a cup, then tap to stop the dial: siew dai, normal or ga dai in one go.', effect: { sugarScoop: true } },
  { id: 'milkPump', aisle: 'tool', name: 'Milk Pump', zh: '炼奶泵', price: 2000, tier: 25, icon: '🥫', text: 'Drop condensed or evap milk on a cup, then tap to stop the dial on the zone you want.', effect: { milkPump: true } },
  { id: 'brassSpoon', aisle: 'tool', name: 'Brass Spoon', zh: '铜汤匙', price: 1200, tier: 0, icon: '🥄', text: 'Stirs in 0.6 seconds instead of 1.', effect: { stirMs: 600 } },
  { id: 'markedGlass', aisle: 'tool', name: 'Marked Glasses', zh: '刻度杯', price: 1000, tier: 0, icon: '🥃', text: 'Every glass shows its ¾ and FULL lines.', effect: { marked: true } },
  { id: 'cupRack', aisle: 'tool', name: 'Cup Rack Pro', zh: '自动杯架', price: 1800, tier: 25, icon: '🗄️', text: 'After you serve, a fresh cup drops onto that plate.', effect: { autoCup: true } },
  { id: 'towel', aisle: 'tool', name: "Uncle Tan's Towel", zh: '陈伯毛巾', price: 0, tier: 0, icon: '🧣', text: 'A gift on Day 21. The first spill each day is forgiven.', effect: { towel: true }, gift: true },
  // comfort
  { id: 'fan', aisle: 'comfort', name: 'Standing Fan', zh: '风扇', price: 3000, tier: 0, icon: '🌀', text: 'Customers wait 15% longer.', effect: { patienceMult: 1.15 } },
  { id: 'radio', aisle: 'comfort', name: 'Radio', zh: '收音机', price: 2500, tier: 0, icon: '📻', text: 'Old songs all day. +0.5 fame a day.', effect: { famePerDay: 0.5 } },
  { id: 'cupWarmer', aisle: 'comfort', name: 'Cup Warmer', zh: '暖杯器', price: 3500, tier: 25, icon: '♨️', text: 'Hot drinks earn +10¢.', effect: { hotTip: 10 } },
  { id: 'tipJar', aisle: 'comfort', name: 'Bigger Tip Jar', zh: '小费罐', price: 1200, tier: 0, icon: '🫙', text: 'Tips +20%.', effect: { tipMult: 1.2 } },
  { id: 'bell', aisle: 'comfort', name: 'Queue Bell', zh: '铃铛', price: 1000, tier: 0, icon: '🔔', text: 'One more spot in the queue.', effect: { queueBonus: 1 } },
  { id: 'catBed', aisle: 'comfort', name: "Oyen's Cat Bed", zh: '猫床', price: 1500, tier: 0, icon: '🐈', text: 'A happy Oyen is good for business. +1 fame a day.', effect: { famePerDay: 1 } },
  { id: 'tissues', aisle: 'comfort', name: 'Tissue Packets', zh: '纸巾包', price: 800, tier: 0, icon: '🧻', text: 'Free chope packets for regulars. +0.3 fame a day.', effect: { famePerDay: 0.3 } },
  { id: 'secondTable', aisle: 'comfort', name: 'Second Table', zh: '第二张桌子', price: 6000, tier: 50, icon: '🪑', text: 'A second sit-down guest: the uncles and aunties who like to sit.', effect: { tables: 2 } },
  // decor
  { id: 'signboard', aisle: 'decor', name: 'Hand-Painted Signboard', zh: '手绘招牌', price: 5000, tier: 25, icon: '🪧', text: 'Your stall name in red letters. +1 fame a day.', effect: { famePerDay: 1 } },
  { id: 'menuBoard', aisle: 'decor', name: 'Wall Menu Board', zh: '菜单板', price: 2000, tier: 0, icon: '📋', text: "A board on the wall listing today's drinks.", effect: { menuBoard: true } },
  { id: 'plants', aisle: 'decor', name: 'Potted Plants', zh: '盆栽', price: 1200, tier: 0, icon: '🪴', text: '+0.3 fame a day.', effect: { famePerDay: 0.3 } },
  { id: 'lanterns', aisle: 'decor', name: 'Red Lanterns', zh: '红灯笼', price: 2500, tier: 25, icon: '🏮', text: '+0.5 fame a day.', effect: { famePerDay: 0.5 } },
  { id: 'neon', aisle: 'decor', name: 'Neon "KOPI" Sign', zh: '霓虹灯招牌', price: 4500, tier: 75, icon: '💡', text: '+1 fame a day, and one more customer every day.', effect: { famePerDay: 1, extraCustomers: 1 } },
  { id: 'fairyLights', aisle: 'decor', name: 'Fairy Lights', zh: '彩灯', price: 1800, tier: 50, icon: '✨', text: '+0.4 fame a day.', effect: { famePerDay: 0.4 } },
];

// The night shop opens after this day's summary.
export const SHOP_FROM_DAY = 3;
// Story gifts: given at the end of this day (no purchase).
export const GIFTS = { 21: 'towel' };
