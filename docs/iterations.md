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
