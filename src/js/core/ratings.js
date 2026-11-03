// Shared self-assessment state (slide 2), read by the roadmap (slide 3)
// and the next-steps panel (slide 11). Stored only in this browser.

import { SKILLS } from '../content/skills.js';

const STORAGE_KEY = 'guitar-journey:ratings:v1';
const DEFAULT_VALUE = 2;

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (raw && typeof raw.values === 'object') return raw;
  } catch { /* storage unavailable or corrupt: fall back to defaults */ }
  return null;
}

function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function clamp(v) {
  return Math.min(5, Math.max(1, Math.round(Number(v)) || DEFAULT_VALUE));
}

class Ratings extends EventTarget {
  constructor() {
    super();
    const stored = load();
    this.rated = Boolean(stored?.rated);
    this.values = Object.fromEntries(SKILLS.map((s) => [s.id, clamp(stored?.values?.[s.id] ?? DEFAULT_VALUE)]));
  }

  set(id, value) {
    this.values[id] = clamp(value);
    this.rated = true;
    this.#commit();
  }

  reset() {
    for (const s of SKILLS) this.values[s.id] = DEFAULT_VALUE;
    this.rated = false;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    this.dispatchEvent(new Event('change'));
  }

  /** Skills sorted weakest first (ties keep the SKILLS order). */
  weakest(n) {
    return [...SKILLS].sort((a, b) => this.values[a.id] - this.values[b.id]).slice(0, n);
  }

  extremes() {
    const vals = SKILLS.map((s) => this.values[s.id]);
    const hi = Math.max(...vals), lo = Math.min(...vals);
    return {
      high: hi === lo ? [] : SKILLS.filter((s) => this.values[s.id] === hi),
      low: hi === lo ? [] : SKILLS.filter((s) => this.values[s.id] === lo),
    };
  }

  #commit() {
    save({ rated: this.rated, values: this.values });
    this.dispatchEvent(new Event('change'));
  }
}

export const ratings = new Ratings();
