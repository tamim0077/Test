import { apiFetch as fetch } from '../utils/api.ts';
import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Clock,
  Sliders,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  X,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import type { Language } from '../utils/i18n';
import { NCTB_CHAPTERS } from '../config/brandConfig.ts';

interface ExamSetupPageProps {
  lang: Language;
  onStartExam: (config: {
    level: string;
    subject: string;
    chapters: string[];
    questionSource: string;
    count: number;
    difficulty: string;
    duration: number;
    allowPartial?: boolean;
    board?: string; year?: string;
  }) => Promise<{ success: boolean; error?: string; availableCount?: number; requestedCount?: number; message?: string } | void> | void;
  onBack: () => void;
}

export const ExamSetupPage: React.FC<ExamSetupPageProps> = ({
  lang,
  onStartExam,
  onBack,
}) => {
  const [startError, setStartError] = useState('');
  const startBusy = useRef(false);
  const [setupMode, setSetupMode] = useState<'quick' | 'wizard'>('quick');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [level, setLevel] = useState<string>('SSC');
  const [subject, setSubject] = useState<string>('সাধারণ গণিত');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [questionSource, setQuestionSource] = useState<string>('all');
  const [board, setBoard] = useState('');
  const [year, setYear] = useState('');
  const [count, setCount] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<string>('adaptive');
  const [duration, setDuration] = useState<number>(20);

  // Availability & Insufficient Questions States
  const [availability, setAvailability] = useState<{
    availableCount: number;
    requestedCount: number;
    isSufficient: boolean;
    message: string;
  } | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);
  const [isInsufficientModalOpen, setIsInsufficientModalOpen] = useState<boolean>(false);

  const steps = [
    { num: 1, titleBn: 'লেভেল নির্বাচন', titleEn: 'Select Level' },
    { num: 2, titleBn: 'বিষয় পছন্দ', titleEn: 'Choose Subject' },
    { num: 3, titleBn: 'অধ্যায় নির্বাচন', titleEn: 'Select Chapters' },
    { num: 4, titleBn: 'প্রশ্নের উৎস', titleEn: 'Question Source' },
    { num: 5, titleBn: 'প্রশ্নের সংখ্যা', titleEn: 'Question Count' },
    { num: 6, titleBn: 'কঠিনতার স্তর', titleEn: 'Difficulty' },
    { num: 7, titleBn: 'সময়সীমা', titleEn: 'Duration' },
    { num: 8, titleBn: 'রিভিউ ও শুরু', titleEn: 'Review & Start' },
  ];

  const mathChapters = NCTB_CHAPTERS['সাধারণ গণিত'] as unknown as string[];
  const physicsChapters = NCTB_CHAPTERS['পদার্থবিজ্ঞান'] as unknown as string[];
  const chemistryChapters = NCTB_CHAPTERS['রসায়ন'] as unknown as string[];
  const biologyChapters = NCTB_CHAPTERS['জীববিজ্ঞান'] as unknown as string[];

  const availableChapters =
    subject === 'রসায়ন'
      ? chemistryChapters
      : subject === 'জীববিজ্ঞান'
      ? biologyChapters
      : subject === 'পদার্থবিজ্ঞান'
      ? physicsChapters
      : subject === 'উভয় বিষয়' || subject === 'সকল বিষয়'
      ? [...mathChapters, ...physicsChapters, ...chemistryChapters, ...biologyChapters]
      : mathChapters;

  const toggleChapter = (ch: string) => {
    setSelectedChapters((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  // Discard stale availability responses when filters change.
  useEffect(() => {
    if (currentStep !== 5 && currentStep !== 8) return;
    let active = true;
    setAvailability(null);
    fetch('/api/exams/check-availability', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, chapters: selectedChapters, questionSource, board, year, difficulty, count }),
    }).then(r => r.json()).then(data => { if (active) setAvailability(data); })
      .catch(error => { if (active) setStartError(error.message); });
    return () => { active = false; };
  }, [currentStep, subject, selectedChapters, questionSource, board, year, difficulty, count]);

  const startExam = async (allowPartial = false) => {
    if (startBusy.current) return;
    startBusy.current = true; setIsCheckingAvailability(true); setIsSubmittingQuick(true); setStartError('');
    try {
      const result = await onStartExam({ level, subject, chapters: selectedChapters,
        questionSource, board, year, count, difficulty, duration, allowPartial });
      if (result && !result.success) {
        if (result.error === 'insufficient_questions') {
          setAvailability({ availableCount: result.availableCount || 0,
            requestedCount: result.requestedCount || count, isSufficient: false, message: result.message || '' });
          setIsInsufficientModalOpen(true);
        } else setStartError(result.message || 'পরীক্ষা শুরু করা যায়নি। আবার চেষ্টা করুন।');
      }
    } catch (error: any) { setStartError(error.message || 'পরীক্ষা শুরু করা যায়নি।'); }
    finally { startBusy.current = false; setIsCheckingAvailability(false); setIsSubmittingQuick(false); }
  };
  const handleNext = () => {
    if (currentStep < 8) setCurrentStep(step => step + 1);
    else void startExam();
  };
  const handleStartPartial = () => {
    if (!availability?.availableCount) return;
    setIsInsufficientModalOpen(false);
    void startExam(true);
  };

  const handleChangeChapters = () => {
    setIsInsufficientModalOpen(false);
    setCurrentStep(3);
  };

  const handleChooseSmaller = () => {
    setIsInsufficientModalOpen(false);
    setCurrentStep(5);
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {startError && <p role="alert" className="p-4 text-red-800 bg-red-50">{startError}</p>}
      <div className="flex flex-wrap gap-3 p-4 bg-blue-50 rounded-xl"><label>বোর্ড <select aria-label="Board" value={board} onChange={e => setBoard(e.target.value)} className="p-2 border rounded"><option value="">সকল বোর্ড</option>{['ঢাকা','রাজশাহী','চট্টগ্রাম','কুমিল্লা','যশোর','বরিশাল','সিলেট','দিনাজপুর','ময়মনসিংহ'].map(b => <option key={b}>{b}</option>)}</select></label><label>বছর <select aria-label="Year" value={year} onChange={e => setYear(e.target.value)} className="p-2 border rounded"><option value="">সকল বছর</option>{[2025,2024,2023,2022,2021,2020].map(y => <option key={y}>{y}</option>)}</select></label><p className="text-xs">শুধু নথিভুক্ত বোর্ড/বছরযুক্ত প্রশ্ন ফিল্টারে অন্তর্ভুক্ত হবে।</p></div>
      <div className="max-w-6xl mx-auto">
        
        {/* Top Breadcrumb & Exit */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-blue-600 transition-colors"
            >
              ExamDNA BD
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-600 font-bold">
              {lang === 'bn' ? 'পরীক্ষা কনফিগারেশন' : 'Exam Setup Wizard'}
            </span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
          <div>
            <h2 className="text-base font-black text-[#0F172A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              {setupMode === 'quick' ? 'দ্রুত পরীক্ষা শুরু (Quick 1-Click Start)' : 'বিস্তারিত কাস্টমাইজেশন (8-Step Setup)'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {setupMode === 'quick'
                ? 'বিষয় ও প্রশ্নসংখ্যা বেছে নিয়ে মাত্র ১-ক্লিকে তাৎক্ষণিক পরীক্ষা শুরু করুন'
                : 'বোর্ড, অধ্যায়, নেগেটিভ মার্কিং ও সময় সুনির্দিষ্টভাবে নিয়ন্ত্রণ করুন'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSetupMode('quick')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                setupMode === 'quick'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              দ্রুত শুরু (Quick)
            </button>
            <button
              type="button"
              onClick={() => setSetupMode('wizard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                setupMode === 'wizard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ৮-ধাপের কাস্টম (Wizard)
            </button>
          </div>
        </div>

        {/* QUICK START MODE */}
        {setupMode === 'quick' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-xl shadow-blue-500/5 space-y-7 animate-in fade-in duration-200">
            {/* 1. Subject Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                ১. বিষয় পছন্দ করুন (Choose Subject)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'সাধারণ গণিত', label: 'সাধারণ গণিত', icon: Calculator, color: 'text-blue-600' },
                  { id: 'পদার্থবিজ্ঞান', label: 'পদার্থবিজ্ঞান', icon: Atom, color: 'text-cyan-600' },
                  { id: 'রসায়ন', label: 'রসায়ন', icon: FlaskConical, color: 'text-emerald-600' },
                  { id: 'জীববিজ্ঞান', label: 'জীববিজ্ঞান', icon: Dna, color: 'text-teal-600' },
                  { id: 'সকল বিষয়', label: 'সকল বিষয় (Combo)', icon: Sparkles, color: 'text-indigo-600' },
                ].map((s) => {
                  const isSelected = subject === s.id;
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSubject(s.id);
                        setSelectedChapters([]);
                      }}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 font-bold'
                          : 'border-slate-200 hover:border-blue-200 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 mx-auto mb-2 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <div className="text-xs font-bold leading-tight">{s.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Chapter Mode */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  ২. সিলেবাস পরিধি (Syllabus Scope)
                </label>
                <span className="text-[11px] font-bold text-blue-600">
                  {selectedChapters.length === 0 ? 'সম্পূর্ণ বইয়ের সব অধ্যায়' : `${selectedChapters.length}টি অধ্যায় নির্বাচিত`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChapters([])}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedChapters.length === 0
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  সম্পূর্ণ পাঠ্যক্রম (Full Syllabus)
                </button>
                {availableChapters.slice(0, 8).map((ch) => {
                  const isSelected = selectedChapters.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChapter(ch)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {ch.split(':')[1]?.trim() || ch}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Question Count & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  ৩. প্রশ্নসংখ্যা (Exact Question Count)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 35, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setCount(num);
                        setDuration(num); // 1 min per question default
                      }}
                      className={`py-3 rounded-xl text-xs font-black transition-all ${
                        count === num
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {num} টি
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  ৪. পরীক্ষার সময়সীমা (Duration)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 30].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDuration(min)}
                      className={`py-3 rounded-xl text-xs font-black transition-all ${
                        duration === min
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {min} মিনিট
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                মোট <span className="font-bold text-slate-800">{count}টি</span> প্রশ্ন • সময় <span className="font-bold text-slate-800">{duration} মিনিট</span> • নির্ভুল ও অনুমোদিত এনসিটিবি প্রশ্ন
              </div>
              <button
                type="button"
                disabled={isSubmittingQuick}
                onClick={() => void startExam()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{isSubmittingQuick ? 'পরীক্ষা প্রস্তুত হচ্ছে...' : 'সরাসরি পরীক্ষা শুরু করুন'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Wizard Layout matching Screen 8 */}
        {setupMode === 'wizard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 8-Step Progress Indicator */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-blue-100 shadow-md shadow-blue-500/5">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">
              {lang === 'bn' ? 'ধাপসমূহ (৮টি ধাপ)' : 'Setup Steps (8 Steps)'}
            </div>

            <div className="space-y-2">
              {steps.map((st) => {
                const isActive = currentStep === st.num;
                const isPassed = currentStep > st.num;
                return (
                  <button
                    key={st.num}
                    type="button"
                    onClick={() => setCurrentStep(st.num)}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-blue-50/80 border border-blue-400/80 text-blue-900 shadow-2xs font-bold'
                        : isPassed
                        ? 'text-slate-700 hover:bg-slate-50 font-medium'
                        : 'text-slate-400 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.num}
                    </div>
                    <span className="text-xs font-bold">
                      {lang === 'bn' ? st.titleBn : st.titleEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Step Content Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-xl shadow-blue-500/5 min-h-[480px] flex flex-col justify-between">
            
            {/* Step 1: Select Level */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-black text-[#0F172A]">
                    {lang === 'bn' ? '১. পরীক্ষার লেভেল নির্বাচন করুন' : '1. Select Exam Level'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'bn' ? 'কোন পরীক্ষার জন্য প্রস্তুতি নিচ্ছেন তা নির্বাচন করুন' : 'Choose your target examination board'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setLevel('SSC')}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      level === 'SSC'
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                        SSC
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Currently Available
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">এসএসসি (SSC)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">নবম ও দশম শ্রেণী পাঠ্যক্রম</div>
                  </button>

                  <div className="p-5 rounded-2xl border border-slate-200 opacity-60 text-left bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-black text-sm">
                        HSC
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-700">এইচএসসি (HSC)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">একাদশ ও দ্বাদশ শ্রেণী</div>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 opacity-60 text-left bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-black text-sm">
                        ADM
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-700">বিশ্ববিদ্যালয় ভর্তি</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">মেডিকেল, বুয়েট ও ঢাবি</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Choose Subject */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-black text-[#0F172A]">
                    {lang === 'bn' ? '২. বিষয় পছন্দ করুন' : '2. Choose Subject'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'bn' ? 'যে বিষয়ের ওপর পরীক্ষা দিতে চান' : 'Select your focus subject'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mathematics */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubject('সাধারণ গণিত');
                      setSelectedChapters(['অধ্যায় ৩: বীজগাণিতিক রাশি', 'অধ্যায় ২: সেট ও ফাংশন']);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      subject === 'সাধারণ গণিত'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <Calculator className="w-5 h-5" />
                      </div>
                      {subject === 'সাধারণ গণিত' && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">সাধারণ গণিত (Mathematics)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">১৭টি এনসিটিবি অধ্যায় • বাস্তব সংখ্যা, বীজগণিত, জ্যামিতি ও পরিসংখ্যান</div>
                  </button>

                  {/* Physics */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubject('পদার্থবিজ্ঞান');
                      setSelectedChapters(['অধ্যায় ১: ভৌত রাশি ও পরিমাপ', 'অধ্যায় ২: গতি (Motion)']);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      subject === 'পদার্থবিজ্ঞান'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
                        <Atom className="w-5 h-5" />
                      </div>
                      {subject === 'পদার্থবিজ্ঞান' && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">পদার্থবিজ্ঞান (Physics)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">১৪টি এনসিটিবি অধ্যায় • বল, গতি, কাজ, বিদ্যুৎ ও আলো</div>
                  </button>

                  {/* Chemistry */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubject('রসায়ন');
                      setSelectedChapters(['অধ্যায় ৩: পদার্থের গঠন (পরমাণুর মডেল ও ইলেকট্রন বিন্যাস)', 'অধ্যায় ৪: পর্যায় সারণি']);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      subject === 'রসায়ন'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                      {subject === 'রসায়ন' && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">রসায়ন (Chemistry)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">১২টি এনসিটিবি অধ্যায় • পদার্থের গঠন, পর্যায় সারণি, বন্ধন ও বিক্রিয়া</div>
                  </button>

                  {/* Biology */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubject('জীববিজ্ঞান');
                      setSelectedChapters(['অধ্যায় ২: জীবকোষ ও টিস্যু', 'অধ্যায় ৩: কোষ বিভাজন (মাইটোসিস ও মিয়োসিস)']);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      subject === 'জীববিজ্ঞান'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                        <Dna className="w-5 h-5" />
                      </div>
                      {subject === 'জীববিজ্ঞান' && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">জীববিজ্ঞান (Biology)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">১৪টি এনসিটিবি অধ্যায় • জীবকোষ, বংশগতি, শ্বসন ও মানব শারীরতত্ত্ব</div>
                  </button>

                  {/* All 4 Subjects Combined */}
                  <button
                    type="button"
                    onClick={() => {
                      setSubject('সকল বিষয়');
                      setSelectedChapters([
                        'অধ্যায় ৩: বীজগাণিতিক রাশি',
                        'অধ্যায় ২: গতি (Motion)',
                        'অধ্যায় ৪: পর্যায় সারণি',
                        'অধ্যায় ২: জীবকোষ ও টিস্যু',
                      ]);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all sm:col-span-2 ${
                      subject === 'সকল বিষয়' || subject === 'উভয় বিষয়'
                        ? 'bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-cyan-50/90 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                          <Calculator className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center">
                          <Atom className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                          <Dna className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          ৪টি মূল বিষয় সমন্বিত (Full Science Combo)
                        </span>
                      </div>
                      {(subject === 'সকল বিষয়' || subject === 'উভয় বিষয়') && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">সকল বিষয় (গণিত, পদার্থ, রসায়ন ও জীব)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">এসএসসি বিজ্ঞানের ৫৭টি অধ্যায় থেকে পূর্ণাঙ্গ মিশ্র মডেল টেস্ট</div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Select Chapters */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#0F172A]">
                      {lang === 'bn' ? '৩. অধ্যায়সমূহ নির্বাচন করুন' : '3. Select Chapters'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'bn' ? 'এক বা একাধিক অধ্যায় নির্বাচন করুন' : 'Multi-select chapters to include'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedChapters.length === availableChapters.length) {
                        setSelectedChapters([]);
                      } else {
                        setSelectedChapters([...availableChapters]);
                      }
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    {selectedChapters.length === availableChapters.length ? 'সব বাদ দিন' : 'সবগুলো নির্বাচন'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableChapters.map((ch) => {
                    const isSelected = selectedChapters.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChapter(ch)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-1 ring-blue-500'
                            : 'border-slate-200 hover:border-blue-200 text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{ch}</div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Question Source */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-black text-[#0F172A]">
                    {lang === 'bn' ? '৪. প্রশ্নের উৎস নির্বাচন' : '4. Question Source'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'bn' ? 'প্রশ্নের ধরন ও রেফারেন্স বেছে নিন' : 'Choose board original or AI generated practice'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setQuestionSource('board')}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      questionSource === 'board'
                        ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-[#0F172A]">বোর্ডের আসল প্রশ্ন (Board Original Questions)</div>
                      <div className="text-xs text-slate-500">ঢাকা, যশোর, রাজশাহীসহ শীর্ষ শিক্ষা বোর্ডের পূর্ববর্তী পরীক্ষার প্রশ্ন</div>
                    </div>
                    {questionSource === 'board' && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuestionSource('ai')}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      questionSource === 'ai'
                        ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-[#0F172A]">AI তৈরি অনুশীলনী প্রশ্ন (AI Pattern Practice)</div>
                      <div className="text-xs text-slate-500">বোর্ড প্যাটার্ন অনুসারে তৈরি নতুন নতুন প্রশ্ন</div>
                    </div>
                    {questionSource === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuestionSource('all')}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      questionSource === 'all'
                        ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-[#0F172A]">বোর্ড + AI মিশ্রিত প্রশ্ন (Balanced Mix - Recommended)</div>
                      <div className="text-xs text-slate-500">বোর্ডের প্রশ্ন ও এআই অনুশীলনী প্রশ্নের নিখুঁত সংমিশ্রণ</div>
                    </div>
                    {questionSource === 'all' && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Honest Board Source Status Note */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">একাডেমিক স্বচ্ছতা নীতি:</strong> ExamDNA BD কাল্পনিক কোনো প্রশ্নকে "বোর্ডের প্রশ্ন" বলে দাবি করে না। ২০১৮–২০২৫ সালের বোর্ড প্রশ্ন ব্যাংক নিয়মিত ভেরিফিকেশন পাইপলাইনের মাধ্যমে আপডেট হচ্ছে। ২০২১ সালে সাধারণ গণিতে কোনো বোর্ড পরীক্ষা অনুষ্ঠিত হয়নি।
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Question Count */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-black text-[#0F172A]">
                    {lang === 'bn' ? '৫. মোট প্রশ্নের সংখ্যা' : '5. Total Question Count'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'bn' ? 'পরীক্ষায় কতটি প্রশ্ন সমাধান করতে চান?' : 'Select number of questions in this exam'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[10, 20, 30, 35, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setCount(num);
                        setDuration(Math.max(10, Math.round(num * 1.2)));
                      }}
                      className={`p-4 sm:p-5 rounded-2xl border text-center transition-all ${
                        count === num
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-blue-200 bg-white'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono-numbers">{num}</div>
                      <div className="text-xs font-semibold text-slate-500 mt-1">
                        {lang === 'bn' ? `${num}টি MCQ` : `${num} MCQs`}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Real-time Availability Feedback */}
                {availability && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                      availability.isSufficient
                        ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-800'
                        : 'bg-amber-50/80 border-amber-200/80 text-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {availability.isSufficient ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span>
                        {availability.isSufficient
                          ? `উপলব্ধ: নির্বাচিত ফিল্টারে মোট ${availability.availableCount}টি অনুমোদিত প্রশ্ন রয়েছে (অনুরোধকৃত: ${count}টি)।`
                          : `সতর্কতা: নির্বাচিত বিষয়ের জন্য বর্তমানে ${availability.availableCount}টি প্রশ্ন পাওয়া যাচ্ছে (অনুরোধকৃত: ${count}টি)।`}
                      </span>
                    </div>
                    <span className="font-mono-numbers font-bold shrink-0">
                      {availability.availableCount} / {count}
                    </span>
                  </div>
                )}

                {/* Custom count input */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-800">কাস্টম সংখ্যা নির্ধারণ (Custom Count)</div>
                    <div className="text-[11px] text-slate-500">আপনার প্রয়োজনমতো ৫ থেকে ১০০ টি পর্যন্ত প্রশ্ন বেছে নিন</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={count}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 5 && val <= 100) {
                          setCount(val);
                          setDuration(Math.max(10, Math.round(val * 1.2)));
                        }
                      }}
                      className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-sm text-slate-900"
                    />
                    <span className="text-xs text-slate-500 font-semibold">টি</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Difficulty */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-black text-[#0F172A]">
                    {lang === 'bn' ? '৬. কঠিনতার স্তর' : '6. Difficulty Level'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'bn' ? 'আপনার বর্তমান প্রস্তুতির সাথে মানানসই স্তর বেছে নিন' : 'Choose challenge level'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDifficulty('adaptive')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      difficulty === 'adaptive'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="text-sm font-bold text-blue-600 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>অ্যাডাপটিভ (Adaptive - Recommended)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      আপনার বিগত পারফরম্যান্স ও ভুলের ভিত্তিতে স্বয়ংক্রিয় সমন্বয়
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDifficulty('easy')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      difficulty === 'easy'
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="text-sm font-bold text-emerald-600">সহজ (Easy)</div>
                    <p className="text-xs text-slate-500 mt-1">
                      মৌলিক সংজ্ঞা, সাধারণ সূত্র ও সরাসরি প্রয়োগ
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDifficulty('medium')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      difficulty === 'medium'
                        ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="text-sm font-bold text-amber-600">মাঝারি (Medium - Board Standard)</div>
                    <p className="text-xs text-slate-500 mt-1">
                      বোর্ড পরীক্ষার প্রকৃত মানসম্পন্ন গাণিতিক প্রশ্ন
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDifficulty('hard')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      difficulty === 'hard'
                        ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="text-sm font-bold text-purple-600">কঠিন (Advanced Challenge)</div>
                    <p className="text-xs text-slate-500 mt-1">
                      বহুধাপীয় হিসাব ও শীর্ষ কলেজ টেস্ট পেপার প্রশ্ন
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Duration */}
            {currentStep === 7 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-black text-[#0F172A]">
                    {lang === 'bn' ? '৭. সময়সীমা নির্ধারণ' : '7. Exam Duration'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'bn' ? 'পরীক্ষার জন্য বরাদ্দকৃত সময়' : 'Time limit for this test'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[10, 15, 20, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`p-6 rounded-2xl border text-center transition-all ${
                        duration === mins
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-blue-200'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-black text-[#0F172A] font-mono-numbers">{mins}</div>
                      <div className="text-xs font-semibold text-slate-500 mt-1">
                        {lang === 'bn' ? `${mins} মিনিট` : `${mins} Mins`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 8: Review & Start */}
            {currentStep === 8 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-black text-[#0F172A]">
                    {lang === 'bn' ? '৮. কনফিগারেশন যাচাই ও শুরু' : '8. Review & Start Exam'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'bn' ? 'সবকিছু ঠিক থাকলে এখনই পরীক্ষা শুরু করুন' : 'Confirm your test parameters and begin'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">{lang === 'bn' ? 'লেভেল:' : 'Level:'}</span>
                    <span className="font-bold text-[#0F172A]">{level}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">{lang === 'bn' ? 'বিষয়:' : 'Subject:'}</span>
                    <span className="font-bold text-[#0F172A]">{subject}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">{lang === 'bn' ? 'নির্বাচিত অধ্যায়:' : 'Chapters:'}</span>
                    <span className="font-bold text-[#0F172A] text-right">
                      {selectedChapters.length > 0 ? selectedChapters.join(', ') : 'সকল অধ্যায়'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">{lang === 'bn' ? 'মোট প্রশ্ন:' : 'Total Questions:'}</span>
                    <span className="font-bold text-blue-600 font-mono-numbers">{count} টি</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">{lang === 'bn' ? 'সময়সীমা:' : 'Duration:'}</span>
                    <span className="font-bold text-blue-600 font-mono-numbers">{duration} মিনিট</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === 'bn' ? 'অ্যালগরিদম সুরক্ষা:' : 'Repeat Guard:'}</span>
                    <span className="font-bold text-emerald-600">সক্রিয় (সাম্প্রতিক প্রশ্ন বাদ দেওয়া হবে)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Step Actions */}
            <div className="pt-8 border-t border-slate-100 flex items-center justify-between mt-auto">
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{currentStep === 1 ? (lang === 'bn' ? 'বাতিল' : 'Cancel') : (lang === 'bn' ? 'পূর্ববর্তী ধাপ' : 'Previous')}</span>
              </button>

              <button
                type="button"
                disabled={isCheckingAvailability}
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  {currentStep === 8
                    ? (lang === 'bn' ? 'পরীক্ষা শুরু করুন' : 'Start Exam')
                    : (lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
        )}

      </div>

      {/* Insufficient Questions Interactive Modal */}
      {isInsufficientModalOpen && availability && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#0F172A]">
                  {lang === 'bn' ? 'অনুরোধকৃত প্রশ্নসংখ্যার চেয়ে কম প্রশ্ন উপলব্ধ' : 'Insufficient Approved Questions'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {availability.message || `আপনার নির্বাচিত বিষয়ের জন্য বর্তমানে ${availability.availableCount}টি প্রশ্ন পাওয়া যাচ্ছে।`}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">অনুরোধকৃত সংখ্যা:</span>
                <span className="font-bold text-slate-800 font-mono-numbers">{availability.requestedCount} টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">বর্তমানে অনুমোদিত মোট প্রশ্ন:</span>
                <span className="font-black text-amber-600 font-mono-numbers">{availability.availableCount} টি</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 leading-relaxed">
                ExamDNA BD কোনো ভুয়া বা যাচাইহীন প্রশ্ন দিয়ে কৃত্রিমভাবে প্রশ্নের সংখ্যা পূরণ করে না। আপনি নিচের ৩টি বিকল্পের যেকোনো একটি বেছে নিতে পারেন:
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={!availability.availableCount || isCheckingAvailability}
                onClick={handleStartPartial}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>উপলব্ধ {availability.availableCount}টি প্রশ্ন নিয়ে এখনই পরীক্ষা শুরু করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleChangeChapters}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>বিষয় বা আরও অধ্যায় যুক্ত করুন (Change Subjects / Chapters)</span>
                <BookOpen className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleChooseSmaller}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>ছোট আকারের পরীক্ষা নির্বাচন করুন (Choose Smaller Count)</span>
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

