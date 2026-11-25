import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getLessonsForLevel } from '../data/course';
import type { LessonId } from '../types/course';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes an accessible Thai progressbar with a rounded integer percentage', () => {
    const lessons = getLessonsForLevel('certificate').slice(0, 3);

    render(<ProgressBar lessons={lessons} completed={['overview']} />);

    const progressbar = screen.getByRole('progressbar', { name: 'ความคืบหน้า' });
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuenow', '33');
    expect(progressbar).toHaveAttribute('aria-valuetext', 'ทำเสร็จแล้ว 1 จาก 3 บท (33%)');
  });

  it('counts each matching lesson once and ignores IDs outside the course', () => {
    const lessons = getLessonsForLevel('certificate');
    const completed: LessonId[] = [
      'overview',
      'overview',
      'security',
      'unknown' as LessonId,
    ];

    render(<ProgressBar lessons={lessons} completed={completed} />);

    expect(screen.getByRole('progressbar', { name: 'ความคืบหน้า' })).toHaveAttribute(
      'aria-valuenow',
      '13',
    );
  });

  it('reports zero rather than NaN for an empty lesson list', () => {
    render(<ProgressBar lessons={[]} completed={[]} />);

    expect(screen.getByRole('progressbar', { name: 'ความคืบหน้า' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });
});
