// Dialogue per character. Each has their own natural language mix (see GAME_DESIGN.md cast).
// {order} = the order in kopitiam lingo, {n} = cups in a group order.
// Keep glossary words space-separated so they stay tappable (see systems/order.js tokenize).

export const LINES = {
  auntyLim: {
    order: [
      'Boss, {order} ah. 谢谢哦.',
      'Ah Boy, {order} one. 不要太甜 hor.',
      'Morning boss! Same same, {order} lah.',
    ],
    perfect: ['Wah, shiok! 刚刚好.', 'This one correct lah. Good boy.', '好喝! Tomorrow I come again.'],
    close: ['Hmm... can lah, can drink.', '差一点点 only. Never mind.'],
    oops: ['Eh? This one not my order leh... never mind, I drink.', 'Aiyo boss, you sleepy ah? 没关系.'],
    timeout: ['Aiyo, so slow. I go makan first, come back later.'],
  },
  officeGuy: {
    order: [
      'Boss, {order}, fast fast can?',
      '*on call* yes yes... Boss, {order}! ...no, not you Mark.',
      '{order}, boss! Got meeting in 5 min.',
    ],
    perfect: ['Power lah boss, thanks!', 'Perfect. Okay I run already!'],
    close: ['Okay okay, close enough. Got meeting.'],
    oops: ['Wait, this one... whatever, no time, can lah.', 'Alamak, wrong one... still drink lah.'],
    timeout: ['Aiyo, meeting start already! Next time boss!'],
  },
  schoolKids: {
    order: [
      'Uncle! {n} {order}! 快快快!',
      'Uncle, {n} {order} can? We share share.',
    ],
    perfect: ['Wah, the Milo mountain! 好爽!', 'Shiok! Uncle best!'],
    close: ['Ehh... where the dinosaur? Never mind lah.', '可以啦 can drink.'],
    oops: ['Uncle, this one not Milo leh... paiseh we drink anyway.'],
    timeout: ['Bell ring already! Run run run!'],
  },
  // M2 — not in the spawn pool yet.
  ahGong: {
    order: ['老板, {order} 一杯, 不要太甜 ah.', 'Same as usual. {order}.'],
    perfect: ['嗯. 好.'],
    close: ['还可以.'],
    oops: ['Ah? 这个不是我的...算了.'],
    timeout: ['我去看报纸先.'],
  },
  tourist: {
    order: ['Hi! Could I get a coffee, no milk, no sugar, please?'],
    perfect: ['Oh wow, that is strong! Love it, thank you!'],
    close: ['Interesting! Thank you!'],
    oops: ['Hmm, not quite what I expected, but fun!'],
    timeout: ['No worries, I will find another stall!'],
  },
};

export const UI = {
  tapHint: 'Tap orange words to learn the lingo',
  closing: 'Closing time! 收档啦~',
  dayDone: 'Day {day} done!',
  dayDoneZh: '今天辛苦了!',
  closeStall: 'Close stall',
};

export function pickLine(charId, kind, vars = {}, rng = Math.random) {
  const list = LINES[charId]?.[kind] ?? ['...'];
  const line = list[Math.floor(rng() * list.length)];
  return line.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
