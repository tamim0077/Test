import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Check,
  Send,
  Calculator,
  Bookmark,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { ScientificCalculatorModal } from './ScientificCalculatorModal';

export interface ExamQuestionView {
  id: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  questionText: string;
  options: [string, string, string, string];
  difficulty?: string;
}

interface ExamScreenProps {
  examId: string;
  title: string;
  questions: ExamQuestionView[];
  timeLimitMinutes: number;
  publishedExamId?: string;
  onSubmitExam: (answers: Record<string, number>, timeSpentSeconds: number) => void;
  onExit: () => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  examId,
  title,
  questions,
  timeLimitMinutes,
  publishedExamId,
  onSubmitExam,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(timeLimitMinutes * 60);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storageKey = `exam_progress_${examId}`;
  const totalQuestions = questions.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (typeof parsed.timeLeftSeconds === 'number' && parsed.timeLeftSeconds > 0) {
          setTimeLeftSeconds(parsed.timeLeftSeconds);
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers, timeLeftSeconds }));
    } catch {
      // ignore
    }
  }, [answers, timeLeftSeconds, storageKey]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAutoSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    localStorage.removeItem(storageKey);
    const timeSpent = timeLimitMinutes * 60;
    onSubmitExam(answers, timeSpent);
  };

  const handleManualSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    localStorage.removeItem(storageKey);
    const timeSpent = timeLimitMinutes * 60 - timeLeftSeconds;
    onSubmitExam(answers, Math.max(1, timeSpent));
  };

  const currentQ = questions[currentIndex] || questions[0];
  const answeredCount = Object.keys(answers).length;

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = timeLeftSeconds < 180;

  const selectOption = (optIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex,
    }));
  };

  const clearSelection = () => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const toggleReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const isCurrentMarked = !!markedForReview[currentQ?.id];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      
      {/* ============================================================== */}
      {/* TOP HEADER: Breadcrumb, Timer Pill, Blue Submit Button         */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-blue-100 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              title="Exit exam"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <span>{currentQ?.subject || 'Mathematics'}</span>
                <span className="text-slate-300">•</span>
                <span className="text-blue-600 font-semibold">{currentQ?.chapter || 'Algebra'}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Answered: <strong className="text-blue-600 font-mono-numbers">{answeredCount}</strong> / {totalQuestions} questions
              </div>
            </div>
          </div>

          {/* Right: Live Countdown Badge & Blue Submit Button */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-bold font-mono-numbers shadow-2xs ${
                isTimeCritical
                  ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                  : 'bg-blue-50/80 text-blue-700 border-blue-200'
              }`}
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              Submit
            </button>
          </div>

        </div>
      </header>

      {/* ============================================================== */}
      {/* QUESTION NAVIGATOR PILL STRIP (1 to 20)                        */}
      {/* ============================================================== */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 mr-2 shrink-0">
            Question {currentIndex + 1} of {totalQuestions}:
          </span>
          <div className="flex items-center gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              const isFlagged = markedForReview[q.id];

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs font-mono-numbers shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-300'
                      : isFlagged
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : isAnswered
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN QUESTION CARD WITH FLOATING TOOLS (Screen 9)             */}
      {/* ============================================================== */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full flex flex-col justify-center">
        
        <div className="relative bg-white rounded-3xl p-6 sm:p-10 border border-blue-100 shadow-xl shadow-blue-500/5">
          
          {/* Floating Side Tools matching Screen 9 */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(true)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
              title="Open Scientific Calculator"
            >
              <Calculator className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleReview}
              className={`p-2.5 rounded-xl border transition-colors shadow-2xs ${
                isCurrentMarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title="Bookmark for review"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={clearSelection}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors shadow-2xs"
              title="Clear selection"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Question Title & Number */}
          <div className="mb-8 pr-32">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3">
              Question {currentIndex + 1}
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-[#0F172A] leading-relaxed">
              Q{currentIndex + 1}. {currentQ?.questionText}
            </h2>
          </div>

          {/* 4 Options Grid (A, B, C, D) matching Screen 9 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ?.options.map((optionText, optIdx) => {
              const isSelected = answers[currentQ.id] === optIdx;
              const optionLetter = ['A', 'B', 'C', 'D'][optIdx];

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => selectOption(optIdx)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-md shadow-blue-500/10'
                      : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                      }`}
                    >
                      {optionLetter}
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-[#0F172A]">
                      {optionText}
                    </span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </main>

      {/* ============================================================== */}
      {/* BOTTOM CONTROL BAR: Previous, Mark for review, Next            */}
      {/* ============================================================== */}
      <footer className="bg-white border-t border-slate-200/80 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCurrentMarked}
              onChange={toggleReview}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>Mark for review</span>
          </label>

          <button
            type="button"
            onClick={() => {
              if (currentIndex < totalQuestions - 1) {
                setCurrentIndex((prev) => prev + 1);
              } else {
                setShowConfirmModal(true);
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>{currentIndex < totalQuestions - 1 ? 'Next' : 'Review & Submit'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </footer>

      {/* Scientific Calculator Modal */}
      <ScientificCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Confirm Submission Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-blue-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-[#0F172A] mb-2">
              Submit Your Exam?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              You answered <strong className="text-blue-600 font-mono-numbers">{answeredCount}</strong> out of {totalQuestions} questions. Are you ready to see your final score and mistake breakdown?
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md shadow-blue-500/25 cursor-pointer"
              >
                {isSubmitting ? 'Grading Answers...' : 'Yes, Submit Exam'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
              >
                Continue Exam
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
