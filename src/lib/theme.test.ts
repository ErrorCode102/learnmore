import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import indexHtml from '../../index.html?raw';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
} from './theme';

function installMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({ matches })),
  });
}

function runBootstrap() {
  const script = indexHtml.match(/<script id="theme-bootstrap">([\s\S]*?)<\/script>/)?.[1];
  if (!script) {
    throw new Error('Theme bootstrap script was not found.');
  }
  new Function(script)();
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('style');
  document.head.querySelector('meta[name="theme-color"]')?.remove();
  installMatchMedia(false);
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('style');
  document.head.querySelector('meta[name="theme-color"]')?.remove();
  vi.restoreAllMocks();
});

describe('theme preferences', () => {
  it('defaults to system and accepts only known stored preferences', () => {
    expect(readThemePreference()).toBe('system');

    for (const preference of ['light', 'dark', 'system'] as const) {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
      expect(readThemePreference()).toBe(preference);
    }

    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(readThemePreference()).toBe('system');
  });

  it('keeps theme controls usable when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    expect(readThemePreference()).toBe('system');
    expect(() => writeThemePreference('dark')).not.toThrow();
    expect(setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
  });

  it('resolves system preference and applies browser and chrome colors', () => {
    installMatchMedia(true);
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);

    expect(resolveTheme('system')).toBe('dark');
    applyTheme('dark');

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(meta).toHaveAttribute('content', '#0f1522');

    applyTheme('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(meta).toHaveAttribute('content', '#f5f3ed');
  });
});

describe('theme bootstrap', () => {
  it('uses the saved light preference before React starts', () => {
    installMatchMedia(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);

    runBootstrap();

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(meta).toHaveAttribute('content', '#f5f3ed');
  });

  it('follows a dark system when no valid preference is stored', () => {
    installMatchMedia(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'invalid');

    runBootstrap();

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('still applies the system theme when storage cannot be read', () => {
    installMatchMedia(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    expect(runBootstrap).not.toThrow();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});
