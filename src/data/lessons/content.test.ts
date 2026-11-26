import { describe, expect, it } from 'vitest';
import * as course from '../course';
import type { LessonId, LessonSummary, Level } from '../../types/course';

type CodeLanguage = 'bash' | 'sql' | 'javascript' | 'vue' | 'json' | 'text';

interface CodeSnippet {
  id: string;
  filename: string;
  language: CodeLanguage;
  code: string;
  notes: string[];
  caption?: string;
}

interface LessonContent extends LessonSummary {
  intro: string;
  sections: Array<{
    id: string;
    title: string;
    body: string[];
    bullets?: string[];
    snippets?: CodeSnippet[];
    callouts?: Array<{ tone: 'info' | 'warning' | 'success'; title: string; text: string }>;
    diplomaNote?: string;
  }>;
  checkpoint: { summary: string; checklist: string[] };
}

interface ContentCourse {
  getLessonContent: (level: Level, id: LessonId) => LessonContent | undefined;
  certificateLessonContent: LessonContent[];
  diplomaLessonContent: LessonContent[];
}

const contentCourse = course as unknown as ContentCourse;
const certificateIds: LessonId[] = [
  'overview',
  'installation',
  'setup',
  'database',
  'backend',
  'api',
  'frontend',
  'testing',
];
const diplomaIds: LessonId[] = [...certificateIds, 'security', 'devops'];
const placeholderPattern = /\b(TBD|lorem ipsum|content coming soon|กำลังเตรียมเนื้อหา)\b/i;
const thaiPattern = /[\u0E00-\u0E7F]/;

function allSnippets(lessons: LessonContent[]) {
  return lessons.flatMap((lesson) => lesson.sections.flatMap((section) => section.snippets ?? []));
}

function lessonText(lesson: LessonContent) {
  return [
    lesson.intro,
    ...lesson.sections.flatMap((section) => [
      section.title,
      ...section.body,
      ...(section.bullets ?? []),
      ...(section.snippets ?? []).flatMap((snippet) => [snippet.code, snippet.caption ?? '']),
      ...(section.callouts ?? []).map((callout) => `${callout.title} ${callout.text}`),
      section.diplomaNote ?? '',
    ]),
    lesson.checkpoint.summary,
    ...lesson.checkpoint.checklist,
  ].join('\n');
}

const requiredCoverage: Record<LessonId, string[]> = {
  overview: ['Register', 'Login', 'Session', 'Frontend', 'Backend', 'Database', 'HTTP', 'JSON'],
  installation: ['Node.js', 'npm', 'MySQL', 'MariaDB', 'utf8mb4', 'HeidiSQL', 'VS Code', 'Git', 'node --version', 'npm --version'],
  setup: ['auth-backend', 'auth-frontend', 'npm create vite@latest auth-frontend -- --template vue-ts', 'express', 'mysql2', 'bcryptjs', 'jsonwebtoken', 'cors', 'dotenv', 'express-validator', 'helmet', 'express-rate-limit', 'nodemon', '.env', '.gitignore', 'app.js', 'server.js', 'proxy'],
  database: ['CREATE DATABASE', 'authlab', 'users', 'PRIMARY KEY', 'UNIQUE', 'utf8mb4', 'password_hash', 'created_at', 'updated_at', 'SQL injection'],
  backend: ['createPool', 'express-validator', 'bcrypt.hash', 'bcrypt.compare', 'ER_DUP_ENTRY', '/me', '401', '409', '422'],
  api: ['jwt.sign', 'jwt.verify', 'Bearer', '/api/auth/register', '/api/auth/login', '/api/auth/me', 'cors', 'rateLimit', 'curl', 'Network'],
  frontend: ['Composition API', 'axios.create', 'defineStore', 'beforeEach', 'LoginView', 'RegisterView', 'DashboardView', 'loading', 'error', 'autocomplete', 'logout', 'localStorage'],
  testing: ['duplicate', 'weak', 'wrong password', 'missing token', 'expired token', 'curl', 'Thunder Client', 'Vitest', 'isPasswordStrongEnough'],
  security: ['JWT', 'Session', 'rotation', 'revocation', 'HttpOnly', 'cookie', 'XSS', 'CSRF', 'CORS', 'rate limit', 'enumeration', 'secret'],
  devops: ['Dockerfile', '.dockerignore', 'docker-compose.yaml', 'healthcheck', 'volumes', 'docker compose', 'test', 'build', 'push', 'deploy', 'secrets'],
};

describe('AuthLab lesson content', () => {
  it('exposes the complete eight- and ten-lesson registries', () => {
    expect(contentCourse.getLessonContent).toBeTypeOf('function');
    expect(contentCourse.certificateLessonContent.map((lesson) => lesson.id)).toEqual(certificateIds);
    expect(contentCourse.diplomaLessonContent.map((lesson) => lesson.id)).toEqual(diplomaIds);

    for (const [level, ids] of [['certificate', certificateIds], ['diploma', diplomaIds]] as const) {
      for (const id of ids) {
        const content = contentCourse.getLessonContent(level, id);
        const summary = course.getLessonSummary(level, id);
        expect(content, `${level}/${id}`).toBeDefined();
        expect(content).toMatchObject({ ...summary, id, level });
      }
    }

    expect(contentCourse.getLessonContent('certificate', 'security')).toBeUndefined();
    expect(contentCourse.getLessonContent('certificate', 'devops')).toBeUndefined();
  });

  it.each([
    ['certificate', certificateIds],
    ['diploma', diplomaIds],
  ] as const)('provides substantive, unique %s lesson sections and checkpoints', (level, ids) => {
    const lessons = level === 'certificate'
      ? contentCourse.certificateLessonContent
      : contentCourse.diplomaLessonContent;

    for (const id of ids) {
      const lesson = contentCourse.getLessonContent(level, id)!;
      expect(lesson.intro.length, `${id} intro`).toBeGreaterThan(80);
      expect(thaiPattern.test(lesson.intro), `${id} Thai intro`).toBe(true);
      expect(lesson.sections.length, `${id} sections`).toBeGreaterThanOrEqual(3);
      expect(new Set(lesson.sections.map((section) => section.id)).size).toBe(lesson.sections.length);
      expect(lesson.checkpoint.checklist.length, `${id} checkpoint`).toBeGreaterThanOrEqual(3);
      expect(lesson.checkpoint.summary.length).toBeGreaterThan(40);

      for (const section of lesson.sections) {
        expect(section.title.length, `${id}/${section.id} title`).toBeGreaterThan(3);
        expect(section.body.length, `${id}/${section.id} body`).toBeGreaterThan(0);
        expect(section.body.join(' ').length, `${id}/${section.id} substance`).toBeGreaterThan(100);
      }
    }

    expect(lessons).toHaveLength(ids.length);
  });

  it.each([
    ['certificate', certificateIds],
    ['diploma', diplomaIds],
  ] as const)('gives every %s code line a distinct Thai explanation', (level, ids) => {
    const snippets = allSnippets(
      ids.map((id) => contentCourse.getLessonContent(level, id)!),
    );

    for (const lessonId of ids) {
      const lesson = contentCourse.getLessonContent(level, lessonId)!;
      const lessonSnippets = allSnippets([lesson]);
      expect(lessonSnippets.length, `${lessonId} snippets`).toBeGreaterThanOrEqual(2);
      expect(lessonSnippets.reduce((total, snippet) => total + snippet.code.split('\n').length, 0), `${lessonId} code depth`).toBeGreaterThanOrEqual(12);
    }

    for (const snippet of snippets) {
      const lines = snippet.code.split('\n');
      expect(snippet.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)+$/);
      expect(snippet.filename).not.toMatch(/\.\./);
      expect(['bash', 'sql', 'javascript', 'vue', 'json', 'text']).toContain(snippet.language);
      expect(snippet.notes, `${snippet.id} note count`).toHaveLength(lines.length);
      expect(new Set(snippet.notes).size, `${snippet.id} repeated notes`).toBe(lines.length);
      snippet.notes.forEach((note, index) => {
        expect(note.trim().length, `${snippet.id} line ${index + 1}`).toBeGreaterThan(8);
        expect(thaiPattern.test(note), `${snippet.id} line ${index + 1} Thai`).toBe(true);
      });
    }

    const diplomaSnippets = allSnippets(contentCourse.diplomaLessonContent);
    expect(new Set(diplomaSnippets.map((snippet) => snippet.id)).size).toBe(diplomaSnippets.length);
  });

  it.each(diplomaIds)('covers the required %s curriculum without placeholder copy', (id) => {
    const lesson = contentCourse.getLessonContent('diploma', id)!;
    const text = lessonText(lesson);
    expect(text).not.toMatch(placeholderPattern);
    for (const term of requiredCoverage[id]) {
      expect(text, `${id} missing ${term}`).toContain(term);
    }
  });

  it('adds meaningful diploma trade-offs instead of relabeling the core', () => {
    for (const id of certificateIds) {
      const certificate = contentCourse.getLessonContent('certificate', id)!;
      const diploma = contentCourse.getLessonContent('diploma', id)!;
      expect(diploma.sections.length).toBeGreaterThanOrEqual(certificate.sections.length);
      expect(diploma.sections.some((section) => Boolean(section.diplomaNote))).toBe(true);
      for (const section of diploma.sections) {
        if (section.diplomaNote) {
          expect(section.diplomaNote.length).toBeGreaterThan(80);
          expect(thaiPattern.test(section.diplomaNote)).toBe(true);
        }
      }
    }
  });

  it('keeps the security model explicit and free of sample production secrets', () => {
    const securityText = lessonText(contentCourse.getLessonContent('diploma', 'security')!);
    expect(securityText).toContain('parameterized');
    expect(securityText).toContain('bcrypt');
    expect(securityText).toMatch(/generic|ข้อความเดียวกัน/);
    expect(securityText).toContain('process.env.JWT_SECRET');
    expect(securityText).toMatch(/localStorage/);
    expect(securityText).toMatch(/Demo.*ไม่ใช่ production|ไม่ใช่ production auth/i);
    expect(securityText).not.toMatch(/(supersecret|my-secret|change-me|password123)/i);
    expect(securityText).not.toMatch(/process\.env\.JWT_SECRET\s*\|\|\s*['"][^'"]+['"]/);
  });

  it('uses one coherent project vocabulary and verifiable command output', () => {
    const diplomaText = lessonText(contentCourse.getLessonContent('diploma', 'setup')!);
    expect(diplomaText).toContain('authlab');
    expect(diplomaText).toContain('password_hash');
    expect(diplomaText).toContain('/api/auth/me');
    expect(diplomaText).toMatch(/ผลลัพธ์|คาดว่า|ตรวจสอบ/);

    for (const id of ['installation', 'setup', 'testing', 'devops'] as const) {
      const text = lessonText(contentCourse.getLessonContent('diploma', id)!);
      expect(text, `${id} verification`).toMatch(/ผลลัพธ์|คาดว่า|ตรวจสอบ/);
    }
  });
});
