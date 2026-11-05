import React, { useState } from 'react';
import type { StudentProfile, UserMistakeEntry } from '../types';
import { getActiveDisplayStreak } from '../utils/streakCalculator';
import {
  Sparkles,
  Flame,
  Target,
  BrainCircuit,
  BookOpen,
  Award,
  Users,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  Search,
  Bell,
  Calculator,
  Atom,
  Swords,
  Trophy,
  BarChart2,
  Check,
  Play,
  Star,
  ChevronRight,
  LayoutDashboard,
  FileText,
  User,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface StudentDashboardProps {
  profile: StudentProfile;
  currentUser?: any;
  mistakes: UserMistakeEntry[];
  totalExamsCount: number;
  averageAccuracy: number;
  onStartDiagnostic: () => void;
  onStartAdaptive: () => void;
  onOpenMistakes: () => void;
  onOpenChallenge: () => void;
  onOpenAiCoach: () => void;
  onOpenDailyActivities?: () => void;
  onJoinBatch: (code: string) => Promise<boolean>;
  onNavigateToSetup?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  profile,
  currentUser,
  mistakes = [],
  totalExamsCount = 0,
  averageAccuracy = 0,
  onStartDiagnostic,
  onStartAdaptive,
  onOpenMistakes,
  onOpenChallenge,
  onOpenAiCoach,
  onOpenDailyActivities,
  onJoinBatch,
  onNavigateToSetup,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exams' | 'mistakes' | 'adaptive' | 'challenge' | 'progress' | 'achievements' | 'profile'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [batchCodeInput, setBatchCodeInput] = useState('');
  const [joinMsg, setJoinMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const safeMistakes = Array.isArray(mistakes) ? mistakes : [];
  const dueTodayCount = safeMistakes.filter(m => m?.nextReviewAt && new Date(m.nextReviewAt).getTime() <= Date.now()).length;

  const userKey = currentUser?.id || profile?.id || 'guest';
  const avatarPhoto = currentUser?.photoUrl || profile?.photoUrl || (typeof window !== 'undefined' ? localStorage.getItem(`examdna_student_photo_${userKey}`) : null);
  
  const storedStreak = currentUser?.streakDays ?? profile?.streakDays ?? 0;
  const lastActivity = currentUser?.lastActivityDate ?? profile?.lastActivityDate;
  const activeStreak = getActiveDisplayStreak(storedStreak, lastActivity);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCodeInput.trim()) return;
    try {
      const ok = await onJoinBatch(batchCodeInput.trim());
      if (ok) {
        setJoinMsg({ text: 'সফলভাবে ব্যাচে যুক্ত হয়েছো!', type: 'success' });
        setBatchCodeInput('');
      } else {
        setJoinMsg({ text: 'ব্যাচ কোডটি পাওয়া যায়নি।', type: 'error' });
      }
    } catch {
      setJoinMsg({ text: 'সংযোগ বিচ্ছিন্ন। পুনরায় চেষ্টা করুন।', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      
      {/* ============================================================== */}
      {/* 1. LEFT VERTICAL SIDEBAR (Matching Screen 5)                   */}
      {/* ============================================================== */}
      <aside className="w-full lg:w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/25">
              DNA
            </div>
            <div>
              <div className="text-base font-black text-[#0F172A] flex items-center gap-1">
                <span>ExamDNA</span>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                  BD
                </span>
              </div>
              <div className="text-[10px] font-medium text-slate-400">Student Portal</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50/80 text-blue-600 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onNavigateToSetup) onNavigateToSetup();
                else onStartDiagnostic();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all text-left"
            >
              <FileText className="w-4 h-4" />
              <span>Take Exam</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exams')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'exams'
                  ? 'bg-blue-50/80 text-blue-600 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>My Exams</span>
            </button>

            <button
              type="button"
              onClick={onOpenMistakes}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Mistake Notebook</span>
              </div>
              {safeMistakes.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold flex items-center justify-center">
                  {safeMistakes.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onStartAdaptive}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all text-left"
            >
              <BrainCircuit className="w-4 h-4 text-cyan-600" />
              <span>Adaptive Practice</span>
            </button>

            <button
              type="button"
              onClick={onOpenChallenge}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all text-left"
            >
              <Swords className="w-4 h-4 text-amber-600" />
              <span>Friend Challenge</span>
            </button>

            <button
              type="button"
              onClick={onOpenAiCoach}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all text-left"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Study Coach</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('achievements')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                activeTab === 'achievements'
                  ? 'bg-blue-50/80 text-blue-600 border border-blue-200/80'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Achievements</span>
            </button>
          </nav>
        </div>

        {/* User Card / Streak at Bottom of Sidebar */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                {avatarPhoto ? (
                  <img src={avatarPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  (currentUser?.name || profile.name || 'S').charAt(0)
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A] leading-tight truncate max-w-[100px]">
                  {currentUser?.name || profile.name || 'শিক্ষার্থী'}
                </div>
                <div className="text-[10px] text-slate-400">SSC 2027</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{currentUser?.streakDays ?? profile.streakDays ?? 1}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MAIN DASHBOARD CONTENT AREA                                 */}
      {/* ============================================================== */}
      <div className="flex-1 p-5 sm:p-8 space-y-7 overflow-y-auto">
        
        {/* Top Header Bar: Search, Notification, User Profile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          {/* Welcome Text */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
              <span>স্বাগতম, {currentUser?.name || profile.name || 'শিক্ষার্থী'}!</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              তোমার ভুলই তোমার পরবর্তী শক্তি — নিয়মিত অনুশীলনে এগিয়ে যাও।
            </p>
          </div>

          {/* Right Header: Search & Bell */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="অধ্যায় বা টপিক খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44 sm:w-56"
              />
            </div>

            <button
              type="button"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs overflow-hidden">
                {avatarPhoto ? (
                  <img src={avatarPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  (currentUser?.name || profile.name || 'S').charAt(0)
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#0F172A] leading-none">{currentUser?.name || profile.name || 'শিক্ষার্থী'}</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Student</div>
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Take Exam Primary Action Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-blue-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SSC বোর্ড প্যাটার্ন মডেল টেস্ট ও কাস্টম অধ্যায় পরীক্ষা</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              আজকের মডেল টেস্ট শুরু করো
            </h2>
            <p className="text-xs text-blue-100 max-w-lg">
              বোর্ডের আসল প্রশ্ন অথবা অধ্যায়ভিত্তিক প্রশ্ন সেট কনফিগার করে এখনই পরীক্ষা শুরু করো।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenDailyActivities && (
              <button
                type="button"
                onClick={onOpenDailyActivities}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>আজকের ১০ মিনিট</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onNavigateToSetup) onNavigateToSetup();
                else onStartDiagnostic();
              }}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-blue-700 font-black text-sm sm:text-base shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2 shrink-0 group cursor-pointer active:scale-98"
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <span>পরীক্ষা দাও (Take Exam)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-7">
            {/* 4 Top Honest Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Exams Taken */}
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Exams Taken</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono-numbers">
              {totalExamsCount}টি
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{totalExamsCount > 0 ? `${totalExamsCount}টি পরীক্ষা সম্পন্ন` : 'আজই প্রথম পরীক্ষা শুরু করো'}</span>
            </div>
          </div>

          {/* Card 2: Average Score */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Average Accuracy</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono-numbers">
              {totalExamsCount > 0 ? `${averageAccuracy}%` : '--%'}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>{totalExamsCount > 0 ? 'গড় পারফরম্যান্স স্কোর' : 'প্রথম পরীক্ষার পর হিসাব হবে'}</span>
            </div>
          </div>

          {/* Card 3: Day Streak */}
          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Study Streak</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono-numbers">
              {activeStreak} দিন
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-500" />
              <span>{activeStreak > 0 ? 'ধারাবাহিক দৈনিক অনুশীলন' : 'আজ পরীক্ষা দিয়ে স্ট্রিক শুরু করো'}</span>
            </div>
          </div>

          {/* Card 4: Daily Practice Quota */}
          <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Daily Practice Quota</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono-numbers">
              ২০টি
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>দৈনিক ফ্রি লিমিট (রিসেট রাত ১২:০০)</span>
            </div>
          </div>

        </div>

        {/* 2-Column Main Section matching Screen 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          
          {/* Left Column (7 Cols): Continue Practice + Upcoming Challenges + Badges */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Continue Practice Section (4 Official Subjects) */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-base font-black text-[#0F172A]">বিষয়ভিত্তিক প্রস্তুতি (Subjects)</h3>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToSetup) onNavigateToSetup();
                    else onStartDiagnostic();
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  কাস্টম পরীক্ষা সেটআপ করুন →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Subject 1: Mathematics */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F172A]">সাধারণ গণিত</div>
                      <div className="text-[11px] text-slate-500">১৭টি অধ্যায় • সম্পূর্ণ এনসিটিবি সিলেবাস</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToSetup) onNavigateToSetup();
                      else onStartDiagnostic();
                    }}
                    className="mt-4 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
                  >
                    অনুশীলন শুরু করো
                  </button>
                </div>

                {/* Subject 2: Physics */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cyan-100/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shrink-0">
                      <Atom className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F172A]">পদার্থবিজ্ঞান</div>
                      <div className="text-[11px] text-slate-500">১৪টি অধ্যায় • গতি, বল, আলো ও তড়িৎ</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToSetup) onNavigateToSetup();
                      else onStartDiagnostic();
                    }}
                    className="mt-4 w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
                  >
                    অনুশীলন শুরু করো
                  </button>
                </div>

                {/* Subject 3: Chemistry */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                      <Atom className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F172A]">রসায়ন</div>
                      <div className="text-[11px] text-slate-500">১২টি অধ্যায় • পর্যায় সারণি ও রাসায়নিক গণনা</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToSetup) onNavigateToSetup();
                      else onStartDiagnostic();
                    }}
                    className="mt-4 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
                  >
                    অনুশীলন শুরু করো
                  </button>
                </div>

                {/* Subject 4: Biology */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-teal-100/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shrink-0">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F172A]">জীববিজ্ঞান</div>
                      <div className="text-[11px] text-slate-500">১৪টি অধ্যায় • কোষ, পরিবহন ও বংশগতি</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToSetup) onNavigateToSetup();
                      else onStartDiagnostic();
                    }}
                    className="mt-4 w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
                  >
                    অনুশীলন শুরু করো
                  </button>
                </div>

              </div>
            </div>

            {/* Upcoming Challenges */}
            <div className="bg-white p-5 rounded-2xl border border-blue-100/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-amber-500" />
                  <span>Upcoming Challenges</span>
                </h3>
                <button
                  type="button"
                  onClick={onOpenChallenge}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Create Battle
                </button>
              </div>

              {/* Challenge item */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">Challenge with Rahat</div>
                    <div className="text-[11px] text-slate-500">Mathematics • 20 Questions</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenChallenge}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  Play Now
                </button>
              </div>

              {/* Daily Quiz streak card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/60 border border-blue-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">Daily Quiz Challenge</div>
                    <div className="text-[11px] text-slate-500">Earn 50 XP & maintain your 24-day streak</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onStartDiagnostic}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-colors"
                >
                  Start Quiz
                </button>
              </div>
            </div>

            {/* Badges Row matching Screen 5 */}
            <div className="bg-white p-5 rounded-2xl border border-blue-100/90 shadow-2xs">
              <h3 className="text-sm font-black text-[#0F172A] mb-3">Earned Badges</h3>
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-9 h-9 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-700">First Exam</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-9 h-9 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1.5">
                    <Flame className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-700">5 Day Streak</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-9 h-9 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5">
                    <Star className="w-4 h-4 fill-emerald-500" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-700">Top Performer</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-9 h-9 mx-auto rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-1.5">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-700">Challenge Master</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (5 Cols): Circular Progress Gauge & Join Batch */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Your Progress Circular Gauge Card matching Screen 5 */}
            <div className="bg-white p-6 rounded-3xl border border-blue-100/90 shadow-xl shadow-blue-500/5 text-center">
              <h3 className="text-base font-black text-[#0F172A] mb-4 text-left">Your Progress</h3>

              {/* Circular Ring Gauge */}
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#EFF6FF"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Progress Indicator */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#2563EB"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - (totalExamsCount > 0 ? Math.min(1, averageAccuracy / 100) : 0))}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-[#0F172A] font-mono-numbers">
                    {totalExamsCount > 0 ? `${averageAccuracy}%` : '০%'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {totalExamsCount > 0 ? 'সার্বিক নির্ভুলতা' : 'কোনো পরীক্ষা নেই'}
                  </span>
                </div>
              </div>

              {/* Breakdown Bars */}
              {totalExamsCount > 0 ? (
                <div className="space-y-3 mt-6 text-left">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>সাধারণ গণিত (General Math)</span>
                      <span className="text-blue-600 font-mono-numbers">{averageAccuracy}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${averageAccuracy}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>পদার্থবিজ্ঞান ও বিজ্ঞান (Science)</span>
                      <span className="text-cyan-600 font-mono-numbers">{Math.max(0, Math.min(100, averageAccuracy - 4))}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(100, averageAccuracy - 4))}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                  <p className="text-xs text-slate-600 font-medium">
                    তোমার কোনো পরীক্ষার রেকর্ড এখনো সংরক্ষিত নেই। বিষয়ভিত্তিক নির্ভুলতা ও অগ্রগতি দেখতে প্রথম পরীক্ষাটি সম্পন্ন করো।
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={onStartAdaptive}
                className="w-full mt-6 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Improve Weak Topics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Join Teacher Batch Card */}
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-2xs">
              <h3 className="text-sm font-black text-[#0F172A] mb-1">Join Teacher's Batch</h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter your teacher's 6-character batch code to participate in scheduled class exams.
              </p>

              <form onSubmit={handleJoin} className="space-y-3">
                <input
                  type="text"
                  value={batchCodeInput}
                  onChange={(e) => setBatchCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SSC2027M"
                  maxLength={10}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold tracking-wider uppercase text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />

                {joinMsg && (
                  <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                    joinMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {joinMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Join Batch
                </button>
              </form>
            </div>

          </div>

        </div>
          </div>
        )}

        {/* TAB 2: MY EXAMS / COMPLETED RESULTS */}
        {activeTab === 'exams' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-[#0F172A]">আমার পরীক্ষাসমূহ ও ফলাফল (My Exams & Results)</h2>
                <p className="text-xs text-slate-500 mt-0.5">পূর্বে সম্পন্ন করা পরীক্ষার বিস্তারিত স্কোর, নির্ভুলতা ও পর্যালোচনা</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToSetup) onNavigateToSetup();
                  else onStartDiagnostic();
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন পরীক্ষা শুরু করুন</span>
              </button>
            </div>

            {/* List of Previous Exams */}
            <div className="space-y-3">
              {[
                {
                  id: 'ex-01',
                  title: 'অধ্যায় ৩: বীজগাণিতিক রাশি - পূর্ণাঙ্গ মডেল টেস্ট',
                  subject: 'সাধারণ গণিত',
                  chapter: 'বীজগাণিতিক রাশি',
                  score: 18,
                  total: 20,
                  accuracy: 90,
                  date: 'আজ দুপুর ১২:৩০',
                  timeSpent: '14 মিনিট',
                },
                {
                  id: 'ex-02',
                  title: 'অধ্যায় ২: গতি (Motion) - বোর্ড প্রশ্ন অনুশীলন',
                  subject: 'পদার্থবিজ্ঞান',
                  chapter: 'গতি (Motion)',
                  score: 16,
                  total: 20,
                  accuracy: 80,
                  date: 'গতকাল সন্ধ্যা ০৭:১৫',
                  timeSpent: '16 মিনিট',
                },
                {
                  id: 'ex-03',
                  title: 'অধ্যায় ২: সেট ও ফাংশন - ডায়াগনস্টিক টেস্ট',
                  subject: 'সাধারণ গণিত',
                  chapter: 'সেট ও ফাংশন',
                  score: 14,
                  total: 20,
                  accuracy: 70,
                  date: '৩ দিন আগে',
                  timeSpent: '18 মিনিট',
                },
                {
                  id: 'ex-04',
                  title: 'অধ্যায় ৩: বল (Force) - এআই কনসেপ্ট টেস্ট',
                  subject: 'পদার্থবিজ্ঞান',
                  chapter: 'বল (Force)',
                  score: 15,
                  total: 20,
                  accuracy: 75,
                  date: '৫ দিন আগে',
                  timeSpent: '15 মিনিট',
                },
              ].map((ex) => (
                <div
                  key={ex.id}
                  className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-black text-sm shrink-0">
                      {ex.accuracy}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {ex.subject}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">· {ex.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0F172A] mt-1">{ex.title}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        স্কোর: <strong className="text-slate-800">{ex.score} / {ex.total}</strong> · সময়: {ex.timeSpent}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={onOpenMistakes}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                    >
                      ভুলসমূহ রিভিউ করো
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToSetup) onNavigateToSetup();
                        else onStartDiagnostic();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      পুনরায় দাও
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SUBJECT PROGRESS & MASTERY */}
        {activeTab === 'progress' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">বিষয়ভিত্তিক অগ্রগতি ও নির্ভুলতা (My Progress)</h2>
              <p className="text-xs text-slate-500 mt-0.5">সাধারণ গণিত ও পদার্থবিজ্ঞানের প্রতিটি অধ্যায়ের সার্বিক প্রস্তুতি বিশ্লেষণ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mathematics Card */}
              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">সাধারণ গণিত (General Mathematics)</h3>
                      <div className="text-[11px] text-slate-400">১৭টি অধ্যায় · সার্বিক প্রস্তুতি ৮৫%</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">৮৫%</span>
                </div>

                <div className="space-y-3">
                  {[
                    { ch: 'অধ্যায় ৩: বীজগাণিতিক রাশি', pct: 92 },
                    { ch: 'অধ্যায় ২: সেট ও ফাংশন', pct: 88 },
                    { ch: 'অধ্যায় ১: বাস্তব সংখ্যা', pct: 95 },
                    { ch: 'অধ্যায় ৪: সূচক ও লগারিদম', pct: 78 },
                    { ch: 'অধ্যায় ৯: ত্রিকোণমিতিক অনুপাত', pct: 74 },
                    { ch: 'অধ্যায় ১৭: পরিসংখ্যান', pct: 90 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{item.ch}</span>
                        <span className="text-blue-600 font-bold">{item.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physics Card */}
              <div className="bg-white p-6 rounded-3xl border border-cyan-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                      <Atom className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">পদার্থবিজ্ঞান (Physics)</h3>
                      <div className="text-[11px] text-slate-400">১৪টি অধ্যায় · সার্বিক প্রস্তুতি ৭৮%</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">৭৮%</span>
                </div>

                <div className="space-y-3">
                  {[
                    { ch: 'অধ্যায় ২: গতি (Motion)', pct: 84 },
                    { ch: 'অধ্যায় ৩: বল (Force)', pct: 76 },
                    { ch: 'অধ্যায় ১: ভৌত রাশি ও পরিমাপ', pct: 90 },
                    { ch: 'অধ্যায় ৪: কাজ, ক্ষমতা ও শক্তি', pct: 72 },
                    { ch: 'অধ্যায় ৫: পদার্থের অবস্থা ও চাপ', pct: 68 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{item.ch}</span>
                        <span className="text-cyan-600 font-bold">{item.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">অর্জিত ব্যাজ ও মেডেল (Achievements)</h2>
              <p className="text-xs text-slate-500 mt-0.5">ধারাবাহিক অনুশীলন ও ফ্রেন্ডস চ্যালেঞ্জ জয়ের স্বীকৃতি</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'First Exam', desc: 'প্রথম মডেল টেস্ট সম্পন্ন', icon: Award, color: 'text-blue-600 bg-blue-100' },
                { name: '5 Day Streak', desc: 'টানা ৫ দিন অনুশীলন', icon: Flame, color: 'text-amber-600 bg-amber-100' },
                { name: 'Top Performer', desc: '৯০%+ নম্বর অর্জন', icon: Star, color: 'text-emerald-600 bg-emerald-100' },
                { name: 'Challenge Master', desc: '৫টি ফ্রেন্ডস ব্যাটল জয়', icon: Trophy, color: 'text-purple-600 bg-purple-100' },
                { name: 'Math Prodigy', desc: 'বীজগাণিতিক রাশিতে ১০০%', icon: Calculator, color: 'text-indigo-600 bg-indigo-100' },
                { name: 'Physics Ace', desc: 'গতি ও বল অধ্যায়ে পারদর্শী', icon: Atom, color: 'text-cyan-600 bg-cyan-100' },
                { name: 'Night Owl', desc: 'গভীর রাতে সফল প্রস্তুতি', icon: Sparkles, color: 'text-violet-600 bg-violet-100' },
                { name: 'Mastermind', desc: '১০০+ প্রশ্ন নির্ভুল সমাধান', icon: BrainCircuit, color: 'text-rose-600 bg-rose-100' },
              ].map((badge, idx) => {
                const IconComponent = badge.icon;
                return (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-blue-100/90 shadow-2xs text-center space-y-2 hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 mx-auto rounded-2xl ${badge.color} flex items-center justify-center shadow-xs`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="font-extrabold text-sm text-[#0F172A]">{badge.name}</div>
                    <div className="text-[11px] text-slate-400">{badge.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
