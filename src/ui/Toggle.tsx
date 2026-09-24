import { splitProps, type JSX } from 'solid-js';
import styles from './Toggle.module.css';

type ToggleProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'onChange'> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

/**
 * Checkbox with the native input visually hidden; `children` is the visual.
 * Style the on state via `[data-checked]`. Other props go to the <label>, except
 * `aria-label` which names the input. For directives, call them from `ref`.
 */
export function Toggle(props: ToggleProps) {
  const [local, rest] = splitProps(props, [
    'checked',
    'onChange',
    'disabled',
    'class',
    'children',
    'aria-label',
  ]);

  return (
    <label
      {...rest}
      class={`${styles.toggle} ${local.class ?? ''}`}
      data-checked={local.checked || undefined}
    >
      <input
        type="checkbox"
        class={styles.input}
        aria-label={local['aria-label']}
        checked={local.checked}
        disabled={local.disabled}
        onChange={(event) => local.onChange(event.currentTarget.checked)}
      />
      {local.children}
    </label>
  );
}
