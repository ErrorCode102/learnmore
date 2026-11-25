import { certificateLessons, diplomaLessons, getLessonsForLevel } from '../data/course';
import type { LessonId, Level, ProgressState } from '../types/course';

const STORAGE_KEY = 'auth-classroom:progress:v1';
const LEVELS: Level[] = ['certificate', 'diploma'];

function createDefaultProgress(): ProgressState {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLevel(value: unknown): value is Level {
  return value === 'certificate' || value === 'diploma';
}

function normalizeCompleted(level: Level, value: unknown): LessonId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const allowedIds = new Set(getLessonsForLevel(level).map((lesson) => lesson.id));
  const seen = new Set<LessonId>();
  const completed: LessonId[] = [];

  for (const id of value) {
    if (typeof id !== 'string') {
      continue;
    }

    const lessonId = id as LessonId;
    if (!allowedIds.has(lessonId) || seen.has(lessonId)) {
      continue;
    }

    seen.add(lessonId);
    completed.push(lessonId);
  }

  return completed;
}

function normalizeQuizScores(value: unknown): Partial<Record<Level, number>> {
  if (!isRecord(value)) {
    return {};
  }

  const quizScores: Partial<Record<Level, number>> = {};

  for (const level of LEVELS) {
    const score = value[level];
    if (
      typeof score === 'number' &&
      Number.isInteger(score) &&
      score >= 0 &&
      score <= 5
    ) {
      quizScores[level] = score;
    }
  }

  return quizScores;
}

function normalizeProgress(value: unknown): ProgressState {
  if (!isRecord(value) || value.version !== 1 || !isLevel(value.level)) {
    return createDefaultProgress();
  }

  const completedInput = isRecord(value.completed) ? value.completed : {};
  const completed = {
    certificate: normalizeCompleted('certificate', completedInput.certificate),
    diploma: normalizeCompleted('diploma', completedInput.diploma),
  };
  const progress: ProgressState = {
    version: 1,
    level: value.level,
    completed,
    quizScores: normalizeQuizScores(value.quizScores),
  };
  const allowedLastLessonIds = new Set(
    [...certificateLessons, ...diplomaLessons].map((lesson) => lesson.id),
  );

  if (
    typeof value.lastLessonId === 'string' &&
    allowedLastLessonIds.has(value.lastLessonId as LessonId)
  ) {
    progress.lastLessonId = value.lastLessonId as LessonId;
  }

  return progress;
}

export function readProgress(): ProgressState {
  if (typeof window === 'undefined') {
    return createDefaultProgress();
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeProgress(JSON.parse(stored)) : createDefaultProgress();
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(next: ProgressState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProgress(next)));
  } catch {
    // Storage can be unavailable in private browsing or when its quota is exceeded.
  }
}

export function resetProgress(): ProgressState {
  const progress = createDefaultProgress();
  saveProgress(progress);
  return progress;
}

export function toggleLesson(
  state: ProgressState,
  id: LessonId,
  level: Level,
): ProgressState {
  const lessons = getLessonsForLevel(level);
  if (!lessons.some((lesson) => lesson.id === id)) {
    throw new Error(`Unknown lesson "${id}" for ${level} level.`);
  }

  const completedForLevel = state.completed[level];
  const isCompleted = completedForLevel.includes(id);
  const completed = isCompleted
    ? completedForLevel.filter((lessonId) => lessonId !== id)
    : [...completedForLevel, id];

  return {
    ...state,
    level,
    completed: {
      ...state.completed,
      [level]: completed,
    },
    lastLessonId: id,
  };
}

export function recordQuiz(
  state: ProgressState,
  level: Level,
  score: number,
): ProgressState {
  const integerScore = Number.isNaN(score) ? 0 : Math.trunc(score);
  const clampedScore = Math.max(0, Math.min(5, integerScore));

  return {
    ...state,
    level,
    quizScores: {
      ...state.quizScores,
      [level]: clampedScore,
    },
  };
}
