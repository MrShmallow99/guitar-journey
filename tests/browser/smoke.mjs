// Browser smoke test: drives the presentation in headless Chrome/Edge,
// checks navigation, the Python-powered fretboard, the radar ->
// planner/summary state and the 3D scene, and saves screenshots.
// The same checks run against three targets:
//
//   npm run test:browser      source project, served at http://127.0.0.1:8765/
//   npm run test:standalone   dist/presentation.html opened as a file:// URL,
//                             with the browser's network emulated offline
//   npm run test:pages        dist/site served under a repository subpath
//                             (http://127.0.0.1:8766/guitar-journey/), like GitHub Pages
//   add -- --screenshots to refresh docs/screenshots/ (source mode)
//
// Set CHROME_PATH if Chrome/Edge is not in a standard location.

import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const MODE = process.argv.includes('--standalone') ? 'standalone' : process.argv.includes('--pages') ? 'pages' : 'source';
const SHOTS = process.argv.includes('--screenshots') && MODE === 'source';
const PAGES_BASE = 'guitar-journey';

let serveDir = ROOT, PORT = 8765, URL, tempRoot = null;
if (MODE === 'standalone') {
  const file = join(ROOT, 'dist/presentation.html');
  if (!existsSync(file)) throw new Error('dist/presentation.html not found: run npm run build first');
  URL = pathToFileURL(file).href;
} else if (MODE === 'pages') {
  if (!existsSync(join(ROOT, 'dist/site/index.html'))) throw new Error('dist/site not found: run npm run build first');
  // simulate https://<user>.github.io/<repository>/ with a subdirectory
  tempRoot = mkdtempSync(join(tmpdir(), 'gj-pages-'));
  cpSync(join(ROOT, 'dist/site'), join(tempRoot, PAGES_BASE), { recursive: true });
  serveDir = tempRoot;
  PORT = 8766;
  URL = `http://127.0.0.1:${PORT}/${PAGES_BASE}/`;
} else {
  URL = `http://127.0.0.1:${PORT}/`;
}
console.log(`mode: ${MODE} · ${URL}`);

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
const server = MODE === 'standalone' ? null : spawn(python, ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: serveDir, stdio: 'ignore' });
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) throw new Error('No Chrome/Edge found; set CHROME_PATH');

let browser;
const requested = [];
try {
  if (server) await waitForServer();
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
  page.on('request', (r) => requested.push(r.url()));
  // standalone: prove nothing needs the network
  if (MODE === 'standalone') await page.setOfflineMode(true);

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
  await page.goto(`${URL}#/3`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  check('slide 3 opens on the skill-lane view', await page.evaluate(() => !document.querySelector('[data-view-panel="skills"]').hidden && document.getElementById('timeline').hidden));
  await page.click('[data-roadmap-view="time"]');
  const tl = await page.evaluate(() => ({
    hidden: document.getElementById('timeline').hidden,
    skillsHidden: document.querySelector('[data-view-panel="skills"]').hidden,
    phases: document.querySelectorAll('#timeline-phases > li').length,
    lines: document.querySelectorAll('#timeline-svg .tl-line').length,
    disclaimer: document.querySelector('.timeline__disclaimer').textContent,
  }));
  check('time view shows 4 phases and 4 illustrative curves', !tl.hidden && tl.skillsHidden && tl.phases === 4 && tl.lines === 4, JSON.stringify({ p: tl.phases, l: tl.lines }));
  check('time view is labelled as illustrative', tl.disclaimer.includes('המחשה, לא תחזית'));
  await page.click('[data-roadmap-view="skills"]');
  check('toggle returns to the skill lanes', await page.evaluate(() => !document.querySelector('[data-view-panel="skills"]').hidden));
  const summary0 = await page.$eval('#summary', (e) => e.textContent);
  check('slide 11 summary uses the ratings (strongest, weakest, next step)', summary0.includes('רפרטואר') && summary0.includes('שמיעה') && summary0.includes('עוד לא בניתם אימון'), summary0.slice(0, 90));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  const persisted = await page.$$eval('#radar-sliders input', (i) => i.map((x) => x.value).join(''));
  check('ratings persist across reload', persisted === '42313524', persisted);

  // ---- practice planner (slide 10), shared with the summary (slide 11)
  await page.goto(`${URL}#/10`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  const empty = await page.evaluate(() => ({
    empty: Boolean(document.querySelector('.planner__empty')),
    gen: !document.getElementById('planner-generate').hidden,
    copy: document.getElementById('planner-copy').hidden,
    profile: document.getElementById('planner-profile').textContent,
  }));
  check('planner starts empty, with the ratings profile shown', empty.empty && empty.gen && empty.copy && empty.profile.includes('שמיעה'), empty.profile);
  const pick = (name, value) => page.evaluate((n, v) => document.querySelector(`input[name="${n}"][value="${v}"]`).closest('label').click(), name, value);
  const planInfo = () => page.evaluate(() => {
    const blocks = [...document.querySelectorAll('.plan-blocks > li')];
    return {
      title: document.querySelector('.planner__result h3')?.textContent ?? '',
      minutes: blocks.reduce((n, li) => n + parseInt(li.querySelector('.plan-blocks__time').textContent, 10), 0),
      kinds: blocks.map((li) => li.querySelector('.plan-blocks__kind').textContent),
      titles: blocks.map((li) => li.querySelector('.plan-blocks__title').textContent),
      complete: blocks.every((li) => li.querySelectorAll('.plan-blocks__steps li').length >= 2 && li.querySelector('.card__sign').textContent.length > 12 && li.querySelector('.plan-blocks__why').textContent.length > 12),
      text: document.getElementById('planner-result').textContent,
    };
  });
  await pick('planner-minutes', 45);
  await pick('planner-goal', 'rhythm');
  await page.click('#planner-generate');
  let info = await planInfo();
  check('45-minute rhythm plan: blocks sum to 45 min, each with steps, success criterion and reason', info.minutes === 45 && info.complete && info.title.includes('45'), `${info.minutes} min · ${info.kinds.join(' | ')}`);
  check('rhythm goal focuses on rhythm exercises and ends with a recording block', info.kinds.some((k) => k.includes('מיקוד') && k.includes('קצב')) && info.kinds.at(-1).includes('הקלטה'), info.titles.join(' | '));
  check('tempos and terms are BiDi-isolated in the generated instructions', info.text.includes('\u2066') && /BPM/.test(info.text));
  const durations = {};
  for (const m of [15, 30, 60]) {
    await pick('planner-minutes', m);
    const x = await planInfo();
    durations[m] = x.minutes;
  }
  check('changing the duration regenerates the plan (15/30/60)', durations[15] === 15 && durations[30] === 30 && durations[60] === 60, JSON.stringify(durations));
  await pick('planner-minutes', 30);
  await pick('planner-goal', 'improv');
  info = await planInfo();
  check('changing the goal changes the focus (improv -> ear for this profile)', info.kinds.some((k) => k.includes('מיקוד') && k.includes('שמיעה')), info.kinds.join(' | '));
  await page.goto(`${URL}#/2`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  await page.evaluate(() => { const i = document.querySelectorAll('#radar-sliders input')[3]; i.value = 5; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.goto(`${URL}#/10`, { waitUntil: 'networkidle0' });
  info = await planInfo();
  check('changing a rating changes the plan (ear 1 -> 5 moves the improv focus to the fretboard)', info.kinds.some((k) => k.includes('מיקוד') && k.includes('הצוואר')), info.kinds.join(' | '));
  const ctx = browser.defaultBrowserContext();
  let clipAccess = true;
  try {
    await ctx.overridePermissions(new globalThis.URL(URL).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
  } catch { clipAccess = false; /* file:// has no grantable origin */ }
  await page.click('#planner-copy');
  await page.waitForFunction(() => /הועתקה|נכשלה/.test(document.getElementById('planner-status').textContent), { timeout: 5000 }).catch(() => {});
  const copied = await page.evaluate(async () => ({
    status: document.getElementById('planner-status').textContent,
    text: await navigator.clipboard.readText().catch(() => null),
  }));
  if (copied.text !== null) {
    check('copy button puts a readable plan on the clipboard', copied.text.includes('30 דקות') && copied.text.includes('✓') && copied.text.includes('לא תוכנית מדעית'), copied.text.split('\n')[0]);
  } else {
    // clipboard can't be read back here (e.g. file://): rely on the page's own copy result
    check('copy button reports a successful copy (clipboard not readable in this context)', copied.status.includes('הועתקה'), `${copied.status} · permission override ${clipAccess ? 'ok' : 'unavailable'}`);
  }
  await page.focus('input[name="planner-goal"]:checked');
  await page.keyboard.press('ArrowLeft');
  const kb = await page.evaluate(() => ({ hash: location.hash, goal: document.querySelector('input[name="planner-goal"]:checked').value }));
  check('keyboard: arrow keys move between planner options without changing slide', kb.hash === '#/10' && kb.goal !== 'improv', JSON.stringify(kb));
  await page.goto(`${URL}#/11`, { waitUntil: 'networkidle0' });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  const summary1 = await page.$eval('#summary', (e) => e.textContent);
  check('slide 11 references the generated plan (persisted across reload)', summary1.includes('30 דקות') && !summary1.includes('עוד לא בניתם'), summary1.slice(0, 120));
  await page.goto(`${URL}#/10`, { waitUntil: 'networkidle0' });
  await page.click('#planner-reset');
  await page.goto(`${URL}#/11`, { waitUntil: 'networkidle0' });
  check('plan reset clears it on slide 11 too', (await page.$eval('#summary', (e) => e.textContent)).includes('עוד לא בניתם אימון'));
  await page.goto(`${URL}#/2`, { waitUntil: 'networkidle0' });
  await page.click('#radar-reset');
  await page.goto(`${URL}#/10`, { waitUntil: 'networkidle0' });
  await page.click('#planner-generate');
  const unrated = await page.evaluate(() => ({ profile: document.getElementById('planner-profile').textContent, text: document.getElementById('planner-result').textContent }));
  check('without a self-assessment the planner still works and says so', unrated.profile.includes('עוד לא דירגתם') && unrated.text.includes('עוד לא דירגתם'), unrated.profile.slice(0, 60));
  await page.click('#planner-reset');
  await page.goto(`${URL}#/11`, { waitUntil: 'networkidle0' });
  const summary2 = await page.$eval('#summary', (e) => e.textContent);
  check('slide 11 works with no ratings and no plan', summary2.includes('עוד לא דירגתם') && summary2.includes('עוד לא בניתם') && summary2.includes('הצעה כללית'), summary2.slice(0, 100));
  // restore the ratings used by later checks
  await page.goto(`${URL}#/2`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const values = [4, 2, 3, 1, 3, 5, 2, 4];
    document.querySelectorAll('#radar-sliders input').forEach((i, n) => { i.value = values[n]; i.dispatchEvent(new Event('input', { bubbles: true })); });
  });

  // ---- slide 7 "how this works" panel
  await page.goto(`${URL}#/7`, { waitUntil: 'networkidle0' });
  await page.click('.howto summary');
  const howto = await page.$eval('.howto', (e) => ({ open: e.open, text: e.textContent }));
  check('slide 7 explains the build-time Python -> data -> JavaScript flow', howto.open && howto.text.includes('לא רץ בדפדפן') && howto.text.includes('fretboard.json'));

  // ---- 3D stage
  const stage = await page.evaluate(() => {
    const s = window.__stage;
    if (!s) return null;
    s.renderer.render(s.scene, s.camera);
    return { triangles: s.renderer.info.render.triangles, meshes: s.scene.getObjectsByProperty('type', 'Mesh').length };
  });
  check('3D stage initialised with WebGL', Boolean(stage) && !(await page.evaluate(() => document.body.classList.contains('no-webgl'))));
  check('procedural guitar rendered', stage?.triangles > 1000, stage ? `${stage.triangles} triangles, ${stage.meshes} meshes` : 'none');
  const frets = await page.evaluate(() => window.__stage.model.object.children.filter((m) => m.name === 'fret').length);
  check('3D frets come from generated data (22)', frets === json.frets, `${frets}`);
  await page.goto(`${URL}#/8`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  const interactive = await page.evaluate(() => window.__stage.controls.enabled && document.body.dataset.sceneMode === 'interactive');
  check('slide 8 enables orbit controls', interactive);
  await page.click('[data-view="pickups"]');
  await new Promise((r) => setTimeout(r, 1600));
  const near = await page.evaluate(() => window.__stage.camera.position.distanceTo(window.__stage.controls.target));
  check('view preset moves the camera closer than the full view', near < 40, near.toFixed(1));
  await page.click('#autorotate');
  check('auto-rotate toggle', await page.evaluate(() => window.__stage.controls.autoRotate === true));
  await page.keyboard.press('ArrowLeft');
  check('leaving slide 8 disables controls', await page.evaluate(() => !window.__stage.controls.enabled && !window.__stage.controls.autoRotate));

  // ---- mobile layout (390x844): the guitar never sits behind text
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mobileIssues = [];
  for (let i = 1; i <= 11; i++) {
    await page.goto(`${URL}#/${i}`, { waitUntil: 'networkidle0' });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('html[data-ready="true"]');
    const r = await page.evaluate(() => {
      const canvas = document.getElementById('scene');
      const mode = document.body.dataset.sceneMode;
      const slide = document.querySelector('.slide.is-active');
      slide.scrollTop = slide.scrollHeight; // scroll to the end of the slide
      const nav = document.querySelector('.navbar').getBoundingClientRect();
      const top = document.querySelector('.topbar').getBoundingClientRect();
      const blocks = [...slide.querySelectorAll('.slide__content > *, .slide__inner > :not(.slide__content):not(.slide__aside)')]
        .filter((e) => e.offsetParent && e.getBoundingClientRect().height > 0);
      const last = blocks.reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0);
      const btn = document.getElementById('next').getBoundingClientRect();
      return {
        canvasOk: mode === 'off' || Boolean(canvas.closest('[data-mobile-viewer]')),
        mode,
        lastBottom: Math.round(last), navTop: Math.round(nav.top), topBottom: Math.round(top.bottom),
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
        btn: Math.round(Math.min(btn.width, btn.height)),
      };
    });
    if (!r.canvasOk) mobileIssues.push(`slide ${i}: canvas outside viewer (mode ${r.mode})`);
    if (r.lastBottom > r.navTop) mobileIssues.push(`slide ${i}: content ends under the nav bar (${r.lastBottom} > ${r.navTop})`);
    if (r.overflowX) mobileIssues.push(`slide ${i}: horizontal page overflow`);
    if (r.btn < 44) mobileIssues.push(`slide ${i}: nav button ${r.btn}px`);
  }
  check('mobile: guitar only inside in-flow viewers; nav bar clear of content; no page overflow; 44px nav targets', mobileIssues.length === 0, mobileIssues.join(' | '));
  await page.goto(`${URL}#/10`, { waitUntil: 'networkidle0' });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  await page.evaluate(() => document.getElementById('planner-generate').click());
  const touch = await page.evaluate(() => Math.min(...[...document.querySelectorAll('.choice span, .plan-blocks summary, #planner-copy')].map((e) => e.getBoundingClientRect().height)));
  check('mobile: planner options, plan rows and buttons are at least 44px tall', touch >= 44, `${Math.round(touch)}px`);
  await page.evaluate(() => document.getElementById('planner-reset').click());
  await page.goto(`${URL}#/8`, { waitUntil: 'networkidle0' });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  const viewer = await page.evaluate(() => {
    const v = document.querySelector('.mobile-viewer--interactive').getBoundingClientRect();
    const title = document.querySelector('.slide.is-active h2').getBoundingClientRect();
    const controls = document.getElementById('viewer-controls').getBoundingClientRect();
    const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    return { h: Math.round(v.height), clearOfTitle: !overlaps(v, title), clearOfControls: !overlaps(v, controls), controls: window.__stage.controls.enabled };
  });
  check('mobile slide 8: usable 3D viewer that does not overlap title or controls', viewer.h >= 250 && viewer.clearOfTitle && viewer.clearOfControls && viewer.controls, JSON.stringify(viewer));
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${URL}#/1`, { waitUntil: 'networkidle0' });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('html[data-ready="true"]');
  check('desktop: canvas returns to the fullscreen layer', await page.evaluate(() => !document.getElementById('scene').closest('[data-mobile-viewer]') && getComputedStyle(document.getElementById('scene')).position === 'fixed'));

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
    await page.goto(`${URL}#/10`, { waitUntil: 'networkidle0' });
    await pick('planner-minutes', 45);
    await pick('planner-goal', 'lead');
    await page.click('#planner-generate');
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: join(dir, 'slide-10-plan.png') });
    await page.goto(`${URL}#/11`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: join(dir, 'slide-11-with-plan.png') });
    await page.goto(`${URL}#/7`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => { document.querySelector('.howto').open = true; });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: join(dir, 'slide-07-howto.png') });
    await page.goto(`${URL}#/3`, { waitUntil: 'networkidle0' });
    await page.click('[data-roadmap-view="time"]');
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: join(dir, 'slide-03-time.png') });
    await page.goto(`${URL}#/8`, { waitUntil: 'networkidle0' });
    await page.click('[data-view="pickups"]');
    await new Promise((r) => setTimeout(r, 2200));
    await page.screenshot({ path: join(dir, 'slide-08-pickups.png') });
    await page.click('[data-view="headstock"]');
    await new Promise((r) => setTimeout(r, 2200));
    await page.screenshot({ path: join(dir, 'slide-08-headstock.png') });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    for (let i = 1; i <= 11; i++) {
      await page.goto(`${URL}#/${i}`, { waitUntil: 'networkidle0' });
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitForSelector('html[data-ready="true"]');
      await new Promise((r) => setTimeout(r, 1800));
      await page.screenshot({ path: join(dir, `mobile-slide-${String(i).padStart(2, '0')}.png`) });
    }
    console.log(`screenshots saved to ${dir}`);
  }

  check('no console errors, page errors or failed requests', errors.length === 0, errors.join(' | '));
  if (MODE === 'standalone') {
    const external = [...new Set(requested.filter((u) => !u.startsWith('file:') && !u.startsWith('data:')))];
    const files = [...new Set(requested.filter((u) => u.startsWith('file:')).map((u) => u.split('#')[0]))];
    check('standalone: no network requests, and the only file loaded is presentation.html', external.length === 0 && files.length === 1 && files[0].endsWith('/presentation.html'), `external: ${external.length}, files: ${files.map((f) => f.split('/').pop()).join(', ')}`);
  }
  if (MODE === 'pages') {
    const outside = [...new Set(requested.filter((u) => u.startsWith('http') && !u.startsWith(URL)))];
    check(`pages: every request stays under /${PAGES_BASE}/`, outside.length === 0, outside.join(' | '));
  }
} finally {
  await browser?.close();
  if (server) {
    const exited = new Promise((r) => server.once('exit', r));
    server.kill();
    await exited; // the server holds a handle on its directory until it exits (Windows)
  }
  if (tempRoot) rmSync(tempRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
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
