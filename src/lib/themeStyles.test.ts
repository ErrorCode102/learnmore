import { describe, expect, it } from 'vitest';
import sourceStyles from '../index.css?raw';

function tokens(theme: 'light' | 'dark') {
  const selector = theme === 'dark'
    ? /:root\[data-theme=["']dark["']\]\s*\{([^}]*)\}/
    : /:root\s*\{([^}]*)\}/;
  const block = sourceStyles.match(selector)?.[1];
  if (!block) {
    throw new Error(`${theme} theme tokens were not found.`);
  }

  return Object.fromEntries(
    Array.from(block.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi), (match) => [
      match[1],
      match[2],
    ]),
  );
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground: string, background: string) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe.each(['light', 'dark'] as const)('%s theme contrast', (theme) => {
  it('keeps body, secondary, brand, and status text at AA contrast', () => {
    const color = tokens(theme);
    const pairs: Array<[string, string]> = [
      ['ink', 'canvas'],
      ['ink', 'surface'],
      ['muted', 'canvas'],
      ['muted', 'surface'],
      ['brand', 'canvas'],
      ['brand', 'surface'],
      ['danger', 'soft-coral'],
      ['coral', 'soft-coral'],
      ['success', 'soft-success'],
    ];

    for (const [foreground, background] of pairs) {
      expect(color[foreground], `${theme} --${foreground}`).toBeDefined();
      expect(color[background], `${theme} --${background}`).toBeDefined();
      expect(
        contrast(color[foreground], color[background]),
        `${theme} --${foreground} on --${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps inverse panels and solid action buttons at AA contrast', () => {
    const color = tokens(theme);
    const pairs: Array<[string, string]> = [
      ['on-inverse', 'inverse'],
      ['on-accent', 'accent'],
      ['on-accent', 'accent-hover'],
      ['on-inverse', 'brand-solid'],
      ['on-inverse', 'brand-solid-hover'],
    ];

    for (const [foreground, background] of pairs) {
      expect(color[foreground], `${theme} --${foreground}`).toBeDefined();
      expect(color[background], `${theme} --${background}`).toBeDefined();
      expect(
        contrast(color[foreground], color[background]),
        `${theme} --${foreground} on --${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
