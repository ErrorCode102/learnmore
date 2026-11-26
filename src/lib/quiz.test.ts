import { describe, expect, it } from 'vitest';
import { quizzes } from '../data/quizzes';
import type { Level } from '../types/course';
import { getQuizQuestions, hasPassed, passingScore, scoreQuiz } from './quiz';

const levels: Level[] = ['certificate', 'diploma'];
const thaiCharacter = /[\u0E00-\u0E7F]/;

describe('quiz data and helpers', () => {
  it.each(levels)('provides five valid Thai questions for %s', (level) => {
    const questions = quizzes[level];

    expect(questions).toHaveLength(5);
    expect(getQuizQuestions(level)).toEqual(questions);
    expect(new Set(questions.map((question) => question.id)).size).toBe(5);

    for (const question of questions) {
      expect(question.id.trim()).not.toBe('');
      expect(question.prompt).toMatch(thaiCharacter);
      expect(question.explanation).toMatch(thaiCharacter);
      expect(question.options).toHaveLength(4);
      expect(Number.isInteger(question.answer)).toBe(true);
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThanOrEqual(3);

      for (const option of question.options) {
        expect(option.trim()).not.toBe('');
      }
    }
  });

  it('covers the required shared and track-specific concepts', () => {
    const certificateText = quizzes.certificate
      .flatMap((question) => [question.prompt, ...question.options, question.explanation])
      .join(' ');
    const diplomaText = quizzes.diploma
      .flatMap((question) => [question.prompt, ...question.options, question.explanation])
      .join(' ');

    for (const content of [certificateText, diplomaText]) {
      expect(content).toMatch(/HTTP/);
      expect(content).toMatch(/GET|POST|PUT|DELETE/);
      expect(content).toMatch(/200|201|204|404/);
      expect(content).toMatch(/SQL|MySQL/);
      expect(content).toMatch(/parameterized|UNIQUE/i);
      expect(content).toMatch(/validation|ตรวจสอบข้อมูล/i);
    }

    expect(certificateText).toMatch(/bcrypt/);
    expect(certificateText).toMatch(/Register|Login|flow|test|ทดสอบ/i);
    expect(diplomaText).toMatch(/JWT middleware/);
    expect(diplomaText).toMatch(/Docker/);
    expect(diplomaText).toMatch(/CI\/CD/);
    expect(diplomaText).toMatch(/secrets?/i);
    expect(diplomaText).toMatch(/tests?|ทดสอบ/i);
  });

  it.each(levels)('scores all correct answers as five for %s', (level) => {
    const answers = getQuizQuestions(level).map((question) => question.answer);

    expect(scoreQuiz(level, answers)).toBe(5);
  });

  it('scores mixed certificate answers with the exact expected total', () => {
    const correctAnswers = quizzes.certificate.map((question) => question.answer);
    const mixedAnswers = correctAnswers.map((answer, index) =>
      index === 0 || index === 3 ? (answer + 1) % 4 : answer,
    );

    expect(scoreQuiz('certificate', mixedAnswers)).toBe(3);
  });

  it.each(levels)('scores all wrong answers as zero for %s', (level) => {
    const answers = getQuizQuestions(level).map((question) => (question.answer + 1) % 4);

    expect(scoreQuiz(level, answers)).toBe(0);
  });

  it.each([
    { answers: [] },
    { answers: [0, 1, 2, 3] },
    { answers: [0, 1, 2, 3, 4, 0] },
  ])('rejects incomplete or oversized answer input %#', ({ answers }) => {
    expect(() => scoreQuiz('certificate', answers)).toThrowError('คำตอบยังไม่ครบ');
  });

  it('uses four out of five as the passing score', () => {
    expect(passingScore).toBe(4);
    expect(hasPassed(3)).toBe(false);
    expect(hasPassed(4)).toBe(true);
    expect(hasPassed(5)).toBe(true);
  });
});
