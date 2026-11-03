// Slide 2: self-assessment radar. Eight 1-5 sliders drive an SVG radar
// chart and a text summary of strengths and weaknesses.

import { SKILLS } from '../content/skills.js';
import { ratings } from '../core/ratings.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const R = 120;

const el = (name, attrs = {}) => {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
};

// Clockwise from the top: in RTL the second skill appears on the right.
const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / SKILLS.length;
const point = (i, r) => [Math.cos(angle(i)) * r, Math.sin(angle(i)) * r];

export function initRadar() {
  const svg = document.getElementById('radar-svg');
  const slidersBox = document.getElementById('radar-sliders');
  const summary = document.getElementById('radar-summary');
  svg.style.direction = 'ltr';

  for (let level = 1; level <= 5; level++) {
    const pts = SKILLS.map((_, i) => point(i, (R * level) / 5).join(',')).join(' ');
    svg.append(el('polygon', { class: 'radar-grid', points: pts }));
  }
  SKILLS.forEach((_, i) => {
    const [x, y] = point(i, R);
    svg.append(el('line', { class: 'radar-axis', x1: 0, y1: 0, x2: x, y2: y }));
  });
  const shape = el('polygon', { class: 'radar-shape' });
  svg.append(shape);
  const dots = SKILLS.map(() => svg.appendChild(el('circle', { class: 'radar-point', r: 4.5 })));
  const labels = SKILLS.map((s, i) => {
    const [x, y] = point(i, R + 20);
    const anchor = Math.abs(x) < 8 ? 'middle' : x > 0 ? 'start' : 'end';
    const t = el('text', { class: 'radar-label', x, y: y + (y > 0 ? 10 : y < -R ? -2 : 4), 'text-anchor': anchor });
    t.textContent = s.name;
    svg.append(t);
    return t;
  });

  const inputs = SKILLS.map((s) => {
    const wrap = document.createElement('label');
    wrap.className = 'slider';
    wrap.innerHTML = `
      <span class="slider__head"><span class="slider__name"></span><output></output></span>
      <span class="slider__desc"></span>
      <input type="range" min="1" max="5" step="1">`;
    wrap.querySelector('.slider__name').textContent = s.name;
    wrap.querySelector('.slider__desc').textContent = s.desc;
    const input = wrap.querySelector('input');
    input.addEventListener('input', () => ratings.set(s.id, input.value));
    slidersBox.append(wrap);
    return { input, output: wrap.querySelector('output') };
  });

  document.getElementById('radar-reset').addEventListener('click', () => ratings.reset());

  function render() {
    const { high, low } = ratings.extremes();
    SKILLS.forEach((s, i) => {
      const v = ratings.values[s.id];
      const [x, y] = point(i, (R * v) / 5);
      dots[i].setAttribute('cx', x);
      dots[i].setAttribute('cy', y);
      inputs[i].input.value = v;
      inputs[i].output.textContent = v;
      inputs[i].input.setAttribute('aria-valuetext', `${s.name}: ${v} מתוך 5`);
      labels[i].classList.toggle('is-high', high.includes(s));
      labels[i].classList.toggle('is-low', low.includes(s));
    });
    shape.setAttribute('points', SKILLS.map((s, i) => point(i, (R * ratings.values[s.id]) / 5).join(',')).join(' '));

    const names = (list) => list.map((s) => s.name).join(', ');
    if (!ratings.rated) {
      summary.textContent = 'הזיזו את המחוונים כדי לבנות את הפרופיל שלכם.';
    } else if (!high.length) {
      summary.textContent = 'פרופיל מאוזן: כל הכישורים באותה רמה. נסו לדייק — איפה בכל זאת קל לכם יותר?';
    } else {
      summary.innerHTML = '';
      const strong = document.createElement('strong');
      strong.textContent = names(high);
      const weak = document.createElement('strong');
      weak.textContent = names(low);
      summary.append('החוזק הבולט: ', strong, ' · כדאי לחזק: ', weak);
    }
  }

  ratings.addEventListener('change', render);
  render();
}
