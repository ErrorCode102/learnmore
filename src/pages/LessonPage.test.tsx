import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../App';
import { getLessonContent } from '../data/course';
import { readProgress, saveProgress } from '../lib/progress';

const scrollIntoView = vi.fn();

function renderLesson(lessonId: string) {
  window.location.hash = `#/lesson/${lessonId}`;
  return render(renderApp());
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
  vi.unstubAllGlobals();
});

describe('LessonPage', () => {
  it('shows the summary, outcomes, real lesson content, and current outline item', async () => {
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

    const lesson = getLessonContent('certificate', 'overview')!;
    const outcomes = screen.getByRole('list', { name: 'ผลลัพธ์การเรียนรู้' });
    expect(within(outcomes).getAllByRole('listitem')).toHaveLength(3);
    expect(document.getElementById('lesson-content')).not.toBeNull();
    expect(document.getElementById('lesson-checkpoint')).not.toBeNull();
    expect(screen.getByText(lesson.intro)).toBeVisible();
    expect(screen.getByRole('list', { name: 'ภาพรวมเส้นทางข้อมูล' })).toBeVisible();
    expect(screen.queryByText(/กำลังเตรียมเนื้อหาอธิบายและตัวอย่าง/i)).toBeNull();

    const contents = screen.getByRole('navigation', { name: 'เนื้อหาในบทเรียน' });
    expect(within(contents).getAllByRole('button')).toHaveLength(lesson.sections.length);
    const requestExplorer = screen.getByRole('region', { name: 'โค้ด examples/register-request.http' });
    expect(requestExplorer).toBeVisible();
    expect(within(requestExplorer).getByRole('heading', { name: 'บรรทัด 1' })).toBeVisible();
    expect(within(requestExplorer).getByText('ระบุ method POST, path /api/auth/register และ HTTP/1.1 เพื่อส่งคำขอสร้างผู้ใช้ไปยัง Backend')).toBeVisible();

    const checkpoint = document.getElementById('lesson-checkpoint')!;
    expect(within(checkpoint).getByText(lesson.checkpoint.summary)).toBeVisible();
    expect(
      within(screen.getByRole('list', { name: 'เช็กลิสต์จุดตรวจความเข้าใจ' })).getAllByRole('listitem'),
    ).toHaveLength(lesson.checkpoint.checklist.length);

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

  it('shows diploma trade-offs only on the diploma track', () => {
    saveProgress({
      version: 1,
      level: 'diploma',
      completed: { certificate: [], diploma: [] },
      quizScores: {},
    });
    const diplomaLesson = getLessonContent('diploma', 'overview')!;
    renderLesson('overview');

    expect(screen.getByRole('navigation', { name: 'ลำดับบทเรียน' }).querySelectorAll('li')).toHaveLength(10);
    const diplomaNote = diplomaLesson.sections.find((section) => section.diplomaNote)!.diplomaNote!;
    expect(screen.getByText(diplomaNote)).toBeVisible();
    expect(screen.getByText('หลักสูตรปวส.')).toBeVisible();
  });

  it('moves the contents outline selection and focus without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    renderLesson('overview');
    const contents = screen.getByRole('navigation', { name: 'เนื้อหาในบทเรียน' });
    const target = within(contents).getByRole('button', {
      name: 'HTTP, JSON และสัญญาร่วมระหว่าง Frontend/Backend',
    });

    fireEvent.click(target);

    expect(target).toHaveAttribute('aria-current', 'location');
    expect(document.getElementById('http-json-contract-title')).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
  });

  it('uses rootMargin units accepted by native IntersectionObserver', () => {
    class StrictObserver {
      constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        if (options?.rootMargin?.includes('rem')) {
          throw new SyntaxError('rootMargin must be specified in pixels or percent');
        }
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords = () => [];
    }
    vi.stubGlobal('IntersectionObserver', StrictObserver);

    renderLesson('overview');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ภาพรวมระบบ Authentication',
    );
    expect(document.getElementById('lesson-content')).toBeVisible();
  });

  it('updates the active section from IntersectionObserver entries', async () => {
    let callback: IntersectionObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    class Observer {
      constructor(observerCallback: IntersectionObserverCallback) {
        callback = observerCallback;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
    }
    vi.stubGlobal('IntersectionObserver', Observer);
    renderLesson('overview');

    expect(observe).toHaveBeenCalledTimes(getLessonContent('certificate', 'overview')!.sections.length);
    const section = document.getElementById('http-json-contract')!;
    callback!(
      [
        {
          target: section,
          isIntersecting: true,
          boundingClientRect: { top: 120 },
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );

    const contents = screen.getByRole('navigation', { name: 'เนื้อหาในบทเรียน' });
    await waitFor(() => {
      expect(
        within(contents).getByRole('button', {
          name: 'HTTP, JSON และสัญญาร่วมระหว่าง Frontend/Backend',
        }),
      ).toHaveAttribute('aria-current', 'location');
    });
  });

  it('copies lesson code and shows visible feedback', async () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    try {
      const lesson = getLessonContent('certificate', 'overview')!;
      renderLesson('overview');
      const explorer = screen.getByRole('region', { name: 'โค้ด examples/register-request.http' });
      fireEvent.click(within(explorer).getByRole('button', { name: 'คัดลอกโค้ด' }));

      expect(await within(explorer).findByText('คัดลอกแล้ว')).toBeVisible();
      expect(writeText).toHaveBeenCalledWith(lesson.sections[1].snippets![0].code);
    } finally {
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', originalClipboard);
      } else {
        Reflect.deleteProperty(navigator, 'clipboard');
      }
    }
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

  it('moves focus to the next lesson main content and resets scroll', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    renderLesson('installation');

    try {
      const next = screen.getByRole('link', { name: /บทถัดไป: โครงโปรเจกต์/ });
      next.focus();
      fireEvent.click(next);

      await waitFor(() => {
        expect(document.getElementById('main-content')).toHaveFocus();
        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
      });
      expect(window.location.hash).toBe('#/lesson/setup');
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'จัดโครงโปรเจกต์และตั้งค่า Environment',
      );
    } finally {
      scrollTo.mockRestore();
    }
  });

  it('uses the breadcrumb fragment to focus and scroll the course map', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    renderLesson('overview');

    try {
      scrollTo.mockClear();
      const breadcrumbs = screen.getByRole('navigation', { name: 'เส้นทางนำทาง' });
      const breadcrumb = within(breadcrumbs).getByRole('link', {
        name: 'กลับไปยังแผนภูมิหลักสูตร',
      });
      expect(breadcrumb).toHaveAttribute('href', '#/#course-map');
      fireEvent.click(breadcrumb);

      await waitFor(() => {
        expect(document.getElementById('course-map')).toHaveFocus();
        expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
      });
      expect(window.location.hash).toBe('#/#course-map');
      expect(scrollIntoView.mock.instances.at(-1)).toBe(document.getElementById('course-map'));
      expect(scrollTo).not.toHaveBeenCalled();
    } finally {
      scrollTo.mockRestore();
    }
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
