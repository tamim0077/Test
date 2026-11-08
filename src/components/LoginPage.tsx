import React, { useState } from 'react';
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import {
  GraduationCap,
  School,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  Globe,
  FileText,
} from 'lucide-react';
import { translations, type Language } from '../utils/i18n';
import type { UserAccount } from '../types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  saveFirestoreUserProfile,
  getFirestoreUserProfile,
} from '../config/firebase';
import { LanguageModal } from './LanguageModal';

interface LoginPageProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onAuthSuccess: (user: UserAccount, token: string) => void;
  pendingExamId?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  lang,
  onLanguageChange,
  onAuthSuccess,
  pendingExamId,
}) => {
  const t = translations[lang];
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [subject, setSubject] = useState('সাধারণ গণিত');
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      if (isSignUp) {
        if (!name.trim()) {
          setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
          setLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const fbUser = cred.user;
        const profile: UserAccount = {
          id: fbUser.uid,
          name: name.trim(),
          email: normalizedEmail,
          role,
          institution: institution?.trim() || undefined,
          subject: subject?.trim() || undefined,
          track: 'science',
          examLevel: 'SSC',
          examYear: '2027',
          streakDays: 0,
          isVerifiedTeacher: false,
        };

        await saveFirestoreUserProfile(profile);
        const token = await fbUser.getIdToken();
        onAuthSuccess(profile, token);
        return;
      } else {
        const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const fbUser = cred.user;
        let profile = await getFirestoreUserProfile(fbUser.uid);
        if (!profile || !(profile as any).createdAt) {
          profile = {
            id: fbUser.uid,
            name: fbUser.displayName || name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            role,
            streakDays: 0,
            isVerifiedTeacher: false,
          };
          await saveFirestoreUserProfile(profile);
        }

        const token = await fbUser.getIdToken();
        onAuthSuccess(profile, token);
        return;
      }
    } catch (fbErr: any) {
      let msg = fbErr?.message || 'Authentication error';
      if (fbErr?.code === 'auth/email-already-in-use') {
        msg = lang === 'bn' ? 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে। লগইন করুন।' : 'This email is already registered. Please log in.';
      } else if (fbErr?.code === 'auth/invalid-credential' || fbErr?.code === 'auth/wrong-password' || fbErr?.code === 'auth/user-not-found') {
        msg = lang === 'bn' ? 'ভুল ইমেইল অথবা পাসওয়ার্ড প্রদান করা হয়েছে।' : 'Invalid email or password.';
      } else if (fbErr?.code === 'auth/weak-password') {
        msg = lang === 'bn' ? 'পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      const normalizedEmail = (fbUser.email || '').toLowerCase();

      let profile = await getFirestoreUserProfile(fbUser.uid);
      if (!profile || !(profile as any).createdAt) {
        profile = {
          id: fbUser.uid,
          name: fbUser.displayName || 'ব্যবহারকারী',
          email: normalizedEmail,
          role,
          track: 'science',
          examLevel: 'SSC',
          examYear: '2027',
          streakDays: 0,
          isVerifiedTeacher: false,
          photoUrl: fbUser.photoURL || undefined,
        };
        await saveFirestoreUserProfile(profile);
      }

      const token = await fbUser.getIdToken();
      onAuthSuccess(profile, token);
    } catch (fbErr: any) {
      if (fbErr?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(fbErr?.message || 'Google sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-blue-50/30 to-[#EEF2F6] flex flex-col justify-between">
      {/* Top Bar with Brand & Language Switcher */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-blue-100/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/25">
              DNA
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-[#0F172A] flex items-center gap-1">
                <span>ExamDNA</span>
                <span className="text-blue-600 font-extrabold text-xs px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/60">
                  BD
                </span>
              </div>
              <div className="text-[10px] font-medium text-slate-500">
                {lang === 'bn' ? 'তোমার ভুলই পরবর্তী প্রস্তুতি' : 'Turn mistakes into mastery'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs font-bold text-slate-700 hover:text-blue-700 transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'bn' ? 'বাং' : 'EN'}</span>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] text-slate-400 font-normal">{lang === 'bn' ? 'EN' : 'বাং'}</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-blue-100/90 overflow-hidden">
          
          {/* Pending Assignment Exam Banner (if user came from ?exam= link) */}
          {pendingExamId && (
            <div className="bg-amber-50 border-b border-amber-200 p-3.5 flex items-center gap-2.5 text-amber-900 text-xs font-medium">
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {lang === 'bn'
                  ? 'একটি নির্ধারিত পরীক্ষায় অংশ নিতে অনুগ্রহ করে লগইন বা সাইন-আপ করুন।'
                  : 'Please sign in or create an account to access the assigned exam.'}
              </span>
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Header info */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
                {isSignUp
                  ? lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account'
                  : lang === 'bn' ? 'ExamDNA BD-তে প্রবেশ করুন' : 'Sign in to ExamDNA BD'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isSignUp
                  ? lang === 'bn' ? 'পরীক্ষা প্রস্তুতি ও ভুল বিশ্লেষণের নিরাপদ প্ল্যাটফর্ম' : 'Secure platform for exam preparation and analytics'
                  : lang === 'bn' ? 'আপনার অ্যাকাউন্টে লগইন করতে তথ্য দিন' : 'Enter your credentials to continue'}
              </p>
            </div>

            {/* Role Selection for Sign Up or Mode Toggle */}
            <div className="space-y-4 mb-6">
              {/* Account Type Selection (Only for Signup) */}
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    {lang === 'bn' ? 'অ্যাকাউন্টের ধরন নির্বাচন করুন' : 'Select Account Type'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        role === 'student'
                          ? 'bg-white text-blue-600 shadow-xs border border-blue-100'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{t.roleStudent}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        role === 'teacher'
                          ? 'bg-white text-blue-600 shadow-xs border border-blue-100'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <School className="w-4 h-4" />
                      <span>{t.roleTeacher}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Notice that existing accounts retain their registered role */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
                {lang === 'bn'
                  ? '💡 বিদ্যমান অ্যাকাউন্টে প্রবেশের পর সিস্টেম স্বয়ংক্রিয়ভাবে আপনার নির্ধারিত রোল (Student / Teacher / Admin) অনুযায়ী ড্যাশবোর্ডে নিয়ে যাবে।'
                  : '💡 Existing accounts are routed automatically based on their server-verified role.'}
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 cursor-pointer mb-5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSignUp ? (lang === 'bn' ? 'গুগল দিয়ে সাইন আপ করুন' : 'Sign up with Google') : (lang === 'bn' ? 'গুগল দিয়ে লগইন করুন' : 'Sign in with Google')}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {lang === 'bn' ? 'অথবা ইমেইল দিয়ে' : 'OR WITH EMAIL'}
              </span>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.authName} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Teacher-specific signup fields */}
              {isSignUp && role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.authInstitution} *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder={lang === 'bn' ? 'যেমন: রাজউক উত্তরা মডেল কলেজ' : 'e.g. Rajuk Uttara Model College'}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.authSubject}
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs"
                    >
                      <option value="সাধারণ গণিত">সাধারণ গণিত</option>
                      <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                      <option value="রসায়ন">রসায়ন</option>
                      <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.authEmail} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.authPassword} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>{lang === 'bn' ? 'আমাকে মনে রাখুন' : 'Remember me'}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 text-xs font-bold transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                <span>
                  {loading
                    ? (lang === 'bn' ? 'অপেক্ষা করুন...' : 'Please wait...')
                    : isSignUp
                    ? t.authSubmitSignup
                    : t.authSubmitLogin}
                </span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Switch between Login and Signup */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                {isSignUp ? t.authHasAccount : t.authNoAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg(null);
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 underline ml-1 cursor-pointer"
                >
                  {isSignUp
                    ? (lang === 'bn' ? 'লগইন করুন' : 'Log In')
                    : (lang === 'bn' ? 'সাইন আপ করুন' : 'Sign Up')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400">
        ExamDNA BD &bull; {lang === 'bn' ? 'এনসিটিবি পাঠ্যক্রম অনুসরণে প্রস্তুতকৃত' : 'Aligned with NCTB Curriculum'}
      </footer>

      {/* Language Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLang={lang}
        onSelectLang={onLanguageChange}
      />
    </div>
  );
};
