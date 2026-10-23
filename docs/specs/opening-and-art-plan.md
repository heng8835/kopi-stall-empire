# Plan: opening cutscene, 20 walk-ins, Horlicks tin, music (2026-10-23)

Status: PLAN. Art comes first (user makes it in ChatGPT), then I build the cutscene + swap the walk-ins in.
Art rules as always: `docs/ART_BIBLE.md`, no brand logos/text, no flags, no landmark mascots.

## 1. Opening cutscene (first time only, after picking Jun/Mei, before the tutorial)

Five tap-through panels, about 40 seconds, with a Skip button. Narration box at the bottom like the episodes.
Then the stall background, and Ep 1 "The Note on the Pot" carries on as now.

| # | Background | What happens (narration, {name} = Jun/Mei) |
|---|---|---|
| 1 | **A. Estate at dawn** | Pastel dawn over HDB blocks; a corner kopitiam, shutters down. "Every estate has one. A corner kopitiam, a kopi stall, and an uncle who knows your order before you say it." |
| 2 | **B. Flashback: the back table** (warm, faded) | A school bag and homework on the stall's back table, a steaming cup of teh. Uncle Tan seen only as hands pulling teh (keeps the Rain Uncle secret). "{name} grew up at this table. Homework, kaya toast, and Uncle Tan's teh." |
| 3 | **C. Office cubicle** (grey, flat light) | The owner at a desk with a sad paper cup. "Years later: a corporate internship. The office kopi tasted like sadness." |
| 4 | C again + phone drawn in code | A chat bubble on the phone: "Uncle Tan: Ah Boy/Ah Girl, I retire liao. Stall is yours. Come tomorrow 6am. Oyen hungry." |
| 5 | **D. Shutter up at sunrise** | Same corner as A, golden morning, shutter half rolled up. The owner walks in. Big text: "Day 1". |

**Backgrounds needed: 4** (A, B, C, D). D is easiest as a ChatGPT edit of A ("same picture, sunrise, shutter half up"),
so it matches. Optional 5th: the owner's HDB bedroom at night for panel 4 (otherwise the phone sits over C).
Size: portrait, ChatGPT 1024x1536; keep the important things inside the middle 85% (the game crops to 9:16 like `stall.webp`).
No new character art is required (owner sprites exist; Uncle Tan is only hands). Nice extra: the owner, sitting, sad (for C).

## 2. Twenty walk-in customers (the neighbourhood crowd)

Simple, friendly, a bit generic is fine. Standing, facing the counter, same size and style as the cast.
Each gets 3 colour tints in code, so 20 kinds give about 60 looks. They must not look like the story cast
(no singlet + towel = Rain Uncle, no lanyard = Marcus, no floral headscarf = Makcik). Make them 4 per image like the earlier packs.

| # | Key | Who | Look | Usual drinks |
|---|---|---|---|---|
| 1 | walkOfficeLady | Office lady | blouse, tote bag, phone | Kopi C kosong, Teh C siew dai |
| 2 | walkOfficeGuy | Office guy | rolled sleeves, loose tie, no lanyard | Kopi O, Kopi |
| 3 | walkUncle | Neighbourhood uncle | polo tee, bermudas, slippers, folded newspaper | Kopi O, Kopi ga dai |
| 4 | walkAuntie | Market auntie | floral blouse, market trolley bag | Teh, Teh siew dai |
| 5 | walkPakcik | Pakcik | songkok, batik shirt | Teh O, Teh |
| 6 | walkSpecsUncle | Indian uncle | short-sleeve shirt, spectacles, thermos flask | Teh C, Kopi |
| 7 | walkStudent | Sec school boy | white school uniform, backpack | Milo, Milo peng |
| 8 | walkJCGirl | JC girl | plain school uniform (no crest), notes in a tote | Teh peng, Horlicks peng |
| 9 | walkNSF | NSF | plain green uniform (no badges), beret, duffel bag | Milo Dinosaur, Kopi peng |
| 10 | walkWorker | Construction worker | hi-vis vest, hard hat, boots | Kopi peng, Kopi ga dai |
| 11 | walkRider | Delivery rider | plain-colour jacket, helmet, insulated bag, no logo | Kopi peng |
| 12 | walkAhMa | Ah Ma | cardigan, walking cane | Horlicks, Teh siew dai |
| 13 | walkMum | Young mum | baby carrier, diaper bag | Teh siew dai, Milo |
| 14 | walkJogger | Jogger | sports tee, headband, earphones | Kopi O kosong peng |
| 15 | walkUni | Uni student | hoodie, laptop under arm, sleepy | Kopi C, Kopi O kosong |
| 16 | walkHipster | Hipster | beanie, film camera, tote | Kopi O kosong ("I want to taste the bean") |
| 17 | walkTourist | Backpacker | sun hat, big backpack, paper map | Kopi (points at the menu) |
| 18 | walkGuard | Security guard | plain uniform and cap, tired after night shift | Kopi ga dai |
| 19 | walkNurse | Nurse | scrubs, after night shift | Kopi C ga dai, Milo |
| 20 | walkHawker | Hawker from next door | apron, bandana, spatula | Teh O peng |

Once the art lands, each becomes one line in `WALK_INS` (`src/data/customers.js`) plus a few lines in `lines.js`.
The four built today (office worker, uncle, student, auntie) map to #2, #3, #7, #4.
Later: walk-in pairs/groups (office colleagues, an elderly couple).

## 3. Horlicks tin

Yes, it needs art: today it's a plain tan box drawn in code. Ask for **`toolHorlicks`**: an upright malted-drink tin,
cream with a brown lid, a small cup drawing on the label, **no text or logo** (Horlicks is a brand). Same size and angle
as the Milo tin. Its pour pose is already on the list (ASSET_LIST 1.1).

## 4. Background music (later)

| Track | Mood | Loop |
|---|---|---|
| Title | warm, a little nostalgic | 60–90 s |
| Stall day | chill lo-fi kopitiam: guitar/ukulele, light percussion, a touch of erhu | 2–3 min |
| Lunch rush (optional) | same tune, a bit faster | 1–2 min |
| Night shop / day summary | calm evening | 1–2 min |
| Story: warm | gentle, for the heart-felt beats | 1 min |
| Story: comic tension | sneaky/plucky, for Kenneth, the inspector, Oyen | 1 min |
| Finale | the title tune, full and emotional | 2 min |
| Stings | episode title "dun dun" (短剧 style), 下集 sting | 2–3 s each |

Source: royalty-free music with a commercial licence (itch.io asset packs, or a music generator on a plan that
grants commercial rights). No copyrighted songs. Format: `.m4a` + `.ogg`, about 5 MB in total. A music
volume/mute next to the existing sound toggle, music ducks under story scenes.
