// The persistent 3D stage behind the slides. It owns the renderer, camera,
// lights, controls and render loop, and is model-agnostic: it only uses the
// model contract { object, anchors, dispose }.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PRESETS } from './presets.js';

const TWEEN_MS = 1400;
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
    this.model = model;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    this.narrow = matchMedia('(max-width: 900px), (max-height: 560px)');
    this.mode = 'side';
    this.presetName = 'hero';
    this.spinAmount = 1;
    this.tween = null;
    this.offset = { x: 0, y: 0 };
    this.clock = new THREE.Clock();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffe6c8, 0x1a0f0c, 0.35));
    const key = new THREE.DirectionalLight(0xffd6a0, 2.4);
    key.position.set(30, 40, 60);
    const rim = new THREE.DirectionalLight(0x9db8ff, 1.4);
    rim.position.set(-40, -10, -30);
    const glow = new THREE.PointLight(0xe3a43b, 300, 120, 2);
    glow.position.set(-20, -10, 30);
    scene.add(key, rim, glow);
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
    this.controls.maxDistance = 90;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.addEventListener('start', () => { this.tween = null; });

    this.#placeCamera(this.#presetPose('hero'));
    this.#resize();
    window.addEventListener('resize', () => this.#resize());
    renderer.setAnimationLoop(() => this.#frame());
  }

  /** Called on every slide change. mode: side | dim | interactive | off */
  setSlide(presetName, mode) {
    this.mode = mode;
    this.controls.enabled = mode === 'interactive';
    if (mode !== 'interactive') this.setAutoRotate(false);
    if (mode !== 'off') this.goTo(presetName);
  }

  goTo(presetName) {
    if (!PRESETS[presetName]) return;
    this.presetName = presetName;
    const to = this.#presetPose(presetName);
    if (this.reducedMotion.matches) { this.#placeCamera(to); return; }
    this.tween = {
      from: { pos: this.camera.position.clone(), target: this.controls.target.clone(), off: { ...this.offset }, fov: this.camera.fov },
      to,
      t0: performance.now(),
    };
  }

  setAutoRotate(on) {
    this.controls.autoRotate = on;
  }

  #layoutOffset() {
    if (this.mode === 'dim') return { x: 0, y: 0 };
    if (this.narrow.matches) return { x: 0, y: this.mode === 'interactive' ? 0.24 : 0 };
    return { x: this.mode === 'interactive' ? 0.2 : 0.22, y: 0 };
  }

  #presetPose(name) {
    const p = PRESETS[name];
    const anchor = this.model.anchors[p.anchor];
    const local = anchor.position.clone();
    const target = this.layout.localToWorld(local.clone());
    const pos = this.layout.localToWorld(local.add(new THREE.Vector3(...p.offset)));
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

  #applyViewOffset() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    // Shifting the rendered window moves the guitar away from the text column.
    this.camera.setViewOffset(w, h, this.offset.x * w, this.offset.y * h, w, h);
    this.camera.updateProjectionMatrix();
  }

  #resize() {
    const w = window.innerWidth, h = window.innerHeight;
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
      const { from, to } = this.tween;
      this.camera.position.lerpVectors(from.pos, to.pos, e);
      this.controls.target.lerpVectors(from.target, to.target, e);
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
