// The line of customers waiting by the rope posts when the counter is full. Pure rules, no Phaser.
// First come, first served: nobody skips past the front, so a group (who needs the whole
// counter) holds everyone behind it until the counter clears.

// Where a new arrival goes: 'counter', 'queue', or null (queue full, try again later).
export function placeArrival({ freeSpots, totalSpots, lineLength, max, group = false }) {
  if (lineLength === 0 && freeSpots >= (group ? totalSpots : 1)) return 'counter';
  if (lineLength < max) return 'queue';
  return null;
}

// The front of the line, if the free spots are enough for it; otherwise null.
export function frontCanTake(line, freeSpots, totalSpots) {
  const front = line[0];
  if (!front) return null;
  return freeSpots >= ((front.whole ?? front.n > 1) ? totalSpots : 1) ? front : null; // whole = a group (not a bulk rider)
}

// Arrival times (ms) for a day: n arrivals spread evenly between start and end, each nudged by
// up to +-jitter of its share, kept in order. rand() returns 0..1.
export function arrivalSchedule(n, start, end, jitter, rand = Math.random) {
  const share = (end - start) / n;
  const times = [];
  for (let i = 0; i < n; i++) {
    const t = start + (i + 0.5) * share + (rand() * 2 - 1) * jitter * share;
    times.push(Math.round(Math.max(start, Math.min(end, t))));
  }
  return times.sort((a, b) => a - b);
}

// Pull evenly spread times together into rushes of 1-3: each rush starts at its first time.
export function bunch(times, gap, end, rand = Math.random) {
  if (!gap) return times;
  const out = [];
  for (let i = 0; i < times.length; ) {
    const r = rand();
    const size = r < 0.35 ? 1 : r < 0.75 ? 2 : 3;
    for (let j = 0; j < size && i < times.length; j++, i++) out.push(Math.min(end, times[i - j] + j * gap));
  }
  return out.sort((a, b) => a - b);
}

// A whole day's arrivals, sorted by time: each regular once, at a random moment inside their usual
// window (minutes after opening; the day is 720 minutes, 7am -> 7pm), plus walk-ins spread over the
// day so the total comes to `total`. Regulars -> { at, id }, walk-ins -> { at, id: null }.
// The first walk-in always comes right at `start`. Walk-ins come in little rushes (rushGap ms
// apart, 1-3 at a time) with calm in between, which plays better than an even trickle.
export function daySchedule({ total, regulars, dayMs, start, end, jitter, rushGap = 0, rand = Math.random }) {
  const msPerMin = dayMs / 720;
  const regs = regulars.map(({ id, window: [from, to] }) => {
    const at = (from + rand() * (to - from)) * msPerMin;
    return { at: Math.round(Math.max(start, Math.min(end, at))), id };
  });
  const walkIns = bunch(arrivalSchedule(Math.max(0, total - regs.length), start, end, jitter, rand), rushGap, end, rand).map((at) => ({ at, id: null }));
  if (walkIns[0]) walkIns[0].at = start; // nobody waits long for the first customer (regulars keep their own time)
  return [...regs, ...walkIns].sort((a, b) => a.at - b.at);
}
