import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgress } from '../hooks/useProgress';
import { readProgress, saveProgress } from '../lib/progress';
import type { ProgressState } from '../types/course';
import { LevelSwitcher } from './LevelSwitcher';

beforeEach(() => {
  localStorage.clear();
});

describe('LevelSwitcher', () => {
  it('renders the exact track labels with accessible selected state', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <LevelSwitcher level="certificate" onChange={onChange} />,
    );

    const certificate = screen.getByRole('button', { name: 'ปวช.' });
    const diploma = screen.getByRole('button', { name: 'ปวส.' });

    expect(certificate).toHaveAttribute('aria-pressed', 'true');
    expect(certificate).toHaveClass('bg-ink', 'text-surface');
    expect(diploma).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(diploma);

    expect(onChange).toHaveBeenCalledWith('diploma');

    rerender(<LevelSwitcher level="diploma" onChange={onChange} />);

    expect(certificate).toHaveAttribute('aria-pressed', 'false');
    expect(diploma).toHaveAttribute('aria-pressed', 'true');
    expect(diploma).toHaveClass('bg-ink', 'text-surface');
  });

  it('preserves a diploma-only last lesson when switching to certificate', () => {
    const initial: ProgressState = {
      version: 1,
      level: 'diploma',
      completed: {
        certificate: ['overview'],
        diploma: ['security'],
      },
      quizScores: {
        certificate: 4,
        diploma: 5,
      },
      lastLessonId: 'security',
    };
    saveProgress(initial);

    function ProgressHarness() {
      const { level, setLevel } = useProgress();

      return <LevelSwitcher level={level} onChange={setLevel} />;
    }

    render(<ProgressHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'ปวช.' }));

    expect(screen.getByRole('button', { name: 'ปวช.' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(readProgress()).toEqual({
      ...initial,
      level: 'certificate',
    });
  });

  it('switches the persisted level without clearing either track progress', () => {
    const initial: ProgressState = {
      version: 1,
      level: 'certificate',
      completed: {
        certificate: ['overview', 'api'],
        diploma: ['security'],
      },
      quizScores: {
        certificate: 4,
        diploma: 5,
      },
      lastLessonId: 'api',
    };
    saveProgress(initial);

    function ProgressHarness() {
      const { level, setLevel } = useProgress();

      return <LevelSwitcher level={level} onChange={setLevel} />;
    }

    render(<ProgressHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'ปวส.' }));

    expect(screen.getByRole('button', { name: 'ปวส.' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(readProgress()).toEqual({
      ...initial,
      level: 'diploma',
    });
  });
});
