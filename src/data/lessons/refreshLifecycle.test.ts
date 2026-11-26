import crypto from 'node:crypto';
import vm from 'node:vm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CodeSnippet } from '../../types/course';
import { backendSnippets } from '../snippets/backend';
import { securitySnippets } from '../snippets/security';

interface UserRecord {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
}

interface RefreshRecord {
  id: number;
  token_hash: string;
  user_id: number;
  expires_at: Date;
  revoked_at: Date | null;
}

interface TestRequest {
  body: { email: string; password: string };
  cookies: { refresh_token?: string };
  user?: { id: number };
  get: (name: string) => string | undefined;
}

interface TestResponse {
  statusCode?: number;
  body?: unknown;
  cookies: Array<[string, string, Record<string, unknown>]>;
  clearedCookies: Array<[string, Record<string, unknown>]>;
  status: (statusCode: number) => TestResponse;
  json: (body: unknown) => TestResponse;
  cookie: (name: string, value: string, options: Record<string, unknown>) => TestResponse;
  clearCookie: (name: string, options: Record<string, unknown>) => TestResponse;
}

type Handler = (req: TestRequest, res: TestResponse, next: (error?: unknown) => void) => unknown;
type LoadedModule = Record<string, unknown>;

function getSnippet(snippets: CodeSnippet[], id: string) {
  const snippet = snippets.find((item) => item.id === id);
  expect(snippet, `missing snippet ${id}`).toBeDefined();
  return snippet!;
}

function loadModule(source: string, bindings: Record<string, unknown>): LoadedModule {
  const executable = source
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/^export default .*;\r?\n?/gm, '')
    .replace(/^export /gm, '');
  const context = vm.createContext({
    Buffer,
    Date,
    console,
    process: { env: { NODE_ENV: 'test' } },
    ...bindings,
  });
  vm.runInContext(executable, context, { timeout: 1_000 });
  return context;
}

function createResponse(): TestResponse {
  const response: TestResponse = {
    cookies: [],
    clearedCookies: [],
    status(statusCode) {
      response.statusCode = statusCode;
      return response;
    },
    json(body) {
      response.body = body;
      return response;
    },
    cookie(name, value, options) {
      response.cookies.push([name, value, options]);
      return response;
    },
    clearCookie(name, options) {
      response.clearedCookies.push([name, options]);
      return response;
    },
  };
  return response;
}

function createRequest(email = 'student@example.com', password = 'StudyPass1!'): TestRequest {
  return {
    body: { email, password },
    cookies: {},
    get: () => undefined,
  };
}

function createPool() {
  const users: UserRecord[] = [];
  const refreshTokens: RefreshRecord[] = [];
  let nextUserId = 1;
  let nextRefreshId = 1;
  let failNextRefreshInsert = false;
  const issuanceError = new Error('refresh insert failed');

  async function execute(sql: string, params: unknown[] = []) {
    const statement = sql.replace(/\s+/g, ' ').trim();

    if (statement.startsWith('SELECT id, email, password_hash')) {
      const user = users.find((item) => item.email === params[0]);
      return [user ? [{ ...user }] : [], []];
    }

    if (statement.startsWith('SELECT id, email, created_at FROM users')) {
      const user = users.find((item) => item.id === params[0]);
      return [user ? [{ id: user.id, email: user.email, created_at: user.created_at }] : [], []];
    }

    if (statement.startsWith('INSERT INTO users')) {
      const user: UserRecord = {
        id: nextUserId++,
        email: String(params[0]),
        password_hash: String(params[1]),
        created_at: new Date(),
      };
      users.push(user);
      return [{ insertId: user.id }, []];
    }

    if (statement.startsWith('DELETE FROM users')) {
      const index = users.findIndex((item) => item.id === params[0]);
      if (index === -1) return [{ affectedRows: 0 }, []];
      const [user] = users.splice(index, 1);
      for (let tokenIndex = refreshTokens.length - 1; tokenIndex >= 0; tokenIndex -= 1) {
        if (refreshTokens[tokenIndex].user_id === user.id) refreshTokens.splice(tokenIndex, 1);
      }
      return [{ affectedRows: 1 }, []];
    }

    if (statement.startsWith('INSERT INTO refresh_tokens')) {
      if (failNextRefreshInsert) {
        failNextRefreshInsert = false;
        throw issuanceError;
      }
      const record: RefreshRecord = {
        id: nextRefreshId++,
        token_hash: String(params[0]),
        user_id: Number(params[1]),
        expires_at: new Date(String(params[2])),
        revoked_at: null,
      };
      refreshTokens.push(record);
      return [{ insertId: record.id }, []];
    }

    if (statement.startsWith('SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens')) {
      const record = refreshTokens.find((item) => item.token_hash === params[0]);
      return [record ? [{ ...record }] : [], []];
    }

    if (statement.startsWith('UPDATE refresh_tokens SET revoked_at = NOW()')) {
      const record = refreshTokens.find((item) => (
        typeof params[0] === 'number' ? item.id === params[0] : item.token_hash === params[0]
      ));
      if (!record || record.revoked_at || record.expires_at <= new Date()) {
        return [{ affectedRows: 0 }, []];
      }
      record.revoked_at = new Date();
      return [{ affectedRows: 1 }, []];
    }

    throw new Error(`Unexpected SQL: ${statement}`);
  }

  return {
    users,
    refreshTokens,
    issuanceError,
    execute,
    failNextIssuance: () => {
      failNextRefreshInsert = true;
    },
    async getConnection() {
      return {
        beginTransaction: async () => undefined,
        commit: async () => undefined,
        rollback: async () => undefined,
        release: () => undefined,
        execute,
      };
    },
  };
}

function createHarness() {
  const pool = createPool();
  const model = loadModule(getSnippet(backendSnippets, 'backend-user-model').code, { pool });
  const service = loadModule(getSnippet(securitySnippets, 'security-refresh-token-service').code, { crypto, pool });
  const issueRefreshToken = service.issueRefreshToken as (res: TestResponse, userId: number) => Promise<void>;
  const rotateRefreshToken = service.rotateRefreshToken as (token?: string) => Promise<number | null>;
  const revokeRefreshToken = service.revokeRefreshToken as (token?: string) => Promise<void>;
  const signAccessToken = (user: { id: number }) => `access:${user.id}`;
  const controller = loadModule(getSnippet(securitySnippets, 'security-auth-controller').code, {
    bcrypt: {
      hash: async (value: string) => `hash:${value}`,
      compare: async (value: string, hash: string) => hash === `hash:${value}`,
    },
    validationResult: () => ({ isEmpty: () => true, array: () => [] }),
    createUser: model.createUser,
    deleteUserById: model.deleteUserById,
    findByEmail: model.findByEmail,
    findById: model.findById,
    signAccessToken,
    issueRefreshToken,
  });

  const routes: Array<{ path: string; handlers: Handler[] }> = [];
  const router = {
    post(path: string, ...handlers: Handler[]) {
      routes.push({ path, handlers });
    },
    get(path: string, ...handlers: Handler[]) {
      routes.push({ path, handlers });
    },
  };
  loadModule(getSnippet(backendSnippets, 'backend-auth-routes').code, {
    Router: () => router,
    rateLimit: () => (_req: TestRequest, _res: TestResponse, next: () => void) => next(),
    loginValidation: [],
    registerValidation: [],
    requireAuth: (_req: TestRequest, _res: TestResponse, next: () => void) => next(),
    login: controller.login,
    me: controller.me,
    register: controller.register,
  });
  loadModule(getSnippet(securitySnippets, 'security-refresh-routes').code, {
    Router: () => router,
    cookieParser: () => (_req: TestRequest, _res: TestResponse, next: () => void) => next(),
    signAccessToken,
    issueRefreshToken,
    rotateRefreshToken,
    revokeRefreshToken,
  });

  const handlerFor = (path: string) => {
    const route = routes.find((item) => item.path === path);
    expect(route, `missing route ${path}`).toBeDefined();
    return route!.handlers.at(-1)!;
  };

  return {
    pool,
    register: controller.register as Handler,
    login: controller.login as Handler,
    me: handlerFor('/me'),
    refresh: handlerFor('/refresh'),
    logout: handlerFor('/logout'),
  };
}

describe('refresh-token lifecycle shown in the security lesson', () => {
  let harness: ReturnType<typeof createHarness>;

  beforeEach(() => {
    harness = createHarness();
  });

  it('issues the initial refresh cookie on Register and Login, then rotates and revokes it', async () => {
    const registerResponse = createResponse();
    const registerNext = vi.fn();
    await harness.register(createRequest(), registerResponse, registerNext);

    expect(registerNext).not.toHaveBeenCalled();
    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.cookies).toHaveLength(1);
    const registerToken = registerResponse.cookies[0][1];
    expect(registerResponse.cookies[0][2]).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/api/auth' });
    expect(registerResponse.body).toMatchObject({
      status: 'success',
      data: { token: 'access:1', user: { id: 1, email: 'student@example.com', created_at: expect.any(Date) } },
    });
    expect(harness.pool.refreshTokens[0].token_hash).toBe(crypto.createHash('sha256').update(registerToken).digest('hex'));
    expect(harness.pool.refreshTokens[0].token_hash).not.toBe(registerToken);

    const loginResponse = createResponse();
    const loginNext = vi.fn();
    await harness.login(createRequest(), loginResponse, loginNext);

    expect(loginNext).not.toHaveBeenCalled();
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.cookies).toHaveLength(1);
    expect(harness.pool.refreshTokens).toHaveLength(2);

    const refreshResponse = createResponse();
    const refreshRequest = createRequest();
    refreshRequest.cookies.refresh_token = registerToken;
    await harness.refresh(refreshRequest, refreshResponse, vi.fn());

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.body).toMatchObject({ status: 'success', data: { token: 'access:1' } });
    expect(refreshResponse.cookies).toHaveLength(1);
    const rotatedToken = refreshResponse.cookies[0][1];
    expect(rotatedToken).not.toBe(registerToken);
    expect(harness.pool.refreshTokens[0].revoked_at).toBeInstanceOf(Date);
    expect(harness.pool.refreshTokens).toHaveLength(3);

    const reuseResponse = createResponse();
    const reuseRequest = createRequest();
    reuseRequest.cookies.refresh_token = registerToken;
    await harness.refresh(reuseRequest, reuseResponse, vi.fn());

    expect(reuseResponse.statusCode).toBe(401);
    expect(reuseResponse.clearedCookies).toHaveLength(1);

    const logoutResponse = createResponse();
    const logoutRequest = createRequest();
    logoutRequest.cookies.refresh_token = rotatedToken;
    await harness.logout(logoutRequest, logoutResponse, vi.fn());

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.clearedCookies).toHaveLength(1);
    expect(harness.pool.refreshTokens.find((item) => item.token_hash === crypto.createHash('sha256').update(rotatedToken).digest('hex'))?.revoked_at).toBeInstanceOf(Date);
  });

  it('keeps the existing protected /me route linked to the advanced controller', async () => {
    await harness.register(createRequest(), createResponse(), vi.fn());
    const request = createRequest();
    request.user = { id: 1 };
    const response = createResponse();
    const next = vi.fn();

    await harness.me(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      status: 'success',
      data: { user: { id: 1, email: 'student@example.com', created_at: expect.any(Date) } },
    });
    expect(JSON.stringify(response.body)).not.toContain('hash:StudyPass1!');
  });

  it('removes a newly registered user when initial refresh issuance fails', async () => {
    harness.pool.failNextIssuance();
    const response = createResponse();
    const next = vi.fn();

    await harness.register(createRequest(), response, next);

    expect(next).toHaveBeenCalledWith(harness.pool.issuanceError);
    expect(response.statusCode).toBeUndefined();
    expect(response.cookies).toHaveLength(0);
    expect(harness.pool.users).toHaveLength(0);
  });

  it('forwards Login issuance failures without deleting the existing user', async () => {
    await harness.pool.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', ['student@example.com', 'hash:StudyPass1!']);
    harness.pool.failNextIssuance();
    const response = createResponse();
    const next = vi.fn();

    await harness.login(createRequest(), response, next);

    expect(next).toHaveBeenCalledWith(harness.pool.issuanceError);
    expect(response.statusCode).toBeUndefined();
    expect(response.cookies).toHaveLength(0);
    expect(harness.pool.users).toHaveLength(1);
  });
});
