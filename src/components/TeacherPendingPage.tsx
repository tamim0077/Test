import React, { useState } from 'react';
import {
  Clock,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Building,
  Mail,
  User,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { UserAccount } from '../types';
import { type Language } from '../utils/i18n';

interface TeacherPendingPageProps {
  currentUser: UserAccount;
  lang: Language;
  onRefreshStatus: () => Promise<void>;
  onLogout: () => void;
}

export const TeacherPendingPage: React.FC<TeacherPendingPageProps> = ({
  currentUser,
  lang,
  onRefreshStatus,
  onLogout,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setStatusMessage(null);
    try {
      await onRefreshStatus();
      setStatusMessage(lang === 'bn' ? 'স্ট্যাটাস আপডেট করা হয়েছে।' : 'Status refreshed.');
    } catch {
      setStatusMessage(lang === 'bn' ? 'স্ট্যাটাস চেক ব্যর্থ হয়েছে।' : 'Failed to refresh status.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md">
            DNA
          </div>
          <div>
            <div className="text-base font-black text-[#0F172A] flex items-center gap-1.5">
              <span>ExamDNA BD</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {lang === 'bn' ? 'শিক্ষক অনুমোদন বাকি' : 'Teacher Pending'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              {currentUser.name} &bull; {currentUser.institution || 'শিক্ষক'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-amber-200 shadow-xl shadow-amber-500/5 overflow-hidden">
          
          {/* Header Accent */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
              <Clock className="w-7 h-7 text-white animate-pulse" />
            </div>
            <h1 className="text-xl font-black">
              {lang === 'bn' ? 'আপনার শিক্ষক অ্যাকাউন্টটি অনুমোদনের অপেক্ষায় রয়েছে' : 'Teacher Account Pending Approval'}
            </h1>
            <p className="text-xs text-amber-100 mt-1">
              {lang === 'bn'
                ? 'অ্যাডমিন ভেরিফিকেশন সম্পন্ন না হওয়া পর্যন্ত শিক্ষক প্যানেলের ব্যাচ ও পরীক্ষা তৈরির ফিচার স্থগিত থাকবে।'
                : 'Batch creation and exam management are locked until administrative approval.'}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Notification alert */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">
                  {lang === 'bn' ? 'নিরাপত্তা ও একাডেমিক সততা নীতি' : 'Academic Verification Policy'}
                </p>
                <p className="leading-relaxed text-amber-800">
                  {lang === 'bn'
                    ? 'শিক্ষার্থীদের নিরাপত্তা এবং পরীক্ষার বিশ্বাসযোগ্যতা বজায় রাখতে শিক্ষকদের শিক্ষা প্রতিষ্ঠান ও পরিচয় যাচাইয়ের পর অ্যাকাউন্ট অনুমোদন করা হয়।'
                    : 'To ensure student security and examination authenticity, teacher credentials are authenticated before activation.'}
                </p>
              </div>
            </div>

            {/* Teacher Details Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'আপনার প্রদত্ত বিবরণ' : 'Submitted Details'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">নাম:</span>
                    <span className="font-bold">{currentUser.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">ইমেইল:</span>
                    <span className="font-bold truncate max-w-[180px]">{currentUser.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Building className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">প্রতিষ্ঠান:</span>
                    <span className="font-bold">{currentUser.institution || 'সাধারণ শিক্ষক'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">বিষয়:</span>
                    <span className="font-bold">{currentUser.subject || 'সাধারণ গণিত'}</span>
                  </div>
                </div>
              </div>
            </div>

            {statusMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs font-medium text-center">
                {statusMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={isRefreshing}
                onClick={handleRefresh}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>
                  {isRefreshing
                    ? (lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Checking...')
                    : (lang === 'bn' ? 'অনুমোদন স্ট্যাটাস রিফ্রেশ করুন' : 'Refresh Approval Status')}
                </span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 text-xs font-bold transition-all border border-slate-200 hover:border-red-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        ExamDNA BD &bull; {lang === 'bn' ? 'শিক্ষক অ্যাকাউন্ট ভেরিফিকেশন' : 'Teacher Verification Security'}
      </footer>
    </div>
  );
};
