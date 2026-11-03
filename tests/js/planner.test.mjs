// Unit tests for the practice-plan logic (pure module, runs in Node).
//   npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, planToText, LAYOUTS, scoreSkills, GOALS, DURATIONS } from '../../src/js/core/planner.js';
import { SKILLS } from '../../src/js/content/skills.js';
import { EXERCISES } from '../../src/js/content/exercises.js';

const profile = (overrides = {}, rated = true) => ({
  rated,
  values: Object.fromEntries(SKILLS.map((s) => [s.id, overrides[s.id] ?? 3])),
});
const focusOf = (plan) => plan.blocks.find((b) => b.kind === 'focus');
const kinds = (plan) => plan.blocks.map((b) => b.kind);

test('every layout sums to its duration', () => {
  for (const m of DURATIONS) {
    assert.equal(LAYOUTS[m].reduce((n, [, mins]) => n + mins, 0), m);
    for (const g of GOALS) {
      const plan = buildPlan(profile(), { minutes: m, goal: g.id });
      assert.equal(plan.blocks.reduce((n, b) => n + b.minutes, 0), m, `${m}/${g.id}`);
    }
  }
});

test('block structure depends on duration', () => {
  assert.deepEqual(kinds(buildPlan(profile(), { minutes: 15, goal: 'general' })), ['warmup', 'focus', 'application']);
  assert.deepEqual(kinds(buildPlan(profile(), { minutes: 30, goal: 'general' })), ['warmup', 'focus', 'support', 'application']);
  const k60 = kinds(buildPlan(profile(), { minutes: 60, goal: 'rhythm' }));
  assert.equal(k60[0], 'warmup');
  assert.equal(k60.at(-1), 'reflect');
  assert.ok(k60.includes('application') && k60.includes('support'));
});

test('deterministic: same input, same plan', () => {
  const p = profile({ rhythm: 1, ear: 2 });
  assert.deepEqual(buildPlan(p, { minutes: 45, goal: 'lead' }), buildPlan(p, { minutes: 45, goal: 'lead' }));
});

test('goal leads: a rhythm goal focuses on rhythm even when rhythm is strong', () => {
  const plan = buildPlan(profile({ rhythm: 5, ear: 1 }), { minutes: 30, goal: 'rhythm' });
  assert.equal(plan.focusSkill, 'rhythm');
  assert.equal(focusOf(plan).exercise.id, 'rhy-two-four', 'strong rhythm gets the advanced exercise');
});

test('weakness shifts the focus within the goal (lead: weak fretboard vs weak technique)', () => {
  assert.equal(buildPlan(profile({ technique: 2, fretboard: 4 }), { minutes: 30, goal: 'lead' }).focusSkill, 'technique');
  assert.equal(buildPlan(profile({ technique: 5, fretboard: 1 }), { minutes: 30, goal: 'lead' }).focusSkill, 'fretboard');
});

test('not just the two lowest skills: goal-irrelevant weaknesses do not become the focus', () => {
  // creativity is the weakest, but it does not serve a rhythm goal
  const plan = buildPlan(profile({ creativity: 1, rhythm: 3 }), { minutes: 30, goal: 'rhythm' });
  assert.equal(plan.focusSkill, 'rhythm');
  assert.notEqual(plan.supportSkill, 'creativity');
});

test('weak foundation becomes the support block', () => {
  const plan = buildPlan(profile({ rhythm: 1, technique: 4 }), { minutes: 30, goal: 'improv' });
  assert.equal(plan.supportSkill, 'rhythm');
  assert.match(plan.blocks.find((b) => b.kind === 'support').reason, /יסוד/);
});

test('lead goal prefers lead-specific technique exercises (bends, vibrato)', () => {
  assert.equal(focusOf(buildPlan(profile({ technique: 2 }), { minutes: 30, goal: 'lead' })).exercise.id, 'tech-bends');
  assert.equal(focusOf(buildPlan(profile({ technique: 2 }), { minutes: 30, goal: 'general' })).exercise.id, 'tech-alt-picking');
});

test('rhythm-struggling player: metronome + subdivision + musical application (45 min)', () => {
  const plan = buildPlan(profile({ rhythm: 2 }), { minutes: 45, goal: 'rhythm' });
  const ids = plan.blocks.map((b) => b.exercise.id);
  assert.ok(ids.includes('rhy-eighths') && ids.includes('rhy-subdivisions'), ids.join());
  assert.ok(ids.includes('app-rhythm'));
});

test('every block is concrete: steps, success criterion and reason', () => {
  for (const m of DURATIONS) for (const g of GOALS) for (const level of [1, 3, 5]) {
    const plan = buildPlan(profile(Object.fromEntries(SKILLS.map((s) => [s.id, level]))), { minutes: m, goal: g.id });
    for (const b of plan.blocks) {
      assert.ok(b.exercise, `${m}/${g.id}/${level}/${b.kind}`);
      assert.ok(b.exercise.steps.length >= 2 && b.exercise.success && b.reason);
    }
  }
});

test('unrated profile: goal-only choice, explained as such', () => {
  const plan = buildPlan(profile({}, false), { minutes: 30, goal: 'songs' });
  assert.equal(plan.rated, false);
  assert.match(focusOf(plan).reason, /עוד לא דירגתם/);
});

test('scores follow the published formula', () => {
  const s = scoreSkills(profile({ rhythm: 1 }), 'rhythm').find((x) => x.id === 'rhythm');
  assert.equal(s.score, 0.6 * 1 + 0.4 * 1);
});

test('every skill has an exercise for every rating', () => {
  for (const s of SKILLS) for (let r = 1; r <= 5; r++) {
    assert.ok(EXERCISES.some((e) => e.skill === s.id && r >= e.levels[0] && r <= e.levels[1]), `${s.id} @${r}`);
  }
});

test('plain-text export lists every block and the disclaimer', () => {
  const plan = buildPlan(profile(), { minutes: 60, goal: 'improv' });
  const text = planToText(plan);
  assert.match(text, /60 דקות/);
  for (const b of plan.blocks) assert.ok(text.includes(b.exercise.title));
  assert.match(text, /לא תוכנית מדעית/);
});
