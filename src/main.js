/**
 * main.js - Universe Clock
 * by Agus Satria Adhitama
 */

import { getTimeAngles }             from './core/clock.js';
import { generatePalette, todayStr } from './core/palette.js';
import { Starfield }                 from './renderers/starfield.js';
import { Nebula }                    from './renderers/nebula.js';
import { SolarSystem }               from './renderers/solar.js';
import { HUD }                       from './renderers/hud.js';
import { Controls }                  from './ui/controls.js';

class UniverseClock {
  constructor() {
    this.canvas  = document.getElementById('universe');
    this.ctx     = this.canvas.getContext('2d');
    this.dateStr = todayStr();
    this.palette = null;
    this.W = window.innerWidth;
    this.H = window.innerHeight;

    this.opts = {
      mode:       'cosmic',
      showTrails: true,
      showNebula: true,
    };

    this._injectLoadingScreen();

    this.hud      = new HUD();
    this.solar    = new SolarSystem();
    this.starfield = null;
    this.nebula   = null;

    this._setupCanvas();
    this._applyDate(this.dateStr);
    this._setupResize();
    this.controls = new Controls(this);

    requestAnimationFrame(t => this._loop(t));

    setTimeout(() => {
      document.getElementById('loading')?.classList.add('fade');
      setTimeout(() => document.getElementById('loading')?.remove(), 900);
    }, 600);
  }

  _injectLoadingScreen() {
    const el = document.createElement('div');
    el.id = 'loading';
    el.innerHTML = `<div id="loading-ring"></div><div id="loading-title">Universe Clock</div>`;
    document.body.appendChild(el);
  }

  _setupCanvas() {
    const W = this.W = window.innerWidth;
    const H = this.H = window.innerHeight;
    this.canvas.width  = W;
    this.canvas.height = H;
    this.canvas.style.width  = W + 'px';
    this.canvas.style.height = H + 'px';
  }

  _setupResize() {
    window.addEventListener('resize', () => {
      this.W = window.innerWidth;
      this.H = window.innerHeight;
      this.canvas.width  = this.W;
      this.canvas.height = this.H;
      this.canvas.style.width  = this.W + 'px';
      this.canvas.style.height = this.H + 'px';
      this.starfield?.resize(this.W, this.H);
      this.nebula?.resize(this.W, this.H, this.palette);
    });
  }

  setDate(dateStr) {
    this.dateStr = dateStr;
    this._applyDate(dateStr);
    this.solar.trails = { sec: [], min: [], hr: [] };
  }

  _applyDate(dateStr) {
    this.palette = generatePalette(dateStr);
    const seed   = this.palette.seed;

    this.starfield = new Starfield(seed, 350);
    this.nebula    = new Nebula(seed);
    this.starfield.resize(this.W, this.H);
    this.nebula.resize(this.W, this.H, this.palette);

    document.documentElement.style.setProperty('--c-bg', this.palette.bg);
    document.body.style.background = this.palette.bg;

    const seedEl = document.getElementById('hud-seed-val');
    if (seedEl) seedEl.textContent = String(this.palette.seed).padStart(8, '0');
  }

  _loop(timestamp) {
    const t   = timestamp / 1000;
    const ctx = this.ctx;
    const W   = this.W;
    const H   = this.H;
    const cx  = W / 2;
    const cy  = H / 2;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = this.palette.bg;
    ctx.fillRect(0, 0, W, H);

    this.nebula.draw(ctx, this.opts.showNebula);
    this.starfield.draw(ctx, t, this.palette, this.opts.mode);

    if (this.opts.mode !== 'orrery') {
      this._drawVignette(ctx, W, H);
    }

    const angles = getTimeAngles();
    this.solar.draw(ctx, cx, cy, angles, this.palette, {
      ...this.opts,
      seed: this.palette.seed,
    }, t);

    this.hud.update(angles, this.dateStr, this.palette);

    if (this.opts.mode === 'orrery') {
      this._drawScanlines(ctx, W, H);
    }

    requestAnimationFrame(tt => this._loop(tt));
  }

  _drawVignette(ctx, W, H) {
    const r = Math.max(W, H) * 0.75;
    const grad = ctx.createRadialGradient(W/2, H/2, r*0.2, W/2, H/2, r);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  _drawScanlines(ctx, W, H) {
    ctx.save();
    ctx.globalAlpha = 0.025;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 0.5;
    for (let y = 0; y < H; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__universeClock = new UniverseClock();
});
