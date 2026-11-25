import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderApp } from '../App';
import { readProgress, saveProgress } from '../lib/progress';

function renderLesson(lessonId: string) {
  window.location.hash = `#/lesson/${lessonId}`;
  return render(renderApp());
}

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '#/';
});

afterEach(() => {
  window.location.hash = '#/';
  localStorage.clear();
});

describe('LessonPage', () => {
  it('shows the summary, outcomes, stable content placeholders, and current outline item', async () => {
    saveProgress({
      version: 1,
      level: 'certificate',
      completed: { certificate: ['overview'], diploma: [] },
      quizScores: {},
    });
    renderLesson('overview');

    expect(screen.getByRole('navigation', { name: 'เส้นทางนำทาง' })).toBeVisible();
    expect(screen.getByText('หลักสูตรปวช.')).toBeVisible();
    expect(screen.getByText('บทที่ 1')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ภาพรวมระบบ Authentication',
    );
    expect(screen.getByText('10 นาที')).toBeVisible();
    expect(screen.getByText(/เข้าใจ flow ของ Register, Login และ Session/)).toBeVisible();
    expect(screen.getByText('Authentication', { selector: 'span' })).toBeVisible();
    expect(screen.getByText('Flow', { selector: 'span' })).toBeVisible();

    const outcomes = screen.getByRole('list', { name: 'ผลลัพธ์การเรียนรู้' });
    expect(within(outcomes).getAllByRole('listitem')).toHaveLength(3);
    expect(document.getElementById('lesson-content')).not.toBeNull();
    expect(document.getElementById('lesson-checkpoint')).not.toBeNull();
    expect(screen.getByText(/กำลังเตรียมเนื้อหาอธิบายและตัวอย่าง/i)).toBeVisible();

    const outline = screen.getByRole('navigation', { name: 'ลำดับบทเรียน' });
    expect(within(outline).getAllByRole('listitem')).toHaveLength(8);
    expect(
      within(outline).getByRole('link', { name: /1\. ภาพรวม/ }),
    ).toHaveAttribute('aria-current', 'page');

    await waitFor(() => {
      expect(readProgress().lastLessonId).toBe('overview');
    });
    expect(readProgress().completed.certificate).toEqual(['overview']);
  });

  it('toggles completion through shared progress and immediately updates the dashboard', async () => {
    renderLesson('overview');

    const toggle = screen.getByRole('button', { name: 'ทำเครื่องหมายว่าครบแล้ว' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);

    const cancel = screen.getByRole('button', { name: 'ยกเลิกเครื่องหมายความคืบหน้า' });
    expect(cancel).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => {
      expect(readProgress().completed.certificate).toEqual(['overview']);
    });

    const breadcrumbs = screen.getByRole('navigation', { name: 'เส้นทางนำทาง' });
    fireEvent.click(
      within(breadcrumbs).getByRole('link', { name: 'กลับไปยังแผนภูมิหลักสูตร' }),
    );
    expect(screen.getByRole('progressbar', { name: 'ความคืบหน้า' })).toHaveAttribute(
      'aria-valuenow',
      '13',
    );
    expect(screen.getByRole('link', { name: 'เรียนต่อ' })).toHaveAttribute(
      'href',
      '#/lesson/installation',
    );

    fireEvent.click(screen.getByRole('link', { name: 'เรียนต่อ' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'ทำเครื่องหมายว่าครบแล้ว' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'ยกเลิกเครื่องหมายความคืบหน้า' }),
    );
    expect(screen.getByRole('button', { name: 'ทำเครื่องหมายว่าครบแล้ว' })).toBeVisible();
  });

  it('links to the previous and next lessons inside the active track', () => {
    renderLesson('installation');

    expect(screen.getByRole('link', { name: /บทก่อนหน้า: ภาพรวม/ })).toHaveAttribute(
      'href',
      '#/lesson/overview',
    );
    const next = screen.getByRole('link', { name: /บทถัดไป: โครงโปรเจกต์/ });
    expect(next).toHaveAttribute('href', '#/lesson/setup');
    fireEvent.click(next);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'จัดโครงโปรเจกต์และตั้งค่า Environment',
    );
  });

  it.each([
    ['certificate', 'testing'],
    ['diploma', 'devops'],
  ] as const)('sends the final %s lesson to practice', (level, lessonId) => {
    saveProgress({
      version: 1,
      level,
      completed: { certificate: [], diploma: [] },
      quizScores: {},
    });
    renderLesson(lessonId);

    const practice = screen.getByRole('link', { name: /ไปยังฝึกท้ายบท/ });
    expect(practice).toHaveAttribute('href', '#/practice');
    fireEvent.click(practice);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ฝึกท้ายบทAuthentication',
    );
  });

  it('redirects a diploma-only lesson when the certificate track is active', async () => {
    renderLesson('devops');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Login และ Register',
      );
    });
    expect(screen.queryByRole('heading', { name: /Docker และ CI\/CD/ })).toBeNull();
    expect(window.location.hash).toBe('#/');
  });

  it('redirects an unknown lesson id to the dashboard', async () => {
    renderLesson('unknown-lesson');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Login และ Register',
      );
    });
    expect(window.location.hash).toBe('#/');
  });

  it('shows the coming-next demo placeholder from the dashboard', () => {
    window.location.hash = '#/';
    render(renderApp());
    fireEvent.click(screen.getByRole('link', { name: /ดู Demo Authentication/i }));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Authentication Demo',
    );
    expect(screen.getByText(/กำลังเตรียมพื้นที่ทดลอง/i)).toBeVisible();
  });
});
