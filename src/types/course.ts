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
export type CodeLanguage = 'bash' | 'sql' | 'javascript' | 'vue' | 'json' | 'text';
export interface CodeSnippet {
  id: string;
  filename: string;
  language: CodeLanguage;
  code: string;
  notes: string[];
  caption?: string;
}
export interface LessonCallout {
  tone: 'info' | 'warning' | 'success';
  title: string;
  text: string;
}
export interface LessonSection {
  id: string;
  title: string;
  body: string[];
  bullets?: string[];
  flow?: Array<{ label: string; detail: string }>;
  snippets?: CodeSnippet[];
  callouts?: LessonCallout[];
  diplomaNote?: string;
}
export interface LessonContent extends LessonSummary {
  intro: string;
  sections: LessonSection[];
  checkpoint: { summary: string; checklist: string[] };
}
export interface ProgressState {
  version: 1;
  level: Level;
  completed: Record<Level, LessonId[]>;
  quizScores: Partial<Record<Level, number>>;
  lastLessonId?: LessonId;
}
