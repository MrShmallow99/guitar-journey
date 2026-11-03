// Slide 11: concise personal summary. Reads the shared ratings and plan
// state; the "next step" comes from the same planner logic as slide 10
// (planState.plan, or a 30-minute general preview when no plan exists),
// so the two slides never give different advice.

import { SKILLS } from '../content/skills.js';
import { BLOCK_LABELS } from '../core/planner.js';
import { planState } from '../core/plan-state.js';
import { ratings } from '../core/ratings.js';

const skillById = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export function initSummary(deck) {
  const box = document.getElementById('summary');

  const button = (label, slideNumber) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn';
    b.textContent = label;
    b.addEventListener('click', () => deck.go(slideNumber - 1));
    return b;
  };
  const section = (title) => {
    const s = document.createElement('div');
    s.className = 'summary__part';
    s.append(Object.assign(document.createElement('h4'), { textContent: title }));
    box.append(s);
    return s;
  };
  const para = (text, cls) => Object.assign(document.createElement('p'), { textContent: text, className: cls ?? '' });

  function render() {
    box.replaceChildren(Object.assign(document.createElement('h3'), { textContent: 'הסיכום האישי שלכם' }));

    // 1. the map (slide 2)
    const map = section('המפה שלכם');
    if (ratings.rated) {
      const { high, low } = ratings.extremes();
      map.append(para(low.length
        ? `חזק: ${high.map((s) => s.name).join(', ')} · לחיזוק: ${low.map((s) => s.name).join(', ')}`
        : 'פרופיל מאוזן — כל הכישורים באותה רמה.'));
    } else {
      map.append(para('עוד לא דירגתם את עצמכם.', 'note'), button('לדירוג בשקף 2', 2));
    }

    // 2. the practice plan (slide 10)
    const practice = section('האימון שלכם');
    const plan = planState.plan;
    if (plan) {
      practice.append(para(`${plan.minutes} דקות · מטרה: ${plan.goalName}`));
      const ol = document.createElement('ol');
      ol.className = 'summary__blocks';
      for (const b of plan.blocks) ol.append(Object.assign(document.createElement('li'), { textContent: `${BLOCK_LABELS[b.kind]} (${b.minutes}′): ${b.exercise.title}` }));
      practice.append(ol, button('לאימון המלא בשקף 10', 10));
    } else {
      practice.append(para('עוד לא בניתם אימון.', 'note'), button('לבניית אימון בשקף 10', 10));
    }

    // 3. one next step, from the planner logic
    const next = section('הצעד הבא');
    const source = plan ?? planState.preview({ minutes: 30, goal: 'general' });
    const focus = skillById[source.focusSkill];
    next.append(para(`${focus.name}: ${focus.tip}`));
    if (!plan) next.append(para(ratings.rated ? 'ההצעה מבוססת על הדירוג שלכם ועל מטרה כללית.' : 'הצעה כללית — דרגו את עצמכם לקבלת הצעה אישית.', 'note'));
  }

  planState.addEventListener('change', render);
  ratings.addEventListener('change', render);
  render();
}
