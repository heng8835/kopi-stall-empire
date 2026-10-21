// Tiny localStorage wrapper. Storage can be missing or throw (private mode, blocked site data),
// so every access is guarded and the game works without it.
const PREFIX = 'kopiStall.';

export function load(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable: fine, nothing persists */
  }
}
