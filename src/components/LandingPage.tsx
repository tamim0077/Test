import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Award,
  Users,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Flame,
  Swords,
  GraduationCap,
  School,
  FileCheck2,
  PieChart,
  Target,
  Clock,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Camera,
  Upload,
  RotateCcw,
  Check
} from 'lucide-react';
import { translations, Language } from '../utils/i18n';
import type { UserAccount } from '../types';
import { FounderSection } from './FounderSection';
import { saveFirestoreUserProfile } from '../config/firebase';

interface LandingPageProps {
  onStartExam: () => void;
  onStudentClick?: () => void;
  onTeacherClick: () => void;
  onDemoExamClick?: () => void;
  onNavigate: (view: string) => void;
  lang: Language;
  currentUser?: UserAccount | null;
  totalExamsCount?: number;
  averageAccuracy?: number;
  onUpdateStudentPhoto?: (photoUrl: string | null) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartExam,
  onStudentClick,
  onTeacherClick,
  onDemoExamClick,
  onNavigate,
  lang,
  currentUser,
  totalExamsCount = 0,
  averageAccuracy = 0,
  onUpdateStudentPhoto,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);

  // Compute student default avatar: Gmail / Google avatar if user is signed in, or default student portrait
  const getStudentDefaultAvatar = () => {
    if (currentUser?.photoUrl) return currentUser.photoUrl;
    if (currentUser?.email) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.email)}&background=0284c7&color=ffffff&size=256&bold=true`;
    }
    return 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80';
  };

  // Sync photo from localStorage or currentUser
  useEffect(() => {
    const userKey = currentUser?.id || 'guest';
    const saved = localStorage.getItem(`examdna_student_photo_${userKey}`);
    if (saved) {
      setStudentPhoto(saved);
    } else if (currentUser?.photoUrl) {
      setStudentPhoto(currentUser.photoUrl);
    } else {
      setStudentPhoto(null);
    }
  }, [currentUser]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন।' : 'Please select an image file.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setStudentPhoto(base64);
      const userKey = currentUser?.id || 'guest';
      localStorage.setItem(`examdna_student_photo_${userKey}`, base64);

      if (currentUser?.id) {
        saveFirestoreUserProfile({ id: currentUser.id, photoUrl: base64 }).catch(() => {});
      }

      if (onUpdateStudentPhoto) {
        onUpdateStudentPhoto(base64);
      }

      setUploadSuccessToast(true);
      setTimeout(() => setUploadSuccessToast(false), 3000);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = () => {
    const userKey = currentUser?.id || 'guest';
    localStorage.removeItem(`examdna_student_photo_${userKey}`);
    setStudentPhoto(null);
    if (currentUser?.id) {
      saveFirestoreUserProfile({ id: currentUser.id, photoUrl: undefined }).catch(() => {});
    }
    if (onUpdateStudentPhoto) {
      onUpdateStudentPhoto(null);
    }
  };

  const isLoggedIn = !!currentUser;
  const isStudent = currentUser?.role === 'student';
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';

  const activePhotoUrl = studentPhoto || getStudentDefaultAvatar();
  const studentDisplayName = isLoggedIn
    ? (currentUser.name || 'শিক্ষার্থী')
    : (lang === 'bn' ? 'নমুনা শিক্ষার্থী (প্রিভিউ)' : 'Demo Student (Preview)');
  const studentBatchName = isLoggedIn
    ? `${currentUser.examLevel || 'SSC'} ${currentUser.examYear || '2027'} ${currentUser.track ? currentUser.track.toUpperCase() : 'Science'} Batch`
    : (lang === 'bn' ? 'SSC 2027 Science Batch (নমুনা)' : 'SSC 2027 Science Batch (Demo)');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Matching Screen 1 Pixel-Accurately)           */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-white via-[#EFF6FF]/70 to-[#F8FAFC]">
        {/* Ambient blurred glow orbs */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-4/5 h-96 bg-gradient-to-r from-blue-200/40 via-cyan-100/30 to-purple-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column (7 Cols): Headline, Subtitle, Dual CTAs, 4 Stats */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-white border border-blue-200/90 px-3.5 py-1.5 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>{lang === 'bn' ? 'স্মার্ট এআই লার্নিং প্ল্যাটফর্ম' : 'AI-Powered Exam Preparation'}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-[#0F172A] leading-[1.18]">
                {lang === 'bn' ? (
                  <>
                    <span className="block text-[#0F172A]">তোমার ভুলই</span>
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                      তোমার পরবর্তী প্রস্তুতি
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block text-[#0F172A]">Turn Every Mistake</span>
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                      Into Academic Mastery
                    </span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
                {lang === 'bn'
                  ? 'AI-Powered Exam Practice Platform for SSC, HSC & More. হাজারো শিক্ষার্থী ও শিক্ষকদের বিশ্বস্ত সমাধান।'
                  : 'AI-Powered Exam Practice Platform for SSC, HSC & More. Identify weakness, practice real board patterns, and win challenges.'}
              </p>

              {/* Unambiguous Role CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isAdmin) onNavigate('admin');
                      else if (isTeacher) onNavigate('teacher-dashboard');
                      else onNavigate('student-dashboard');
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 group cursor-pointer active:scale-98"
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span>
                      {isAdmin
                        ? (lang === 'bn' ? 'অ্যাডমিন প্যানেলে যাও (Admin Panel)' : 'Go to Admin Panel')
                        : isTeacher
                        ? (lang === 'bn' ? 'শিক্ষক ড্যাশবোর্ডে যাও (Teacher Dashboard)' : 'Go to Teacher Dashboard')
                        : (lang === 'bn' ? 'ড্যাশবোর্ডে যাও (Go to Dashboard)' : 'Go to Dashboard')}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (onStudentClick) onStudentClick();
                        else onStartExam();
                      }}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 group cursor-pointer active:scale-98"
                    >
                      <GraduationCap className="w-5 h-5" />
                      <span>{lang === 'bn' ? 'প্রস্তুতি শুরু করো (Student Login / Signup)' : 'Start My Preparation'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={onTeacherClick}
                      className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-sm sm:text-base border border-blue-200/90 hover:border-blue-400 shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                    >
                      <School className="w-5 h-5 text-indigo-600" />
                      <span>{lang === 'bn' ? 'শিক্ষক লগইন / সাইনআপ' : 'Teacher Login / Signup'}</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={onDemoExamClick || onStartExam}
                  className="px-5 py-3.5 rounded-2xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'bn' ? 'ডেমো পরীক্ষা দাও (Try Demo Exam)' : 'Try a Demo Exam'}</span>
                </button>
              </div>

              {/* 4 Verified Platform Metric Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-blue-100/80 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-blue-600 font-mono-numbers">৪টি বিষয়</div>
                  <div className="text-[11px] font-semibold text-slate-500">গণিত, পদার্থ, রসায়ন, জীব</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-blue-100/80 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-indigo-600 font-mono-numbers">৯টি বোর্ড</div>
                  <div className="text-[11px] font-semibold text-slate-500">২০২০–২০২৫ বোর্ড কাভারেজ</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-blue-100/80 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-cyan-600 font-mono-numbers">যাচাইকৃত</div>
                  <div className="text-[11px] font-semibold text-slate-500">এনসিটিবি পাঠ্যক্রম ও সমাধান</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-blue-100/80 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono-numbers">পাবলিক বেটা</div>
                  <div className="text-[11px] font-semibold text-slate-500">১৪ দিনের সম্পূর্ণ ফ্রি ট্রায়াল</div>
                </div>
              </div>

            </div>

            {/* Right Column (5 Cols): Hero Graphic Card with Floating Glass Panels */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              {/* Outer Card with subtle glow */}
              <div className="relative w-full max-w-md bg-gradient-to-tr from-blue-100/60 via-white to-cyan-50/70 p-4 sm:p-5 rounded-3xl border border-blue-200/80 shadow-2xl shadow-blue-500/10">
                
                {/* Floating Badge 1: Top Right */}
                <div className={`absolute -top-3 -right-3 sm:-right-4 ${isLoggedIn ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white/95 border-blue-200 text-[#0F172A]'} backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border flex items-center gap-1.5 z-20`}>
                  {isLoggedIn ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold">{lang === 'bn' ? 'প্রোফাইল সক্রিয়' : 'Profile Active'}</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold">{lang === 'bn' ? 'ডেমো প্রিভিউ' : 'Demo Preview'}</span>
                    </>
                  )}
                </div>

                {/* Main Hero Card Container */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-blue-500/10 to-indigo-500/5 border border-blue-100 p-6 flex flex-col items-center justify-center min-h-[360px]">
                  
                  {/* Hidden File Picker for Student Photo */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Student Avatar / Illustration */}
                  <div className="relative group/avatar mb-3">
                    {/* Gradient Ring Frame */}
                    <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-500 p-1.5 shadow-xl shadow-blue-500/25 transition-transform duration-300 group-hover/avatar:scale-102">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full rounded-full bg-gradient-to-b from-blue-50 to-slate-100 overflow-hidden relative flex items-center justify-center cursor-pointer shadow-inner"
                        title={lang === 'bn' ? 'ছবি পরিবর্তন করতে ক্লিক করুন' : 'Click to change photo'}
                      >
                        <img
                          src={activePhotoUrl}
                          alt={studentDisplayName}
                          className="w-full h-full object-cover object-center transition duration-300 group-hover/avatar:scale-105"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentDisplayName)}&background=0284c7&color=ffffff&size=256&bold=true`;
                          }}
                        />

                        {/* Hover Overlay with Camera Icon */}
                        <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center backdrop-blur-2xs">
                          <Camera className="w-6 h-6 mb-1 text-white animate-pulse" />
                          <span className="text-[10px] font-bold tracking-tight leading-tight">
                            {lang === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Photo'}
                          </span>
                        </div>
                      </div>

                      {/* Floating Camera / Upload Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        disabled={isUploading}
                        className="absolute bottom-1 right-1 p-2.5 bg-blue-600 hover:bg-blue-700 active:scale-90 text-white rounded-full shadow-lg border-2 border-white transition-all hover:scale-110 cursor-pointer z-10 flex items-center justify-center"
                        title={lang === 'bn' ? 'নিজের ছবি আপলোড করুন' : 'Upload your photo'}
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Upload Success Notice */}
                  {uploadSuccessToast && (
                    <div className="mb-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'bn' ? 'ছবি সফলভাবে সংরক্ষিত হয়েছে!' : 'Photo saved successfully!'}</span>
                    </div>
                  )}

                  {/* Student Identity Information */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{studentDisplayName}</h3>
                      {currentUser?.email && (
                        <span className="inline-flex items-center text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200" title={`Signed in: ${currentUser.email}`}>
                          ✓ {currentUser.role === 'admin' ? 'অ্যাডমিন' : currentUser.role === 'teacher' ? 'শিক্ষক' : 'শিক্ষার্থী'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{studentBatchName}</p>

                    {/* Interactive Photo Upload / Reset Trigger */}
                    <div className="mt-2.5 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 shadow-2xs transition-all hover:border-blue-300 cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-blue-600" />
                        <span>
                          {isUploading
                            ? (lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...')
                            : studentPhoto
                            ? (lang === 'bn' ? 'নতুন ছবি আপলোড' : 'Change Photo')
                            : (lang === 'bn' ? 'নিজের ছবি আপলোড করুন' : 'Upload Your Photo')}
                        </span>
                      </button>

                      {studentPhoto && (
                        <button
                          type="button"
                          onClick={handleResetPhoto}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 text-[11px] font-semibold border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
                          title={lang === 'bn' ? 'ডিফল্ট ছবিতে ফিরুন' : 'Reset to default picture'}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Card: Genuine Real Statistics / Zero-State / Clear Demo Label */}
                  {isLoggedIn ? (
                    totalExamsCount > 0 ? (
                      <div className="w-full mt-5 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-blue-100 shadow-md text-left">
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-600">{lang === 'bn' ? 'তোমার সার্বিক নির্ভুলতা' : 'Your Accuracy'}</span>
                          <span className="text-blue-600 font-mono-numbers">{averageAccuracy}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, averageAccuracy))}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                          <span>{totalExamsCount}টি পরীক্ষা সম্পন্ন</span>
                          <span className="text-emerald-600 font-bold">রিয়েল ট্র্যাকিং ✓</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full mt-5 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-blue-100 shadow-md text-left">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-slate-600">{lang === 'bn' ? 'তোমার প্রস্তুতি' : 'Your Progress'}</span>
                          <span className="text-slate-400 font-mono-numbers">০%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                          <div className="bg-blue-300 h-2 rounded-full w-0" />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-slate-500 font-medium">
                            {lang === 'bn' ? 'এখনো কোনো পরীক্ষা সম্পন্ন হয়নি' : 'No exams completed yet'}
                          </p>
                          <button
                            type="button"
                            onClick={onStartExam}
                            className="text-[11px] font-bold text-blue-600 hover:underline"
                          >
                            {lang === 'bn' ? 'পরীক্ষা দাও →' : 'Start Exam →'}
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="w-full mt-5 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-blue-100 shadow-md text-left">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-500 text-[11px] font-bold">{lang === 'bn' ? 'নমুনা অগ্রগতি (প্রিভিউ)' : 'Sample Progress (Demo)'}</span>
                        <span className="text-blue-600 font-mono-numbers">85%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-[85%]" />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                        <span>Algebra: <strong className="text-emerald-600">92%</strong></span>
                        <span>Motion: <strong className="text-blue-600">84%</strong></span>
                        <span>Force: <strong className="text-amber-600">76%</strong></span>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM FEATURE CARDS (6 Pills matching Screen 1)               */}
        {/* ============================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            {/* 1. AI Diagnostic Exam */}
            <button
              type="button"
              onClick={onStartExam}
              className="bg-white p-4 rounded-2xl border border-blue-100/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A] leading-snug">AI Diagnostic Exam</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'bn' ? 'দুর্বলতা শনাক্তকরণ' : 'Identify Weakness'}</div>
              </div>
            </button>

            {/* 2. Mistake Notebook */}
            <button
              type="button"
              onClick={() => onNavigate('mistakes')}
              className="bg-white p-4 rounded-2xl border border-blue-100/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A] leading-snug">Mistake Notebook</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'bn' ? 'ভুল সংশোধন ডায়েরি' : 'Spaced Repetition'}</div>
              </div>
            </button>

            {/* 3. Adaptive Practice */}
            <button
              type="button"
              onClick={onStartExam}
              className="bg-white p-4 rounded-2xl border border-blue-100/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A] leading-snug">Adaptive Practice</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'bn' ? 'স্মার্ট এআই অনুশীলন' : 'Personalized Sets'}</div>
              </div>
            </button>

            {/* 4. Friend Challenge */}
            <button
              type="button"
              onClick={() => onNavigate('challenge')}
              className="bg-white p-4 rounded-2xl border border-blue-100/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A] leading-snug">Friend Challenge</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'bn' ? '১v১ সরাসরি যুদ্ধ' : '1v1 Quiz Battle'}</div>
              </div>
            </button>

            {/* 5. Board Pattern Questions */}
            <button
              type="button"
              onClick={() => onNavigate('historical')}
              className="bg-white p-4 rounded-2xl border border-blue-100/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A] leading-snug">Board Pattern</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'bn' ? 'আসল বোর্ড প্রশ্ন' : 'NCTB Syllabus'}</div>
              </div>
            </button>

            {/* 6. Smart Analytics */}
            <button
              type="button"
              onClick={() => onNavigate('student-dashboard')}
              className="bg-white p-4 rounded-2xl border border-blue-100/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A] leading-snug">Smart Analytics</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{lang === 'bn' ? 'বিষয়ভিত্তিক নির্ভুলতা' : 'Accuracy Insights'}</div>
              </div>
            </button>

          </div>
        </div>

      </section>

      {/* ============================================================== */}
      {/* 2. FOUR EASY STEPS TO EXCELLENCE                              */}
      {/* ============================================================== */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-semibold mb-3">
            <span>{t.featBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {t.featTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-4 border border-blue-100">
              01
            </div>
            <h3 className="font-bold text-base text-[#0F172A] mb-2">{t.featStep1Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.featStep1Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-4 border border-blue-100">
              02
            </div>
            <h3 className="font-bold text-base text-[#0F172A] mb-2">{t.featStep2Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.featStep2Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-4 border border-blue-100">
              03
            </div>
            <h3 className="font-bold text-base text-[#0F172A] mb-2">{t.featStep3Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.featStep3Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-4 border border-blue-100">
              04
            </div>
            <h3 className="font-bold text-base text-[#0F172A] mb-2">{t.featStep4Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.featStep4Desc}</p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. FOUNDER & ABOUT SECTION (Matching Screen 17)               */}
      {/* ============================================================== */}
      <FounderSection lang={lang} onExploreExams={onStartExam} />

    </div>
  );
};
