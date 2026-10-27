// Dialogue per character. Each has their own natural language mix (see GAME_DESIGN.md cast).
// {order} = the order in kopitiam lingo, {n} = cups in a group order,
// {owner} = how they address the player ("Ah Boy" for Jun, "Ah Girl" for Mei),
// {greet} = Morning / Afternoon / Evening by the stall's clock (greetAt).
// Keep glossary words space-separated so they stay tappable (see systems/order.js tokenize).

import { TUNING } from '../data/stallTuning.js';

export const LINES = {
  auntyLim: {
    order: [
      'Boss, {order} ah. 谢谢哦.',
      '{owner}, {order} one. Make nice nice hor.',
      '{greet} boss! Same same, {order} lah.',
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
  ahGong: {
    order: ['老板, {order} 一杯. 慢慢来.', 'Same as usual. {order}.', '{order}. Last time Uncle Tan make got soul one.'],
    perfect: ['嗯. 好. (Mm. Good.)'],
    close: ['还可以.'],
    oops: ['Ah? 这个不是我的...算了.'],
    timeout: ['我去看报纸先.'],
  },
  // Random walk-ins (src/data/customers.js WALK_INS): short, generic, still local.
  officeWorker: {
    order: ['Boss, {order} please. Takeaway… no wait, here.', '{greet}! {order}, thanks boss.', '{order} one, boss. Need to wake up.'],
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
    order: ['{owner}, {order} one ah. 谢谢.', 'Boss, {order}. 谢谢 hor.', '{order} lah, {owner}. Hot day ah.'],
    perfect: ['刚刚好! Good {owner}.', 'Wah, shiok. I tell my friends.'],
    close: ['Can lah, can drink.'],
    oops: ['Aiyo, wrong one leh. Never mind, I drink.'],
    timeout: ['So long ah… I go market first.'],
  },
  nsf: {
    order: ['Boss! Book out liao, {order} please!', 'Wah finally civilian food. {order}, boss!', '{order} one, boss. Treat myself.'],
    perfect: ['Shiok! Worth the whole week.', 'Steady lah boss!'],
    close: ['Can lah, better than cookhouse.'],
    oops: ['Eh… not my order, but still better than cookhouse.'],
    timeout: ['Aiyo, must catch the bus back to camp!'],
  },
  pakcik: {
    order: ['Boss, {order} satu. Terima kasih.', 'Assalamualaikum boss. {order} ah.', '{order}, boss. Terima kasih ah.'],
    perfect: ['Sedap! Terima kasih.', 'Wah, shiok. Good boss.'],
    close: ['Okay lah, can.'],
    oops: ['Eh, this one not mine… never mind lah.'],
    timeout: ['Takpe, I come back later.'],
  },
  ahMa: {
    order: ['{owner} ah, {order} 一杯. 慢慢来.', 'Ah Ma want {order}. No rush ah.', '{order} ah, {owner}. 你很乖.'],
    perfect: ['好喝! 乖孙.', 'Wah, like last time. 好!'],
    close: ['可以啦, can drink.'],
    oops: ['Ah? 不是这个… never mind, Ah Ma drink.'],
    timeout: ['Ah Ma go home sleep first.'],
  },
  mum: {
    order: ['{order} please, boss. Shh, baby sleeping.', 'Boss, {order}. Quick quick before he wake up.', '{order}, thank you ah.'],
    perfect: ['Wah, so nice. First break today.', 'Thank you boss, saved my day.'],
    close: ['Okay, can lah.'],
    oops: ['Not mine leh… never mind, I too tired to care.'],
    timeout: ['Aiyo, baby wake up already. Next time!'],
  },
  worker: {
    order: ['Boss, {order}! Hot day ah.', '{order} one, boss. Got two more for my friends later.', 'Boss, {order}, extra cold can?'],
    perfect: ['Wah, shiok! Recharge already.', 'Power lah boss.'],
    close: ['Can lah, still cold.'],
    oops: ['Eh, wrong one… never mind, I drink.'],
    timeout: ['Aiyo, lorry come already. Bye boss!'],
  },
  rider: {
    order: ['Boss, {order}, fast fast! Got order waiting.', '{order} one, boss. Quick ah, I chiong.', 'Boss {order}! Rating dropping already.'],
    perfect: ['Steady! Five stars for you.', 'Fast and shiok. Thanks boss!'],
    close: ['Okay okay, no time, go!'],
    oops: ['Wrong one… no time, I drink on the road.'],
    timeout: ['Aiyo, customer call me. Next time!'],
  },
  riderBulk: {
    order: ['Boss, {n} {order}! Office order, all tapau.', '{n} {order} ah boss, bag every cup. Rider life, chiong!', 'Boss! {n} cups, {order}. The app says ten minutes…'],
    perfect: ['All bagged, steady! Five stars for you.', 'Power, boss! The office will love it.'],
    close: ['Okay okay, close enough, I chiong!'],
    oops: ["Aiyo, wrong one… hope they don't notice."],
    timeout: ['Alamak, order cancelled! Next time, boss.'],
  },
  nurse: {
    order: ['{order} please… just finish night shift.', 'Boss, {order}. Need to drive home awake.', '{order}, thank you. So sian today.'],
    perfect: ['Wah, I feel human again.', 'Perfect. Thank you boss.'],
    close: ['Can, can. Too tired to complain.'],
    oops: ['Not mine… whatever, caffeine is caffeine.'],
    timeout: ['Sorry boss, need to sleep. Bye!'],
  },
  jogger: {
    order: ['*panting* Boss… {order}…', 'Just ran 10k. {order}, boss!', '{order}, boss. Earned it already.'],
    perfect: ['Shiok! Now I run home.', 'Wah, best reward.'],
    close: ['Okay, can lah.'],
    oops: ['Eh, not mine, but okay, I burn it off.'],
    timeout: ['Cooling down too long. I jog home!'],
  },
  hipster: {
    order: ['{order}. I want to taste the bean.', 'One {order}, please. Very authentic.', '{order}. No milk, no sugar, just the soul.'],
    perfect: ['Wow. Notes of… kopi. Perfect.', 'This is the real deal. Shiok.'],
    close: ['Interesting. Rustic.'],
    oops: ['Hmm. Not what I asked, but… authentic.'],
    timeout: ['I will come back at golden hour.'],
  },
  backpacker: {
    order: ['Hi! Um… {order}, please? I practised!', 'Can I get a {order}? Did I say it right?', '{order}, lah? Is that how you say it?'],
    perfect: ['Oh wow, shiok! I said shiok!', 'Amazing, thank you so much!'],
    close: ['Ooh, interesting! Thank you!'],
    oops: ['Not sure that was mine, but I love it!'],
    timeout: ['No worries, I will find you again!'],
  },
  makcik: {
    order: ['Boss, {order} satu! Panas lah today.', '{owner}, {order} ah. I bring nasi lemak later.', 'Assalamualaikum! {order}, extra cold ah.'],
    perfect: ['Sedap! Like Uncle Tan last time.', 'Wah, shiok! Terima kasih.'],
    close: ['Can lah, still sedap.'],
    oops: ['Eh, this one not mine… takpe lah.'],
    timeout: ['Aiyo, my stall got customers. I go first!'],
  },
  taxiUncle: {
    order: ['Boss, {order}! Long day driving.', '{order} one, boss. Quick ah, meter running.', 'Boss {order}. You know the 5G tower got cameras?'],
    perfect: ['Power! Now I can drive till midnight.', 'Steady boss. Better than the aliens make.'],
    close: ['Can lah, can drive.'],
    oops: ['Wrong one ah… never mind, I drink at the red light.'],
    timeout: ['Got booking! Next time boss!'],
  },
  officePair: {
    order: ['Boss, {n} {order}! Meeting run late lah.', '{n} {order} please, boss. Same same for both.', 'Boss, {n} {order}. Quick ah, lunch hour almost over.'],
    perfect: ['Wah, power. Can survive the afternoon now.', 'Shiok! Thanks boss.'],
    close: ['Can lah, close enough.'],
    oops: ['Eh, not our order leh… never mind, no time.'],
    timeout: ['Aiyo, boss call already. Next time!'],
  },
  studentPair: {
    order: ['Boss, {n} {order}! We share the table.', '{n} {order} can? After tuition reward.', 'Boss! {n} {order}, paiseh got exam tomorrow.'],
    perfect: ['Shiok! Thank you boss!', 'Wah, so nice! Can study now.'],
    close: ['Can lah, still nice.'],
    oops: ['Eh… not ours leh. Okay lah, we try.'],
    timeout: ['Aiyo, bus coming! Bye boss!'],
  },
  unclePair: {
    order: ['Boss, {n} {order}. We sit long long ah.', '{n} {order}, boss. Same as last time.', '老板, {n} {order}. 慢慢来.'],
    perfect: ['好! Shiok.', 'Wah, this one got standard.'],
    close: ['可以啦.'],
    oops: ['Ah? Not this one… never mind lah.'],
    timeout: ['算了, we go other stall.'],
  },
  tourist: {
    order: ['Hi! One {order} please. That is {plain}, right?', 'Could I get a {order}? I mean… {plain}. Did I say it right?'],
    perfect: ['Oh wow, that is strong! Love it, thank you!'],
    close: ['Interesting! Thank you!'],
    oops: ['Hmm, not quite what I expected, but fun!'],
    timeout: ['No worries, I will find another stall!'],
  },
};

export const UI = {
  tapHint: 'Psst: tap the orange words in a bubble to learn the lingo 👆',
  closing: 'Closing time! 收档啦~',
  lastOrders: '7pm! Last orders: serving everyone already here.',
  closedLine: 'Never mind, tomorrow I come again!',
  dayDone: 'Day {day} done!',
  dayDoneZh: '今天辛苦了!',
  closeStall: 'Save & back to title',
  missedServe: 'Drop the cup on a customer (them or their bubble)',
  welcomeBack: 'Welcome back! Carrying on from {time}',
  restartTitle: 'Start a new month?',
  restartBody: 'Your Day {day} save will be lost.',
  restartKeep: 'Keep my save',
  restartYes: 'Start over',
};

// "Morning" until noon, "Afternoon" until 5pm, then "Evening" (ms into the day; the day runs 7am -> 7pm).
export function greetAt(ms, dayMs = TUNING.dayMs) {
  const hour = 7 + (ms / dayMs) * 12;
  return hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
}

export function pickLine(charId, kind, vars = {}, rng = Math.random) {
  const list = LINES[charId]?.[kind] ?? ['...'];
  const line = list[Math.floor(rng() * list.length)];
  return line.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
