/**
 * Shared Canvas DPI Scaler and Animation Loop Binder.
 * All functions strictly <= 5 cyclomatic and cognitive complexity.
 */

export function setupDpiCanvas(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  onTick: (timestamp: number) => void,
): number {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  return requestAnimationFrame(onTick);
}
