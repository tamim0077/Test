import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  X,
  HelpCircle,
  Lightbulb,
  Award
} from 'lucide-react';
import type { UserMistakeEntry } from '../types';
import type { Question } from '../utils/examScoring';

interface DailyActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: UserMistakeEntry[];
  availableQuestions: Question[];
  onCompleteActivity?: (type: string, score: number) => void;
}

export const DailyActivitiesModal: React.FC<DailyActivitiesModalProps> = ({
  isOpen,
  onClose,
  mistakes,
  availableQuestions,
  onCompleteActivity,
}) => {
  const [activeTab, setActiveTab] = useState<'daily10' | 'detective' | 'rematch'>('daily10');

  // ----------------------------------------------------
  // Activity A: আজকের ১০ মিনিট (Daily 10 Min Practice)
  // ----------------------------------------------------
  const [dailyIndex, setDailyIndex] = useState(0);
  const [dailyAnswers, setDailyAnswers] = useState<Record<number, number>>({});
  const [dailySubmitted, setDailySubmitted] = useState(false);

  // Take 5 questions: 2 due mistakes (if any) + fresh questions
  const dailyQuestions = React.useMemo(() => {
    const list: Question[] = [];
    if (mistakes && mistakes.length > 0) {
      list.push(...mistakes.slice(0, 2).map((m) => m.question));
    }
    const needed = 5 - list.length;
    const fillers = availableQuestions.slice(0, Math.max(0, needed));
    return [...list, ...fillers].slice(0, 5);
  }, [mistakes, availableQuestions]);

  // ----------------------------------------------------
  // Activity B: ভুলের গোয়েন্দা (Find the Mistake)
  // ----------------------------------------------------
  const detectiveProblems = [
    {
      id: 'det-01',
      subject: 'সাধারণ গণিত',
      topic: 'উৎপাদকে বিশ্লেষণ ও দ্বিঘাত সমীকরণ',
      question: 'একটি গাড়ি ও ট্রেনের গতি সমীকরণ সমাধানে নিচের সমাধানটির কোন ধাপে ভুল রয়েছে?',
      problemStatement: 'সমীকরণ: x² + 6x - 16 = 0 সমাধান করো।',
      steps: [
        { num: 1, text: 'প্রদত্ত সমীকরণ: x² + 6x - 16 = 0', isError: false },
        { num: 2, text: 'মধ্যপদ বিভাজন (Middle-term): ১৬ এর উৎপাদক ৮ ও ২ নির্বাচন করা হলো যেন ৮ - ২ = ৬ হয়।', isError: false },
        { num: 3, text: 'বিভাজন রূপ: x² + 8x - 2x + 16 = 0 (চিহ্ন পরিবর্তন করা হলো)', isError: true },
        { num: 4, text: 'অতএব: (x + 8)(x - 2) = 0 সুতরাং x = 2, -8', isError: false },
      ],
      explanation: 'ধাপ ৩-এ ভুল হয়েছে: -16 এর স্থলে ভুলক্রমে +16 লেখা হয়েছিল। সঠিক মধ্যপদ বিভাজন: x² + 8x - 2x - 16 = 0।',
    },
    {
      id: 'det-02',
      subject: 'পদার্থবিজ্ঞান',
      topic: 'গতির সমীকরণ ও দূরত্ব গণনা',
      question: 'স্থির অবস্থান থেকে 2 ms⁻² সুষম ত্বরণে চলা একটি গাড়ির 5 সেকেন্ডে অতিক্রান্ত দূরত্ব নির্ণয়ে কোন ধাপে ভুল?',
      problemStatement: 'আদিবেগ u = 0, ত্বরণ a = 2 ms⁻², সময় t = 5 s। দূরত্ব s = ?',
      steps: [
        { num: 1, text: 'গতির সূত্র প্রয়োগ: s = ut + ½at²', isError: false },
        { num: 2, text: 'আদিবেগ u = 0 হওয়ায়: s = 0 + ½at²', isError: false },
        { num: 3, text: 'মান বসিয়ে: s = ½ × 2 × (2 × 5) = 10 m (t² এর স্থানে 2t গুণ করা হয়েছে)', isError: true },
        { num: 4, text: 'ফলাফল: অতিক্রান্ত দূরত্ব s = 10 m', isError: false },
      ],
      explanation: 'ধাপ ৩-এ ভুল হয়েছে: t² এর স্থলে 2 × 5 = 10 গুণ করা হয়েছিল। প্রকৃতপক্ষে t² = 5² = 25। সঠিক দূরত্ব s = ½ × 2 × 25 = 25 m।',
    },
    {
      id: 'det-03',
      subject: 'রসায়ন',
      topic: 'মোলের ধারণা ও আণবিক ভর গণনা',
      question: 'সালফিউরিক এসিডের (H₂SO₄) আণবিক ভর নির্ণয়ের নিচের সমাধানে কোন ধাপে ভুল আছে?',
      problemStatement: 'H = 1, S = 32, O = 16 হলে H₂SO₄ এর আণবিক ভর কত?',
      steps: [
        { num: 1, text: 'পরমাণুসমূহের আপেক্ষিক পারমাণবিক ভর: H = 1, S = 32, O = 16', isError: false },
        { num: 2, text: 'সংকেত অনুসারে: আণবিক ভর = (1 × 2) + 32 + (16 × 4)', isError: false },
        { num: 3, text: 'যোগফল গণনা: 2 + 32 + 48 = 82 (১৬ × ৪ এর মান ৪৮ ধরা হয়েছে)', isError: true },
        { num: 4, text: 'সুতরাং H₂SO₄ এর আণবিক ভর = 82', isError: false },
      ],
      explanation: 'ধাপ ৩-এ ভুল হয়েছে: 16 × 4 = 64, কিন্তু এখানে 48 লেখা হয়েছে। সঠিক গণনা: 2 + 32 + 64 = 98।',
    },
  ];

  const [detIndex, setDetIndex] = useState(0);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [detRevealed, setDetRevealed] = useState(false);

  // ----------------------------------------------------
  // Activity C: ভুলের রিম্যাচ (Mistake Rematch)
  // ----------------------------------------------------
  const [rematchIndex, setRematchIndex] = useState(0);
  const [rematchSelectedOpt, setRematchSelectedOpt] = useState<number | null>(null);
  const [rematchAnswered, setRematchAnswered] = useState(false);

  const rematchQuestions = React.useMemo(() => {
    if (mistakes && mistakes.length > 0) {
      return mistakes.map((m) => m.question);
    }
    return availableQuestions.slice(0, 3);
  }, [mistakes, availableQuestions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-blue-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
                দৈনন্দিন ইন্টারঅ্যাক্টিভ অ্যাক্টিভিটি (Daily Micro-Learning)
              </h2>
              <p className="text-xs text-slate-500">
                স্বল্প সময়ে কার্যকর রিভিশন ও কনসেপ্ট ক্লিয়ারিং
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Nav Tabs */}
        <div className="grid grid-cols-3 p-2 bg-slate-50 border-b border-slate-200/80 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setActiveTab('daily10')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'daily10'
                ? 'bg-white text-blue-600 shadow-2xs border border-blue-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>আজকের ১০ মিনিট</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('detective')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'detective'
                ? 'bg-white text-indigo-600 shadow-2xs border border-indigo-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>ভুলের গোয়েন্দা</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rematch')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'rematch'
                ? 'bg-white text-emerald-600 shadow-2xs border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ভুলের রিম্যাচ</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: আজকের ১০ মিনিট */}
          {activeTab === 'daily10' && (
            <div className="space-y-5">
              {!dailySubmitted ? (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                    <span className="text-blue-700">
                      প্রশ্ন {dailyIndex + 1} / {dailyQuestions.length}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>লক্ষ্য: ১০ মিনিট</span>
                    </span>
                  </div>

                  {dailyQuestions[dailyIndex] && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] font-bold text-blue-600 mb-1">
                          {dailyQuestions[dailyIndex].subject} • {dailyQuestions[dailyIndex].chapter}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                          {dailyQuestions[dailyIndex].questionText}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {dailyQuestions[dailyIndex].options.map((opt, idx) => {
                          const isSelected = dailyAnswers[dailyIndex] === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setDailyAnswers((prev) => ({ ...prev, [dailyIndex]: idx }))}
                              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                              }`}
                            >
                              <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                                {idx === 0 ? 'ক' : idx === 1 ? 'খ' : idx === 2 ? 'গ' : 'ঘ'}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          disabled={dailyIndex === 0}
                          onClick={() => setDailyIndex((prev) => prev - 1)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 cursor-pointer"
                        >
                          পূর্ববর্তী
                        </button>

                        {dailyIndex < dailyQuestions.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => setDailyIndex((prev) => prev + 1)}
                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            পরবর্তী
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDailySubmitted(true)}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
                          >
                            অনুশীলন শেষ করো
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">আজকের ১০ মিনিট সেশন সম্পন্ন!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    নিয়মিত ১০ মিনিটের অনুশীলন তোমার রিভিশন ও দীর্ঘমেয়াদী স্মৃতিশক্তিকে বহুগুণ বাড়িয়ে দেয়।
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDailySubmitted(false);
                        setDailyIndex(0);
                        setDailyAnswers({});
                        onClose();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                    >
                      ড্যাশবোর্ডে ফিরে যান
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ভুলের গোয়েন্দা */}
          {activeTab === 'detective' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
                <Search className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">ভুলের গোয়েন্দা চ্যালেঞ্জ</div>
                  <div className="text-[11px] text-indigo-700">
                    নিচের সমাধানটিতে ইচ্ছাকৃতভাবে একটি ভুল ধাপ রাখা হয়েছে। সতর্কতার সাথে লক্ষ্য করে চিহ্নিত করো কোন ধাপে ভুল রয়েছে।
                  </div>
                </div>
              </div>

              {detectiveProblems[detIndex] && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-indigo-600">
                      {detectiveProblems[detIndex].subject} • {detectiveProblems[detIndex].topic}
                    </div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {detectiveProblems[detIndex].question}
                    </div>
                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 font-mono">
                      {detectiveProblems[detIndex].problemStatement}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">কোন ধাপটিতে ভুল রয়েছে? সিলেক্ট করো:</div>
                    {detectiveProblems[detIndex].steps.map((st) => {
                      const isSelected = selectedStep === st.num;
                      let stepStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';

                      if (detRevealed) {
                        if (st.isError) {
                          stepStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400 font-bold';
                        } else if (isSelected && !st.isError) {
                          stepStyle = 'bg-slate-100 border-slate-300 text-slate-500 line-through';
                        }
                      } else if (isSelected) {
                        stepStyle = 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500 font-bold';
                      }

                      return (
                        <button
                          key={st.num}
                          type="button"
                          disabled={detRevealed}
                          onClick={() => setSelectedStep(st.num)}
                          className={`w-full p-3.5 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-start gap-3 ${stepStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[11px] shrink-0 text-slate-700">
                            {st.num}
                          </span>
                          <span className="flex-1 leading-relaxed">{st.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {detRevealed && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5 animate-in fade-in">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        <span>গোয়েন্দা বিশ্লেষণ ও সমাধান:</span>
                      </div>
                      <p className="text-amber-800 leading-relaxed pl-5">
                        {detectiveProblems[detIndex].explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {!detRevealed ? (
                      <button
                        type="button"
                        disabled={selectedStep === null}
                        onClick={() => setDetRevealed(true)}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer shadow-md shadow-indigo-500/20"
                      >
                        উত্তর পরীক্ষা করুন (Check Step)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStep(null);
                          setDetRevealed(false);
                          setDetIndex((prev) => (prev + 1) % detectiveProblems.length);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                      >
                        পরবর্তী ধাঁধা (Next Problem)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ভুলের রিম্যাচ */}
          {activeTab === 'rematch' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">ভুলের রিম্যাচ (Mistake Rematch)</div>
                  <div className="text-[11px] text-emerald-700">
                    পূর্বে ভুল হওয়া কনসেপ্টের ওপর একই ধরনের বিকল্প প্রশ্ন সমাধান করে তোমার দখল যাচাই করো।
                  </div>
                </div>
              </div>

              {rematchQuestions[rematchIndex] ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-bold text-emerald-700 mb-1">
                      {rematchQuestions[rematchIndex].subject} • {rematchQuestions[rematchIndex].chapter}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-relaxed">
                      {rematchQuestions[rematchIndex].questionText}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {rematchQuestions[rematchIndex].options.map((opt, idx) => {
                      const isSelected = rematchSelectedOpt === idx;
                      const isCorrect = idx === rematchQuestions[rematchIndex].correctAnswerIndex;
                      let btnStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';

                      if (rematchAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-100 border-rose-400 text-rose-900 line-through';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 font-bold';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={rematchAnswered}
                          onClick={() => setRematchSelectedOpt(idx)}
                          className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center gap-2 ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {idx === 0 ? 'ক' : idx === 1 ? 'খ' : idx === 2 ? 'গ' : 'ঘ'}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {rematchAnswered && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5 animate-in fade-in">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>যাচাইকৃত সমাধান:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-5">
                        {rematchQuestions[rematchIndex].explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {!rematchAnswered ? (
                      <button
                        type="button"
                        disabled={rematchSelectedOpt === null}
                        onClick={() => setRematchAnswered(true)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer shadow-md shadow-emerald-500/20"
                      >
                        উত্তর জমা দিন
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRematchSelectedOpt(null);
                          setRematchAnswered(false);
                          setRematchIndex((prev) => (prev + 1) % rematchQuestions.length);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                      >
                        পরবর্তী রিম্যাচ প্রশ্ন
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  বর্তমানে অনুশীলনের জন্য কোনো মিস্টেক রেকর্ড পাওয়া যায়নি।
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
