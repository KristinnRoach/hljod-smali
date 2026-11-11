import { onCleanup } from 'solid-js';

/**
 * Shrink `el` with CSS zoom so it fits below its top edge in the viewport,
 * never growing past 1. The layout stays the desktop one at every size.
 */
export const fitZoom = (el: HTMLElement) => {
  const fit = () => {
    const zoom = Number(el.style.zoom) || 1;
    // gBCR is the zoomed size, so divide it out to get the natural size.
    const rect = el.getBoundingClientRect();
    const margin = rect.top + window.scrollY;
    const root = document.documentElement;
    const next = Math.min(
      1,
      root.clientWidth / (rect.width / zoom),
      (root.clientHeight - 2 * margin) / (rect.height / zoom),
    );
    // Rounded so the observer below settles instead of chasing sub-pixel changes.
    el.style.zoom = String(Math.floor(next * 100) / 100);
  };

  // Content size changes too, e.g. collapsing a row or loading a sample.
  const observer = new ResizeObserver(fit);
  observer.observe(el);
  window.addEventListener('resize', fit);
  onCleanup(() => {
    observer.disconnect();
    window.removeEventListener('resize', fit);
  });
};
