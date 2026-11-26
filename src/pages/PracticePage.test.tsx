import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../App';
import { quizzes } from '../data/quizzes';
import { readProgress, saveProgress } from '../lib/progress';
import type { Level } from '../types/course';

const PROGRESS_KEY = 'auth-classroom:progress:v1';
const scrollIntoView = vi.fn();

function renderPractice() {
  window.location.hash = '#/practice';
  return render(renderApp());
}

function selectAnswer(level: Level, questionIndex: number, optionIndex: number) {
  const question = quizzes[level][questionIndex];
  fireEvent.click(screen.getByRole('radio', { name: question.options[optionIndex] }));
}

function finishQuiz(level: Level, incorrectAt?: number) {
  const questions = quizzes[level];
  let finalAction: HTMLElement | undefined;

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const optionIndex = index === incorrectAt ? (question.answer + 1) % 4 : question.answer;
    selectAnswer(level, index, optionIndex);
    const action = screen.getByRole('button', {
      name: index === questions.length - 1 ? 'ดูผลลัพธ์' : 'คำถามถัดไป',
    });

    if (index === questions.length - 1) {
      finalAction = action;
      break;
    }

    fireEvent.click(action);
  }

  if (!finalAction) {
    throw new Error('The final quiz action was not rendered.');
  }

  return finalAction;
}

function resultRegion() {
  const heading = screen.getByRole('heading', { name: 'ผลแบบฝึกหัด' });
  const section = heading.closest('section');
  if (!section) {
    throw new Error('The quiz result section was not rendered.');
  }
  return within(section);
}

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '#/practice';
  scrollIntoView.mockClear();
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });
});

afterEach(() => {
  window.location.hash = '#/';
  localStorage.clear();
  scrollIntoView.mockClear();
});

describe('PracticePage', () => {
  it('starts certificate at question one without a result or saved score', () => {
    renderPractice();

    expect(screen.getByRole('heading', { level: 1, name: 'ฝึกท้ายบทAuthentication' })).toBeVisible();
    expect(screen.getByText('หลักสูตรปวช.')).toBeVisible();
    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
    expect(screen.getByText(/ผ่านเมื่อคะแนนอย่างน้อย 4 จาก 5/)).toBeVisible();
    expect(screen.getByRole('group', { name: 'ตัวเลือกคำตอบ' })).toBeVisible();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toBeChecked();
      expect(radio).toBeEnabled();
    }
    expect(screen.queryByRole('button', { name: 'คำถามถัดไป' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ดูผลลัพธ์' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'ผลแบบฝึกหัด' })).not.toBeInTheDocument();
    expect(screen.queryByText(/คะแนนล่าสุด:/)).not.toBeInTheDocument();
    expect(readProgress().quizScores.certificate).toBeUndefined();
  });

  it('locks a correct answer and immediately shows its explanation and Next action', () => {
    renderPractice();
    const question = quizzes.certificate[0];

    selectAnswer('certificate', 0, question.answer);

    expect(screen.getByRole('radio', { name: question.options[question.answer] })).toBeChecked();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
    expect(screen.getByText('ตอบถูกต้อง')).toBeVisible();
    expect(screen.getByText('ตอบถูกต้อง').closest('[aria-live="polite"]')).not.toBeNull();
    expect(screen.getByText(question.explanation)).toBeVisible();
    expect(screen.getByRole('button', { name: 'คำถามถัดไป' })).toBeEnabled();
    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
  });

  it('shows incorrect feedback without advancing automatically', () => {
    renderPractice();
    const question = quizzes.certificate[0];
    const wrongAnswer = (question.answer + 1) % 4;

    selectAnswer('certificate', 0, wrongAnswer);

    expect(screen.getByText('ตอบยังไม่ถูกต้อง')).toBeVisible();
    expect(screen.getByText(question.explanation)).toBeVisible();
    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
    expect(screen.getByRole('button', { name: 'คำถามถัดไป' })).toBeEnabled();
    expect(screen.queryByRole('heading', { name: quizzes.certificate[1].prompt })).not.toBeInTheDocument();
  });

  it('does not expose a result action before all five questions are answered', () => {
    renderPractice();

    for (let index = 0; index < 4; index += 1) {
      selectAnswer('certificate', index, quizzes.certificate[index].answer);
      fireEvent.click(screen.getByRole('button', { name: 'คำถามถัดไป' }));
    }

    expect(screen.getByText('คำถามที่ 5 จาก 5')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'ดูผลลัพธ์' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'ผลแบบฝึกหัด' })).not.toBeInTheDocument();
    expect(readProgress().quizScores.certificate).toBeUndefined();
  });

  it('shows the exact score, pass state and full review, then persists the score', async () => {
    renderPractice();
    const questions = quizzes.certificate;

    fireEvent.click(finishQuiz('certificate', 0));

    const result = resultRegion();
    expect(result.getByText('4/5')).toBeVisible();
    expect(result.getByText('ผ่านแล้ว')).toBeVisible();
    const review = result.getByRole('list', { name: 'สรุปคำตอบและคำอธิบาย' });
    const reviewItems = within(review).getAllByRole('listitem');
    expect(reviewItems).toHaveLength(5);

    questions.forEach((question, index) => {
      const userAnswer = index === 0 ? (question.answer + 1) % 4 : question.answer;
      expect(reviewItems[index]).toHaveTextContent(question.prompt);
      expect(reviewItems[index]).toHaveTextContent(question.options[userAnswer]);
      expect(reviewItems[index]).toHaveTextContent(question.options[question.answer]);
      expect(reviewItems[index]).toHaveTextContent(question.explanation);
    });

    await waitFor(() => {
      expect(readProgress().quizScores.certificate).toBe(4);
    });
  });

  it('resets only the in-memory attempt on retry and preserves the stored score', async () => {
    renderPractice();
    fireEvent.click(finishQuiz('certificate'));
    await waitFor(() => expect(readProgress().quizScores.certificate).toBe(5));

    fireEvent.click(screen.getByRole('button', { name: 'ทำแบบฝึกหัดใหม่' }));

    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'ผลแบบฝึกหัด' })).not.toBeInTheDocument();
    expect(screen.getByText('คะแนนล่าสุด: 5/5')).toBeVisible();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toBeChecked();
      expect(radio).toBeEnabled();
    }
    expect(readProgress().quizScores.certificate).toBe(5);
  });

  it('restores the latest stored score after reload or remount', () => {
    saveProgress({
      version: 1,
      level: 'certificate',
      completed: { certificate: [], diploma: [] },
      quizScores: { certificate: 4 },
    });
    const first = renderPractice();

    expect(screen.getByText('คะแนนล่าสุด: 4/5')).toBeVisible();
    first.unmount();
    renderPractice();

    expect(screen.getByText('คะแนนล่าสุด: 4/5')).toBeVisible();
    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'ผลแบบฝึกหัด' })).not.toBeInTheDocument();
  });

  it('resets the visible attempt when switching tracks without leaking answers or scores', () => {
    saveProgress({
      version: 1,
      level: 'certificate',
      completed: { certificate: ['overview'], diploma: ['security'] },
      quizScores: { certificate: 4, diploma: 2 },
    });
    renderPractice();
    selectAnswer('certificate', 0, quizzes.certificate[0].answer);
    fireEvent.click(screen.getByRole('button', { name: 'คำถามถัดไป' }));
    expect(screen.getByText('คำถามที่ 2 จาก 5')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'ปวส.' }));

    expect(screen.getByText('หลักสูตรปวส.')).toBeVisible();
    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: quizzes.diploma[0].prompt }),
    ).toBeVisible();
    expect(screen.getByText('คะแนนล่าสุด: 2/5')).toBeVisible();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toBeChecked();
    }
    expect(readProgress().quizScores).toEqual({ certificate: 4, diploma: 2 });

    fireEvent.click(screen.getByRole('button', { name: 'ปวช.' }));

    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
    expect(screen.getByText('คะแนนล่าสุด: 4/5')).toBeVisible();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toBeChecked();
    }
    expect(readProgress().quizScores).toEqual({ certificate: 4, diploma: 2 });
  });

  it('records only once when the final action is activated repeatedly', async () => {
    renderPractice();
    const finalAction = finishQuiz('certificate');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const progressWrites = () =>
      setItem.mock.calls.filter(([key]) => key === PROGRESS_KEY);
    const writesBefore = progressWrites().length;

    act(() => {
      fireEvent.click(finalAction);
      fireEvent.click(finalAction);
    });

    await waitFor(() => expect(readProgress().quizScores.certificate).toBe(5));
    expect(resultRegion().getByText('5/5')).toBeVisible();
    expect(progressWrites()).toHaveLength(writesBefore + 1);
  });

  it('moves focus to each new question heading after Next', async () => {
    renderPractice();
    selectAnswer('certificate', 0, quizzes.certificate[0].answer);

    fireEvent.click(screen.getByRole('button', { name: 'คำถามถัดไป' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: quizzes.certificate[1].prompt }),
      ).toHaveFocus();
    });
  });

  it('moves focus to the result heading after final submission', async () => {
    renderPractice();

    fireEvent.click(finishQuiz('certificate'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'ผลแบบฝึกหัด' })).toHaveFocus();
    });
    expect(screen.queryByText('ตอบถูกต้อง')).not.toBeInTheDocument();
  });

  it('returns to the course map from the result actions', async () => {
    renderPractice();
    fireEvent.click(finishQuiz('certificate'));

    fireEvent.click(screen.getByRole('link', { name: 'กลับไปยังแผนภูมิหลักสูตร' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Login และ Register');
      expect(document.getElementById('course-map')).toHaveFocus();
    });
    expect(window.location.hash).toBe('#/#course-map');
  });
});
