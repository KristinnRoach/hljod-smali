interface ButtonOptions {
  initialState?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  colors?: Record<string, string>;
}

interface ButtonSize {
  width: string;
  height: string;
  iconSize: string;
}

export interface SVGButton extends HTMLButtonElement {
  getState: () => string;
  setState: (newState: string) => void;
}

const icons = new Map<string, string>([
  // [
  //   'download',
  //   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 0 23 24" width="23px" height="23px" stroke-width="2" fill="none" stroke="currentColor">
  //     <path d="M 12 15.334 L 12 0 M 5.61 8.944 L 12 15.334 L 18.39 8.944 M 23.5 15.334 L 23.5 20.444 C 23.5 21.856 22.357 23 20.944 23 L 3.055 23 C 1.646 23 0.5 21.856 0.5 20.444 L 0.5 15.334" />
  //   </svg>`,
  // ],

  [
    // ! SCALED version. TODO: verify that this is correct before using (otherwise use above version)
    'download',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke="currentColor">
      <path d="M 12.5 16 L 12.5 0 M 5.8 9.3 L 12.5 16 L 19.2 9.3 M 24.5 16 L 24.5 21.3 C 24.5 22.8 23.4 24 21.9 24 L 3.1 24 C 1.6 24 0.5 22.8 0.5 21.3 L 0.5 16" />
    </svg>`,
  ],

  [
    'upload',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke="currentColor">
      <path d="M 12 0.75 L 12 16.084 M 24 15.334 L 24 20.444 C 24 21.856 22.857 23 21.444 23 L 2.667 23 C 1.254 23 0 21.856 0 20.444 L 0 15.334 M 5.339 7.14 L 12 0.75 L 18.661 7.14" />
    </svg>`,
  ],

  [
    'record_idle',
    `<svg viewBox="0 0 24 24" fill="red" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="8" />
    </svg>`,
  ],

  [
    'record_armed',
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>`,
  ],

  [
    'record_recording',
    `<svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="12" />
    </svg>`,
  ],

  [
    'save',
    `<svg id="save" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
    <path d="m23.65 4.4-4.2-4.2a.68.68 0 0 0-.48-.2H.675A.675.675 0 0 0 0 .675v22.5A.675.675 0 0 0 .675 24h22.5a.675.675 0 0 0 .675-.675V4.875a.675.675 0 0 0-.2-.475zM3.16 2.85a.487.487 0 0 1 .487-.487h13.24a.487.487 0 0 1 .487.487v6.44a.487.487 0 0 1-.487.487H3.647a.487.487 0 0 1-.487-.487V2.85zm17.53 17.52a.6.6 0 0 1-.6.6H3.765a.6.6 0 0 1-.6-.6v-7.88a.6.6 0 0 1 .6-.6h16.325a.6.6 0 0 1 .6.6v7.94z"/>
    <path d="M14.29 3.21h2.02v5.73h-2.02zM4.89 14.38H19.51v.675H4.89zM4.89 17.74H19.51v.675H4.89z"/>
  </svg>`,
  ],
]);

export function registerIcon(name: string, svgContent: string): void {
  icons.set(name, svgContent);
}

const DEFAULT_COLORS = {
  color: '#eee',
  background: 'transparent',
  fill: '#eee',
  stroke: '#eee',
  hover: '#999999',
} as const;

const getSizeConfig = (size: 'sm' | 'md' | 'lg'): ButtonSize => {
  const sizeMap: Record<'sm' | 'md' | 'lg', ButtonSize> = {
    sm: { width: '32px', height: '32px', iconSize: '16px' },
    md: { width: '40px', height: '40px', iconSize: '20px' },
    lg: { width: '48px', height: '48px', iconSize: '24px' },
  } as const;

  return sizeMap[size];
};

const applyBaseStyles = (button: HTMLButtonElement): void => {
  button.style.display = 'inline-flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.padding = '8px';
  button.style.margin = '4px';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.border = 'none';
  button.style.backgroundColor = DEFAULT_COLORS['background'];

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    button.addEventListener('mouseenter', () => {
      button.style.border = `1px solid ${DEFAULT_COLORS['hover']}`;
    });

    button.addEventListener('mouseleave', () => {
      button.style.border = 'none';
    });
  }
};

const applySizeStyles = (button: HTMLButtonElement, size: ButtonSize): void => {
  button.style.width = size.width;
  button.style.height = size.height;
};

export function createSVGButton(
  title: string,
  states: string | string[],
  options: ButtonOptions = {},
): SVGButton {
  const stateArray = Array.isArray(states) ? states : [states];
  let currentStateIndex = 0;

  if (options.initialState) {
    const idx = stateArray.indexOf(options.initialState);
    if (idx >= 0) currentStateIndex = idx;
  }

  const button = document.createElement('button') as SVGButton;
  button.title = title;
  button.classList.add('svg-button');

  if (stateArray.length > 1) {
    button.setAttribute('role', 'button');
    button.setAttribute('aria-pressed', 'false');
    button.tabIndex = 0;
  }

  applyBaseStyles(button);
  applySizeStyles(button, getSizeConfig(options.size || 'md'));

  if (options.className) {
    button.className += ` ${options.className}`;
  }

  const updateButton = () => {
    const stateName = stateArray[currentStateIndex];
    const svgContent = icons.get(stateName) || stateName;
    button.innerHTML = svgContent;

    const svg = button.querySelector('svg');
    if (svg) {
      const iconSize = getSizeConfig(options.size || 'md').iconSize;
      svg.style.width = iconSize;
      svg.style.height = iconSize;

      const customColor = options.colors?.[stateName];
      const defaultStateColor = DEFAULT_COLORS[stateName as keyof typeof DEFAULT_COLORS];
      const color = customColor || defaultStateColor || DEFAULT_COLORS['color'];
      svg.style.color = color;

      if (stateArray.length > 1) {
        button.setAttribute('aria-pressed', currentStateIndex !== 0 ? 'true' : 'false');
      }
    }
  };

  updateButton();

  button.getState = () => stateArray[currentStateIndex];

  button.setState = (newState: string) => {
    const newIndex = stateArray.indexOf(newState);
    if (newIndex !== -1) {
      currentStateIndex = newIndex;
      updateButton();
    }
  };

  button.addEventListener('click', () => {
    if (stateArray.length > 1) {
      currentStateIndex = (currentStateIndex + 1) % stateArray.length;
      updateButton();
    }

    if (options.onClick) {
      options.onClick();
    }
  });

  return button;
}
