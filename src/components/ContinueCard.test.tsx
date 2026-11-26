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

function themeColor(name: 'ink' | 'coral') {
  const css = sourceStyles;
  const value = css.match(new RegExp(`--${name}:\\s*(#[\\da-fA-F]{6})`))?.[1];
  if (!value) {
    throw new Error(`Theme color --${name} was not found.`);
  }
  return value;
}

function hoverBackground(cta: HTMLElement) {
  const hoverClass = Array.from(cta.classList).find((className) =>
    className.startsWith('hover:bg-[#'),
  );
  const color = hoverClass?.match(/#[\da-fA-F]{6}/)?.[0];
  if (!color) {
    throw new Error('Expected the CTA to declare a six-digit hex hover background.');
  }
  return color;
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
  it('uses dark ink on the coral background in normal and hover treatments', () => {
    expect(themeColor('coral')).toBe('#f97362');
    expect(contrastRatio(themeColor('ink'), themeColor('coral'))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(themeColor('ink'), '#e85f50')).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the rendered CTA text ink at AA contrast for its actual hover background', () => {
    render(<ContinueLink />);
    const cta = screen.getByRole('link', { name: 'เริ่มบทแรก' });
    const hoverColor = hoverBackground(cta);

    expect(cta).toHaveClass('bg-coral', 'text-ink');
    expect(cta).not.toHaveClass('text-white');
    expect(contrastRatio(themeColor('ink'), themeColor('coral'))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(themeColor('ink'), hoverColor)).toBeGreaterThanOrEqual(4.5);

    fireEvent.mouseOver(cta);
    expect(cta).toHaveClass('text-ink');
    expect(hoverBackground(cta)).toBe(hoverColor);
  });
});
