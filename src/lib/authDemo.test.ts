import { webcrypto } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hashPassword,
  loginUser,
  logout,
  readSession,
  registerUser,
  resetDemoData,
  verifyPassword,
} from './authDemo';

const USERS_KEY = 'auth-classroom:demo-users:v1';
const SESSION_KEY = 'auth-classroom:demo-session:v1';
const validInput = {
  name: 'นักศึกษา AuthLab',
  email: 'Student@Example.com',
  password: 'StudyPass1!',
};

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto);
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('browser password hashing', () => {
  it('derives a stable PBKDF2 hash for the same password and salt', async () => {
    const first = await hashPassword('StudyPass1!', 'fixed-test-salt');
    const second = await hashPassword('StudyPass1!', 'fixed-test-salt');

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain('StudyPass1!');
    expect(await verifyPassword('StudyPass1!', { salt: 'fixed-test-salt', passwordHash: first })).toBe(true);
    expect(await verifyPassword('WrongPass9!', { salt: 'fixed-test-salt', passwordHash: first })).toBe(false);
  });

  it('uses a random salt for each registered user', async () => {
    await registerUser(validInput);
    await registerUser({ ...validInput, email: 'second@example.com' });

    const users = JSON.parse(window.localStorage.getItem(USERS_KEY) ?? '[]') as Array<{ salt: string }>;
    expect(users).toHaveLength(2);
    expect(users[0].salt).not.toBe(users[1].salt);
  });
});

describe('demo registration and login', () => {
  it('normalizes input, stores only a salted hash, and creates a public session', async () => {
    const session = await registerUser({ ...validInput, name: '  นักศึกษา   AuthLab  ' });
    const raw = window.localStorage.getItem(USERS_KEY) ?? '';
    const users = JSON.parse(raw) as Array<Record<string, unknown>>;

    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      name: 'นักศึกษา AuthLab',
      email: 'student@example.com',
      createdAt: expect.any(String),
      salt: expect.any(String),
      passwordHash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(users[0]).not.toHaveProperty('password');
    expect(raw).not.toContain(validInput.password);
    expect(session).toEqual({
      id: users[0].id,
      name: 'นักศึกษา AuthLab',
      email: 'student@example.com',
      createdAt: users[0].createdAt,
    });
    expect(readSession()).toEqual(session);
  });

  it('rejects a duplicate email case-insensitively', async () => {
    await registerUser(validInput);

    await expect(registerUser({ ...validInput, email: 'STUDENT@example.com' })).rejects.toThrow(
      'อีเมลนี้ถูกใช้งานแล้ว',
    );
    expect(JSON.parse(window.localStorage.getItem(USERS_KEY) ?? '[]')).toHaveLength(1);
  });

  it.each([
    [{ ...validInput, name: ' ' }, 'กรุณาใส่ชื่อที่แสดง'],
    [{ ...validInput, email: 'not-an-email' }, 'กรุณาใส่อีเมลที่ถูกต้อง'],
    [{ ...validInput, password: 'short1!' }, 'รหัสผ่านต้องมี 8–72 ตัว'],
    [{ ...validInput, password: 'lowercase1!' }, 'รหัสผ่านต้องมี 8–72 ตัว'],
    [{ ...validInput, password: 'NoNumbers!' }, 'รหัสผ่านต้องมี 8–72 ตัว'],
    [{ ...validInput, password: 'NoSymbol1' }, 'รหัสผ่านต้องมี 8–72 ตัว'],
  ])('rejects invalid registration input', async (input, message) => {
    await expect(registerUser(input)).rejects.toThrow(message);
    expect(window.localStorage.getItem(USERS_KEY)).toBeNull();
  });

  it('uses one generic error for unknown email and wrong password', async () => {
    await registerUser(validInput);

    const unknown = await loginUser({ email: 'missing@example.com', password: validInput.password }).catch(
      (error: Error) => error.message,
    );
    const wrong = await loginUser({ email: validInput.email, password: 'WrongPass9!' }).catch(
      (error: Error) => error.message,
    );

    expect(unknown).toBe('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    expect(wrong).toBe(unknown);
  });

  it('logs in with a normalized email and replaces the current session', async () => {
    await registerUser(validInput);
    logout();

    const session = await loginUser({ email: '  STUDENT@Example.com  ', password: validInput.password });

    expect(session.email).toBe('student@example.com');
    expect(readSession()).toEqual(session);
  });
});

describe('demo session lifecycle', () => {
  it('removes the session on logout', async () => {
    await registerUser(validInput);
    expect(readSession()).not.toBeNull();

    logout();

    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
    expect(readSession()).toBeNull();
  });

  it('discards a stale session when its user no longer exists', async () => {
    await registerUser(validInput);
    window.localStorage.setItem(USERS_KEY, '[]');

    expect(readSession()).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('recovers from corrupted storage and resets users and session together', async () => {
    window.localStorage.setItem(USERS_KEY, '{broken');
    window.sessionStorage.setItem(SESSION_KEY, '{broken');

    expect(readSession()).toBeNull();
    await expect(registerUser(validInput)).resolves.toMatchObject({ email: 'student@example.com' });

    resetDemoData();

    expect(window.localStorage.getItem(USERS_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
