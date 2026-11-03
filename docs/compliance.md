# Assignment Compliance Checklist

Reviewed in iteration 006 (2026-11-03). Each row points to where the requirement is met in the repository. ⚠️ marks a point where the assignment wording leaves room for interpretation.

| # | Requirement | Status | Where |
|---|---|---|---|
| 1 | HTML presentation of **about 10 slides** | ✅ **11 slides** | `index.html` (11 `<section class="slide">`). The extra slide was an explicit owner decision, to give "Number One" its own slide (`docs/prompts/002-…`, PRD §4.1). |
| 2 | JavaScript functionality | ✅ | `src/js/`, covering: <ul><li>slide engine: keyboard, buttons, dots, swipe, deep links (`core/deck.js`);</li><li>self-assessment radar (`components/radar.js`);</li><li>roadmap and illustrative timeline (`roadmap.js`, `timeline.js`);</li><li>interactive fretboard (`fretboard.js`);</li><li>practice planner with deterministic logic (`core/planner.js`, `components/planner.js`);</li><li>personal summary (`summary.js`);</li><li>persisted shared state (`core/ratings.js`, `core/plan-state.js`).</li></ul> Covered by unit tests (`tests/js/planner.test.mjs`, 14) and the browser suite (`tests/browser/smoke.mjs`, 57–58 checks). |
| 3 | **Meaningful Python integration into the presentation** | ✅ ⚠️ (see below) | `python/guitarlab/` generates `src/data/fretboard.json`, which is the only music-theory data source for slide 7 and the 3D model's fret positions. Details in the next section. |
| 4 | Animated 3D element using **Three.js** | ✅ | Three.js r160 (vendored, MIT). `src/js/three/stage.js` (renderer, lighting, slerped camera transitions, idle motion, OrbitControls) and `guitar-procedural.js` (carved-top guitar inspired by Jimmy Page's "Number One"). It appears on slides 1, 4, 5, 6, 8, 9 and 11, and is interactive on slide 8 (drag, zoom, view presets, auto-rotate). |
| 5 | Personal input and iterative improvements | ✅ | Six verbatim prompts with the owner's decisions and corrections: `docs/prompts/001…006`. Changes and validation per iteration: `docs/iterations.md` (001–006). Examples of owner decisions: the dedicated Number One slide; narrowed priorities; the time-dimension request; the planner; distribution; this review. |
| 6 | Comprehensive root-level **README.md** | ✅ | `README.md`: overview, three launch methods, navigation, the viewer journey and shared state, the planner algorithm, the Python data flow, tests, project structure, design and RTL notes, limitations, licences |
| 7 | Screenshots and visual explanations in the README | ✅ | 12 embedded screenshots (desktop: slides 1, 2, 3, the slide 3 time view, 7, 8, the slide 8 close-up, 10 with a plan, 11 with a plan; mobile: slides 1, 7, 8). All referenced image files exist in `docs/screenshots/` (28 files). Tables explain the data flow and the planner. |
| 8 | **PRD.md** | ✅ | `PRD.md` v0.6: goals, audience, content standards, functional requirements with implementation status, technical requirements, design decisions D1–D19, success criteria (including unmet ones, e.g. Lighthouse Performance), open questions |
| 9 | Dedicated directory with the complete development prompts | ✅ | `docs/prompts/`, files `001`–`006`, each verbatim. 001 was first a summary and replaced with the verbatim text in iteration 002; this is noted in the file. |
| 10 | Git history with multiple meaningful iterations | ✅ | 20+ commits from `d033086 Planning baseline` onwards. Each iteration has a "Record prompt" commit followed by focused implementation, test and docs commits (`git log --oneline`). |

## The Python requirement in detail

**What Python does.** `python/guitarlab/` (`theory.py`, `fretboard.py`, `build.py`) computes:

- the notes on every string and fret in standard tuning;
- correctly spelled scales (4 scale types × 12 keys) and their interval labels;
- the five pentatonic positions;
- equal-temperament fret distances.

`python -m guitarlab.build` writes them to `src/data/fretboard.json` with a SHA-256 content hash. 27 pytest tests check the theory, for example the A minor pentatonic boxes and spelling F major with Bb.

**How the presentation depends on it.**

| Dependency | Evidence |
|---|---|
| The slide 7 fretboard draws only what the JSON contains; the JavaScript has no theory of its own | Without the file, slide 7 shows a "data not loaded" error and no notes (tested in iteration 002) |
| The 2D fret spacing and the 3D model's 22 frets use the generated fret distances | The browser suite counts 22 frets from the data |
| Slide 7 shows a provenance badge with the generator version and hash | It matches `python -m guitarlab.build --check` |
| Slide 7's "איך זה עובד?" (how this works) panel explains the flow to viewers | Python computes the data beforehand → a data file → JavaScript draws it in the browser |
| CI runs the Python tests and the freshness check before deploying | `.github/workflows/pages.yml` |

**What it is not.** Python does **not** run in the browser or during the presentation; it runs at build time, before the presentation is served. The slide and the documentation say so explicitly.

**⚠️ Interpretation uncertainty.** If the assignment expects Python to *execute while the presentation is running*, build-time generation may be judged differently than intended. That would mean a Python backend, Python in the browser (Pyodide), or Python producing output on demand during the talk. Options were weighed in `docs/PLANNING.md` §4:

- **Pyodide** costs about 10 MB of download and several seconds of startup before Python can run. It adds no educational value beyond what the build already provides, so it was not added.
- **A Python backend** would break static hosting (GitHub Pages and the standalone file).

If the course staff confirm that runtime Python is required, the least intrusive addition would be a lazily loaded Pyodide demo on slide 7 that recomputes a scale on request (PRD X8). This has **not** been implemented.

## Other points to confirm

- **"About 10 slides":** the deck has 11. This was an owner decision, and slide 11 is the summary and resources slide.
- **Repository licence:** not chosen yet (PRD open question 5). Third-party licences (Three.js MIT, fonts OFL) are included.
- **GitHub Pages:** deployed by GitHub Actions and verified live at https://mrshmallow99.github.io/guitar-journey/ (iteration 007). Repository: https://github.com/MrShmallow99/guitar-journey
