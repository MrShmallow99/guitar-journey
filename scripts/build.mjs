// Build the two distribution artifacts from the unchanged source:
//
//   dist/presentation.html  standalone, self-contained, works from file://
//                           (JS bundle, CSS, fonts and the Python-generated
//                           data are all embedded; no runtime requests)
//   dist/site/              static site for GitHub Pages (the source layout,
//                           relative paths only, plus presentation.html)
//
//   node scripts/build.mjs [--standalone-only]

import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = join(DIST, 'site');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// Resolve the import-map specifiers used by the source ("three", "three/addons/…")
// to the vendored files, so the bundle uses exactly the same Three.js build.
const importMapPlugin = {
  name: 'import-map',
  setup(b) {
    b.onResolve({ filter: /^three$/ }, () => ({ path: join(ROOT, 'src/vendor/three/three.module.min.js') }));
    b.onResolve({ filter: /^three\/addons\// }, (args) => ({ path: join(ROOT, 'src/vendor/three/addons', args.path.slice('three/addons/'.length)) }));
  },
};

async function bundleJs() {
  const result = await build({
    entryPoints: [join(ROOT, 'src/js/main.js')],
    bundle: true,
    format: 'iife', // a classic script: no module loading, so it runs from file://
    minify: true,
    target: ['es2020'],
    legalComments: 'eof', // keep the Three.js MIT licence header
    write: false,
    plugins: [importMapPlugin],
    logLevel: 'warning',
  });
  return result.outputFiles[0].text;
}

function inlineCss() {
  const files = ['tokens', 'base', 'deck', 'components'].map((n) => `src/css/${n}.css`);
  return files.map((f) => {
    const css = read(f);
    // fonts referenced relative to the CSS file -> base64 data URIs
    return css.replace(/url\("([^"]+\.woff2)"\)/g, (_, rel) => {
      const abs = resolve(ROOT, dirname(f), rel);
      return `url("data:font/woff2;base64,${readFileSync(abs).toString('base64')}")`;
    });
  }).join('\n');
}

// Content placed inside <script> / <style> must not close the element early.
const safeScript = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const safeStyle = (s) => s.replace(/<\/style/gi, '<\\/style');

async function buildStandalone() {
  const html = read('index.html');
  const data = read('src/data/fretboard.json').trim();
  JSON.parse(data); // fail the build on invalid data
  const js = await bundleJs();
  const css = inlineCss();

  const removed = /\s*<!-- build:standalone-remove[\s\S]*?<!-- \/build:standalone-remove -->/g;
  if ((html.match(removed) ?? []).length !== 2) throw new Error('expected two build:standalone-remove blocks in index.html');
  const sourceHash = createHash('sha256').update(html + css + js + data).digest('hex').slice(0, 12);

  let out = html.replace(removed, '');
  // Replacer functions, not strings: the bundle contains "$&", "$'" etc.,
  // which String.replace would otherwise expand as substitution patterns.
  out = out.replace('</head>', () => `  <meta name="generator" content="guitar-journey standalone build ${sourceHash}">\n  <style>\n${safeStyle(css)}\n  </style>\n</head>`);
  out = out.replace('</body>', () =>
    `  <script type="application/json" id="guitar-data">${data.replace(/<\//g, '<\\/')}</script>\n` +
    `  <script>\n${safeScript(js)}\n  </script>\n</body>`);

  // self-containment checks: nothing may be loaded from a URL or a relative file.
  // Markup is checked with the inline script removed (JS code is not markup);
  // CSS url()/@import is checked on the inlined stylesheet.
  const markup = out.replace(/<script>[\s\S]*?<\/script>/g, '');
  const offenders = [
    ...markup.matchAll(/<(?:script|link|img|source|iframe|video|audio)\b[^>]*\b(?:src|href)="(?!data:|#)([^"]+)"/gi),
    ...css.matchAll(/url\((?!["']?data:)([^)]+)\)/gi),
    ...css.matchAll(/@import\s/gi),
  ].map((m) => m[0].slice(0, 80));
  if (offenders.length) throw new Error(`standalone output references external resources:\n${offenders.join('\n')}`);

  mkdirSync(DIST, { recursive: true });
  const target = join(DIST, 'presentation.html');
  writeFileSync(target, out, 'utf8');
  return { target, bytes: statSync(target).size, sourceHash };
}

function buildSite(standalonePath) {
  rmSync(SITE, { recursive: true, force: true });
  mkdirSync(SITE, { recursive: true });
  cpSync(join(ROOT, 'index.html'), join(SITE, 'index.html'));
  cpSync(join(ROOT, 'src'), join(SITE, 'src'), { recursive: true });
  cpSync(join(ROOT, 'assets'), join(SITE, 'assets'), { recursive: true });
  cpSync(standalonePath, join(SITE, 'presentation.html')); // offline copy, downloadable from the site
  writeFileSync(join(SITE, '.nojekyll'), ''); // serve files as-is (no Jekyll processing)
  return SITE;
}

const { target, bytes, sourceHash } = await buildStandalone();
console.log(`standalone: ${target} (${(bytes / 1024).toFixed(0)} KB, build ${sourceHash})`);
if (!process.argv.includes('--standalone-only')) console.log(`pages site: ${buildSite(target)}`);
