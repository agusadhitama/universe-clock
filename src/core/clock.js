/**
 * clock.js - Time engine
 * Maps current time → orbital angles for planets.
 * Universe Clock - by Agus Satria Adhitama
 */

const TAU = Math.PI * 2;

/**
 * Returns current time components + orbit angles.
 * All angles in radians, measured clockwise from top (12 o'clock).
 * @param {Date} [now] - override (defaults to current time)
 */
export function getTimeAngles(now = new Date()) {
  const ms   = now.getMilliseconds();
  const sec  = now.getSeconds() + ms / 1000;
  const min  = now.getMinutes() + sec / 60;
  const hr   = (now.getHours() % 12) + min / 60;
  const day  = now.getHours() / 24 + min / (24 * 60);

  return {
    // Raw values
    hours:   now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    ms,

    // Smooth continuous floats (0–1 progress)
    secProgress: sec / 60,
    minProgress: min / 60,
    hrProgress:  hr  / 12,
    dayProgress: day,

    // Orbit angles (radians, from top, clockwise = positive)
    secAngle: (sec / 60)    * TAU - Math.PI / 2,
    minAngle: (min / 60)    * TAU - Math.PI / 2,
    hrAngle:  (hr  / 12)    * TAU - Math.PI / 2,

    // Day angle for background rotation (very slow)
    dayAngle: day * TAU,
  };
}

/**
 * Format HH:MM:SS string.
 */
export function formatTime(now = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
