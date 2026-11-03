# Architecture

## Overview

```
┌────────────────────────────┐   python -m guitarlab.build   ┌──────────────────────────┐
│ python/guitarlab/          │ ────────────────────────────▶ │ src/data/fretboard.json  │
│  theory.py   (spelling,    │   deterministic, SHA-256      │  (committed; --check     │
│               intervals)   │   content hash in meta        │   guards freshness)      │
│  fretboard.py (tuning,     │                               └────────────┬─────────────┘
│   positions, fret formula) │                                            │ fetch()
│  build.py    (JSON + CLI)  │                                            ▼
└────────────────────────────┘          ┌───────────────────────────── src/js/main.js ───────────────┐
                                        │                                                          │
                                        │  components/fretboard.js ◀── cells, positions, spelling │
                                        │  three/guitar-procedural.js ◀── fret_positions          │
                                        │  core/deck.js · core/ratings.js · components/*          │
                                        └──────────────────────────────────────────────────────────┘
```

The presentation is static: `index.html` plus ES modules, with no build step and no framework. Python runs **at build time**. Its output is the only source of music-theory data in the page.

## Python → presentation link

| What Python generates | Where it is used | How to verify |
|---|---|---|
| `scales.<id>.keys.<tonic>.cells`: every scale tone on the neck, with spelling, interval and position membership | Slide 7 fretboard (`components/fretboard.js`). The JS contains no theory logic. | Rename `src/data/fretboard.json` and reload: slide 7 shows a "data not loaded" error. |
| `positions[].span` | Position selector labels | Compare the labels with `pentatonic_positions()` |
| `fret_positions.distance_from_nut_in` (equal temperament) | 2D fret spacing (to scale) and 3D fret placement | The smoke test counts the 22 frets in the 3D model |
| `meta.content_sha256` | Provenance badge on slide 7 (hover it for the full hash) | `python -m guitarlab.build --check` prints the same hash prefix |

## Front-end modules

| Module | Responsibility |
|---|---|
| `core/deck.js` | Slide state; keyboard (RTL: `←` = next), buttons, dots, swipe, `#/n` deep links, progress. Emits `change`. |
| `core/ratings.js` | Shared self-assessment state with localStorage persistence (wrapped in try/catch). Emits `change`. |
| `content/skills.js` | Hebrew skill and stage content used by several components. Planned to move to YAML compiled by Python. |
| `components/radar.js` | Slide 2: 8 sliders, SVG radar, strongest/weakest summary |
| `components/roadmap.js` | Slide 3: stage × skill lanes showing the viewer's ratings; stage details |
| `components/fretboard.js` | Slide 7: renders the generated data; always LTR |
| `components/timeline.js` | Slide 3 "over time" view: phase cards and illustrative growth curves (validated palette, legend and direct labels, table view). Toggles with the roadmap. |
| `components/next-steps.js` | Slide 11: two weakest skills → concrete practice tips with links back to slides |
| `three/stage.js` | Renderer, lights, environment, OrbitControls, camera tweens, render loop. Model-agnostic. |
| `three/presets.js` | Camera presets that aim at **anchor names** |
| `three/guitar-procedural.js` | Procedural model implementing the contract. The carved top is built from inset rings that follow the outline; the burst texture is painted from the same rings. |

The 3D layer is loaded with a dynamic `import()` inside a try/catch. If WebGL or Three.js fails, the deck keeps working, and slide 8 replaces its 3D controls with an explanatory message. It never shows dead controls.

## 3D model contract

```js
{
  object:  THREE.Object3D,   // inches; nut toward +x, bass side +y, top face +z
  anchors: { center, body, neck, headstock, pickups, controls, bridge, fret1, fret12 },
  dispose(): void
}
```

To replace the placeholder with a detailed model:

1. Model the guitar in Blender, using original work only.
2. Add empty objects named after the anchors.
3. Export a Draco- or meshopt-compressed GLB of 5 MB or less.
4. Add `three/guitar-gltf.js`, which loads it with `GLTFLoader` and returns the same contract.
5. Switch the factory call in `main.js`.

`stage.js` and `presets.js` don't change.

## Rendering behaviour

- Each slide declares `data-scene` (a preset) and `data-scene-mode`: `side`, `dim`, `interactive` or `off`.
- **Two layouts.** On screens wider than 900 px, the canvas is a fixed fullscreen layer behind the slides. On small screens, `main.js` moves the canvas into the slide's `[data-mobile-viewer]` box (slides 1 and 8 only), via `stage.setSlide(preset, mode, container)`. Every other slide sets the mode to `off`, so the guitar never sits behind text.
- Camera transitions rotate the viewing direction along the shortest arc (quaternion slerp) while interpolating the target and distance, so the camera circles the guitar instead of cutting through it.
- CSS fades the canvas. The loop skips rendering entirely in `off` mode.
- On wide screens, `camera.setViewOffset` shifts the guitar away from the text column. On narrow screens the guitar sits dimmed behind the text, except on slide 8.
- `prefers-reduced-motion` disables the idle motion and turns camera tweens into cuts. Slide transitions become near-instant.
- The pixel ratio is capped at 2.

## RTL / BiDi rules

- `<html lang="he" dir="rtl">`, with CSS logical properties throughout.
- Latin terms, numbers and units inside Hebrew text use `<bdi>`.
- In JS-generated text where elements can't be used (`<option>` labels), they are wrapped in Unicode isolates (U+2066 … U+2069). This fixed fret ranges such as "5–8" rendering as "8–5".
- Musical diagrams stay LTR: the fretboard (nut on the left, high E on top, as in tab), the subdivision diagram, and the 3D guitar.
- Timelines and progress UI follow Hebrew direction: the progress bar fills from the right, roadmap stages run right to left, and range sliders start on the right.
