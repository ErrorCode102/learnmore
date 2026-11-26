import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../App';
import { CodeExplorer } from '../components/CodeExplorer';
import { getLessonsForLevel } from '../data/course';
import {
  DEMO_SESSION_KEY,
  DEMO_USERS_KEY,
  type DemoUser,
} from '../lib/authDemo';
import type { CodeSnippet } from '../types/course';

const demoUser: DemoUser = {
  id: 'demo-user-1',
  name: 'นักศึกษา AuthLab',
  email: 'student@example.com',
  salt: 'test-salt',
  passwordHash: 'test-hash',
  createdAt: '2026-11-26T00:00:00.000Z',
};

const snippet: CodeSnippet = {
  id: 'accessibility-example',
  filename: 'server.js',
  language: 'javascript',
  code: 'app.get("/health", (req, res) => {\n\n  res.json({ ok: true });\n});',
  notes: [
    'สร้างเส้นทาง GET สำหรับตรวจสอบสถานะ server',
    'เว้นบรรทัดก่อนการตอบกลับเพื่อแยกส่วนการทำงาน',
    'ส่งสถานะสำเร็จกลับเป็น JSON',
    'ปิด callback และคำสั่งสร้างเส้นทาง',
  ],
};

function renderDemo() {
  window.location.hash = '#/demo';
  return render(renderApp());
}

function openResetDialog() {
  const trigger = screen.getByRole('button', { name: 'ล้างข้อมูล Demo' });
  trigger.focus();
  fireEvent.click(trigger);
  return {
    trigger,
    dialog: screen.getByRole('alertdialog', { name: 'ยืนยันการล้างข้อมูล Demo' }),
  };
}

beforeEach(() => {
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.localStorage.setItem(DEMO_USERS_KEY, JSON.stringify([demoUser]));
  window.sessionStorage.setItem(
    DEMO_SESSION_KEY,
    JSON.stringify({
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      createdAt: demoUser.createdAt,
    }),
  );
  window.location.hash = '#/demo';
});

describe('Accessibility contract', () => {
  it('gives landmarks, interactive controls, and Demo form fields accessible names', () => {
    window.localStorage.removeItem(DEMO_USERS_KEY);
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    renderDemo();

    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'นำทางหลัก' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'ข้ามไปยังเนื้อหา' })).toBeVisible();
    expect(screen.getByLabelText('ชื่อที่แสดง')).toBeVisible();
    expect(screen.getByLabelText('อีเมล')).toBeVisible();
    expect(screen.getByLabelText('รหัสผ่าน')).toBeVisible();

    for (const control of [
      ...screen.getAllByRole('button'),
      ...screen.getAllByRole('link'),
    ]) {
      expect(control).toHaveAccessibleName();
    }
  });

  it('names every diploma course-map link by the lesson it opens', () => {
    window.location.hash = '#/';
    render(renderApp());

    fireEvent.click(screen.getByRole('button', { name: 'ปวส.' }));

    for (const lesson of getLessonsForLevel('diploma')) {
      expect(
        screen.getByRole('link', { name: `เปิดบทเรียน ${lesson.title}` }),
      ).toBeVisible();
    }
  });

  it('announces the selected CodeExplorer line and explanation through a polite live region', () => {
    render(<CodeExplorer snippet={snippet} />);
    const detail = screen.getByRole('complementary', { name: 'รายละเอียดบรรทัด' });
    const liveRegion = detail.querySelector('[aria-live="polite"]');

    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'บรรทัด 2' }));

    expect(liveRegion).toHaveTextContent('บรรทัด 2');
    expect(liveRegion).toHaveTextContent(snippet.notes[1]);
    expect(within(detail).getByRole('heading', { name: 'บรรทัด 2' })).toBeVisible();
  });

  it('opens an accessible reset dialog, moves focus inside, and closes without deletion on Escape', () => {
    renderDemo();
    const { trigger, dialog } = openResetDialog();
    const cancelButton = within(dialog).getByRole('button', {
      name: 'ยกเลิกการล้างข้อมูล',
    });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(window.confirm).not.toHaveBeenCalled();
    expect(dialog).toHaveAccessibleDescription(
      'ลบผู้ใช้ทดสอบทั้งหมดและ session ปัจจุบันจากเบราว์เซอร์นี้หรือไม่?',
    );
    expect(cancelButton).toHaveFocus();

    const cancelEvent = new Event('cancel', { bubbles: true, cancelable: true });
    fireEvent(dialog, cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(window.localStorage.getItem(DEMO_USERS_KEY)).not.toBeNull();
    expect(window.sessionStorage.getItem(DEMO_SESSION_KEY)).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).toBeVisible();
  });

  it('keeps Demo data when reset is cancelled and deletes it only after confirmation', () => {
    renderDemo();
    const { trigger, dialog } = openResetDialog();

    fireEvent.click(within(dialog).getByRole('button', { name: 'ยกเลิกการล้างข้อมูล' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(window.localStorage.getItem(DEMO_USERS_KEY)).not.toBeNull();
    expect(window.sessionStorage.getItem(DEMO_SESSION_KEY)).not.toBeNull();

    const confirmed = openResetDialog();
    fireEvent.click(
      within(confirmed.dialog).getByRole('button', { name: 'ยืนยันการล้างข้อมูล' }),
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(DEMO_USERS_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(DEMO_SESSION_KEY)).toBeNull();
    expect(screen.getByRole('button', { name: 'สร้างบัญชี Demo' })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('ล้างข้อมูล Demo แล้ว');
  });
});
