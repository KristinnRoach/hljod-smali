import { createSignal, onCleanup, type Accessor } from 'solid-js';

export type LayoutType = 'desktop' | 'tablet' | 'mobile';

export const getLayoutFromWidth = (width: number): LayoutType => {
  if (width < 800) {
    return 'mobile';
  } else if (width < 1200) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/** The layout for the current window width, updated on resize. */
export const useLayout = (): Accessor<LayoutType> => {
  const [layout, setLayout] = createSignal(getLayoutFromWidth(window.innerWidth));
  const update = () => setLayout(getLayoutFromWidth(window.innerWidth));

  window.addEventListener('resize', update);
  onCleanup(() => window.removeEventListener('resize', update));

  return layout;
};
