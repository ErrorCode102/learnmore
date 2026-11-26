import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { THEME_STORAGE_KEY } from '../lib/theme';

let systemMatches = false;
let systemChange: ((event: MediaQueryListEvent) => void) | undefined;
const addEventListener = vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
  systemChange = listener;
});
const removeEventListener = vi.fn();

beforeEach(() => {
  localStorage.clear();
  systemMatches = false;
  systemChange = undefined;
  addEventListener.mockClear();
  removeEventListener.mockClear();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({
      get matches() {
        return systemMatches;
      },
      media: '(prefers-color-scheme: dark)',
      addEventListener,
      removeEventListener,
    })),
  });
});

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('style');
  localStorage.clear();
});

describe('ThemeToggle', () => {
  it('cycles through light, dark, and system while persisting the selection', () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole('button', { name: /ธีม/i });

    expect(toggle).toHaveTextContent('ตามระบบ');
    expect(toggle).toHaveAttribute('aria-label', expect.stringContaining('ตามระบบ'));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('สว่าง');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('มืด');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('ตามระบบ');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
  });

  it('restores a saved dark preference on the first render', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /ธีม/i })).toHaveTextContent('มืด');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('reacts to operating-system changes only while following the system', () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole('button', { name: /ธีม/i });
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    act(() => {
      systemMatches = true;
      systemChange?.({ matches: true } as MediaQueryListEvent);
    });
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    fireEvent.click(toggle);
    act(() => {
      systemMatches = false;
      systemChange?.({ matches: false } as MediaQueryListEvent);
    });
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('removes the system listener and tolerates blocked preference writes', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });
    const { unmount } = render(<ThemeToggle />);
    const toggle = screen.getByRole('button', { name: /ธีม/i });

    expect(() => fireEvent.click(toggle)).not.toThrow();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    unmount();
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
