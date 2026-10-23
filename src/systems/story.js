// The month's story calendar: which episode plays when, which lines show, and what a choice
// changes. Pure rules; the episodes themselves are data in src/data/events.js and the
// overlay that plays them is scenes/DramaScene.js.

export const eventsFor = (events, day, when) => events.filter((e) => e.day === day && e.when === when);

// A beat's `if` is a flag name or a list of names (any one is enough).
export function shows(beat, flags) {
  if (!beat.if) return true;
  const set = flags instanceof Set ? flags : new Set(flags);
  return [].concat(beat.if).some((f) => set.has(f));
}

export const visibleBeats = (beats = [], flags = []) => beats.filter((b) => shows(b, flags));

// Apply a choice to { flags, fame, money } and return the new state (fame clamped 0-100).
export function applyChoice(state, option) {
  return {
    flags: [...new Set([...state.flags, ...(option.flags ?? [])])],
    fame: Math.max(0, Math.min(100, state.fame + (option.fame ?? 0))),
    money: state.money + (option.money ?? 0),
  };
}

// The finale's ending for this fame: the first band whose `min` the fame reaches (highest first).
export function endingFor(endings = [], fame) {
  return [...endings].sort((a, b) => b.min - a.min).find((e) => fame >= e.min) ?? null;
}

// Fill {owner}, {rating}, ... in a line.
export const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));

// Every beat an episode can show, in order: lines, the chosen option's reply, the lines after,
// the ending for this fame. Used by the overlay and the data tests.
export function scriptFor(ep, { flags = [], fame = 0, option = null }) {
  const out = [...visibleBeats(ep.beats, flags)];
  if (option) out.push(...visibleBeats(option.beats, flags));
  out.push(...visibleBeats(ep.after, flags));
  const ending = endingFor(ep.endings, fame);
  if (ending) out.push(...visibleBeats(ending.beats, flags));
  out.push(...visibleBeats(ep.epilogue, flags));
  return out;
}
