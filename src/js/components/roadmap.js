// Slide 3: swim-lane roadmap. One lane per skill; the marker shows the
// viewer's own rating from slide 2, so lanes can sit in different stages.
// Selecting a stage shows what characterises it and what to focus on.

import { SKILLS, STAGES } from '../content/skills.js';
import { ratings } from '../core/ratings.js';

// Rating 1..5 -> position along the four stages (0%..100%).
const toPercent = (v) => ((v - 1) / 4) * 100;
const stageOf = (v) => Math.min(3, Math.floor(((v - 1) / 4) * 4));

export function initRoadmap() {
  const grid = document.getElementById('roadmap-grid');
  const detail = document.getElementById('roadmap-detail');
  const note = document.getElementById('roadmap-note');
  let selected = null;

  const corner = document.createElement('div');
  corner.className = 'roadmap__corner';
  corner.textContent = 'כישור / שלב';
  grid.append(corner);

  const stageButtons = STAGES.map((stage, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'roadmap__stage';
    b.innerHTML = '<b></b><small></small>';
    b.querySelector('b').textContent = `${i + 1}. ${stage.name}`;
    b.querySelector('small').textContent = stage.can;
    b.addEventListener('click', () => select(i));
    grid.append(b);
    return b;
  });

  const lanes = SKILLS.map((s) => {
    const label = document.createElement('div');
    label.className = 'roadmap__lane-label';
    label.textContent = s.name;
    const track = document.createElement('div');
    track.className = 'roadmap__track';
    track.innerHTML = '<span class="roadmap__fill"></span><span class="roadmap__marker"></span>';
    grid.append(label, track);
    return { fill: track.querySelector('.roadmap__fill'), marker: track.querySelector('.roadmap__marker'), skill: s };
  });

  function select(i) {
    selected = i;
    const stage = STAGES[i];
    stageButtons.forEach((b, n) => b.setAttribute('aria-pressed', String(n === i)));
    detail.innerHTML = `
      <h3></h3>
      <p class="roadmap__can"></p>
      <p class="note">במה להתמקד</p>
      <ul></ul>
      <p class="card__sign"></p>`;
    detail.querySelector('h3').textContent = `שלב ${i + 1}: ${stage.name}`;
    detail.querySelector('.roadmap__can').textContent = stage.can;
    detail.querySelector('ul').append(...stage.focus.map((f) => Object.assign(document.createElement('li'), { textContent: f })));
    detail.querySelector('.card__sign').textContent = `איך יודעים שהגעתם: ${stage.sign}`;
  }

  function render() {
    for (const lane of lanes) {
      const v = ratings.values[lane.skill.id];
      // Center of the marker sits at the rating's position; keep it inside the track.
      const pct = Math.min(94, Math.max(6, toPercent(v)));
      lane.marker.style.insetInlineStart = `${pct}%`;
      lane.marker.textContent = v;
      lane.marker.title = `${lane.skill.name}: ${v} מתוך 5 · שלב ${STAGES[stageOf(v)].name}`;
      lane.fill.style.width = `${pct}%`;
    }
    note.textContent = ratings.rated
      ? 'הסמנים מציגים את הדירוג שלכם משקף 2. שימו לב: סביר שהכישורים שלכם נמצאים בשלבים שונים — וזה בדיוק העניין.'
      : 'עוד לא דירגתם את עצמכם בשקף 2, ולכן מוצג פרופיל ברירת מחדל. חזרו לשקף הקודם כדי לראות את המפה שלכם.';
    if (selected === null) {
      const values = SKILLS.map((s) => ratings.values[s.id]).sort((a, b) => a - b);
      select(stageOf(values[Math.floor(values.length / 2)]));
    }
  }

  ratings.addEventListener('change', render);
  render();
}
