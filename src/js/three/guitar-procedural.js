// Procedural guitar inspired by a late-1950s single-cutaway with a carved
// maple top (Jimmy Page's "Number One" Les Paul as the reference). It is an
// educational illustration, not a historical reproduction: original geometry
// and textures only, no logos, no brand outline on the headstock. Details
// that follow published descriptions of Number One (see docs/content-sources.md):
// gold-plated Grover-style tuners, and an uncovered bridge humbucker with
// white bobbins.
//
// Contract (see docs/architecture.md):
//   { object: THREE.Object3D, anchors: { [name]: THREE.Object3D }, dispose() }
//
// Units are inches. Local frame: nut toward +x, bass side toward +y,
// top face toward +z. The bridge saddle line sits at x = BRIDGE_X.

import * as THREE from 'three';

const SCALE_LENGTH = 24.75;
const BRIDGE_X = -2.0;
const NUT_X = BRIDGE_X + SCALE_LENGTH;
const BACK_T = 1.75;              // mahogany back thickness
const BINDING_T = 0.12;
const TOP_BASE = BACK_T + BINDING_T; // where the carved top meets the binding
const BOARD_Z = 2.56;             // underside of the fingerboard
const BOARD_T = 0.25;
const BOARD_TOP = BOARD_Z + BOARD_T;
const STRING_Z_NUT = BOARD_TOP + 0.09;
const STRING_Z_BRIDGE = 2.99;

// Carve profile: height of the maple top above TOP_BASE as a function of the
// distance from the body edge. Flush with the binding, a shallow recurve
// ("dish") just inside the edge, then the rise to the crown.
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const bump = (a, b, x) => (x <= a || x >= b ? 0 : Math.sin(Math.PI * (x - a) / (b - a)));
const carve = (d) => 0.035 * smooth(0.09, 0.22, d) - 0.03 * bump(0.2, 0.75, d) + 0.6 * smooth(0.55, 4.0, d) + 0.05 * smooth(3.5, 5.4, d);
const RING_OFFSETS = [0.09, 0.16, 0.26, 0.4, 0.58, 0.8, 1.06, 1.38, 1.76, 2.2, 2.75, 3.4, 4.1, 4.9, 5.6];

function bodyShape() {
  const s = new THREE.Shape();
  s.moveTo(-8.6, 0);
  s.bezierCurveTo(-8.6, 4.0, -6.2, 6.5, -3.6, 6.5);   // lower bout, bass side
  s.bezierCurveTo(-1.4, 6.5, -0.3, 4.75, 1.3, 4.6);   // waist
  s.bezierCurveTo(2.9, 4.45, 5.3, 5.15, 6.85, 4.15);  // upper bout
  s.bezierCurveTo(8.15, 3.25, 8.7, 2.0, 8.6, 1.05);   // shoulder into the neck joint
  s.lineTo(8.6, -1.05);
  s.bezierCurveTo(7.45, -1.1, 6.65, -1.55, 6.5, -2.45); // inside of the cutaway
  s.bezierCurveTo(6.4, -3.15, 7.2, -3.35, 7.75, -3.65); // horn tip
  s.bezierCurveTo(8.15, -4.55, 6.85, -5.4, 5.0, -5.2);
  s.bezierCurveTo(3.2, -5.0, 2.6, -4.6, 1.3, -4.6);   // waist, treble side
  s.bezierCurveTo(-0.3, -4.7, -1.4, -6.5, -3.6, -6.5);
  s.bezierCurveTo(-6.2, -6.5, -8.6, -4.0, -8.6, 0);
  return s;
}

// ---------- outline analysis (for the carve and the sunburst) ----------

function analyseOutline(shape, count = 360) {
  const pts = shape.getSpacedPoints(count).slice(0, count);
  let area = 0;
  for (let i = 0; i < count; i++) {
    const a = pts[i], b = pts[(i + 1) % count];
    area += a.x * b.y - b.x * a.y;
  }
  const ccw = area > 0;
  const normals = pts.map((p, i) => {
    const prev = pts[(i - 1 + count) % count], next = pts[(i + 1) % count];
    const dx = next.x - prev.x, dy = next.y - prev.y;
    const n = ccw ? new THREE.Vector2(-dy, dx) : new THREE.Vector2(dy, -dx);
    return n.normalize(); // inward
  });
  // half the distance to the opposite side along the inward normal
  const halfWidth = pts.map((p, i) => {
    const n = normals[i];
    let best = Infinity;
    for (let j = 0; j < count; j++) {
      if (j === i || (j + 1) % count === i) continue;
      const a = pts[j], b = pts[(j + 1) % count];
      const ex = b.x - a.x, ey = b.y - a.y;
      const den = n.x * ey - n.y * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((a.x - p.x) * ey - (a.y - p.y) * ex) / den;
      const u = ((a.x - p.x) * n.y - (a.y - p.y) * n.x) / den;
      if (t > 1e-4 && u >= 0 && u <= 1) best = Math.min(best, t);
    }
    return best / 2;
  });
  return { pts, normals, halfWidth, count };
}

// Inset ring k: each vertex moves inward by the ring offset, limited near
// narrow parts (the horn) and min-filtered so convex tips never overshoot.
function insetRings(outline) {
  const { pts, normals, halfWidth, count } = outline;
  return RING_OFFSETS.map((d) => {
    const raw = halfWidth.map((h) => Math.min(d, 0.92 * h));
    const eff = raw.map((_, i) => {
      let m = Infinity;
      for (let k = -8; k <= 8; k++) m = Math.min(m, raw[(i + k + count) % count] + Math.abs(k) * 0.02);
      return Math.min(raw[i], m);
    });
    const ring = pts.map((p, i) => ({ x: p.x + normals[i].x * eff[i], y: p.y + normals[i].y * eff[i], d: eff[i] }));
    ring.offset = d; // nominal inset (the horn clamps individual vertices below it)
    return ring;
  });
}

function distanceToOutline(outline, x, y) {
  let best = Infinity;
  const { pts, count } = outline;
  for (let i = 0; i < count; i++) {
    const a = pts[i], b = pts[(i + 1) % count];
    const ex = b.x - a.x, ey = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((x - a.x) * ex + (y - a.y) * ey) / (ex * ex + ey * ey)));
    best = Math.min(best, Math.hypot(x - (a.x + t * ex), y - (a.y + t * ey)));
  }
  return best;
}

// Carved top surface: strips between consecutive rings plus a cap.
function carvedTopGeometry(rings) {
  const n = rings[0].length;
  const pos = [], uv = [], idx = [];
  for (const ring of rings) {
    for (const p of ring) {
      pos.push(p.x, p.y, TOP_BASE + carve(p.d));
      uv.push((p.x + 9) / 18, (p.y + 7) / 14);
    }
  }
  const tri = (a, b, c) => {
    const ax = pos[a * 3], ay = pos[a * 3 + 1];
    const cross = (pos[b * 3] - ax) * (pos[c * 3 + 1] - ay) - (pos[b * 3 + 1] - ay) * (pos[c * 3] - ax);
    if (Math.abs(cross) < 1e-10) return; // collapsed quad in the horn
    cross > 0 ? idx.push(a, b, c) : idx.push(a, c, b);
  };
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < n; i++) {
      const a = r * n + i, b = r * n + ((i + 1) % n), c = (r + 1) * n + i, d = (r + 1) * n + ((i + 1) % n);
      tri(a, b, c);
      tri(b, d, c);
    }
  }
  const inner = rings[rings.length - 1];
  const base = (rings.length - 1) * n;
  const faces = THREE.ShapeUtils.triangulateShape(inner.map((p) => new THREE.Vector2(p.x, p.y)), []);
  for (const [a, b, c] of faces) tri(base + a, base + b, base + c);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Faded sunburst painted from the same inset rings, so the burst follows
// the body edge like a real sprayed burst, plus subtle flame figure.
function sunburstTexture(outline, rings) {
  const size = 2048;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const px = (x) => ((x + 9) / 18) * size;
  const py = (y) => (1 - (y + 7) / 14) * size;
  const path = (ring) => {
    g.beginPath();
    ring.forEach((p, i) => (i ? g.lineTo(px(p.x), py(p.y)) : g.moveTo(px(p.x), py(p.y))));
    g.closePath();
  };
  // a faded burst: dark brown edge, amber transition, pale honey centre
  const ramp = [
    [0, '#240d07'], [0.3, '#36130b'], [0.6, '#4f1f10'], [1.0, '#6e3417'], [1.5, '#945222'],
    [2.1, '#b8772f'], [2.8, '#d39b45'], [3.6, '#e2b55e'], [4.5, '#ebc576'],
  ];
  const colourAt = (d) => ramp.reduce((acc, [k, col]) => (d >= k ? col : acc), ramp[0][1]);

  g.fillStyle = ramp[0][1];
  g.fillRect(0, 0, size, size);
  g.filter = 'blur(34px)';
  for (const ring of rings) {
    path(ring);
    g.fillStyle = colourAt(ring.offset + 0.25);
    g.fill();
  }
  g.filter = 'none';

  // flame figure: soft bands across the grain, book-matched at the centre seam
  path(outline.pts);
  g.save();
  g.clip();
  g.globalCompositeOperation = 'soft-light';
  for (let i = 0; i < 140; i++) {
    const x = (i / 140) * size;
    g.strokeStyle = i % 2 ? 'rgba(255,236,190,0.16)' : 'rgba(70,25,8,0.16)';
    g.lineWidth = 5 + (i % 7);
    for (const dir of [-1, 1]) {
      g.beginPath();
      for (let k = 0; k <= 24; k++) {
        const y = size / 2 + dir * (k / 24) * (size / 2);
        const xx = x + Math.sin(k * 0.8 + i * 0.6) * 9 + dir * (k / 24) * 30;
        k === 0 ? g.moveTo(xx, y) : g.lineTo(xx, y);
      }
      g.stroke();
    }
  }
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function materials(burst) {
  return {
    top: new THREE.MeshPhysicalMaterial({ map: burst, roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.09 }),
    sides: new THREE.MeshPhysicalMaterial({ color: 0x5c2214, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08 }),
    back: new THREE.MeshPhysicalMaterial({ color: 0x4a1c12, roughness: 0.4, clearcoat: 0.9, clearcoatRoughness: 0.12 }),
    neck: new THREE.MeshPhysicalMaterial({ color: 0x55241a, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.15, side: THREE.DoubleSide }),
    binding: new THREE.MeshPhysicalMaterial({ color: 0xece0c4, roughness: 0.35, clearcoat: 0.6 }),
    board: new THREE.MeshStandardMaterial({ color: 0x271710, roughness: 0.78 }),
    nickel: new THREE.MeshStandardMaterial({ color: 0xd9d3c7, metalness: 1, roughness: 0.2 }),
    fret: new THREE.MeshStandardMaterial({ color: 0xe2dcd0, metalness: 1, roughness: 0.18 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xe1b866, metalness: 1, roughness: 0.22 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xeee3c8, roughness: 0.45 }),
    bobbin: new THREE.MeshStandardMaterial({ color: 0xf4efe3, roughness: 0.5 }),
    black: new THREE.MeshPhysicalMaterial({ color: 0x0b0a0a, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.04 }),
    plate: new THREE.MeshStandardMaterial({ color: 0x111010, roughness: 0.5 }),
    inlay: new THREE.MeshPhysicalMaterial({ color: 0xf1e9d8, roughness: 0.3, iridescence: 0.55, iridescenceIOR: 1.4, clearcoat: 0.5 }),
    knob: new THREE.MeshPhysicalMaterial({ color: 0xc99027, roughness: 0.26, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08 }),
    string: new THREE.MeshStandardMaterial({ color: 0xe4e0d8, metalness: 1, roughness: 0.28 }),
    bone: new THREE.MeshStandardMaterial({ color: 0xf2ecdc, roughness: 0.55 }),
  };
}

const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
};

function rod(a, b, radius, mat) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), 6, 1, true), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const roundedBox = (w, h, depth, r, bevel = 0.03) =>
  new THREE.ExtrudeGeometry(roundedRect(w, h, r), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 6 });

// Slim, shaved neck: half-ellipse cross-section that tapers toward the nut.
function neckGeometry(x0, x1, widthAt, depthAt) {
  const L = 48, M = 18;
  const pos = [], idx = [];
  for (let i = 0; i <= L; i++) {
    const x = x0 + ((x1 - x0) * i) / L;
    const w = widthAt(x) / 2, t = depthAt(x);
    for (let j = 0; j <= M; j++) {
      const th = (Math.PI * j) / M;
      pos.push(x, w * Math.cos(th), BOARD_Z - t * Math.sin(th));
    }
  }
  for (let i = 0; i < L; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j, b = a + M + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// "Top hat" knob profile, turned on a lathe.
function knobGeometry() {
  const p = [[0, 0], [0.43, 0], [0.43, 0.05], [0.4, 0.11], [0.33, 0.13], [0.32, 0.5], [0.3, 0.58], [0.26, 0.61], [0, 0.61]]
    .map(([r, h]) => new THREE.Vector2(r, h));
  return new THREE.LatheGeometry(p, 36);
}

/**
 * @param {{ fretDistances?: number[] }} options  fret distances from the nut
 *   in inches (generated by the Python data engine).
 */
export function createProceduralGuitar({ fretDistances = [] } = {}) {
  const shape = bodyShape();
  const outline = analyseOutline(shape);
  const rings = insetRings(outline);
  const burst = sunburstTexture(outline, rings);
  const mat = materials(burst);
  const root = new THREE.Group();
  root.name = 'guitar';
  const topZ = (x, y) => TOP_BASE + carve(distanceToOutline(outline, x, y));

  // --- body: back and sides, binding, carved top
  const back = new THREE.ExtrudeGeometry(shape, { depth: BACK_T - 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3, curveSegments: 48 });
  root.add(mesh(back, [mat.back, mat.sides], 0, 0, 0.06));
  const binding = new THREE.ExtrudeGeometry(shape, { depth: BINDING_T, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.06, bevelSegments: 1, curveSegments: 48 });
  root.add(mesh(binding, mat.binding, 0, 0, BACK_T));
  root.add(mesh(carvedTopGeometry(rings), mat.top));

  // --- neck
  const boardEnd = NUT_X - (fretDistances[22] ?? 17.81) - 0.35;
  const boardLen = NUT_X - boardEnd;
  const widthAt = (x) => 1.69 + ((NUT_X - x) / boardLen) * (2.25 - 1.69);
  const depthAt = (x) => 0.78 + Math.min(1, (NUT_X - x) / 12) * 0.08; // slim profile
  root.add(mesh(neckGeometry(boardEnd, NUT_X + 0.25, (x) => widthAt(Math.min(x, NUT_X)) - 0.02, depthAt), mat.neck));

  const boardShape = new THREE.Shape();
  boardShape.moveTo(boardEnd, -widthAt(boardEnd) / 2);
  boardShape.lineTo(NUT_X, -widthAt(NUT_X) / 2);
  boardShape.lineTo(NUT_X, widthAt(NUT_X) / 2);
  boardShape.lineTo(boardEnd, widthAt(boardEnd) / 2);
  boardShape.closePath();
  root.add(mesh(new THREE.ExtrudeGeometry(boardShape, { depth: BOARD_T, bevelEnabled: false }), mat.board, 0, 0, BOARD_Z));
  // bound fingerboard: thin cream strips along both edges
  const taper = Math.atan2((widthAt(boardEnd) - widthAt(NUT_X)) / 2, boardLen);
  for (const side of [-1, 1]) {
    const strip = mesh(new THREE.BoxGeometry(boardLen / Math.cos(taper), 0.06, BOARD_T + 0.01), mat.binding,
      (boardEnd + NUT_X) / 2, side * ((widthAt(boardEnd) + widthAt(NUT_X)) / 4 + 0.02), BOARD_Z + BOARD_T / 2);
    strip.rotation.z = -side * taper;
    root.add(strip);
  }
  // crowned frets placed from the generated distances
  for (let n = 1; n < fretDistances.length; n++) {
    const x = NUT_X - fretDistances[n];
    // half-cylinder along y; rotating about y turns its curved half upward (the crown)
    const fret = mesh(new THREE.CylinderGeometry(0.042, 0.042, widthAt(x) + 0.02, 8, 1, false, 0, Math.PI), mat.fret, x, 0, BOARD_TOP);
    fret.rotation.y = -Math.PI / 2;
    fret.name = 'fret';
    root.add(fret);
  }
  // trapezoid inlays (pearloid)
  for (const n of [3, 5, 7, 9, 12, 15, 17, 19, 21]) {
    if (!fretDistances[n]) continue;
    const x0 = NUT_X - fretDistances[n - 1], x1 = NUT_X - fretDistances[n];
    const w = (x0 - x1) * 0.52, cx = (x0 + x1) / 2, h = widthAt(cx) * 0.7;
    const t = new THREE.Shape();
    t.moveTo(cx - w / 2, -h / 2); t.lineTo(cx + w / 2, -h / 2 + 0.12);
    t.lineTo(cx + w / 2, h / 2 - 0.12); t.lineTo(cx - w / 2, h / 2); t.closePath();
    root.add(mesh(new THREE.ShapeGeometry(t), mat.inlay, 0, 0, BOARD_TOP + 0.002));
  }
  root.add(mesh(new THREE.BoxGeometry(0.2, 1.72, 0.14), mat.bone, NUT_X + 0.1, 0, BOARD_TOP + 0.06));

  // --- headstock: generic flared shape (no brand outline), angled back
  const head = new THREE.Group();
  head.position.set(NUT_X + 0.2, 0, BOARD_TOP - 0.1);
  head.rotation.y = THREE.MathUtils.degToRad(17);
  const hs = new THREE.Shape();
  hs.moveTo(0, -0.92);
  hs.bezierCurveTo(2.4, -1.15, 5.0, -1.8, 6.8, -1.68);
  hs.bezierCurveTo(7.05, -0.9, 7.05, 0.9, 6.8, 1.68);
  hs.bezierCurveTo(5.0, 1.8, 2.4, 1.15, 0, 0.92);
  hs.closePath();
  head.add(mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 }), mat.neck, 0, 0, -0.58));
  head.add(mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.03, bevelEnabled: false }), mat.black, 0, 0, -0.03));
  // plain bell-shaped truss-rod cover (no text)
  const bell = new THREE.Shape();
  bell.moveTo(0.35, -0.24); bell.lineTo(1.25, -0.42); bell.quadraticCurveTo(1.5, 0, 1.25, 0.42); bell.lineTo(0.35, 0.24); bell.closePath();
  head.add(mesh(new THREE.ExtrudeGeometry(bell, { depth: 0.02, bevelEnabled: false }), mat.cream, 0, 0, 0));
  const inner = new THREE.ExtrudeGeometry(bell, { depth: 0.02, bevelEnabled: false });
  inner.translate(-0.9, 0, 0).scale(0.84, 0.8, 1).translate(0.9, 0, 0);
  head.add(mesh(inner, mat.plate, 0, 0, 0.012));
  // gold Grover-style tuners: bushing + post on the face, housing + kidney button behind
  const postsLocal = [];
  for (let i = 0; i < 3; i++) {
    const x = 2.25 + i * 1.55;
    for (const side of [-1, 1]) {
      const y = side * (1.0 + i * 0.2);
      const bush = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 20), mat.gold, x, y, 0.035);
      bush.rotation.x = Math.PI / 2;
      const post = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.34, 12), mat.gold, x, y, 0.2);
      post.rotation.x = Math.PI / 2;
      const housing = mesh(roundedBox(0.5, 0.42, 0.3, 0.1, 0.02), mat.gold, x, y, -0.92);
      const shaft = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 8), mat.gold, x, y + side * 0.42, -0.78);
      const button = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 24), mat.gold, x, y + side * 0.85, -0.78);
      button.rotation.z = Math.PI / 2;
      button.scale.set(1, 1, 0.72);
      head.add(bush, post, housing, shaft, button);
      postsLocal.push({ side, i, v: new THREE.Vector3(x, y, 0.3) });
    }
  }
  root.add(head);
  head.updateMatrix();

  // --- pickups (cream rings): covered neck pickup, uncovered bridge pickup
  const ringShape = roundedRect(1.95, 3.35, 0.28);
  ringShape.holes.push(roundedRect(1.48, 2.78, 0.12));
  const addPickup = (x, covered) => {
    const z = topZ(x, 0);
    root.add(mesh(new THREE.ExtrudeGeometry(ringShape, { depth: 0.13, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }), mat.cream, x, 0, z));
    if (covered) {
      root.add(mesh(roundedBox(1.42, 2.72, 0.17, 0.12), mat.nickel, x, 0, z + 0.02));
      for (let s = 0; s < 6; s++) {
        const pole = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 12), mat.nickel, x - 0.32, -1.0 + s * 0.4, z + 0.235);
        pole.rotation.x = Math.PI / 2;
        root.add(pole);
      }
    } else {
      for (const [dx, screws] of [[-0.35, true], [0.35, false]]) {
        root.add(mesh(roundedBox(0.66, 2.66, 0.16, 0.12, 0.02), mat.bobbin, x + dx, 0, z + 0.02));
        for (let s = 0; s < 6; s++) {
          const pole = mesh(new THREE.CylinderGeometry(screws ? 0.075 : 0.085, screws ? 0.075 : 0.085, 0.03, 12), mat.nickel, x + dx, -1.0 + s * 0.4, z + 0.215);
          pole.rotation.x = Math.PI / 2;
          root.add(pole);
        }
      }
    }
  };
  const PICKUP_NECK_X = 3.55, PICKUP_BRIDGE_X = -0.55;
  addPickup(PICKUP_NECK_X, true);
  addPickup(PICKUP_BRIDGE_X, false);

  // --- tune-o-matic style bridge and stopbar tailpiece
  const bz = topZ(BRIDGE_X, 0);
  for (const y of [-1.6, 1.6]) {
    const stud = mesh(new THREE.CylinderGeometry(0.09, 0.09, STRING_Z_BRIDGE - bz, 12), mat.nickel, BRIDGE_X, y, (bz + STRING_Z_BRIDGE) / 2 - 0.1);
    stud.rotation.x = Math.PI / 2;
    const wheel = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 20), mat.nickel, BRIDGE_X, y, STRING_Z_BRIDGE - 0.32);
    wheel.rotation.x = Math.PI / 2;
    root.add(stud, wheel);
  }
  root.add(mesh(roundedBox(0.34, 3.35, 0.16, 0.08, 0.02), mat.nickel, BRIDGE_X, 0, STRING_Z_BRIDGE - 0.26));
  for (let s = 0; s < 6; s++) root.add(mesh(new THREE.BoxGeometry(0.16, 0.2, 0.09), mat.nickel, BRIDGE_X + 0.02, -1.0 + s * 0.4, STRING_Z_BRIDGE - 0.06));
  const TAIL_X = -3.65;
  const tz = topZ(TAIL_X, 0);
  for (const y of [-1.75, 1.75]) {
    const stud = mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.5, 18), mat.nickel, TAIL_X, y, tz + 0.25);
    stud.rotation.x = Math.PI / 2;
    root.add(stud);
  }
  const tail = mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.55, 24), mat.nickel, TAIL_X, 0, tz + 0.5);
  tail.scale.set(1, 1, 0.85);
  root.add(tail);

  // --- controls: 4 top-hat knobs, toggle on the upper bass bout
  const knobGeo = knobGeometry();
  for (const [x, y] of [[-2.9, -3.3], [-3.6, -5.0], [-5.4, -3.0], [-6.1, -4.7]]) {
    const z = topZ(x, y);
    const knob = mesh(knobGeo, mat.knob, x, y, z);
    knob.rotation.x = Math.PI / 2;
    const cap = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 24), mat.gold, x, y, z + 0.615);
    cap.rotation.x = Math.PI / 2;
    root.add(knob, cap);
  }
  const tgX = 6.0, tgY = 3.6, tgZ = topZ(tgX, tgY);
  const washer = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.03, 32), mat.cream, tgX, tgY, tgZ + 0.015);
  washer.rotation.x = Math.PI / 2;
  const tnut = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 6), mat.nickel, tgX, tgY, tgZ + 0.08);
  tnut.rotation.x = Math.PI / 2;
  const lever = mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.85, 10), mat.nickel, tgX, tgY + 0.13, tgZ + 0.5);
  lever.rotation.x = Math.PI / 2 - 0.32;
  const tip = mesh(new THREE.SphereGeometry(0.13, 18, 12), mat.cream, tgX, tgY + 0.27, tgZ + 0.9);
  tip.scale.set(1, 1, 1.3);
  root.add(washer, tnut, lever, tip);
  const strap = mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.35, 16), mat.nickel, -8.75, 0, 0.9);
  strap.rotation.z = Math.PI / 2;
  root.add(strap);

  // --- strings: post -> nut -> saddle -> tailpiece (low E on the bass side, +y)
  const radii = [0.024, 0.02, 0.016, 0.012, 0.0095, 0.008];
  for (let s = 0; s < 6; s++) {
    const t = 1 - s / 5;
    const side = s < 3 ? 1 : -1;
    const postIndex = s < 3 ? s : 5 - s; // low/high E on the posts nearest the nut
    const post = postsLocal.find((p) => p.side === side && p.i === postIndex).v.clone().applyMatrix4(head.matrix);
    const nut = new THREE.Vector3(NUT_X + 0.1, -0.72 + t * 1.44, STRING_Z_NUT);
    const saddle = new THREE.Vector3(BRIDGE_X, -1.0 + t * 2.0, STRING_Z_BRIDGE);
    const tailp = new THREE.Vector3(TAIL_X, (-1.0 + t * 2.0) * 0.95, tz + 0.55);
    root.add(rod(post, nut, radii[s], mat.string), rod(nut, saddle, radii[s], mat.string), rod(saddle, tailp, radii[s], mat.string));
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
  anchor('body', 0, 0, TOP_BASE + 0.6);
  anchor('neck', NUT_X - 9, 0, BOARD_TOP);
  anchor('headstock', NUT_X + 3.6, 0, BOARD_TOP - 0.9);
  anchor('pickups', 1.5, -1.4, TOP_BASE + 0.6);
  anchor('controls', -4.5, -3.9, TOP_BASE + 0.4);
  anchor('bridge', BRIDGE_X, 0, STRING_Z_BRIDGE);
  anchor('fret1', fretMid(3), 0, BOARD_TOP);
  anchor('fret12', fretMid(12), 0, BOARD_TOP);

  return {
    object: root,
    anchors,
    dispose() {
      root.traverse((o) => o.geometry?.dispose());
      for (const m of Object.values(mat)) { m.map?.dispose(); m.dispose(); }
    },
  };
}
