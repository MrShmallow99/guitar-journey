// Procedural placeholder guitar, inspired by a late-1950s single-cutaway
// solid body with a faded sunburst top. Original geometry and textures
// only (no third-party assets, no logos). Intended for validating the
// scene, camera and interaction pipeline; a detailed model will replace it
// through the same contract (see docs/architecture.md):
//
//   { object: THREE.Object3D, anchors: { [name]: THREE.Object3D }, dispose() }
//
// Units are inches. Local frame: nut toward +x, bass side toward +y,
// top face toward +z. The bridge saddle line sits at x = BRIDGE_X.

import * as THREE from 'three';

const SCALE_LENGTH = 24.75;
const BRIDGE_X = -2.0;
const NUT_X = BRIDGE_X + SCALE_LENGTH;
const TOP_Z = 2.66;          // carved-top surface height
const BOARD_Z = 2.75;        // underside of the fretboard
const BOARD_T = 0.25;
const STRING_Z_NUT = BOARD_Z + BOARD_T + 0.1;
const STRING_Z_BRIDGE = 3.42;

function bodyShape() {
  const s = new THREE.Shape();
  s.moveTo(-8.6, 0);
  s.bezierCurveTo(-8.6, 4.0, -6.2, 6.5, -3.6, 6.5);   // lower bout, bass side
  s.bezierCurveTo(-1.4, 6.5, -0.2, 4.7, 1.4, 4.6);    // waist
  s.bezierCurveTo(3.0, 4.5, 5.4, 5.1, 6.9, 4.1);      // upper bout
  s.bezierCurveTo(8.2, 3.2, 8.7, 2.0, 8.6, 1.05);     // shoulder into the neck joint
  s.lineTo(8.6, -1.05);
  s.bezierCurveTo(7.4, -1.1, 6.6, -1.6, 6.5, -2.5);   // inside of the cutaway
  s.bezierCurveTo(6.4, -3.2, 7.2, -3.4, 7.7, -3.7);   // horn tip
  s.bezierCurveTo(8.1, -4.6, 6.8, -5.4, 5.0, -5.2);
  s.bezierCurveTo(3.2, -5.0, 2.6, -4.6, 1.4, -4.6);   // waist, treble side
  s.bezierCurveTo(-0.2, -4.7, -1.4, -6.5, -3.6, -6.5);
  s.bezierCurveTo(-6.2, -6.5, -8.6, -4.0, -8.6, 0);
  return s;
}

// Faded honey-to-cherry burst with a hint of flame figure, painted on a canvas.
function sunburstTexture() {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  // map shape coords x∈[-9,9], y∈[-7,7] onto the canvas
  const px = (x) => ((x + 9) / 18) * size;
  const py = (y) => (1 - (y + 7) / 14) * size;

  g.save();
  g.translate(px(-1.2), py(0));
  g.scale(1, 14 / 18 * 1.25);
  const grad = g.createRadialGradient(0, 0, 10, 0, 0, size * 0.47);
  grad.addColorStop(0, '#f2c768');
  grad.addColorStop(0.45, '#e4a648');
  grad.addColorStop(0.7, '#c27a2e');
  grad.addColorStop(0.84, '#8a3b1d');
  grad.addColorStop(0.94, '#4f1c11');
  grad.addColorStop(1, '#2a0f0a');
  g.fillStyle = grad;
  g.fillRect(-size, -size * 2, size * 2, size * 4);
  g.restore();

  // flame figure: soft bands across the grain, mirrored at the centre seam
  g.globalCompositeOperation = 'overlay';
  for (let i = 0; i < 90; i++) {
    const x = (i / 90) * size;
    const w = 3 + (i % 5);
    g.strokeStyle = i % 2 ? 'rgba(255,240,200,0.07)' : 'rgba(60,20,5,0.08)';
    g.lineWidth = w;
    for (const dir of [-1, 1]) {
      g.beginPath();
      for (let k = 0; k <= 20; k++) {
        const y = size / 2 + dir * (k / 20) * (size / 2);
        const wobble = Math.sin(k * 0.9 + i * 0.7) * 6;
        const xx = x + wobble + dir * (k / 20) * 22;
        k === 0 ? g.moveTo(xx, y) : g.lineTo(xx, y);
      }
      g.stroke();
    }
  }
  g.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.repeat.set(1 / 18, 1 / 14);
  tex.offset.set(0.5, 0.5);
  return tex;
}

function materials() {
  return {
    top: new THREE.MeshPhysicalMaterial({ map: sunburstTexture(), roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 }),
    edge: new THREE.MeshPhysicalMaterial({ color: 0x5a1d12, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 }),
    mahogany: new THREE.MeshPhysicalMaterial({ color: 0x4a1f12, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
    binding: new THREE.MeshStandardMaterial({ color: 0xe9dcc0, roughness: 0.45 }),
    board: new THREE.MeshStandardMaterial({ color: 0x24150e, roughness: 0.7 }),
    fret: new THREE.MeshStandardMaterial({ color: 0xd8d2c8, metalness: 1, roughness: 0.22 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xe6e6e6, metalness: 1, roughness: 0.14 }),
    nickel: new THREE.MeshStandardMaterial({ color: 0xcfc6b4, metalness: 1, roughness: 0.25 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xeadfc6, roughness: 0.4 }),
    inlay: new THREE.MeshStandardMaterial({ color: 0xf3ead8, roughness: 0.25, emissive: 0x1c1a16 }),
    headstock: new THREE.MeshPhysicalMaterial({ color: 0x0b0a0a, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 }),
    // no transmission: it would add a full extra render pass every frame
    knob: new THREE.MeshPhysicalMaterial({ color: 0xd99a2b, roughness: 0.22, clearcoat: 1 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd8b25a, metalness: 1, roughness: 0.3 }),
    string: new THREE.MeshStandardMaterial({ color: 0xdedad2, metalness: 1, roughness: 0.3 }),
    nut: new THREE.MeshStandardMaterial({ color: 0xf1ead8, roughness: 0.5 }),
  };
}

const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
};

// A cylinder between two points (used for strings).
function rod(a, b, radius, mat) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const geo = new THREE.CylinderGeometry(radius, radius, dir.length(), 8, 1, true);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

/**
 * @param {{ fretDistances?: number[] }} options  fret distances from the nut
 *   in inches (generated by the Python data engine).
 */
export function createProceduralGuitar({ fretDistances = [] } = {}) {
  const mat = materials();
  const root = new THREE.Group();
  root.name = 'guitar';
  const shape = bodyShape();

  // --- body: back, binding, carved top (approximated by a deep rounded bevel)
  const back = new THREE.ExtrudeGeometry(shape, { depth: 1.55, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 3, curveSegments: 40 });
  root.add(mesh(back, [mat.mahogany, mat.edge], 0, 0, 0.12));
  const binding = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.125, bevelSegments: 1, curveSegments: 40 });
  root.add(mesh(binding, mat.binding, 0, 0, 1.8));
  const top = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.12, bevelSegments: 5, curveSegments: 40 });
  root.add(mesh(top, [mat.top, mat.edge], 0, 0, 1.92 + 0.3));

  // --- neck
  const boardEnd = NUT_X - (fretDistances[22] ?? 17.81) - 0.35;
  const boardLen = NUT_X - boardEnd;
  const widthAt = (x) => 1.69 + ((NUT_X - x) / boardLen) * (2.25 - 1.69);
  const boardShape = new THREE.Shape();
  boardShape.moveTo(boardEnd, -widthAt(boardEnd) / 2);
  boardShape.lineTo(NUT_X, -widthAt(NUT_X) / 2);
  boardShape.lineTo(NUT_X, widthAt(NUT_X) / 2);
  boardShape.lineTo(boardEnd, widthAt(boardEnd) / 2);
  boardShape.closePath();
  root.add(mesh(new THREE.ExtrudeGeometry(boardShape, { depth: BOARD_T, bevelEnabled: false }), mat.board, 0, 0, BOARD_Z));
  const neckLen = NUT_X - 7.0;
  root.add(mesh(new THREE.BoxGeometry(neckLen, 1.8, 0.8), mat.mahogany, 7.0 + neckLen / 2, 0, BOARD_Z - 0.4));

  // frets placed from the generated distances
  for (let n = 1; n < fretDistances.length; n++) {
    const x = NUT_X - fretDistances[n];
    root.add(mesh(new THREE.BoxGeometry(0.06, widthAt(x), 0.05), mat.fret, x, 0, BOARD_Z + BOARD_T + 0.025));
  }
  // trapezoid inlays
  for (const n of [3, 5, 7, 9, 12, 15, 17, 19, 21]) {
    if (!fretDistances[n]) continue;
    const x0 = NUT_X - fretDistances[n - 1], x1 = NUT_X - fretDistances[n];
    const w = (x0 - x1) * 0.55, cx = (x0 + x1) / 2, h = widthAt(cx) * 0.72;
    const t = new THREE.Shape();
    t.moveTo(cx - w / 2, -h / 2); t.lineTo(cx + w / 2, -h / 2 + 0.1);
    t.lineTo(cx + w / 2, h / 2 - 0.1); t.lineTo(cx - w / 2, h / 2); t.closePath();
    root.add(mesh(new THREE.ShapeGeometry(t), mat.inlay, 0, 0, BOARD_Z + BOARD_T + 0.002));
  }
  root.add(mesh(new THREE.BoxGeometry(0.2, 1.72, 0.22), mat.nut, NUT_X + 0.1, 0, BOARD_Z + BOARD_T + 0.02));

  // --- headstock (generic flared paddle, angled back, no logo)
  const head = new THREE.Group();
  head.position.set(NUT_X + 0.2, 0, BOARD_Z + 0.05);
  head.rotation.y = THREE.MathUtils.degToRad(14);
  const hs = new THREE.Shape();
  hs.moveTo(0, -0.9);
  hs.bezierCurveTo(2.5, -1.1, 5.2, -1.75, 6.9, -1.6);
  hs.quadraticCurveTo(7.4, 0, 6.9, 1.6);
  hs.bezierCurveTo(5.2, 1.75, 2.5, 1.1, 0, 0.9);
  hs.closePath();
  head.add(mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 }), mat.headstock, 0, 0, -0.55));
  for (let i = 0; i < 3; i++) {
    const x = 2.2 + i * 1.6;
    for (const side of [-1, 1]) {
      const y = side * (1.05 + i * 0.18);
      const post = mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.5, 12), mat.nickel, x, y, 0.2);
      post.rotation.x = Math.PI / 2;
      const key = mesh(new THREE.BoxGeometry(0.45, 0.6, 0.12), mat.cream, x, y + side * 0.9, -0.28);
      const shaft = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), mat.nickel, x, y + side * 0.45, -0.28);
      head.add(post, key, shaft);
    }
  }
  root.add(head);

  // --- hardware: pickups, bridge, tailpiece, knobs, toggle
  const pickupXs = { neck: 3.55, bridge: -0.55 };
  for (const x of Object.values(pickupXs)) {
    root.add(mesh(new THREE.BoxGeometry(1.85, 3.3, 0.22), mat.cream, x, 0, TOP_Z + 0.11));
    const cover = mesh(new THREE.BoxGeometry(1.5, 2.75, 0.3), mat.nickel, x, 0, TOP_Z + 0.36);
    root.add(cover);
    for (let s = 0; s < 6; s++) {
      const pole = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10), mat.chrome, x - 0.33, -1.0 + s * 0.4, TOP_Z + 0.52);
      pole.rotation.x = Math.PI / 2;
      root.add(pole);
    }
  }
  root.add(mesh(new THREE.BoxGeometry(0.42, 3.1, 0.3), mat.chrome, BRIDGE_X, 0, STRING_Z_BRIDGE - 0.2));
  for (let s = 0; s < 6; s++) root.add(mesh(new THREE.BoxGeometry(0.2, 0.22, 0.1), mat.chrome, BRIDGE_X + 0.05, -1.0 + s * 0.4, STRING_Z_BRIDGE - 0.02));
  for (const y of [-1.6, 1.6]) {
    const post = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.7, 16), mat.chrome, BRIDGE_X, y, TOP_Z + 0.35);
    post.rotation.x = Math.PI / 2;
    root.add(post);
  }
  const tail = mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.5, 20), mat.chrome, -3.6, 0, TOP_Z + 0.55);
  root.add(tail);
  for (const y of [-1.75, 1.75]) {
    const stud = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 16), mat.chrome, -3.6, y, TOP_Z + 0.27);
    stud.rotation.x = Math.PI / 2;
    root.add(stud);
  }
  const controls = new THREE.Group();
  for (const [x, y] of [[-3.1, -3.2], [-3.9, -5.0], [-5.6, -2.8], [-6.3, -4.6]]) {
    const knob = mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.55, 28), mat.knob, x, y, TOP_Z + 0.275);
    knob.rotation.x = Math.PI / 2;
    const cap = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24), mat.gold, x, y, TOP_Z + 0.56);
    cap.rotation.x = Math.PI / 2;
    controls.add(knob, cap);
  }
  const ring = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.04, 28), mat.cream, 5.9, 3.7, TOP_Z + 0.02);
  ring.rotation.x = Math.PI / 2;
  const lever = mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 10), mat.chrome, 5.9, 3.7, TOP_Z + 0.45);
  lever.rotation.x = Math.PI / 2 - 0.35;
  const tip = mesh(new THREE.SphereGeometry(0.14, 16, 12), mat.cream, 5.9, 3.85, TOP_Z + 0.88);
  controls.add(ring, lever, tip);
  root.add(controls);

  // --- strings: nut -> saddle -> tailpiece (low E on the bass side, +y)
  const radii = [0.024, 0.02, 0.016, 0.013, 0.01, 0.008];
  for (let s = 0; s < 6; s++) {
    const t = 1 - s / 5;
    const yNut = -0.7 + t * 1.4, yBridge = -1.0 + t * 2.0;
    const a = new THREE.Vector3(NUT_X, yNut, STRING_Z_NUT);
    const b = new THREE.Vector3(BRIDGE_X, yBridge, STRING_Z_BRIDGE);
    const c = new THREE.Vector3(-3.6, yBridge * 0.95, TOP_Z + 0.62);
    root.add(rod(a, b, radii[s], mat.string), rod(b, c, radii[s], mat.string));
  }

  // --- anchors for camera presets (model-agnostic names)
  const anchors = {};
  const anchor = (name, x, y, z) => {
    const o = new THREE.Object3D();
    o.name = `anchor:${name}`;
    o.position.set(x, y, z);
    root.add(o);
    anchors[name] = o;
  };
  const fretMid = (n) => NUT_X - ((fretDistances[n - 1] ?? 0) + (fretDistances[n] ?? 0)) / 2;
  anchor('center', 10, 0, 2);
  anchor('body', 0, 0, TOP_Z);
  anchor('neck', NUT_X - 9, 0, BOARD_Z);
  anchor('headstock', NUT_X + 3.6, 0, BOARD_Z - 0.6);
  anchor('pickups', 1.5, -1.2, TOP_Z);
  anchor('controls', -4.7, -3.9, TOP_Z);
  anchor('bridge', BRIDGE_X, 0, STRING_Z_BRIDGE);
  anchor('fret1', fretMid(3), 0, BOARD_Z);
  anchor('fret12', fretMid(12), 0, BOARD_Z);

  return {
    object: root,
    anchors,
    dispose() {
      root.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
      for (const m of Object.values(mat)) { m.map?.dispose(); m.dispose(); }
    },
  };
}
