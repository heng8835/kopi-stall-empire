// v0.1 drink menu. Each drink is a base + milk combo; sugar / ice are modifiers on top.
// price is in cents. `liquid` is the cup colour used by the drink sprite.

export const DRINKS = {
  kopi: { id: 'kopi', name: 'Kopi', zh: '咖啡', base: 'kopi', milk: 'condensed', price: 140, liquid: '#a8764a' },
  kopiO: { id: 'kopiO', name: 'Kopi O', zh: '咖啡乌', base: 'kopi', milk: 'none', price: 120, liquid: '#4a2c1a' },
  kopiC: { id: 'kopiC', name: 'Kopi C', zh: '咖啡西', base: 'kopi', milk: 'evap', price: 150, liquid: '#8f5f3a' },
  teh: { id: 'teh', name: 'Teh', zh: '茶', base: 'teh', milk: 'condensed', price: 140, liquid: '#d49a62' },
  tehO: { id: 'tehO', name: 'Teh O', zh: '茶乌', base: 'teh', milk: 'none', price: 120, liquid: '#8a4e22' },
  tehC: { id: 'tehC', name: 'Teh C', zh: '茶西', base: 'teh', milk: 'evap', price: 150, liquid: '#c4874f' },
  cham: { id: 'cham', name: 'Cham', zh: '鸳鸯', base: 'cham', milk: 'condensed', price: 150, liquid: '#a06a3c' },
  chamO: { id: 'chamO', name: 'Cham O', zh: '鸳鸯乌', base: 'cham', milk: 'none', price: 130, liquid: '#4e2816' },
  chamC: { id: 'chamC', name: 'Cham C', zh: '鸳鸯西', base: 'cham', milk: 'evap', price: 160, liquid: '#b07c54' },
  horlicks: { id: 'horlicks', name: 'Horlicks', zh: '好立克', base: 'horlicks', milk: null, price: 160, liquid: '#d6bc93' },
  horlicksDino: { id: 'horlicksDino', name: 'Horlicks Dinosaur', zh: '好立克恐龙', base: 'horlicks', milk: null, price: 280, liquid: '#d6bc93', iced: true, topping: 'horlicks' },
  milo: { id: 'milo', name: 'Milo', zh: '美禄', base: 'milo', milk: null, price: 160, liquid: '#6b4a32' },
  miloDino: {
    id: 'miloDino', name: 'Milo Dinosaur', zh: '美禄恐龙', base: 'milo', milk: null, price: 280, liquid: '#6b4a32',
    iced: true, topping: 'milo',
  },
};

// Modifiers available in v0.1 (order-text word -> effect on the drink spec).
export const MODIFIERS = {
  kosong: { sugar: 'none' },
  'siew dai': { sugar: 'less' },
  'ga dai': { sugar: 'more' },
  peng: { iced: true },
};

export const ICED_SURCHARGE = 20; // cents, for peng (Milo Dinosaur already iced)
export const PERFECT_TIP = 30; // cents

// Teh O / other combos a player can physically make but which aren't on the v0.1 menu.
export const OFF_MENU_LIQUID = { teh: '#8a4e22', kopi: '#4a2c1a', milo: '#6b4a32' };
