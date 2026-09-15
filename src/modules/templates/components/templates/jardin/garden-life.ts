import * as THREE from 'three';
import {
  clamp,
  easeOutBack,
  type GardenGeometries,
  type GardenMaterials,
  rand,
  smooth,
} from './garden-art';

/** Lo que el raycaster puede encontrar al tocar la pantalla. */
export type Tappable = 'flower' | 'cat' | 'bug' | 'ground' | 'chest';

export type FlowerType = 'sun' | 'daisy';

type Arm = THREE.Group & { userData: { open: number; closed: number } };

export type FlowerData = {
  kind: 'flower';
  type: FlowerType;
  phase: number;
  grow: number;
  delay: number;
  spin: number;
  bounce: number;
  flutter: number;
  bloomDone: boolean;
  base: number;
  hs: number;
  head: THREE.Group;
  spinner: THREE.Group;
  arms: Arm[];
};

export type Flower = THREE.Group & { userData: FlowerData };

function makeHead(
  type: FlowerType,
  G: GardenGeometries,
  M: GardenMaterials
): { head: THREE.Group; spinner: THREE.Group; arms: Arm[] } {
  const head = new THREE.Group();
  const spinner = new THREE.Group();
  head.add(spinner);
  const arms: Arm[] = [];
  const addRing = (
    n: number,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    z: number,
    armY: number,
    open: number,
    offset: number
  ) => {
    for (let i = 0; i < n; i++) {
      const piv = new THREE.Group();
      piv.rotation.z = ((i + offset) / n) * Math.PI * 2;
      piv.position.z = z;
      const arm = new THREE.Group() as Arm;
      arm.position.y = armY;
      piv.add(arm);
      arm.add(new THREE.Mesh(geo, mat));
      arm.userData.open = open + rand(-0.08, 0.12);
      arm.userData.closed = 1.5;
      arm.rotation.x = arm.userData.closed;
      spinner.add(piv);
      arms.push(arm);
    }
  };
  if (type === 'sun') {
    const back = new THREE.Mesh(G.centerBack, M.centerBack);
    back.scale.set(1, 1, 0.45);
    back.castShadow = true;
    spinner.add(back);
    const face = new THREE.Mesh(G.centerFace, M.centerFace);
    face.position.z = 0.12;
    spinner.add(face);
    addRing(15, G.sunPetal, M.petalB, 0.02, 0.21, 0.05, 0);
    addRing(15, G.sunPetal2, M.petalA, 0.06, 0.21, 0.32, 0.5);
  } else {
    const c = new THREE.Mesh(G.daisyCenter, M.daisyCenter);
    c.scale.set(1, 1, 0.6);
    c.position.z = 0.02;
    spinner.add(c);
    addRing(11, G.daisyPetal, M.petalC, 0, 0.055, 0.18, 0);
  }
  return { head, spinner, arms };
}

export function makeFlower(
  scene: THREE.Scene,
  G: GardenGeometries,
  M: GardenMaterials,
  type: FlowerType,
  x: number,
  z: number,
  h: number,
  delay: number
): Flower {
  const f = new THREE.Group() as Flower;
  f.position.set(x, 0, z);
  const top = new THREE.Vector3(
    x * 0.08 + rand(-0.12, 0.12),
    h,
    z * 0.08 + rand(-0.12, 0.12)
  );
  const mid = new THREE.Vector3(
    top.x * 0.3 + rand(-0.1, 0.1),
    h * 0.5,
    top.z * 0.3 + rand(-0.1, 0.1)
  );
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.05, 0),
    mid,
    top,
  ]);
  const stem = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 14, type === 'sun' ? 0.035 : 0.02, 6, false),
    M.stem
  );
  stem.castShadow = true;
  f.add(stem);
  const nl = type === 'sun' ? 2 : 1;
  for (let i = 0; i < nl; i++) {
    const piv = new THREE.Group();
    piv.position.copy(curve.getPoint(0.3 + i * 0.22));
    piv.rotation.y = rand(0, 6.28) + i * Math.PI;
    const leaf = new THREE.Mesh(G.leaf, M.leaf);
    leaf.rotation.set(0, Math.PI / 2, -1.05, 'ZYX');
    leaf.scale.setScalar(type === 'sun' ? 1 : 0.6);
    piv.add(leaf);
    f.add(piv);
  }
  const { head, spinner, arms } = makeHead(type, G, M);
  head.position.copy(top);
  const face =
    Math.hypot(x, z) < 0.05
      ? new THREE.Vector3(0, 0, 1)
      : new THREE.Vector3(x, 0, z).normalize();
  face.y = type === 'sun' ? 0.5 : 1.1;
  face.normalize();
  head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), face);
  const hs = type === 'sun' ? rand(0.85, 1.0) : 1;
  head.scale.setScalar(hs);
  f.add(head);
  f.userData = {
    kind: 'flower',
    type,
    phase: rand(0, 6.28),
    grow: 0,
    delay,
    spin: 0,
    bounce: 0,
    flutter: 0,
    bloomDone: false,
    base: type === 'sun' ? rand(0.92, 1.08) : rand(0.85, 1.15),
    hs,
    head,
    spinner,
    arms,
  };
  f.scale.setScalar(0.0001);
  scene.add(f);
  return f;
}

export function updateFlower(
  f: Flower,
  t: number,
  dt: number,
  started: boolean
) {
  const u = f.userData;
  if (started) {
    if (u.delay > 0) u.delay -= dt;
    else if (u.grow < 1) u.grow = Math.min(1, u.grow + dt * 0.75);
  }
  f.scale.setScalar(Math.max(0.0001, easeOutBack(u.grow)) * u.base);
  const bloom = smooth(0.35, 1, u.grow);
  if (!u.bloomDone || u.flutter > 0) {
    if (u.flutter > 0) u.flutter = Math.max(0, u.flutter - dt * 1.3);
    const fl = Math.sin(u.flutter * Math.PI) * 0.7;
    for (const a of u.arms) {
      a.rotation.x =
        a.userData.closed + (a.userData.open - a.userData.closed) * bloom + fl;
    }
    if (bloom >= 1) u.bloomDone = true;
  }
  f.rotation.x = Math.sin(t * 1.2 + u.phase) * 0.03;
  f.rotation.z = Math.cos(t * 1.0 + u.phase * 1.3) * 0.03;
  if (u.spin > 0.01) {
    u.spinner.rotation.z += u.spin * dt;
    u.spin *= 0.15 ** dt;
  }
  if (u.bounce > 0) {
    u.bounce = Math.max(0, u.bounce - dt * 1.2);
    const b = u.bounce;
    u.head.scale.setScalar(
      u.hs * (1 + Math.sin((1 - b) * Math.PI * 4) * 0.22 * b)
    );
  }
}

/* ---------------------------------- gatos --------------------------------- */

export type CatOptions = {
  body: number;
  belly: number;
  stripes?: number;
  tip?: number;
  eye?: number;
  loaf?: boolean;
  walk?: boolean;
  flower?: boolean;
  R?: number;
  ang?: number;
  scale?: number;
  delay?: number;
  pitch?: number;
};

export type CatData = {
  kind: 'cat';
  inner: THREE.Group;
  head: THREE.Group;
  eyes: THREE.Group[];
  legs: THREE.Group[];
  tail: THREE.Group[];
  loaf: boolean;
  walk: boolean;
  R: number;
  ang: number;
  s: number;
  phase: number;
  jump: number;
  happy: number;
  blinkT: number;
  blink: number;
  pop: number;
  delay: number;
  pitch: number;
};

export type Cat = THREE.Group & { userData: CatData };

const stripeMats: Record<number, THREE.MeshToonMaterial> = {};

export function makeCat(
  scene: THREE.Scene,
  G: GardenGeometries,
  M: GardenMaterials,
  o: CatOptions
): Cat {
  const cat = new THREE.Group() as Cat;
  const inner = new THREE.Group();
  cat.add(inner);
  const mB = new THREE.MeshToonMaterial({ color: o.body });
  const mW = new THREE.MeshToonMaterial({ color: o.belly });
  const mP = new THREE.MeshToonMaterial({ color: 0xff8fab });
  const mEye = new THREE.MeshBasicMaterial({ color: o.eye || 0x1a1420 });
  const mBlk = new THREE.MeshBasicMaterial({ color: 0x0e0a12 });
  const mShine = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mBlush = new THREE.MeshBasicMaterial({
    color: 0xff7aa2,
    transparent: true,
    opacity: 0.55,
  });
  const sph = (
    mat: THREE.Material,
    rx: number,
    ry: number,
    rz: number,
    x: number,
    y: number,
    z: number,
    par?: THREE.Object3D
  ) => {
    const m = new THREE.Mesh(G.sph, mat);
    m.scale.set(rx, ry, rz);
    m.position.set(x, y, z);
    (par || inner).add(m);
    return m;
  };
  const loaf = !!o.loaf;
  const by = loaf ? 0.34 : 0.62;
  const bry = loaf ? 0.32 : 0.36;

  sph(mB, 0.38, bry, 0.53, 0, by, 0).castShadow = true;
  sph(mW, 0.28, bry * 0.72, 0.42, 0, by - 0.07, 0.1);
  if (o.stripes) {
    const key = o.stripes;
    let sm = stripeMats[key];
    if (!sm) {
      sm = new THREE.MeshToonMaterial({ color: key });
      stripeMats[key] = sm;
    }
    for (const z of [-0.28, -0.1, 0.08]) {
      const k = Math.sqrt(1 - (z / 0.53) ** 2) * 1.02;
      const st = new THREE.Mesh(G.stripe, sm);
      st.position.set(0, by, z);
      st.scale.set(0.38 * k, bry * k, 0.35);
      inner.add(st);
    }
  }
  const head = new THREE.Group();
  head.position.set(0, by + (loaf ? 0.36 : 0.42), 0.42);
  inner.add(head);
  sph(mB, 0.4, 0.35, 0.34, 0, 0, 0, head).castShadow = true;
  sph(mW, 0.09, 0.07, 0.07, -0.07, -0.1, 0.3, head);
  sph(mW, 0.09, 0.07, 0.07, 0.07, -0.1, 0.3, head);
  sph(mP, 0.04, 0.03, 0.03, 0, -0.045, 0.335, head);
  const eyes: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(s * 0.15, 0.04, 0.285);
    head.add(e);
    sph(mEye, 0.07, 0.08, 0.05, 0, 0, 0, e);
    if (o.eye) sph(mBlk, 0.025, 0.06, 0.03, 0, 0, 0.03, e);
    sph(mShine, 0.022, 0.022, 0.015, 0.022, 0.032, 0.045, e);
    eyes.push(e);
    sph(mBlush, 0.06, 0.035, 0.02, s * 0.25, -0.07, 0.25, head).rotation.y =
      s * 0.6;
    const ear = new THREE.Group();
    ear.position.set(s * 0.23, 0.25, -0.02);
    ear.rotation.z = -s * 0.38;
    head.add(ear);
    const eo = new THREE.Mesh(G.ear, mB);
    eo.scale.z = 0.5;
    ear.add(eo);
    const ei = new THREE.Mesh(G.ear, mP);
    ei.scale.set(0.6, 0.65, 0.3);
    ei.position.set(0, -0.02, 0.035);
    ear.add(ei);
    for (const k of [-1, 0, 1]) {
      head.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(s * 0.12, -0.09 + k * 0.02, 0.33),
            new THREE.Vector3(s * 0.44, -0.07 + k * 0.07, 0.28),
          ]),
          M.whisker
        )
      );
    }
  }
  const legs: THREE.Group[] = [];
  if (!loaf) {
    for (const [x, z] of [
      [-0.19, 0.28],
      [0.19, 0.28],
      [-0.19, -0.28],
      [0.19, -0.28],
    ]) {
      const hip = new THREE.Group();
      hip.position.set(x, 0.45, z);
      inner.add(hip);
      const lg = new THREE.Mesh(G.leg, mB);
      lg.position.y = -0.2;
      lg.castShadow = true;
      hip.add(lg);
      sph(mW, 0.085, 0.055, 0.1, 0, -0.4, 0.02, hip);
      legs.push(hip);
    }
  } else {
    sph(mW, 0.08, 0.05, 0.1, -0.13, 0.05, 0.48);
    sph(mW, 0.08, 0.05, 0.1, 0.13, 0.05, 0.48);
  }
  const tailRoot = new THREE.Group();
  tailRoot.position.set(0, by + 0.02, -0.46);
  tailRoot.rotation.x = loaf ? -1.45 : -1.2;
  inner.add(tailRoot);
  const tail: THREE.Group[] = [];
  let par: THREE.Object3D = tailRoot;
  const mTip = o.tip ? new THREE.MeshToonMaterial({ color: o.tip }) : mB;
  for (let i = 0; i < 7; i++) {
    const sg = new THREE.Group();
    sg.position.y = i === 0 ? 0 : 0.13;
    par.add(sg);
    const mat = i === 6 ? mTip : mB;
    const tm = new THREE.Mesh(G.tail, mat);
    tm.position.y = 0.07;
    tm.castShadow = true;
    sg.add(tm);
    sph(mat, 0.055, 0.055, 0.055, 0, 0, 0, sg);
    if (i === 6) sph(mat, 0.05, 0.05, 0.05, 0, 0.15, 0, sg);
    tail.push(sg);
    par = sg;
  }
  if (o.flower) {
    const mf = new THREE.Group();
    mf.position.set(0, -0.17, 0.3);
    head.add(mf);
    const st = new THREE.Mesh(G.mstem, M.stem);
    st.rotation.z = Math.PI / 2;
    st.position.x = 0.18;
    mf.add(st);
    const fl = makeHead('sun', G, M);
    for (const a of fl.arms) a.rotation.x = a.userData.open;
    fl.head.scale.setScalar(0.38);
    fl.head.position.set(0.44, 0.03, 0.02);
    fl.head.rotation.y = 0.5;
    mf.add(fl.head);
  }
  cat.userData = {
    kind: 'cat',
    inner,
    head,
    eyes,
    legs,
    tail,
    loaf,
    walk: !!o.walk,
    R: o.R || 0,
    ang: o.ang || 0,
    s: o.scale || 0.72,
    phase: rand(0, 6),
    jump: 0,
    happy: 0,
    blinkT: rand(1, 4),
    blink: 0,
    pop: 0,
    delay: o.delay || 0,
    pitch: o.pitch || 1,
  };
  inner.scale.setScalar(0.0001);
  scene.add(cat);
  return cat;
}

export function updateCat(
  c: Cat,
  t: number,
  dt: number,
  started: boolean,
  camera: THREE.Camera
) {
  const u = c.userData;
  if (started) {
    if (u.delay > 0) u.delay -= dt;
    else u.pop = Math.min(1, u.pop + dt * 1.4);
  }
  const sc = Math.max(0.0001, easeOutBack(u.pop)) * u.s;
  let y = 0;
  if (u.jump > 0) {
    u.jump = Math.max(0, u.jump - dt * 1.5);
    y = Math.sin((1 - u.jump) * Math.PI) * (u.loaf ? 0.55 : 0.9);
  }
  if (u.walk && u.pop > 0.5) {
    u.ang += dt * 0.22;
    c.position.set(Math.cos(u.ang) * u.R, 0, Math.sin(u.ang) * u.R);
    c.rotation.y = -u.ang;
    y += Math.abs(Math.sin(t * 8)) * 0.03;
    u.legs.forEach((l, i) => {
      l.rotation.x = Math.sin(t * 8 + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.5;
    });
    u.head.rotation.z = Math.sin(t * 4) * 0.05;
  } else {
    const dx = camera.position.x - c.position.x;
    const dz = camera.position.z - c.position.z;
    let rel = Math.atan2(dx, dz) - c.rotation.y;
    rel = Math.atan2(Math.sin(rel), Math.cos(rel));
    const want =
      clamp(rel, -0.9, 0.9) * 0.8 + Math.sin(t * 0.6 + u.phase) * 0.12;
    u.head.rotation.y += (want - u.head.rotation.y) * Math.min(1, dt * 3);
    u.head.rotation.z = Math.sin(t * 0.8 + u.phase) * 0.12;
  }
  u.inner.position.y = y;
  u.inner.scale.set(sc, sc * (1 + Math.sin(t * 2 + u.phase) * 0.018), sc);
  const wag = u.jump > 0 || u.happy > 0 ? 9 : 3;
  u.tail.forEach((sg, i) => {
    sg.rotation.x = u.loaf ? 0.05 : 0.28;
    sg.rotation.z =
      (u.loaf ? 0.35 : 0) +
      Math.sin(t * wag + u.phase - i * 0.55) * (u.loaf ? 0.12 : 0.22);
  });
  u.blinkT -= dt;
  if (u.blinkT <= 0) {
    u.blink = 0.14;
    u.blinkT = rand(2, 5);
  }
  if (u.happy > 0) u.happy -= dt;
  let ey = 1;
  if (u.blink > 0) {
    u.blink -= dt;
    ey = 0.12;
  } else if (u.happy > 0) ey = 0.3;
  for (const e of u.eyes) e.scale.y = ey;
}

/* ----------------------------- abejas y mariposas -------------------------- */

export type BugKind = 'bee' | 'butterfly';

export type BugData = {
  kind: 'bug';
  bug: BugKind;
  wings: THREE.Object3D[];
  /** Centro y radio de la vuelta que da alrededor del jardin. */
  R: number;
  ang: number;
  speed: number;
  height: number;
  bob: number;
  phase: number;
  pop: number;
  delay: number;
  happy: number;
};

export type Bug = THREE.Group & { userData: BugData };

/**
 * Abejas y mariposas. Vuelan en circulos a distinta altura y se pueden tocar,
 * como las flores y los gatos.
 */
export function makeBug(
  scene: THREE.Scene,
  G: GardenGeometries,
  M: GardenMaterials,
  kind: BugKind,
  radius: number,
  delay: number
): Bug {
  const bug = new THREE.Group() as Bug;
  const body = new THREE.Group();
  bug.add(body);

  const wings: THREE.Object3D[] = [];
  if (kind === 'bee') {
    const mBody = new THREE.MeshToonMaterial({ color: 0xffc21a });
    const mBand = new THREE.MeshToonMaterial({ color: 0x2b2118 });
    const core = new THREE.Mesh(G.bug, mBody);
    core.scale.set(1, 0.85, 1.35);
    body.add(core);
    for (const z of [-0.03, 0.035]) {
      const band = new THREE.Mesh(G.bug, mBand);
      band.scale.set(1.02, 0.87, 0.28);
      band.position.z = z;
      body.add(band);
    }
    const headMesh = new THREE.Mesh(G.bug, mBand);
    headMesh.scale.set(0.72, 0.72, 0.6);
    headMesh.position.z = 0.09;
    body.add(headMesh);
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(G.wing, M.wing);
      wing.scale.set(0.75, 0.42, 1);
      wing.position.set(s * 0.06, 0.05, -0.01);
      wing.rotation.set(-Math.PI / 2, 0, s * 0.35);
      body.add(wing);
      wings.push(wing);
    }
  } else {
    const colors = [0xff8fb1, 0xffd166, 0x9ad4ff, 0xc9a7ff];
    const mWing = new THREE.MeshStandardMaterial({
      color: colors[Math.floor(rand(0, colors.length))],
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      roughness: 0.5,
      emissive: 0x221100,
      emissiveIntensity: 0.25,
    });
    const core = new THREE.Mesh(
      G.bug,
      new THREE.MeshToonMaterial({ color: 0x3a2b1f })
    );
    core.scale.set(0.42, 0.42, 1.25);
    body.add(core);
    for (const s of [-1, 1]) {
      const hinge = new THREE.Group();
      hinge.position.set(s * 0.02, 0.02, 0);
      body.add(hinge);
      const upper = new THREE.Mesh(G.wing, mWing);
      upper.scale.set(1.25, 0.95, 1);
      upper.position.set(s * 0.12, 0, 0.04);
      upper.rotation.set(-Math.PI / 2, 0, 0);
      hinge.add(upper);
      const lower = new THREE.Mesh(G.wing, mWing);
      lower.scale.set(0.85, 0.7, 1);
      lower.position.set(s * 0.1, 0, -0.07);
      lower.rotation.set(-Math.PI / 2, 0, 0);
      hinge.add(lower);
      wings.push(hinge);
    }
  }

  bug.userData = {
    kind: 'bug',
    bug: kind,
    wings,
    R: radius,
    ang: rand(0, Math.PI * 2),
    speed: kind === 'bee' ? rand(0.5, 0.85) : rand(0.22, 0.4),
    height: kind === 'bee' ? rand(1.1, 2.4) : rand(1.6, 3.2),
    bob: rand(0.15, 0.4),
    phase: rand(0, 6.28),
    pop: 0,
    delay,
    happy: 0,
  };
  bug.scale.setScalar(0.0001);
  scene.add(bug);
  return bug;
}

export function updateBug(b: Bug, t: number, dt: number, started: boolean) {
  const u = b.userData;
  if (started) {
    if (u.delay > 0) u.delay -= dt;
    else u.pop = Math.min(1, u.pop + dt * 1.6);
  }
  const boost = u.happy > 0 ? 2.2 : 1;
  if (u.happy > 0) u.happy -= dt;
  u.ang += dt * u.speed * boost;
  const r = u.R + Math.sin(t * 0.7 + u.phase) * 0.35;
  b.position.set(
    Math.cos(u.ang) * r,
    u.height + Math.sin(t * 1.6 + u.phase) * u.bob + (u.happy > 0 ? 0.4 : 0),
    Math.sin(u.ang) * r
  );
  b.rotation.y = -u.ang + Math.PI / 2;
  b.scale.setScalar(
    Math.max(0.0001, easeOutBack(u.pop)) * (u.bug === 'bee' ? 0.75 : 1)
  );
  const flap = u.bug === 'bee' ? 34 : 7;
  const amp = u.bug === 'bee' ? 0.7 : 1.05;
  u.wings.forEach((w, i) => {
    const s = i === 0 ? 1 : -1;
    w.rotation.y = Math.sin(t * flap * boost + u.phase) * amp * s;
  });
}
