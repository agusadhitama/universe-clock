/**
 * hud.js - HUD DOM updater (realtime setiap frame)
 * by Agus Satria Adhitama
 */

import { formatDate } from '../core/palette.js';

export class HUD {
  constructor() {
    this.elTime = document.getElementById('hud-time');
    this.elDate = document.getElementById('hud-date');
    this.elSeed = document.getElementById('hud-seed-val');
    this._lastSec = -1;
  }

  update(angles, dateStr, palette) {
    // Update jam setiap detik (DOM update hemat CPU)
    if (angles.seconds === this._lastSec) return;
    this._lastSec = angles.seconds;

    // Format waktu langsung dari Date baru supaya selalu akurat
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    if (this.elTime) this.elTime.textContent = timeStr;
    if (this.elDate) this.elDate.textContent  = formatDate(dateStr).toUpperCase();
    if (this.elSeed) this.elSeed.textContent  = String(palette.seed).padStart(8, '0');
  }

  setVisible(v) {
    const hud = document.getElementById('hud');
    if (hud) hud.style.opacity = v ? '1' : '0';
  }
}
