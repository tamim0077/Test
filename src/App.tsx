import { apiFetch as fetch } from './utils/api.ts';
import React, { useState, useEffect, useRef } from 'react';
import type { UserRole, StudentProfile, TeacherBatch, UserMistakeEntry, ChallengeData, UserAccount } from './types.ts';
import type { GradedExamResult } from './utils/examScoring.ts';
import { Navbar } from './components/Navbar.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { TeacherPendingPage } from './components/TeacherPendingPage.tsx';
import { StudentOnboarding } from './components/StudentOnboarding.tsx';
import { StudentDashboard } from './components/StudentDashboard.tsx';
import { ExamScreen, type ExamQuestionView } from './components/ExamScreen.tsx';
import { ExamResultView } from './components/ExamResultView.tsx';
import { MistakeNotebook } from './components/MistakeNotebook.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { FriendsChallenge } from './components/FriendsChallenge.tsx';
import { HistoricalAnalysisView } from './components/HistoricalAnalysisView.tsx';
import { AiStudyCoachModal } from './components/AiStudyCoachModal.tsx';
import { AdaptivePracticeModal } from './components/AdaptivePracticeModal.tsx';
import { DailyActivitiesModal } from './components/DailyActivitiesModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { ExamSetupPage } from './components/ExamSetupPage.tsx';
import { translations, type Language } from './utils/i18n.ts';
import {
  auth,
  onAuthStateChanged,
  getFirestoreUserProfile,
  saveFirestoreUserProfile,
  getFirestoreExamResults,
  getFirestoreMistakes,
  getFirestoreBatches,
} from './config/firebase.ts';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { calculateUpdatedStreak, getActiveDisplayStreak } from './utils/streakCalculator.ts';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  // Language State with persistence (Default: Bangla)
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('examdna_lang') as Language) || 'bn';
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('examdna_lang', newLang);
  };

  // Auth Loading State: Strictly blocks protected content until auth verification completes
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [pendingExamId, setPendingExamId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlExam = new URLSearchParams(window.location.search).get('exam');
      if (urlExam) sessionStorage.setItem('examdna_pending_exam_id', urlExam);
      return sessionStorage.getItem('examdna_pending_exam_id') || urlExam || null;
    }
    return null;
  });

  // Active View: 'login' | 'student-dashboard' | 'teacher-dashboard' | 'teacher-pending' | 'admin' | 'exam' | 'result' | 'mistakes' | 'challenge' | 'exam-setup'
  const [currentView, setCurrentView] = useState<string>('login');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Modals
  const [isDailyActivitiesOpen, setIsDailyActivitiesOpen] = useState(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [aiCoachContext, setAiCoachContext] = useState<{ question?: string; explanation?: string }>({});
  const [isAdaptiveModalOpen, setIsAdaptiveModalOpen] = useState(false);

  // Student Profile
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    id: '',
    name: '',
    role: 'student',
    track: 'science',
    examLevel: 'SSC',
    examYear: '2027',
    activeSubject: 'সাধারণ গণিত',
    streakDays: 0,
  });

  // Mistakes, Batches & Exam States
  const [mistakes, setMistakes] = useState<UserMistakeEntry[]>([]);
  const [batches, setBatches] = useState<TeacherBatch[]>([]);
  const [activeExam, setActiveExam] = useState<{
    id: string;
    title: string;
    questions: ExamQuestionView[];
    timeLimitMinutes: number;
    deadline?: number;
    publishedExamId?: string;
  } | null>(null);
  const [activeResult, setActiveResult] = useState<GradedExamResult | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeData | null>(null);

  // Real Authoritative Exam Statistics
  const [totalExamsCount, setTotalExamsCount] = useState<number>(0);
  const [averageAccuracy, setAverageAccuracy] = useState<number>(0);
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [notice, setNotice] = useState('');
  const identityVersion = useRef(0);

  const applyHistory = (results: any[]) => {
    setExamHistory(results);
    setTotalExamsCount(results.length);
    const total = results.reduce((n, r) => n + r.totalQuestions, 0);
    setAverageAccuracy(total ? Math.round(results.reduce((n, r) => n + r.score, 0) / total * 100) : 0);
  };

  const applyUser = (profile: UserAccount) => {
    setCurrentUser(profile);
    setUserRole(profile.role);
    setStudentProfile({
      id: profile.id,
      name: profile.name,
      role: profile.role,
      track: profile.track || 'science',
      examLevel: profile.examLevel || 'SSC',
      examYear: profile.examYear || '2027',
      activeSubject: profile.subject || 'সাধারণ গণিত',
      streakDays: profile.streakDays || 0,
      lastActivityDate: profile.lastActivityDate,
      photoUrl: profile.photoUrl,
    });
  };

  // Role-based Navigation Guard & Redirection
  const navigateWithPermission = (targetView: string) => {
    if (!currentUser) {
      setCurrentView('login');
      return;
    }

    if (currentUser.role === 'student') {
      const studentAllowed = ['student-dashboard', 'exam-setup', 'exam', 'result', 'mistakes', 'challenge'];
      if (studentAllowed.includes(targetView)) {
        setCurrentView(targetView);
      } else {
        setNotice(lang === 'bn' ? 'অ্যাক্সেস অস্বীকৃত: আপনি একজন শিক্ষার্থী। শিক্ষক বা অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই।' : 'Access denied: You only have access to student pages.');
        setCurrentView('student-dashboard');
      }
    } else if (currentUser.role === 'teacher') {
      if (!currentUser.isVerifiedTeacher) {
        setCurrentView('teacher-pending');
        return;
      }
      const teacherAllowed = ['teacher-dashboard'];
      if (teacherAllowed.includes(targetView)) {
        setCurrentView(targetView);
      } else {
        setNotice(lang === 'bn' ? 'অ্যাক্সেস অস্বীকৃত: আপনি একজন শিক্ষক। শুধুমাত্র শিক্ষক প্যানেলে প্রবেশের অনুমতি রয়েছে।' : 'Access denied: You only have access to teacher workspace.');
        setCurrentView('teacher-dashboard');
      }
    } else if (currentUser.role === 'admin') {
      setCurrentView(targetView);
    }
  };

  // Initial Auth State Listener & Dynamic Synchronization
  useEffect(() => {
    let mounted = true;
    setAuthLoading(true);

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      const version = ++identityVersion.current;

      if (!fbUser) {
        setMistakes([]);
        setBatches([]);
        setCurrentChallenge(null);
        setActiveResult(null);
        applyHistory([]);
        setCurrentUser(null);
        setActiveExam(null);
        setUserRole('student');
        setCurrentView('login');
        if (mounted) setAuthLoading(false);
        return;
      }

      try {
        const [profile, history, savedMistakes, savedBatches] = await Promise.all([
          getFirestoreUserProfile(fbUser.uid),
          getFirestoreExamResults(fbUser.uid),
          getFirestoreMistakes(fbUser.uid),
          getFirestoreBatches(),
        ]);

        if (!mounted || version !== identityVersion.current || auth.currentUser?.uid !== fbUser.uid) return;

        if (profile) {
          applyUser(profile);
          applyHistory(history);
          setMistakes(savedMistakes);
          setBatches(savedBatches);

          // Route strictly according to backend-verified role
          if (profile.role === 'admin') {
            setCurrentView('admin');
          } else if (profile.role === 'teacher') {
            setCurrentView(profile.isVerifiedTeacher ? 'teacher-dashboard' : 'teacher-pending');
          } else {
            // Student role: check if assignment link was pending
            const storedExam = sessionStorage.getItem('examdna_pending_exam_id') || pendingExamId;
            if (storedExam) {
              sessionStorage.removeItem('examdna_pending_exam_id');
              setPendingExamId(null);
              await loadAndStartPublishedExam(storedExam);
            } else {
              // Direct URL parameter inspection
              const params = new URLSearchParams(window.location.search);
              if (params.get('challenge')) {
                setCurrentView('challenge');
              } else {
                setCurrentView('student-dashboard');
              }
            }
          }
        } else {
          setCurrentView('login');
        }
      } catch (error: any) {
        if (mounted && version === identityVersion.current) setNotice(error.message);
        setCurrentView('login');
      } finally {
        if (mounted && version === identityVersion.current) setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      identityVersion.current++;
      unsubscribeAuth();
    };
  }, []);

  // Save active exam snapshot in progress
  useEffect(() => {
    if (activeExam && currentView === 'exam' && currentUser) {
      localStorage.setItem('examdna_active_exam_snapshot', JSON.stringify({
        activeExam,
        owner: currentUser.id,
        savedAt: Date.now(),
      }));
    }
  }, [activeExam, currentView, currentUser]);

  // Load and start published assignment exam with strict permission check
  const loadAndStartPublishedExam = async (examId: string) => {
    const version = identityVersion.current;
    try {
      const res = await fetch(`/api/exams/${examId}`);
      if (res.ok) {
        const data = await res.json();
        if (version !== identityVersion.current) return;
        if (data.result) {
          setActiveResult(data.result);
          setCurrentView('result');
          return;
        }
        const examObj = {
          id: data.id,
          title: data.title,
          questions: data.questions,
          timeLimitMinutes: data.timeLimitMinutes,
          deadline: data.deadline,
          publishedExamId: data.publishedExamId,
        };
        setActiveExam(examObj);
        if (currentUser) {
          localStorage.setItem('examdna_active_exam_snapshot', JSON.stringify({
            activeExam: examObj,
            owner: currentUser.id,
            savedAt: Date.now(),
          }));
        }
        setCurrentView('exam');
      }
    } catch (e: any) {
      const isBatchDenied = e?.message?.toLowerCase().includes('batch enrollment') || e?.message?.includes('403');
      setNotice(
        isBatchDenied
          ? (lang === 'bn'
              ? 'অ্যাক্সেস অস্বীকৃত: আপনি এই অ্যাসাইনমেন্ট পরীক্ষার নির্ধারিত ব্যাচে অন্তর্ভুক্ত নন। শিক্ষকের ব্যাচ কোড দিয়ে প্রথমে যুক্ত হন।'
              : 'Access denied: You are not enrolled in the required batch for this assignment.')
          : (e instanceof Error ? e.message : 'Could not load exam. Please retry.')
      );
      setCurrentView('student-dashboard');
    }
  };

  // Auth Success Callback (from LoginPage)
  const handleAuthSuccess = async (user: UserAccount, token?: string) => {
    if (token) localStorage.setItem('examdna_token', token);
    const version = ++identityVersion.current;
    setAuthLoading(true);

    try {
      const [profile, history, savedMistakes, savedBatches] = await Promise.all([
        getFirestoreUserProfile(user.id),
        getFirestoreExamResults(user.id),
        getFirestoreMistakes(user.id),
        getFirestoreBatches(),
      ]);

      if (version !== identityVersion.current || auth.currentUser?.uid !== user.id || !profile) return;
      applyUser(profile);
      applyHistory(history);
      setMistakes(savedMistakes);
      setBatches(savedBatches);

      // Route strictly based on backend-verified role
      if (profile.role === 'admin') {
        setCurrentView('admin');
      } else if (profile.role === 'teacher') {
        setCurrentView(profile.isVerifiedTeacher ? 'teacher-dashboard' : 'teacher-pending');
      } else {
        const storedExam = sessionStorage.getItem('examdna_pending_exam_id') || pendingExamId;
        if (storedExam) {
          sessionStorage.removeItem('examdna_pending_exam_id');
          setPendingExamId(null);
          await loadAndStartPublishedExam(storedExam);
        } else {
          setCurrentView('student-dashboard');
        }
      }
    } catch (error: any) {
      setNotice(error.message);
      setCurrentView('login');
    } finally {
      setAuthLoading(false);
    }
  };

  // Refresh teacher approval status from TeacherPendingPage
  const handleRefreshTeacherStatus = async () => {
    if (!currentUser) return;
    const version = identityVersion.current;
    const profile = await getFirestoreUserProfile(currentUser.id);
    if (profile && version === identityVersion.current) {
      applyUser(profile);
      if (profile.isVerifiedTeacher) {
        setNotice(lang === 'bn' ? 'অভিনন্দন! আপনার শিক্ষক অ্যাকাউন্ট অনুমোদিত হয়েছে।' : 'Congratulations! Your teacher account is approved.');
        setCurrentView('teacher-dashboard');
      }
    }
  };

  // Logout Handler: Purges account data and locks session
  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Continue cleanup even if network request fails
    }

    const token = localStorage.getItem('examdna_token');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    identityVersion.current++;
    localStorage.removeItem('examdna_active_exam_snapshot');
    localStorage.removeItem('examdna_token');
    sessionStorage.removeItem('examdna_pending_exam_id');

    setActiveExam(null);
    applyHistory([]);
    setCurrentUser(null);
    setUserRole('student');
    setStudentProfile({
      id: '',
      name: '',
      role: 'student',
      track: 'science',
      examLevel: 'SSC',
      examYear: '2027',
      activeSubject: 'সাধারণ গণিত',
      streakDays: 0,
    });
    setTotalExamsCount(0);
    setAverageAccuracy(0);
    setMistakes([]);
    setActiveResult(null);
    setPendingExamId(null);
    setCurrentView('login');
  };

  // Student Photo Update Handler
  const handleUpdateStudentPhoto = async (newPhotoUrl: string | null) => {
    if (!currentUser) return;
    const version = identityVersion.current;
    try {
      const response = await fetch('/api/user/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: newPhotoUrl }),
      });
      const data = await response.json();
      if (version === identityVersion.current && data.user) applyUser(data.user);
    } catch (error: any) {
      setNotice(error.message);
    }
  };

  // Custom Exam Start Handler
  const handleStartCustomExam = async (config: {
    level: string;
    subject: string;
    chapters: string[];
    questionSource: string;
    board?: string;
    year?: string;
    count: number;
    difficulty: string;
    duration: number;
    allowPartial?: boolean;
  }) => {
    try {
      const response = await fetch('/api/exams/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        return {
          success: false,
          error: data.error,
          availableCount: data.availableCount,
          requestedCount: data.requestedCount,
          message: data.message,
        };
      }

      setActiveExam({
        id: data.examId,
        title: data.title,
        questions: data.questions,
        timeLimitMinutes: data.timeLimitMinutes,
        deadline: data.deadline,
      });
      setCurrentView('exam');
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: 'network_error',
        message: err.message || (lang === 'bn' ? 'পরীক্ষা শুরু করতে ব্যর্থ হয়েছে।' : 'Failed to start exam.'),
      };
    }
  };

  // Diagnostic Exam Start
  const handleStartDiagnostic = async (subject: string = 'all') => {
    try {
      const response = await fetch('/api/exams/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, count: 12 }),
      });
      const data = await response.json();
      if (data.examId && data.questions) {
        setActiveExam({
          id: data.examId,
          title: data.title,
          questions: data.questions,
          timeLimitMinutes: data.timeLimitMinutes,
          deadline: data.deadline,
        });
        setCurrentView('exam');
      }
    } catch (err: any) {
      setNotice(err.message || 'ডায়াগনস্টিক পরীক্ষা শুরু করা যায়নি।');
    }
  };

  // Adaptive Practice Start
  const handleStartAdaptive = async (count: number) => {
    try {
      const response = await fetch('/api/adaptive/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const data = await response.json();
      if (data.examId && data.questions) {
        setIsAdaptiveModalOpen(false);
        setActiveExam({
          id: data.examId,
          title: data.title || 'অ্যাডাপটিভ অনুশীলন পরীক্ষা',
          questions: data.questions,
          timeLimitMinutes: data.timeLimitMinutes || 15,
          deadline: data.deadline,
        });
        setCurrentView('exam');
      }
    } catch (err: any) {
      setNotice(err.message || 'অ্যাডাপটিভ পরীক্ষা তৈরি করা যায়নি।');
    }
  };

  // Submit Exam
  const handleSubmitExam = async (answers: Record<string, number>, timeSpentSeconds: number) => {
    if (!activeExam) return;
    const response = await fetch('/api/exams/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examId: activeExam.id,
        publishedExamId: activeExam.publishedExamId,
        answers,
        timeSpentSeconds,
      }),
    });
    const result: GradedExamResult = await response.json();

    localStorage.removeItem('examdna_active_exam_snapshot');
    setActiveExam(null);
    setActiveResult(result);
    setCurrentView('result');

    // Re-sync user's history and mistakes
    if (currentUser) {
      const [history, savedMistakes] = await Promise.all([
        getFirestoreExamResults(currentUser.id),
        getFirestoreMistakes(currentUser.id),
      ]);
      applyHistory(history);
      setMistakes(savedMistakes);
    }
  };

  // Retry Mistake Question
  const handleRetryQuestion = async (questionId: string, selectedOptionIndex: number) => {
    const res = await fetch('/api/mistakes/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, selectedOptionIndex }),
    });
    const data = await res.json();
    if (currentUser) {
      const savedMistakes = await getFirestoreMistakes(currentUser.id);
      setMistakes(savedMistakes);
    }
    return data;
  };

  // Join Batch
  const handleJoinBatch = async (batchCode: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/batches/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: batchCode }),
      });
      if (!res.ok) return false;
      if (currentUser) {
        const savedBatches = await getFirestoreBatches();
        setBatches(savedBatches);
      }
      return true;
    } catch {
      return false;
    }
  };

  // Teacher Create Batch
  const handleCreateBatch = async (batchData: any) => {
    if (!currentUser || currentUser.role !== 'teacher' || !currentUser.isVerifiedTeacher) {
      throw new Error('Approved teacher access required.');
    }
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData),
    });
    const newBatch = await res.json();
    setBatches((prev) => [newBatch, ...prev]);
    return newBatch;
  };

  // Teacher Generate Exam
  const handleTeacherGenerateExam = async (spec: any) => {
    const res = await fetch('/api/teacher/generate-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spec),
    });
    return res.json();
  };

  // Teacher Publish Exam
  const handleTeacherPublishExam = async (examData: any) => {
    const res = await fetch('/api/teacher/publish-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examData),
    });
    return res.json();
  };

  // Friends Challenge Handlers
  const handleCreateChallenge = async (challengeSpec: any) => {
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(challengeSpec),
    });
    const data = await res.json();
    setCurrentChallenge(data);
    return data;
  };

  const handleStartTakingChallenge = (challenge: ChallengeData) => {
    setCurrentChallenge(challenge);
    setActiveExam({
      id: challenge.code,
      title: `${challenge.chapter} - ফ্রেন্ডস চ্যালেঞ্জ`,
      questions: challenge.questions as any,
      timeLimitMinutes: 10,
    });
    setCurrentView('exam');
  };

  const handleOpenAiCoachWithContext = (questionText: string, explanation: string) => {
    setAiCoachContext({ question: questionText, explanation });
    setIsAiCoachOpen(true);
  };

  // =========================================================================
  // 1. STRICT LOADING SCREEN: Blocks protected content during auth check
  // =========================================================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/25 mb-4 animate-pulse">
          DNA
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-black text-[#0F172A]">ExamDNA</span>
          <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
            BD
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>{lang === 'bn' ? 'অ্যাকাউন্ট ভেরিফাই করা হচ্ছে...' : 'Verifying authentication...'}</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. UNAUTHENTICATED USERS: Display ONLY the Login / Sign-up Page
  // =========================================================================
  if (!currentUser) {
    return (
      <LoginPage
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onAuthSuccess={handleAuthSuccess}
        pendingExamId={pendingExamId}
      />
    );
  }

  // =========================================================================
  // 3. AUTHENTICATED USERS: Role-Partitioned Dashboards & Pages
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Global Notifications & Security Alerts */}
      {notice && (
        <div role="alert" className="p-3.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            className="underline font-bold text-amber-800 hover:text-amber-950 ml-4 cursor-pointer"
            onClick={() => setNotice('')}
          >
            {lang === 'bn' ? 'ঠিক আছে' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Role-Partitioned Navigation Bar (Only rendered for logged in users) */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateWithPermission}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        streakDays={getActiveDisplayStreak(studentProfile.streakDays, studentProfile.lastActivityDate)}
      />

      {/* Main Views Container strictly enforcing role permissions */}
      <main className="flex-1">
        {/* Teacher Pending Approval Screen */}
        {currentView === 'teacher-pending' && currentUser.role === 'teacher' && (
          <TeacherPendingPage
            currentUser={currentUser}
            lang={lang}
            onRefreshStatus={handleRefreshTeacherStatus}
            onLogout={handleLogout}
          />
        )}

        {/* Student Dashboard */}
        {currentView === 'student-dashboard' && currentUser.role === 'student' && (
          <StudentDashboard
            profile={studentProfile}
            examHistory={examHistory}
            onReviewResult={(result) => {
              setActiveResult(result);
              setCurrentView('result');
            }}
            currentUser={currentUser}
            mistakes={mistakes}
            totalExamsCount={totalExamsCount}
            averageAccuracy={averageAccuracy}
            onStartDiagnostic={() => handleStartDiagnostic('all')}
            onStartAdaptive={() => setIsAdaptiveModalOpen(true)}
            onOpenMistakes={() => setCurrentView('mistakes')}
            onOpenChallenge={() => setCurrentView('challenge')}
            onOpenAiCoach={() => {
              setAiCoachContext({});
              setIsAiCoachOpen(true);
            }}
            onOpenDailyActivities={() => setIsDailyActivitiesOpen(true)}
            onJoinBatch={handleJoinBatch}
            onNavigateToSetup={() => setCurrentView('exam-setup')}
          />
        )}

        {/* Exam Setup Wizard (Student only) */}
        {currentView === 'exam-setup' && currentUser.role === 'student' && (
          <ExamSetupPage
            lang={lang}
            onStartExam={handleStartCustomExam}
            onBack={() => setCurrentView('student-dashboard')}
          />
        )}

        {/* Live Exam Screen (Student only) */}
        {currentView === 'exam' && activeExam && currentUser.role === 'student' && (
          <ExamScreen
            key={activeExam.id}
            deadline={activeExam.deadline}
            examId={activeExam.id}
            title={activeExam.title}
            questions={activeExam.questions}
            timeLimitMinutes={activeExam.timeLimitMinutes}
            publishedExamId={activeExam.publishedExamId}
            onSubmitExam={handleSubmitExam}
            onExit={() => {
              localStorage.removeItem('examdna_active_exam_snapshot');
              setCurrentView('student-dashboard');
            }}
          />
        )}

        {/* Exam Result View */}
        {currentView === 'result' && activeResult && (
          <ExamResultView
            result={activeResult}
            onOpenMistakes={() => setCurrentView('mistakes')}
            onStartAdaptive={() => setIsAdaptiveModalOpen(true)}
            onRetake={() => handleStartDiagnostic('all')}
            onBackToDashboard={() => setCurrentView('student-dashboard')}
          />
        )}

        {/* Mistake Notebook (Student only) */}
        {currentView === 'mistakes' && currentUser.role === 'student' && (
          <MistakeNotebook
            key={studentProfile.id}
            mistakes={mistakes}
            onRetryQuestion={handleRetryQuestion}
            onOpenAiCoachWithQuestion={handleOpenAiCoachWithContext}
            onBack={() => setCurrentView('student-dashboard')}
          />
        )}

        {/* Friends Challenge (Student only) */}
        {currentView === 'challenge' && currentUser.role === 'student' && (
          <FriendsChallenge
            currentUser={currentUser}
            studentProfile={studentProfile}
            currentChallenge={currentChallenge}
            onCreateChallenge={handleCreateChallenge}
            onStartTakingChallenge={handleStartTakingChallenge}
            onBack={() => setCurrentView('student-dashboard')}
          />
        )}

        {/* Teacher Workspace / Dashboard (Approved Teachers only) */}
        {currentView === 'teacher-dashboard' && currentUser.role === 'teacher' && currentUser.isVerifiedTeacher && (
          <TeacherDashboard
            batches={batches}
            onCreateBatch={handleCreateBatch}
            onGenerateExam={handleTeacherGenerateExam}
            onPublishExam={handleTeacherPublishExam}
            onBackToStudent={() => {
              setNotice(lang === 'bn' ? 'শিক্ষক অ্যাকাউন্ট থেকে সরাসরি শিক্ষার্থী মোডে যাওয়ার অনুমতি নেই।' : 'Switching to student mode is not permitted.');
            }}
          />
        )}

        {/* Protected Admin Dashboard (Admins only) */}
        {currentView === 'admin' && currentUser.role === 'admin' && (
          <AdminDashboard
            lang={lang}
            currentUser={currentUser}
            onLogout={handleLogout}
            onAdminAuthSuccess={handleAuthSuccess}
            onExitAdminView={() => setCurrentView('admin')}
          />
        )}
      </main>

      {/* Floating AI Study Coach Quick-Launcher (Only for logged-in students outside of active exams) */}
      {!isAiCoachOpen && currentView !== 'exam' && currentUser.role === 'student' && (
        <button
          type="button"
          onClick={() => {
            setAiCoachContext({});
            setIsAiCoachOpen(true);
          }}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-xl shadow-blue-500/30 border border-blue-400/40 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          title="ExamDNA বাংলা AI স্টাডি কোচ"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight">AI স্টাডি কোচ</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
            $০ ফ্রি
          </span>
        </button>
      )}

      {/* Bangla AI Study Coach Modal */}
      {currentUser.role === 'student' && (
        <AiStudyCoachModal
          isOpen={isAiCoachOpen}
          onClose={() => setIsAiCoachOpen(false)}
          mistakes={mistakes}
          initialQuestion={aiCoachContext.question}
          initialExplanation={aiCoachContext.explanation}
        />
      )}

      {/* Adaptive Practice Launcher Modal */}
      {currentUser.role === 'student' && (
        <AdaptivePracticeModal
          isOpen={isAdaptiveModalOpen}
          onClose={() => setIsAdaptiveModalOpen(false)}
          mistakes={mistakes}
          onConfirmStart={(count) => handleStartAdaptive(count)}
        />
      )}

      {/* Daily Micro-Activities Modal */}
      {currentUser.role === 'student' && (
        <DailyActivitiesModal
          isOpen={isDailyActivitiesOpen}
          onClose={() => setIsDailyActivitiesOpen(false)}
          mistakes={mistakes}
          availableQuestions={[]}
        />
      )}
    </div>
  );
}
