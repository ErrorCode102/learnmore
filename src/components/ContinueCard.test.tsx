import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContinueCard } from './ContinueCard';
import { ProgressProvider } from '../context/ProgressContext';
import { certificateLessons } from '../data/course';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

import sourceStyles from '../index.css?raw';

function parseHex(color: string): Rgb {
  const hex = color.trim().replace('#', '');
  if (!/^[\da-f]{6}$/i.test(hex)) {
    throw new Error(`Expected a six-digit hex color, received ${color}.`);
  }
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function relativeLuminance(color: Rgb) {
  const channels = [color.r, color.g, color.b].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(parseHex(foreground));
  const backgroundLuminance = relativeLuminance(parseHex(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

type Theme = 'light' | 'dark';
type ThemeColor =
  | 'ink'
  | 'coral'
  | 'accent'
  | 'accent-hover'
  | 'on-accent'
  | 'inverse'
  | 'on-inverse';

function themeColor(name: ThemeColor, theme: Theme = 'light') {
  const selector = theme === 'dark'
    ? /:root\[data-theme=["']dark["']\]\s*\{([^}]*)\}/
    : /:root\s*\{([^}]*)\}/;
  const block = sourceStyles.match(selector)?.[1];
  const value = block?.match(new RegExp(`--${name}:\\s*(#[\\da-fA-F]{6})`))?.[1];
  if (!value) {
    throw new Error(`Theme color --${name} was not found in the ${theme} theme.`);
  }
  return value;
}

function ContinueLink() {
  return (
    <MemoryRouter>
      <ProgressProvider>
        <ContinueCard lessons={certificateLessons} />
      </ProgressProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('ContinueCard CTA contrast', () => {
  it.each(['light', 'dark'] as const)(
    'uses dark on-accent text on the coral backgrounds in the %s theme',
    (theme) => {
      expect(contrastRatio(themeColor('on-accent', theme), themeColor('accent', theme))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(themeColor('on-accent', theme), themeColor('accent-hover', theme))).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('keeps the rendered CTA semantic and at AA contrast for both theme palettes', () => {
    render(<ContinueLink />);
    const cta = screen.getByRole('link', { name: 'เริ่มบทแรก' });

    expect(cta).toHaveClass('bg-accent', 'text-on-accent', 'hover:bg-accent-hover');
    expect(cta).not.toHaveClass('text-white');
    for (const theme of ['light', 'dark'] as const) {
      expect(contrastRatio(themeColor('on-accent', theme), themeColor('accent', theme))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(themeColor('on-accent', theme), themeColor('accent-hover', theme))).toBeGreaterThanOrEqual(4.5);
    }

    fireEvent.mouseOver(cta);
    expect(cta).toHaveClass('text-on-accent', 'hover:bg-accent-hover');
  });

  it('keeps the continue panel dark with inverse foreground tokens in both themes', () => {
    render(<ContinueLink />);
    const panel = screen.getByRole('heading', { name: 'เส้นทางถัดไปของคุณ' }).closest('section');

    expect(panel).toHaveClass('bg-inverse', 'text-on-inverse');
    for (const theme of ['light', 'dark'] as const) {
      expect(contrastRatio(themeColor('on-inverse', theme), themeColor('inverse', theme))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
