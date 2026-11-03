# Planning Document: Interactive Hebrew Presentation on the Electric Guitar Learning Journey

> **Read this as the planning record.** It is the plan as revised in iteration 002, with later annotations. For the *current* state of the project, see [`../PRD.md`](../PRD.md) (status columns) and [`iterations.md`](iterations.md). Parts of the original plan changed later: CI is `pages.yml`, not `ci.yml`; `dist/` is generated and not committed; the routine builder became the iteration-004 practice planner.
>
> Status: **v0.2, revised after owner review (iteration 002).** Sections marked **✅ Decided** reflect owner decisions. Remaining **Decision needed** markers are still open.
> Companion document: [`../PRD.md`](../PRD.md), the product requirements.
>
> **Changes in v0.2**
> - "Number One" now has a dedicated slide, so the deck has 11 slides.
> - A narrative arc connects the slides (§2).
> - Feature priorities have been narrowed (§6).
> - Python must visibly power the fretboard, and the link must be verifiable (§4).
> - The 3D architecture uses a model contract (§5).
> - Timelines are removed in favour of competency-defined stages (§2, §10).
> - The layout is fluid rather than a scaled 16:9 stage (§7.3).

---

## 1. Project Concept

### 1.1 The experience

The working title is **"המסע לגיטרה חשמלית"** ("The Electric Guitar Journey"). It is a browser-based, 11-slide Hebrew presentation that also works as a small interactive learning tool. It can be presented to an audience, like a normal slide deck. It can also be explored alone, at the viewer's own pace.

The narrative idea: **guitar progress is a map, not a ladder.** The presentation opens on a slowly rotating 3D model inspired by Jimmy Page's 1959 Les Paul "Number One". It then asks the viewer to rate their own skills across eight dimensions. Later slides refer back to that self-portrait: the roadmap highlights the viewer's current stage per skill, the practice builder suggests where to spend time, and the final slide generates a personal practice focus.

The 3D guitar is not only a title graphic. Its camera moves on each slide to the part of the instrument that slide talks about:

- the fretboard, for scales and positions,
- the pickups and controls, for tone,
- the bridge and strings, for bends and muting.

### 1.2 Educational goals

After the presentation, a viewer should be able to:

1. **Place themselves** on a multi-dimensional skill map. The map covers technique, rhythm, fretboard knowledge, ear, improvisation, repertoire, creativity and tone. It replaces a single "beginner/intermediate/advanced" label.
2. **Understand typical progression** as *ranges driven by deliberate practice hours and quality*, not as fixed calendar promises.
3. **Know what to focus on next** for their own stage and goals.
4. **Build an effective practice session:** warm-up, focused technique, rhythm work, repertoire and creative play. This includes using a metronome and recording themselves.
5. **Recognise common mistakes** that slow progress: practising too fast, noodling without goals, skipping rhythm work, avoiding recording, learning only shapes and never the sound.
6. **Measure progress objectively:** clean BPM thresholds, chord-change counts, recordings compared over time, and repertoire played start to finish.
7. **Find trustworthy resources** for tabs, lessons, theory, ear training and practice tools.

### 1.3 Guiding principles

| Principle | What it means in practice |
|---|---|
| Practical over motivational | Every skill card answers three questions: *why it matters*, *how to practise it*, and *how you'll know you've got it*. |
| Honest about uncertainty | Timelines are shown as wide bands with an explicit "depends on" note. We never give one exact number. |
| Interaction with purpose | Each interactive element must teach something a static slide cannot. If it doesn't, cut it. |
| Presentable *and* explorable | Every slide works with a click-through in a live talk. Deeper layers can be opened on demand. |
| Hebrew-first | Hebrew is designed in from the start, not translated in afterwards. RTL and BiDi are handled in the base layer. |

---

## 2. Presentation Structure (11 slides) ✅ Decided

### 2.1 Narrative arc

The deck tells **one story in three acts**. Each slide answers the question the previous slide raised.

| Act | Slides | Question it answers |
|---|---|---|
| **Act I: The map** (המפה) | 1–3 | "Where am I, and what does 'progress' even mean?" |
| **Act II: The building blocks** (אבני הבניין) | 4–9 | "What do I actually build, and in what order does it pay off?" |
| **Act III: The road ahead** (הדרך קדימה) | 10–11 | "How do I practise, how do I know it's working, and what next?" |

**Devices that hold the deck together:**

1. **The skill map is the spine.** The 8 skills rated on slide 2 appear as small colour-coded *skill chips* on every building-block slide ("this slide develops: rhythm, technique"). The roadmap (slide 3) places the viewer's own ratings on its lanes. Slide 11 turns the two weakest ratings into concrete next steps.
2. **The Act II order follows a dependency chain:** a relaxed body (4) → steady time (5) → clean technique (6) → understanding the neck (7) → the instrument and sound (8) → songs, ear and personal voice (9). Each step makes the next one possible.
3. **A recurring "common mistake" callout** (טעות נפוצה) appears on each building-block slide. Mistakes are taught in context instead of as a separate list.
4. **The guitar travels with the story:**
   - hero on slide 1,
   - first frets on slide 4,
   - higher frets on slide 6,
   - the full, explorable instrument on slide 8,
   - the closing shot on slide 11.

### 2.2 Slide outline

| # | Hebrew title (draft) | Purpose | Main content | Interaction (this iteration → later) | 3D role |
|---|---|---|---|---|---|
| 1 | **המסע לגיטרה חשמלית** | Hook and thesis | "Progress is a map, not a ladder." What the deck covers in three acts. | Navigation hint → – | Hero; slow idle motion |
| 2 | **מפת הכישורים שלך** (your skill map) | Multi-dimensional progress | 8 skills with one-line definitions. Uneven profiles are normal. | **Self-assessment radar** (8 sliders, persisted locally, reset) | Off |
| 3 | **שלבי הדרך** (the stages) | Typical progression without calendar predictions | 4 stages defined by *what you can do*. An explicit "no universal timeline" message. *(003)* A toggle to an illustrative "over time" view, labelled as an example, not a forecast. | **Swim-lane roadmap** showing the viewer's ratings; click a stage for details; *(003)* the "over time" view | Off |
| 4 | **היסודות: גוף רפוי, צליל נקי** (foundations: relaxed body, clean sound) | Foundations and tension prevention | Minimum fretting pressure and relaxation; chord changes ("one-minute changes"); alternate picking and muting. | Static skill cards → chord diagrams later | First frets |
| 5 | **קצב וזמן** (rhythm and time) | Rhythm as the foundation | Metronome as a partner; subdivision and counting; click on 2 & 4; recording yourself. | Static LTR subdivision diagram → **metronome** later | Dimmed |
| 6 | **טכניקה נקייה** (clean technique) | Lead technique | Bends to pitch; vibrato; legato; two-hand muting; speed through accuracy. | Static cards | Higher frets |
| 7 | **להבין את הצוואר** (understand the neck) | Understanding, not memorising shapes | Notes, roots, intervals, pentatonic positions, connecting positions. | **Interactive fretboard** from the **Python-generated data**, with a visible provenance badge | Off |
| 8 | **Les Paul ‏"Number One"** | Case study: the instrument as part of the voice | Sourced core facts (flagged for verification); pickups and controls as tone tools; volume-knob cleanup; "voice = hands + influences + choices". | **Explorable 3D guitar** (drag, zoom, view presets, auto-rotate toggle) → hotspots and tone examples later | Full and interactive |
| 9 | **שירים, שמיעה וקול אישי** (songs, ear and personal voice) | From songs to self-expression | Complete songs and repertoire; learning by ear; improvisation through phrasing and chord tones. | Static 3-step path → phrase lab later | Dimmed |
| 10 | **אימון שעובד** (practice that works) | Practice and measurement | Consistent, focused, distributed practice; observable progress metrics. | *(004)* **Personal practice planner**: duration + goal + ratings → a session of concrete exercises | Off |
| 11 | **משאבים והצעד הבא** (resources and the next step) | Resources and closure | Curated resources (tabs, lessons, theory/ear, tools), marked free or paid. | *(004)* **Personal summary**: map, plan, and next step (shared state with slide 10) | Closing shot |

> The PRD (§4.1) records the content principles. The verification status of each factual claim is in `docs/content-sources.md`.

---

## 3. PRD

See [`../PRD.md`](../PRD.md).

---

## 4. Python Integration

### Browser constraint (applies to every option)

A browser cannot run CPython. Python can reach an HTML presentation in only three ways:

1. **At build time**, by generating files (JSON, JS, HTML) that the page loads.
2. **In the browser via WebAssembly** (Pyodide or PyScript).
3. **On a server** that the page calls over HTTP.

A related detail: pages opened from `file://` cannot `fetch()` JSON files or load ES modules in Chromium. So the project needs either a local HTTP server or generated `.js` data files.

### Option A: Build-time "guitar data engine" (music theory and content pipeline)

A Python package (`guitarlab`) that:

- **Computes music-theory data:** note names on every string and fret in standard tuning, scale and arpeggio positions (minor/major pentatonic in 5 positions, major scale and modes, CAGED shapes), intervals relative to the root, and chord voicings. All of it is derived algorithmically from pitch-class arithmetic, not typed by hand, so it is correct by construction.
- **Compiles structured content:** stages, skills, mistakes and resources are authored in YAML and validated against a schema, then emitted as JSON.
- **Lints Hebrew/BiDi content:** flags Latin terms that aren't wrapped for isolation, mixed-direction numbers and ranges such as "3–6 חודשים", and missing glossary entries.
- Outputs `src/data/*.json` and a `data.js` fallback that also works from `file://`.

| Pros | Cons |
|---|---|
| No runtime cost. The page stays static and can be hosted on GitHub Pages. | Python isn't visible *during* the presentation. It has to be demonstrated through the repo, CI and README. |
| Clearly meaningful: the fretboard (slide 7) and the 3D scale highlights depend on it. | Needs a build step (one command). |
| Testable with `pytest`. For example: "A minor pentatonic position 1 starts at fret 5", or "every scale position spans at most 5 frets". | |
| Runs in CI, a strong signal of good engineering. | |

### Option B: Practice-log analyzer (personal progress report)

A Python CLI that reads a practice log (CSV: date, exercise, BPM, minutes, self-rating). It computes trends, plateaus and per-skill time allocation, and exports a JSON or PNG report that slide 10 can load ("load your own data"). It ships with a realistic sample dataset.

| Pros | Cons |
|---|---|
| Directly supports the "measure progress" goal. | Needs a sample dataset; a synthetic dataset risks looking contrived. |
| Natural fit for pandas and matplotlib. | Real value depends on users actually logging practice. |
| Easy to demo with a before/after report. | Two artefact flows (static deck plus a user-generated report) make the UX more complex. |

### Option C: Python in the browser (Pyodide / PyScript)

Run the routine builder or theory engine as Python inside the page.

| Pros | Cons |
|---|---|
| Python is visibly "live" in the presentation. | **Downloads about 10 MB or more and takes 2–5 s or more to start.** That is risky during a live talk and poor on weak connections. |
| No server needed. | Needs HTTP serving; offline use requires vendoring Pyodide. |
| | Adds a second runtime for logic JavaScript handles easily. It looks like Python used for its own sake. |

### Option D (not recommended): Local Flask/FastAPI backend

It could save progress and generate plans server-side. But it breaks static hosting, complicates the demo, and adds nothing localStorage can't do.

### Recommendation

**Option A as the core, with Option B as a secondary, smaller tool if time allows.**

Option A gives Python a real job the presentation can't work without: correct music-theory data and validated, consistent Hebrew content. It is also verifiable through tests and CI. Option B extends the "measure progress" theme well, but it should come after the core deck works. Option C is only worth it if the assignment specifically rewards *visible* in-browser Python. In that case, a small, lazily loaded Pyodide "theory playground" on slide 7 could be a stretch goal, started only on a click and never on page load.

### ✅ Decision (iteration 002)

**Option A is adopted.** It starts with the theory engine; the YAML content pipeline comes later. A runtime Python demo will be re-evaluated in a later iteration.

The owner requires that Python be **visibly and verifiably connected** to the presentation. That connection is built in four ways:

| # | Link | How to verify it |
|---|---|---|
| 1 | **The slide 7 fretboard has no hard-coded music data.** Every note, interval label and scale position it draws comes from `src/data/fretboard.json`, which `python -m guitarlab.build` generates. If the file is missing, the fretboard shows an error instead of falling back to built-in data. | Delete or rename the JSON file and reload: the fretboard reports that the data is missing. |
| 2 | **The 3D model's fret positions come from the same JSON.** Python computes them with the equal-temperament fret formula. | Inspect the `fret_positions` field; the procedural model reads it. |
| 3 | **A visible provenance badge** on slide 7 shows the generator name and version, the data's SHA-256 content hash, and the number of keys and scales. | Compare the badge hash with the output of `python -m guitarlab.build --check`. |
| 4 | **Freshness check:** `python -m guitarlab.build --check` exits non-zero if the committed JSON doesn't match what the code would generate now. | Run it, or let a future CI run it. |


---

## 5. 3D Guitar Visualization (Three.js)

### 5.1 What it should contribute

The guitar acts as the presentation's **shared visual anchor and teaching prop**:

| Slide | Role |
|---|---|
| 1 | Hero object; sets the tone |
| 4 | First-position fretboard, with chord shapes as dots on the neck |
| 5 | String vibration synced to the metronome |
| 6 | Interactive anatomy: pickups, controls, toggle, bridge and tailpiece, with explanations and tone examples |
| 7 | Scale positions from the Python data are projected onto the 3D fretboard, linked to the 2D fretboard |
| 10 | Closing shot |

### 5.2 Implementation approach

- **Single persistent `WebGLRenderer`** in a fixed background layer behind the slides. Each slide declares a camera preset `{position, target, fov, highlight}`. Transitions tween the camera (GSAP, or a small custom easing) rather than rebuilding scenes.
- **Model format:** glTF/GLB, compressed with Draco or meshopt, with KTX2 textures. Target size: **≤ 3–5 MB**.
- **Lighting:** an HDRI environment (`RoomEnvironment` or a small studio HDRI) with `MeshPhysicalMaterial`. The clearcoat parameter matters for the lacquered finish. The faded, honey-toned sunburst finish is the visual signature, so the texture work matters more than polygon count.
- **Interaction:** `OrbitControls` with clamped zoom and polar angle. `Raycaster` for hotspots. Hotspot labels are HTML overlays (CSS2DRenderer), so the Hebrew text stays real, selectable and accessible, not baked into textures.
- **Fretboard mapping:** fret positions use the real formula, `d(n) = scale_length × (1 − 2^(−n/12))`, with a Les Paul scale length of about 24.75″. Scale dots sit at the correct physical positions. Python can emit these coordinates as well.
- **Strings:** separate thin cylinder meshes, so they can vibrate (vertex displacement with a sine envelope) and highlight independently.
- **Performance and fallbacks:**
  - Render on demand (only while animating or interacting), and pause when the tab is hidden.
  - Respect `prefers-reduced-motion`.
  - Cap `devicePixelRatio` at 2.
  - Check for WebGL; if it's missing, show a high-quality static render (PNG) so the deck still works.

### 5.3 Asset options and trade-offs

| Option | Quality | Effort | Licensing control | Notes |
|---|---|---|---|---|
| **A. Model it ourselves in Blender**, export to GLB | High (if done well) | High | Full | Best for hotspots: we control the mesh naming (`pickup_neck`, `knob_vol_1`, …). |
| **B. Use an existing licensed model** (e.g. Sketchfab CC-BY), then modify | Medium–high | Low–medium | Depends on licence | Check licence compatibility, attribution and mesh structure. Many models are single merged meshes, which makes hotspots hard. |
| **C. Procedural geometry in Three.js** (ExtrudeGeometry for the body outline with a bevel, LatheGeometry for knobs, boxes for pickups) | Medium (stylised) | Medium | Full | No asset pipeline, small download, and every part is addressable. Looks stylised rather than photoreal. |

**Recommendation:** Start with **C** as a placeholder during the early phases. It unblocks all camera and hotspot work. Then replace it with **A** (or **B**, if a suitably licensed and well-segmented model exists) without changing the scene API. A *stylised, recognisably Les Paul–inspired* look may actually suit an educational deck better than an attempt at photorealism.

### 5.4 Technical challenges

- **Mesh segmentation** for hotspots: B-style assets often need re-rigging in Blender.
- **File size versus fidelity**, especially for textures.
- **Camera choreography** that feels smooth and doesn't disorient the viewer.
- **RTL page with LTR instrument:** the guitar and fretboard keep their natural orientation (see §7.4).
- **Audio:** browsers allow sound only after a user gesture. Pickup tone examples need a deliberate "play" action.

### 5.6 ✅ Decided: model contract (so the placeholder can be swapped out)

The owner accepts a procedural model **for validation only**. It is not the final visual. To make the later upgrade a drop-in replacement, the scene code never touches model internals. It depends only on this contract:

```js
// Any model source (procedural today, a Blender-built GLB later) returns:
{
  object:  THREE.Object3D,              // root, in inches; nut toward +x, top face toward +z
  anchors: {                            // named THREE.Object3D markers, positioned on the model
    body, neck, headstock, pickups, controls, bridge,
    fret1, fret12                       // used by the camera presets
  },
  dispose(): void
}
```

- **Camera presets** (`presets.js`) aim at *anchors*, not coordinates. A new model only has to provide the same anchor names. In a GLB these are empty nodes named in Blender.
- **The stage** (`stage.js`) owns the renderer, lights, environment, controls and render loop, and it is model-agnostic.
- **The upgrade path** is to add `guitar-gltf.js`, which returns the same contract via `GLTFLoader`, and switch the factory. No other module changes.
- Only original, procedurally generated geometry and textures are used. **No third-party assets** (decided). Three.js itself is MIT-licensed and vendored together with its licence.

### 5.5 IP and likeness considerations

- "Les Paul" and the Gibson logo are trademarks, and the "open book" headstock shape and body silhouette are protected trade dress. For an educational, non-commercial student project, the safe approach is:
  - **no Gibson logo** or brand text on the model,
  - describe it as "inspired by" Jimmy Page's 1959 Les Paul Standard "Number One",
  - a credits note.
- Don't use photographs of Page or the actual guitar unless they are licensed for reuse.

---

## 6. JavaScript Interactions (beyond navigation)

Ranked by educational value relative to effort:

| # | Feature | Teaches | Key implementation notes |
|---|---|---|---|
| 1 | **Self-assessment skill radar** (slide 2, reused on 3, 9 and 10) | That skills develop unevenly; self-awareness | SVG radar; 8 sliders; `localStorage`. Drives recommendations later in the deck. |
| 2 | **Interactive fretboard** (slide 7) | Note locations, scale positions, intervals | SVG built from the Python JSON; key/scale/position selectors; note-name or interval labels; always LTR. |
| 3 | **Practice metronome with "gap click"** (slide 5) | Internal time, subdivision | Web Audio API with a lookahead scheduler, the accurate approach (not `setInterval` timing); tap tempo; muted-bar mode. |
| 4 | **Swim-lane roadmap with a practice-hours control** (slide 3) | Non-linear progress; ranges instead of promises | SVG/HTML lanes; bands widen or narrow; clicking a stage shows its focus items. Copy explains that bands are illustrative. |
| 5 | **3D hotspots and camera presets** (slides 6, 7) | Instrument anatomy; tone controls | Raycasting; HTML labels; synced with the 2D fretboard. |
| 6 | **Practice routine builder** (slide 9) | How to structure a session | Inputs: minutes available, goal, and the radar's weak areas. Output: a time-boxed plan. Rule-based logic from YAML rules. |
| 7 | **Note and phrase playback** (slides 6, 7, 8) | What phrasing and pickup choice actually sound like | Karplus–Strong plucked-string synthesis in Web Audio, so no audio files or licensing are needed. A simple low-pass filter models the neck vs. bridge pickup difference (a clear simplification, labelled as such). |
| 8 | **Myth vs. fact flip cards** (slide 9) | Common mistakes | CSS 3D flip; keyboard accessible. |
| 9 | **Personal summary and export** (slide 10) | Turning knowledge into action | Combines the radar, focus areas and resources; print stylesheet; "copy as text". |

**Navigation layer (baseline):**

- keyboard, click, swipe and wheel (debounced)
- URL hash deep links (`#/7`)
- progress bar
- overview grid (`O` key)
- fullscreen (`F`)
- presenter notes in a second window (stretch goal)
- `Esc` to close overlays

### ✅ Priorities decided (iteration 002)

| Priority | Features |
|---|---|
| **Core** | Polished navigation, skill radar (#1), interactive roadmap (#4), Python-powered fretboard (#2), high-quality 3D guitar (#5), practical recommendations, curated resources |
| **Later iterations** | Metronome (#3), routine builder (#6), audio synthesis (#7), myth/fact cards (#8), phrase lab, 3D hotspots with tone examples |

The routine builder is replaced for now by a **static example session** on slide 10. The full personal summary (#9) is reduced to **personal next steps** on slide 11, computed from the radar. *(Superseded in iteration 004: slide 10 now has the practice planner, and slide 11 a personal summary.)*

Rule: **no control appears in the UI unless it works.** Planned features are not shown as disabled stubs.

> **Decision needed: arrow-key direction in RTL.** The prototype implements the proposal below provisionally. In an RTL deck, "next" is visually leftward. I propose: `←` or `Space`/`PageDown` = next, `→` = previous, and a right-to-left progress bar. Some presenters' clickers send `→`/`PageDown` for next, though. `PageDown` always means next, so clickers keep working either way.

---

## 7. Visual Design Direction

### 7.1 Concept: "Late-night studio"

Dark, warm and focused, like a dim rehearsal room with amp lights. The palette comes from the **faded honey-amber sunburst** of a late-'50s Les Paul, set against deep warm blacks.

| Token | Role | Draft value |
|---|---|---|
| `--bg` | Stage background | `#121011` (warm near-black) |
| `--surface` | Cards | `#1D191A` |
| `--text` | Primary text | `#F2EBDD` (warm off-white) |
| `--text-muted` | Secondary | `#A89F91` |
| `--accent` | Primary accent (sunburst amber) | `#E3A43B` |
| `--accent-deep` | Secondary warm accent (cherry fade) | `#A8432E` |
| `--data` | Interactive or data elements (cool, so they stand apart) | `#5FB7B0` |
| `--success` / `--warn` | Feedback | Tuned for contrast with the palette |

Contrast must be checked to WCAG AA (body text ≥ 4.5:1). Dark slides can look washed out on some projectors, so **a light "projector" theme toggle** should exist (tokens make this cheap).

### 7.2 Typography

| Role | Proposal | Why |
|---|---|---|
| Body (Hebrew and Latin) | **Heebo** or **Assistant** | Excellent Hebrew glyphs, a matching Latin design, many weights, free (Google Fonts). |
| Display or titles | **Rubik** (heavier weights) or **Secular One** | Strong Hebrew display character. Rubik pairs cleanly with Heebo. |
| Tab or technical | **JetBrains Mono** or **IBM Plex Mono** | Monospace is needed so tab columns align. |

Fonts should be **self-hosted** (woff2, subset to Hebrew and Basic Latin), so the deck works offline during a live presentation.

### 7.3 Layout and hierarchy

- ~~Fixed 16:9 stage, scaled to fit~~ **Revised (iteration 002): fluid full-viewport slides.**
  - Each slide fills the viewport. Typography and spacing scale with `clamp()`.
  - On wide screens, content sits in the inline-start column (the right side, in RTL) and the 3D guitar uses the other side.
  - Below about 900 px, slides stack into one column and can scroll internally. The 3D layer dims behind the text.
  - Why: a scaled 16:9 stage makes text tiny on phones and portrait screens. Fluid layout with tested breakpoints is more robust and still looks composed on a projector.
- Hierarchy per slide:
  1. Kicker (small label, accent colour)
  2. Title (one idea)
  3. At most 3 key points
  4. The interaction
  5. Details on demand (expandable cards or side panels)
- **Consistent skill-card template:** "למה זה חשוב" (why it matters) / "איך מתרגלים" (how to practise) / "איך יודעים שזה עובד" (how you'll know it's working). This repeated structure makes the deck easy to scan and keeps content practical.
- The 3D layer sits behind the content. Slides with heavy text get a scrim for legibility.

### 7.4 Presenting technical information (RTL/BiDi rules)

- `<html lang="he" dir="rtl">`. CSS uses **logical properties only** (`margin-inline-start`, `inset-inline-end`, `text-align: start`), so layout mirrors correctly.
- **Tab, fretboards, chord diagrams and the 3D guitar stay LTR.** Tab is a left-to-right time axis by convention, and mirroring a fretboard would teach the wrong picture. These blocks get `dir="ltr"` and are visually framed as "diagrams".
- Latin terms inside Hebrew text (BPM, Les Paul, CAGED, "Number One") are wrapped in `<bdi>` or `<span dir="ltr">` with `unicode-bidi: isolate`. Numeric ranges and units are tested explicitly ("120 BPM", "3–6 חודשים").
- **Terminology:** Hebrew-speaking guitarists commonly use English terms ("בנדים", "פאלם מיוט", "לגאטו"). Proposal: a Hebrew term with the English in parentheses on first use, and a glossary overlay. This needs to be decided once, then enforced by the Python lint.
  - **✅ Decided:** use natural Hebrew terms as guitarists actually speak them. On first use, add the English term in an isolated LTR span, e.g. "בנד (bend)". A glossary file and lint come in a later iteration.
- Diagrams use the accent colour for the *root* note, `--data` for other scale notes, and muted colours for context, consistently across the 2D and 3D views.

---

## 8. Development Roadmap (4 phases)

> **Iteration 002 (done):** Phase 1 followed the list the owner gave in prompt 002. It also included the radar, a basic roadmap and personal next steps, because these are core features that could be built completely without stubs. The YAML content pipeline moves to Phase 2; skill and stage content lives in `src/js/content/skills.js` for now. Results and limitations are in `docs/iterations.md`.

### Phase 1: Foundations and risk spikes

**Deliverables**

- Repo scaffold, `.gitignore`, licence, initial README, and the PRD
- Slide engine (navigation, hash routing, progress, overview), using vanilla ES modules
- Design tokens; RTL base CSS; self-hosted Hebrew fonts
- 10 slide shells with **draft Hebrew content**, using the skill-card template
- **3D spike:** procedural placeholder guitar, one camera preset per slide, render-on-demand, WebGL fallback
- **Python skeleton:** `guitarlab` package; fretboard note map plus a minor pentatonic generator; first tests; `build` command emitting JSON
- Prompt log started in `docs/prompts/`

**Validation**

- All slides reachable by keyboard, click, swipe and deep link
- Hebrew renders correctly, including mixed-direction test strings
- The 3D scene holds about 60 fps on the presentation laptop
- `pytest` passes
- Content outline reviewed by the owner

### Phase 2: Python data engine and core interactions

**Deliverables**

- Full theory generation: pentatonic in 5 positions, major scale, CAGED, intervals, fret coordinates
- YAML content, validated against a schema, compiled to JSON; BiDi/glossary lint
- Interactive fretboard, metronome (Web Audio), skill radar with persistence, and swim-lane roadmap
- CI workflow (GitHub Actions): lint, test, build

**Validation**

- Theory output spot-checked against known references (e.g. A minor pentatonic position 1 = frets 5–8)
- The metronome stays tight over 5 minutes (no audible drift; scheduler verified)
- Radar values persist across reloads and appear on slides 3, 9 and 10
- CI passes on push

### Phase 3: 3D guitar and integration

**Deliverables**

- Final guitar model (Blender-built or a licensed model), GLB at 5 MB or less
- Hotspots with Hebrew HTML labels
- Pickup tone examples (Karplus–Strong synthesis)
- Scale highlights from the Python data on the 3D neck, linked to the 2D fretboard
- String vibration
- Routine builder, phrase lab, myth/fact cards, and the personal summary

**Validation**

- Every hotspot is reachable and readable
- 3D and 2D fretboard positions match for at least 3 test scales
- Load time on a typical connection is about 4 s or less to an interactive first slide (3D can stream in afterwards)
- Reduced-motion mode works
- Fallback image shows when WebGL is disabled

### Phase 4: Content accuracy, polish, documentation and release

**Deliverables**

- Content accuracy review; sources documented in `docs/content-sources.md`
- Accessibility pass: focus order, ARIA, text alternatives for canvas and 3D content, contrast
- Light "projector" theme; print stylesheet for the summary
- README with screenshots/GIF, setup, architecture, and Python usage
- Final PRD revision with the decisions made
- Prompt and iteration log completed
- GitHub Pages deployment

**Validation**

- Lighthouse: Accessibility ≥ 95, Performance ≥ 85 on desktop
- A rehearsal run-through of the whole deck in presentation mode
- One beginner and one experienced guitarist give feedback, which is addressed
- A fresh clone, built from the README alone, works

---

## 9. Repository Structure

```
guitar-journey/
├── README.md                    # Overview, screenshots, setup, usage, architecture
├── PRD.md                       # Product requirements (living document)
├── LICENSE
├── .gitignore
├── .github/
│   └── workflows/ci.yml         # pytest + content validation + build (+ Pages deploy)  [as built: pages.yml, iteration 005]
│
├── index.html                   # Presentation entry point (lang="he" dir="rtl")
├── src/
│   ├── css/
│   │   ├── tokens.css           # Colours, spacing, typography, themes
│   │   ├── base.css             # Reset, RTL/BiDi rules, fonts
│   │   ├── deck.css             # Stage, slides, transitions
│   │   └── components/          # fretboard.css, radar.css, cards.css, …
│   ├── js/
│   │   ├── main.js
│   │   ├── core/                # deck.js, router.js, state.js (localStorage), events.js
│   │   ├── components/          # fretboard.js, metronome.js, radar.js, roadmap.js,
│   │   │                        # routine-builder.js, flip-cards.js, summary.js
│   │   ├── audio/               # scheduler.js, pluck-synth.js (Karplus–Strong)
│   │   └── three/               # scene.js, guitar-model.js, camera-presets.js, hotspots.js
│   ├── data/                    # GENERATED by Python: *.json + data.js (do not edit)
│   └── vendor/                  # Pinned three.js build (works offline)
│
├── assets/
│   ├── models/                  # number-one.glb (+ source .blend in a separate repo/LFS if large)
│   ├── textures/
│   ├── fonts/                   # Self-hosted woff2 subsets
│   └── images/                  # WebGL fallback render, icons
│
├── content/                     # SOURCE OF TRUTH for structured content (Hebrew)
│   ├── skills.he.yaml
│   ├── stages.he.yaml
│   ├── mistakes.he.yaml
│   ├── resources.yaml
│   ├── routines.yaml            # Routine-builder rules
│   └── glossary.he.yaml
│
├── python/
│   ├── pyproject.toml
│   ├── guitarlab/
│   │   ├── theory.py            # Pitch classes, intervals, scales
│   │   ├── fretboard.py         # Note map, positions, CAGED, fret coordinates
│   │   ├── content.py           # YAML loading + schema validation
│   │   ├── bidi_lint.py         # Hebrew/BiDi/glossary checks
│   │   ├── practice_log.py      # (Option B, later) log analyzer
│   │   └── build.py             # CLI: python -m guitarlab.build
│   └── tests/
│
└── docs/
    ├── PLANNING.md              # This document
    ├── architecture.md          # Data flow: content/ + python/ → src/data → JS
    ├── content-sources.md       # References for factual claims
    ├── decisions/               # Short ADRs (one file per significant decision)
    ├── prompts/                 # Development prompt log (001-…, 002-…)
    ├── iterations.md            # What changed per iteration and why
    └── screenshots/
```

> **✅ Decided (iteration 002): commit the generated data.** `--check` guards freshness. The original trade-off is below for reference.
>
> **Decision needed (original):** commit the generated `src/data/` or not.
> - *Committing* lets GitHub Pages and a plain clone work without Python.
> - *Not committing* is cleaner, but requires CI to build before deploying.
>
> I recommend **committing** it, with a CI check that fails if the committed output is stale. That is simpler for graders and reviewers.

---

## 10. Technical and Content Risks

### Content

| Risk | Mitigation |
|---|---|
| **"Number One" details are often misquoted** (purchase price, exact year of purchase and modifications, pickup history, neck shaving). | Use only claims we can source. The core facts are high-confidence: a 1959 Les Paul Standard, bought from Joe Walsh in 1969, neck shaved to a slimmer profile, used extensively with Led Zeppelin. Check any detail beyond those against at least two reputable sources, or leave it out. |
| **Progression timelines have little rigorous evidence**, and published "you'll be intermediate in X months" claims are mostly opinion. | **✅ Decided (002):** the deck shows **no calendar predictions**. *(Refined in 003: an illustrative "over time" view on slide 3 is allowed, because it is labelled "illustration, not a forecast" and paired with "time alone does not decide".)* Stages are defined by observable competencies, and the deck says explicitly that pace varies with practice quantity, practice quality, background and goals. It leans on well-supported principles instead: deliberate and focused practice, distributed practice, feedback through recording. |
| Hebrew guitar terminology isn't standardised. | Write a glossary first, and agree on it before writing slide content. |
| Resource links and pricing go out of date (paid apps, YouTube channels). | Prefer long-lived resources. Note whether each is free or paid without quoting prices. Record a "last checked" date. |
| Content overload, since 10 slides covering this much risks walls of text. | Progressive disclosure, the 3-point limit, and details in expandable cards. |

### Technical

| Risk | Mitigation |
|---|---|
| **Getting a 3D model asset** with suitable quality and licence, and segmented into parts. | Procedural placeholder first. Timebox the search for a licensed model; fall back to modelling it ourselves. |
| WebGL performance on the actual presentation machine or projector setup. | Render on demand, capped DPR, test early on the real hardware, static fallback. |
| `file://` limits on ES modules and `fetch`. | Document `python -m http.server`. Also emit `data.js`. Deploy to GitHub Pages. |
| Audio needs a user gesture; latency and drift. | Explicit play buttons; a lookahead scheduler on the `AudioContext` clock. |
| BiDi bugs in mixed Hebrew/English/number strings. | A test page with edge cases, plus the Python lint. |
| Accessibility of canvas and 3D content. | HTML equivalents for each interaction (lists, tables), plus ARIA live regions. |
| Scope creep: 9 interactions plus 3D plus Python. | Prioritise interactions 1–5 as must-haves; the rest are should/could-haves (see PRD). |
| Trademark or likeness issues with Gibson branding. | No logos; "inspired by" wording; credits page. |

### Assumptions to validate before implementation

1. The assignment accepts build-time Python as "meaningful", or it expects Python to run visibly during the demo. This decides Option A vs. adding Option C.
2. The presentation will be shown on a known laptop and browser. Which one?
3. Whether the deck must work offline (no internet at the venue).
4. Roughly how long the live presentation is, which affects content density.
5. The audience: fellow students who don't play, or guitarists? This changes the depth of the content.

---

## 11. Recommended Starting Point

**Start with Phase 1, in this order:**

1. **Content outline and glossary in YAML.** Write the Hebrew skill, stage and mistake data first. Content is the core value of the project, the riskiest part to get *right*, and everything else (layout, the roadmap, the routine builder) renders it. Deciding the terminology early prevents rewrites later.
2. **Slide engine and RTL base, with all 10 slide shells.** This gives a working, navigable deck very early, so every later feature has a home and can be reviewed in context.
3. **Python `fretboard.py` and tests.** A small but complete first slice of the data engine (note map plus minor pentatonic positions). It proves the build-to-JSON-to-JS pipeline end to end.
4. **3D spike, timeboxed:** a procedural guitar plus camera presets driven by slide changes. This is the highest *technical* risk, so it needs to be tested early. It doesn't need to look good yet; it needs to prove that the persistent canvas, camera choreography and performance work.

**Why this order:** it reduces the two biggest risks (content accuracy and 3D feasibility) while producing a reviewable deck within the first phase. It also avoids the common trap of polishing the 3D centrepiece while the actual teaching content stays thin.
