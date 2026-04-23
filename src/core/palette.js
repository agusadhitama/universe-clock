/**
 * palette.js - Date-seeded color palette engine
 * Each calendar day generates a unique, harmonically balanced palette.
 * Universe Clock - by Agus Satria Adhitama
 */

/** Fast hash: integer → float [0,1] */
function hash(n) {
  let x = Math.sin(n + 1) * 43758.5453123;
  return x - Math.floor(x);
}

/** Convert HSL to hex string */
function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));
  const a = s * Math.min(l, 100 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color / 100).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Parse a date string YYYY-MM-DD → integer seed */
function dateToSeed(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Deterministic seed - same date = same universe
  return y * 10000 + m * 100 + d;
}

/**
 * Generate a full palette from a date string.
 * Returns:
 *   primary   - main accent (orbit of hours)
 *   secondary - orbit of minutes
 *   tertiary  - orbit of seconds
 *   sun       - center star color
 *   nebula    - background nebula tint
 *   bg        - deep space background
 *   trail     - trail tint
 *   stars     - star color
 */
export function generatePalette(dateStr) {
  const seed = dateToSeed(dateStr);

  // Choose a "harmony mode" from seed - changes the relationship between hues
  const mode = Math.floor(hash(seed * 7) * 6); // 0-5
  const baseHue = hash(seed) * 360;

  let h1, h2, h3;
  switch (mode) {
    case 0: // Triadic
      h1 = baseHue; h2 = baseHue + 120; h3 = baseHue + 240; break;
    case 1: // Split-complementary
      h1 = baseHue; h2 = baseHue + 150; h3 = baseHue + 210; break;
    case 2: // Analogous
      h1 = baseHue; h2 = baseHue + 30; h3 = baseHue + 60; break;
    case 3: // Tetradic / square
      h1 = baseHue; h2 = baseHue + 90; h3 = baseHue + 180; break;
    case 4: // Complementary pair + accent
      h1 = baseHue; h2 = baseHue + 180; h3 = baseHue + 60; break;
    default: // Double-split complement
      h1 = baseHue; h2 = baseHue + 165; h3 = baseHue + 195; break;
  }

  // Luminosity modifiers (slightly vary across days)
  const brightnessMod = hash(seed * 3) * 20 - 10; // ±10
  const satMod = 65 + hash(seed * 11) * 30;         // 65–95% saturation

  const primary   = hsl(h1, satMod, 70 + brightnessMod * 0.5);
  const secondary = hsl(h2, satMod * 0.9, 68 + brightnessMod * 0.4);
  const tertiary  = hsl(h3, satMod * 0.8, 72 + brightnessMod * 0.3);

  // Sun: warm, always bright
  const sunHue = baseHue + 20 + hash(seed * 5) * 40;
  const sun    = hsl(sunHue, 95, 85);

  // Nebula: deep, desaturated version of primary
  const nebula = hsl(h1, 40 + hash(seed * 13) * 30, 12);

  // Background: near-black with subtle hue shift
  const bg = hsl(h1 + 180, 30, 4 + hash(seed * 17) * 4);

  // Trail: slightly lighter than primary
  const trail = primary;

  // Stars: near white with tiny tint
  const stars = hsl(h2, 20, 90);

  // CSS variable injection
  document.documentElement.style.setProperty('--c-accent',  primary);
  document.documentElement.style.setProperty('--c-accent2', secondary);

  return {
    primary, secondary, tertiary,
    sun, nebula, bg,
    trail, stars,
    seed,
    mode,
    baseHue: Math.round(baseHue),
  };
}

/** Get today's date string YYYY-MM-DD */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** Format date string for display */
export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const names = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
  return `${names[m-1]} ${d}, ${y}`;
}
