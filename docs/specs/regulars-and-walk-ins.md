# Spec (TODO, next session): regulars vs. random walk-ins

Status: NOTED 2026-10-23 from the user's playtest. Not designed in detail or built yet. Do it in a new session.

## The idea (user's words, tidied)
- **Random people first.** Most customers in a day are random walk-ins: different faces, random orders from
  whatever recipes are unlocked.
- **The story cast are regulars.** Aunty Lim, Marcus, Ah Gong, the kids (and later Makcik, Taxi Uncle…) come
  every day, at about their usual time, with their usual order, because they have their own preference.
  - Aunty Lim: Teh (later Teh siew dai, Teh C siew dai once taught)
  - Marcus: Kopi (then Kopi C kosong, "fast fast")
  - Ah Gong: Kopi O at the table, every morning
  - the kids: Milo Dinosaur after school
- **Random walk-ins need different sprites.** Several generic customers (office worker, auntie, uncle, student,
  tourist, NSF…), ideally with colour variants so the crowd doesn't repeat.

## Things to decide when building
1. How many regulars a day vs walk-ins (e.g. each regular once a day + walk-ins fill the rest of the fame count)?
2. When each regular comes (Ah Gong morning, Marcus lunch rush, kids after school ~3pm, Aunty Lim teatime) —
   ties nicely into the clock's day periods.
3. Do regulars' orders evolve as recipes unlock (Aunty: Teh → Teh siew dai) or stay fixed per story?
4. Does serving a regular perfectly build a small "friendship" meter (callbacks in the story)?
5. Walk-in art: which generic sprites to ask for (add to docs/art/ASSET_LIST.md), and how many variants.
6. The recipe calendar's teachers stay the regulars (lesson day = their new order).

## Rough tasks
- [ ] Data: `regular: true` + `schedule` (time window) + `usual` order list in src/data/customers.js
- [ ] Walk-in pool: generic customer defs with random orders from unlocked recipes
- [ ] Arrival schedule: regulars at their time + walk-ins spread over the day (systems/queue.js arrivalSchedule)
- [ ] Art list update + placeholder sprites until the art arrives
- [ ] Tests (schedule, order picking), browser check, playtest
