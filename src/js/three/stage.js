// The persistent 3D stage. It owns the renderer, camera, lights, controls
// and render loop, and is model-agnostic: it only uses the model contract
// { object, anchors, dispose }.
//
// Two layouts:
//  - fullscreen (desktop): a fixed canvas behind the slides; the guitar is
//    shifted away from the text column with a view offset.
//  - inline (small screens): the canvas is moved into an in-flow viewer box
//    on the slide, so it can never cover text or controls.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PRESETS } from './presets.js';

const TWEEN_MS = 1500;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export class GuitarStage {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.home = { parent: canvas.parentNode, next: canvas.nextSibling };
    this.container = null;
    this.model = model;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    this.mode = 'side';
    this.presetName = 'hero';
    this.spinAmount = 1;
    this.tween = null;
    this.offset = { x: 0, y: 0 };
    this.clock = new THREE.Clock();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
    pmrem.dispose();
    // warm key, cool rim, soft amber kicker: a "late-night studio" look
    scene.add(new THREE.HemisphereLight(0xfff0dc, 0x1a0f0c, 0.3));
    const key = new THREE.DirectionalLight(0xffdcaa, 1.9);
    key.position.set(25, 35, 55);
    const fill = new THREE.DirectionalLight(0xffe9d2, 0.6);
    fill.position.set(-30, 10, 40);
    const rim = new THREE.DirectionalLight(0xa9c1ff, 1.6);
    rim.position.set(-35, -25, -30);
    const glow = new THREE.PointLight(0xe3a43b, 260, 140, 2);
    glow.position.set(-18, -12, 26);
    scene.add(key, fill, rim, glow);
    this.scene = scene;

    // layout: neck pointing up and away from the text column
    this.layout = new THREE.Group();
    this.layout.rotation.z = 2.2;
    this.spin = new THREE.Group();
    this.layout.add(this.spin);
    this.spin.add(model.object);
    scene.add(this.layout);
    this.layout.updateMatrixWorld(true);

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.5, 500);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enabled = false;
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 95;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.addEventListener('start', () => { this.tween = null; });

    this.resizeObserver = new ResizeObserver(() => this.#resize());
    this.#placeCamera(this.#presetPose('hero'));
    this.#resize();
    window.addEventListener('resize', () => this.#resize());
    renderer.setAnimationLoop(() => this.#frame());
  }

  get inline() { return this.container !== null; }

  /**
   * Called on every slide change.
   * @param {string} presetName
   * @param {'side'|'dim'|'interactive'|'off'} mode
   * @param {HTMLElement|null} container  inline viewer box, or null for fullscreen
   */
  setSlide(presetName, mode, container = null) {
    this.#attach(container);
    this.mode = mode;
    this.controls.enabled = mode === 'interactive';
    if (mode !== 'interactive') this.setAutoRotate(false);
    if (mode !== 'off') this.goTo(presetName, { instant: this.justAttached });
    this.justAttached = false;
  }

  goTo(presetName, { instant = false } = {}) {
    if (!PRESETS[presetName]) return;
    this.presetName = presetName;
    const to = this.#presetPose(presetName);
    if (instant || this.reducedMotion.matches) { this.#placeCamera(to); return; }
    const fromOff = this.camera.position.clone().sub(this.controls.target);
    const toOff = to.pos.clone().sub(to.target);
    this.tween = {
      from: { target: this.controls.target.clone(), dir: fromOff.clone().normalize(), dist: fromOff.length(), off: { ...this.offset }, fov: this.camera.fov },
      to: { target: to.target, dist: toOff.length(), off: to.off, fov: to.fov },
      // rotate the viewing direction along the shortest arc instead of cutting through the model
      arc: new THREE.Quaternion().setFromUnitVectors(fromOff.normalize(), toOff.normalize()),
      t0: performance.now(),
    };
  }

  setAutoRotate(on) {
    this.controls.autoRotate = on;
  }

  #attach(container) {
    if (container === this.container) return;
    if (this.container) this.resizeObserver.unobserve(this.container);
    this.container = container;
    if (container) {
      container.append(this.canvas);
      this.canvas.classList.add('scene--inline');
      this.resizeObserver.observe(container);
    } else {
      this.home.parent.insertBefore(this.canvas, this.home.next);
      this.canvas.classList.remove('scene--inline');
    }
    this.justAttached = true;
    this.#resize();
  }

  #layoutOffset() {
    if (this.inline || this.mode === 'dim') return { x: 0, y: 0 };
    return { x: this.mode === 'interactive' ? 0.2 : 0.22, y: 0 };
  }

  #presetPose(name) {
    const p = PRESETS[name];
    const local = this.model.anchors[p.anchor].position.clone();
    const target = this.layout.localToWorld(local.clone());
    const offset = new THREE.Vector3(...p.offset).multiplyScalar(this.inline ? p.inlineZoom ?? 1 : 1);
    const pos = this.layout.localToWorld(local.add(offset));
    return { pos, target, off: this.#layoutOffset(), fov: p.fov };
  }

  #placeCamera({ pos, target, off, fov }) {
    this.tween = null;
    this.camera.position.copy(pos);
    this.controls.target.copy(target);
    this.camera.fov = fov;
    this.offset = { ...off };
    this.#applyViewOffset();
    this.camera.lookAt(target);
  }

  #size() {
    if (this.inline) return { w: this.container.clientWidth || 1, h: this.container.clientHeight || 1 };
    return { w: window.innerWidth, h: window.innerHeight };
  }

  #applyViewOffset() {
    const { w, h } = this.#size();
    this.camera.aspect = w / h;
    // Shifting the rendered window moves the guitar away from the text column.
    this.camera.setViewOffset(w, h, this.offset.x * w, this.offset.y * h, w, h);
    this.camera.updateProjectionMatrix();
  }

  #resize() {
    const { w, h } = this.#size();
    this.renderer.setSize(w, h, false);
    if (this.tween) return;
    this.offset = this.#layoutOffset();
    this.#applyViewOffset();
  }

  #frame() {
    const dt = this.clock.getDelta();
    const t = this.clock.elapsedTime;
    if (this.mode === 'off' && !this.tween) return; // canvas is hidden: skip rendering

    if (this.tween) {
      const k = Math.min(1, (performance.now() - this.tween.t0) / TWEEN_MS);
      const e = ease(k);
      const { from, to, arc } = this.tween;
      const dir = from.dir.clone().applyQuaternion(new THREE.Quaternion().slerp(arc, e));
      this.controls.target.lerpVectors(from.target, to.target, e);
      this.camera.position.copy(this.controls.target).addScaledVector(dir, from.dist + (to.dist - from.dist) * e);
      this.camera.fov = from.fov + (to.fov - from.fov) * e;
      this.offset = { x: from.off.x + (to.off.x - from.off.x) * e, y: from.off.y + (to.off.y - from.off.y) * e };
      this.#applyViewOffset();
      this.camera.lookAt(this.controls.target);
      if (k === 1) this.tween = null;
    } else if (this.controls.enabled) {
      this.controls.update();
    }

    // gentle idle motion, faded out while the viewer controls the guitar
    const spinTarget = this.controls.enabled || this.reducedMotion.matches ? 0 : 1;
    this.spinAmount += (spinTarget - this.spinAmount) * Math.min(1, dt * 2);
    this.spin.rotation.x = Math.sin(t * 0.45) * 0.16 * this.spinAmount;
    this.spin.rotation.y = Math.sin(t * 0.3) * 0.05 * this.spinAmount;

    this.renderer.render(this.scene, this.camera);
  }
}
