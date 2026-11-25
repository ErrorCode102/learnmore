import { useCallback, useEffect, useState } from 'react';
import {
  readProgress,
  recordQuiz as recordQuizProgress,
  resetProgress,
  saveProgress,
  toggleLesson as toggleLessonProgress,
} from '../lib/progress';
import type { LessonId, Level, ProgressState } from '../types/course';

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => readProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const setLevel = useCallback((level: Level) => {
    setProgress((current) => ({
      ...current,
      level,
    }));
  }, []);

  const toggleLesson = useCallback((id: LessonId, level: Level) => {
    setProgress((current) => toggleLessonProgress(current, id, level));
  }, []);

  const visitLesson = useCallback((id: LessonId) => {
    setProgress((current) =>
      current.lastLessonId === id ? current : { ...current, lastLessonId: id },
    );
  }, []);

  const recordQuiz = useCallback((level: Level, score: number) => {
    setProgress((current) => recordQuizProgress(current, level, score));
  }, []);

  const reset = useCallback(() => {
    setProgress(resetProgress());
  }, []);

  return {
    progress,
    level: progress.level,
    setLevel,
    toggleLesson,
    visitLesson,
    recordQuiz,
    reset,
  };
}
