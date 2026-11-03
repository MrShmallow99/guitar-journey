// Browser smoke test: serves the repo, drives the presentation in headless
// Chrome/Edge, checks navigation, the Python-powered fretboard, the radar ->
// next-steps link and the 3D scene, and saves screenshots.
//
//   npm install            (installs puppeteer-core only; uses your installed Chrome)
//   npm run test:browser   [-- --screenshots]
//
// Set CHROME_PATH if Chrome/Edge is not in a standard location.

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 8765;
const URL = `http://127.0.0.1:${PORT}/`;
const SHOTS = process.argv.includes('--screenshots');

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const results = [];
function check(name, ok, info = '') {
  results.push({ name, ok, info });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? `  (${info})` : ''}`);
}

const python = process.platform === 'win32' ? 'python' : 'python3';
const server = spawn(python, ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) throw new Error('No Chrome/Edge found; set CHROME_PATH');

let browser;
try {
  await waitForServer();
  // Hardware GPU where available (Windows/D3D11); software WebGL elsewhere or with SOFTWARE_GL=1.
  const gpuArgs = process.platform === 'win32' && !process.env.SOFTWARE_GL
    ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist']
    : ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'];
  browser = await puppeteer.launch({ executablePath, headless: true, args: gpuArgs });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });

  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]', { timeout: 20000 });

  const hash = () => page.evaluate(() => location.hash);
  const counter = () => page.$eval('#slide-counter', (e) => e.textContent);

  check('11 slides present', (await page.$$('.slide')).length === 11);
  check('document is RTL Hebrew', await page.evaluate(() => document.documentElement.dir === 'rtl' && document.documentElement.lang === 'he'));
  check('starts on slide 1', (await counter()) === '1 / 11');

  await page.keyboard.press('ArrowLeft');
  check('ArrowLeft advances (RTL)', (await hash()) === '#/2', await hash());
  await page.keyboard.press('ArrowRight');
  check('ArrowRight goes back', (await hash()) === '#/1');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('Space');
  check('PageDown / Space advance', (await hash()) === '#/3');
  await page.keyboard.press('End');
  check('End jumps to last slide', (await counter()) === '11 / 11');
  check('next disabled on last slide', await page.evaluate(() => document.getElementById('next').disabled && !document.getElementById('prev').disabled));
  await page.keyboard.press('Home');
  check('Home jumps to first slide', (await counter()) === '1 / 11');
  check('prev disabled on first slide', await page.evaluate(() => document.getElementById('prev').disabled && !document.getElementById('next').disabled));
  await page.click('#next');
  check('next button', (await hash()) === '#/2');
  await page.click('#prev');
  const dots = await page.$$('#dots button');
  await dots[6].click();
  check('dot navigation', (await hash()) === '#/7');
  const progress = await page.$eval('#progress-bar', (e) => e.style.transform);
  check('progress bar reflects position', Math.abs(parseFloat(progress.slice(7)) - 7 / 11) < 1e-4, progress);
  const onlyOneActive = await page.$$eval('.slide', (s) => s.filter((x) => x.classList.contains('is-active')).length === 1);
  check('exactly one active slide', onlyOneActive);

  await page.goto(`${URL}#/4`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  check('deep link #/4 opens slide 4', (await counter()) === '4 / 11');

  // ---- fretboard (slide 7) is driven by the Python-generated JSON
  await page.goto(`${URL}#/7`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  const json = JSON.parse(readFileSync(join(ROOT, 'src/data/fretboard.json'), 'utf8'));
  const prov = await page.$eval('#fb-provenance', (e) => e.title);
  check('provenance badge shows the generated hash', prov === `sha256 ${json.meta.content_sha256}`);
  const visible = await page.$$eval('#fb-svg .fb-note:not(.is-out)', (n) => n.map((g) => g.textContent.trim()));
  const expected = json.scales.minor_pentatonic.keys.A.cells.filter((c) => c[4].includes(1)).length;
  check('A minor pentatonic position 1 shows 12 notes', visible.length === 12 && expected === 12, `${visible.length}`);
  const roots = await page.$$eval('#fb-svg .fb-note.is-root:not(.is-out)', (n) => n.length);
  check('position 1 highlights 3 roots (A)', roots === 3, `${roots}`);
  await page.select('#fb-position', 'all');
  const allCount = await page.$$eval('#fb-svg .fb-note', (n) => n.length);
  const expectAll = json.scales.minor_pentatonic.keys.A.cells.filter((c) => c[1] <= 15).length;
  check('"all" shows every scale note in frets 0-15', allCount === expectAll, `${allCount}/${expectAll}`);
  await page.select('#fb-scale', 'major');
  const posHidden = await page.$eval('#fb-position-field', (e) => e.hidden);
  check('position control hidden for 7-note scales', posHidden);
  await page.select('#fb-key', 'F');
  const fNames = await page.$$eval('#fb-svg .fb-note text', (n) => n.map((t) => t.textContent));
  check('F major is spelled with Bb, not A#', fNames.includes('Bb') && !fNames.includes('A#'));
  await page.click('[data-labels="intervals"]');
  const labels = await page.$$eval('#fb-svg .fb-note text', (n) => [...new Set(n.map((t) => t.textContent))].sort());
  check('interval labels', JSON.stringify(labels) === JSON.stringify(['1', '2', '3', '4', '5', '6', '7']), labels.join(' '));
  await page.focus('#fb-scale');
  await page.keyboard.press('ArrowLeft');
  check('arrow keys inside a select do not change slide', (await hash()) === '#/7');

  // ---- radar -> roadmap -> next steps
  await page.goto(`${URL}#/2`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('#radar-sliders input');
    const values = [4, 2, 3, 1, 3, 5, 2, 4];
    inputs.forEach((i, n) => { i.value = values[n]; i.dispatchEvent(new Event('input', { bubbles: true })); });
  });
  const summary = await page.$eval('#radar-summary', (e) => e.textContent);
  check('radar summary names strongest and weakest', summary.includes('רפרטואר') && summary.includes('שמיעה'), summary);
  const marker = await page.$$eval('.roadmap__marker', (m) => m.map((x) => x.textContent).join(''));
  check('roadmap markers use the ratings', marker === '42313524', marker);
  const steps = await page.$eval('#next-steps', (e) => e.textContent);
  check('next steps list the two weakest skills', steps.includes('שמיעה') && steps.includes('קצב'), steps.slice(0, 80));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  const persisted = await page.$$eval('#radar-sliders input', (i) => i.map((x) => x.value).join(''));
  check('ratings persist across reload', persisted === '42313524', persisted);

  // ---- 3D stage
  const stage = await page.evaluate(() => {
    const s = window.__stage;
    if (!s) return null;
    s.renderer.render(s.scene, s.camera);
    return { triangles: s.renderer.info.render.triangles, meshes: s.scene.getObjectsByProperty('type', 'Mesh').length };
  });
  check('3D stage initialised with WebGL', Boolean(stage) && !(await page.evaluate(() => document.body.classList.contains('no-webgl'))));
  check('procedural guitar rendered', stage?.triangles > 1000, stage ? `${stage.triangles} triangles, ${stage.meshes} meshes` : 'none');
  const frets = await page.evaluate(() => window.__stage.model.object.children.filter((m) => m.geometry?.type === 'BoxGeometry' && Math.abs(m.geometry.parameters.width - 0.06) < 1e-9).length);
  check('3D frets come from generated data (22)', frets === json.frets, `${frets}`);
  await page.goto(`${URL}#/8`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  const interactive = await page.evaluate(() => window.__stage.controls.enabled && document.body.dataset.sceneMode === 'interactive');
  check('slide 8 enables orbit controls', interactive);
  await page.click('[data-view="pickups"]');
  await new Promise((r) => setTimeout(r, 1600));
  const near = await page.evaluate(() => window.__stage.camera.position.distanceTo(window.__stage.controls.target));
  check('view preset moves the camera', near < 25, near.toFixed(1));
  await page.click('#autorotate');
  check('auto-rotate toggle', await page.evaluate(() => window.__stage.controls.autoRotate === true));
  await page.keyboard.press('ArrowLeft');
  check('leaving slide 8 disables controls', await page.evaluate(() => !window.__stage.controls.enabled && !window.__stage.controls.autoRotate));

  if (SHOTS) {
    const dir = join(ROOT, 'docs/screenshots');
    mkdirSync(dir, { recursive: true });
    for (let i = 1; i <= 11; i++) {
      await page.goto(`${URL}#/${i}`, { waitUntil: 'networkidle0' });
      await page.reload({ waitUntil: 'networkidle0' }); // fresh load per slide: no mid-transition frames
      await page.waitForSelector('html[data-ready="true"]');
      await new Promise((r) => setTimeout(r, 2500));
      await page.screenshot({ path: join(dir, `slide-${String(i).padStart(2, '0')}.png`) });
    }
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    for (const i of [1, 2, 7, 8]) {
      await page.goto(`${URL}#/${i}`, { waitUntil: 'networkidle0' });
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitForSelector('html[data-ready="true"]');
      await new Promise((r) => setTimeout(r, 1800));
      await page.screenshot({ path: join(dir, `mobile-slide-${String(i).padStart(2, '0')}.png`) });
    }
    console.log(`screenshots saved to ${dir}`);
  }

  check('no console errors, page errors or failed requests', errors.length === 0, errors.join(' | '));
} finally {
  await browser?.close();
  server.kill();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(URL)).ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('static server did not start');
}
