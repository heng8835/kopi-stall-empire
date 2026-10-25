// All the numbers that decide how the stall feels. Tune these from playtest notes.

export const TUNING = {
  // Day pacing
  // Chill pacing (playtest 2026-10-23): ~3 real minutes, then closing time waits for the
  // customers already at the counter (closingGraceMs at most).
  dayMs: 120_000, // 2 real minutes, 7am -> 7pm
  closingGraceMs: 60_000,
  firstSpawnMs: 1800, // the first customer walks in as the shutter goes up
  lastSpawnBeforeEndMs: 18_000,
  spawnJitter: 0.35, // each arrival lands within +-35% of its even share of the day
  queueRetryMs: 3000, // queue full: try that arrival again this much later
  regularVariety: 0.25, // chance a regular orders something other than their usual

  // Fame (名气, 0-100) decides how many arrivals a day brings (a group counts as one).
  fameStart: 10,
  fameDelta: { perfect: 0.25, close: 0.1, oops: 0, timeout: -1 },
  // Few customers at first; upgrades make you faster before the crowd grows.
  customersMin: 8,
  customersMax: 15,
  famePerExtraCustomer: 15, // 8 + floor(fame/15): fame 10 -> 8, 30 -> 10, 60 -> 12, 100 -> 14

  // Walking in from the street opening on the left, and the queue by the rope posts.
  queueMax: 3,
  walkSpeed: 70, // logical px per second
  walkFarScale: 0.62, // size at the door (far away) vs 1 at the counter
  patienceScale: 2.2, // customer.patience (seconds) x this: chill, nobody rushes you
  groupCupBonusMs: 8000, // patience given back after each cup of a group order

  // Pour speeds, in "units per second" while holding a tool over a cup.
  // 1.0 = a full cup of base / a normal amount of sugar or milk.
  pourPerSec: { kopi: 0.9, teh: 0.9, milo: 0.9, horlicks: 0.9, sugar: 1.0, condensed: 1.0, evap: 1.0, water: 0.9 },

  stirWigglesNeeded: 6,
  autoStirMs: 1000, // dropping the spoon on a cup stirs it in this long
  doseAmount: 0.45, // Sugar Scoop / Milk Pump: one dose = one sweetness zone (1 siew dai, 2 normal, 3 ga dai)
  iceVolume: 0.25, // ice raises the level: peng = pour to the ¾ line, then ice
};

// Amount zones (shared by the meters and the grading).
// The pour bar draws exactly these zones and gradeCup judges exactly these, with no gaps,
// so "the marker is in NORMAL" always means NORMAL. Each zone is [from, to).
export const ZONES = {
  // Sweetness: sugar for O and C drinks; for Kopi / Teh the condensed milk IS the sweetener.
  sugar: { none: [0, 0.19], less: [0.19, 0.675], normal: [0.675, 1.1], more: [1.1, 1.45], tooMuch: 1.45 },
  milk: { none: [0, 0.415], normal: [0.415, 1.175], tooMuch: 1.175 },
  // FULL for hot drinks; peng = pour into the ¾ zone, the ice adds iceVolume (0.25) into FULL
  fill: { peng: [0.55, 0.8], good: [0.8, 1.08], spill: 1.12 },
  trace: 0.08, // less than this of milk / sugar counts as "none added"
  // Strength = hot water's share of the drink (before ice). Gao: no water. Normal: a splash is fine.
  // Poh: pot to about half, hot water to FULL.
  water: { gao: 0.08, poh: [0.28, 0.65] },
  pohPot: [0.35, 0.65], // where the pot should stop for a poh drink
};

// Liquid colours (for drawing cups): base colours, lightened by milk.
export const LIQUID = {
  kopi: 0x3b2416,
  teh: 0x9a4a1e,
  milo: 0x5a3a28,
  horlicks: 0xd6bc93,
  cham: 0x6a3a1e, // kopi + teh mixed by accident
  condensed: 0xf3e2c0,
  evap: 0xf7efe2,
};
