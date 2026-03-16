import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  options: QuizOption[];
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passThreshold: number;
  retryLimit: number;
  questions: QuizQuestion[];
}

interface GradedAnswer {
  questionId: string;
  selected: string[];
  correct: string[];
  isCorrect: boolean;
  explanation: string | null;
}

interface QuizResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  passThreshold: number;
  answers: GradedAnswer[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quiz() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch quiz data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) {
      setError('Không tìm thấy bài học.');
      setLoading(false);
      return;
    }

    api
      .get(`/lessons/${slug}/quiz`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setQuiz(data);
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404) setError('Bài học này không có quiz.');
        else if (status === 403) setError('Bạn chưa có quyền truy cập quiz này.');
        else setError('Có lỗi xảy ra. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Handle option selection ─────────────────────────────────────────────
  function handleSelect(questionId: string, optionId: string, questionType: string) {
    setAnswers((prev) => {
      if (questionType === 'SINGLE_CHOICE') {
        return { ...prev, [questionId]: [optionId] };
      }
      // MULTIPLE_CHOICE → toggle
      const current = prev[questionId] ?? [];
      const exists = current.includes(optionId);
      return {
        ...prev,
        [questionId]: exists
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      };
    });
  }

  // ── Submit quiz ─────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!slug) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/lessons/${slug}/quiz/submit`, { answers });
      const data = res.data?.data ?? res.data;
      setResult(data);
    } catch {
      setError('Nộp bài thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Retry quiz ──────────────────────────────────────────────────────────
  function handleRetry() {
    setAnswers({});
    setResult(null);
    setError(null);
  }

  // ── Check if all answered ───────────────────────────────────────────────
  const allAnswered =
    quiz != null &&
    quiz.questions.length > 0 &&
    quiz.questions.every((q) => (answers[q.id]?.length ?? 0) > 0);

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-xl mx-auto space-y-4">
          <button
            onClick={() => navigate(`/lesson/${slug}`)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            ← Quay lại bài học
          </button>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center space-y-4">
            <p className="text-4xl">😕</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate(`/lesson/${slug}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-colors"
            >
              Quay về bài học
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  // ── Helper: get graded answer for a question ────────────────────────────
  function getGradedAnswer(questionId: string): GradedAnswer | undefined {
    return result?.answers.find((a) => a.questionId === questionId);
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/lesson/${slug}`)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            ← Quay lại bài học
          </button>
          {!result && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              Cần {quiz.passThreshold}% để đạt
            </span>
          )}
        </div>

        {/* ── Quiz title ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📝 {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-sm text-gray-500 mt-2">{quiz.description}</p>
          )}
          {!result && (
            <p className="text-xs text-gray-400 mt-3">
              {quiz.questions.length} câu hỏi • Chọn đáp án và nhấn "Nộp bài"
            </p>
          )}
        </div>

        {/* ── Score banner (after submit) ───────────────────────────────── */}
        {result && (
          <div
            className={`rounded-xl shadow-sm p-6 text-center space-y-2 ${
              result.passed
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200'
                : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200'
            }`}
          >
            <p className="text-3xl">{result.passed ? '🎉' : '💪'}</p>
            <p className={`text-lg font-bold ${result.passed ? 'text-emerald-700' : 'text-orange-700'}`}>
              Bạn đạt {result.score}/100
              {result.passed ? ' — Đạt!' : ' — Chưa đạt'}
            </p>
            <p className="text-sm text-gray-500">
              {result.correctCount}/{result.totalQuestions} câu đúng
              {!result.passed && ` • Cần ${result.passThreshold}% để pass`}
            </p>
          </div>
        )}

        {/* ── Questions ────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            const graded = getGradedAnswer(question.id);
            const isCorrect = graded?.isCorrect;
            const selectedIds = result ? (graded?.selected ?? []) : (answers[question.id] ?? []);

            return (
              <div
                key={question.id}
                className={`bg-white rounded-xl shadow-sm p-5 space-y-3 transition-all ${
                  graded
                    ? isCorrect
                      ? 'ring-2 ring-emerald-200'
                      : 'ring-2 ring-red-200'
                    : ''
                }`}
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-gray-700 leading-relaxed">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mr-2 flex-shrink-0">
                      {index + 1}
                    </span>
                    {question.questionText}
                  </h3>
                  {graded && (
                    <span className="flex-shrink-0 text-lg">
                      {isCorrect ? '✅' : '❌'}
                    </span>
                  )}
                </div>

                {/* Question type badge */}
                <span className="inline-block text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                  {question.questionType === 'SINGLE_CHOICE' ? 'Chọn 1' : 'Chọn nhiều'}
                </span>

                {/* Options */}
                <div className="space-y-2">
                  {(question.options as QuizOption[]).map((option) => {
                    const isSelected = selectedIds.includes(option.id);
                    const isCorrectOption = graded?.correct.includes(option.id);
                    const isSingle = question.questionType === 'SINGLE_CHOICE';

                    // Determine styling
                    let optionStyle = 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30';
                    if (result) {
                      if (isCorrectOption && isSelected) {
                        optionStyle = 'border-emerald-400 bg-emerald-50';
                      } else if (isSelected && !isCorrectOption) {
                        optionStyle = 'border-red-400 bg-red-50';
                      } else if (isCorrectOption) {
                        optionStyle = 'border-emerald-300 bg-emerald-50/50';
                      } else {
                        optionStyle = 'border-gray-100 opacity-60';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-blue-500 bg-blue-50 ring-1 ring-blue-200';
                    }

                    return (
                      <label
                        key={option.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${optionStyle} ${
                          result ? 'cursor-default' : ''
                        }`}
                      >
                        <input
                          type={isSingle ? 'radio' : 'checkbox'}
                          name={`question-${question.id}`}
                          checked={isSelected}
                          onChange={() => {
                            if (!result) handleSelect(question.id, option.id, question.questionType);
                          }}
                          disabled={!!result}
                          className="sr-only"
                        />
                        {/* Custom radio/checkbox indicator */}
                        <span
                          className={`flex-shrink-0 w-5 h-5 ${isSingle ? 'rounded-full' : 'rounded'} border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? result
                                ? isCorrectOption
                                  ? 'border-emerald-500 bg-emerald-500'
                                  : 'border-red-500 bg-red-500'
                                : 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                        <span className={`text-sm ${isSelected && !result ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                          {option.text}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Explanation (after submit) */}
                {graded?.explanation && (
                  <div className={`mt-2 p-3 rounded-lg text-sm leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <span className="font-medium">💡 Giải thích:</span> {graded.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Error message ────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* ── Action buttons ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          {!result ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? 'Đang chấm điểm...'
                : !allAnswered
                  ? `Trả lời tất cả câu hỏi (${Object.keys(answers).length}/${quiz.questions.length})`
                  : 'Nộp bài ✓'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-3 rounded-lg transition-colors"
              >
                🔄 Làm lại
              </button>
              <button
                onClick={() => navigate(`/lesson/${slug}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 rounded-lg transition-colors"
              >
                Quay về bài học →
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
