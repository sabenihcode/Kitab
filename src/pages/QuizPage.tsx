import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '@/hooks/useQuiz';
import { loadQuizData } from '@/services/api/quizApi';
import type { QuizData } from '@/types';

export const QuizPage = () => {
  const navigate = useNavigate();
  const { id, paragrafId } = useParams<{ id: string; paragrafId: string }>();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const {
    currentQuestion,
    answerQuestion,
    nextQuestion,
    finished,
    score,
    progress,
    resetQuiz,
  } = useQuiz(quiz);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id || !paragrafId) {
        setError('Parameter quiz tidak valid');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const babNumber = Number(id);

        const data = await loadQuizData(babNumber, paragrafId);
        setQuiz(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat quiz';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, paragrafId]);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentQuestion]);

  const percentScore = useMemo(() => {
    if (!quiz || quiz.questions.length === 0) return 0;
    return Math.round((score / quiz.questions.length) * 100);
  }, [quiz, score]);

  if (loading) {
    return (
      <div className="center-state">
        <div className="spinner" />
        <p>Memuat quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-state error-state">
        <h2>Terjadi Kesalahan</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate(`/bab/${id}`)}
          className="btn-primary"
        >
          Kembali ke Bab
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="center-state">
        <p>Quiz tidak tersedia</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const isAnswered = selectedAnswer !== null;

  const handleAnswerClick = (index: number) => {
    if (isAnswered) return;

    setSelectedAnswer(index);
    answerQuestion(index);
  };

  const handleNext = () => {
    nextQuestion();
  };

  if (finished) {
    return (
      <div className="quiz-container page-with-nav">
        <div className="quiz-result-card">
          <p className="quiz-result-label">Hasil Quiz</p>
          <h2 className="quiz-result-score">{score}/{quiz.questions.length}</h2>
          <p className="quiz-result-percent">{percentScore}%</p>

          <div className="quiz-result-meta">
            <span>{quiz.title}</span>
          </div>

          <div className="quiz-result-actions">
            <button className="btn-primary" onClick={resetQuiz}>
              Ulangi Quiz
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate(`/bab/${id}`)}
            >
              Kembali ke Bab
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="quiz-container page-with-nav">
      <div className="quiz-header">
        <button
          className="quiz-back-btn"
          onClick={() => navigate(`/bab/${id}`)}
        >
          ← Kembali
        </button>

        <div className="quiz-progress-text">
          Soal {progress.current} / {progress.total}
        </div>
      </div>

      <div className="quiz-card">
        <div className="quiz-meta">
          <span className="quiz-badge">Bab {quiz.babId}</span>
          <span className="quiz-badge soft">{quiz.title}</span>
        </div>

        <div className="quiz-word">
          {currentQuestion.displayWord || currentQuestion.word}
        </div>

        <p className="quiz-question">{currentQuestion.question}</p>

        <div className="quiz-options">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.correctAnswer;
            const isSelected = selectedAnswer === index;

            let className = 'quiz-option';

            if (isAnswered && isCorrect) {
              className += ' correct';
            }

            if (isAnswered && isSelected && !isCorrect) {
              className += ' incorrect';
            }

            if (isAnswered && isSelected && isCorrect) {
              className += ' selected';
            }

            return (
              <button
                key={option}
                type="button"
                className={className}
                onClick={() => handleAnswerClick(index)}
                disabled={isAnswered}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="quiz-explanation">
            <p className="quiz-explanation-label">Penjelasan:</p>
            <p>{currentQuestion.explanation || 'Jawaban benar telah dipilih.'}</p>
          </div>
        )}

        <div className="quiz-footer">
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          <button
            className="btn-primary quiz-next-btn"
            onClick={handleNext}
            disabled={!isAnswered}
          >
            {progress.current === progress.total ? 'Lihat Hasil' : 'Soal Berikutnya'}
          </button>
        </div>
      </div>
    </div>
  );
};
