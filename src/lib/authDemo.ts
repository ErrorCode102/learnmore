export const DEMO_USERS_KEY = 'auth-classroom:demo-users:v1';
export const DEMO_SESSION_KEY = 'auth-classroom:demo-session:v1';

const PBKDF2_ITERATIONS = 120_000;

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

export interface DemoSession {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const passwordPolicyMessage =
  'รหัสผ่านต้องมี 8–72 ตัว อักษรพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createRandomHex(byteLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return toHex(bytes);
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return value.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getPasswordChecks(password: string) {
  return [
    { label: '8–72 ตัว', passed: password.length >= 8 && password.length <= 72 },
    { label: 'อักษรพิมพ์เล็ก', passed: /[a-z]/.test(password) },
    { label: 'อักษรพิมพ์ใหญ่', passed: /[A-Z]/.test(password) },
    { label: 'ตัวเลข', passed: /[0-9]/.test(password) },
    { label: 'อักขระพิเศษ', passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isPasswordStrongEnough(value: string): boolean {
  return (
    value.length >= 8 &&
    value.length <= 72 &&
    new TextEncoder().encode(value).byteLength <= 72 &&
    getPasswordChecks(value).every((check) => check.passed)
  );
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: new TextEncoder().encode(salt),
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    256,
  );

  return toHex(new Uint8Array(bits));
}

export async function verifyPassword(
  password: string,
  stored: Pick<DemoUser, 'salt' | 'passwordHash'>,
): Promise<boolean> {
  try {
    const hash = await hashPassword(password, stored.salt);
    return hash === stored.passwordHash;
  } catch {
    return false;
  }
}

function isDemoUser(value: unknown): value is DemoUser {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.salt === 'string' &&
    typeof value.passwordHash === 'string' &&
    typeof value.createdAt === 'string'
  );
}

function readUsers(): DemoUser[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(DEMO_USERS_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter(isDemoUser) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: DemoUser[]): void {
  try {
    window.localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  } catch {
    throw new Error('ไม่สามารถบันทึกข้อมูล Demo ในเบราว์เซอร์นี้ได้');
  }
}

function toSession(user: DemoUser): DemoSession {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function writeSession(session: DemoSession): void {
  try {
    window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  } catch {
    throw new Error('ไม่สามารถสร้าง session ในเบราว์เซอร์นี้ได้');
  }
}

export async function registerUser(input: RegisterInput): Promise<DemoSession> {
  const name = normalizeName(input.name);
  const email = normalizeEmail(input.email);

  if (name.length < 2 || name.length > 80) {
    throw new Error('กรุณาใส่ชื่อที่แสดง');
  }
  if (!isValidEmail(email)) {
    throw new Error('กรุณาใส่อีเมลที่ถูกต้อง');
  }
  if (!isPasswordStrongEnough(input.password)) {
    throw new Error(passwordPolicyMessage);
  }

  const salt = createRandomHex(16);
  const passwordHash = await hashPassword(input.password, salt);
  const users = readUsers();

  if (users.some((user) => user.email === email)) {
    throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
  }

  const user: DemoUser = {
    id: createRandomHex(16),
    name,
    email,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  const session = toSession(user);
  writeSession(session);
  return session;
}

export async function loginUser(input: LoginInput): Promise<DemoSession> {
  const email = normalizeEmail(input.email);
  const user = readUsers().find((candidate) => candidate.email === email);
  const passwordMatches = user ? await verifyPassword(input.password, user) : false;

  if (!user || !passwordMatches) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }

  const session = toSession(user);
  writeSession(session);
  return session;
}

export function readSession(): DemoSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.sessionStorage.getItem(DEMO_SESSION_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    if (
      !isRecord(parsed) ||
      typeof parsed.id !== 'string' ||
      typeof parsed.name !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.createdAt !== 'string'
    ) {
      if (stored) {
        window.sessionStorage.removeItem(DEMO_SESSION_KEY);
      }
      return null;
    }

    const user = readUsers().find((candidate) => candidate.id === parsed.id);
    if (!user) {
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
      return null;
    }

    return toSession(user);
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // A session that cannot be removed remains unreachable when storage is unavailable.
  }
}

export function resetDemoData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(DEMO_USERS_KEY);
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // Storage may be blocked; the current in-memory Demo session is still cleared by the page.
  }
}
