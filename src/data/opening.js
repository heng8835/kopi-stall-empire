// The opening cutscene, the month's prologue: plays once, the first time a new month starts
// (scenes/OpeningScene.js). Panels play in order; each line is one tap.
// Plan + art: docs/specs/opening-and-art-plan.md §1. Story: docs/story/month-1.md (Prologue).
//   bg      background key (public/bg/<key>.webp, loaded by the scene)
//   title   optional episode-style title card before the panel { ep, zh, en }
//   lines   one per tap: a string is narration; { who, text } a spoken line (who: 'kid' = little
//           Jun / Mei, 'uncleTan' = heard, never seen: he must stay a secret until Day 28);
//           { chat: 'them' | 'me', text } a message on the phone
//   phone   true = a phone is held up in this panel (chat lines appear on it)
//   owner   true = the player's owner walks in
//   day     optional big caption with the last line
// Line text: {name} = Jun / Mei, {owner} = Ah Boy / Ah Girl.
export const OPENING = [
  {
    bg: 'openingDawn',
    title: { ep: '序章 · Prologue', zh: '一个月的约定', en: 'One Month to Try' },
    lines: ['Every estate has one.', 'A corner kopitiam. A kopi stall. And an uncle who knows your order before you say it.'],
  },
  {
    bg: 'openingFlashback',
    lines: [
      'Twenty years ago. {name} grew up at this back table: homework, kaya toast, and Uncle Tan\'s teh.',
      { who: 'kid', text: 'Uncle Tan! One day I also want my own kopi stall. Like you!' },
      { who: 'uncleTan', text: 'Wah, big dream. Can lah. But study hard first, {owner}.' },
      { who: 'kid', text: 'Promise! Then I come back and make kopi for you.' },
    ],
  },
  {
    bg: 'openingOffice',
    lines: ['Years later: a corporate internship.', 'The office kopi tasted like sadness. The dream was still there, somewhere under the spreadsheets.'],
  },
  {
    bg: 'openingOffice',
    phone: true,
    lines: [
      'Then, one night, a message.',
      { chat: 'them', text: '{owner}, Uncle retire liao. Knee pain, cannot stand whole day already.' },
      { chat: 'them', text: 'Last time you say want your own stall. Still want or not?' },
      { chat: 'them', text: 'Come try one month lah. 30 days. After that you decide.' },
      { chat: 'me', text: 'Uncle… OK! I try!' },
      { chat: 'them', text: 'Good. Tomorrow 6am. Oyen hungry.' },
    ],
  },
  {
    bg: 'openingSunrise',
    owner: true,
    day: 'Day 1 · 开档',
    lines: ['Next morning. 5:58am.', '{name} rolls up the shutter. One month. Thirty days.'],
  },
];
