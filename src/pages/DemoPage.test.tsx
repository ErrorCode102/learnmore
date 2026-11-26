/// <reference types="node" />
import { webcrypto } from 'node:crypto';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../App';
import themeCss from '../index.css?raw';
import { logout, registerUser, resetDemoData } from '../lib/authDemo';

const USERS_KEY = 'auth-classroom:demo-users:v1';
const SESSION_KEY = 'auth-classroom:demo-session:v1';
const account = {
  name: 'นักศึกษา AuthLab',
  email: 'student@example.com',
  password: 'StudyPass1!',
};

let originalLocks: PropertyDescriptor | undefined;

function installWebLocks() {
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: { request: async (_name: string, callback: () => unknown) => callback() },
  });
}

function renderDemo() {
  window.location.hash = '#/demo';
  return render(renderApp());
}

function fillRegistration() {
  fireEvent.change(screen.getByLabelText('ชื่อที่แสดง'), { target: { value: account.name } });
  fireEvent.change(screen.getByLabelText('อีเมล'), { target: { value: account.email } });
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), { target: { value: account.password } });
}

function fillLogin(password = account.password) {
  fireEvent.change(screen.getByLabelText('อีเมล'), { target: { value: account.email } });
  fireEvent.change(screen.getByLabelText('รหัสผ่าน'), { target: { value: password } });
}

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto);
  window.localStorage.clear();
  window.sessionStorage.clear();
  originalLocks = Object.getOwnPropertyDescriptor(navigator, 'locks');
  installWebLocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalLocks) {
    Object.defineProperty(navigator, 'locks', originalLocks);
  } else {
    Reflect.deleteProperty(navigator, 'locks');
  }
});

describe('Authentication Demo page', () => {
  it('shows the educational warning and starts in register mode', () => {
    renderDemo();

    expect(screen.getByRole('heading', { level: 1, name: 'Authentication Demo' })).toBeVisible();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByText(/Demo นี้ไม่ใช่ production authentication/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'สมัครสมาชิก' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'สมัครสมาชิก' })).toHaveClass(
      'bg-brand-solid',
      'text-on-inverse',
    );
    expect(screen.getByRole('button', { name: 'สร้างบัญชี Demo' })).toHaveClass(
      'bg-brand-solid',
      'text-on-inverse',
    );
    expect(
      screen.getByRole('heading', { name: 'เกิดอะไรขึ้นเบื้องหลัง?' }).closest('section'),
    ).toHaveClass('bg-inverse', 'text-on-inverse');
    expect(screen.getByLabelText('ชื่อที่แสดง')).toBeVisible();
    expect(screen.getByText('8–72 ตัว')).toBeVisible();
    const failureIcon = screen.getByText('8–72 ตัว').closest('li')?.querySelector('svg');
    expect(failureIcon).not.toBeNull();
    expect(failureIcon).toHaveClass('text-danger');
    expect(themeCss).toMatch(/--danger:\s*#b42318/);
  });

  it('switches between register and login without exposing the name field in login mode', () => {
    renderDemo();

    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

    expect(screen.queryByLabelText('ชื่อที่แสดง')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เข้าสู่ระบบเพื่อทดลอง' })).toBeVisible();
  });

  it('shows validation feedback instead of creating a weak account', async () => {
    renderDemo();
    fillRegistration();
    fireEvent.change(screen.getByLabelText('รหัสผ่าน'), { target: { value: 'weak' } });

    fireEvent.click(screen.getByRole('button', { name: 'สร้างบัญชี Demo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('รหัสผ่านต้องมี 8–72 ตัว');
    expect(screen.getByRole('alert')).toHaveClass('text-danger');
    expect(window.localStorage.getItem(USERS_KEY)).toBeNull();
  });

  it('registers, opens the session dashboard, and never displays the password hash', async () => {
    renderDemo();
    fillRegistration();

    fireEvent.click(screen.getByRole('button', { name: 'สร้างบัญชี Demo' }));

    expect(await screen.findByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).toBeVisible();
    expect(screen.getByText(account.name)).toBeVisible();
    expect(screen.getByText(account.email)).toBeVisible();
    expect(screen.queryByText(account.password)).not.toBeInTheDocument();
    expect(window.localStorage.getItem(USERS_KEY)).not.toContain(account.password);
  });

  it('shows the same generic message for a wrong password', async () => {
    await registerUser(account);
    logout();
    renderDemo();
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));
    fillLogin('WrongPass9!');

    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบเพื่อทดลอง' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    expect(screen.queryByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).not.toBeInTheDocument();
  });

  it('logs out and logs back in with the registered account', async () => {
    renderDemo();
    fillRegistration();
    fireEvent.click(screen.getByRole('button', { name: 'สร้างบัญชี Demo' }));
    await screen.findByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' });

    fireEvent.click(screen.getByRole('button', { name: 'ออกจากระบบ' }));
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
    fillLogin();
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบเพื่อทดลอง' }));

    expect(await screen.findByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).toBeVisible();
  });

  it('keeps the dashboard and reports an error when logout storage fails', async () => {
    await registerUser(account);
    renderDemo();
    await screen.findByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' });
    const removeItem = Storage.prototype.removeItem;
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(function (
      this: Storage,
      key: string,
    ) {
      if (this === window.sessionStorage) {
        throw new DOMException('Storage blocked', 'SecurityError');
      }
      removeItem.call(this, key);
    });

    fireEvent.click(screen.getByRole('button', { name: 'ออกจากระบบ' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ไม่สามารถออกจากระบบในเบราว์เซอร์นี้ได้',
    );
    expect(screen.getByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).toBeVisible();
    expect(window.sessionStorage.getItem(SESSION_KEY)).not.toBeNull();
  });

  it('requires confirmation before clearing demo users and session', async () => {
    await registerUser(account);
    renderDemo();
    expect(await screen.findByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'ล้างข้อมูล Demo' }));

    const dialog = screen.getByRole('alertdialog', { name: 'ยืนยันการล้างข้อมูล Demo' });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'ยืนยันการล้างข้อมูล' }),
    );
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).not.toBeInTheDocument());
    expect(window.localStorage.getItem(USERS_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
    expect(resetDemoData()).toBeUndefined();
  });

  it('keeps cancelled reset data intact', async () => {
    await registerUser(account);
    renderDemo();
    await screen.findByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' });

    fireEvent.click(screen.getByRole('button', { name: 'ล้างข้อมูล Demo' }));
    const dialog = screen.getByRole('alertdialog', { name: 'ยืนยันการล้างข้อมูล Demo' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'ยกเลิกการล้างข้อมูล' }));

    expect(window.localStorage.getItem(USERS_KEY)).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).toBeVisible();
  });

  it('reports reset failure without claiming the stored account was deleted', async () => {
    await registerUser(account);
    renderDemo();
    await screen.findByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' });
    const removeItem = Storage.prototype.removeItem;
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(function (
      this: Storage,
      key: string,
    ) {
      if (this === window.localStorage) {
        throw new DOMException('Storage blocked', 'SecurityError');
      }
      removeItem.call(this, key);
    });

    fireEvent.click(screen.getByRole('button', { name: 'ล้างข้อมูล Demo' }));
    const dialog = screen.getByRole('alertdialog', { name: 'ยืนยันการล้างข้อมูล Demo' });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'ยืนยันการล้างข้อมูล' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ไม่สามารถล้างข้อมูล Demo ในเบราว์เซอร์นี้ได้',
    );
    expect(window.localStorage.getItem(USERS_KEY)).not.toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
    expect(screen.queryByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'สร้างบัญชี Demo' })).toBeVisible();
    expect(screen.queryByText('ล้างข้อมูล Demo แล้ว พร้อมเริ่มทดลองใหม่')).not.toBeInTheDocument();
  });

  it('restores a valid session when the page is reopened', async () => {
    await registerUser(account);
    const first = renderDemo();
    await screen.findByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' });
    first.unmount();

    renderDemo();

    expect(screen.getByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).toBeVisible();
    expect(screen.getByText(account.email)).toBeVisible();
  });
});
