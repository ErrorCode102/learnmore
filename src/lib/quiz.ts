import { quizzes } from '../data/quizzes';
import type { Level } from '../types/course';

export const passingScore = 4;

export function getQuizQuestions(level: Level) {
  return quizzes[level];
}

export function scoreQuiz(level: Level, answers: readonly number[]): number {
  if (answers.length !== 5) {
    throw new Error('คำตอบยังไม่ครบ');
  }

  const questions = getQuizQuestions(level);
  return answers.reduce(
    (score, answer, index) => score + (answer === questions[index].answer ? 1 : 0),
    0,
  );
}

export function hasPassed(score: number): boolean {
  return score >= passingScore;
}
