import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Callout } from './Callout';
import { CodeExplorer } from './CodeExplorer';
import type { CodeSnippet } from '../types/course';
import appStyles from '../index.css?raw';

const snippet: CodeSnippet = {
  id: 'test-app-js',
  filename: 'auth-backend/src/app.js',
  language: 'javascript',
  caption: 'ตัวอย่าง middleware สำหรับทดสอบ interaction',
  code: 'import express from \'express\';\n\nconst app = express();',
  notes: [
    'นำเข้า Express เพื่อสร้างแอปและกำหนด middleware',
    'เว้นบรรทัดเพื่อแยกส่วน imports จากส่วนสร้างแอป',
    'สร้าง instance ของ Express เพื่อใช้รับ HTTP request',
  ],
};

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand');

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(navigator, 'clipboard', originalClipboard);
  } else {
    Reflect.deleteProperty(navigator, 'clipboard');
  }
  if (originalExecCommand) {
    Object.defineProperty(document, 'execCommand', originalExecCommand);
  } else {
    Reflect.deleteProperty(document, 'execCommand');
  }
});

function renderExplorer(value = snippet) {
  return render(<CodeExplorer snippet={value} />);
}

function parseColor(color: string) {
  if (color.startsWith('#')) {
    return [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16));
  }
  return color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
}

function contrastRatio(foreground: string, background: string) {
  const luminance = (color: string) => {
    const channels = parseColor(color).map((channel) => {
      const scaled = channel / 255;
      return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

describe('CodeExplorer', () => {
  it('exports an explorer component', () => {
    expect(CodeExplorer).toBeTypeOf('function');
  });

  it('shows file metadata, contained code, line numbers, and blank-line explanations', () => {
    const { container } = renderExplorer();
    expect(screen.getByRole('heading', { name: snippet.filename })).toBeVisible();
    expect(screen.getByText('javascript')).toBeVisible();
    expect(screen.getByText(snippet.caption!)).toBeVisible();
    expect(screen.getAllByRole('button', { name: /^บรรทัด \d+$/ })).toHaveLength(3);
    expect(container.querySelector('.overflow-x-auto')).toHaveClass('max-w-full');
    expect(screen.getByRole('heading', { name: 'บรรทัด 1' })).toBeVisible();
    expect(screen.getByText(snippet.notes[0])).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'บรรทัด 2' }));
    expect(screen.getByText(snippet.notes[1])).toBeVisible();
  });

  it('renders Prism token categories in distinct visible colors', () => {
    const tokenRules = appStyles.match(/\.token[^{}]+\{[^{}]*\}/g)?.join('\n') ?? '';
    const style = document.createElement('style');
    style.textContent = tokenRules;
    document.head.append(style);

    try {
      const { container } = renderExplorer();
      const keyword = container.querySelector('.token.keyword');
      const string = container.querySelector('.token.string');

      expect(keyword).not.toBeNull();
      expect(string).not.toBeNull();
      expect(keyword!.closest('section')).toHaveClass('bg-[#111827]');
      expect(getComputedStyle(keyword!).color).not.toBe(getComputedStyle(string!).color);

      const palette = [...tokenRules.matchAll(/color:\s*(#[0-9a-f]{6})/gi)].map((match) => match[1]);
      const backgrounds = ['#111827', '#222946']; // bg-indigo-400/15 composited over #111827
      expect(new Set(palette).size).toBeGreaterThan(5);
      for (const color of palette) {
        for (const background of backgrounds) {
          expect(contrastRatio(color, background), `${color} on ${background}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    } finally {
      style.remove();
    }
  });

  it('updates the polite live detail panel through buttons and previous/next controls', () => {
    renderExplorer();
    const detail = screen.getByRole('complementary', { name: 'รายละเอียดบรรทัด' });
    expect(detail).toHaveClass('bg-surface', 'text-ink', 'border-line');
    expect(detail).not.toHaveClass('bg-white');
    expect(detail.querySelector('[aria-live="polite"]')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'บรรทัด 3' }));
    expect(within(detail).getByRole('heading', { name: 'บรรทัด 3' })).toBeVisible();
    expect(within(detail).getByText(snippet.notes[2])).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'บรรทัดก่อนหน้า' }));
    expect(within(detail).getByText(snippet.notes[1])).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'บรรทัดถัดไป' }));
    expect(within(detail).getByText(snippet.notes[2])).toBeVisible();
    expect(screen.getByRole('button', { name: 'บรรทัดถัดไป' })).toBeDisabled();
  });

  it('moves selection with ArrowUp and ArrowDown while the explorer is focused', () => {
    renderExplorer();
    const explorer = screen.getByRole('region', { name: `โค้ด ${snippet.filename}` });
    explorer.focus();
    fireEvent.keyDown(explorer, { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: 'บรรทัด 2' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(explorer, { key: 'ArrowDown' });
    fireEvent.keyDown(explorer, { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: 'บรรทัด 3' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(explorer, { key: 'ArrowUp' });
    expect(screen.getByRole('button', { name: 'บรรทัด 2' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('complementary', { name: 'รายละเอียดบรรทัด' }).querySelector('[aria-live="polite"]')).toHaveTextContent(snippet.notes[1]);
  });

  it('resets to the first line when the snippet changes', () => {
    const { rerender } = renderExplorer();
    fireEvent.click(screen.getByRole('button', { name: 'บรรทัด 3' }));
    rerender(<CodeExplorer snippet={{ ...snippet, id: 'test-server-js', filename: 'server.js', code: 'console.log(1);', notes: ['แสดงเลข 1 ใน console เพื่อยืนยัน server file'] }} />);
    expect(screen.getByRole('button', { name: 'บรรทัด 1' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'server.js' })).toBeVisible();
  });

  it('copies exact code and gives visible feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderExplorer();
    fireEvent.click(screen.getByRole('button', { name: 'คัดลอกโค้ด' }));
    expect(await screen.findByText('คัดลอกแล้ว')).toBeVisible();
    expect(writeText).toHaveBeenCalledWith(snippet.code);
  });

  it('falls back to a temporary textarea when Clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });
    renderExplorer();
    fireEvent.click(screen.getByRole('button', { name: 'คัดลอกโค้ด' }));
    expect(await screen.findByText('คัดลอกแล้ว')).toBeVisible();
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('renders source as text rather than executable HTML', () => {
    const { container } = renderExplorer({
      ...snippet,
      id: 'test-text',
      language: 'text',
      code: '<script>alert("x")</script>',
      notes: ['แสดง markup นี้เป็นข้อความเพื่อพิสูจน์ว่าไม่ถูกนำไปรันเป็น HTML'],
    });
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText('<script>alert("x")</script>')).toBeVisible();
  });

  it('uses a stacked mobile layout and a side-by-side desktop layout', () => {
    const { container } = renderExplorer();
    expect(container.querySelector('.grid.lg\\:grid-cols-\\[minmax\\(0\\,1\\.4fr\\)_minmax\\(18rem\\,0\\.8fr\\)\\]')).not.toBeNull();
  });
});

describe('Callout', () => {
  it('exports a callout component', () => {
    expect(Callout).toBeTypeOf('function');
  });

  it.each([
    ['info', 'ข้อมูล'],
    ['warning', 'คำเตือน'],
    ['success', 'สำเร็จ'],
  ] as const)('labels %s callouts with an accessible heading and text cue', (tone, label) => {
    render(<Callout tone={tone} title="หัวข้อสำคัญ" text="รายละเอียดที่ผู้เรียนต้องอ่าน" />);
    expect(screen.getByText(label)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'หัวข้อสำคัญ' })).toBeVisible();
    expect(screen.getByText('รายละเอียดที่ผู้เรียนต้องอ่าน')).toBeVisible();
    if (tone === 'success') {
      expect(screen.getByText(label).closest('aside')).toHaveClass(
        'border-success-border',
        'bg-soft-success',
        'text-success',
      );
    }
  });
});
