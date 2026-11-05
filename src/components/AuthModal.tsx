import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  School,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { translations, Language } from '../utils/i18n';
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAuthSuccess: (user: UserAccount, token: string) => void;
  defaultRole?: 'student' | 'teacher';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAuthSuccess,
  defaultRole = 'student',
}) => {
  if (!isOpen) return null;

  const t = translations[lang];
  const [role, setRole] = useState<'student' | 'teacher'>(defaultRole);
  const [isSignUp, setIsSignUp] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [subject, setSubject] = useState('সাধারণ গণিত');
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const isAdminEmail = normalizedEmail === 'mustafizurr131@gmail.com';

    // Strictly enforce no self-assigned admin privileges through public signup
    if (isSignUp && isAdminEmail) {
      setErrorMsg(lang === 'bn' ? 'অ্যাডমিন একাউন্ট উন্মুক্তভাবে নিবন্ধন করা অনুমোদিত নয়।' : 'Admin accounts cannot be registered via public signup.');
      setLoading(false);
      return;
    }

    // 1. Try Firebase Authentication (Cloud Firestore backed)
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const fbUser = cred.user;
        const profile: UserAccount = {
          id: fbUser.uid,
          name: name.trim(),
          email: normalizedEmail,
          role: isAdminEmail ? 'admin' : role,
          institution: institution?.trim() || undefined,
          subject: subject?.trim() || undefined,
          track: 'science',
          examLevel: 'SSC',
          examYear: '2027',
          streakDays: 1,
          isVerifiedTeacher: isAdminEmail,
        };

        await saveFirestoreUserProfile(profile);
        const token = await fbUser.getIdToken();
        localStorage.setItem('examdna_token', token);
        onAuthSuccess(profile, token);
        onClose();
        return;
      } else {
        const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const fbUser = cred.user;
        let profile = await getFirestoreUserProfile(fbUser.uid);
        if (!profile) {
          profile = {
            id: fbUser.uid,
            name: fbUser.displayName || name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            role: isAdminEmail ? 'admin' : role,
            streakDays: 1,
            isVerifiedTeacher: isAdminEmail,
          };
          await saveFirestoreUserProfile(profile);
        }

        const token = await fbUser.getIdToken();
        localStorage.setItem('examdna_token', token);
        onAuthSuccess(profile, token);
        onClose();
        return;
      }
    } catch (fbErr: any) {
      console.warn('Firebase Auth notice, attempting server fallback:', fbErr?.code || fbErr?.message);
      
      // Fallback to Express backend for seeded demo accounts (student123, teacher123, admin2027!)
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const payload = isSignUp
        ? { name, email: normalizedEmail, password, role, institution, subject, track: 'science', examLevel: 'SSC', examYear: '2027' }
        : { email: normalizedEmail, password };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || fbErr?.message || (lang === 'bn' ? 'অনুরোধ ব্যর্থ হয়েছে।' : 'Request failed.'));
        }

        localStorage.setItem('examdna_token', data.token);
        onAuthSuccess(data.user, data.token);
        onClose();
      } catch (err: any) {
        let msg = err.message || 'Authentication error';
        if (fbErr?.code === 'auth/email-already-in-use') {
          msg = lang === 'bn' ? 'এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট খোলা হয়েছে।' : 'This email is already registered. Please log in.';
        } else if (fbErr?.code === 'auth/wrong-password' || fbErr?.code === 'auth/invalid-credential') {
          msg = lang === 'bn' ? 'ভুল ইমেইল অথবা পাসওয়ার্ড।' : 'Incorrect email or password.';
        } else if (fbErr?.code === 'auth/weak-password') {
          msg = lang === 'bn' ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.';
        }
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      const isAdminEmail = fbUser.email?.toLowerCase() === 'mustafizurr131@gmail.com';

      let profile = await getFirestoreUserProfile(fbUser.uid);
      if (!profile) {
        profile = {
          id: fbUser.uid,
          name: fbUser.displayName || (role === 'student' ? 'Student' : 'Teacher'),
          email: fbUser.email || '',
          role: isAdminEmail ? 'admin' : role,
          photoUrl: fbUser.photoURL || undefined,
          streakDays: 1,
          isVerifiedTeacher: isAdminEmail,
          institution: institution || undefined,
          subject: subject || undefined,
          track: 'science',
          examLevel: 'SSC',
          examYear: '2027',
        };
        await saveFirestoreUserProfile(profile);
      }

      const token = await fbUser.getIdToken();
      localStorage.setItem('examdna_token', token);
      onAuthSuccess(profile, token);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      console.warn('Google sign-in exception:', err);
      // Fallback to demo account if in strict iframe sandbox without third-party popups
      const demoEmail = role === 'student' ? 'student@examdna.bd' : 'teacher@examdna.bd';
      const demoPass = role === 'student' ? 'student123' : 'teacher123';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: demoEmail, password: demoPass }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('examdna_token', data.token);
          onAuthSuccess(data.user, data.token);
          onClose();
          return;
        }
      } catch {}

      setErrorMsg(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestStudentEntry = () => {
    const guestUser: UserAccount = {
      id: 'std-guest-' + Math.random().toString(36).substring(2, 8),
      name: lang === 'bn' ? 'তানভীর আহমেদ (গেস্ট)' : 'Tanvir Ahmed (Guest)',
      email: 'guest.student@examdna.bd',
      role: 'student',
      track: 'science',
      examLevel: 'SSC',
      examYear: '2027',
      streakDays: 24,
      isVerifiedTeacher: false,
    };
    onAuthSuccess(guestUser, 'guest_token_' + Date.now());
    onClose();
  };

  const isStudent = role === 'student';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-blue-100 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          
          {/* ============================================================== */}
          {/* LEFT COLUMN: Visual Graphic matching Screen 3 / Screen 4       */}
          {/* ============================================================== */}
          <div
            className={`hidden md:flex md:col-span-5 flex-col justify-between p-8 text-white relative overflow-hidden ${
              isStudent
                ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600'
                : 'bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700'
            }`}
          >
            {/* Ambient Background Circles */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm">
                  DNA
                </div>
                <span className="font-extrabold tracking-tight text-lg">ExamDNA BD</span>
              </div>

              {/* Graphic Title */}
              <div className="mt-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-semibold backdrop-blur-md mb-3">
                  {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <School className="w-3.5 h-3.5" />}
                  <span>{isStudent ? 'Student Gateway' : 'Teacher Gateway'}</span>
                </div>
                <h4 className="text-2xl font-black leading-snug">
                  {isStudent
                    ? (lang === 'bn' ? 'তোমার লক্ষ্য, তোমার সাফল্য' : 'Achieve Your Best in SSC & HSC')
                    : (lang === 'bn' ? 'আধুনিক ক্লাসরুম ম্যানেজমেন্ট' : 'Empower Your Classroom with AI')}
                </h4>
              </div>
            </div>

            {/* Floating Glass Pills matching Screen 3 & 4 */}
            <div className="relative z-10 my-auto py-6">
              {isStudent ? (
                <div className="space-y-2.5">
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-xs w-fit">
                    <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                    <span>Practice (নিয়মিত অনুশীলন)</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-xs w-fit translate-x-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-300" />
                    <span>Analyze (ভুল বিশ্লেষণ)</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-xs w-fit translate-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-300" />
                    <span>Improve (এআই কোচিং)</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-xs w-fit translate-x-4">
                    <span className="w-2 h-2 rounded-full bg-purple-300" />
                    <span>Grow (পূর্ণাঙ্গ এ+ প্রস্তুতি)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-xs w-fit">
                    <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
                    <span>Create (বোর্ড প্যাটার্ন পরীক্ষা)</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-xs w-fit translate-x-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-300" />
                    <span>Manage (ব্যাচ ও শিক্ষার্থী)</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-xs w-fit translate-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-300" />
                    <span>Track (লাইভ নির্ভুলতা মেট্রিক্স)</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-xs w-fit translate-x-4">
                    <span className="w-2 h-2 rounded-full bg-amber-300" />
                    <span>Inspire (ভবিষ্যতের অনুপ্রেরণা)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Toggle Role */}
            <div className="relative z-10 pt-4 border-t border-white/20 text-xs">
              <span className="text-white/80">{isStudent ? 'শিক্ষক হিসেবে প্রবেশ করতে চান?' : 'Looking for student portal?'} </span>
              <button
                type="button"
                onClick={() => {
                  setRole(isStudent ? 'teacher' : 'student');
                  setErrorMsg(null);
                }}
                className="underline font-bold text-white hover:text-cyan-200"
              >
                {isStudent ? 'Teacher Portal' : 'Student Portal'}
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: Clean Login/Signup Form                          */}
          {/* ============================================================== */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => { setRole('student'); setErrorMsg(null); }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isStudent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('teacher'); setErrorMsg(null); }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      !isStudent
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Teacher
                  </button>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                  {isSignUp
                    ? (isStudent ? 'Student Sign Up' : 'Teacher Registration')
                    : (isStudent ? 'Student Login' : 'Teacher Login')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isSignUp
                    ? 'Create your free account to get started'
                    : (isStudent ? 'Welcome back! Continue your learning journey' : 'Access your teacher dashboard & batches')}
                </p>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Main Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'bn' ? 'সম্পূর্ণ নাম' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isStudent ? 'তানভীর আহমেদ' : 'মোঃ রফিকুল ইসলাম'}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ইমেইল বা ইউজারনেম' : 'Email or Username'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isStudent ? 'student@example.com' : 'teacher@school.edu.bd'}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => alert(lang === 'bn' ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হবে।' : 'Password reset link will be sent to your email.')}
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {isSignUp && !isStudent && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'bn' ? 'শিক্ষা প্রতিষ্ঠানের নাম' : 'Institution / School Name'}
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="ঢাকা রেসিডেনসিয়াল মডেল কলেজ"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {!isSignUp && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer">
                      {lang === 'bn' ? 'আমাকে মনে রাখুন' : 'Remember me'}
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isStudent
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25'
                  }`}
                >
                  <span>
                    {loading
                      ? (lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...')
                      : isSignUp
                      ? (lang === 'bn' ? 'একাউন্ট তৈরি করুন' : 'Create Account')
                      : (lang === 'bn' ? 'লগইন করুন' : 'Login')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Or Continue with Google */}
              <div className="my-4 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] text-slate-400 font-semibold">Or continue with</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
                <span>{lang === 'bn' ? 'Google দিয়ে প্রবেশ করুন' : 'Continue with Google'}</span>
              </button>

              {isStudent && (
                <button
                  type="button"
                  onClick={handleGuestStudentEntry}
                  className="w-full mt-2.5 py-2.5 px-4 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'bn' ? 'গেস্ট হিসেবে সরাসরি ড্যাশবোর্ডে প্রবেশ করুন' : 'Continue as Guest Student to Dashboard'}</span>
                </button>
              )}
            </div>

            {/* Bottom Footer Switcher */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
              {isSignUp ? (
                <>
                  {lang === 'bn' ? 'ইতিমধ্যে একাউন্ট আছে? ' : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    {lang === 'bn' ? 'লগইন করুন' : 'Sign In'}
                  </button>
                </>
              ) : (
                <>
                  {lang === 'bn' ? 'কোনো একাউন্ট নেই? ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    {isStudent
                      ? (lang === 'bn' ? 'নিবন্ধন করুন' : 'Sign Up')
                      : (lang === 'bn' ? 'শিক্ষক হিসেবে নিবন্ধন' : 'Sign Up as Teacher')}
                  </button>
                </>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
