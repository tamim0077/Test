import React from 'react';
import { X, GraduationCap, School, Check, ArrowRight } from 'lucide-react';
import type { Language } from '../utils/i18n';

interface RoleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectRole: (role: 'student' | 'teacher') => void;
  onOpenLogin: () => void;
}

export const RoleSelectModal: React.FC<RoleSelectModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectRole,
  onOpenLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-blue-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-md mx-auto mb-8 sm:mb-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <span className="font-black text-lg">DNA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            {lang === 'bn' ? 'শুরু করুন' : 'Get Started'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'bn'
              ? 'সামনে এগিয়ে যেতে আপনার ভূমিকা নির্বাচন করুন'
              : 'Choose your role to continue'}
          </p>
        </div>

        {/* Dual Cards Grid matching Screen 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Card 1: Student */}
          <div className="bg-gradient-to-b from-blue-50/50 via-white to-white rounded-3xl p-6 sm:p-7 border border-blue-200/80 shadow-md shadow-blue-500/5 hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-[#0F172A] mb-1">
                {lang === 'bn' ? 'আমি একজন শিক্ষার্থী' : 'I am a Student'}
              </h3>
              <p className="text-xs text-blue-600 font-semibold mb-5">
                {lang === 'bn' ? 'Continue as Student' : 'For SSC & HSC Candidates'}
              </p>

              <ul className="space-y-2.5 text-xs text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{lang === 'bn' ? 'পরীক্ষায় অংশগ্রহণ (Take Exams)' : 'Take Exams & Mock Tests'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{lang === 'bn' ? 'অগ্রগতি ট্র্যাকিং (Track Progress)' : 'Detailed Progress Tracking'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{lang === 'bn' ? 'ফ্রেন্ডস চ্যালেঞ্জ (Challenge Friends)' : '1v1 Live Quiz Battle'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{lang === 'bn' ? 'এআই দিয়ে দুর্বলতা দূর (Improve with AI)' : 'AI Mistake Analysis Coach'}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectRole('student')}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 group-hover:gap-3 transition-all cursor-pointer"
            >
              <span>{lang === 'bn' ? 'শিক্ষার্থী হিসেবে শুরু করুন' : 'Start as Student'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Teacher */}
          <div className="bg-gradient-to-b from-purple-50/50 via-white to-white rounded-3xl p-6 sm:p-7 border border-purple-200/80 shadow-md shadow-purple-500/5 hover:shadow-xl hover:border-purple-400 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                <School className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-[#0F172A] mb-1">
                {lang === 'bn' ? 'আমি একজন শিক্ষক' : 'I am a Teacher'}
              </h3>
              <p className="text-xs text-purple-600 font-semibold mb-5">
                {lang === 'bn' ? 'Continue as Teacher' : 'For Educators & Institutions'}
              </p>

              <ul className="space-y-2.5 text-xs text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{lang === 'bn' ? 'পরীক্ষা তৈরি করুন (Create Exams)' : 'Create Verified Exams'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{lang === 'bn' ? 'ক্লাস ও ব্যাচ পরিচালনা (Manage Batches)' : 'Manage Student Batches'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{lang === 'bn' ? 'শিক্ষার্থীদের পারফরম্যান্স ট্র্যাক (Track Performance)' : 'Real-time Class Analytics'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{lang === 'bn' ? 'প্রশ্ন ব্যাংক অ্যাক্সেস (Access Question Bank)' : 'Curated NCTB Board Bank'}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectRole('teacher')}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 group-hover:gap-3 transition-all cursor-pointer"
            >
              <span>{lang === 'bn' ? 'শিক্ষক হিসেবে শুরু করুন' : 'Start as Teacher'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            {lang === 'bn' ? 'ইতিমধ্যে একটি একাউন্ট রয়েছে? ' : 'Already have an account? '}
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              {lang === 'bn' ? 'এখানে লগইন করুন' : 'Login here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
