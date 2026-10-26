# Month 1 story: "The Tin" 《师傅的铁罐》

A 30-day mini-drama in 15 short episodes (短剧 style). Each one lasts 20-40 seconds, ends on a twist
or a cliffhanger, and usually has one choice. Choices set **flags**, and later episodes call back to them.
Nothing is ever lost: every ending is a warm one, and fame only decides *how* warm.

Status: approved and built into `src/data/events.js` (spec: `docs/specs/walk-in-fame-story.md`).
Edit the data file for wording changes; keep this doc in sync for the secrets/threads.

## Script conventions
- `{owner}` = Ah Boy / Ah Girl
- `[if flag]` = a line shown only when that flag is set
- **When:** `start` (before the first customer; on Day 1, after the tutorial), `mid` (~40% into the day), `end` (after the last customer, before the summary)
- **Caption:** writers' note for the 下集 tease. In game the last card shows only the next episode's number + title
  (playtest 2026-10-23: the captions gave too much away). Only the finale's closing caption is shown.
- **Fame:** effects are rough numbers, tuned in `stallTuning.js`

## The secrets (spoilers, for us only)
1. **Aunty Lim owns the whole kopitiam.** Her red notebook is a daily audition of your teh.
2. **Kenneth, the slick chain-store manager trying to buy the stall, is Uncle Tan's son.** He left at 18
   saying "kopi stall is a dead end".
3. **The rain uncle in the white singlet *is* Uncle Tan**, secretly checking on you.
4. **The tin holds no recipe:** an old 20-cent coin, little Kenneth's crayon drawing of the stall, and a
   note. In 1994, Uncle Tan let 7-year-old Kenneth owe 20 cents for his first Milo. This mirrors the kids
   on Day 2.

## Running threads
| Thread | Starts | Twist | Pays off |
|---|---|---|---|
| The Tin + Uncle Tan | Day 1 | Day 21 (umbrella tag "TAN"), Day 28 (rain uncle = Tan) | Day 30 |
| Aunty Lim's red notebook | Day 1 | Day 14 (she's the landlord) | Day 30 score |
| Kids' 20 cents | Day 2 | Day 21 (repayment) | Day 30 (mirrors the coin) |
| Marcus's fake calls | Day 3 | Day 19 (retrenched) | Day 30 epilogue |
| The watcher → Kenneth | Day 3 | Day 10 (the offer), Day 24 (Uncle Tan's son) | Day 28, Day 30 |
| Oyen + Makcik | Day 5 | Day 5 (double life) | Day 17, Day 24 |
| Ah Gong ♥ Aunty Lim | Day 7 | Day 24 (hero), Day 26 (crossword letter) | Day 30 |

## Calendar
| Day | Ep | Title | When |
|---|---|---|---|
| 1 | 1 | The Note on the Pot 《壶上的字条》 | start + end |
| 2 | 2 | Twenty Cents 《两毛钱》 | mid |
| 3 | 3 | Fast Fast 《快快》 | mid + end |
| 5 | 4 | Oyen's Double Life 《橙猫的双面人生》 | mid |
| 7 | 5 | The 1987 Tissue Packet 《1987年的纸巾》 | start |
| 10 | 6 | The Offer 《收购》 | mid |
| 12 | 7 | Kopi Ninja 《咖啡忍者》 | mid |
| 14 | 8 | The Red Notebook 《红色笔记本》 | mid |
| 17 | 9 | Surprise Inspection 《突击检查》 | mid |
| 19 | 10 | Blackout 《跳电》 | mid |
| 21 | 11 | The Rain Uncle 《雨伞阿伯》 | mid |
| 24 | 12 | Fire! 《火灾》 | mid |
| 26 | 13 | The Crossword 《填字游戏》 | start |
| 28 | 14 | Father and Son 《父子》 | end |
| 30 | 15 | The Tin 《铁罐》 | end (finale) |

Days with no episode are quiet days: pure serving, plus the odd ambient one-liner (already in `lines.js`).

---

## Prologue · One Month to Try 《一个月的约定》 (opening cutscene, `src/data/opening.js`)
Plays once before Day 1. Uncle Tan is only heard, or seen as hands and phone messages: his face must stay hidden
until Day 28 (he is the Rain Uncle).
- Estate at dawn. **Narrator:** Every estate has one. A corner kopitiam, a kopi stall, and an uncle who knows your order.
- Flashback, the back table. **Little {name}:** "Uncle Tan! One day I also want my own kopi stall. Like you!"
  **Uncle Tan:** "Wah, big dream. Can lah. But study hard first." **Little {name}:** "Promise! Then I come back and make kopi for you."
- Office. **Narrator:** The office kopi tasted like sadness. The dream was still there, under the spreadsheets.
- Phone chat. **Uncle Tan:** I retire liao, knee pain. Last time you say want your own stall, still want or not?
  Come try one month lah, 30 days, after that you decide. **You:** Uncle… OK! I try! **Uncle Tan:** Tomorrow 6am. Oyen hungry.
- Sunrise. {name} rolls up the shutter. One month. Thirty days. Then Day 1.

The one-month trial is why the tin is for Day 30, and it frames the finale's decision.

## Ep 1 · Day 1 · The Note on the Pot 《壶上的字条》
**Cast:** narrator, Oyen, Aunty Lim (guest) · **When:** start, then end

*start* (the note plays first; after a short quiet moment at the stall, Aunty Lim walks in and the rest plays)
- **Narrator:** A note is taped to the old kopi pot.
- **Note (Uncle Tan):** "{owner} — stall is yours for 1 month. Tin for Day 30. Don't open. Don't let Oyen sit on it. — Tan"
- **Narrator:** Oyen is already sitting on it.
- **Oyen:** Meow. *(does not move)*
- *(a quiet moment; Aunty Lim walks up to the counter)*
- **Narrator:** The first customer of your life.
- **Aunty Lim:** Eh! So you are the {owner} Uncle Tan pass his stall to ah?
- **Aunty Lim:** First day ah? Don't kan cheong. Here everybody very nice one.
- **Aunty Lim:** We all look after you. I'm Aunty Lim. Every morning I come for teh.
- **Aunty Lim:** Uncle Tan's teh: 9 out of 10. Yours ah… 我们看看. One teh, please.
  *(On Day 1 her teh is the tutorial's first order: a ghost hand shows how, then you serve.)*

*end*
- **Aunty Lim:** Today: 5 out of 10. 有进步空间 lah.
- **Choice:**
  - "Aunty, teach me!" → flag `humble`, fame +2. **Aunty Lim:** Hm. At least got manners. Tomorrow I watch.
  - "Tomorrow sure 10/10!" → flag `cocky`, fame +1. **Aunty Lim:** Wah, big talk. 我记住了.
- **Narrator:** She writes the number in a little red notebook. Why does a retired canteen aunty need a notebook?
- **Caption:** 下集: twenty cents can change everything.

## Ep 2 · Day 2 · Twenty Cents 《两毛钱》
**Cast:** Darren, Wei Ling, Hafiz, Jia Hui · **When:** mid (the kids arrive as a forced customer, 4× Milo Dinosaur)
- **Wei Ling:** *(counting)* Nine dollars… eighty. We short twenty cents.
- **Darren:** Boss! Can owe first? Tomorrow pay, promise!
- **Hafiz:** *(teacher voice)* "Students. In-te-gri-ty."
- **Jia Hui:** … *(she's already sketching you)*
- **Choice:**
  - "Can, owe me lah." → flag `kidsOwe`. **Darren:** BOSS POWER!
  - "Sorry ah, rules are rules." → flag `kidsNo`. The kids buy 3 and share the 4th with 4 straws. **Hafiz:** Integrity… is thirsty.
  - "Today on the house!" → flag `kidsFree`, money −$9.80, fame +3. **Wei Ling:** *(writes it down)* We will repay. With interest.
- **Narrator:** Jia Hui closes her sketchbook. She drew something. She won't say what.
- **Caption:** 下集: a phone falls. The screen tells the truth.

## Ep 3 · Day 3 · Fast Fast 《快快》
**Cast:** Marcus, narrator, ??? (silhouette) · **When:** mid, then end

*mid*
- **Marcus:** Boss, kopi C kosong, fast fast — yes Mr Lee, the Q3 deck is almost —
- **Narrator:** His phone slips into the tray. The screen lights up. No call. Just the lock screen.
- **Marcus:** …Network problem.
- **Choice:**
  - Pretend you didn't see → flag `marcusQuiet`. **Marcus:** *(quietly)* …Thanks, boss.
  - "Bro, you okay?" → flag `marcusAsked`. **Marcus:** Okay one. Okay one. *(he tips 50 cents; his hand is shaking)*

*end*
- **Narrator:** Across the road, a man in sunglasses takes a photo of your stall.
- **???:** So this is the stall. Still the same.
- **Caption:** 下集: someone wants your stall. Who is he?

## Ep 4 · Day 5 · Oyen's Double Life 《橙猫的双面人生》
**Cast:** Oyen, Makcik (next stall), narrator · **When:** mid
- **Narrator:** Oyen grabs a kaya toast and bolts for the next stall.
- **Makcik:** Eh, Oren! You come back already? Here, ikan bilis.
- **{owner}:** Makcik… that's OUR cat. Oyen.
- **Makcik:** Oyen? No lah. This one is Oren. Comes every afternoon, sleeps in my rice cooker box.
- **Narrator:** Twist: Oyen has been living a double life. Breakfast here, lunch there, and stealing from both.
- **Choice:**
  - "Okay lah, we share him." → flag `makcikFriend`, fame +2. **Makcik:** Deal! I send you nasi lemak, you send me kopi.
  - "Oyen, come home!" → flag `oyenHome`. **Makcik:** *(laughs)* Cat choose his own home one. Neighbour mah, still friends.
- **Oyen:** Meow. *(knocks a cup off your counter: the daily tax)*
- **Caption:** 下集: a 37-year-old tissue packet starts a war.

## Ep 5 · Day 7 · The 1987 Tissue Packet 《1987年的纸巾》
**Cast:** Exercise aunties, Ah Gong · **When:** start
- **Narrator:** The morning qigong aunties want the window table. There's a tissue packet on it.
- **Auntie (headband):** Tissue packet is not a person! Chope also must got limit!
- **Ah Gong:** *(not looking up from his newspaper)* 这包纸巾，1987年放的.
- **Aunties:** *(gasp)* 1987?!
- **Narrator:** The packet is faded. Printed on it: "TAN'S KOPI · 1987".
- **Ah Gong:** Uncle Tan gave me. He say: "This seat, yours forever."
- **Choice:**
  - "Ah Gong's seat lah, aunties." → flag `ahGongSeat`. The aunties sulk… then order teh and declare it "medicinal".
  - "Can share the table?" → flag `sharedTable`, fame +2. Ah Gong grumbles, gets dragged into qigong… and his back stops aching. **Ah Gong:** …明天再来.
- **Caption:** 下集: $50,000. Cash. Today.

## Ep 6 · Day 10 · The Offer 《收购》
**Cast:** Kenneth (rival manager), Aunty Lim · **When:** mid
- **Narrator:** The man in sunglasses walks in. Sharp suit. Sharper smile.
- **Kenneth:** Kenneth. BrewDynasty 豆王朝, regional expansion. Your stall: fifty thousand. Cash. Today.
- **Aunty Lim:** *(eating, without looking up)* His suit: 3 out of 10.
- **Kenneth:** On Day 30 the lease for this corner is renewed. My company will bid. Think about it.
- **Choice:**
  - "Not for sale!" → flag `defiant`, fame +3. **Kenneth:** Brave. Brave doesn't pay rent.
  - "…Let me think first." → flag `thinking`. **Kenneth:** Smart. *(he leaves his card)*
- **Narrator:** At the door he stops and looks at the old kopi pot.
- **Kenneth:** *(softly)* …Still using this pot ah.
- **Caption:** 下集: how does he know the pot?

## Ep 7 · Day 12 · Kopi Ninja 《咖啡忍者》
**Cast:** Kai (food vlogger, Ah Ma's grandson), Oyen, narrator · **When:** mid · **Effect:** fame +10, tomorrow brings a rush
- **Kai:** Hello guys! Today: hidden-gem kopi stall, my Ah Ma's favourite —
- **Narrator:** Oyen, live on camera, pays the daily tax. A full cup goes over the edge.
- **Narrator:** You catch it. One hand. Not a drop spilled.
- **Kai:** BRO. DID YOU SEE THAT?!
- **Narrator:** By night: "KOPI NINJA SAVES CUP 🥷☕" — 2.3 million views.
- [if kidsOwe or kidsFree] **Narrator:** The thumbnail is Jia Hui's drawing: you, in a cape, holding a kopi pot.
- [if kidsNo] **Narrator:** The thumbnail is Jia Hui's drawing: you, arms crossed, captioned "STRICT BUT FAIR BOSS".
- **Narrator:** Top comment, from @kenneth.tan: "That pot is 38 years old."
- **Caption:** 下集: who really owns this kopitiam?

## Ep 8 · Day 14 · The Red Notebook 《红色笔记本》 (midpoint twist)
**Cast:** Kenneth, Aunty Lim, Ah Gong · **When:** mid
- **Kenneth:** I'm here to meet the landlord about the lease. Where is he?
- **Narrator:** Silence. Ah Gong lowers his newspaper. Aunty Lim finishes her char kway teow. Wipes her mouth. Stands up.
- **Aunty Lim:** 房东是我.
- **Kenneth:** …You?!
- **Aunty Lim:** Thirty years canteen aunty. Saved every cent. Bought the whole kopitiam. *(opens the red notebook)* Every teh I rate. Every day.
- [if humble] **Aunty Lim:** This one asked me to teach. 有心.
- [if cocky] **Aunty Lim:** This one promised 10 out of 10. I'm still waiting ah.
- **Aunty Lim:** Day 30, I decide. Whose teh better, they get the lease. Simple.
- **Kenneth:** Aunty, my company makes three thousand cups an hour.
- **Aunty Lim:** I only drink one.
- **Caption:** 下集: the inspector is coming. And Oyen is in the cash drawer.

## Ep 9 · Day 17 · Surprise Inspection 《突击检查》
**Cast:** Inspector, Oyen, Aunty Lim · **When:** mid
- **Inspector:** Hygiene inspection! Nobody move! *(magnifying glass out)*
- **Narrator:** He opens the cash drawer. Oyen is asleep inside it.
- **Inspector:** Is that… a CAT?
- **Aunty Lim:** Ah Huat. Primary 4. You still owe me 40 cents for Milo.
- **Inspector:** *(sweating)* …C-Canteen Aunty Lim?!
- [if kidsOwe] **Darren:** *(passing by)* See? Owing is tradition!
- **Choice:**
  - "It's a… cushion." → flag `oyenCushion`. **Inspector:** *(very carefully not looking)* Grade B. The cushion must not meow.
  - "Sorry sir, he's our stall cat." → flag `honest`, fame +3. **Inspector:** Grade A for honesty. Cat sleeps OUTSIDE the drawer.
- **Narrator:** Oyen now sleeps on the tin. Nobody is surprised.
- **Caption:** 下集: lunch rush. Lights out. Marcus breaks.

## Ep 10 · Day 19 · Blackout 《跳电》
**Cast:** Taxi Uncle, Marcus, Ah Gong · **When:** mid (lunch rush; the lights dim during the scene)
- **Narrator:** Lunch rush. Then: click. Everything goes dark.
- **Taxi Uncle:** Confirm the 5G. Or aliens. Or 5G aliens.
- **Marcus:** No no no — my laptop — my *meetings* —
- **Marcus:** …Okay. There are no meetings. I got retrenched three weeks ago. I still come every morning… because here you all still call me "boss".
- [if marcusAsked] **Marcus:** You were the only one who asked if I was okay.
- [if marcusQuiet] **Marcus:** You saw my phone that day. You never said anything. Thank you.
- **Choice:**
  - "Today you help me be cashier lah." → flag `marcusHelper`, money +$5, fame +2. **Narrator:** Marcus runs the cash box like a hedge fund. Fastest lunch ever.
  - "Taxi Uncle, you know anyone hiring?" → flag `marcusJob`. **Taxi Uncle:** My passenger yesterday is HR manager! I keep her card. She agreed aliens real.
- **Narrator:** The lights come back. Ah Gong had unplugged the fridge to charge his radio.
- **Caption:** 下集: it only rains when he comes.

## Ep 11 · Day 21 · The Rain Uncle 《雨伞阿伯》
**Cast:** Rain Uncle (secretly Uncle Tan), the kids · **When:** mid · **Effect:** rain rush (+3 customers in 20 s)
- **Narrator:** Sudden storm. Everyone runs in. A smiling uncle in a white singlet shakes off his umbrella.
- **Rain Uncle:** Kopi O. Like last time.
- **{owner}:** Last time? Sorry uncle, I don't think I've —
- **Rain Uncle:** *(sips)* Sugar a bit too much. But… got soul.
- **Narrator:** The kids burst in, soaking wet.
- [if kidsOwe] **Wei Ling:** Twenty cents. Plus interest. *(a coin taped to a card: "Interest = 1 drawing". It's you, in a cape.)*
- [if kidsFree] **Darren:** We made you something! *(a hand-painted poster: "BEST STALL IN THE WORLD")*
- [if kidsNo] **Wei Ling:** My school project: "Why that stall is strict but fair." I got an A. Thank you, boss.
- **Narrator:** The rain stops. The uncle is gone. His umbrella is still hooked on the counter.
- **Narrator:** The name tag on the handle says: TAN.
- **Caption:** 下集: fire.

## Ep 12 · Day 24 · Fire! 《火灾》 (the signature scene)
**Cast:** Makcik, Aunty Lim, Ah Gong, exercise aunties, Kenneth · **When:** mid
- **Makcik:** API! API! Fire!
- **Narrator:** Smoke pours out of the next stall. Everyone panics. Except one person.
- **Aunty Lim:** *(still eating char kway teow)* Wah, fire ah? 等我吃完先.
- **Choice:**
  - Grab the fire extinguisher → flag `fireHero`, fame +5.
  - Save the TIN first → flag `savedTin`. **Narrator:** Across the road, Kenneth sees you run out hugging it.
- **Narrator:** But Ah Gong is already there. Retired bus captain. Fire-safety certified. Whoosh. Done.
- **Aunty Lim:** *(finally looks up at him)* …Not bad.
- **Narrator:** Ah Gong turns red. Not from the fire.
- **Narrator:** Kenneth is there too, soot on his face, holding a bucket.
- **Kenneth:** My father's stall cannot burn.
- **{owner}:** …Your *father's* stall?
- **Caption:** 下集: a 30-year-old crossword.

## Ep 13 · Day 26 · The Crossword 《填字游戏》
**Cast:** Ah Gong, Aunty Lim · **When:** start
- **Narrator:** Ah Gong waves you over. He hands you a folded crossword.
- **Ah Gong:** 三十年. Same crossword every day. Today I finish it.
- **Narrator:** The answers down the side spell: L-I-M · K-O-P-I · W-I-T-H · M-E.
- **Ah Gong:** You… bring to her. With kopi O.
- **Choice:**
  - Deliver it with his kopi O → fame +1.
  - Deliver it with her teh C siew dai, made perfect → flag `cupid`, fame +3.
- **Narrator:** Aunty Lim reads it. Long pause.
- **Aunty Lim:** 等我吃完先.
- **Narrator:** She finishes. Then she sits down at Ah Gong's table. First time anyone has shared it since 1987.
- [if cupid] **Aunty Lim:** Your matchmaking: 10 out of 10. Your teh: still counting.
- **Caption:** 下集: it's raining again. Kenneth says "Pa?"

## Ep 14 · Day 28 · Father and Son 《父子》
**Cast:** Kenneth, Rain Uncle → Uncle Tan · **When:** end
- **Narrator:** Kenneth comes alone. No sunglasses.
- **Kenneth:** I did homework at that back table too. Every day till eighteen. Then I told him kopi stall is a dead end. And I left.
- **Narrator:** Thunder. An umbrella shakes off at the counter.
- **Kenneth:** …Pa?
- **Uncle Tan:** Day 30 never reach yet. Why everybody so kan cheong?
- **Narrator:** The rain uncle was Uncle Tan all along, checking on his stall. And on you.
- **Choice:**
  - Give them the back table and leave them alone → flag `familyTable`, fame +2.
  - Make them two cups, on the house → flag `twoCups`, fame +3, money −$3.
- **Uncle Tan:** Day 30, open the tin. Then you decide, Kenneth.
- **Caption:** 下集 (大结局): open the tin.

## Ep 15 · Day 30 · The Tin 《铁罐》 (finale)
**Cast:** everyone · **When:** end
- **Narrator:** Everyone is here. Aunty Lim with her red notebook. Kenneth with a contract. Uncle Tan with his towel.
- **Uncle Tan:** Open lah.
- **Narrator:** Inside the tin: a 20-cent coin, a crayon drawing of the stall signed "KENNETH, 7", and a note.
- **Note:** "The secret recipe: remember who drinks it."
- **Uncle Tan:** 1994. A small boy came, short twenty cents for his first Milo. I let him owe.
- **Kenneth:** …That was me.
- [if kidsOwe] **Uncle Tan:** *(to you)* I heard you did the same thing. Good.
- **Kenneth:** *(tears up the contract)* BrewDynasty doesn't need this corner.
- **Aunty Lim:** *(opens the notebook)* Final score.
- *fame ≥ 70:* **Aunty Lim:** 10 out of 10. **Kenneth:** Then… could BrewDynasty use a partner? Your stall. A second branch. → **ending "Empire Begins"** (sets up month 2 / the second stall)
- *fame 40–69:* **Aunty Lim:** 8 out of 10. Lease is yours. **Kenneth:** I'll be back. As a customer. → **ending "Our Stall"**
- *fame < 40:* **Aunty Lim:** 7 out of 10. Lease is yours, can improve. Next month I want 10. → **ending "Still Brewing"**
- *Epilogue (one line each, shown if the flag is set):*
  - [marcusJob] **Marcus:** New job! Kopi C — WITH sugar today. Celebration. Doctor don't know.
  - [marcusHelper] **Marcus:** Boss, I did your accounts. You're 12% more profitable than BrewDynasty. Per cup.
  - [makcikFriend] **Makcik:** Nasi lemak for everybody!
  - [cupid] **Narrator:** Ah Gong and Aunty Lim share one newspaper now.
- **Oyen:** Meow. *(knocks the tin off the counter: tax)*
- **Caption:** Month 1 · 完. The empire starts with one cup.

---

## New glossary entries needed
chope, kan cheong, api, ikan bilis, nasi lemak, char kway teow, qigong, makcik, retrenched, ang pow (if used), 有进步空间, 等我吃完先, 房东, 有心. Also each episode title's 中文.

## Art needed for the cast
| Who | Art | Status |
|---|---|---|
| Kai (food vlogger) | backlog-rare-2 (middle) | cut out from the existing sheet |
| Rain Uncle / Uncle Tan | backlog-rare-2 (right) | cut out |
| Inspector | backlog-rare (right) | cut out |
| Taxi Uncle | backlog-morning (middle) | cut out, crop the taxi |
| Exercise aunties | backlog-morning (left) | cut out (group) |
| Makcik | backlog-afternoon (right) | cut out, crop the stall |
| Kenneth (rival manager) | backlog-rare-2 (left) | cut out; monogram painted out (plain briefcase) |
| Note / Narrator | none | text cards |
