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
  return freeSpots >= (front.n > 1 ? totalSpots : 1) ? front : null;
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
