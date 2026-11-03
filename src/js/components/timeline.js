// Slide 3, "over time" view: illustrative phases from the first months to
// several years, plus curves showing skills growing at different rates.
// Complements (does not replace) the skill-lane roadmap; a toggle switches
// between the two views. Time runs right-to-left, like the roadmap stages.

import { PHASES, CURVES } from '../content/skills.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const W = 1000, H = 118, PAD_TOP = 10, PAD_BOTTOM = 18, LABEL_SPACE = 132;

const el = (name, attrs = {}) => {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
};

// boundary i (0..4) -> x; phase 1 starts at the right edge
const x = (i) => W - (i * (W - LABEL_SPACE)) / PHASES.length;
const y = (v) => PAD_TOP + (1 - v) * (H - PAD_TOP - PAD_BOTTOM);

// Catmull-Rom through the points, as cubic Bézier segments
function smoothPath(points) {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i], p1 = points[i], p2 = points[i + 1], p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1},${c2},${p2}`;
  }
  return d;
}

export function initTimeline() {
  const buttons = [...document.querySelectorAll('[data-roadmap-view]')];
  const panels = [...document.querySelectorAll('[data-view-panel]')];
  for (const b of buttons) {
    b.addEventListener('click', () => {
      buttons.forEach((x2) => x2.setAttribute('aria-pressed', String(x2 === b)));
      panels.forEach((p) => { p.hidden = p.dataset.viewPanel !== b.dataset.roadmapView; });
    });
  }

  const list = document.getElementById('timeline-phases');
  const cards = PHASES.map((phase, i) => {
    const li = document.createElement('li');
    li.className = 'timeline__phase';
    li.tabIndex = 0;
    li.innerHTML = '<span class="timeline__range"></span><h3></h3><ul></ul><p class="card__sign"></p>';
    li.querySelector('.timeline__range').textContent = phase.range;
    li.querySelector('h3').textContent = phase.when;
    li.querySelector('ul').append(...phase.focus.map((f) => Object.assign(document.createElement('li'), { textContent: f })));
    li.querySelector('.card__sign').textContent = `אבן דרך לדוגמה: ${phase.milestone}`;
    const on = () => highlight(i), off = () => highlight(null);
    li.addEventListener('pointerenter', on);
    li.addEventListener('pointerleave', off);
    li.addEventListener('focus', on);
    li.addEventListener('blur', off);
    list.append(li);
    return li;
  });

  const svg = document.getElementById('timeline-svg');
  svg.style.direction = 'ltr';
  // phase bands (hover targets) and recessive grid
  const bands = PHASES.map((_, i) => {
    const band = el('rect', { class: 'tl-band', x: x(i + 1), y: 0, width: x(i) - x(i + 1), height: H - PAD_BOTTOM + 4 });
    band.addEventListener('pointerenter', () => highlight(i));
    band.addEventListener('pointerleave', () => highlight(null));
    svg.append(band);
    return band;
  });
  for (let i = 0; i <= PHASES.length; i++) svg.append(el('line', { class: 'tl-grid', x1: x(i), x2: x(i), y1: PAD_TOP - 6, y2: H - PAD_BOTTOM }));
  svg.append(el('line', { class: 'tl-axis', x1: x(PHASES.length), x2: W, y1: H - PAD_BOTTOM, y2: H - PAD_BOTTOM }));
  const axisLabel = el('text', { class: 'tl-axis-label', x: W - 4, y: H - 6, 'text-anchor': 'end' });
  axisLabel.textContent = 'זמן ←';
  // y-axis caption on the time-start side (right, in RTL), clear of the line labels
  const yLabel = el('text', { class: 'tl-axis-label', x: W - 6, y: PAD_TOP + 2, 'text-anchor': 'end' });
  yLabel.textContent = 'שליטה ↑';
  svg.append(axisLabel, yLabel);

  // series: 2px lines, direct labels at the end (left), legend below
  for (const c of CURVES) {
    const pts = c.values.map((v, i) => [x(i), y(v)]);
    svg.append(el('path', { class: 'tl-line', d: smoothPath(pts), stroke: c.color }));
    const [ex, ey] = pts[pts.length - 1];
    svg.append(el('circle', { class: 'tl-end', cx: ex, cy: ey, r: 4.5, fill: c.color }));
    const label = el('text', { class: 'tl-label', x: ex - 10, y: ey + 4, 'text-anchor': 'end' });
    label.textContent = c.skill;
    svg.append(label);
  }

  const legend = document.getElementById('timeline-legend');
  legend.append(...CURVES.map((c) => {
    const s = document.createElement('span');
    s.innerHTML = '<i class="tl-swatch"></i>';
    s.querySelector('i').style.background = c.color;
    s.append(c.skill);
    return s;
  }));

  // table view of the same (illustrative) values
  const table = document.getElementById('timeline-table');
  const head = ['כישור (ערכים להמחשה)', 'התחלה', ...PHASES.map((p) => `סוף: ${p.when}`)];
  table.innerHTML = `<thead><tr>${head.map(() => '<th></th>').join('')}</tr></thead><tbody></tbody>`;
  table.querySelectorAll('th').forEach((th, i) => { th.textContent = head[i]; });
  for (const c of CURVES) {
    const tr = document.createElement('tr');
    for (const cell of [c.skill, ...c.values.map((v) => `${Math.round(v * 100)}%`)]) {
      tr.append(Object.assign(document.createElement('td'), { textContent: cell }));
    }
    table.tBodies[0].append(tr);
  }

  function highlight(i) {
    cards.forEach((c, n) => c.classList.toggle('is-active', n === i));
    bands.forEach((b, n) => b.classList.toggle('is-active', n === i));
  }
}
