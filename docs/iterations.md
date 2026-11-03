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
