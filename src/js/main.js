import { Deck } from './core/deck.js';
import { initRadar } from './components/radar.js';
import { initRoadmap } from './components/roadmap.js';
import { initTimeline } from './components/timeline.js';
import { initNextSteps } from './components/next-steps.js';
import { initFretboard, initFretboardError } from './components/fretboard.js';

const DATA_URL = 'src/data/fretboard.json';
const narrow = matchMedia('(max-width: 900px), (max-height: 560px)');

async function loadGuitarData() {
  const res = await fetch(DATA_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status} עבור ${DATA_URL}`);
  const data = await res.json();
  if (data?.meta?.generator !== 'guitarlab') throw new Error('הקובץ אינו פלט של guitarlab');
  return data;
}

// The 3D layer is loaded lazily and isolated: if it fails, the deck still works.
async function initStage(deck, data) {
  const viewer = document.getElementById('viewer-controls');
  const unavailable = document.getElementById('viewer-unavailable');
  const fail = (err) => {
    console.warn('3D stage unavailable:', err);
    document.body.classList.add('no-webgl');
    viewer.hidden = true;
    unavailable.hidden = false;
  };

  try {
    const { GuitarStage, webglAvailable } = await import('./three/stage.js');
    if (!webglAvailable()) return fail(new Error('WebGL not supported'));
    const { createProceduralGuitar } = await import('./three/guitar-procedural.js');
    const model = createProceduralGuitar({ fretDistances: data?.fret_positions.distance_from_nut_in ?? [] });
    const stage = new GuitarStage(document.getElementById('scene'), model);

    const viewButtons = [...viewer.querySelectorAll('[data-view]')];
    const autoBtn = document.getElementById('autorotate');
    const pressView = (name) => viewButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === name)));
    viewButtons.forEach((b) => b.addEventListener('click', () => { pressView(b.dataset.view); stage.goTo(b.dataset.view); }));
    autoBtn.addEventListener('click', () => {
      const on = autoBtn.getAttribute('aria-pressed') !== 'true';
      autoBtn.setAttribute('aria-pressed', String(on));
      stage.setAutoRotate(on);
    });

    // Small screens: the guitar only appears inside a slide's in-flow viewer
    // box (slides 1 and 8), never behind text. Large screens: fullscreen layer.
    const sync = ({ slide }, { entering = true } = {}) => {
      const mode = slide.dataset.sceneMode ?? 'off';
      const host = narrow.matches ? slide.querySelector('[data-mobile-viewer]') : null;
      const effective = narrow.matches && !host ? 'off' : mode;
      document.body.dataset.sceneMode = effective;
      stage.setSlide(slide.dataset.scene, effective, host);
      if (entering && mode === 'interactive') {
        pressView(slide.dataset.scene);
        autoBtn.setAttribute('aria-pressed', 'false');
      }
    };
    deck.addEventListener('change', (e) => sync(e.detail));
    narrow.addEventListener('change', () => sync({ slide: deck.current }, { entering: false }));
    sync({ slide: deck.current });
    window.__stage = stage; // exposed for debugging and the browser smoke test
  } catch (err) {
    fail(err);
  }
}

async function main() {
  const deck = new Deck(document.getElementById('deck'));
  // until the 3D stage loads (or if it can't), the canvas layer stays hidden
  document.body.dataset.sceneMode = 'off';
  initRadar();
  initRoadmap();
  initTimeline();
  initNextSteps(deck);
  deck.start();

  let data = null;
  try {
    data = await loadGuitarData();
    initFretboard(data);
  } catch (err) {
    console.error(err);
    initFretboardError(err.message);
  }
  await initStage(deck, data);
  document.documentElement.dataset.ready = 'true';
}

main();
