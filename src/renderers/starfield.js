/**
 * starfield.js - Procedural star renderer
 * Stars are seeded from date - same date = same constellation.
 * Universe Clock - by Agus Satria Adhitama
 */

export class Starfield {
  constructor(seed, count = 320) {
    this.stars = [];
    this.seed  = seed;
    this.count = count;
    this._generate();
  }

  _generate() {
    const s = this.seed;
    this.stars = [];

    // Mulberry32 PRNG - reproducible from seed
    let state = s >>> 0;
    const rand = () => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    for (let i = 0; i < this.count; i++) {
      this.stars.push({
        nx:     rand(),        // normalized x [0,1]
        ny:     rand(),        // normalized y [0,1]
        size:   0.3 + rand() * 2.2,
        alpha:  0.2 + rand() * 0.8,
        twinkleOffset: rand() * Math.PI * 2,
        twinkleSpeed:  0.3 + rand() * 1.2,
        // A few "bright" stars
        bright: rand() < 0.06,
      });
    }
  }

  resize(w, h) {
    this.w = w;
    this.h = h;
  }

  draw(ctx, t, palette, mode) {
    if (!this.w) return;
    const { w, h } = this;

    ctx.save();
    for (const star of this.stars) {
      const x = star.nx * w;
      const y = star.ny * h;

      // Twinkle: sine oscillation on alpha
      const twinkle = mode === 'minimal'
        ? 0
        : Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.25;
      const alpha = Math.max(0.05, Math.min(1, star.alpha + twinkle));

      if (star.bright && mode !== 'orrery') {
        // Cross / spike flare for bright stars
        const sz = star.size * 2.5;
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = palette.stars;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(-sz * 2.5, 0); ctx.lineTo(sz * 2.5, 0);
        ctx.moveTo(0, -sz * 2.5); ctx.lineTo(0, sz * 2.5);
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle   = palette.stars;
      ctx.beginPath();
      ctx.arc(x, y, star.bright ? star.size * 1.6 : star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
