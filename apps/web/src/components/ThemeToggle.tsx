'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'ctng_theme';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.dataset.theme;
  return attr === 'dark' ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const set = (next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setTheme(next);
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--bg-void)' : 'var(--ink-3)',
    border: 0,
    cursor: 'pointer',
    transition: 'background .2s, color .2s',
  });

  return (
    <div
      role="group"
      aria-label="Theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: 3,
        borderRadius: 'var(--r-pill)',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={() => set('light')}
        aria-pressed={theme === 'light'}
        aria-label="Light mode"
        title="Light mode"
        style={buttonStyle(theme === 'light')}
      >
        <Icon name="sun" size={14} />
      </button>
      <button
        type="button"
        onClick={() => set('dark')}
        aria-pressed={theme === 'dark'}
        aria-label="Dark mode"
        title="Dark mode"
        style={buttonStyle(theme === 'dark')}
      >
        <Icon name="moon" size={14} />
      </button>
    </div>
  );
}

/**
 * Inline script that restores the saved theme before React hydrates,
 * so we don't get a flash of the wrong theme on first paint.
 */
export const THEME_INIT_SCRIPT = `(() => {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t === 'dark' || t === 'light') {
      document.documentElement.dataset.theme = t;
    }
  } catch (e) {}
})();`;
