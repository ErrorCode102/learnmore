import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  certificateLessons,
  diplomaLessons,
  getLessonSummary,
  getLessonsForLevel,
} from '../data/course';
import type { LessonId, ProgressState } from '../types/course';
import {
  readProgress,
  recordQuiz,
  resetProgress,
  saveProgress,
  toggleLesson,
} from './progress';

const STORAGE_KEY = 'auth-classroom:progress:v1';

function defaultProgress(): ProgressState {
  return {
    version: 1,
    level: 'certificate',
    completed: {
      certificate: [],
      diploma: [],
    },
    quizScores: {},
  };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('course catalog', () => {
  it('provides the exact certificate and diploma lesson order', () => {
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

    expect(certificateLessons.map((lesson) => lesson.id)).toEqual(certificateIds);
    expect(diplomaLessons.map((lesson) => lesson.id)).toEqual(diplomaIds);
    expect(certificateLessons).toHaveLength(8);
    expect(diplomaLessons).toHaveLength(10);
  });

  it('exposes level-specific summaries with useful Thai learning outcomes', () => {
    for (const level of ['certificate', 'diploma'] as const) {
      const lessons = getLessonsForLevel(level);

      expect(lessons.every((lesson) => lesson.level === level)).toBe(true);
      expect(lessons.map((lesson) => lesson.order)).toEqual(
        lessons.map((_, index) => index + 1),
      );
      expect(
        lessons.every(
          (lesson) =>
            Number.isInteger(lesson.durationMinutes) &&
            lesson.durationMinutes >= 10 &&
            lesson.durationMinutes <= 45,
        ),
      ).toBe(true);
      expect(
        lessons.every(
          (lesson) =>
            /[\u0E00-\u0E7F]/.test(lesson.title) &&
            /[\u0E00-\u0E7F]/.test(lesson.description) &&
            lesson.outcomes.length > 0 &&
            lesson.outcomes.every((outcome) => /[\u0E00-\u0E7F]/.test(outcome)) &&
            lesson.tags.length > 0,
        ),
      ).toBe(true);
    }

    expect(getLessonSummary('certificate', 'api')?.outcomes.join(' ')).toContain('API');
    expect(getLessonSummary('diploma', 'security')?.outcomes.join(' ')).toContain('JWT');
    expect(getLessonSummary('diploma', 'devops')?.outcomes.join(' ')).toContain('Docker');
    expect(getLessonSummary('diploma', 'devops')?.outcomes.join(' ')).toContain('CI/CD');
    expect(getLessonSummary('certificate', 'security')).toBeUndefined();
  });
});

describe('progress store', () => {
  it('reads a fresh default state when storage is empty', () => {
    expect(readProgress()).toEqual(defaultProgress());
  });

  it('saves and reads a complete progress state', () => {
    const state: ProgressState = {
      version: 1,
      level: 'diploma',
      completed: {
        certificate: ['overview', 'api'],
        diploma: ['setup', 'security'],
      },
      quizScores: {
        certificate: 4,
        diploma: 5,
      },
      lastLessonId: 'security',
    };

    saveProgress(state);

    expect(readProgress()).toEqual(state);
  });

  it('toggles a lesson idempotently without changing the other level', () => {
    const state: ProgressState = {
      ...defaultProgress(),
      completed: {
        certificate: ['overview'],
        diploma: ['database'],
      },
    };

    const completed = toggleLesson(state, 'installation', 'certificate');
    const toggledOff = toggleLesson(completed, 'installation', 'certificate');

    expect(completed).not.toBe(state);
    expect(completed.completed.certificate).toEqual(['overview', 'installation']);
    expect(completed.completed.diploma).toEqual(['database']);
    expect(completed.lastLessonId).toBe('installation');
    expect(toggledOff.completed.certificate).toEqual(['overview']);
    expect(toggledOff.completed.diploma).toEqual(['database']);
    expect(state.completed.certificate).toEqual(['overview']);
  });

  it('rejects an unknown lesson ID', () => {
    expect(() => toggleLesson(defaultProgress(), 'unknown' as LessonId, 'certificate')).toThrow(
      /unknown lesson/i,
    );
  });

  it('rejects a lesson that does not belong to the selected level', () => {
    expect(() => toggleLesson(defaultProgress(), 'security', 'certificate')).toThrow(
      /certificate/i,
    );
  });

  it('clamps truncated quiz scores to the 0–5 range per level', () => {
    const high = recordQuiz(defaultProgress(), 'certificate', 8.9);
    const low = recordQuiz(high, 'certificate', -3.2);
    const roundedDown = recordQuiz(low, 'certificate', 3.9);
    const diploma = recordQuiz(roundedDown, 'diploma', 4.8);

    expect(high.quizScores.certificate).toBe(5);
    expect(low.quizScores.certificate).toBe(0);
    expect(roundedDown.quizScores.certificate).toBe(3);
    expect(diploma.quizScores).toEqual({
      certificate: 3,
      diploma: 4,
    });
    expect(diploma.level).toBe('diploma');
  });

  it('falls back to defaults for malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');

    expect(readProgress()).toEqual(defaultProgress());
  });

  it('falls back to defaults for an invalid stored level', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaultProgress(),
        level: 'advanced',
        completed: {
          certificate: ['overview'],
          diploma: [],
        },
      }),
    );

    expect(readProgress()).toEqual(defaultProgress());
  });

  it('normalizes duplicate IDs, unknown IDs, and non-array completion data', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        level: 'diploma',
        completed: {
          certificate: ['overview', 'overview', 'security', 'unknown'],
          diploma: 'database',
        },
        quizScores: {
          certificate: 4,
        },
        lastLessonId: 'api',
      }),
    );

    expect(readProgress()).toEqual({
      version: 1,
      level: 'diploma',
      completed: {
        certificate: ['overview'],
        diploma: [],
      },
      quizScores: {
        certificate: 4,
      },
      lastLessonId: 'api',
    });
  });

  it('drops invalid stored quiz scores and lesson references', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaultProgress(),
        quizScores: {
          certificate: 9,
          diploma: 2.5,
        },
        lastLessonId: 'unknown',
      }),
    );

    expect(readProgress()).toEqual(defaultProgress());
  });

  it('returns defaults and clears persisted progress on reset', () => {
    saveProgress({
      ...defaultProgress(),
      level: 'diploma',
      completed: {
        certificate: ['overview'],
        diploma: ['security'],
      },
      quizScores: {
        diploma: 5,
      },
    });

    const reset = resetProgress();

    expect(reset).toEqual(defaultProgress());
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual(defaultProgress());
    expect(readProgress()).toEqual(defaultProgress());
  });

  it('guards calls when browser storage is unavailable', () => {
    vi.stubGlobal('window', undefined);

    try {
      expect(readProgress()).toEqual(defaultProgress());
      expect(() => saveProgress(defaultProgress())).not.toThrow();
      expect(resetProgress()).toEqual(defaultProgress());
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('guards localStorage access errors', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage denied');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage denied');
    });

    try {
      expect(readProgress()).toEqual(defaultProgress());
      expect(() => saveProgress(defaultProgress())).not.toThrow();
      expect(() => resetProgress()).not.toThrow();
    } finally {
      getItem.mockRestore();
      setItem.mockRestore();
    }
  });
});
