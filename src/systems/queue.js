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
// window (minutes after opening; the day is 720 minutes, 7am -> 7pm), plus walk-ins so the total
// comes to `total`. Regulars -> { at, id }, walk-ins -> { at, id: null }.
// The first walk-in always comes right at `start`. The rest come in little rushes (rushGap ms apart,
// 1-3 at a time), each one dropped into the longest quiet stretch left between the arrivals so far
// (playtest round 3: the regulars bunch up late, and an even spread left the afternoon empty).
export function daySchedule({ total, regulars, dayMs, start, end, jitter, rushGap = 0, rushMax = 3, rand = Math.random }) {
  const msPerMin = dayMs / 720;
  const regs = regulars.map(({ id, window: [from, to] }) => {
    const at = (from + rand() * (to - from)) * msPerMin;
    return { at: Math.round(Math.max(start, Math.min(end, at))), id };
  });
  let left = Math.max(0, total - regs.length);
  const walkIns = [];
  if (left) {
    walkIns.push(start); // nobody waits long for the first customer (regulars keep their own time)
    left -= 1;
  }
  while (left > 0) {
    const r = rand();
    const size = Math.min(left, !rushGap ? 1 : r < 0.35 ? 1 : r < 0.75 ? 2 : r < 0.92 || rushMax < 4 ? 3 : 4);
    // the longest gap between everyone placed so far (and the end of the day)
    const times = [...regs.map((a) => a.at), ...walkIns, end].sort((a, b) => a - b);
    let gapAt = start;
    let gapLen = -1;
    for (let i = 0, prev = start; i < times.length; prev = times[i++]) {
      if (times[i] - prev > gapLen) [gapAt, gapLen] = [prev, times[i] - prev];
    }
    const spread = (size - 1) * rushGap;
    const mid = gapAt + (gapLen - spread) / 2 + (rand() * 2 - 1) * Math.min(jitter, 0.1) * gapLen;
    for (let j = 0; j < size; j++) walkIns.push(Math.round(Math.max(start, Math.min(end, mid + j * rushGap))));
    left -= size;
  }
  return [...regs, ...walkIns.map((at) => ({ at, id: null }))].sort((a, b) => a.at - b.at);
}
