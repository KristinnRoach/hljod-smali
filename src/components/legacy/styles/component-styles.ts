// component-styles.ts - Minimal styles using CSS custom properties

export const COMPONENT_STYLE = `
  display: flex;
  flex-direction: column;
  gap: var(--ac-spacing-sm, 0.5rem);
  padding: var(--ac-spacing-sm, 0.5rem);
  margin: var(--ac-spacing-xs, 0.25rem);
  border-radius: var(--ac-border-radius, 4px);
  min-height: var(--ac-component-height-md, 40px);
  font-family: var(--ac-font-family, system-ui, sans-serif);
  font-size: var(--ac-font-size-md, 14px);
`;
