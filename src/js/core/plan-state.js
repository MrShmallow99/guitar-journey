// Shared practice-plan state: the viewer's planner choices (duration,
// goal) and whether a plan has been generated. The plan itself is always
// derived from the current ratings + choices via buildPlan(), so slide 10
// and slide 11 can never disagree.

import { ratings } from './ratings.js';
import { buildPlan, GOALS, DURATIONS } from './planner.js';

const STORAGE_KEY = 'guitar-journey:plan:v1';
const DEFAULTS = { minutes: 30, goal: 'general', generated: false };

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (raw && typeof raw === 'object') return { ...DEFAULTS, ...raw };
  } catch { /* storage unavailable or corrupt */ }
  return { ...DEFAULTS };
}

class PlanState extends EventTarget {
  constructor() {
    super();
    const s = load();
    this.minutes = DURATIONS.includes(s.minutes) ? s.minutes : DEFAULTS.minutes;
    this.goal = GOALS.some((g) => g.id === s.goal) ? s.goal : DEFAULTS.goal;
    this.generated = Boolean(s.generated);
    ratings.addEventListener('change', () => this.dispatchEvent(new Event('change')));
  }

  /** The current plan, or null if the viewer hasn't generated one. */
  get plan() {
    return this.generated ? buildPlan(ratings, this) : null;
  }

  /** Same logic, used for suggestions even before a plan is generated. */
  preview(choice = this) {
    return buildPlan(ratings, choice);
  }

  update(patch) {
    Object.assign(this, patch);
    this.#commit();
  }

  reset() {
    Object.assign(this, DEFAULTS);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    this.dispatchEvent(new Event('change'));
  }

  #commit() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ minutes: this.minutes, goal: this.goal, generated: this.generated }));
    } catch { /* ignore */ }
    this.dispatchEvent(new Event('change'));
  }
}

export const planState = new PlanState();
