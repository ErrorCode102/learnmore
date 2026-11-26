import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  applyTheme,
  getSystemTheme,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ThemePreference,
} from '../lib/theme';

const preferences: ThemePreference[] = ['system', 'light', 'dark'];
const labels: Record<ThemePreference, string> = {
  system: 'ตามระบบ',
  light: 'สว่าง',
  dark: 'มืด',
};
const icons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(readThemePreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const theme = resolveTheme(preference, systemTheme);
  const Icon = icons[preference];
  const nextPreference = preferences[(preferences.indexOf(preference) + 1) % preferences.length];
  const actionLabel = `ธีมปัจจุบันเป็น${labels[preference]} เปลี่ยนเป็น${labels[nextPreference]}`;

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    writeThemePreference(preference);
  }, [preference, theme]);

  return (
    <button
      type="button"
      onClick={() => setPreference(nextPreference)}
      aria-label={actionLabel}
      title={actionLabel}
      className="inline-flex min-h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-0 text-xs font-semibold text-muted transition-colors hover:border-brand/35 hover:text-brand sm:w-auto sm:px-3"
    >
      <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
      <span className="hidden sm:inline">{labels[preference]}</span>
    </button>
  );
}
