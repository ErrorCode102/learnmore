import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LevelSwitcher } from '../components/LevelSwitcher';
import { useClassroomProgress } from '../context/ProgressContext';
import { getQuizQuestions, hasPassed, scoreQuiz } from '../lib/quiz';
import type { Level } from '../types/course';

const trackNames: Record<Level, string> = {
  certificate: 'หลักสูตรปวช.',
  diploma: 'หลักสูตรปวส.',
};

interface PracticeAttemptProps {
  level: Level;
  recordQuiz: (level: Level, score: number) => void;
}

function PracticeAttempt({ level, recordQuiz }: PracticeAttemptProps) {
  const questions = getQuizQuestions(level);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusTargetRef = useRef<'question' | 'result' | null>(null);
  const submittedRef = useRef(false);
  const question = questions[questionIndex];
  const selectedAnswer = answers[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const answered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === question.answer;

  useEffect(() => {
    if (focusTargetRef.current === 'question') {
      questionHeadingRef.current?.focus();
      focusTargetRef.current = null;
    } else if (focusTargetRef.current === 'result' && result !== null) {
      resultHeadingRef.current?.focus();
      focusTargetRef.current = null;
    }
  }, [questionIndex, result]);

  function selectAnswer(optionIndex: number) {
    if (answered || submittedRef.current) return;

    const nextAnswers = [...answers];
    nextAnswers[questionIndex] = optionIndex;
    setAnswers(nextAnswers);
  }

  function submitQuiz() {
    if (
      submittedRef.current ||
      answers.length !== questions.length ||
      answers.some((answer) => answer === undefined)
    ) {
      return;
    }

    const score = scoreQuiz(level, answers);
    submittedRef.current = true;
    focusTargetRef.current = 'result';
    setResult(score);
    recordQuiz(level, score);
  }

  function advance() {
    if (!answered) return;

    if (isLastQuestion) {
      submitQuiz();
      return;
    }

    focusTargetRef.current = 'question';
    setQuestionIndex((current) => current + 1);
  }

  function retry() {
    submittedRef.current = false;
    focusTargetRef.current = 'question';
    setAnswers([]);
    setQuestionIndex(0);
    setResult(null);
  }

  if (result !== null) {
    const passed = hasPassed(result);

    return (
      <section
        aria-labelledby="quiz-result-title"
        className="mt-8 rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_20px_55px_-42px_rgba(23,34,59,0.55)] sm:p-8"
      >
        <div
          className={`rounded-2xl border p-6 text-center sm:p-8 ${
            passed
              ? 'border-success-border bg-soft-success text-success'
              : 'border-danger/30 bg-soft-coral text-danger'
          }`}
        >
          <h2
            id="quiz-result-title"
            ref={resultHeadingRef}
            tabIndex={-1}
            className="text-2xl font-semibold tracking-[-0.03em] focus:outline-none sm:text-3xl"
          >
            ผลแบบฝึกหัด
          </h2>
          <p className="mt-5 text-sm font-medium">คะแนนของคุณ</p>
          <p className="mt-1 text-5xl font-semibold tracking-[-0.05em]">{result}/5</p>
          <p className="mt-4 text-lg font-semibold">{passed ? 'ผ่านแล้ว' : 'ยังไม่ผ่าน'}</p>
          <p className="mt-2 text-sm leading-7">เกณฑ์ผ่านคือ 4 จาก 5 คะแนน</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-solid px-5 py-3 text-sm font-semibold text-on-inverse transition-colors hover:bg-brand-solid-hover"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            ทำแบบฝึกหัดใหม่
          </button>
          <Link
            to="/#course-map"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/30 hover:text-brand"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            กลับไปยังแผนภูมิหลักสูตร
          </Link>
        </div>

        <div className="mt-9 border-t border-line pt-7">
          <h2 className="text-xl font-semibold tracking-[-0.025em]">ทบทวนคำตอบ</h2>
          <ol
            aria-label="สรุปคำตอบและคำอธิบาย"
            className="mt-5 space-y-4"
          >
            {questions.map((reviewQuestion, index) => {
              const userAnswer = answers[index];

              return (
                <li
                  key={reviewQuestion.id}
                  className="min-w-0 rounded-2xl border border-line bg-canvas p-5"
                >
                  <h3 className="break-words text-base font-semibold leading-7">
                    {index + 1}. {reviewQuestion.prompt}
                  </h3>
                  <p className="mt-4 break-words text-sm leading-7 text-muted">
                    คำตอบของคุณ:{' '}
                    <span className="font-medium text-ink">
                      {reviewQuestion.options[userAnswer]}
                    </span>
                  </p>
                  <p className="mt-1 break-words text-sm leading-7 text-muted">
                    คำตอบที่ถูกต้อง:{' '}
                    <span className="font-medium text-success">
                      {reviewQuestion.options[reviewQuestion.answer]}
                    </span>
                  </p>
                  <p className="mt-3 break-words text-sm leading-7 text-muted">
                    คำอธิบาย: {reviewQuestion.explanation}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="quiz-question-title"
      className="mt-8 rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_20px_55px_-42px_rgba(23,34,59,0.55)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-brand">
          คำถามที่ {questionIndex + 1} จาก {questions.length}
        </p>
        <p className="text-xs text-muted">{answered ? 'ตอบแล้ว' : 'เลือกคำตอบหนึ่งข้อ'}</p>
      </div>
      <div
        aria-hidden="true"
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <h2
        id="quiz-question-title"
        ref={questionHeadingRef}
        tabIndex={-1}
        className="mt-7 break-words text-xl font-semibold leading-8 tracking-[-0.025em] focus:outline-none sm:text-2xl"
      >
        {question.prompt}
      </h2>

      <fieldset
        aria-describedby={answered ? 'quiz-answer-feedback' : undefined}
        className="mt-6 min-w-0"
      >
        <legend className="sr-only">ตัวเลือกคำตอบ</legend>
        <div className="grid gap-3">
          {question.options.map((option, optionIndex) => {
            const isSelected = selectedAnswer === optionIndex;
            const showCorrect = answered && optionIndex === question.answer;
            const showIncorrect = isSelected && !isCorrect;

            return (
              <label
                key={option}
                htmlFor={`${level}-${question.id}-${optionIndex}`}
                className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  showCorrect
                    ? 'border-success-border bg-soft-success'
                    : showIncorrect
                      ? 'border-danger/40 bg-soft-coral'
                      : 'border-line bg-canvas hover:border-brand/40'
                } ${answered ? 'cursor-default' : ''}`}
              >
                <input
                  id={`${level}-${question.id}-${optionIndex}`}
                  type="radio"
                  name={question.id}
                  value={optionIndex}
                  checked={isSelected}
                  disabled={answered}
                  onChange={() => selectAnswer(optionIndex)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                />
                <span className="min-w-0 break-words text-sm leading-7 text-ink">
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div
        id="quiz-answer-feedback"
        aria-live="polite"
        aria-atomic="true"
        className="mt-5"
      >
        {answered && (
          <div
            className={`rounded-xl border p-4 ${
              isCorrect
                ? 'border-success-border bg-soft-success text-success'
                : 'border-danger/30 bg-soft-coral text-danger'
            }`}
          >
            <p className="text-sm font-semibold">
              {isCorrect ? 'ตอบถูกต้อง' : 'ตอบยังไม่ถูกต้อง'}
            </p>
            <p className="mt-2 break-words text-sm leading-7 text-ink">
              {question.explanation}
            </p>
          </div>
        )}
      </div>

      {answered && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={advance}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-solid px-5 py-3 text-sm font-semibold text-on-inverse transition-colors hover:bg-brand-solid-hover"
          >
            {isLastQuestion ? 'ดูผลลัพธ์' : 'คำถามถัดไป'}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}

export function PracticePage() {
  const { level, progress, setLevel, recordQuiz } = useClassroomProgress();
  const latestScore = progress.quizScores[level];

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_20px_55px_-42px_rgba(23,34,59,0.55)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-brand">
              KNOWLEDGE CHECK
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              ฝึกท้ายบทAuthentication
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              แบบฝึกหัดมี 5 คำถาม ต้องตอบให้ครบ และผ่านเมื่อคะแนนอย่างน้อย 4 จาก 5
            </p>
            <p className="mt-3 text-sm font-semibold text-ink">{trackNames[level]}</p>
            {latestScore !== undefined && (
              <p className="mt-2 text-sm text-muted">คะแนนล่าสุด: {latestScore}/5</p>
            )}
          </div>
          <LevelSwitcher level={level} onChange={setLevel} />
        </div>
      </header>

      <PracticeAttempt key={level} level={level} recordQuiz={recordQuiz} />
    </div>
  );
}
