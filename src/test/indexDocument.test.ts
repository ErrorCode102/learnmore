import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Application document', () => {
  it('declares a local favicon that exists', () => {
    const html = readFileSync(resolve('index.html'), 'utf8');

    expect(html).toContain('<link rel="icon" href="/favicon.svg" />');
    expect(existsSync(resolve('public/favicon.svg'))).toBe(true);
  });
});
