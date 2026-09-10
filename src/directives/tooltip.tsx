import { createMutable } from 'solid-js/store';
import { onCleanup, onMount, type JSX } from 'solid-js';
import { insert } from 'solid-js/web';

export type TitleSource = string | (() => string);
export type Wrapper = (title: string, position: string) => JSX.Element;
export type TooltipValue =
  | string
  | [TitleSource]
  | [string, TitleSource]
  | [string, TitleSource, Wrapper];

// state
let local = createMutable<{
  open: boolean;
  position: string;
  content: JSX.Element;
  currentTitle: string | null;
}>({
  open: false,
  position: 'top',
  content: null,
  currentTitle: null,
});

// create container
const TOOLTIP_ID = 'tooltip-portal';
let container!: HTMLDivElement;

// target currently described by the tooltip, and its previous aria-describedby
let describedTarget: HTMLElement | null = null;
let prevDescribedBy: string | null = null;
let portal = (
  <div
    ref={container}
    id={TOOLTIP_ID}
    role="tooltip"
    style={`
			position: fixed;
			pointer-events: none;
			z-index: 2147483646;
			top: var(--y);
			left: var(--x);
			width: max-content;
			max-width: calc(100vw - 10px);
			max-height: calc(100vh - 10px);
			overflow: hidden;
			box-sizing: border-box;
			display: none;
		`}
  >
    {local.content}
  </div>
);

queueMicrotask(() => {
  insert(document.body, portal);
});

// for when a tooltip style is not defined
// it reuses the div
let defaultTooltipStyle = (
  <div
    style={`
			margin: 3px;
			border-radius: 3px;
			padding: 6px;

			box-shadow: 0 0 7px 1px rgba(0, 0, 0, 0.05);
			color: snow;
			background: #282828;
			border: 1px solid grey;
			font-size: 0.8rem;

			text-transform: capitalize;
		`}
  >
    {local.currentTitle}
  </div>
);

// directive
export default function tooltip(related: HTMLElement, at?: () => TooltipValue) {
  let title: TitleSource | undefined;
  let wrap: Wrapper | undefined;

  let value = at ? at() : '';
  let position = typeof value === 'string' ? value : 'top';

  onMount(() => {
    if (Array.isArray(value)) {
      if (value.length === 1) {
        title = value[0];
        position = 'top';
      } else {
        title = value[1];
        position = value[0];
        wrap = value[2];
      }
    } else {
      title = related.title || related.getAttribute('title') || '';
    }
    related.removeAttribute('title');
  });

  function open() {
    update(related, position, title, wrap);
  }

  // focusin/focusout, not focus/blur: they bubble, so a tooltip on a wrapper
  // (e.g. a <label> around an <input>) still opens when the child is focused.
  // :focus-visible keeps a mouse click from reopening what mousedown just closed.
  function openOnFocus(e: FocusEvent) {
    if (e.target instanceof Element && e.target.matches(':focus-visible')) {
      open();
    }
  }

  // mouseenter/mouseleave, not mouseover/mouseout: the latter fire on
  // transitions between descendants, flickering on elements with children
  related.addEventListener('mouseenter', open);
  related.addEventListener('mouseleave', close);
  related.addEventListener('mousedown', close);
  related.addEventListener('focusin', openOnFocus);
  related.addEventListener('focusout', close);

  onCleanup(() => {
    close();
    related.removeEventListener('mouseenter', open);
    related.removeEventListener('mouseleave', close);
    related.removeEventListener('mousedown', close);
    related.removeEventListener('focusin', openOnFocus);
    related.removeEventListener('focusout', close);
  });
}

// close tooltip when switching tabs
function closeListener(e: FocusEvent) {
  if (e.target == e.currentTarget) {
    close();
  }
}
addEventListener('blur', closeListener);

function close() {
  local.open = false;
  container.style.setProperty('display', 'none');

  if (describedTarget) {
    if (prevDescribedBy === null) {
      describedTarget.removeAttribute('aria-describedby');
    } else {
      describedTarget.setAttribute('aria-describedby', prevDescribedBy);
    }
    describedTarget = null;
    prevDescribedBy = null;
  }
}

// update when opening
function update(
  related: HTMLElement,
  at: string,
  title: TitleSource | undefined,
  wrapper?: Wrapper,
) {
  if (!local.open) {
    let position = at || 'top';

    // the current title may have changed
    let currentTitle =
      typeof title === 'function'
        ? title()
        : related.title || related.getAttribute('title') || title || '';
    related.removeAttribute('title');

    // if theres no wrapper, provide a default
    if (wrapper !== undefined) {
      local.content = wrapper(currentTitle, position);
    } else {
      local.currentTitle = currentTitle;
      local.content = defaultTooltipStyle;
    }

    local.position = position;
    local.open = true;
    container.style.setProperty('display', 'block');

    describedTarget = related;
    prevDescribedBy = related.getAttribute('aria-describedby');
    // aria-describedby is a list: append so an existing description survives
    related.setAttribute(
      'aria-describedby',
      [prevDescribedBy, TOOLTIP_ID].filter(Boolean).join(' '),
    );

    // get coordinates
    let t = container.getBoundingClientRect();
    let r = related.getBoundingClientRect();

    let x, y;

    switch (position) {
      case 'bottom': {
        x = r.left + (r.width / 2 - t.width / 2);
        y = r.bottom;
        break;
      }
      case 'bottom-left': {
        x = r.left - t.width;
        y = r.bottom;
        break;
      }
      case 'bottom-left-overlap': {
        x = r.width + r.left - t.width;
        y = r.bottom;
        break;
      }
      case 'bottom-right': {
        x = r.right;
        y = r.bottom;
        break;
      }
      case 'bottom-right-overlap': {
        x = r.right - r.width;
        y = r.bottom;
        break;
      }
      case 'top-left': {
        x = r.left - t.width;
        y = r.top - t.height;
        break;
      }
      case 'top-left-overlap': {
        x = r.width + r.left - t.width;
        y = r.top - t.height;
        break;
      }
      case 'top-right': {
        x = r.right;
        y = r.top - t.height;
        break;
      }
      case 'top-right-overlap': {
        x = r.right - r.width;
        y = r.top - t.height;
        break;
      }
      case 'left': {
        x = r.left - t.width;
        y = r.top + (r.height / 2 - t.height / 2);
        break;
      }
      case 'right': {
        x = r.right;
        y = r.top + (r.height / 2 - t.height / 2);
        break;
      }
      case 'top':
      default: {
        x = r.left + (r.width / 2 - t.width / 2);
        y = r.top - t.height;
        break;
      }
    }

    let margin = 5;

    // when it overlaps the element move it from the way
    const overlaps = !(
      x + t.width <= r.left ||
      x >= r.right ||
      y + t.height <= r.top ||
      y >= r.bottom
    );

    if (overlaps) {
      // put it on top
      y = r.top - t.height;
      if (y < margin) {
        // if overflows put it on bottom
        y = r.bottom;
      }

      // put it on left
      x = r.left;
      if (x < margin) {
        // if overflows put it on the right
        x = r.right - t.width;
      }
    }

    // position is fixed, so clamp against the viewport, not the document.
    // last step, so the overlap fallback above cannot push it back off-screen.
    x = Math.max(margin, Math.min(x, innerWidth - t.width - margin));
    y = Math.max(margin, Math.min(y, innerHeight - t.height - margin));

    container.style.setProperty('--x', (x | 0) + 'px');
    container.style.setProperty('--y', (y | 0) + 'px');
  }
}
