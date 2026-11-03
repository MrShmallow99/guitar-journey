# Iterations

One entry per development iteration. Prompts are recorded verbatim in [`prompts/`](prompts/).

---

## Iteration 001: Initial planning (2026-11-03)

**Prompt:** [`prompts/001-initial-planning.md`](prompts/001-initial-planning.md)

**Delivered**

- `docs/PLANNING.md` v0.1: concept, 10-slide outline, Python options, 3D approach, interactions, visual design, 4-phase roadmap, repo structure, risks, starting point.
- `PRD.md` v0.1.
- The prompt log was started, initially with a *summary* of the prompt. Iteration 002 replaced it with the verbatim text.

No code was written.

---

## Iteration 002: Decisions and first functional prototype (2026-11-03)

**Prompt:** [`prompts/002-decisions-and-first-prototype.md`](prompts/002-decisions-and-first-prototype.md)

### Owner decisions applied

- 11 slides, with a dedicated "Number One" slide.
- A narrative in three acts.
- Narrowed priorities: the metronome, routine builder and audio are deferred.
- Python must visibly power the fretboard.
- Procedural 3D only as a placeholder, behind a swappable contract, with no third-party assets.
- "Late-night studio" design confirmed.
- No calendar timelines.

### Commits

1. *Planning baseline*: PRD v0.2, PLANNING v0.2, and the verbatim prompts 001 and 002. Made before any implementation.
2. *Working prototype*: everything below.

### Implemented

| Area | What was built |
|---|---|
| Deck | `index.html` with 11 Hebrew slides. Navigation by keyboard (RTL arrows, PageUp/PageDown, Space, Home/End), on-screen buttons, dots and swipe. `#/n` deep links, right-to-left progress bar, act label, counter. Direction-aware transitions, honouring reduced motion. |
| Design system | `tokens.css` (colour, type, space, motion), `base.css` (self-hosted fonts, BiDi rules, focus), `deck.css` (layout, chrome, 3D-layer modes, responsive), `components.css` |
| Core interactions | Skill radar (slide 2) → roadmap lanes (slide 3) → personal next steps (slide 11), sharing one persisted state |
| Python | The `guitarlab` package: spelled scales (4 types × 12 keys), pentatonic positions, interval labels, note grid, equal-temperament fret positions, deterministic JSON with a SHA-256 hash, and `--check`. 27 pytest tests. |
| Fretboard | Slide 7 renders only the generated data: key, scale, position and label controls; to-scale fret spacing; provenance badge |
| 3D | A persistent Three.js r160 stage, a procedural single-cut guitar with a canvas-painted sunburst, anchor-based camera presets per slide, idle motion, and orbit/zoom, view presets and an auto-rotate toggle on slide 8. Graceful fallback when WebGL is unavailable. |
| Tooling | `tests/browser/smoke.mjs` (puppeteer-core, using the installed Chrome): 35 checks plus screenshots |
| Docs | `README.md`, `docs/architecture.md`, `docs/content-sources.md`, this file, and the PRD status columns |

### Problems found during validation and fixed

- **BiDi:** fret ranges in `<option>` labels and the summary rendered reversed ("8–5"). Fixed with Unicode isolates (U+2066/U+2069).
- **Slide 7 overflowed** a 1600×900 viewport and was cropped. Fixed by compacting the layout. Slides now use `justify-content: safe center` with internal scrolling, so content is never cropped.
- The slide 8 English title wrapped mid-name. Fixed with a no-wrap span and a line break.
- The camera presets cropped the headstock and were too close on slides 4 and 6. Adjusted.
- **Performance:** the knob material used `transmission`, which costs an extra full render pass every frame. Removed, together with fewer curve segments: about 84k → 23k triangles per frame.
- The favicon request returned a 404 (it triggered the console-error check). Fixed with an inline SVG icon.

### Validation results (actually run)

| Check | Result |
|---|---|
| `python -m pytest` (python/) | 27 passed |
| `python -m guitarlab.build --check` | OK, sha256 `08417f0d7ad2…` |
| `npm run test:browser` (headless Chrome, hardware GPU via D3D11) | 35/35 passed: navigation, deep links, the fretboard driven by the generated data, spelling, the select-focus guard, radar → roadmap → next steps, persistence, 3D initialisation, frets from the data, slide 8 controls, no console errors or 404s |
| Frame rate (headless Chrome, Intel UHD integrated GPU) | About 60 fps on the guitar slides at 1600×900@1× and 1920×1080@2× |
| Frame rate with software WebGL (SwiftShader) | About 2–4 fps on the guitar slides. This is expected for CPU rasterisation, but it means machines without GPU acceleration will be slow. Slides without the guitar skip rendering. |
| Visual review | Screenshots of all 11 slides at 1600×900, and of slides 1, 2, 7 and 8 at 390×844, were inspected |

### Not done or known limitations

- **The 3D model is a placeholder.** It is recognisably a single-cut, but it is not yet "visually impressive" or specific to Number One. There is no carved-top arch, and the headstock, tuners and neck are simplified.
- **The historical and resource claims are unverified** (`docs/content-sources.md`).
- Firefox and Safari have not been tested, and no real touch-device test has been run. Swipe was not exercised by the automated test.
- No Lighthouse or accessibility audit has been run yet. Contrast tokens were chosen for AA but not measured.
- On phones the 15-fret diagram is small (it scales down; there is no horizontal scroll or zoom).
- Hebrew content has had no native-speaker or guitar-teacher review.
- Deferred, as decided: metronome, routine builder, audio, 3D hotspots, YAML content pipeline, BiDi lint, CI.

---

## Iteration 003: Quality and content review (2026-11-03)

**Prompt:** [`prompts/003-quality-and-content-review.md`](prompts/003-quality-and-content-review.md)

Scope: improve the existing experience. No unrelated features were added. The 11 slides, the radar, persistence, roadmap, next steps, Python data, fretboard, RTL/BiDi and navigation were all kept.

### Commits

1. `Record prompt 003 verbatim`
2. `Content review: verify Number One history and resource tiers`
3. `3D: detailed procedural guitar, arc camera transitions, lighting`
4. `Mobile layout fixes and slide 3 long-term progression view`
5. Docs and screenshots (this entry)

### Issues identified, and what changed

| Area | Issue found | Change |
|---|---|---|
| **Content: Number One** | The slide stated "1959" as fact. It didn't say who shaved the neck. "Accompanied him through the Zeppelin years" was vague. | Checked against Gibson and Guitar.com (links in `content-sources.md`). The year is now qualified ("usually dated to 1959; exact year unknown", since the serial number was lost in a headstock repair). The neck was shaved by Walsh before the sale. Bought in April 1969 on the US tour. "His favourite for most of the Zeppelin years, on stage and in the studio". The price was **omitted** because accounts conflict ($1,200 / $1,500 / $500). |
| Content: sources | The Guitar World / Walsh article in the prompt didn't load (only navigation text came back) | Recorded as unusable in `content-sources.md`. No claims rely on it. |
| **Content: resources** | Songsterr implied free speed control. Moises implied guitar isolation. Free/paid labels were unverified. | Songsterr: speed, loop and audio sync are **Plus** features. Moises: the free tier gives vocals/drums/bass/"other"; a separate guitar stem is **Premium**, and the unverified slow-down claim was removed. Trial and app notes were added for Guitar Pro, Fender Play, Transcribe! and musictheory.net. Ultimate Guitar: free tabs vs. Pro. |
| Content: terminology | "Close to the fret"; "שקט בין התווים" | "Just behind the fret, not on it"; "השתקת מיתרים (muting)". The volume-cleanup and clean-BPM claims are now qualified. |
| **3D model** | A flat top with a bevel instead of a carve. A radial burst that ignored the outline. A box neck, flat frets, a generic headstock with floating tuners. Too close on some presets. | A carved top built from inset rings with an edge recurve and crown. The burst is painted from the same rings, so it follows the body edge. Slim neck profile, bound fingerboard, crowned frets (still placed from the Python data), pearloid inlays. **Sourced Number One details:** gold Grover-style tuners, and an uncovered bridge pickup with white bobbins. Top-hat knobs, ABR-style bridge, strings to the posts. No logo or brand headstock outline. |
| 3D rendering | Over-bright clearcoat highlights; camera tweens moved in a straight line | Softer key light and higher roughness. Shortest-arc (slerp) camera transitions. **36.6k triangles / 142 draw calls, about 60 fps** on the integrated Intel UHD GPU at 1600×900@1×, 1920×1080@2× and 390×844@3× (measured in headless Chrome on D3D11). |
| **Mobile** | The guitar rendered behind text (slide 8 especially). The nav bar was see-through, the dots were too small to tap, and the fretboard was tiny. | The canvas moves into in-flow viewer boxes on slides 1 and 8; all other slides are text-only on small screens. Opaque bars, 48px nav buttons, ≥ 44px controls. The fretboard keeps a readable width with horizontal scroll, scrolls to the selected position automatically, and has a sticky legend. |
| **Slide 3: time dimension** | The roadmap showed competencies but not months and years | A toggle adds an "over time" view: 4 phases (first months, first year, years 1–3, 3+ years), each with a focus and an example milestone; illustrative growth curves showing skills at different rates; "illustration, not a forecast" and "time alone does not decide" messages. The skill-lane view and the self-assessment integration are unchanged. The chart palette was checked with the dataviz validator for the dark surface (all checks pass). It has a legend, direct labels and a table view. |
| Desktop layout found during review | The slide 3 time view and slide 8 overflowed 1600×900 | Compacted the chart and cards. The slide 8 model note is visible again. |

### Validation results (actually run)

| Check | Result |
|---|---|
| `python -m pytest` | 27 passed |
| `python -m guitarlab.build --check` | OK, sha256 `08417f0d7ad2…` (data unchanged in this iteration) |
| `npm run test:browser` (headless Chrome, GPU) | **42/42 passed**. New checks cover the time-view toggle; mobile canvas placement on all 11 slides; the nav bar never overlapping the end of content; no horizontal overflow; 44px nav targets; the slide 8 mobile viewer being usable and clear of the title and controls; and the desktop canvas restoring after a resize. |
| Screenshots | All 11 slides at 1600×900 and at 390×844, plus the slide 3 time view and the slide 8 pickups and headstock views. All were inspected; the issues found are listed above. |

### Remaining limitations

- **The 3D model is still a procedural illustration.** It reads clearly as a sunburst single-cut with Number One's sourced details, but it isn't photoreal:
  - no wood-grain normal maps;
  - no wear or relic;
  - a simplified headstock and truss-rod cover;
  - no carve asymmetry;
  - the knob and neck-pickup styles are generic.
  
  A Blender GLB behind the same contract would be the next step if higher fidelity is required.
- 142 draw calls could be reduced by merging static meshes. Not needed at 60 fps on this hardware.
- **Blocked fetches:** JustinGuitar, the Moises help pages and fender.com/play returned 403, so their tier claims rely on search-indexed extracts of official pages or official community posts. They are marked ⚠️ in `content-sources.md`.
- **Not tested:** Firefox, Safari, real touch devices; Lighthouse and accessibility audits.
- On mobile, OrbitControls captures drags inside the slide 8 viewer box, so the page scrolls only outside the box. This is intended, but it should be tried on a real phone.

---

## Iteration 004: Practice planner and cross-slide coherence (2026-11-03)

**Prompt:** [`prompts/004-practice-planner-and-coherence.md`](prompts/004-practice-planner-and-coherence.md)

### Commits

1. `Record prompt 004 verbatim`
2. `Practice planner logic: deterministic, explainable, unit-tested`
3. `Slide 10 planner UI, slide 11 personal summary, slide 7 data-flow panel`
4. `Performance and accessibility: async GPU setup, target sizes`
5. `3D: plain pearloid inlay material (one fewer shader program)`
6. Tests, screenshots and documentation (this entry)

### What was built

| Area | Change |
|---|---|
| **Practice planner (slide 10)** | The viewer chooses a duration (15/30/45/60) and a goal (general, rhythm, lead, songs, improvisation) as native radio groups, then generates a session. Each block has a time, a concrete exercise with steps, an observable success criterion, a reason, and a link to its source slide. Changes update the session live. Copy as text; clear. "How the plan is chosen" and the measurement list sit in disclosures. |
| **Recommendation logic** | `core/planner.js` (pure). It has fixed layouts per duration; the focus is argmax(0.6 × goal relevance + 0.4 × need); weak foundations (rhythm or technique ≤ 2) take the support block; every session ends with an application to real music; exercises are matched to the rating, preferring goal-specific variants. It is deterministic, has no backend, and is described to viewers as a starting point, not an optimised programme. |
| **Exercise library** | `content/exercises.js`: 19 skill exercises plus warm-up, reflection and per-goal applications, all drawn from slides 4–9. Tempos and English terms are wrapped in Unicode isolates, so the same strings work in the DOM and in the copied text. |
| **Shared state** | `core/plan-state.js` stores only the choices. The plan is always recomputed from ratings + choices, so slides 10 and 11 cannot disagree. The old `next-steps.js` was removed; its role moved into `summary.js`, which uses the same planner logic. |
| **Personal summary (slide 11)** | Map (strongest/weakest), plan (if generated) with a link back to slide 10, and one next step from the planner logic. It works with no ratings and/or no plan. |
| **Slide 7 "How this works"** | A disclosure explaining build-time Python → `fretboard.json` (hash) → JavaScript drawing in the browser, stating explicitly that Python does not run in the browser. No Pyodide or backend. |
| **Content fixes** | Slide 1: "initial model" → "built in code… an educational illustration, not a historical reproduction". Navigation hint mentions the on-screen buttons, with a separate touch-screen hint. The support block is labelled "חיזוק" rather than "תחזוקה", because it isn't always a maintenance block. The PRD (C2, D8) and PLANNING now distinguish the *rejected calendar predictions* from the *accepted illustrative timeline* on slide 3. |

### Issues found during validation, and fixes

| Issue | How it was found | Fix |
|---|---|---|
| **Lighthouse target-size failure** on the progress dots (Accessibility 95) | Lighthouse | 24px hit areas with the visible pill drawn inside → Accessibility 100 |
| **Total Blocking Time about 1,000 ms** (Performance 60) | Lighthouse; then profiling showed the model build takes about 90 ms, while the **synchronous first render (shader compilation) takes about 590 ms** | `renderer.compileAsync()`; the environment map and compilation moved into an async init split across tasks; yield before building the 3D scene; one fewer shader variant; the minified three.js r160 build |
| Content scrolled under the translucent top bar showed through on tall slides (slide 10 with a 6-block plan) | Screenshot review | Slides mask content at the bar edges |
| The open slide 7 "How this works" panel stretched its column across the slide | Screenshot review | Fixed-proportion footer columns |

### Validation results (actually run)

| Check | Result |
|---|---|
| `python -m pytest` | 27 passed |
| `python -m guitarlab.build --check` | OK, sha256 `08417f0d7ad2…` (data unchanged) |
| `npm run test:unit` (new) | **14/14 passed.** Covers: layouts sum to the duration; structure per duration; determinism; the goal leads; a weakness shifts the focus within a goal; goal-irrelevant weaknesses are not chosen; the weak-foundation support rule; lead-specific exercises; the rhythm example (metronome + subdivisions + application); every block is concrete; the unrated path; the formula; exercise coverage for every skill and rating; text export. |
| `npm run test:browser` | **57/57 passed.** The new checks cover the planner across durations and goals, rating changes altering the plan, BiDi isolates in the generated text, clipboard copy, keyboard arrows in the option groups (the slide stays put), slide 11 referencing the plan after a reload, plan reset, the unrated path on slides 10 and 11, the slide 7 panel, and mobile touch sizes for the planner controls. |
| Lighthouse 12.2.1, desktop preset, headless Chrome on D3D11 | **Accessibility 100 · Best Practices 100** on slides 1, 7 and 10. **Performance:** 60 before the fixes; after them, 75–79 over three runs on slide 1 (TBT 394–499 ms, LCP about 1.3 s, CLS 0.001). Earlier single runs during the fixes scored 81–82, so the results vary from run to run. **The PRD target of ≥ 85 is not met.** |
| Screenshots | 11 desktop and 11 mobile slides, plus slide 10 with a plan, slide 11 with a plan, the slide 7 panel, the slide 3 time view and the slide 8 close-ups. All inspected. |

### Remaining issues

- **Performance below target.** The remaining blocking time comes from synchronous WebGL work: generating the environment map and linking shader programs (tasks of about 190 and 290 ms). Options:
  - replace the RoomEnvironment PMREM with a pre-baked or simpler environment;
  - merge static meshes and materials;
  - defer 3D setup until the first 3D slide is shown.
- **The plan isn't a snapshot.** It follows later rating changes. This is intended (one source of truth), but a viewer might expect a saved plan to stay fixed.
- **Ratings and plan reset separately.** Resetting the radar doesn't clear a generated plan; the plan then switches to the "no ratings" basis, and says so.
- **The planner's exercises haven't been reviewed by a guitar teacher.** Tempo suggestions such as 60–70 BPM are reasonable defaults, not research findings.
- **Not tested:** Firefox, Safari and real touch devices. The Lighthouse accessibility score is automated only; there has been no screen-reader walkthrough.

---

## Iteration 005: Distribution and launch options (2026-11-03)

**Prompt:** [`prompts/005-distribution-and-launch.md`](prompts/005-distribution-and-launch.md)

### Commits

1. `Record prompt 005 verbatim`
2. `Standalone build: self-contained dist/presentation.html (file://)`
3. `Smoke test: standalone (file://, offline) and Pages (subpath) modes`
4. `Windows one-click launcher (launch.bat + scripts/serve.py)`
5. `GitHub Actions workflow for GitHub Pages`
6. Documentation (this entry)

### Decisions

| Decision | Rationale |
|---|---|
| **esbuild** as the only new dependency (pinned 0.24.2), driven by `scripts/build.mjs` | Bundles the unchanged ES-module source into one **classic IIFE script**, which runs from `file://` where ES modules are blocked. A small plugin resolves the import-map specifiers to the same vendored Three.js r160. Vite would have changed the development architecture for no gain. |
| Embed the Python-generated JSON as `<script type="application/json" id="guitar-data">` | `fetch()` of local files fails under `file://`. `main.js` reads the element when present, otherwise it fetches as before. This is the only behavioural source change. The data and its hash are identical. |
| Fonts as base64 `data:` URIs inside the inlined CSS; the favicon was already a data URI | No file or network loads at all |
| Build-time guard | The build fails if any `src`/`href` in the markup isn't a `data:` URI or a fragment, or if the CSS has a non-`data:` `url()` or an `@import` |
| `dist/` **not committed** | Generated, about 0.9 MB, and would go stale; CI rebuilds it. The offline file is published with the site at `/presentation.html`. |
| Pages site = the source layout (`index.html`, `src/`, `assets/`) + `presentation.html` + `.nojekyll` | All paths were already relative (checked: no absolute `src`/`href`/`url()`/`fetch`/`import()` paths), so any repository subpath works |
| Launcher: thin `launch.bat` plus `scripts/serve.py` | Port and duplicate logic are reliable and testable in Python. `serve.py` also forces correct MIME types, because a Windows registry can map `.js` to `text/plain`. |

### Problems found while testing, and fixes

| Problem | Found by | Fix |
|---|---|---|
| The standalone page didn't start: "Unexpected token '<'" | `test:standalone` timed out; a console capture showed the error | The bundle was passed as a **replacement string** to `String.replace`, so the `$&` and `` $` `` sequences in minified Three.js were expanded into chunks of HTML. Fixed with replacer functions. |
| The self-containment guard flagged JavaScript `toDataURL(` as a CSS `url(` | The first build run | The guard checks markup with the script removed, and checks `url()` only in the CSS |
| "Copy the plan" never completed under `file://` (`clipboard.writeText` never settled) | `test:standalone` | A 1.2 s deadline, then the `execCommand('copy')` fallback. This applies to every version. |
| **On Windows, the launcher bound a port another program was already listening on** (two servers sharing one port) | Launcher scenario test with a foreign server on the same port | The stdlib `SO_REUSEADDR` default allows this on Windows. Now `allow_reuse_address = False` plus `SO_EXCLUSIVEADDRUSE` on Windows, so a busy port fails and the next one is tried. |
| Launcher messages didn't appear when output was redirected; printing a Hebrew path could crash on some code pages | Launcher test (empty output file) | Line-buffered output with `errors="replace"` |
| Pages test crashed while deleting its temp directory (EPERM) | `test:pages` | Wait for the server process to exit before removing the directory (Windows file locks) |

### Tests actually performed

| Test | Environment | Result |
|---|---|---|
| `npm run test:browser`: the source version, served | Headless Chrome, GPU | 57/57 |
| `npm run test:standalone`: `dist/presentation.html` as a **file:// URL**, with the **network emulated offline** (`page.setOfflineMode(true)`) | Headless Chrome, GPU | **58/58.** This includes all navigation, the 3D model and controls, radar → roadmap → planner → summary, the Python data and hash, BiDi, mobile layouts, persistence across reloads, and: **zero network requests, and the only file loaded is presentation.html.** |
| Same standalone suite | **Microsoft Edge** | 58/58 |
| Focused standalone check from `file://`: slides, keys, WebGL (36.6k triangles), fretboard (12 notes, hash `08417f0d7ad2…`), planner, summary, localStorage persistence, console errors | **Firefox**, via WebDriver BiDi | All passed; no errors |
| `npm run test:pages`: `dist/site` served under **`/guitar-journey/`** | Headless Chrome | **58/58**, including "every request stays under the subpath" |
| Pixel parity, source vs. standalone (slides 2, 3, 7, 10; desktop and mobile; reduced motion; fresh storage) | Headless Chrome | 7 of 8 views identical. Desktop slide 7 differs on 0.069% of pixels (small rendering noise in the fretboard area). |
| Visual inspection of the standalone 3D slides (1, 8; desktop and mobile) | Screenshots | Same rendering and layout as the source |
| **Fresh `git clone`**, replaying the CI steps: pytest, `--check`, `npm ci`, unit tests, build, then the Pages and standalone browser suites on the clone's output | Windows | All passed (27, OK, 14/14, 58/58, 58/58) |
| Workflow YAML | PyYAML parse | Valid (2 jobs; push and workflow_dispatch triggers). **It has not run on GitHub.** |
| Launcher A: first launch by full path from `C:\`, repository path with spaces and Hebrew | Windows 11, cmd | Server started; identity header with the correct Hebrew path; `.js` served as `text/javascript`, `.json` as `application/json` |
| Launcher B: duplicate launch | Windows | Reused the running instance and exited in about 0.8 s; no second listener |
| Launcher C and D: a foreign server on the first port | Windows | Moved to the next port and served the deck; a later launch skipped the foreign port and reused ours |
| Launcher E: no Python on PATH | Windows | Clear install/alternative message; exit code 1 |
| Server stop (process terminated, as when its window closes) | Windows | Port released |

### Not tested and remaining limitations

- **The GitHub Actions workflow hasn't run on GitHub**, so the Pages deployment itself is unverified. Its steps were replayed locally on a fresh clone.
- **Launcher:**
  - **Ctrl+C stop and browser opening weren't automated.** The browser was suppressed with `--no-browser` to avoid opening windows on this machine.
  - **Double-clicking from Explorer wasn't performed;** cmd invocation was.
- **Standalone in Safari:** not tested.
- **Standalone `localStorage` behaviour varies by browser.** Chrome and Edge share `file://` storage across local files; Firefox scopes it per file. It is guarded everywhere.
- **The standalone file is a snapshot.** Rebuild after changing the source.
- **During launcher testing, a `python -m http.server 8000` process that wasn't started by these tests (PID 2404) was stopped** while cleaning up port 8000. If you had a server running, restart it.
