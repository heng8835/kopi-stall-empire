// Friendship with every kind of customer (each regular, each kind of walk-in): good cups grow it,
// walk-outs dent it. Hearts (0-5) bring bigger tips and more patience, and change what people
// say when they've been waiting a while. Saved in the run (run.friends = { customerId: points }).
// Pure, no Phaser.

export const HEART_AT = [2, 5, 9, 14, 20]; // points for heart 1..5
export const GAIN = { perfect: 1, close: 0.4, oops: 0, timeout: -1 };
export const MAX_HEARTS = HEART_AT.length;

export const hearts = (points = 0) => HEART_AT.filter((p) => points >= p).length;

// Friendship after a serve (or a walk-out): never below 0.
export function befriend(friends, id, tier) {
  return { ...friends, [id]: Math.max(0, Math.round(((friends[id] ?? 0) + (GAIN[tier] ?? 0)) * 10) / 10) };
}

// What their hearts are worth: the perfect tip grows 25% a heart, a "close" cup gets a little tip
// from friends (5¢ a heart), and they wait 8% longer a heart.
export const friendTip = (h, tier, baseTip) => (tier === 'perfect' ? Math.round(baseTip * 0.25 * h) : tier === 'close' ? 5 * h : 0);
export const friendPatience = (h) => 1 + 0.08 * h;

export const FOND_AT = 3; // hearts from which they're happy to wait

// What they say when the wait gets long (patience under WAIT_LINE_AT left): fond friends are patient.
export const WAIT_LINE_AT = 0.45;
export const WAIT_LINES = {
  fond: ['Aiyo, this boss good one. I can wait a while lah.', 'No rush, boss. For your kopi, I wait.', 'Take your time ah, worth the wait one.'],
  meh: ['Hmm… this boss take quite long time arr…', 'Wah, still not ready ah?', 'Boss, my drink coming or not?'],
};
export const waitLine = (h, rand = Math.random) => {
  const list = h >= FOND_AT ? WAIT_LINES.fond : WAIT_LINES.meh;
  return list[Math.floor(rand() * list.length)];
};
