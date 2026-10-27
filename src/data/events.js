// Month 1 story: "The Tin" 《师傅的铁罐》. 15 short-drama episodes on a calendar.
// Script + secrets: docs/story/month-1.md. Rules: src/systems/story.js. Overlay: scenes/DramaScene.js.
//
// Episode fields:
//   id, day, when        'start' (before the first customer; Day 1: after the tutorial),
//                        'mid' (~40% into the day) or 'end' (after closing, before the summary)
//   ep, title {en, zh}   episode number + title card
//   mood                 optional scene tint: 'dark' (blackout), 'rain', 'fire'
//   guest {id, order}    optional: this customer is brought in, and the episode plays when they reach the counter
//   prelude              optional, with a guest: beats played first (with the title card); after a short quiet
//                        moment at the stall the guest walks in and `beats` play without a second title
//   rush                 optional: this many extra customers arrive right after the episode
//   beats                [{ who, text, if?, name?, silhouette?, show? }] — who: a CAST key, 'narrator' or 'note';
//                        show: a prop on the counter ('tin', or 'tinOyen' = Oyen asleep on the tin)
//   choice {options}     [{ label, flags?, fame?, money? (cents), beats? }] — shown after `beats`
//                        guestPays? (cents: all the episode's guest pays today), guestCups? (they buy fewer)
//   after                beats after the choice (both options)
//   endings              finale only: [{ id, min (fame), title, beats }]
//   epilogue             finale only: beats after the ending
//   caption              finale only: the closing line. Other episodes end on a 下集 card with just the
//                        next episode's number + title (systems/story.js nextEpisode), no spoilers
// Line text: {owner} = Ah Boy / Ah Girl, {rating} = Aunty Lim's score today, {ratingNote} = what she says about it.
// Keep glossary words space-separated so they stay tappable (systems/order.js tokenize).

// Speakers. sprite = HD sprite key; fallback = drawn as a dark silhouette while the art is missing.
export const CAST = {
  owner: { name: '{name}', sprite: '{ownerSprite}' },
  auntyLim: { name: 'Aunty Lim', sprite: 'auntyLim' },
  marcus: { name: 'Marcus', sprite: 'marcus' },
  darren: { name: 'Darren', sprite: 'darren' },
  weiLing: { name: 'Wei Ling', sprite: 'weiLing' },
  hafiz: { name: 'Hafiz', sprite: 'hafiz' },
  jiaHui: { name: 'Jia Hui', sprite: 'jiaHui' },
  ahGong: { name: 'Ah Gong', sprite: 'ahGong' },
  oyen: { name: 'Oyen', sprite: 'oyen', perch: true }, // a cat: lies on the counter (his fish box hidden behind it)
  makcik: { name: 'Makcik', sprite: 'makcikStand' },
  kenneth: { name: 'Kenneth', sprite: 'kenneth' },
  kai: { name: 'Kai', sprite: 'kai' },
  inspector: { name: 'Inspector', sprite: 'inspector' },
  taxiUncle: { name: 'Taxi Uncle', sprite: 'taxiUncleStand' },
  aunties: { name: 'Qigong Aunties', sprite: 'exerciseAunties' },
  rainUncle: { name: 'Rain Uncle', sprite: 'rainUncle' },
  uncleTan: { name: 'Uncle Tan', sprite: 'uncleTan' },
};

// Where each speaker's face is across their sprite (0 = left edge, 1 = right), for the portrait
// beside the dialogue box. Unlisted sprites use 0.48. The crop is a square from the top of the sprite.
export const FACE_X = { taxiUncleStand: 0.42, uncleTan: 0.52, sophie: 0.5, makcik: 0.36, mei: 0.38, kai: 0.58, taxiUncle: 0.6, weiLing: 0.56, hafiz: 0.56, darren: 0.54, jiaHui: 0.54, marcus: 0.44, rainUncle: 0.42, jun: 0.44, exerciseAunties: 0.44 };

const N = (text, extra = {}) => ({ who: 'narrator', text, ...extra });

export const EVENTS = [
  {
    id: 'ep1-note', day: 1, when: 'start', ep: 1,
    title: { en: 'The Note on the Tin', zh: '罐上的字条' },
    // Day 1: you make Aunty Lim's teh first (the tutorial), then this plays (Tutorial step { story: 'start' })
    beats: [
      N('The first teh of your life. Aunty Lim sips it slowly.'),
      { who: 'auntyLim', text: 'Not bad leh, for first day. You are the {owner} Uncle Tan pass his stall to? Don\'t kan cheong.' },
      { who: 'auntyLim', text: 'I\'m Aunty Lim. Every morning I come for teh. Uncle Tan\'s teh: 9 out of 10.' },
      { who: 'auntyLim', text: 'Yours ah… 我们看看. Tonight I tell you.' },
      N('On the counter: Uncle Tan\'s old biscuit tin, with a note taped on it.', { show: 'tin' }),
      { who: 'note', name: 'Uncle Tan', text: '"{owner} — stall is yours for 1 month. Tin for Day 30. Don\'t open. Don\'t let Oyen sit on it. — Tan"', show: 'tin' },
      N('Oyen, the orange stall cat, is already sleeping on it.', { show: 'tinOyen' }),
      { who: 'oyen', text: 'Meow. (does not move)', show: 'tinOyen' },
    ],
  },
  {
    id: 'ep1-rating', day: 1, when: 'end', ep: 1,
    title: { en: 'The Note on the Tin', zh: '罐上的字条' },
    beats: [{ who: 'auntyLim', text: 'Today: {rating} out of 10. {ratingNote}' }],
    choice: {
      options: [
        { label: '"Aunty, teach me!"', flags: ['humble'], fame: 2, beats: [{ who: 'auntyLim', text: 'Hm. At least got manners. Everybody 有进步空间. Tomorrow I watch.' }] },
        { label: '"Tomorrow sure 10/10!"', flags: ['cocky'], fame: 1, beats: [{ who: 'auntyLim', text: 'Wah, big talk. 我记住了.' }] },
      ],
    },
    after: [N('She writes the number in a little red notebook. Why does a retired canteen aunty need a notebook?')],
  },
  {
    id: 'ep2-twenty-cents', day: 2, when: 'mid', ep: 2,
    title: { en: 'Twenty Cents', zh: '两毛钱' },
    guest: { id: 'schoolKids', order: 'Milo Dinosaur' },
    beats: [
      { who: 'weiLing', text: '(counting) Nine dollars… eighty. We short twenty cents.' },
      { who: 'darren', text: 'Boss! Can owe first? Tomorrow pay, promise!' },
      { who: 'hafiz', text: '(teacher voice) "Students. In-te-gri-ty."' },
      { who: 'jiaHui', text: '… (she\'s already sketching you)' },
    ],
    choice: {
      options: [
        { label: '"Can, owe me lah."', flags: ['kidsOwe'], guestPays: 980, beats: [{ who: 'darren', text: 'BOSS POWER!' }] },
        { label: '"Sorry ah, rules are rules."', flags: ['kidsNo'], guestCups: 3, beats: [N('The kids buy 3 and share the 4th with four straws.'), { who: 'hafiz', text: 'Integrity… is thirsty.' }] },
        { label: '"Today on the house!"', flags: ['kidsFree'], fame: 3, guestPays: 0, beats: [{ who: 'weiLing', text: '(writes it down) We will repay. With interest.' }] },
      ],
    },
    after: [N('Jia Hui closes her sketchbook. She drew something. She won\'t say what.')],
  },
  {
    id: 'ep3-fast-fast', day: 3, when: 'mid', ep: 3,
    title: { en: 'Fast Fast', zh: '快快' },
    beats: [
      { who: 'marcus', text: 'Boss, kopi C kosong, fast fast — yes Mr Lee, the Q3 deck is almost —' },
      N('His phone slips into the tray. The screen lights up. No call. Just the lock screen.'),
      { who: 'marcus', text: '…Network problem.' },
    ],
    choice: {
      options: [
        { label: 'Pretend you didn\'t see', flags: ['marcusQuiet'], beats: [{ who: 'marcus', text: '(quietly) …Thanks, boss.' }] },
        { label: '"Bro, you okay?"', flags: ['marcusAsked'], beats: [{ who: 'marcus', text: 'Okay one. Okay one.' }, N('He tips 50 cents. His hand is shaking.')] },
      ],
    },
  },
  {
    id: 'ep3-watcher', day: 3, when: 'end', ep: 3,
    title: { en: 'Fast Fast', zh: '快快' },
    beats: [
      N('Across the road, a man in sunglasses takes a photo of your stall.'),
      { who: 'kenneth', name: '???', silhouette: true, text: 'So this is the stall. Still the same.' },
    ],
  },
  {
    id: 'ep4-double-life', day: 5, when: 'mid', ep: 4,
    title: { en: 'Oyen\'s Double Life', zh: '橙猫的双面人生' },
    beats: [
      N('Oyen grabs a kaya toast and bolts for the next stall.'),
      { who: 'makcik', text: 'Eh, Oren! You come back already? Here, ikan bilis.' },
      { who: 'owner', text: 'Makcik… that\'s OUR cat. Oyen.' },
      { who: 'makcik', text: 'Oyen? No lah. This one is Oren. Comes every afternoon, sleeps in my rice cooker box.' },
      N('Twist: Oyen has been living a double life. Breakfast here, lunch there. Stealing from both.'),
    ],
    choice: {
      options: [
        { label: '"Okay lah, we share him."', flags: ['makcikFriend'], fame: 2, beats: [{ who: 'makcik', text: 'Deal! I send you nasi lemak, you send me kopi.' }] },
        { label: '"Oyen, come home!"', flags: ['oyenHome'], beats: [{ who: 'makcik', text: '(laughs) Cat choose his own home one. Neighbour mah, still friends.' }] },
      ],
    },
    after: [{ who: 'oyen', text: 'Meow. (knocks a cup off your counter: the daily tax)' }],
  },
  {
    id: 'ep5-tissue', day: 7, when: 'start', ep: 5,
    title: { en: 'The 1987 Tissue Packet', zh: '1987年的纸巾' },
    beats: [
      N('The morning qigong aunties want the window table. There\'s a tissue packet on it.'),
      { who: 'aunties', text: 'Tissue packet is not a person! Chope also must got limit!' },
      { who: 'ahGong', text: '(not looking up) 这包纸巾 ， 1987年放的.' },
      { who: 'aunties', text: '(gasp) 1987?!' },
      N('The packet is faded. Printed on it: "TAN\'S KOPI · 1987".'),
      { who: 'ahGong', text: 'Uncle Tan gave me. He say: "This seat, yours forever."' },
    ],
    choice: {
      options: [
        { label: '"Ah Gong\'s seat lah, aunties."', flags: ['ahGongSeat'], beats: [N('The aunties sulk… then order teh and declare it "medicinal".')] },
        { label: '"Can share the table?"', flags: ['sharedTable'], fame: 2, beats: [N('Ah Gong grumbles, gets dragged into qigong… and his back stops aching.'), { who: 'ahGong', text: '…明天再来.' }] },
      ],
    },
  },
  {
    id: 'ep6-offer', day: 10, when: 'mid', ep: 6,
    title: { en: 'The Offer', zh: '收购' },
    beats: [
      N('The man in sunglasses walks in. Sharp suit. Sharper smile.'),
      { who: 'kenneth', text: 'Kenneth. BrewDynasty 豆王朝 , regional expansion. Your stall: fifty thousand. Cash. Today.' },
      { who: 'auntyLim', text: '(eating, without looking up) His suit: 3 out of 10.' },
      { who: 'kenneth', text: 'On Day 30 the lease for this corner is renewed. My company will bid. Think about it.' },
    ],
    choice: {
      options: [
        { label: '"Not for sale!"', flags: ['defiant'], fame: 3, beats: [{ who: 'kenneth', text: 'Brave. Brave doesn\'t pay rent.' }] },
        { label: '"…Let me think first."', flags: ['thinking'], beats: [{ who: 'kenneth', text: 'Smart. (he leaves his card)' }] },
      ],
    },
    after: [
      N('At the door he stops, and looks at the old kopi pot.'),
      { who: 'kenneth', text: '(softly) …Still using this pot ah.' },
    ],
  },
  {
    id: 'ep7-ninja', day: 12, when: 'mid', ep: 7,
    title: { en: 'Kopi Ninja', zh: '咖啡忍者' },
    beats: [
      { who: 'kai', text: 'Hello guys! Today: hidden-gem kopi stall, my Ah Ma\'s favourite —' },
      N('Oyen, live on camera, pays the daily tax. A full cup goes over the edge.'),
      N('You catch it. One hand. Not a drop spilled.'),
      { who: 'kai', text: 'BRO. DID YOU SEE THAT?!' },
      N('By night: "KOPI NINJA SAVES CUP" — 2.3 million views. (Fame +10)'),
      N('The thumbnail is Jia Hui\'s drawing: you, in a cape, holding a kopi pot.', { if: ['kidsOwe', 'kidsFree'] }),
      N('The thumbnail is Jia Hui\'s drawing: you, arms crossed. "STRICT BUT FAIR BOSS".', { if: 'kidsNo' }),
      N('Top comment, from @kenneth.tan: "That pot is 38 years old."'),
    ],
    fame: 10,
  },
  {
    id: 'ep8-notebook', day: 14, when: 'mid', ep: 8,
    title: { en: 'The Red Notebook', zh: '红色笔记本' },
    beats: [
      { who: 'kenneth', text: 'I\'m here to meet the landlord about the lease. Where is he?' },
      N('Silence. Ah Gong lowers his newspaper. Aunty Lim finishes her char kway teow. Stands up.'),
      { who: 'auntyLim', text: '房东 是我.' },
      { who: 'kenneth', text: '…You?!' },
      { who: 'auntyLim', text: 'Thirty years canteen aunty. Saved every cent. Bought the whole kopitiam.' },
      { who: 'auntyLim', text: '(opens the red notebook) Every teh I rate. Every day.' },
      { who: 'auntyLim', text: 'This one asked me to teach. 有心.', if: 'humble' },
      { who: 'auntyLim', text: 'This one promised 10 out of 10. I\'m still waiting ah.', if: 'cocky' },
      { who: 'auntyLim', text: 'Day 30, I decide. Whose teh better, they get the lease. Simple.' },
      { who: 'kenneth', text: 'Aunty, my company makes three thousand cups an hour.' },
      { who: 'auntyLim', text: 'I only drink one.' },
    ],
  },
  {
    id: 'ep9-inspection', day: 17, when: 'mid', ep: 9,
    title: { en: 'Surprise Inspection', zh: '突击检查' },
    beats: [
      { who: 'inspector', text: 'Hygiene inspection! Nobody move! (magnifying glass out)' },
      N('He opens the cash drawer. Oyen is asleep inside it.'),
      { who: 'inspector', text: 'Is that… a CAT?' },
      { who: 'auntyLim', text: 'Ah Huat. Primary 4. You still owe me 40 cents for Milo.' },
      { who: 'inspector', text: '(sweating) …C-Canteen Aunty Lim?!' },
      { who: 'darren', text: '(passing by) See? Owing is tradition!', if: 'kidsOwe' },
    ],
    choice: {
      options: [
        { label: '"It\'s a… cushion."', flags: ['oyenCushion'], beats: [{ who: 'inspector', text: '(very carefully not looking) Grade B. The cushion must not meow.' }] },
        { label: '"Sorry sir, he\'s our stall cat."', flags: ['honest'], fame: 3, beats: [{ who: 'inspector', text: 'Grade A for honesty. Cat sleeps OUTSIDE the drawer.' }] },
      ],
    },
    after: [N('Oyen now sleeps on the tin. Nobody is surprised.')],
  },
  {
    id: 'ep10-blackout', day: 19, when: 'mid', ep: 10,
    title: { en: 'Blackout', zh: '跳电' },
    mood: 'dark',
    beats: [
      N('Lunch rush. Then: click. Everything goes dark.'),
      { who: 'taxiUncle', text: 'Confirm the 5G. Or aliens. Or 5G aliens.' },
      { who: 'marcus', text: 'No no no — my laptop — my meetings —' },
      { who: 'marcus', text: '…Okay. There are no meetings. I got retrenched three weeks ago.' },
      { who: 'marcus', text: 'I still come every morning… because here you all still call me "boss".' },
      { who: 'marcus', text: 'You were the only one who asked if I was okay.', if: 'marcusAsked' },
      { who: 'marcus', text: 'You saw my phone that day. You never said anything. Thank you.', if: 'marcusQuiet' },
    ],
    choice: {
      options: [
        { label: '"Today you help me be cashier lah."', flags: ['marcusHelper'], fame: 2, money: 500, beats: [N('Marcus runs the cash box like a hedge fund. Fastest lunch ever.')] },
        { label: '"Taxi Uncle, you know anyone hiring?"', flags: ['marcusJob'], beats: [{ who: 'taxiUncle', text: 'My passenger yesterday is HR manager! I keep her card. She agreed aliens real.' }] },
      ],
    },
    after: [N('The lights come back. Ah Gong had unplugged the fridge to charge his radio.')],
  },
  {
    id: 'ep11-rain-uncle', day: 21, when: 'mid', ep: 11,
    title: { en: 'The Rain Uncle', zh: '雨伞阿伯' },
    mood: 'rain',
    rush: 3,
    beats: [
      N('Sudden storm. Everyone runs in. A smiling uncle in a white singlet shakes off his umbrella.'),
      { who: 'rainUncle', text: 'Kopi O. Like last time.' },
      { who: 'owner', text: 'Last time? Sorry uncle, I don\'t think I\'ve —' },
      { who: 'rainUncle', text: '(sips) Sugar a bit too much. But… got soul.' },
      N('The kids burst in, soaking wet.'),
      { who: 'weiLing', text: 'Twenty cents. Plus interest. (a coin taped to a card: "Interest = 1 drawing")', if: 'kidsOwe' },
      { who: 'darren', text: 'We made you something! (a hand-painted poster: "BEST STALL IN THE WORLD")', if: 'kidsFree' },
      { who: 'weiLing', text: 'My school project: "Why that stall is strict but fair." I got an A. Thank you, boss.', if: 'kidsNo' },
      N('The rain stops. The uncle is gone. His umbrella is still hooked on the counter.'),
      N('The name tag on the handle says: TAN.'),
    ],
  },
  {
    id: 'ep12-fire', day: 24, when: 'mid', ep: 12,
    title: { en: 'Fire!', zh: '火灾' },
    mood: 'fire',
    beats: [
      { who: 'makcik', text: 'API! API! Fire!' },
      N('Smoke pours out of the next stall. Everyone panics. Except one person.'),
      { who: 'auntyLim', text: '(still eating char kway teow) Wah, fire ah? 等我吃完先.' },
    ],
    choice: {
      options: [
        { label: 'Grab the fire extinguisher', flags: ['fireHero'], fame: 5 },
        { label: 'Save the TIN first', flags: ['savedTin'], beats: [N('Across the road, Kenneth sees you run out hugging it.')] },
      ],
    },
    after: [
      N('But Ah Gong is already there. Retired bus captain. Fire-safety certified. Whoosh. Done.'),
      { who: 'auntyLim', text: '(finally looks up at him) …Not bad.' },
      N('Ah Gong turns red. Not from the fire.'),
      N('Kenneth is there too, soot on his face, holding a bucket.'),
      { who: 'kenneth', text: 'My father\'s stall cannot burn.' },
      { who: 'owner', text: '…Your FATHER\'S stall?' },
    ],
  },
  {
    id: 'ep13-crossword', day: 26, when: 'start', ep: 13,
    title: { en: 'The Crossword', zh: '填字游戏' },
    beats: [
      N('Ah Gong waves you over. He hands you a folded crossword.'),
      { who: 'ahGong', text: '三十年. Same crossword every day. Today I finish it.' },
      N('The answers down the side spell: L-I-M · K-O-P-I · W-I-T-H · M-E.'),
      { who: 'ahGong', text: 'You… bring to her. With kopi O.' },
    ],
    choice: {
      options: [
        { label: 'Deliver it with his kopi O', fame: 1 },
        { label: 'Deliver it with her teh C siew dai', flags: ['cupid'], fame: 3 },
      ],
    },
    after: [
      N('Aunty Lim reads it. Long pause.'),
      { who: 'auntyLim', text: '等我吃完先.' },
      N('She finishes. Then she sits down at Ah Gong\'s table. First time anyone has shared it since 1987.'),
      { who: 'auntyLim', text: 'Your matchmaking: 10 out of 10. Your teh: still counting.', if: 'cupid' },
    ],
  },
  {
    id: 'ep14-father-son', day: 28, when: 'end', ep: 14,
    title: { en: 'Father and Son', zh: '父子' },
    mood: 'rain',
    beats: [
      N('Kenneth comes alone. No sunglasses.'),
      { who: 'kenneth', text: 'I did homework at that back table too. Every day till eighteen.' },
      { who: 'kenneth', text: 'Then I told him kopi stall is a dead end. And I left.' },
      N('Thunder. An umbrella shakes off at the counter.'),
      { who: 'kenneth', text: '…Pa?' },
      { who: 'uncleTan', text: 'Day 30 never reach yet. Why everybody so kan cheong ?' },
      N('The rain uncle was Uncle Tan all along — checking on his stall. And on you.'),
    ],
    choice: {
      options: [
        { label: 'Give them the back table, leave them be', flags: ['familyTable'], fame: 2 },
        { label: 'Make them two cups, on the house', flags: ['twoCups'], fame: 3, money: -300 },
      ],
    },
    after: [{ who: 'uncleTan', text: 'Day 30, open the tin. Then you decide, Kenneth.' }],
  },
  {
    id: 'ep15-the-tin', day: 30, when: 'end', ep: 15,
    title: { en: 'The Tin', zh: '铁罐' },
    beats: [
      N('Everyone\'s here. Aunty Lim with her red notebook. Kenneth with a contract. Uncle Tan with his towel.'),
      { who: 'uncleTan', text: 'Open lah.' },
      N('Inside the tin: a 20-cent coin, a crayon drawing of the stall signed "KENNETH, 7", and a note.'),
      { who: 'note', name: 'Uncle Tan', text: '"The secret recipe: remember who drinks it."' },
      { who: 'uncleTan', text: '1994. A small boy came, short twenty cents for his first Milo. I let him owe.' },
      { who: 'kenneth', text: '…That was me.' },
      { who: 'uncleTan', text: '(to you) I heard you did the same thing. Good.', if: 'kidsOwe' },
      { who: 'kenneth', text: '(tears up the contract) BrewDynasty doesn\'t need this corner.' },
      { who: 'auntyLim', text: '(opens the notebook) Final score.' },
    ],
    endings: [
      {
        id: 'empire', min: 70, title: 'Empire Begins 帝国起步',
        beats: [
          { who: 'auntyLim', text: '10 out of 10.' },
          { who: 'kenneth', text: 'Then… could BrewDynasty use a partner? Your stall. A second branch.' },
        ],
      },
      {
        id: 'ourStall', min: 40, title: 'Our Stall 我们的档口',
        beats: [
          { who: 'auntyLim', text: '8 out of 10. Lease is yours.' },
          { who: 'kenneth', text: 'I\'ll be back. As a customer.' },
        ],
      },
      {
        id: 'stillBrewing', min: 0, title: 'Still Brewing 还在冲',
        beats: [{ who: 'auntyLim', text: '7 out of 10. Lease is yours, can improve. Next month I want 10.' }],
      },
    ],
    epilogue: [
      { who: 'marcus', text: 'New job! Kopi C — WITH sugar today. Celebration. Doctor don\'t know.', if: 'marcusJob' },
      { who: 'marcus', text: 'Boss, I did your accounts. You\'re 12% more profitable than BrewDynasty. Per cup.', if: 'marcusHelper' },
      { who: 'makcik', text: 'Nasi lemak for everybody!', if: 'makcikFriend' },
      N('Ah Gong and Aunty Lim share one newspaper now.', { if: 'cupid' }),
      { who: 'oyen', text: 'Meow. (knocks the tin off the counter: tax)' },
    ],
    caption: 'Month 1 · 完. The empire starts with one cup.',
  },
];
