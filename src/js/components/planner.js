// Slide 10: personal practice planner. Duration and goal are native radio
// groups (arrow keys move between options without changing slides); the
// plan itself comes from core/planner.js via the shared plan state.

import { SKILLS } from '../content/skills.js';
import { GOALS, DURATIONS, BLOCK_LABELS, planToText } from '../core/planner.js';
import { planState } from '../core/plan-state.js';
import { ratings } from '../core/ratings.js';

const skillName = Object.fromEntries(SKILLS.map((s) => [s.id, s.name]));

function radioGroup(container, name, options, onChange) {
  const inputs = options.map(({ value, label }) => {
    const wrap = document.createElement('label');
    wrap.className = 'choice';
    wrap.innerHTML = '<input type="radio" class="visually-hidden"><span></span>';
    const input = wrap.querySelector('input');
    input.name = name;
    input.value = String(value);
    wrap.querySelector('span').textContent = label;
    input.addEventListener('change', () => onChange(input.value));
    container.append(wrap);
    return input;
  });
  return (value) => inputs.forEach((i) => { i.checked = i.value === String(value); });
}

export function initPlanner(deck) {
  const result = document.getElementById('planner-result');
  const profile = document.getElementById('planner-profile');
  const status = document.getElementById('planner-status');
  const generateBtn = document.getElementById('planner-generate');
  const copyBtn = document.getElementById('planner-copy');
  const resetBtn = document.getElementById('planner-reset');

  const setMinutes = radioGroup(document.getElementById('planner-minutes'), 'planner-minutes',
    DURATIONS.map((m) => ({ value: m, label: `${m} דק׳` })), (v) => change({ minutes: Number(v) }));
  const setGoal = radioGroup(document.getElementById('planner-goals'), 'planner-goal',
    GOALS.map((g) => ({ value: g.id, label: g.name })), (v) => change({ goal: v }));

  function change(patch) {
    planState.update(patch);
    if (planState.generated) say('האימון עודכן לפי הבחירה החדשה.');
  }

  generateBtn.addEventListener('click', () => {
    planState.update({ generated: true });
    say('האימון מוכן. אפשר לשנות זמן או מטרה — והוא יתעדכן.');
    result.querySelector('h3')?.focus();
  });
  resetBtn.addEventListener('click', () => {
    planState.reset();
    say('התוכנית נוקתה.');
  });
  copyBtn.addEventListener('click', async () => {
    const plan = planState.plan;
    if (!plan) return;
    say((await copyText(planToText(plan))) ? 'התוכנית הועתקה — אפשר להדביק אותה בפתקים או בהודעה.' : 'ההעתקה נכשלה בדפדפן זה. אפשר לסמן את הטקסט ולהעתיק ידנית.');
  });

  function say(text) {
    status.textContent = text;
  }

  function renderProfile() {
    profile.replaceChildren();
    if (!ratings.rated) {
      profile.append('עוד לא דירגתם את עצמכם, ולכן האימון יתבסס על הזמן והמטרה בלבד. ');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'link-btn';
      b.textContent = 'לדירוג בשקף 2';
      b.addEventListener('click', () => deck.go(1));
      profile.append(b);
      return;
    }
    const { high, low } = ratings.extremes();
    profile.append('לפי הדירוג שלכם משקף 2');
    if (low.length) profile.append(` — כדאי לחזק: ${low.map((s) => s.name).join(', ')}; חזק: ${high.map((s) => s.name).join(', ')}.`);
    else profile.append(' — פרופיל מאוזן.');
  }

  function renderResult() {
    const plan = planState.plan;
    result.replaceChildren();
    generateBtn.hidden = Boolean(plan);
    copyBtn.hidden = resetBtn.hidden = !plan;
    if (!plan) {
      const empty = document.createElement('div');
      empty.className = 'planner__empty';
      empty.innerHTML = '<h3>האימון שלכם יופיע כאן</h3><p>בחרו זמן ומטרה ולחצו ״בנו לי אימון״. תקבלו חלוקת זמן, תרגילים מפורטים, סימן הצלחה לכל תרגיל, והסבר למה הם נבחרו.</p>';
      result.append(empty);
      return;
    }

    const head = document.createElement('h3');
    head.tabIndex = -1;
    head.textContent = `אימון של ${plan.minutes} דקות · ${plan.goalName}`;
    result.append(head);

    const bar = document.createElement('div');
    bar.className = 'session';
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', plan.blocks.map((b) => `${BLOCK_LABELS[b.kind]} ${b.minutes} דקות`).join(', '));
    for (const b of plan.blocks) {
      const seg = document.createElement('span');
      seg.className = `session__seg session__seg--${b.kind}`;
      seg.style.setProperty('--min', b.minutes);
      seg.innerHTML = '<b></b><bdi></bdi>';
      seg.querySelector('b').textContent = BLOCK_LABELS[b.kind];
      seg.querySelector('bdi').textContent = `${b.minutes}′`;
      bar.append(seg);
    }
    result.append(bar);

    const list = document.createElement('ol');
    list.className = 'plan-blocks';
    plan.blocks.forEach((b, i) => {
      const li = document.createElement('li');
      const det = document.createElement('details');
      det.open = b.kind === 'focus' && i === plan.blocks.findIndex((x) => x.kind === 'focus');
      det.innerHTML = `
        <summary><span class="plan-blocks__time"><bdi></bdi></span><span class="plan-blocks__kind"></span><span class="plan-blocks__title"></span></summary>
        <ul class="plan-blocks__steps"></ul>
        <p class="card__sign"></p>
        <p class="plan-blocks__why"></p>`;
      det.querySelector('.plan-blocks__time bdi').textContent = `${b.minutes} דק׳`;
      det.querySelector('.plan-blocks__kind').textContent = BLOCK_LABELS[b.kind] + (b.skill && b.kind !== 'application' ? ` · ${skillName[b.skill]}` : '');
      det.querySelector('.plan-blocks__title').textContent = b.exercise.title;
      det.querySelector('.plan-blocks__steps').append(...b.exercise.steps.map((s) => Object.assign(document.createElement('li'), { textContent: s })));
      det.querySelector('.card__sign').textContent = `סימן הצלחה: ${b.exercise.success}`;
      const why = det.querySelector('.plan-blocks__why');
      why.append(Object.assign(document.createElement('strong'), { textContent: 'למה: ' }), b.reason);
      if (b.exercise.slide && b.exercise.slide !== 10) {
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'link-btn';
        link.textContent = ` (לשקף ${b.exercise.slide})`;
        link.addEventListener('click', () => deck.go(b.exercise.slide - 1));
        why.append(link);
      }
      li.append(det);
      list.append(li);
    });
    result.append(list);

    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = 'נקודת פתיחה, לא הבטחה לתוצאות: אם תרגיל קל מדי או קשה מדי — שנו את הדירוג בשקף 2 או התאימו את הקצב.';
    result.append(note);
  }

  function render() {
    setMinutes(planState.minutes);
    setGoal(planState.goal);
    renderProfile();
    renderResult();
  }

  planState.addEventListener('change', render);
  render();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback for browsers/contexts without the async clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}
