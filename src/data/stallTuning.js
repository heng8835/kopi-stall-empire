// All the numbers that decide how the stall feels. Tune these from playtest notes.

export const TUNING = {
  // Day pacing
  dayMs: 90_000, // 90 real seconds, 7am -> 7pm
  firstSpawnMs: 2000,
  lastSpawnBeforeEndMs: 12_000,
  spawnJitter: 0.35, // each arrival lands within +-35% of its even share of the day
  queueRetryMs: 3000, // queue full: try that arrival again this much later

  // Fame (名气, 0-100) decides how many arrivals a day brings (a group counts as one).
  fameStart: 10,
  fameDelta: { perfect: 0.25, close: 0.1, oops: 0, timeout: -1 },
  customersMin: 8,
  customersMax: 16,
  famePerExtraCustomer: 12, // 8 + fame/12, so fame 10 -> 8, 20 -> 9, 96 -> 16

  // Walking in from the street opening on the left, and the queue by the rope posts.
  queueMax: 3,
  walkSpeed: 70, // logical px per second
  walkFarScale: 0.62, // size at the door (far away) vs 1 at the counter
  patienceScale: 1.5, // customer.patience (seconds) x this; drinks take ~10 s to make now
  groupCupBonusMs: 8000, // patience given back after each cup of a group order

  // Pour speeds, in "units per second" while holding a tool over a cup.
  // 1.0 = a full cup of base / a normal amount of sugar or milk.
  pourPerSec: { kopi: 0.8, teh: 0.8, milo: 0.8, sugar: 1.0, condensed: 1.0, evap: 1.0 },

  stirWigglesNeeded: 6,
};

// Amount zones (shared by the meters and the grading).
export const ZONES = {
  sugar: { none: [0, 0.08], less: [0.3, 0.6], normal: [0.75, 1.1], tooMuch: 1.25 },
  milk: { none: [0, 0.08], normal: [0.75, 1.1], tooMuch: 1.25 },
  fill: { good: [0.85, 1.05], spill: 1.12 },
};

// Liquid colours (for drawing cups): base colours, lightened by milk.
export const LIQUID = {
  kopi: 0x3b2416,
  teh: 0x9a4a1e,
  milo: 0x5a3a28,
  cham: 0x6a3a1e, // kopi + teh mixed by accident
  condensed: 0xf3e2c0,
  evap: 0xf7efe2,
};
