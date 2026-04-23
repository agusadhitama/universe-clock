/**
 * nebula.js - Generative nebula background
 * Renders off-screen using simplex noise, composited into scene.
 * Universe Clock - by Agus Satria Adhitama
 */

import { SimplexNoise } from '../core/noise.js';

const RESOLUTION = 3; // pixels per noise sample (performance vs quality)

export class Nebula {
  constructor(seed) {
    this.noise   = new SimplexNoise(seed);
    this.noise2  = new SimplexNoise(seed ^ 0xDEAD);
    this.offscreen = null;
    this.dirty   = true;
    this.palette = null;
    this.w = 0;
    this.h = 0;
  }

  /** Call when palette or size changes */
  invalidate() { this.dirty = true; }

  resize(w, h, palette) {
    this.w = w;
    this.h = h;
    this.palette = palette;
    this.dirty = true;
  }

  /** Parse hex color → {r,g,b} */
  static hexToRgb(hex) {
    const n = parseInt(hex.replace('#',''), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  /** Render nebula to offscreen canvas (expensive, done only when dirty) */
  _bake() {
    const { w, h, noise, noise2, palette } = this;
    const RES = RESOLUTION;
    const cols = Math.ceil(w / RES);
    const rows = Math.ceil(h / RES);

    this.offscreen = document.createElement('canvas');
    this.offscreen.width  = cols;
    this.offscreen.height = rows;
    const ctx  = this.offscreen.getContext('2d');
    const data = ctx.createImageData(cols, rows);
    const buf  = data.data;

    const c1 = Nebula.hexToRgb(palette.nebula);
    const c2 = Nebula.hexToRgb(palette.primary);
    const c3 = Nebula.hexToRgb(palette.secondary);

    const scale1 = 1.8 / Math.max(cols, rows);
    const scale2 = 3.5 / Math.max(cols, rows);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const n1 = (noise.fbm(col * scale1, row * scale1, 4) + 1) * 0.5;
        const n2 = (noise2.fbm(col * scale2, row * scale2, 3) + 1) * 0.5;

        // Two-layer blend: big cloud + fine detail
        const cloud = Math.pow(n1, 2.5);
        const detail = Math.pow(n2, 3.0) * 0.5;
        const v = Math.max(0, Math.min(1, cloud + detail));

        // Color: blend between bg→nebula→primary→secondary based on density
        let r, g, b;
        if (v < 0.3) {
          const t = v / 0.3;
          r = c1.r * t; g = c1.g * t; b = c1.b * t;
        } else if (v < 0.65) {
          const t = (v - 0.3) / 0.35;
          r = c1.r + (c2.r - c1.r) * t;
          g = c1.g + (c2.g - c1.g) * t;
          b = c1.b + (c2.b - c1.b) * t;
        } else {
          const t = (v - 0.65) / 0.35;
          r = c2.r + (c3.r - c2.r) * t;
          g = c2.g + (c3.g - c2.g) * t;
          b = c2.b + (c3.b - c2.b) * t;
        }

        const alpha = v * 200; // 0–200
        const idx = (row * cols + col) * 4;
        buf[idx    ] = Math.round(r);
        buf[idx + 1] = Math.round(g);
        buf[idx + 2] = Math.round(b);
        buf[idx + 3] = Math.round(alpha);
      }
    }

    ctx.putImageData(data, 0, 0);
    this.dirty = false;
  }

  draw(ctx, enabled) {
    if (!enabled) return;
    if (!this.w) return;
    if (this.dirty) this._bake();

    ctx.save();
    ctx.globalAlpha = 0.80;
    ctx.drawImage(this.offscreen, 0, 0, this.w, this.h);
    ctx.restore();
  }
}
