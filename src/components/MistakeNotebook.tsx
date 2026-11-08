import React, { useState } from 'react';
import type { UserMistakeEntry } from '../types';
import {
  BookOpen,
  Filter,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

interface MistakeNotebookProps {
  mistakes: UserMistakeEntry[];
  onRetryQuestion: (questionId: string, selectedOpt: number) => Promise<{
    isCorrect: boolean;
    correctOptionIndex: number;
    explanation: string;
    nextReviewAt: string;
    intervalStep: number;
  }>;
  onOpenAiCoachWithQuestion: (questionText: string, explanation: string) => void;
  onBack: () => void;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({
  mistakes = [],
  onRetryQuestion,
  onOpenAiCoachWithQuestion,
  onBack,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  // Retry modal/card state
  const [activeRetryEntry, setActiveRetryEntry] = useState<UserMistakeEntry | null>(null);
  const [retrySelectedOpt, setRetrySelectedOpt] = useState<number | null>(null);
  const [retryResult, setRetryResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [retryError, setRetryError] = useState('');
  const [isSubmittingRetry, setIsSubmittingRetry] = useState(false);

  const reasonsKey = `examdna_mistake_reasons_${mistakes[0]?.userId || 'guest'}`;
  // State to track student's self-diagnosed mistake reasons
  const [mistakeReasons, setMistakeReasons] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(reasonsKey) || '{}');
    } catch {
      return {};
    }
  });

  // State to toggle hints
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  const handleSetReason = (questionId: string, reason: string) => {
    setMistakeReasons((prev) => {
      const updated = { ...prev, [questionId]: reason };
      try {
        localStorage.setItem(reasonsKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const safeMistakes = Array.isArray(mistakes) ? mistakes : [];

  // Honest display: If student has no mistakes, display empty state instead of fake demo items
  const displayMistakes = safeMistakes;

  // Subjects & Chapters for filters
  const allSubjects = Array.from(new Set(displayMistakes.map(m => m.question.subject || 'সাধারণ গণিত')));
  const allChapters = Array.from(new Set(displayMistakes.map(m => m.question.chapter || 'বীজগাণিতিক রাশি')));

  const filteredMistakes = displayMistakes.filter(m => {
    if (selectedSubject !== 'all' && m.question.subject !== selectedSubject) return false;
    if (selectedChapter !== 'all' && m.question.chapter !== selectedChapter) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedCardIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleStartRetry = (entry: any) => {
    setActiveRetryEntry(entry);
    setRetrySelectedOpt(null);
    setRetryResult(null); setRetryError('');
  };

  const handleConfirmRetry = async () => {
    if (!activeRetryEntry || retrySelectedOpt === null) return;
    if (isSubmittingRetry) return;
    setRetryError(''); setIsSubmittingRetry(true);
    try {
      const res = await onRetryQuestion(activeRetryEntry.questionId, retrySelectedOpt);
      setRetryResult({
        isCorrect: res.isCorrect,
        explanation: res.explanation,
      });
    } catch (error: any) {
      setRetryError(error.message || 'উত্তর সংরক্ষণ হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmittingRetry(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {retryError && <p role="alert" className="p-4 bg-red-50 text-red-800">{retryError}</p>}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Spaced Repetition Notebook</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              Mistake Notebook
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review every mistake with step-by-step explanations and AI coaching.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Dropdown Filters matching Screen 11 */}
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Subject Dropdown */}
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter('all');
                }}
                className="appearance-none bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {allSubjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Chapter Dropdown */}
            <div className="relative">
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Chapters</option>
                {allChapters.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

          </div>

          <div className="text-xs font-bold text-slate-500 font-mono-numbers">
            {filteredMistakes.length} mistakes saved
          </div>
        </div>

        {/* Mistake Cards matching Screen 11 */}
        <div className="space-y-4">
          {filteredMistakes.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">মিস্টেক নোটবুক একদম পরিষ্কার!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                তোমার কোনো অমীমাংসিত ভুল রেকর্ড নেই। কোনো পরীক্ষায় ভুল উত্তর দিলে তা এখানে স্বয়ংক্রিয়ভাবে যুক্ত হবে এবং রিভিশনের শিডিউল তৈরি হবে।
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  মডেল টেস্ট দিয়ে প্রস্তুতি শুরু করো
                </button>
              </div>
            </div>
          ) : (
            filteredMistakes.map((m) => {
              const isExpanded = !!expandedCardIds[m.id];
              const q = m.question;
              const currentReason = mistakeReasons[q.id] || '';
              const isHintRevealed = !!revealedHints[q.id];

              const reasonsList = [
                { id: 'concept', label: 'ধারণা বুঝতে পারিনি' },
                { id: 'calculation', label: 'গণনার ভুল' },
                { id: 'misread', label: 'প্রশ্ন ভুল পড়েছি' },
                { id: 'time', label: 'সময় শেষ' },
                { id: 'guessed', label: 'অনুমান করেছি' },
              ];

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-blue-100/80 shadow-2xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {q.subject || 'সাধারণ গণিত'} • {q.chapter}
                        </span>
                        {q.topic && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {q.topic}
                          </span>
                        )}
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold border border-purple-100">
                          রিভিশন ধাপ: {m.intervalStep + 1}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                        {q.questionText}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleExpand(m.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'সংক্ষেপ করুন' : 'ব্যাখ্যা দেখুন'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Student Mistake Self-Diagnosis Reason Selection */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">ভুলের কারণ চিহ্নিত করো:</span>
                    {reasonsList.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSetReason(q.id, r.label)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          currentReason === r.label
                            ? 'bg-rose-50 border-rose-300 text-rose-700 font-extrabold ring-1 ring-rose-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  {/* Hint Drawer */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRevealedHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isHintRevealed ? 'হিন্ট লুকান' : 'প্রথমে হিন্ট দেখুন (Hint First)'}</span>
                    </button>
                  </div>

                  {isHintRevealed && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed animate-in fade-in">
                      <strong>ইঙ্গিত (Hint):</strong> {q.explanation.split('।')[0] || 'মূল সূত্রটি মনোযোগ দিয়ে স্মরণ করো।'}
                    </div>
                  )}

                  {/* Expanded Full Explanation Drawer */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                      
                      {/* Answers side-by-side */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                          <span className="block text-[10px] uppercase font-bold text-rose-600 mb-0.5">
                            তোমার উত্তর (ভুল):
                          </span>
                          <span className="font-semibold">{q.options[m.selectedOptionIndex] || 'অনুত্তরিত'}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                          <span className="block text-[10px] uppercase font-bold text-emerald-600 mb-0.5">
                            যাচাইকৃত সঠিক উত্তর:
                          </span>
                          <span className="font-semibold">{q.options[m.correctOptionIndex]}</span>
                        </div>
                      </div>

                      {/* Step by step explanation */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <div className="font-bold text-[#0F172A] text-xs mb-1">পূর্ণাঙ্গ সমাধান ও বিশ্লেষণ:</div>
                        <div>{q.explanation}</div>
                      </div>

                      {/* Actions: Ask AI Coach + Retry Question */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => onOpenAiCoachWithQuestion(q.questionText, q.explanation)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>এআই কোচের কাছে আরও সহজ ব্যাখ্যা চাও</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartRetry(m)}
                          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                          <span>পুনরায় সমাধান করো (Retry)</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Retry Modal */}
        {activeRetryEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-blue-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-600">Quick Practice Retry</span>
                <button
                  type="button"
                  onClick={() => setActiveRetryEntry(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="text-sm font-bold text-[#0F172A]">
                {activeRetryEntry.question.questionText}
              </div>

              <div className="space-y-2">
                {activeRetryEntry.question.options.map((opt, idx) => {
                  const isSel = retrySelectedOpt === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRetrySelectedOpt(idx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                        isSel
                          ? 'bg-blue-50 border-blue-600 text-blue-900'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {retryResult && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  retryResult.isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  {retryResult.isCorrect ? '🎉 Correct! Mistake cleared from priority.' : 'Incorrect. Check the explanation below.'}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRetryEntry(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRetry}
                  disabled={retrySelectedOpt === null || isSubmittingRetry}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

