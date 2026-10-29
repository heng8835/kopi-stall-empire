// Daily twists (round 5: "too easy after Day 1, every day the same"): from Day 3 each day may have one,
// shown on the morning card with today's goal (systems/difficulty.js picks them). Gentle: they change
// what people order and when they come, never punish.
//   hot / iced     order weight multipliers for walk-ins (hot or iced drinks)
//   patience       customers' patience multiplier
//   icedTip        extra cents on every iced drink (perk float "Heatwave +20¢")
//   perfectFame    extra fame per perfect cup
//   rush           extra walk-ins: { from, to } minutes after opening (7am = 0, 12pm = 300), n of them
export const TWISTS = {
  rain: { id: 'rain', name: 'Rain day', zh: '下雨天', icon: '🌧️', text: 'Everyone wants something hot. Nobody rushes out into the rain: customers wait a little longer.', hot: 3, patience: 1.1 },
  heatwave: { id: 'heatwave', name: 'Heatwave', zh: '好热啊', icon: '☀️', text: 'Peng, peng, peng! Iced drinks earn +20¢ today.', iced: 3, icedTip: 20 },
  officeRush: { id: 'officeRush', name: 'Office lunch rush', zh: '午餐高峰', icon: '💼', text: 'The whole office upstairs comes down at 12. Four extra customers at lunch!', rush: { from: 300, to: 345, n: 4 } },
  inspector: { id: 'inspector', name: 'Hygiene inspector', zh: '卫生检查', icon: '📋', text: 'An inspector is walking the kopitiam. Every perfect cup earns a little extra fame.', perfectFame: 0.3 },
  pasarMalam: { id: 'pasarMalam', name: 'Pasar malam', zh: '夜市', icon: '🏮', text: 'The night market sets up outside. Three extra customers after 5pm.', rush: { from: 600, to: 680, n: 3 } },
};

// The week's rhythm, from Day 3 (null = a normal day).
export const TWIST_CYCLE = ['rain', 'officeRush', null, 'heatwave', 'inspector', 'pasarMalam', null];

// Today's small goal (systems/difficulty.js dailyGoal). kind decides what counts:
//   perfect  perfect cups you made · streak  best run of perfects · hot / iced  perfect hot / iced cups
//   noWalkout  nobody walked out (judged at closing)
export const GOAL_REWARD = { cents: 200, fame: 1 };
