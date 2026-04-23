/**
 * screenshot.js - Canvas export utility
 * Universe Clock - by Agus Satria Adhitama
 */

/**
 * Download current canvas as PNG.
 * @param {HTMLCanvasElement} canvas
 * @param {string} dateStr
 */
export function takeScreenshot(canvas, dateStr) {
  const link = document.createElement('a');
  link.download = `universe-clock-${dateStr}.png`;
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Copy shareable URL with date seed to clipboard.
 * @param {string} dateStr
 * @returns {Promise<boolean>}
 */
export async function copyShareLink(dateStr) {
  const url = new URL(window.location.href);
  url.searchParams.set('date', dateStr);
  try {
    await navigator.clipboard.writeText(url.toString());
    return true;
  } catch {
    // Fallback: select text
    const input = document.createElement('input');
    input.value = url.toString();
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return true;
  }
}
