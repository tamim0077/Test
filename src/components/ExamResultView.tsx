import React, { useState } from 'react';
import type { GradedExamResult } from '../utils/examScoring';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BrainCircuit
} from 'lucide-react';

interface ExamResultViewProps {
  result: GradedExamResult;
  onOpenMistakes: () => void;
  onStartAdaptive: () => void;
  onRetake: () => void;
  onBackToDashboard: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  result,
  onOpenMistakes,
  onStartAdaptive,
  onRetake,
  onBackToDashboard,
}) => {
  const [showFullReview, setShowFullReview] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const percentage = result.accuracyPercentage;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* ============================================================== */}
        {/* SCREEN 10: TROPHY HERO CELEBRATION                             */}
        {/* ============================================================== */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-blue-100 shadow-xl shadow-blue-500/5 text-center relative overflow-hidden">
          
          {/* Confetti & Glow Ambience */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-amber-100/50 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Golden Trophy Illustration */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 shadow-xl shadow-amber-500/25 animate-bounce duration-1000">
              <div className="w-full h-full rounded-full bg-amber-50 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-amber-500 fill-amber-400" />
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="space-y-1 mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              {result.isPerfectScore
                ? 'অভিনন্দন! শতভাগ সঠিক উত্তর! (Perfect Score)'
                : percentage >= 80
                ? 'চমৎকার পারফরম্যান্স! (Excellent Job!)'
                : percentage >= 50
                ? 'পরীক্ষা সম্পন্ন হয়েছে! (Good Effort!)'
                : 'পরীক্ষা সম্পন্ন হয়েছে (Keep Practicing!)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {result.isPerfectScore
                ? 'তুমি এই পরীক্ষায় সবকটি প্রশ্নের সঠিক উত্তর দিয়েছো!'
                : `মোট ${result.totalQuestions}টি প্রশ্নের মধ্যে ${result.correctCount}টি সঠিক হয়েছে`}
            </p>
          </div>

          {/* Large Score Reveal: 16 / 20 (80%) */}
          <div className="inline-flex items-baseline gap-2.5 mb-8">
            <span className="text-5xl sm:text-6xl font-black text-[#0F172A] font-mono-numbers tracking-tight">
              {result.score}
            </span>
            <span className="text-2xl font-bold text-slate-400">/</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-400 font-mono-numbers">
              {result.totalQuestions}
            </span>
            <span className="ml-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black font-mono-numbers">
              {percentage}%
            </span>
          </div>

          {/* 4 Summary Stats matching Screen 10 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>সঠিক (Correct)</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 font-mono-numbers">
                {result.correctCount}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-rose-700 mb-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>ভুল (Incorrect)</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-900 font-mono-numbers">
                {result.incorrectCount}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>অনুত্তরিত (Unanswered)</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
                {result.unansweredCount}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-700 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>ব্যয়িত সময়</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono-numbers">
                {formatTime(result.timeSpentSeconds)}
              </div>
            </div>
          </div>

          {/* Action Buttons matching Screen 10 */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <button
              type="button"
              onClick={() => setShowFullReview(!showFullReview)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{showFullReview ? 'উত্তরপত্র সংক্ষেপ করুন' : 'সকল উত্তর রিভিউ করুন (Review Answers)'}</span>
              {showFullReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {result.mistakes.length > 0 && (
              <button
                type="button"
                onClick={onOpenMistakes}
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-xs sm:text-sm border border-slate-200 hover:border-blue-300 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>ভুলগুলো অনুশীলন করো ({result.mistakes.length})</span>
              </button>
            )}
          </div>

        </div>

        {/* ============================================================== */}
        {/* TOPIC WISE PERFORMANCE BARS (Grounded strictly in exam items)  */}
        {/* ============================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#0F172A]">টপিকভিত্তিক দক্ষতা (Topic-wise Performance)</h3>
            <span className="text-xs font-semibold text-slate-500">
              {result.topicPerformance.length}টি মূল বিষয় মূল্যায়ন করা হয়েছে
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {result.topicPerformance && result.topicPerformance.length > 0 ? (
              result.topicPerformance.map((tp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700">
                      {tp.topic} <span className="text-slate-400 font-normal">({tp.chapter})</span>
                    </span>
                    <span className="font-mono-numbers text-blue-600">{tp.correct}/{tp.total} ({tp.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        tp.percentage >= 80
                          ? 'bg-emerald-500'
                          : tp.percentage >= 50
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${tp.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center">
                এই পরীক্ষার সকল প্রশ্ন একই বিষয়ের অধীনে মূল্যায়ন করা হয়েছে।
              </div>
            )}
          </div>
        </div>

        {/* Detailed Question Review: SHOWS ALL QUESTIONS (Answered, Unanswered, Correct, Incorrect) */}
        {showFullReview && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-[#0F172A]">
                সম্পূর্ণ উত্তরপত্র বিশ্লেষণ (মোট {result.totalQuestions}টি প্রশ্ন)
              </h3>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">সঠিক: {result.correctCount}</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">ভুল: {result.incorrectCount}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">অনুত্তরিত: {result.unansweredCount}</span>
              </div>
            </div>

            <div className="space-y-4">
              {(result.questionsReview && result.questionsReview.length > 0
                ? result.questionsReview
                : result.mistakes.map(m => ({
                    questionId: m.questionId,
                    subject: m.subject,
                    chapter: m.chapter,
                    topic: m.topic,
                    questionText: m.questionText,
                    options: m.options,
                    selectedOptionIndex: m.selectedOptionIndex,
                    correctOptionIndex: m.correctOptionIndex,
                    status: 'incorrect' as const,
                    explanation: m.explanation,
                    difficulty: m.difficulty,
                    nctbReference: undefined as string | undefined,
                    source: undefined as string | undefined,
                  }))
              ).map((q, idx) => {
                const isCorrect = q.status === 'correct';
                const isUnanswered = q.status === 'unanswered';
                const isIncorrect = q.status === 'incorrect';

                return (
                  <div
                    key={q.questionId || idx}
                    className={`p-5 rounded-2xl border text-xs space-y-3 transition-colors ${
                      isCorrect
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isIncorrect
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                        {q.subject} • {q.chapter} {q.topic ? `• ${q.topic}` : ''}
                      </span>
                      <span
                        className={`font-black px-2.5 py-0.5 rounded-md text-[11px] ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : isIncorrect
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isCorrect ? '✓ সঠিক উত্তর' : isIncorrect ? '✗ ভুল উত্তর' : '○ অনুত্তরিত'}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm leading-relaxed">
                      {idx + 1}. {q.questionText}
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((optText, optIdx) => {
                        const isStudentChoice = q.selectedOptionIndex === optIdx;
                        const isThisCorrect = q.correctOptionIndex === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${
                              isThisCorrect
                                ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-bold'
                                : isStudentChoice && !isThisCorrect
                                ? 'bg-rose-100/70 border-rose-300 text-rose-900 font-semibold line-through'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="text-xs">
                              <span className="font-mono font-bold mr-1.5">
                                {optIdx === 0 ? '(ক)' : optIdx === 1 ? '(খ)' : optIdx === 2 ? '(গ)' : '(ঘ)'}
                              </span>
                              {optText}
                            </span>
                            {isThisCorrect && (
                              <span className="text-[10px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded ml-2">
                                সঠিক
                              </span>
                            )}
                            {isStudentChoice && !isThisCorrect && (
                              <span className="text-[10px] bg-rose-600 text-white font-black px-1.5 py-0.5 rounded ml-2">
                                তোমার নির্বাচন
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Verified Explanation & Source Citation */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/80 text-slate-800 space-y-1">
                        <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>যাচাইকৃত ব্যাখ্যা (Verified Solution):</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-700 pl-4">{q.explanation}</p>
                        {q.source && (
                          <div className="text-[10px] text-slate-400 font-medium pl-4 pt-1">
                            উৎস: {q.source} {q.nctbReference ? `(${q.nctbReference})` : ''}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question Report Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => alert(`প্রশ্ন #${idx + 1} সংক্রান্ত পর্যবেক্ষণ পরীক্ষার রিভিউ টিমের নিকট পাঠানো হয়েছে। ধন্যবাদ!`)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>প্রশ্নে কোনো ভুল আছে? রিপোর্ট করুন</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition-colors"
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={onRetake}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Exam</span>
          </button>
        </div>

      </div>
    </div>
  );
};
