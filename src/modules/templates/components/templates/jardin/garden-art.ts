import * as THREE from 'three';

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
export const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
export const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
};
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** El corazon del girasol: semillas en espiral de Fibonacci. */
function seedTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const x = c.getContext('2d');
  if (!x) return new THREE.Texture();
  const g = x.createRadialGradient(128, 128, 8, 128, 128, 128);
  g.addColorStop(0, '#6b4a14');
  g.addColorStop(0.55, '#3d220a');
  g.addColorStop(1, '#241205');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 560; i++) {
    const r = Math.sqrt(i / 560) * 122;
    const a = i * golden;
    x.beginPath();
    x.arc(
      128 + r * Math.cos(a),
      128 + r * Math.sin(a),
      1.4 + (r / 122) * 2.6,
      0,
      Math.PI * 2
    );
    x.fillStyle = i < 50 ? '#9c8a2e' : i % 3 ? '#5a3410' : '#8a5518';
    x.fill();
  }
  return new THREE.CanvasTexture(c);
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const x = c.getContext('2d');
  if (!x) return new THREE.Texture();
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,245,180,.8)');
  g.addColorStop(1, 'rgba(255,210,90,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const heartCache: Record<string, THREE.Texture> = {};
export function heartTexture(color: string) {
  const cached = heartCache[color];
  if (cached) return cached;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const x = c.getContext('2d');
  if (!x) return new THREE.Texture();
  x.shadowColor = color;
  x.shadowBlur = 16;
  x.fillStyle = color;
  x.beginPath();
  x.moveTo(64, 108);
  x.bezierCurveTo(18, 78, 8, 44, 30, 28);
  x.bezierCurveTo(46, 16, 60, 24, 64, 38);
  x.bezierCurveTo(68, 24, 82, 16, 98, 28);
  x.bezierCurveTo(120, 44, 110, 78, 64, 108);
  x.fill();
  x.shadowBlur = 0;
  x.fillStyle = 'rgba(255,255,255,.55)';
  x.beginPath();
  x.ellipse(42, 42, 8, 5, -0.6, 0, Math.PI * 2);
  x.fill();
  const texture = new THREE.CanvasTexture(c);
  heartCache[color] = texture;
  return texture;
}

/** Petalo curvado: `cup` lo ahueca a lo ancho y `droop` lo deja caer a lo largo. */
function petalGeo(w: number, L: number, cup: number, droop: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w, L * 0.2, w * 0.9, L * 0.75, 0, L);
  s.bezierCurveTo(-w * 0.9, L * 0.75, -w, L * 0.2, 0, 0);
  const g = new THREE.ShapeGeometry(s, 10);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    p.setZ(i, (cup * (x * x)) / w - (droop * (y * y)) / L);
  }
  g.computeVertexNormals();
  return g;
}

export type GardenGeometries = ReturnType<typeof makeGeometries>;
export function makeGeometries() {
  return {
    sunPetal: petalGeo(0.11, 0.44, 0.35, 0.15),
    sunPetal2: petalGeo(0.1, 0.37, 0.45, 0.08),
    daisyPetal: petalGeo(0.055, 0.26, 0.3, 0.05),
    leaf: petalGeo(0.11, 0.46, 0.5, 0.12),
    centerBack: new THREE.SphereGeometry(0.26, 24, 16),
    centerFace: new THREE.CircleGeometry(0.25, 48),
    daisyCenter: new THREE.SphereGeometry(0.075, 16, 12),
    sph: new THREE.SphereGeometry(1, 24, 18),
    ear: new THREE.ConeGeometry(0.13, 0.26, 4),
    leg: new THREE.CylinderGeometry(0.075, 0.068, 0.4, 10),
    tail: new THREE.CylinderGeometry(0.05, 0.058, 0.15, 8),
    stripe: new THREE.TorusGeometry(1, 0.09, 6, 24, Math.PI),
    mstem: new THREE.CylinderGeometry(0.014, 0.014, 0.5, 6),
    wing: new THREE.CircleGeometry(0.11, 12),
    bug: new THREE.SphereGeometry(0.07, 12, 10),
  };
}

export type GardenMaterials = ReturnType<typeof makeMaterials>;
export function makeMaterials() {
  return {
    stem: new THREE.MeshStandardMaterial({ color: 0x4d9a3e, roughness: 0.7 }),
    leaf: new THREE.MeshStandardMaterial({
      color: 0x5cb24a,
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
    petalA: new THREE.MeshStandardMaterial({
      color: 0xffc21a,
      roughness: 0.45,
      side: THREE.DoubleSide,
      emissive: 0x4a3000,
      emissiveIntensity: 0.45,
    }),
    petalB: new THREE.MeshStandardMaterial({
      color: 0xffa800,
      roughness: 0.45,
      side: THREE.DoubleSide,
      emissive: 0x3a2000,
      emissiveIntensity: 0.4,
    }),
    petalC: new THREE.MeshStandardMaterial({
      color: 0xffe14d,
      roughness: 0.4,
      side: THREE.DoubleSide,
      emissive: 0x4a3a00,
      emissiveIntensity: 0.45,
    }),
    centerBack: new THREE.MeshStandardMaterial({
      color: 0x3a200a,
      roughness: 0.9,
    }),
    centerFace: new THREE.MeshStandardMaterial({
      map: seedTexture(),
      roughness: 0.85,
    }),
    daisyCenter: new THREE.MeshStandardMaterial({
      color: 0xff8a00,
      roughness: 0.6,
      emissive: 0x442000,
      emissiveIntensity: 0.4,
    }),
    whisker: new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
    }),
    wing: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      roughness: 0.3,
    }),
    glow: glowTexture(),
  };
}

/**
 * Momentos del cielo. El jardin los recorre en bucle: amanece, se hace de dia,
 * cae la tarde y llega la noche, que es el cielo del regalo original.
 */
export type SkyMoment = {
  name: string;
  /** Las cuatro paradas del degradado, del horizonte hacia arriba. */
  stops: [string, string, string, string];
  sun: { color: number; intensity: number };
  hemi: { sky: number; ground: number; intensity: number };
  /** Cuanto se ven las estrellas y las luciernagas, de 0 a 1. */
  stars: number;
  fireflies: number;
};

export const SKY_MOMENTS: SkyMoment[] = [
  {
    name: 'amanecer',
    stops: ['#ffd9a0', '#ff9e7d', '#c77dbb', '#4b3b8f'],
    sun: { color: 0xffd9a8, intensity: 0.85 },
    hemi: { sky: 0xffe0c0, ground: 0x6a5a8a, intensity: 0.85 },
    stars: 0.25,
    fireflies: 0.2,
  },
  {
    name: 'dia',
    stops: ['#fff6cf', '#ffe08a', '#8fd4f0', '#3aa0e0'],
    sun: { color: 0xfffaf0, intensity: 1.25 },
    hemi: { sky: 0xffffff, ground: 0x9fd08a, intensity: 1.05 },
    stars: 0,
    fireflies: 0,
  },
  {
    name: 'tarde',
    stops: ['#ffc98a', '#ffb36b', '#e0708f', '#6a4c9c'],
    sun: { color: 0xfff1d0, intensity: 0.9 },
    hemi: { sky: 0xffe9c4, ground: 0x5a3f7a, intensity: 0.8 },
    stars: 0.35,
    fireflies: 0.5,
  },
  {
    name: 'noche',
    stops: ['#6a4c9c', '#3c2b6e', '#241a52', '#120c30'],
    sun: { color: 0xa9b6ff, intensity: 0.42 },
    hemi: { sky: 0x9fb0ff, ground: 0x2a2050, intensity: 0.55 },
    stars: 1,
    fireflies: 1,
  },
];

const mixHex = (a: string, b: string, t: number) => {
  const pa = Number.parseInt(a.slice(1), 16);
  const pb = Number.parseInt(b.slice(1), 16);
  const ch = (shift: number) => {
    const va = (pa >> shift) & 255;
    const vb = (pb >> shift) & 255;
    return Math.round(va + (vb - va) * t);
  };
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

export type SkyState = ReturnType<typeof skyAt>;

/** El cielo en un punto del ciclo, con `phase` entre 0 y 1. */
export function skyAt(phase: number) {
  const n = SKY_MOMENTS.length;
  const scaled = ((((phase % 1) + 1) % 1) * n) % n;
  const i = Math.floor(scaled);
  const from = SKY_MOMENTS[i];
  const to = SKY_MOMENTS[(i + 1) % n];
  const t = smooth(0, 1, scaled - i);
  const stops = from.stops.map((stop, k) => mixHex(stop, to.stops[k], t));
  return {
    gradient: `radial-gradient(130% 70% at 50% 108%, ${stops[0]} 0%, ${stops[1]} 16%, ${stops[2]} 42%, ${stops[3]} 100%)`,
    sunColor: new THREE.Color(from.sun.color).lerp(
      new THREE.Color(to.sun.color),
      t
    ),
    sunIntensity:
      from.sun.intensity + (to.sun.intensity - from.sun.intensity) * t,
    hemiSky: new THREE.Color(from.hemi.sky).lerp(
      new THREE.Color(to.hemi.sky),
      t
    ),
    hemiGround: new THREE.Color(from.hemi.ground).lerp(
      new THREE.Color(to.hemi.ground),
      t
    ),
    hemiIntensity:
      from.hemi.intensity + (to.hemi.intensity - from.hemi.intensity) * t,
    stars: from.stars + (to.stars - from.stars) * t,
    fireflies: from.fireflies + (to.fireflies - from.fireflies) * t,
    moment: t < 0.5 ? from.name : to.name,
  };
}
