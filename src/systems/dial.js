// The timing dial for the Sugar Scoop, Milk Pump and gula melaka bottle: drop the tool on a cup, a needle
// sweeps back and forth over the pour bar's zones, tap to stop, and the cup gets exactly the middle of the
// zone it stopped in (so anywhere inside NORMAL is a perfect NORMAL). Pure, no Phaser.

// Where the needle is after ms: 0 -> max -> 0 -> ..., one way every sweepMs.
export function needleAt(ms, max, sweepMs) {
  const phase = (ms % (sweepMs * 2)) / sweepMs;
  return (phase <= 1 ? phase : 2 - phase) * max;
}

// The zone ([label, from, to, kind]) the value sits in; past the end counts as the last one.
export const zoneAt = (zones, v) => zones.find(([, a, b]) => v >= a && v < b) ?? zones.at(-1);

// The dial's zones: the pour bar's, with the red "too much" zone cut short so overshooting is rare.
export function dialZones(zones, redWidth = 0.12) {
  return zones.map((z, i) => (i === zones.length - 1 && z[3] === 'bad' ? ['✕', z[1], z[1] + redWidth, z[3]] : z));
}

// How much of the ingredient to add when the needle stops at v, given the cup's current measure
// (sweetness, or evap for the pump). Never takes anything out.
export function doseFor(zones, v, current) {
  const [, a, b, kind] = zoneAt(zones, v);
  if (kind === 'none') return 0; // KOSONG / NONE (O): nothing goes in
  return Math.max(0, (a + b) / 2 - current);
}
