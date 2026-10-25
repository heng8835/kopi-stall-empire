// The opening cutscene: plays once, the first time a new month starts (scenes/OpeningScene.js).
// Panels play in order; each line is one tap. Plan + art: docs/specs/opening-and-art-plan.md §1.
//   bg      background key (public/bg/<key>.webp, loaded by the scene)
//   lines   narration, one per tap. {name} = Jun / Mei, {owner} = Ah Boy / Ah Girl
//   phone   optional chat message on a phone drawn in code { from, text }
//   owner   true = the player's owner walks in
//   title   optional big caption with the last line
export const OPENING = [
  {
    bg: 'openingDawn',
    lines: ['Every estate has one.', 'A corner kopitiam. A kopi stall. And an uncle who knows your order before you say it.'],
  },
  {
    bg: 'openingFlashback',
    lines: ['{name} grew up at this back table.', 'Homework, kaya toast, and Uncle Tan\'s teh. "Study hard, {owner}. Then come back and drink kopi."'],
  },
  {
    bg: 'openingOffice',
    lines: ['Years later: a corporate internship.', 'The office kopi tasted like sadness.'],
  },
  {
    bg: 'openingOffice',
    phone: { from: 'Uncle Tan', text: '{owner}, I retire liao. Stall is yours. Come tomorrow 6am. Oyen hungry.' },
    lines: ['Then, one night, a message.'],
  },
  {
    bg: 'openingSunrise',
    owner: true,
    title: 'Day 1 · 开档',
    lines: ['Next morning. 5:58am.', '{name} rolls up the shutter.'],
  },
];
