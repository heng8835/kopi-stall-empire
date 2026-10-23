// Dialogue per character. Each has their own natural language mix (see GAME_DESIGN.md cast).
// {order} = the order in kopitiam lingo, {n} = cups in a group order,
// {owner} = how they address the player ("Ah Boy" for Jun, "Ah Girl" for Mei).
// Keep glossary words space-separated so they stay tappable (see systems/order.js tokenize).

export const LINES = {
  auntyLim: {
    order: [
      'Boss, {order} ah. 谢谢哦.',
      '{owner}, {order} one. 不要太甜 hor.',
      'Morning boss! Same same, {order} lah.',
    ],
    perfect: ['Wah, shiok! 刚刚好.', 'This one correct lah, {owner}.', '好喝! Tomorrow I come again.'],
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
      'Boss! {n} {order}! 快快快!',
      'Boss, {n} {order} can? We share share.',
    ],
    perfect: ['Wah, the Milo mountain! 好爽!', 'Shiok! Boss best!'],
    close: ['Ehh... where the dinosaur? Never mind lah.', '可以啦 can drink.'],
    oops: ['Boss, this one not Milo leh... paiseh we drink anyway.'],
    timeout: ['Bell ring already! Run run run!'],
  },
  // M2 — not in the spawn pool yet.
  ahGong: {
    order: ['老板, {order} 一杯, 不要太甜 ah.', 'Same as usual. {order}.', '{order}. Last time Uncle Tan make got soul one.'],
    perfect: ['嗯. 好.'],
    close: ['还可以.'],
    oops: ['Ah? 这个不是我的...算了.'],
    timeout: ['我去看报纸先.'],
  },
  // Random walk-ins (src/data/customers.js WALK_INS): short, generic, still local.
  officeWorker: {
    order: ['Boss, {order} please. Takeaway… no wait, here.', 'Morning! {order}, thanks boss.', '{order} one, boss. Need to wake up.'],
    perfect: ['Wah, power. Can survive the meeting now.', 'Nice, thanks boss!'],
    close: ['Okay lah, can drink.'],
    oops: ['Eh, not my order leh… never mind, I drink.'],
    timeout: ['Aiyo, boss call me already. Next time!'],
  },
  uncle: {
    order: ['老板, {order}.', 'Boss, {order} one. 慢慢来.', '{order} ah, boss.'],
    perfect: ['好! Shiok.', 'Wah, this one got standard.'],
    close: ['可以啦.'],
    oops: ['Ah? 不是这个… never mind lah.'],
    timeout: ['算了, I go other stall.'],
  },
  student: {
    order: ['Uh, hi boss, {order} can?', 'Boss, {order} please! 谢谢!', '{order}! Paiseh, got exam later.'],
    perfect: ['Shiok! Thank you boss!', 'Wah, so nice!'],
    close: ['Can lah, still nice.'],
    oops: ['Eh… this one not mine leh. Okay lah, I try.'],
    timeout: ['Aiyo, tuition start already! Bye boss!'],
  },
  auntie: {
    order: ['{owner}, {order} one ah. 谢谢.', 'Boss, {order}. 不要太甜 hor.', '{order} lah, {owner}. Hot day ah.'],
    perfect: ['刚刚好! Good {owner}.', 'Wah, shiok. I tell my friends.'],
    close: ['Can lah, can drink.'],
    oops: ['Aiyo, wrong one leh. Never mind, I drink.'],
    timeout: ['So long ah… I go market first.'],
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
