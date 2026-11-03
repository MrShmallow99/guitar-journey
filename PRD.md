# PRD: "המסע לגיטרה חשמלית" (The Electric Guitar Journey)

| | |
|---|---|
| **Document status** | v0.3, updated after iteration 003: quality and content review. Status columns reflect the current implementation. |
| **Last updated** | 2026-11-03 |
| **Related** | [`docs/PLANNING.md`](docs/PLANNING.md) (concept, outline, trade-offs) · [`docs/content-sources.md`](docs/content-sources.md) (claim verification) · [`docs/iterations.md`](docs/iterations.md) (change log) |

**Changes in v0.3 (iteration 003)**

- Detailed procedural 3D model (F14).
- New slide 3 "over time" view (F18).
- Mobile layout requirements (F19–F21).
- Content verified against sources (C3, C4).
- D5 refined and D11–D12 added.

**Changes from v0.1**

- 11 slides, with a dedicated "Number One" slide.
- Narrowed priorities: the metronome, routine builder and audio synthesis are deferred.
- Python must visibly power the fretboard (P-requirements made explicit).
- 3D model contract.
- No calendar timelines.
- Fluid responsive layout.

---

## 1. Overview

This is an interactive, browser-based presentation of 11 slides, written in Hebrew. It explains how electric guitarists progress from fundamentals to advanced technique, musical independence and a personal style. It works as a presentable slide deck *and* as a self-guided learning tool.

Its central message is that **guitar progress is multi-dimensional and non-linear**. Skills develop at different rates, and good practice depends on individual goals.

An animated 3D guitar inspired by Jimmy Page's 1959 Les Paul Standard "Number One" acts as the visual anchor and has its own dedicated slide.

## 2. Goals and Non-Goals

### Goals

| ID | Goal |
|---|---|
| G1 | Teach practical, accurate guidance on what to practise at each stage, how to practise it, and how to measure progress. |
| G2 | Show non-linear, multi-skill development through interaction, not just text. |
| G3 | Help each viewer identify their own profile and next focus areas. |
| G4 | Demonstrate solid engineering: HTML/CSS/JS, Three.js, Python that **visibly powers** a feature, RTL/BiDi correctness, and documentation. |
| G5 | Look like a designed interactive learning experience, not a converted slide deck, and work reliably in a live presentation setting. |

### Non-Goals

- A full guitar course or a replacement for a teacher.
- User accounts, a backend or cloud sync. State stays in the browser.
- Real-time pitch detection or audio input.
- A photoreal or brand-accurate replica of the Gibson instrument. No logos.
- Calendar timelines presented as facts.
- Multi-language support. The presentation is Hebrew only; the documentation is English.

## 3. Audience

| Segment | Needs | Implication |
|---|---|---|
| **Primary: course audience and evaluators** (likely mixed musical background) | Understand the subject and see technical quality quickly | Clear narrative, strong visuals, visible interactions, good README |
| **Secondary: beginner and early-intermediate guitarists** | Practical next steps; realistic expectations | Skill cards with concrete exercises and success criteria |
| **Tertiary: experienced players** | Credible content | Accurate theory data, honest framing |

## 4. Content Requirements

### 4.1 Narrative and outline

There are three acts:

- **The map** (slides 1–3)
- **The building blocks** (slides 4–9)
- **The road ahead** (slides 10–11)

The skill radar from slide 2 is the spine of the deck. Its skills appear as chips on each building-block slide, its ratings appear on the roadmap, and it drives the next steps on slide 11. The full table is in `docs/PLANNING.md` §2.

| # | Slide | Core content |
|---|---|---|
| 1 | Opening | Thesis ("a map, not a ladder"); the three acts |
| 2 | Skill map | 8 skill dimensions; self-assessment |
| 3 | Stages | 4 competency-defined stages, plus a toggle to an illustrative "over time" view (first months → years). No universal timeline. |
| 4 | Foundations | Relaxation and minimal pressure; chord changes; alternate picking and muting |
| 5 | Rhythm and time | Metronome; subdivision; 2 & 4; recording yourself |
| 6 | Clean technique | Bends to pitch; vibrato; legato; two-hand muting; speed through accuracy |
| 7 | Understanding the neck | Notes, roots, intervals, pentatonic positions (Python-powered fretboard) |
| 8 | "Number One" | Sourced core facts; pickups and controls as tone tools; voice = hands + influences + choices |
| 9 | Songs, ear and voice | Complete songs and repertoire; learning by ear; improvisation through phrasing |
| 10 | Practice that works | Consistency; focus; an example session; observable metrics |
| 11 | Resources and next step | Curated resources, including tab sites; personal next steps |

### 4.2 Skill dimensions (8)

| # | Hebrew | English |
|---|---|---|
| 1 | טכניקה | Technique |
| 2 | קצב ותזמון | Rhythm and timing |
| 3 | הצוואר ותאוריה | Fretboard and theory |
| 4 | שמיעה | Ear |
| 5 | אלתור | Improvisation |
| 6 | רפרטואר | Repertoire |
| 7 | יצירה | Creativity |
| 8 | סאונד | Tone |

### 4.3 Content standards

| ID | Requirement |
|---|---|
| C1 | Each skill item states **why it matters / how to practise / how you'll know it's working**. |
| C2 | **No calendar timelines.** Stages are defined by observable abilities. Pace is stated to depend on practice quantity, practice quality, background and goals. |
| C3 | Historical claims about Jimmy Page and "Number One" are limited to sourced facts, written with qualified language where the sources are uncertain (e.g. the production year). Sources are linked per claim in `docs/content-sources.md` (verified in iteration 003). |
| C4 | Resources are categorised (tabs, lessons, theory/ear, tools) and marked free, paid or freemium. Tier claims are checked against official pages where possible (e.g. Moises: guitar stem is Premium; Songsterr: speed and loop are Plus). Re-check before release. |
| C5 | Natural Hebrew guitarist terminology. On first use, the English term follows in an isolated LTR span, e.g. "בנד (bend)". |
| C6 | No slide shows more than about 3–4 key points at once. Detail goes into compact cards. |
| C7 | The emphasis areas required by the owner are each covered explicitly: consistent and focused practice; rhythm; clean technique and tension prevention; understanding over shape memorisation; complete songs and repertoire; ear, improvisation and expression; observable progress. |

## 5. Functional Requirements

Priority: **M** = must (core), **S** = should, **L** = later iteration (deferred by the owner).
Status: ✅ = implemented · ◐ = partial · – = not started. (Updated after each iteration.)

### 5.1 Navigation and deck

| ID | Requirement | Pri | Status |
|---|---|---|---|
| F1 | Keyboard navigation: `←`/`↓`/`PageDown`/`Space` = next; `→`/`↑`/`PageUp` = previous; `Home`/`End`. Ignored while a form control has focus. Click buttons and touch swipe also work. | M | ✅ (swipe implemented but not tested on a device) |
| F2 | URL hash deep links (`#/n`); editing the hash navigates. Slides update the URL with `replaceState`, so browser back/forward does **not** step through slides (this avoids filling the history; confirm whether that is the right behaviour). | M | ✅ |
| F3 | Progress bar (fills right to left), slide counter, act label | M | ✅ |
| F4 | Smooth, direction-aware slide transitions; reduced-motion respected | M | ✅ |
| F5 | Overview grid mode | S | – |
| F6 | Fullscreen toggle | S | – |
| F7 | Presenter notes | L | – |

### 5.2 Core interactive features

| ID | Requirement | Pri | Status |
|---|---|---|---|
| F10 | **Skill radar self-assessment:** 8 sliders and an SVG radar; strongest and weakest skill summary; saved in localStorage; reset | M | ✅ |
| F11 | **Interactive roadmap:** 4 stages × 8 skill lanes; shows the viewer's ratings; selecting a stage shows its focus and "how you know you're there" | M | ✅ (basic) |
| F12 | **Interactive fretboard:** key, scale, position and label (notes/intervals) selection; data loaded **only** from the Python-generated JSON; provenance badge; always LTR | M | ✅ |
| F13 | **3D guitar:** persistent scene; per-slide camera presets; idle animation; drag and zoom on slide 8; view presets; auto-rotate toggle; WebGL-unavailable message | M | ✅ (procedural model) |
| F14 | **High-quality 3D model** that is recognisably inspired by Number One (detailed geometry and finish). Built from original assets only. | M | ◐ Iteration 003: detailed procedural model (carved top, outline-following burst, bound board, sourced Number One details), 60 fps on an integrated GPU. Not photoreal; see the limitations in iterations.md. |
| F15 | Personal next steps on slide 11, computed from the radar | M | ✅ |
| F16 | Curated resource list with categories and free/paid labels | M | ✅ (labels pending verification) |
| F17 | Practical recommendation content on every building-block slide (cards, common-mistake callouts) | M | ✅ (reviewed in iteration 003) |
| F18 | **Long-term progression view** (slide 3): toggle between the skill lanes and an illustrative timeline (4 phases, focus and example milestones, growth curves at different rates). Clearly labelled as illustration, not forecast. | M | ✅ |
| F19 | **Mobile:** the 3D view never covers text or controls. It renders only in in-flow viewer boxes (slides 1 and 8). | M | ✅ |
| F20 | **Mobile:** nav controls never overlap content; touch targets ≥ 44px; no horizontal page overflow | M | ✅ (automated check at 390×844) |
| F21 | **Mobile:** the fretboard stays readable (fixed width, horizontal scroll, auto-scroll to the selected position) | S | ✅ |

### 5.3 Deferred features (later iterations)

| ID | Requirement | Pri |
|---|---|---|
| F20 | Practice metronome (Web Audio lookahead scheduler, subdivisions, tap tempo, gap click) | L |
| F21 | Practice routine builder | L |
| F22 | Plucked-string audio synthesis (notes, phrases, pickup tone examples) | L |
| F23 | 3D hotspots with Hebrew labels; scale highlights on the 3D neck synced with the 2D fretboard | S |
| F24 | Myth vs. fact cards, phrase lab | L |
| F25 | Roadmap practice-hours exploration | L |
| F26 | Light "projector" theme | S |
| F27 | Python practice-log analyzer (Option B); optional runtime Python demo (Pyodide) | L |

### 5.4 Python requirements

| ID | Requirement | Pri | Status |
|---|---|---|---|
| P1 | The `guitarlab` package generates, for standard tuning, the note map for frets 0–22, spelled scales for all 12 keys (minor and major pentatonic, natural minor, major), pentatonic positions 1–5 and interval labels | M | ✅ |
| P2 | Fret positions (equal temperament, 24.75″ scale) are emitted as data and consumed by the 3D model | M | ✅ |
| P3 | Deterministic output with a SHA-256 content hash; `--check` mode detects stale committed data | M | ✅ |
| P4 | A `pytest` suite verifies the output against known reference positions and theory invariants | M | ✅ (27 tests) |
| P5 | YAML content pipeline with schema validation; Hebrew/BiDi/glossary lint | S | – |
| P6 | CI (GitHub Actions) runs the tests and `--check` | S | – |

**The Python-to-presentation link must be verifiable** (see PLANNING §4, "Decision"). The fretboard contains no built-in music data. The provenance badge displays the hash of the generated data. The 3D frets are placed from the generated fret positions.

## 6. Technical Requirements

| Area | Requirement |
|---|---|
| Stack | Static HTML, CSS and vanilla JavaScript ES modules; no framework or bundler. Three.js r160, pinned and vendored together with its MIT licence. |
| Serving | Served over HTTP (`python -m http.server`), with GitHub Pages later. `file://` is unsupported because browsers block ES modules there. The page detects this and shows instructions. |
| Offline | No CDN at runtime: Three.js and the fonts are vendored. |
| Browsers | Latest Chrome, Edge and Firefox (primary); Safari (best effort). Iteration 002 was tested in headless Chrome only. |
| RTL/BiDi | `lang="he" dir="rtl"`; CSS logical properties; `<bdi>` or `dir="ltr"` isolation for Latin terms, numbers and units; fretboard, tab and diagrams stay LTR. |
| Responsive | Fluid full-viewport slides. Below 900 px, slides become a single scrollable column and the 3D layer dims. |
| Fonts | Self-hosted variable woff2 (SIL OFL): Heebo (body), Rubik (display), JetBrains Mono (diagrams). |
| 3D | One persistent renderer; model contract with named anchors; DPR capped at 2; rendering paused when hidden; `prefers-reduced-motion` respected. Final GLB budget: 5 MB or less. |
| Accessibility | WCAG 2.1 AA contrast; full keyboard operation; visible focus; text summaries for the radar and fretboard; `aria-live` for dynamic results. |
| Persistence | localStorage only (radar ratings), wrapped in try/catch. A reset control is provided. |
| Python | Python 3.11 or later; standard library only for the generator; `pytest` for tests. |

## 7. Visual Direction (✅ confirmed)

| Aspect | Direction |
|---|---|
| Theme | "Late-night studio": warm near-black backgrounds; warm off-white text; **sunburst amber** primary accent; subtle **cherry red** secondary accent; **cool teal** reserved for interactive and data elements. |
| Typography | Heebo (body), Rubik (titles), JetBrains Mono (diagram labels). |
| Hierarchy | Act and kicker → title → lead sentence → at most 3–4 cards → interaction. |
| Consistency | Skill chips, the common-mistake callout and the card template repeat across slides. Root notes are always amber and scale tones always teal. |
| Motion | Purposeful: slide transitions, camera moves and state changes. Reduced motion is honoured. |

## 8. Design Decisions

| # | Decision | Rationale | Status |
|---|---|---|---|
| D1 | Python runs at build time (data engine). The runtime demo will be re-evaluated later. | Real dependency, no runtime cost, testable | ✅ Decided |
| D2 | Vanilla JS, no bundler | Small scope; transparent code | ✅ Decided |
| D3 | Procedural placeholder model behind a model contract; a detailed original model later | Validates the integration now; upgrade without a rewrite | ✅ Decided |
| D4 | Diagrams, fretboard and the 3D guitar stay LTR | Musical convention; mirroring would mislead | ✅ Decided |
| D5 | Fluid full-viewport layout (replaces the scaled 16:9 stage). Slides scroll internally instead of being cropped. | Readable on every screen size | ✅ Decided (002), refined (003) |
| D6 | Commit the generated data and guard it with `--check` | Clone-and-run simplicity | ✅ Decided |
| D7 | `←` = next in RTL; `PageDown`/`Space` always next; swipe right = next | RTL reading direction; clicker-safe | ◐ Implemented provisionally, needs owner confirmation |
| D8 | No calendar timelines; competency-defined stages | Avoid unfounded claims | ✅ Decided |
| D9 | Hebrew terms, with the English term on first use | Natural for Israeli guitarists | ✅ Decided |
| D10 | No third-party 3D, texture or audio assets; only original or procedural ones | Licensing safety | ✅ Decided |
| D11 | Iteration 003: improve the **procedural** model rather than introduce a GLB | A Blender GLB would give the best fidelity, but it needs authoring that wasn't possible in this environment plus an asset pipeline and loader. Licensed third-party models were ruled out. The model contract keeps a GLB drop-in possible. | ✅ Decided (003) |
| D12 | Small screens show the guitar only in in-flow viewer boxes (slides 1 and 8); other slides are text-only | Owner requirement: the guitar must never obscure content | ✅ Decided (003) |

## 9. Success Criteria

| ID | Criterion | How it's verified |
|---|---|---|
| S1 | All 11 slides complete in Hebrew, with correct RTL/BiDi | Visual review of screenshots; mixed-direction strings checked |
| S2 | All M requirements implemented | Status columns in §5 |
| S3 | Each interactive feature has an identifiable learning purpose | Feedback from at least 2 test viewers |
| S4 | Theory data is correct | `pytest` passes; manual spot-check against references |
| S5 | Python visibly powers the deck | The badge hash matches `--check`; the fretboard fails visibly without the data |
| S6 | Reliable live presentation | Rehearsal on the target machine, offline |
| S7 | Quality bar | Lighthouse Accessibility ≥ 95, Performance ≥ 85 (desktop) |
| S8 | Reproducible | A fresh clone runs using only the README |
| S9 | Documented process | `docs/prompts/` and `docs/iterations.md` are complete |

## 10. Open Questions

1. D7: confirm the arrow-key and swipe direction.
2. Which machine and browser will be used for the live presentation, and will there be internet access?
3. How long is the slot, and who exactly is the audience?
4. Final 3D model: is the improved procedural model enough, or should a Blender GLB follow? See D11.
5. Repository licence (MIT for code? content licence?).
