/**
 * noise.js - Simplex noise (2D & 3D)
 * Adapted from Stefan Gustavson's public domain implementation.
 * Universe Clock - by Agus Satria Adhitama
 */

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

const grad3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
];

function buildPerm(seed) {
  // Seeded shuffle of 0..255
  const p = Array.from({length: 256}, (_, i) => i);
  let s = seed >>> 0;
  for (let i = 255; i > 0; i--) {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >> 7)) >>> 0;
    s = (s ^ (s << 17)) >>> 0;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
}

export class SimplexNoise {
  constructor(seed = 0) {
    this.perm = buildPerm(seed);
  }

  noise2D(xin, yin) {
    const { perm } = this;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t, Y0 = j - t;
    const x0 = xin - X0, y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else         { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2*G2, y2 = y0 - 1 + 2*G2;

    const ii = i & 255, jj = j & 255;
    const gi0 = perm[ii      + perm[jj     ]] % 12;
    const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
    const gi2 = perm[ii + 1  + perm[jj + 1 ]] % 12;

    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0*x0 - y0*y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * (grad3[gi0][0]*x0 + grad3[gi0][1]*y0); }
    let t1 = 0.5 - x1*x1 - y1*y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * (grad3[gi1][0]*x1 + grad3[gi1][1]*y1); }
    let t2 = 0.5 - x2*x2 - y2*y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * (grad3[gi2][0]*x2 + grad3[gi2][1]*y2); }

    return 70 * (n0 + n1 + n2); // [-1, 1]
  }

  /** Fractal Brownian Motion - layered octaves */
  fbm(x, y, octaves = 4, lacunarity = 2.0, gain = 0.5) {
    let val = 0, amp = 0.5, freq = 1;
    for (let i = 0; i < octaves; i++) {
      val += this.noise2D(x * freq, y * freq) * amp;
      amp  *= gain;
      freq *= lacunarity;
    }
    return val;
  }
}
