export type Level = 'certificate' | 'diploma';
export type LessonId = 'overview' | 'installation' | 'setup' | 'database' | 'backend' | 'api' | 'frontend' | 'testing' | 'security' | 'devops';
export interface LessonSummary {
  id: LessonId;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  durationMinutes: number;
  level: Level;
  outcomes: string[];
  tags: string[];
}
export interface ProgressState {
  version: 1;
  level: Level;
  completed: Record<Level, LessonId[]>;
  quizScores: Partial<Record<Level, number>>;
  lastLessonId?: LessonId;
}
