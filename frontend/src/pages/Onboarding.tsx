import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import { vi } from '../strings/vi';

interface Option {
  value: string;
  label: string;
}

interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: Option[];
}

interface Recommendation {
  source: 'ai' | 'fallback';
  primaryPath: string;
  alternativePaths: string[];
  reason: string;
  focusAreas: string[];
  tips: string[];
}

interface OnboardingStatus {
  completedRounds: number[];
  nextRound: number | null;
  resumeAvailable: boolean;
  canRequestRecommendation: boolean;
  careerGoal: string | null;
  hasConfirmedPath: boolean;
}

const PATH_NAMES: Record<string, string> = {
  'frontend-developer': vi.onboarding.pathNames.frontendDeveloper,
  'backend-developer': vi.onboarding.pathNames.backendDeveloper,
  'fullstack-developer': vi.onboarding.pathNames.fullstackDeveloper,
  'ai-python': vi.onboarding.pathNames.aiPython,
};

type Step = 'questions' | 'recommendation';

const EMPTY_STATUS: OnboardingStatus = {
  completedRounds: [],
  nextRound: 1,
  resumeAvailable: false,
  canRequestRecommendation: false,
  careerGoal: null,
  hasConfirmedPath: false,
};

function getApiMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { error?: { message?: string } } } })
    ?.response?.data?.error?.message ?? fallback;
}

export default function Onboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('questions');
  const [status, setStatus] = useState<OnboardingStatus>(EMPTY_STATUS);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResumeCard, setShowResumeCard] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      const res = await api.get('/onboarding/questions');
      if (!isMounted) {
        return;
      }

      setQuestions(res.data.data);
      setStep('questions');
    }

    async function loadRecommendation() {
      const res = await api.get('/onboarding/recommendation');
      if (!isMounted) {
        return;
      }

      const recData = res.data.data as Recommendation | null;
      if (recData) {
        setRecommendation(recData);
        setStep('recommendation');
        return;
      }

      setError(vi.onboarding.noRecommendation);
    }

    async function bootstrapOnboarding() {
      setBootstrapping(true);
      setError('');

      try {
        const statusRes = await api.get('/onboarding/status');
        if (!isMounted) {
          return;
        }

        const nextStatus = (statusRes.data.data as OnboardingStatus | null) ?? EMPTY_STATUS;
        setStatus(nextStatus);
        setShowResumeCard(nextStatus.resumeAvailable && !nextStatus.hasConfirmedPath);

        if (nextStatus.canRequestRecommendation && !nextStatus.hasConfirmedPath) {
          await loadRecommendation();
        } else {
          await loadQuestions();
        }
      } catch {
        try {
          if (!isMounted) {
            return;
          }

          setStatus(EMPTY_STATUS);
          setShowResumeCard(false);
          await loadQuestions();
        } catch {
          if (!isMounted) {
            return;
          }

          setError(vi.onboarding.loadError);
        }
      } finally {
        if (isMounted) {
          setBootstrapping(false);
        }
      }
    }

    void bootstrapOnboarding();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleSelect(questionId: string, value: string, type: 'single' | 'multiple') {
    if (type === 'single') {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      return;
    }

    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) ?? [];
      const exists = current.includes(value);

      return {
        ...prev,
        [questionId]: exists ? current.filter((item) => item !== value) : [...current, value],
      };
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const payload = {
        careerGoal: answers.careerGoal as string,
        priorKnowledge: (answers.priorKnowledge as string[]) ?? [],
        learningBackground: answers.learningBackground as string,
        hoursPerWeek: parseInt(answers.hoursPerWeek as string, 10),
      };

      await api.post('/onboarding/submit', payload);

      const recRes = await api.get('/onboarding/recommendation');
      const recData = recRes.data.data as Recommendation | null;

      if (recData) {
        setRecommendation(recData);
        setStep('recommendation');
      } else {
        setError(vi.onboarding.noRecommendation);
      }
    } catch (err: unknown) {
      setError(getApiMessage(err, vi.onboarding.genericError));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    navigate('/dashboard');
  }

  const allAnswered = questions.length > 0 && questions.every((question) => {
    const answer = answers[question.id];

    if (question.type === 'single') {
      return Boolean(answer);
    }

    return Array.isArray(answer) && answer.length > 0;
  });

  const nextRoundLabel = status.nextRound ? `Vòng ${status.nextRound}` : 'vòng tiếp theo';

  if (bootstrapping) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d0a1a 0%, #1a0e2e 30%, #12101f 60%, #0a0a18 100%)' }}
      >
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full opacity-15 blur-[100px]" style={{ background: 'radial-gradient(circle, #8E37D7, transparent)' }} />
        <div className="relative z-10 text-center">
          <div className="inline-block w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-4" />
          <p className="text-white/40">{vi.onboarding.loading}</p>
        </div>
      </div>
    );
  }

  if (step === 'questions') {
    return (
      <div
        className="min-h-screen py-10 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d0a1a 0%, #1a0e2e 30%, #12101f 60%, #0a0a18 100%)' }}
      >
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]" style={{ background: 'radial-gradient(circle, #8E37D7, transparent)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]" style={{ background: 'radial-gradient(circle, #4facfe, transparent)' }} />

        <div className="relative z-10 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">{vi.onboarding.title}</h1>
          <p className="text-white/40 text-sm mb-8">{vi.onboarding.subtitle.replace('{count}', String(questions.length))}</p>

          {showResumeCard && (
            <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl shadow-lg shadow-black/20">
              <h2 className="mb-2 text-lg font-semibold text-white/90">Chào mừng bạn quay lại</h2>
              <p className="mb-3 text-sm text-white/60">
                Bạn đang dở vòng thiết lập ban đầu. Tiếp tục để hoàn thành hồ sơ học tập.
              </p>
              <p className="mb-4 text-xs uppercase tracking-wide text-purple-300/80">
                Tiếp tục từ {nextRoundLabel}
              </p>
              <button
                type="button"
                onClick={() => setShowResumeCard(false)}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-3 font-semibold text-white transition-all hover:opacity-90 md:w-auto"
              >
                Tiếp tục
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm mb-4 backdrop-blur-sm">{error}</div>
          )}

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-lg shadow-black/20 p-5">
                <p className="font-medium mb-3 text-white/90">
                  <span className="text-purple-400/70 mr-2">{index + 1}.</span>
                  {question.question}
                </p>

                <div className="space-y-2">
                  {question.options.map((option) => {
                    const selected = question.type === 'single'
                      ? answers[question.id] === option.value
                      : ((answers[question.id] as string[]) ?? []).includes(option.value);

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(question.id, option.value, question.type)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                          selected
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                            : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] text-white/60'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || loading}
            className="mt-8 w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold py-3 rounded-xl disabled:opacity-40 hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
          >
            {loading ? vi.onboarding.submitting : `${vi.onboarding.submitButton} →`}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'recommendation' && recommendation) {
    const pathDisplayName = PATH_NAMES[recommendation.primaryPath] ?? recommendation.primaryPath;

    return (
      <div
        className="min-h-screen py-10 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d0a1a 0%, #1a0e2e 30%, #12101f 60%, #0a0a18 100%)' }}
      >
        <div className="absolute top-[-10%] left-[30%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]" style={{ background: 'radial-gradient(circle, #8E37D7, transparent)' }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] rounded-full opacity-10 blur-[100px]" style={{ background: 'radial-gradient(circle, #4facfe, transparent)' }} />

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {vi.onboarding.recommendationTitle}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full backdrop-blur-sm border ${
              recommendation.source === 'ai'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
            }`}>
              {recommendation.source === 'ai' ? vi.onboarding.aiSource : vi.onboarding.fallbackSource}
            </span>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-lg shadow-black/20 p-6 mb-4">
            <h2 className="font-semibold text-lg mb-1 text-white/90">{pathDisplayName}</h2>
            <p className="text-white/40 text-sm mb-4">{recommendation.reason}</p>

            {recommendation.alternativePaths.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-white/50 mb-2">{vi.onboarding.alternativePaths}</p>
                <div className="flex flex-wrap gap-2">
                  {recommendation.alternativePaths.map((slug) => (
                    <span key={slug} className="bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs px-2.5 py-1 rounded-full">
                      {PATH_NAMES[slug] ?? slug}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recommendation.focusAreas.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-white/50 mb-2">{vi.onboarding.focusAreas}</p>
                <div className="flex flex-wrap gap-2">
                  {recommendation.focusAreas.map((topic) => (
                    <span key={topic} className="bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs px-2.5 py-1 rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recommendation.tips.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-white/50 mb-2">{vi.onboarding.studyTips}</p>
                <ul className="list-disc list-inside space-y-1">
                  {recommendation.tips.map((tip) => (
                    <li key={tip} className="text-sm text-white/50">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
          >
            {`${vi.onboarding.confirmButton} →`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d0a1a 0%, #1a0e2e 30%, #12101f 60%, #0a0a18 100%)' }}
    >
      <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full opacity-15 blur-[100px]" style={{ background: 'radial-gradient(circle, #8E37D7, transparent)' }} />
      <div className="relative z-10 text-center">
        <div className="inline-block w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-4" />
        <p className="text-white/40">{vi.onboarding.loading}</p>
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
