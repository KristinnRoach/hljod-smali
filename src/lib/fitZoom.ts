import { onCleanup } from 'solid-js';

/**
 * Scale `el` with CSS zoom so it fills the viewport below its top edge, up or
 * down. The layout stays the desktop one at every size.
 */
export const fitZoom = (el: HTMLElement) => {
  const fit = () => {
    const zoom = Number(el.style.zoom) || 1;
    // gBCR is the zoomed size, so divide it out to get the natural size.
    const rect = el.getBoundingClientRect();
    const margin = rect.top + window.scrollY;
    const root = document.documentElement;
    const next = Math.min(
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
