// Practice-plan recommendation logic. Pure and deterministic: the same
// ratings, goal and duration always give the same plan. No DOM access, so
// it is shared by the planner (slide 10) and the summary (slide 11), and
// unit-tested with node --test.
//
// How a plan is built (also shown to the viewer on slide 10):
//  1. The duration picks a fixed block layout (warm-up, focus, support,
//     application, and a short recording for 45+ minutes).
//  2. Focus skill = highest score among the skills that serve the goal:
//       score = 0.6 × goal relevance + 0.4 × need,  need = (5 − rating) / 4
//     The goal leads; weaknesses break ties and shift the choice.
//  3. Support skill = a weak foundation (rhythm or technique rated ≤ 2) if
//     there is one, otherwise the next-best scoring skill.
//  4. Application = playing real music for the goal (a song, a solo, a jam).
//  5. Exercises are matched to the skill's rating; goal-specific variants
//     (e.g. bends for lead) are preferred.
// It is a practical starting point, not an optimised training programme.

import { SKILLS } from '../content/skills.js';
import { EXERCISES, WARMUP, REFLECT, APPLICATIONS, GOALS, DURATIONS } from '../content/exercises.js';

export const SCORE_WEIGHTS = { relevance: 0.6, need: 0.4 };
export const FOUNDATIONS = ['rhythm', 'technique'];
export const WEAK = 2;

// How strongly each skill serves each goal (0 = not a focus candidate).
export const GOAL_RELEVANCE = {
  general: { technique: 0.5, rhythm: 0.5, fretboard: 0.5, ear: 0.5, improv: 0.5, repertoire: 0.5, creativity: 0.5, tone: 0.5 },
  rhythm: { rhythm: 1, technique: 0.3, ear: 0.2 },
  lead: { technique: 1, fretboard: 0.7, improv: 0.5, ear: 0.3, tone: 0.3 },
  songs: { rhythm: 0.6, ear: 0.5, technique: 0.3 },
  improv: { fretboard: 0.8, ear: 0.7, creativity: 0.4 },
};

// The skill the application block already trains (excluded from focus).
const APPLICATION_SKILL = { general: 'repertoire', rhythm: 'repertoire', lead: 'repertoire', songs: 'repertoire', improv: 'improv' };

// [block kind, minutes]; every layout sums to its duration.
export const LAYOUTS = {
  15: [['warmup', 2], ['focus', 7], ['application', 6]],
  30: [['warmup', 3], ['focus', 11], ['support', 7], ['application', 9]],
  45: [['warmup', 4], ['focus', 15], ['support', 10], ['application', 12], ['reflect', 4]],
  60: [['warmup', 5], ['focus', 20], ['support', 13], ['application', 17], ['reflect', 5]],
};

export const BLOCK_LABELS = { warmup: 'חימום', focus: 'מיקוד', support: 'חיזוק', application: 'יישום במוזיקה', reflect: 'הקלטה ומשוב' };

const skillById = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
const goalById = Object.fromEntries(GOALS.map((g) => [g.id, g]));
const DEFAULT_LEVEL = 2;

export function scoreSkills(ratings, goalId) {
  const relevance = GOAL_RELEVANCE[goalId];
  return SKILLS.map((s, order) => {
    const r = ratings.values[s.id];
    const need = ratings.rated ? (5 - r) / 4 : 0.5;
    const rel = relevance[s.id] ?? 0;
    return { id: s.id, order, rating: r, relevance: rel, need, score: SCORE_WEIGHTS.relevance * rel + SCORE_WEIGHTS.need * need };
  });
}

const byScore = (a, b) => b.score - a.score || b.relevance - a.relevance || a.order - b.order;

/** Pick an exercise for a skill at a level, preferring goal-specific ones. */
export function pickExercise(skillId, level, goalId, exclude = []) {
  const pool = EXERCISES.filter((e) => e.skill === skillId && !exclude.includes(e.id));
  const fits = (e, l) => l >= e.levels[0] && l <= e.levels[1];
  const ranked = (list) =>
    list.find((e) => e.goals?.includes(goalId)) ?? list.find((e) => !e.goals) ?? list[0];
  return ranked(pool.filter((e) => fits(e, level))) ?? ranked(pool.filter((e) => fits(e, Math.min(5, level + 1)))) ?? ranked(pool) ?? null;
}

function chooseSkills(ratings, goalId) {
  const appSkill = APPLICATION_SKILL[goalId];
  const scored = scoreSkills(ratings, goalId).filter((s) => s.id !== appSkill);
  const candidates = scored.filter((s) => s.relevance > 0).sort(byScore);
  const focus = candidates[0];

  const weakFoundation = ratings.rated
    ? FOUNDATIONS.map((id) => scored.find((s) => s.id === id))
        .filter((s) => s.id !== focus.id && s.rating <= WEAK)
        .sort((a, b) => a.rating - b.rating)[0]
    : undefined;
  const support = weakFoundation ?? candidates[1] ?? scored.filter((s) => s.id !== focus.id).sort(byScore)[0];
  return { focus, support, supportIsFoundation: Boolean(weakFoundation), appSkill };
}

function levelOf(ratings, skillId) {
  return ratings.rated ? ratings.values[skillId] : DEFAULT_LEVEL;
}

function focusReason(goal, s, rated) {
  const skill = skillById[s.id];
  const link = s.relevance >= 0.7 ? 'נשענת ישירות על' : 'נעזרת ב';
  if (!rated) return `המטרה שבחרתם (${goal.name}) ${link}${skill.name}. עוד לא דירגתם את עצמכם, ולכן הבחירה מבוססת על המטרה בלבד.`;
  const tail = s.rating <= WEAK ? ' — כאן יש הכי הרבה מקום לשיפור.' : s.rating >= 4 ? ' — זה כבר חזק אצלכם, ולכן התרגיל מתקדם יותר.' : '.';
  return `המטרה שבחרתם (${goal.name}) ${link}${skill.name}, ודירגתם אותו ${s.rating}/5${tail}`;
}

function supportReason(s, isFoundation, rated) {
  const skill = skillById[s.id];
  if (isFoundation) return `${skill.name} הוא יסוד לכל השאר, ודירגתם אותו ${s.rating}/5 — כדאי לתחזק אותו בכל אימון, גם כשהמטרה אחרת.`;
  if (!rated) return `${skill.name} הוא הכישור הבא שמשרת את המטרה.`;
  return `${skill.name} הוא הכישור הבא שהכי משרת את המטרה, לפי הדירוג שלכם (${s.rating}/5).`;
}

/**
 * @param {{ values: Record<string, number>, rated: boolean }} ratings
 * @param {{ minutes: number, goal: string }} choice
 */
export function buildPlan(ratings, { minutes, goal }) {
  if (!LAYOUTS[minutes]) throw new Error(`unsupported duration ${minutes}`);
  if (!GOAL_RELEVANCE[goal]) throw new Error(`unknown goal ${goal}`);
  const goalInfo = goalById[goal];
  const { focus, support, supportIsFoundation, appSkill } = chooseSkills(ratings, goal);

  const blocks = [];
  for (const [kind, mins] of LAYOUTS[minutes]) {
    if (kind === 'warmup') {
      blocks.push({ kind, minutes: mins, exercise: WARMUP, skill: null, reason: 'מכין את הידיים ומונע מתח מיותר לפני העבודה (שקף 4).' });
    } else if (kind === 'reflect') {
      blocks.push({ kind, minutes: mins, exercise: REFLECT, skill: null, reason: 'משוב: הקלטה חושפת דברים שלא שומעים תוך כדי נגינה, ומאפשרת למדוד התקדמות לאורך זמן (שקפים 5 ו-10).' });
    } else if (kind === 'focus') {
      const level = levelOf(ratings, focus.id);
      const main = pickExercise(focus.id, level, goal);
      const reason = focusReason(goalInfo, focus, ratings.rated);
      // longer sessions split the focus block: main exercise + a stretch variant
      const stretch = minutes >= 45 ? pickExercise(focus.id, Math.min(5, level + 1), goal, [main.id]) : null;
      if (stretch) {
        const first = Math.ceil(mins / 2);
        blocks.push({ kind, minutes: first, exercise: main, skill: focus.id, reason });
        blocks.push({ kind, minutes: mins - first, exercise: stretch, skill: focus.id, reason: 'המשך לאותו כישור בתרגיל קרוב, מעט מאתגר יותר.' });
      } else {
        blocks.push({ kind, minutes: mins, exercise: main, skill: focus.id, reason });
      }
    } else if (kind === 'support') {
      const exercise = pickExercise(support.id, levelOf(ratings, support.id), goal);
      blocks.push({ kind, minutes: mins, exercise, skill: support.id, reason: supportReason(support, supportIsFoundation, ratings.rated) });
    } else if (kind === 'application') {
      const exercise = APPLICATIONS[goal] ?? pickExercise(appSkill, levelOf(ratings, appSkill), goal);
      blocks.push({ kind, minutes: mins, exercise, skill: exercise.skill, reason: 'מחברים את התרגול למוזיקה אמיתית — כך תרגיל הופך לנגינה (שקף 9).' });
    }
  }

  return {
    minutes,
    goal,
    goalName: goalInfo.name,
    rated: ratings.rated,
    focusSkill: focus.id,
    supportSkill: minutes >= 30 ? support.id : null,
    blocks,
  };
}

/** A readable plain-text version (for the "copy" button). */
export function planToText(plan) {
  const lines = [
    `אימון גיטרה של ${plan.minutes} דקות · מטרה: ${plan.goalName}`,
    plan.rated ? '' : '(ללא דירוג עצמי — מבוסס על המטרה והזמן בלבד)',
    '',
  ];
  plan.blocks.forEach((b, i) => {
    lines.push(`${i + 1}. ${BLOCK_LABELS[b.kind]} · ${b.minutes} דק׳ — ${b.exercise.title}`);
    b.exercise.steps.forEach((s) => lines.push(`   • ${s}`));
    lines.push(`   ✓ ${b.exercise.success}`);
    lines.push(`   למה: ${b.reason}`);
    lines.push('');
  });
  lines.push('נקודת פתיחה, לא תוכנית מדעית: התאימו את הזמנים והתרגילים לפי מה שאתם שומעים ומרגישים.');
  return lines.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
}

export { GOALS, DURATIONS };
