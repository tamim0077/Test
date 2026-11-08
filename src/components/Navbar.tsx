import React, { useState } from 'react';
import {
  Flame,
  Globe,
  Menu,
  X,
  LogOut,
  GraduationCap,
  School,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { translations, type Language } from '../utils/i18n';
import type { UserAccount } from '../types';
import { LanguageModal } from './LanguageModal';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: UserAccount;
  onLogout: () => void;
  streakDays: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  lang,
  onLanguageChange,
  currentUser,
  onLogout,
  streakDays,
}) => {
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  // Role-specific home destination
  const getHomeView = () => {
    if (currentUser.role === 'admin') return 'admin';
    if (currentUser.role === 'teacher') return currentUser.isVerifiedTeacher ? 'teacher-dashboard' : 'teacher-pending';
    return 'student-dashboard';
  };

  const isStudent = currentUser.role === 'student';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
          
          {/* Brand Wordmark - routes to user's authorized dashboard */}
          <button
            type="button"
            onClick={() => { onNavigate(getHomeView()); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 text-left group focus:outline-none rounded-xl p-1 transition-transform active:scale-95 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              DNA
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-[#0F172A] flex items-center gap-1">
                <span>ExamDNA</span>
                <span className="text-blue-600 font-extrabold text-sm px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/60">
                  BD
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 leading-none">
                {lang === 'bn' ? 'তোমার ভুলই পরবর্তী প্রস্তুতি' : 'Turn mistakes into mastery'}
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links: Strictly partitioned by verified role */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            {/* Student Navigation Items */}
            {isStudent && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('student-dashboard')}
                  className={`transition-colors hover:text-blue-600 relative py-1 cursor-pointer ${
                    currentView === 'student-dashboard' ? 'text-blue-600 font-bold' : ''
                  }`}
                >
                  {t.navStudentDashboard}
                  {currentView === 'student-dashboard' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('exam-setup')}
                  className={`transition-colors hover:text-blue-600 relative py-1 cursor-pointer ${
                    currentView === 'exam-setup' ? 'text-blue-600 font-bold' : ''
                  }`}
                >
                  <span>{lang === 'bn' ? 'পরীক্ষা কনফিগার (Wizard)' : 'Exam Wizard'}</span>
                  {currentView === 'exam-setup' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('mistakes')}
                  className={`transition-colors hover:text-blue-600 relative py-1 cursor-pointer ${
                    currentView === 'mistakes' ? 'text-blue-600 font-bold' : ''
                  }`}
                >
                  {t.navMistakeNotebook}
                  {currentView === 'mistakes' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('challenge')}
                  className={`transition-colors hover:text-blue-600 relative py-1 cursor-pointer ${
                    currentView === 'challenge' ? 'text-blue-600 font-bold' : ''
                  }`}
                >
                  <span>{lang === 'bn' ? 'ফ্রেন্ডস চ্যালেঞ্জ' : 'Friends Challenge'}</span>
                  {currentView === 'challenge' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              </>
            )}

            {/* Teacher Navigation Items */}
            {isTeacher && (
              <>
                {currentUser.isVerifiedTeacher ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('teacher-dashboard')}
                    className={`transition-colors hover:text-blue-600 relative py-1 cursor-pointer ${
                      currentView === 'teacher-dashboard' ? 'text-blue-600 font-bold' : ''
                    }`}
                  >
                    {t.navTeacherPanel}
                    {currentView === 'teacher-dashboard' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('teacher-pending')}
                    className={`transition-colors hover:text-amber-700 relative py-1 cursor-pointer ${
                      currentView === 'teacher-pending' ? 'text-amber-700 font-bold' : 'text-amber-600'
                    }`}
                  >
                    <span>{lang === 'bn' ? 'অনুমোদন প্রক্রিয়াধীন' : 'Approval Pending'}</span>
                    {currentView === 'teacher-pending' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-full" />
                    )}
                  </button>
                )}
              </>
            )}

            {/* Admin Navigation Item */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className={`transition-colors px-3 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 font-bold text-xs ${
                  currentView === 'admin' ? 'ring-2 ring-red-400' : ''
                }`}
              >
                {lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
              </button>
            )}
          </nav>

          {/* Right Action Cluster: Language Switcher, Streak (student only), Auth Info & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs font-bold text-slate-700 hover:text-blue-700 transition-all shadow-2xs cursor-pointer"
              title="Change Language (বাংলা / English)"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'bn' ? 'বাং' : 'EN'}</span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] text-slate-400 font-normal">{lang === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Streak Counter (Only for students) */}
            {isStudent && (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50/80 text-amber-900 text-xs font-bold border border-amber-200/70">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span className="font-mono-numbers">{streakDays}</span>
                <span className="text-[10px] font-medium text-amber-700">{t.navDays}</span>
              </div>
            )}

            {/* User Profile Pill & Logout */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] overflow-hidden">
                  {currentUser.photoUrl ? (
                    <img src={currentUser.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 leading-none truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold leading-none mt-0.5 capitalize flex items-center gap-1">
                    <span>{currentUser.role}</span>
                    {currentUser.role === 'teacher' && currentUser.isVerifiedTeacher && (
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title={t.navLogout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer: Strictly role-partitioned */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-fade-in shadow-xl">
            {isStudent && (
              <>
                <button
                  type="button"
                  onClick={() => { onNavigate('student-dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${
                    currentView === 'student-dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                  }`}
                >
                  {t.navStudentDashboard}
                </button>

                <button
                  type="button"
                  onClick={() => { onNavigate('exam-setup'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${
                    currentView === 'exam-setup' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                  }`}
                >
                  {lang === 'bn' ? 'পরীক্ষা কনফিগার (Wizard)' : 'Exam Wizard'}
                </button>

                <button
                  type="button"
                  onClick={() => { onNavigate('mistakes'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${
                    currentView === 'mistakes' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                  }`}
                >
                  {t.navMistakeNotebook}
                </button>

                <button
                  type="button"
                  onClick={() => { onNavigate('challenge'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${
                    currentView === 'challenge' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                  }`}
                >
                  {lang === 'bn' ? 'ফ্রেন্ডস চ্যালেঞ্জ' : 'Friends Challenge'}
                </button>
              </>
            )}

            {isTeacher && (
              <>
                {currentUser.isVerifiedTeacher ? (
                  <button
                    type="button"
                    onClick={() => { onNavigate('teacher-dashboard'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${
                      currentView === 'teacher-dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    {t.navTeacherPanel}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { onNavigate('teacher-pending'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${
                      currentView === 'teacher-pending' ? 'bg-amber-50 text-amber-700' : 'text-amber-600'
                    }`}
                  >
                    {lang === 'bn' ? 'অনুমোদন প্রক্রিয়াধীন' : 'Approval Pending'}
                  </button>
                )}
              </>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${
                  currentView === 'admin' ? 'bg-red-50 text-red-700' : 'text-red-700'
                }`}
              >
                {lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
              </button>
            )}

            <button
              type="button"
              onClick={() => { onLogout(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 pt-2 border-t border-slate-100"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.navLogout}</span>
            </button>
          </div>
        )}
      </header>

      {/* Language Switcher Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLang={lang}
        onSelectLang={onLanguageChange}
      />
    </>
  );
};
