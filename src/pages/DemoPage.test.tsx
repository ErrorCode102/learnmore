/// <reference types="node" />
import { webcrypto } from 'node:crypto';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../App';
import { logout, registerUser, resetDemoData } from '../lib/authDemo';

const USERS_KEY = 'auth-classroom:demo-users:v1';
const SESSION_KEY = 'auth-classroom:demo-session:v1';
const account = {
  name: 'นักศึกษา AuthLab',
  email: 'student@example.com',
  password: 'StudyPass1!',
};

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
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Authentication Demo page', () => {
  it('shows the educational warning and starts in register mode', () => {
    renderDemo();

    expect(screen.getByRole('heading', { level: 1, name: 'Authentication Demo' })).toBeVisible();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByText(/Demo นี้ไม่ใช่ production authentication/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'สมัครสมาชิก' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('ชื่อที่แสดง')).toBeVisible();
    expect(screen.getByText('8–72 ตัว')).toBeVisible();
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

  it('requires confirmation before clearing demo users and session', async () => {
    await registerUser(account);
    renderDemo();
    expect(await screen.findByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'ล้างข้อมูล Demo' }));

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('ลบผู้ใช้ทดสอบทั้งหมด'));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).not.toBeInTheDocument());
    expect(window.localStorage.getItem(USERS_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
    expect(resetDemoData()).toBeUndefined();
  });

  it('keeps cancelled reset data intact', async () => {
    await registerUser(account);
    vi.mocked(window.confirm).mockReturnValue(false);
    renderDemo();
    await screen.findByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' });

    fireEvent.click(screen.getByRole('button', { name: 'ล้างข้อมูล Demo' }));

    expect(window.localStorage.getItem(USERS_KEY)).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'ทดลองใช้งานสำเร็จ' })).toBeVisible();
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
