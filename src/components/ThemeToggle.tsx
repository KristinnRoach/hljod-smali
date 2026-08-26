import { createSignal, onMount } from 'solid-js';

type Theme = 'light' | 'dark';

export function ThemeToggle(props: { class?: string; defaultTheme?: Theme | 'system' }) {
  const [isDark, setIsDark] = createSignal(false);

  const applyTheme = (theme: Theme) => {
    setIsDark(theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  };

  onMount(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
      return;
    }

    if (props.defaultTheme === 'dark' || props.defaultTheme === 'light') {
      applyTheme(props.defaultTheme);
      return;
    }

    applyTheme(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  });

  function toggleTheme() {
    const newTheme: Theme = isDark() ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      class={`theme-toggle ${props.class || ''}`}
      classList={{ dark: isDark() }}
      aria-label={`Switch to ${isDark() ? 'light' : 'dark'} mode`}
    >
      {isDark() ? '🌙' : '☀️'}
    </button>
  );
}
