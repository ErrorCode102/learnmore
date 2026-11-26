import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../App';
import { useClassroomProgress } from '../context/ProgressContext';
import { certificateLessons } from '../data/course';
import { readProgress, saveProgress } from '../lib/progress';

const scrollIntoView = vi.fn();

function renderAt(path = '/') {
  window.location.hash = `#${path}`;
  return render(renderApp());
}

function courseMap() {
  const element = document.getElementById('course-map');
  if (!element) {
    throw new Error('Course map was not rendered.');
  }
  return within(element);
}

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '#/';
  scrollIntoView.mockClear();
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });
});

afterEach(() => {
  window.location.hash = '#/';
  localStorage.clear();
  scrollIntoView.mockClear();
});

describe('Dashboard', () => {
  it('requires the shared progress provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    function OutsideProvider() {
      useClassroomProgress();
      return null;
    }

    try {
      expect(() => render(<OutsideProvider />)).toThrow(
        'useClassroomProgress must be used within a ProgressProvider.',
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it('shows the eight certificate lessons and the preserved hero by default', () => {
    renderAt();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Login และ Register',
    );
    expect(screen.getByRole('link', { name: 'เริ่มเรียน' })).toHaveAttribute(
      'href',
      '#/lesson/overview',
    );
    expect(screen.getByRole('link', { name: /ดู Demo Authentication/i })).toHaveAttribute(
      'href',
      '#/demo',
    );
    expect(screen.getByRole('button', { name: 'ปวช.' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(courseMap().getAllByRole('listitem')).toHaveLength(8);
    expect(courseMap().getByText('ภาพรวมระบบ Authentication')).toBeVisible();
    expect(courseMap().getByText('ทดสอบ Flow และ Validation')).toBeVisible();
    expect(courseMap().queryByText('Docker และ CI/CD สำหรับ Authentication')).toBeNull();
  });

  it('switches to the ten-lesson diploma track without clearing progress', () => {
    saveProgress({
      version: 1,
      level: 'certificate',
      completed: {
        certificate: ['overview'],
        diploma: ['security'],
      },
      quizScores: {},
    });
    renderAt();

    fireEvent.click(screen.getByRole('button', { name: 'ปวส.' }));

    expect(courseMap().getAllByRole('listitem')).toHaveLength(10);
    expect(courseMap().getByText('ความปลอดภัยและ JWT Middleware')).toBeVisible();
    expect(courseMap().getByText('Docker และ CI/CD สำหรับ Authentication')).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'ความคืบหน้า' })).toHaveAttribute(
      'aria-valuenow',
      '10',
    );
    expect(readProgress().completed.certificate).toEqual(['overview']);
  });

  it('reports completion, percentage, remaining time, and an existing quiz score', () => {
    saveProgress({
      version: 1,
      level: 'certificate',
      completed: {
        certificate: ['overview'],
        diploma: [],
      },
      quizScores: { certificate: 4 },
    });
    renderAt();

    expect(screen.getByRole('progressbar', { name: 'ความคืบหน้า' })).toHaveAttribute(
      'aria-valuenow',
      '13',
    );
    expect(screen.getByText('1/8 บท')).toBeVisible();
    expect(screen.getByText('13%')).toBeVisible();
    expect(screen.getByText('240 นาที')).toBeVisible();
    expect(screen.getByText('4/5')).toBeVisible();
  });

  it('continues from the first incomplete lesson and reviews the final lesson when complete', () => {
    const { unmount } = renderAt();

    expect(screen.getByRole('link', { name: 'เริ่มเรียน' })).toHaveAttribute(
      'href',
      '#/lesson/overview',
    );
    fireEvent.click(screen.getByRole('link', { name: 'เริ่มบทแรก' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ภาพรวมระบบ Authentication',
    );

    unmount();
    saveProgress({
      version: 1,
      level: 'certificate',
      completed: {
        certificate: ['overview'],
        diploma: [],
      },
      quizScores: {},
    });
    const progressed = renderAt();
    expect(screen.getByRole('link', { name: 'เรียนต่อ' })).toHaveAttribute(
      'href',
      '#/lesson/installation',
    );
    expect(
      within(progressed.container.querySelector('main') as HTMLElement).getByRole('link', {
        name: 'เริ่มเรียน',
      }),
    ).toHaveAttribute('href', '#/lesson/installation');

    unmount();
    saveProgress({
      version: 1,
      level: 'certificate',
      completed: {
        certificate: certificateLessons.map((lesson) => lesson.id),
        diploma: [],
      },
      quizScores: {},
    });
    const completed = renderAt();
    expect(screen.getByRole('link', { name: 'ทบทวนบทสุดท้าย' })).toHaveAttribute(
      'href',
      '#/lesson/testing',
    );
    expect(
      within(completed.container.querySelector('main') as HTMLElement).getByRole('link', {
        name: 'เริ่มเรียน',
      }),
    ).toHaveAttribute('href', '#/lesson/testing');
  });

  it('updates completion in the shared course map and persists it after remount', async () => {
    const { unmount } = renderAt('/lesson/overview');

    fireEvent.click(
      screen.getByRole('button', { name: 'ทำเครื่องหมายว่าครบแล้ว' }),
    );
    await waitFor(() => {
      expect(readProgress().completed.certificate).toContain('overview');
    });

    const breadcrumbs = screen.getByRole('navigation', { name: 'เส้นทางนำทาง' });
    fireEvent.click(
      within(breadcrumbs).getByRole('link', { name: 'กลับไปยังแผนภูมิหลักสูตร' }),
    );

    expect(screen.getByRole('progressbar', { name: 'ความคืบหน้า' })).toHaveAttribute(
      'aria-valuenow',
      '13',
    );
    expect(courseMap().getAllByRole('listitem')[0]).toHaveTextContent('เสร็จแล้ว');

    unmount();
    renderAt();
    expect(screen.getByText('1/8 บท')).toBeVisible();
    expect(courseMap().getAllByRole('listitem')[0]).toHaveTextContent('เสร็จแล้ว');
  });

  it('opens the course-map fragment and focuses its scroll target', async () => {
    renderAt('/#course-map');

    await waitFor(() => {
      expect(document.getElementById('course-map')).toHaveFocus();
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    });
    expect(window.location.hash).toBe('#/#course-map');
    expect(scrollIntoView.mock.instances.at(-1)).toBe(document.getElementById('course-map'));
  });

  it('focuses the new lesson main content and resets scroll from a course-map card', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    renderAt();

    try {
      scrollTo.mockClear();
      const lessonLink = courseMap().getByRole('link', { name: /ภาพรวมระบบ Authentication/ });
      lessonLink.focus();
      fireEvent.click(lessonLink);

      await waitFor(() => {
        expect(document.getElementById('main-content')).toHaveFocus();
        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
      });
      expect(window.location.hash).toBe('#/lesson/overview');
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'ภาพรวมระบบ Authentication',
      );
    } finally {
      scrollTo.mockRestore();
    }
  });

  it('cites the supplied foundations without presenting invented sub-scores', () => {
    renderAt();

    expect(screen.getByText(/ACFROG\s*57/i)).toBeVisible();
    expect(screen.getByText(/competition list\s*58/i)).toBeVisible();
    expect(
      screen.getByText(/เน้น Authentication และไม่แทนที่ระบบการแข่งขันทั้งหมด/i),
    ).toBeVisible();
  });

  it('redirects an unknown route to the dashboard', async () => {
    renderAt('/not-a-route');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Login และ Register',
      );
    });
    expect(window.location.hash).toBe('#/');
  });
});
