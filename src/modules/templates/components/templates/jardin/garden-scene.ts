import * as THREE from 'three';
import { FRASES_BICHO, FRASES_FLOR, FRASES_GATO, JARDIN_LLENO } from './copy';
import {
  clamp,
  heartTexture,
  makeGeometries,
  makeMaterials,
  pick,
  rand,
  type SkyState,
  skyAt,
} from './garden-art';
import type { GardenAudio } from './garden-audio';
import type { GardenConfig } from './garden-config';
import {
  type Bug,
  type Cat,
  type Flower,
  makeBug,
  makeCat,
  makeFlower,
  updateBug,
  updateCat,
  updateFlower,
} from './garden-life';

export type GardenCallbacks = {
  /** Una frase corta en la burbuja de arriba. */
  onToast: (msg: string) => void;
  /** Cuantas flores hay plantadas ahora. */
  onCount: (n: number) => void;
  /** El cielo cambio: el degradado y cuanto se ven las estrellas. */
  onSky: (sky: SkyState) => void;
  /** Alguien toco el cofre del premium. */
  onChestTap?: () => void;
};

export type GardenController = ReturnType<typeof createGarden>;

export function createGarden(
  canvas: HTMLCanvasElement,
  config: GardenConfig,
  audio: GardenAudio,
  cb: GardenCallbacks
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  const hemi = new THREE.HemisphereLight(0xffe9c4, 0x5a3f7a, 0.8);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d0, 0.9);
  sun.position.set(4, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -8,
    right: 8,
    top: 8,
    bottom: -8,
    near: 1,
    far: 25,
  });
  sun.shadow.bias = -0.0008;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xff9ec7, 0.5);
  rim.position.set(-6, 3, -5);
  scene.add(rim);

  const G = makeGeometries();
  const M = makeMaterials();
  const R = config.islandRadius;

  /* ------------------------------ isla flotante ----------------------------- */
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R * 1.04, 0.4, 64),
    new THREE.MeshStandardMaterial({ color: 0x5fae5a, roughness: 0.95 })
  );
  ground.position.y = -0.2;
  ground.receiveShadow = true;
  ground.userData.kind = 'ground';
  scene.add(ground);
  const rock = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.04, R * 0.29, 2.2 + R * 0.12, 48),
    new THREE.MeshStandardMaterial({
      color: 0x7a4b33,
      roughness: 1,
      flatShading: true,
    })
  );
  rock.position.y = -1.5;
  scene.add(rock);

  {
    const bladeGeo = new THREE.ConeGeometry(0.035, 0.3, 3);
    bladeGeo.translate(0, 0.15, 0);
    const N = Math.round(750 * (R / 4.2) ** 2);
    const grass = new THREE.InstancedMesh(
      bladeGeo,
      new THREE.MeshStandardMaterial({ roughness: 0.9, color: 0xffffff }),
      N
    );
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const col = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const r = (R - 0.1) * Math.sqrt(Math.random());
      const a = rand(0, Math.PI * 2);
      p.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      e.set(rand(-0.3, 0.3), rand(0, Math.PI), rand(-0.3, 0.3));
      q.setFromEuler(e);
      const k = rand(0.6, 1.4);
      s.set(k, k * rand(0.7, 1.5), k);
      m.compose(p, q, s);
      grass.setMatrixAt(i, m);
      col.setHSL(rand(0.26, 0.33), rand(0.45, 0.6), rand(0.38, 0.52));
      grass.setColorAt(i, col);
    }
    if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
    grass.receiveShadow = true;
    scene.add(grass);
  }

  /* --------------------------------- seres ---------------------------------- */
  const flowers: Flower[] = [];
  const cats: Cat[] = [];
  const bugs: Bug[] = [];
  const clickables: THREE.Object3D[] = [];

  const addFlower = (
    type: 'sun' | 'daisy',
    x: number,
    z: number,
    h: number,
    delay: number
  ) => {
    const f = makeFlower(scene, G, M, type, x, z, h, delay);
    flowers.push(f);
    clickables.push(f);
    return f;
  };

  // Cada flor arranca un poco despues que la anterior: asi el jardin crece en
  // cascada desde el centro en vez de aparecer de golpe.
  let d = 0.3;
  addFlower('sun', 0, 0.05, 3.1, d);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    d += 0.12;
    addFlower(
      'sun',
      Math.cos(a) * 0.62,
      Math.sin(a) * 0.62,
      rand(2.5, 2.85),
      d
    );
  }
  const ring = Math.max(0, config.initial.sunflowers - 6);
  for (let i = 0; i < ring; i++) {
    const a = (i / ring) * Math.PI * 2 + rand(-0.15, 0.15);
    const rr = 1.3 + (i % 2) * 0.55;
    d += 0.1;
    addFlower('sun', Math.cos(a) * rr, Math.sin(a) * rr, rand(1.8, 2.3), d);
  }

  const catSpots: [number, number][] = [
    [R * 0.51, R * 0.42],
    [-R * 0.54, R * 0.37],
    [R * 0.2, -R * 0.62],
    [-R * 0.3, -R * 0.55],
  ].slice(0, config.animals.cats) as [number, number][];

  for (
    let placed = 0, tries = 0;
    placed < config.initial.daisies && tries < 900;
    tries++
  ) {
    const r = rand(R * 0.45, R * 0.82);
    const a = rand(0, Math.PI * 2);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (catSpots.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 0.85))
      continue;
    if (
      flowers.some((f) => Math.hypot(f.position.x - x, f.position.z - z) < 0.45)
    )
      continue;
    d += 0.05;
    addFlower('daisy', x, z, rand(0.6, 1.25), d);
    placed++;
  }

  const catRecipes = [
    {
      body: 0xf2a24a,
      belly: 0xfff3e0,
      stripes: 0xc9681c,
      tip: 0xfff3e0,
      pitch: 1,
    },
    { body: 0xdcd6e6, belly: 0xffffff, loaf: true, eye: 0x6fb7ff },
    {
      body: 0x2e2a38,
      belly: 0x423c52,
      eye: 0xd7e84a,
      walk: true,
      flower: true,
      pitch: 1.2,
    },
    { body: 0xffffff, belly: 0xfff6ea, eye: 0x7ad3a8, loaf: true, pitch: 1.35 },
  ];
  for (let i = 0; i < config.animals.cats; i++) {
    const recipe = catRecipes[i % catRecipes.length];
    const cat = makeCat(scene, G, M, {
      ...recipe,
      delay: 1.6 + i * 0.3,
      R: R * 0.89,
      ang: 0.9 + i * 1.6,
    });
    if (!recipe.walk) {
      const [x, z] = catSpots[i] ?? [R * 0.5, R * 0.4];
      cat.position.set(x, 0, z);
      cat.rotation.y = Math.atan2(x, z) + (x < 0 ? 0.3 : -0.3);
    }
    cats.push(cat);
    clickables.push(cat);
  }

  for (let i = 0; i < config.animals.bees; i++) {
    const b = makeBug(
      scene,
      G,
      M,
      'bee',
      rand(R * 0.35, R * 0.95),
      2.4 + i * 0.12
    );
    bugs.push(b);
    clickables.push(b);
  }
  for (let i = 0; i < config.animals.butterflies; i++) {
    const b = makeBug(
      scene,
      G,
      M,
      'butterfly',
      rand(R * 0.4, R * 1.05),
      2.6 + i * 0.15
    );
    bugs.push(b);
    clickables.push(b);
  }

  /* ------------------------------- particulas ------------------------------- */
  type Part = {
    o: THREE.Object3D;
    /** Se guarda aparte: Mesh y Sprite no comparten el tipo de `material`. */
    mat: THREE.Material;
    v: THREE.Vector3;
    life: number;
    max: number;
    g: number;
    spin?: THREE.Vector3;
  };
  const parts: Part[] = [];

  const burstPetals = (pos: THREE.Vector3, n: number) => {
    for (let i = 0; i < n; i++) {
      const mat = M.petalA.clone();
      mat.transparent = true;
      const m = new THREE.Mesh(G.daisyPetal, mat);
      m.position.copy(pos);
      m.rotation.set(rand(0, 6), rand(0, 6), rand(0, 6));
      const v = new THREE.Vector3(rand(-1, 1), rand(0.2, 1.2), rand(-1, 1))
        .normalize()
        .multiplyScalar(rand(1.5, 3));
      scene.add(m);
      parts.push({
        o: m,
        mat,
        v,
        life: 0,
        max: rand(1.1, 1.7),
        g: 2.4,
        spin: new THREE.Vector3(rand(-7, 7), rand(-7, 7), rand(-7, 7)),
      });
    }
  };

  const burstHearts = (pos: THREE.Vector3, n: number, colors: string[]) => {
    for (let i = 0; i < n; i++) {
      const mat = new THREE.SpriteMaterial({
        map: heartTexture(pick(colors)),
        transparent: true,
        depthWrite: false,
      });
      const sp = new THREE.Sprite(mat);
      const k = rand(0.25, 0.45);
      sp.scale.set(k, k, 1);
      sp.position.copy(pos);
      scene.add(sp);
      parts.push({
        o: sp,
        mat,
        v: new THREE.Vector3(rand(-0.9, 0.9), rand(1, 2), rand(-0.9, 0.9)),
        life: 0,
        max: rand(1.3, 2),
        g: -0.2,
      });
    }
  };

  const drift: {
    o: THREE.Mesh;
    sp: number;
    ph: number;
    rs: THREE.Vector3;
  }[] = [];
  for (let i = 0; i < config.driftPetals; i++) {
    const m = new THREE.Mesh(G.daisyPetal, M.petalA);
    m.scale.setScalar(rand(0.6, 1.1));
    m.position.set(rand(-R - 2, R + 2), rand(-2, 9), rand(-R - 2, R + 2));
    scene.add(m);
    drift.push({
      o: m,
      sp: rand(0.25, 0.55),
      ph: rand(0, 6),
      rs: new THREE.Vector3(rand(-2, 2), rand(-2, 2), rand(-2, 2)),
    });
  }

  const FN = config.fireflies;
  const fPos = new Float32Array(FN * 3);
  const fBase: { x: number; y: number; z: number; ph: number; s: number }[] =
    [];
  for (let i = 0; i < FN; i++) {
    const a = rand(0, 6.28);
    const r = rand(0.8, R * 1.3);
    fBase.push({
      x: Math.cos(a) * r,
      y: rand(0.4, 4.2),
      z: Math.sin(a) * r,
      ph: rand(0, 6),
      s: rand(0.3, 0.8),
    });
  }
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  const fMat = new THREE.PointsMaterial({
    size: 0.22,
    map: M.glow,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: 0xfff2a8,
  });
  scene.add(new THREE.Points(fGeo, fMat));

  /* --------------------------------- camara --------------------------------- */
  const target = new THREE.Vector3(0, 1.3, 0);
  let theta = 0.35;
  let phi = 1.12;
  let dist = window.innerWidth / window.innerHeight < 0.8 ? 11.5 : 10.5;
  dist *= R / 4.2;
  let vTheta = 0;
  let vPhi = 0;
  let lastInteract = -1e9;

  const updateCamera = () => {
    camera.position.set(
      target.x + dist * Math.sin(phi) * Math.sin(theta),
      target.y + dist * Math.cos(phi),
      target.z + dist * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(target);
  };

  const onResize = () => {
    const a = window.innerWidth / window.innerHeight;
    camera.aspect = a;
    camera.fov = a < 0.8 ? 60 : a < 1.2 ? 52 : 45;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);
  onResize();

  /* ------------------------------- interaccion ------------------------------ */
  const pointers = new Map<number, { x: number; y: number }>();
  let down: { x: number; y: number; t: number; moved: number } | null = null;
  let pinch0 = 0;
  let dist0 = dist;

  const onPointerDown = (e: PointerEvent) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastInteract = performance.now();
    if (pointers.size === 1) {
      down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
      vTheta = 0;
      vPhi = 0;
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch0 = Math.hypot(a.x - b.x, a.y - b.y);
      dist0 = dist;
      down = null;
    }
  };
  const onPointerMove = (e: PointerEvent) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastInteract = performance.now();
    if (pointers.size === 1) {
      theta -= dx * 0.008;
      phi = clamp(phi - dy * 0.006, 0.45, 1.5);
      vTheta = -dx * 0.008;
      vPhi = -dy * 0.006;
      if (down) down.moved += Math.abs(dx) + Math.abs(dy);
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      dist = clamp(
        (dist0 * pinch0) / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        5,
        20 * (R / 4.2)
      );
    }
  };
  const endPointer = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (down && down.moved < 10 && performance.now() - down.t < 450)
      onTap(e.clientX, e.clientY);
    down = null;
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    dist = clamp(dist * (1 + e.deltaY * 0.001), 5, 20 * (R / 4.2));
    lastInteract = performance.now();
  };
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  const ray = new THREE.Raycaster();
  ray.params.Line = { threshold: 0.02 };
  const ndc = new THREE.Vector2();
  const tmp = new THREE.Vector3();
  let started = false;
  let lastFrase = '';
  const nextFrase = (arr: readonly string[]) => {
    let f = pick(arr);
    let guard = 0;
    while (f === lastFrase && arr.length > 1 && guard++ < 8) f = pick(arr);
    lastFrase = f;
    return f;
  };

  const tapFlower = (f: Flower) => {
    const u = f.userData;
    u.spin = 14;
    u.bounce = 1;
    u.flutter = 1;
    u.head.getWorldPosition(tmp);
    burstPetals(tmp, 16);
    burstHearts(tmp, 3, ['#ffcf33', '#ffe066']);
    audio.chime();
    cb.onToast(nextFrase(FRASES_FLOR));
  };
  const tapCat = (c: Cat) => {
    const u = c.userData;
    if (u.jump > 0.3) return;
    u.jump = 1;
    u.happy = 1.3;
    u.head.getWorldPosition(tmp);
    tmp.y += 0.3;
    burstHearts(tmp, 9, ['#ff5c8a', '#ff8fb1', '#ffcf33']);
    if (u.loaf) audio.purr();
    else audio.meow(u.pitch);
    cb.onToast(nextFrase(FRASES_GATO));
  };
  const tapBug = (b: Bug) => {
    b.userData.happy = 1.4;
    b.getWorldPosition(tmp);
    burstHearts(tmp, 5, ['#ffe066', '#ffcf33', '#b8f28a']);
    audio.buzz();
    cb.onToast(nextFrase(FRASES_BICHO));
  };

  const plantAt = (x: number, z: number) => {
    if (flowers.length >= config.maxFlowers) {
      cb.onToast(JARDIN_LLENO);
      return;
    }
    const sunType = Math.random() < 0.45;
    const f = addFlower(
      sunType ? 'sun' : 'daisy',
      x,
      z,
      sunType ? rand(1.4, 2.2) : rand(0.6, 1.2),
      0
    );
    f.userData.grow = 0.02;
    tmp.set(x, 0.2, z);
    burstHearts(tmp, 3, ['#ffe066', '#b8f28a']);
    audio.plant();
    cb.onCount(flowers.length);
  };

  function onTap(x: number, y: number) {
    if (!started) return;
    ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([...clickables, ground], true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      while (o && !o.userData.kind) o = o.parent;
      if (!o) continue;
      if (o.userData.kind === 'flower') return tapFlower(o as Flower);
      if (o.userData.kind === 'cat') return tapCat(o as Cat);
      if (o.userData.kind === 'bug') return tapBug(o as Bug);
      if (o.userData.kind === 'ground') {
        if (Math.hypot(h.point.x, h.point.z) < R - 0.3)
          plantAt(h.point.x, h.point.z);
        return;
      }
    }
  }

  /* ---------------------------------- loop ---------------------------------- */
  const clock = new THREE.Clock();
  let raf = 0;
  let skyPhase = 0.55; // arranca en la tarde, como el regalo original
  /**
   * Cada cuanto se recalcula el cielo. Armar el degradado y avisar a React en
   * cada frame significaba un render por frame; a cuatro veces por segundo el
   * cambio se sigue viendo continuo porque el CSS lo interpola en 1,2 s.
   */
  const SKY_TICK = 0.25;
  let skyAcc = SKY_TICK;
  let fireflyLevel = 0.5;

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (config.dayNight && started) {
      skyPhase += dt / config.dayLengthSeconds;
      skyAcc += dt;
      if (skyAcc >= SKY_TICK) {
        skyAcc = 0;
        const sky = skyAt(skyPhase);
        hemi.color.copy(sky.hemiSky);
        hemi.groundColor.copy(sky.hemiGround);
        hemi.intensity = sky.hemiIntensity;
        sun.color.copy(sky.sunColor);
        sun.intensity = sky.sunIntensity;
        fireflyLevel = sky.fireflies;
        cb.onSky(sky);
      }
      fMat.opacity = (0.35 + 0.35 * Math.sin(t * 2.2)) * fireflyLevel;
    } else {
      fMat.opacity = 0.65 + 0.35 * Math.sin(t * 2.2);
    }

    if (pointers.size === 0) {
      theta += vTheta;
      phi = clamp(phi + vPhi, 0.45, 1.5);
      vTheta *= 0.92;
      vPhi *= 0.88;
      if (performance.now() - lastInteract > 3500) theta += dt * 0.07;
    }
    updateCamera();

    for (const f of flowers) updateFlower(f, t, dt, started);
    for (const c of cats) updateCat(c, t, dt, started, camera);
    for (const b of bugs) updateBug(b, t, dt, started);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      p.v.y -= p.g * dt;
      p.v.multiplyScalar(1 - dt * 0.9);
      p.o.position.addScaledVector(p.v, dt);
      if (p.spin) {
        p.o.rotation.x += p.spin.x * dt;
        p.o.rotation.y += p.spin.y * dt;
        p.o.rotation.z += p.spin.z * dt;
      }
      p.mat.opacity = 1 - (p.life / p.max) ** 2;
      if (p.life >= p.max) {
        scene.remove(p.o);
        p.mat.dispose();
        parts.splice(i, 1);
      }
    }

    for (const p of drift) {
      p.o.position.y -= p.sp * dt;
      p.o.position.x += Math.sin(t * 0.7 + p.ph) * 0.004;
      p.o.rotation.x += p.rs.x * dt;
      p.o.rotation.y += p.rs.y * dt;
      p.o.rotation.z += p.rs.z * dt;
      if (p.o.position.y < -3)
        p.o.position.set(rand(-R - 2, R + 2), rand(8, 10), rand(-R - 2, R + 2));
    }

    for (let i = 0; i < FN; i++) {
      const b = fBase[i];
      fPos[i * 3] = b.x + Math.sin(t * b.s + b.ph) * 0.5;
      fPos[i * 3 + 1] = b.y + Math.sin(t * b.s * 1.3 + b.ph * 2) * 0.35;
      fPos[i * 3 + 2] = b.z + Math.cos(t * b.s * 0.9 + b.ph) * 0.5;
    }
    fGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  };
  frame();

  return {
    /** Arranca el crecimiento del jardin, al abrir el regalo. */
    start() {
      started = true;
      cb.onCount(flowers.length);
      cb.onSky(skyAt(skyPhase));
    },
    plantRandom() {
      const r = rand(R * 0.28, R * 0.82);
      const a = rand(0, Math.PI * 2);
      plantAt(Math.cos(a) * r, Math.sin(a) * r);
    },
    get flowerCount() {
      return flowers.length;
    },
    get maxFlowers() {
      return config.maxFlowers;
    },
    /** Lluvia de corazones sobre el jardin. La usa el cofre al abrirse. */
    celebrate(n = 22) {
      burstHearts(new THREE.Vector3(0, 3.4, 0), n, [
        '#ff5c8a',
        '#ffcf33',
        '#ff8fb1',
        '#ffe066',
      ]);
      audio.chime();
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endPointer);
      canvas.removeEventListener('pointercancel', endPointer);
      canvas.removeEventListener('wheel', onWheel);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) for (const m of mat) m.dispose();
        else if (mat) mat.dispose();
      });
      renderer.dispose();
    },
  };
}
