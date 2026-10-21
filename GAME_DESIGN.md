# Game Design: Kopi Stall Empire (working title)

## Pitch
Run a humble kopi stall in a Singapore kopitiam. Serve uncles, aunties, office
workers and kids their oddly specific kopi orders, enjoy the small daily drama,
and slowly grow from one stall into a kopi empire across Singapore.

Target audience: Chinese-speaking and Singlish-speaking players in Singapore and
Malaysia, plus anyone curious about kopitiam culture.

## Core loop
1. Day phase: customers walk up, an order bubble appears, player taps ingredients
   to build the drink, serves it, gets paid + a happiness score.
2. Drama events pop in randomly during the day (see list below).
3. Night phase: spend earnings on upgrades, new drinks, decor.
4. Progression (post v0.1): one stall -> a full kopitiam -> a chain across
   neighbourhoods (Toa Payoh -> Tiong Bahru -> Jurong ...).
5. Regulars have small storylines that develop over many days.

## Kopi grammar (order parsing rules)
Base: Kopi (coffee) or Teh (tea)
- (none)  = condensed milk (sweet)
- O       = no milk, with sugar
- C       = evaporated milk + sugar
- kosong  = no sugar
- siew dai = less sugar
- ga dai  = more sugar
- gao     = thicker / stronger
- poh     = thinner / lighter
- peng    = iced
- tapau / da bao = takeaway

Examples: "Kopi O kosong" = black, no sugar. "Teh C siew dai peng" = tea with
evaporated milk, less sugar, iced.

## v0.1 drinks (6)
1. Kopi
2. Kopi O
3. Kopi C
4. Teh
5. Teh C
6. Milo Dinosaur (iced Milo topped with Milo powder)
Modifiers available in v0.1: kosong, siew dai, peng.

## v0.1 cast (6)
| Character | Signature order | Language mix | Hook |
|---|---|---|---|
| Ah Gong with newspaper | Kopi O, "same as usual" | Mandarin + Hokkien | Reads paper for hours on one drink, argues with the radio |
| Aunty Lim | Teh C siew dai | Singlish + Mandarin | Star of the fire event; unbothered by everything |
| Office guy with lanyard | Kopi C kosong, "fast fast" | Singlish + English | On a work call while ordering; speed pressure |
| Tourist | "Coffee, no milk, no sugar?" | English | Player learns/translates lingo naturally |
| Sec school kids (group) | 4x Milo Dinosaur | Singlish + Mandarin | Short by 20 cents, counting coins together |
| Oyen (orange cat) | none | meows | Steals kaya toast, sleeps in the cashier drawer |

Owner / player character: Uncle Tan (white singlet, towel on shoulder).

Sample lines:
- Ah Gong: "老板, kopi o 一杯, 不要太甜 ah."
- Office guy: "Boss, kopi C kosong, fast fast can?"
- Tourist: "Hi, could I get a coffee with milk, please?"
- Aunty Lim: "Wah, fire ah? 等我吃完先."

## v0.1 drama events (8)
1. Kitchen fire: everyone panics, Aunty Lim keeps eating char kway teow calmly.
2. Oyen steals a kaya toast; player can chase or let it go.
3. Tissue-packet "chope" dispute over a table.
4. Sudden heavy rain: a rush of customers sheltering.
5. Power trip during lunch rush.
6. Sec school kids short 20 cents: let them owe you, or not.
7. Tourist "kosong" confusion: pick the right translation.
8. Pigeon raid on an empty table.
Events should mostly be funny and give small choices with gentle consequences
(happiness, tips, a regular remembering your kindness).

## Night phase upgrades (v0.1)
- Faster kettle (shorter brew time)
- Unlock a new drink
- Second table (more customers)
- Decor item (small happiness boost)

## Full cast backlog (post v0.1)
Morning: Ah Ma with trolley bag, morning exercise aunties (3), taxi uncle,
construction worker.
Lunch: office lady (photographs drink), Grab rider (multi-order), new PR/expat
practising Singlish.
Afternoon: NSF in uniform, tuition mum with kid, retired uncle with birdcage
(bird learns orders), makcik from the next stall (food swap friendship).
Evening: beer uncles, young couple on a date, night shift nurse, food blogger.
Rare: uncle with Toto ticket, Ah Beng with modified scooter, hygiene inspector,
rival kopi chain manager, Ah Ma's grandson (helps stall go viral), mysterious
uncle in white singlet who only appears when it rains.
Animals: Oyen, pigeons, mynah birds.

## Language plan
v0.1: Singlish, English, Mandarin mixed per character. Glossary pop-up for every
local term. Later: optional Hokkien/Cantonese voice shouts, Malaysia mamak mode,
HK/GZ cha chaan teng mode.

## Monetization (later)
- Free web demo on itch.io (and shared via TikTok / Xiaohongshu clips)
- Full version as a cheap paid game (~US$5) on itch.io, maybe Steam later
- Possible sponsor tie-in with a local kopi brand

## Main risk
Scope creep. Version 1 = one neighbourhood, 30 in-game days. Park everything
else in IDEAS.md.
