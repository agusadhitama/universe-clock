/**
 * controls.js - UI controls wiring
 * Panel, toggles, keyboard shortcuts, fullscreen.
 * Universe Clock - by Agus Satria Adhitama
 */

import { todayStr }       from '../core/palette.js';
import { takeScreenshot, copyShareLink } from './screenshot.js';

export class Controls {
  constructor(app) {
    this.app       = app;
    this.panelOpen = false;

    this._bindPanel();
    this._bindToggles();
    this._bindModes();
    this._bindDatePicker();
    this._bindActions();
    this._bindKeyboard();
    this._bindCursor();

    // Read ?date= from URL on load
    const urlDate = new URLSearchParams(window.location.search).get('date');
    if (urlDate) {
      const el = document.getElementById('date-input');
      if (el) el.value = urlDate;
      app.setDate(urlDate);
    }
  }

  _bindPanel() {
    const btn     = document.getElementById('panel-toggle');
    const panel   = document.getElementById('panel');
    const overlay = document.getElementById('panel-overlay');

    const toggle = () => {
      this.panelOpen = !this.panelOpen;
      panel.classList.toggle('open', this.panelOpen);
      panel.setAttribute('aria-hidden', String(!this.panelOpen));
      btn.setAttribute('aria-expanded', String(this.panelOpen));
      btn.classList.toggle('active', this.panelOpen);
      overlay.classList.toggle('visible', this.panelOpen);
    };

    btn.addEventListener('click', toggle);
    overlay.addEventListener('click', toggle);
  }

  _bindToggles() {
    const { app } = this;

    document.getElementById('trails-toggle')?.addEventListener('change', e => {
      app.opts.showTrails = e.target.checked;
    });
    document.getElementById('nebula-toggle')?.addEventListener('change', e => {
      app.opts.showNebula = e.target.checked;
    });
    document.getElementById('hud-toggle')?.addEventListener('change', e => {
      app.hud.setVisible(e.target.checked);
    });
  }

  _bindModes() {
    const { app } = this;
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        app.opts.mode = btn.dataset.mode;
        // Reset trails on mode change
        app.solar.trails = { sec: [], min: [], hr: [] };
      });
    });
  }

  _bindDatePicker() {
    const { app } = this;
    const input = document.getElementById('date-input');
    if (input) {
      input.value = app.dateStr;
      input.addEventListener('change', e => {
        if (e.target.value) app.setDate(e.target.value);
      });
    }
    document.getElementById('date-today')?.addEventListener('click', () => {
      const today = todayStr();
      if (input) input.value = today;
      app.setDate(today);
    });
  }

  _bindActions() {
    const { app } = this;

    document.getElementById('btn-screenshot')?.addEventListener('click', () => {
      takeScreenshot(app.canvas, app.dateStr);
    });

    document.getElementById('btn-share')?.addEventListener('click', async () => {
      const ok = await copyShareLink(app.dateStr);
      this._toast(ok ? 'Link copied!' : 'Copy failed');
    });

    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });
  }

  _bindKeyboard() {
    const { app } = this;
    window.addEventListener('keydown', e => {
      switch (e.key) {
        case ' ':
        case 'Escape':
          // Close panel
          if (this.panelOpen) {
            document.getElementById('panel-toggle')?.click();
          }
          break;
        case 's': case 'S':
          takeScreenshot(app.canvas, app.dateStr);
          break;
        case 'f': case 'F':
          document.getElementById('btn-fullscreen')?.click();
          break;
        case 'm': case 'M': {
          const modes = ['cosmic','minimal','orrery'];
          const cur = modes.indexOf(app.opts.mode);
          app.opts.mode = modes[(cur + 1) % modes.length];
          document.querySelectorAll('.mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === app.opts.mode);
          });
          break;
        }
      }
    });
  }

  _bindCursor() {
    // Kursor default browser - tidak ada custom dot
  }

  _toast(msg) {
    const el = document.getElementById('share-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }
}
