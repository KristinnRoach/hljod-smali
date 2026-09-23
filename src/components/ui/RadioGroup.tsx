import { createUniqueId, For, splitProps, type JSX } from 'solid-js';
import styles from './RadioGroup.module.css';

export type RadioOption<T extends string> = {
  value: T;
  label: JSX.Element;
  disabled?: boolean;
  /** Spread onto the option's <label>. `use:` directives can't be spread; call them from `ref` instead. */
  attrs?: JSX.LabelHTMLAttributes<HTMLLabelElement>;
};

type RadioGroupProps<T extends string> = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
  disabled?: boolean;
  /** Visually hide the native input (still focusable) so the label can be styled as the button. */
  hideInput?: boolean;
};

export function RadioGroup<T extends string>(props: RadioGroupProps<T>) {
  const [local, rest] = splitProps(props, [
    'options',
    'value',
    'onChange',
    'name',
    'disabled',
    'class',
    'hideInput',
  ]);
  const fallbackName = createUniqueId();

  return (
    <div
      role="radiogroup"
      class={`${styles.group} ${local.hideInput ? styles.hideInput : ''} ${local.class ?? ''}`}
      {...rest}
    >
      <For each={local.options}>
        {(option) => (
          <label
            {...option.attrs}
            class={`${styles.option} ${option.attrs?.class ?? ''}`}
            data-checked={local.value === option.value || undefined}
          >
            <input
              type="radio"
              name={local.name ?? fallbackName}
              value={option.value}
              checked={local.value === option.value}
              disabled={local.disabled || option.disabled}
              onChange={() => local.onChange(option.value)}
            />
            {option.label}
          </label>
        )}
      </For>
    </div>
  );
}
