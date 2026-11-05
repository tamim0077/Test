import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { Check, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

interface StudentOnboardingProps {
  onComplete: (profile: StudentProfile) => void;
  onCancel: () => void;
}

export const StudentOnboarding: React.FC<StudentOnboardingProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const [examLevel, setExamLevel] = useState<'SSC' | 'HSC' | 'Admission'>('SSC');
  const [track, setTrack] = useState<'science' | 'business' | 'humanities'>('science');
  const [examYear, setExamYear] = useState<'2027' | '2028'>('2027');
  const [subject, setSubject] = useState<string>('সাধারণ গণিত');
  const [nickname, setNickname] = useState<string>('আবির হাসান');

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = nickname.trim() || 'শিক্ষার্থী';
    const profile: StudentProfile = {
      id: 'std-' + Date.now(),
      name: finalName,
      role: 'student',
      track,
      examLevel,
      examYear,
      activeSubject: subject,
      streakDays: 3,
    };
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-blue-600">অনবোর্ডিং ধাপ {step} / ৫</div>
            <div className="text-lg font-bold text-slate-900">
              {step === 1 && 'পরীক্ষার স্তর নির্বাচন করো'}
              {step === 2 && 'বিভাগ / গ্রুপ নির্বাচন করো'}
              {step === 3 && 'পরীক্ষার বছর নির্বাচন করো'}
              {step === 4 && 'প্রাথমিক বিষয় নির্বাচন করো'}
              {step === 5 && 'তোমার প্রোফাইল তৈরি করো'}
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 rounded"
          >
            বাতিল
          </button>
        </div>

        {/* Step 1: Exam Level */}
        {step === 1 && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => { setExamLevel('SSC'); setStep(2); }}
              className="w-full text-left p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900 text-base">এসএসসি (SSC Exam)</div>
                <div className="text-xs text-slate-600">জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড অনুমোদিত সিলেবাস</div>
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            </button>

            <button
              type="button"
              disabled
              className="w-full text-left p-4 rounded-2xl border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-700 text-base">এইচএসসি (HSC Exam)</div>
                <div className="text-xs text-slate-500">শীঘ্রই আসছে (Coming Soon)</div>
              </div>
            </button>

            <button
              type="button"
              disabled
              className="w-full text-left p-4 rounded-2xl border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-700 text-base">বিশ্ববিদ্যালয় ভর্তি (Admission)</div>
                <div className="text-xs text-slate-500">শীঘ্রই আসছে (Coming Soon)</div>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Track */}
        {step === 2 && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => { setTrack('science'); setStep(3); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                track === 'science' ? 'border-2 border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-slate-900">বিজ্ঞান বিভাগ (Science)</div>
              <div className="text-xs text-slate-600">পদার্থ, রসায়ন, সাধারণ ও উচ্চতর গণিত</div>
            </button>

            <button
              type="button"
              onClick={() => { setTrack('business'); setStep(3); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                track === 'business' ? 'border-2 border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-slate-900">ব্যবসায় শিক্ষা (Business Studies)</div>
              <div className="text-xs text-slate-600">হিসাববিজ্ঞান, সাধারণ গণিত ও ফিন্যান্স</div>
            </button>

            <button
              type="button"
              onClick={() => { setTrack('humanities'); setStep(3); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                track === 'humanities' ? 'border-2 border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-slate-900">মানবিক বিভাগ (Humanities)</div>
              <div className="text-xs text-slate-600">সাধারণ গণিত, ইতিহাস ও ভূগোল</div>
            </button>
          </div>
        )}

        {/* Step 3: Exam Year */}
        {step === 3 && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => { setExamYear('2027'); setStep(4); }}
              className="w-full text-left p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900">এসএসসি ২০২৭ (SSC 2027 Target)</div>
                <div className="text-xs text-slate-600">সম্পূর্ণ প্রশ্নব্যাংক ও বিশ্লেষণ লাইভ রয়েছে</div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">সক্রিয়</span>
            </button>

            <button
              type="button"
              onClick={() => { setExamYear('2028'); setStep(4); }}
              className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <div className="font-bold text-slate-900">এসএসসি ২০২৮ (SSC 2028 Early Prep)</div>
              <div className="text-xs text-slate-600">নবম শ্রেণির মৌলিক অধ্যায়সমূহ</div>
            </button>
          </div>
        )}

        {/* Step 4: Subject */}
        {step === 4 && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => { setSubject('সাধারণ গণিত'); setStep(5); }}
              className="w-full text-left p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900">সাধারণ গণিত (General Mathematics)</div>
                <div className="text-xs text-slate-600">অধ্যায় ৩: বীজগাণিতিক রাশি ও অধ্যায় ২: সেট-ফাংশন অন্তর্ভুক্ত</div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">পরীক্ষা চালু</span>
            </button>

            <button
              type="button"
              disabled
              className="w-full text-left p-4 rounded-2xl border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
            >
              <div className="font-bold text-slate-700">পদার্থবিজ্ঞান (Physics)</div>
              <div className="text-xs text-slate-500">পরবর্তী ধাপে উন্মুক্ত হবে</div>
            </button>
          </div>
        )}

        {/* Step 5: Profile Nickname & Finish */}
        {step === 5 && (
          <form onSubmit={handleFinish} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                তোমার নাম / ডাকনাম (Nickname)
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="যেমন: আবির বা তানভীর"
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                আমরা কোনো অপ্রয়োজনীয় ব্যক্তিগত তথ্য (ঠিকানা, আইডি) সংগ্রহ করি না।
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>পরীক্ষা:</span>
                <span className="font-semibold text-slate-900">{examLevel} {examYear}</span>
              </div>
              <div className="flex justify-between">
                <span>গ্রুপ:</span>
                <span className="font-semibold text-slate-900">
                  {track === 'science' ? 'বিজ্ঞান' : track === 'business' ? 'ব্যবসায় শিক্ষা' : 'মানবিক'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>সক্রিয় বিষয়:</span>
                <span className="font-semibold text-slate-900">{subject}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              <span>প্রোফাইল নিশ্চিত করে ড্যাশবোর্ডে প্রবেশ করো</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Back / Navigation controls */}
        {step > 1 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              ← পূর্ববর্তী ধাপ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
