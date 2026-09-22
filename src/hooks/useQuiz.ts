import { useCallback, useMemo, useState } from 'react';
import type { QuizData } from '@/types';

export const useQuiz = (quiz: QuizData | null) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const currentQuestion = quiz?.questions[currentIndex] ?? null;
  const selectedAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const score = useMemo(() => {
    if (!quiz) return 0;

    return quiz.questions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
  }, [answers, quiz]);

  const answerQuestion = useCallback(
    (answerIndex: number) => {
      if (!currentQuestion || selectedAnswer !== undefined || finished) return;

      if (
        !Number.isInteger(answerIndex) ||
        answerIndex < 0 ||
        answerIndex >= currentQuestion.options.length
      ) {
        return;
      }

      setAnswers((previous) => ({
        ...previous,
        [currentQuestion.id]: answerIndex,
      }));
    },
    [currentQuestion, finished, selectedAnswer],
  );

  const nextQuestion = useCallback(() => {
    if (!quiz || selectedAnswer === undefined || finished) return;

    if (currentIndex >= quiz.questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentIndex((previous) => previous + 1);
  }, [currentIndex, finished, quiz, selectedAnswer]);

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setFinished(false);
  }, []);

  const progress = quiz
    ? {
        current: currentIndex + 1,
        total: quiz.questions.length,
        percentage: Math.round(((currentIndex + 1) / quiz.questions.length) * 100),
      }
    : { current: 0, total: 0, percentage: 0 };

  return {
    currentIndex,
    currentQuestion,
    selectedAnswer,
    answers,
    score,
    finished,
    progress,
    answerQuestion,
    nextQuestion,
    resetQuiz,
  };
};
