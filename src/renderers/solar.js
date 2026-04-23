/**
 * solar.js - Solar system visual engine
 * Renders sun, orbit rings, planets, moons, trails, and particles.
 * Universe Clock - by Agus Satria Adhitama
 */

const TAU = Math.PI * 2;

/** Linear interpolation */
const lerp = (a, b, t) => a + (b - a) * t;

/** Hex color + alpha → rgba string */
function hexAlpha(hex, a) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

export class SolarSystem {
  constructor() {
    this.trails = {
      sec: [],
      min: [],
      hr:  [],
    };
    this.maxTrailLen = { sec: 90, min: 55, hr: 30 };
    this.particles   = [];
    this.lastSec     = -1;
  }

  /** Emit a burst of particles when seconds tick */
  _emitParticles(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * TAU;
      const speed = 0.4 + Math.random() * 1.4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.04 + Math.random() * 0.04,
        size: 1 + Math.random() * 2,
        color,
      });
    }
  }

  /** Compute planet position from center + orbit radius + angle */
  static pos(cx, cy, r, angle) {
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  }

  draw(ctx, cx, cy, angles, palette, opts, t) {
    const { mode, showTrails, seed } = opts;

    // ── Planet sizes & orbit radii (responsive to screen) ──
    const base = Math.min(cx, cy) * 0.9;
    const orbitHr  = base * 0.42;
    const orbitMin = base * 0.65;
    const orbitSec = base * 0.83;

    const sunR  = base * 0.055;
    const pHr   = base * 0.030;
    const pMin  = base * 0.022;
    const pSec  = base * 0.015;
    const moonR = base * 0.008;

    // Planet positions
    const posHr  = SolarSystem.pos(cx, cy, orbitHr,  angles.hrAngle);
    const posMin = SolarSystem.pos(cx, cy, orbitMin, angles.minAngle);
    const posSec = SolarSystem.pos(cx, cy, orbitSec, angles.secAngle);

    // Moon (orbits around seconds planet)
    const moonAngle = t * 3.5;
    const moonR2    = pSec * 3.5;
    const posMoon   = SolarSystem.pos(posSec.x, posSec.y, moonR2, moonAngle);

    // ── Update trails ──
    if (showTrails) {
      this.trails.hr.push({...posHr});
      this.trails.min.push({...posMin});
      this.trails.sec.push({...posSec});

      if (this.trails.hr.length  > this.maxTrailLen.hr)  this.trails.hr.shift();
      if (this.trails.min.length > this.maxTrailLen.min) this.trails.min.shift();
      if (this.trails.sec.length > this.maxTrailLen.sec) this.trails.sec.shift();
    }

    // ── Emit particles on seconds tick ──
    const curSec = angles.seconds;
    if (curSec !== this.lastSec) {
      this.lastSec = curSec;
      this._emitParticles(posSec.x, posSec.y, palette.tertiary);
    }

    // ── Update + draw particles ──
    this.particles = this.particles.filter(p => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // slight gravity
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life * 0.8);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // ── Draw orbit rings ──
    if (mode !== 'minimal') {
      this._drawOrbitRing(ctx, cx, cy, orbitHr,  palette.primary,   mode);
      this._drawOrbitRing(ctx, cx, cy, orbitMin, palette.secondary, mode);
      this._drawOrbitRing(ctx, cx, cy, orbitSec, palette.tertiary,  mode);
    }

    // ── Draw trails ──
    if (showTrails) {
      this._drawTrail(ctx, this.trails.hr,  palette.primary,   this.maxTrailLen.hr);
      this._drawTrail(ctx, this.trails.min, palette.secondary, this.maxTrailLen.min);
      this._drawTrail(ctx, this.trails.sec, palette.tertiary,  this.maxTrailLen.sec);
    }

    // ── Draw sun ──
    this._drawSun(ctx, cx, cy, sunR, palette, t, mode);

    // ── Draw planets ──
    this._drawPlanet(ctx, posHr.x,  posHr.y,  pHr,  palette.primary,   t, 0.6, mode);
    this._drawPlanet(ctx, posMin.x, posMin.y, pMin, palette.secondary, t, 0.8, mode);
    this._drawPlanet(ctx, posSec.x, posSec.y, pSec, palette.tertiary,  t, 1.0, mode);

    // ── Draw moon ──
    if (mode !== 'orrery') {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = palette.tertiary;
      ctx.beginPath();
      ctx.arc(posMoon.x, posMoon.y, moonR, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // ── Planet labels ──
    if (mode !== 'minimal') {
      this._drawLabel(ctx, posHr.x,  posHr.y,  pHr,  'HRS',  palette.primary,   angles.hours);
      this._drawLabel(ctx, posMin.x, posMin.y, pMin, 'MIN',  palette.secondary, angles.minutes);
      this._drawLabel(ctx, posSec.x, posSec.y, pSec, 'SEC',  palette.tertiary,  angles.seconds);
    }

    // ── Orrery mode: tick marks on orbit rings ──
    if (mode === 'orrery') {
      this._drawTicks(ctx, cx, cy, orbitHr,  12, palette.primary);
      this._drawTicks(ctx, cx, cy, orbitMin, 60, palette.secondary);
      this._drawTicks(ctx, cx, cy, orbitSec, 60, palette.tertiary);
    }
  }

  _drawOrbitRing(ctx, cx, cy, r, color, mode) {
    ctx.save();
    ctx.strokeStyle = hexAlpha(color, mode === 'orrery' ? 0.35 : 0.12);
    ctx.lineWidth   = mode === 'orrery' ? 0.5 : 0.4;
    if (mode !== 'orrery') {
      ctx.setLineDash([2, 8]);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  _drawTrail(ctx, trail, color, maxLen) {
    if (trail.length < 2) return;
    ctx.save();
    for (let i = 1; i < trail.length; i++) {
      const t   = i / trail.length;
      const a   = Math.pow(t, 1.8) * 0.6;
      ctx.strokeStyle = hexAlpha(color, a);
      ctx.lineWidth   = t * 2.5;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(trail[i-1].x, trail[i-1].y);
      ctx.lineTo(trail[i].x,   trail[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawSun(ctx, cx, cy, r, palette, t, mode) {
    // Pulse animation
    const pulse = mode === 'minimal' ? 0 : Math.sin(t * 1.5) * 0.08;
    const rp = r * (1 + pulse);

    // Corona rings (only in cosmic mode)
    if (mode === 'cosmic') {
      for (let i = 3; i > 0; i--) {
        ctx.save();
        ctx.globalAlpha = 0.06 / i;
        ctx.strokeStyle = palette.sun;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rp * (1 + i * 0.55), 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Inner glow
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle   = palette.sun;
    ctx.beginPath();
    ctx.arc(cx, cy, rp * 2.2, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Sun body
    ctx.save();
    ctx.fillStyle = palette.sun;
    ctx.beginPath();
    ctx.arc(cx, cy, rp, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Highlight
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - rp * 0.25, cy - rp * 0.25, rp * 0.35, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  _drawPlanet(ctx, x, y, r, color, t, pulseScale, mode) {
    const pulse = mode === 'minimal' ? 0 : Math.sin(t * 2 * pulseScale) * 0.1;
    const rp = r * (1 + pulse);

    if (mode === 'cosmic') {
      // Outer glow
      ctx.save();
      ctx.globalAlpha = 0.20;
      ctx.fillStyle   = color;
      ctx.beginPath();
      ctx.arc(x, y, rp * 2.8, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Planet body
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, rp, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Highlight
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - rp * 0.25, y - rp * 0.3, rp * 0.38, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  _drawLabel(ctx, x, y, r, text, color, value) {
    const offset = r + 14;
    // Place label away from center
    const angle  = Math.atan2(y - (ctx.canvas ? ctx.canvas.height/2 : 0), x);
    const lx = x + Math.cos(angle) * offset;
    const ly = y + Math.sin(angle) * offset;

    ctx.save();
    ctx.font      = '500 9px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Value number
    ctx.globalAlpha = 0.9;
    ctx.fillStyle   = color;
    ctx.fillText(String(value).padStart(2, '0'), lx, ly);

    // Label text below
    ctx.globalAlpha = 0.45;
    ctx.font        = '400 7px "Space Mono", monospace';
    ctx.fillText(text, lx, ly + 10);
    ctx.restore();
  }

  _drawTicks(ctx, cx, cy, r, count, color) {
    ctx.save();
    ctx.strokeStyle = hexAlpha(color, 0.4);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * TAU - Math.PI / 2;
      const isMajor = i % (count / 12) === 0;
      const len = isMajor ? 8 : 4;
      ctx.lineWidth = isMajor ? 0.8 : 0.4;
      const x1 = cx + Math.cos(angle) * (r - len / 2);
      const y1 = cy + Math.sin(angle) * (r - len / 2);
      const x2 = cx + Math.cos(angle) * (r + len / 2);
      const y2 = cy + Math.sin(angle) * (r + len / 2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
