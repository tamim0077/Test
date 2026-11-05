import React, { useState, useEffect } from 'react';
import type { UserRole, StudentProfile, TeacherBatch, UserMistakeEntry, ChallengeData, UserAccount } from './types.ts';
import type { GradedExamResult } from './utils/examScoring.ts';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
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
import { AuthModal } from './components/AuthModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { RoleSelectModal } from './components/RoleSelectModal.tsx';
import { ExamSetupPage } from './components/ExamSetupPage.tsx';
import { INITIAL_QUESTION_BANK } from './data/questionBank.ts';
import { translations, type Language } from './utils/i18n.ts';
import {
  auth,
  onAuthStateChanged,
  getFirestoreUserProfile,
  saveFirestoreUserProfile,
  getFirestoreExamResults,
  getFirestoreMistakes,
  saveFirestoreMistake,
  saveFirestoreExamResult,
  getFirestoreBatches,
} from './config/firebase.ts';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { calculateUpdatedStreak, getActiveDisplayStreak } from './utils/streakCalculator.ts';
import { Sparkles, MessageSquare } from 'lucide-react';

export default function App() {
  // Language State with persistence (Default: Bangla)
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('examdna_lang') as Language) || 'bn';
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('examdna_lang', newLang);
  };

  const [userRole, setUserRole] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<'student' | 'teacher'>('student');
  const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false);
  const [isDailyActivitiesOpen, setIsDailyActivitiesOpen] = useState(false);
  
  // Active View: 'landing' | 'student-dashboard' | 'teacher-dashboard' | 'admin' | 'exam' | 'result' | 'mistakes' | 'challenge' | 'historical' | 'exam-setup'
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window === 'undefined') return 'landing';
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname === '/admin' || params.get('admin') === '1') return 'admin';
    if (params.get('teacher') === '1') return 'teacher-dashboard';
    if (params.get('winner') === '1' || params.get('challenge') === '1') return 'challenge';
    if (params.get('student') === '1' || params.get('autostart') === '1') return 'student-dashboard';
    return 'landing';
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Student Profile (Defaults to clean guest state)
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    id: 'guest-student',
    name: '',
    role: 'student',
    track: 'science',
    examLevel: 'SSC',
    examYear: '2027',
    activeSubject: 'সাধারণ গণিত',
    streakDays: 0,
  });

  // Mistakes state
  const [mistakes, setMistakes] = useState<UserMistakeEntry[]>([]);

  // Batches state
  const [batches, setBatches] = useState<TeacherBatch[]>([]);

  // Active exam state
  const [activeExam, setActiveExam] = useState<{
    id: string;
    title: string;
    questions: ExamQuestionView[];
    timeLimitMinutes: number;
    publishedExamId?: string;
  } | null>(null);

  // Active exam result state
  const [activeResult, setActiveResult] = useState<GradedExamResult | null>(null);

  // Challenge state
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeData | null>(null);

  // Modals
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [aiCoachContext, setAiCoachContext] = useState<{ question?: string; explanation?: string }>({});
  const [isAdaptiveModalOpen, setIsAdaptiveModalOpen] = useState(false);

  // Real Authoritative Exam & Performance Statistics (starts at clean 0, no fake stats)
  const [totalExamsCount, setTotalExamsCount] = useState<number>(0);
  const [averageAccuracy, setAverageAccuracy] = useState<number>(0);

  // Initial Data Fetch & Dynamic Identity Synchronization
  useEffect(() => {
    // 1. Firebase Auth State Listener (Cloud Firestore Synced - Zero Cross-Account Leakage)
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser: any) => {
      if (fbUser) {
        // Clear previous user's private data first
        setMistakes([]);
        setActiveResult(null);
        setTotalExamsCount(0);
        setAverageAccuracy(0);

        try {
          let profile = await getFirestoreUserProfile(fbUser.uid);
          const isAdminEmail = fbUser.email?.toLowerCase() === 'mustafizurr131@gmail.com';

          if (!profile) {
            profile = {
              id: fbUser.uid,
              name: fbUser.displayName || 'শিক্ষার্থী',
              email: fbUser.email || '',
              role: isAdminEmail ? 'admin' : 'student',
              track: 'science',
              examLevel: 'SSC',
              examYear: '2027',
              streakDays: 0,
              photoUrl: fbUser.photoURL || undefined,
              isVerifiedTeacher: isAdminEmail,
            };
            await saveFirestoreUserProfile(profile);
          }

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
            photoUrl: profile.photoUrl || fbUser.photoURL || undefined,
          });

          // Fetch user's persistent exam results to calculate authoritative real statistics
          const examResults = await getFirestoreExamResults(fbUser.uid);
          if (examResults && examResults.length > 0) {
            setTotalExamsCount(examResults.length);
            let totalQ = 0;
            let totalCorrect = 0;
            for (const r of examResults) {
              totalQ += (r.totalQuestions || 0);
              totalCorrect += (r.score || 0);
            }
            const acc = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
            setAverageAccuracy(acc);
          } else {
            setTotalExamsCount(0);
            setAverageAccuracy(0);
          }

          // Fetch persistent mistakes
          const fbMistakes = await getFirestoreMistakes(fbUser.uid);
          if (fbMistakes && fbMistakes.length > 0) {
            setMistakes(fbMistakes);
          }
        } catch (err) {
          console.warn('Firebase user sync:', err);
        }
      } else {
        // User logged out: restore clean guest state
        setCurrentUser(null);
        setUserRole('student');
        setStudentProfile({
          id: 'guest-student',
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
      }
    });

    // 2. Fallback check for session token from server
    const savedToken = localStorage.getItem('examdna_token');
    if (savedToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setCurrentUser((prev) => prev || data.user);
            setUserRole((prev) => (prev !== 'student' ? prev : data.user.role));
            if (data.user.role === 'student' && data.user.name) {
              setStudentProfile((prev) => ({
                ...prev,
                id: data.user.id,
                name: data.user.name,
                streakDays: data.user.streakDays || prev.streakDays,
              }));
            }
          }
        })
        .catch((err) => console.error('Auth check error:', err));
    }

    // Fetch initial batches (Firestore first, with API fallback)
    getFirestoreBatches()
      .then((fbBatches) => {
        if (fbBatches && fbBatches.length > 0) {
          setBatches(fbBatches);
        } else {
          fetch('/api/batches')
            .then((res) => res.json())
            .then((data) => setBatches(data))
            .catch(() => {});
        }
      })
      .catch(() => {
        fetch('/api/batches')
          .then((res) => res.json())
          .then((data) => setBatches(data))
          .catch(() => {});
      });

    // Fetch mistakes
    fetch(`/api/mistakes?userId=${studentProfile.id}`)
      .then((res) => res.json())
      .then((data) => {
        setMistakes((prev) => (prev.length > 0 ? prev : data));
      })
      .catch((err) => console.error('Mistakes fetch err:', err));

    // Check URL params
    const params = new URLSearchParams(window.location.search);
    const examParam = params.get('exam');
    const challengeParam = params.get('challenge');
    const autostart = params.get('autostart');
    const adminParam = params.get('admin');
    const teacherParam = params.get('teacher');
    const studentParam = params.get('student');

    if (window.location.pathname === '/admin' || adminParam === '1') {
      setCurrentView('admin');
    } else if (teacherParam === '1') {
      setUserRole('teacher');
      setCurrentView('teacher-dashboard');
    } else if (studentParam === '1' || autostart === '1') {
      setUserRole('student');
      setCurrentView('student-dashboard');
    } else if (params.get('winner') === '1' || challengeParam === '1') {
      setCurrentView('challenge');
    } else if (examParam) {
      loadAndStartPublishedExam(examParam);
    } else if (challengeParam) {
      loadChallengeByCode(challengeParam);
    } else {
      // Restore active exam if page was refreshed during an ongoing exam session
      try {
        const savedExamSnapshot = localStorage.getItem('examdna_active_exam_snapshot');
        if (savedExamSnapshot) {
          const parsed = JSON.parse(savedExamSnapshot);
          if (
            parsed.activeExam &&
            Array.isArray(parsed.activeExam.questions) &&
            parsed.activeExam.questions.length > 0 &&
            Date.now() - parsed.savedAt < 3 * 3600 * 1000
          ) {
            setActiveExam(parsed.activeExam);
            setCurrentView('exam');
          }
        }
      } catch {
        localStorage.removeItem('examdna_active_exam_snapshot');
      }
    }

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const loadAndStartPublishedExam = async (examId: string) => {
    try {
      const res = await fetch(`/api/exams/${examId}`);
      if (res.ok) {
        const data = await res.json();
        const examObj = {
          id: data.id,
          title: data.title,
          questions: data.questions,
          timeLimitMinutes: data.timeLimitMinutes,
          publishedExamId: data.id,
        };
        setActiveExam(examObj);
        localStorage.setItem('examdna_active_exam_snapshot', JSON.stringify({ activeExam: examObj, savedAt: Date.now() }));
        setCurrentView('exam');
      }
    } catch (e) {
      console.error('Failed to load published exam:', e);
    }
  };

  const loadChallengeByCode = async (code: string) => {
    try {
      const res = await fetch(`/api/challenges/${code}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentChallenge(data);
        setCurrentView('challenge');
      }
    } catch (e) {
      console.error('Failed to load challenge:', e);
    }
  };

  // Helper to record seen question IDs to prevent repeats
  const markQuestionsAsSeen = (questionIds: string[]) => {
    try {
      const seen: string[] = JSON.parse(localStorage.getItem('examdna_seen_questions') || '[]');
      const updated = Array.from(new Set([...seen, ...questionIds]));
      // Keep most recent 150 IDs
      localStorage.setItem('examdna_seen_questions', JSON.stringify(updated.slice(-150)));
    } catch {
      // ignore
    }
  };

  // Start Diagnostic Exam (With non-repeating question protection)
  const handleStartDiagnostic = async (selectedSubject: string = 'all') => {
    try {
      const seenIds: string[] = JSON.parse(localStorage.getItem('examdna_seen_questions') || '[]');
      const res = await fetch('/api/exams/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          count: 12,
          recentQuestionIds: seenIds,
        }),
      });
      const data = await res.json();

      markQuestionsAsSeen(data.questions.map((q: any) => q.id));

      const examObj = {
        id: data.examId,
        title: data.title,
        questions: data.questions,
        timeLimitMinutes: data.timeLimitMinutes,
      };
      setActiveExam(examObj);
      localStorage.setItem('examdna_active_exam_snapshot', JSON.stringify({ activeExam: examObj, savedAt: Date.now() }));
      setCurrentView('exam');
    } catch (err) {
      console.error('Diagnostic error:', err);
    }
  };

  // Start 5-question Demo Exam (For Public Visitors)
  const handleTryDemoExam = async () => {
    try {
      const res = await fetch('/api/exams/demo');
      if (res.ok) {
        const data = await res.json();
        const examObj = {
          id: data.examId,
          title: data.title,
          questions: data.questions,
          timeLimitMinutes: data.timeLimitMinutes,
          isDemo: true,
        };
        setActiveExam(examObj);
        setCurrentView('exam');
      }
    } catch (err) {
      console.error('Demo exam error:', err);
    }
  };

  // Start Custom 8-step Exam
  const handleStartCustomExam = async (config: {
    level: string;
    subject: string;
    chapters: string[];
    questionSource: string;
    count: number;
    difficulty: string;
    duration: number;
    allowPartial?: boolean;
  }) => {
    try {
      const seenIds: string[] = JSON.parse(localStorage.getItem('examdna_seen_questions') || '[]');
      const res = await fetch('/api/exams/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          recentQuestionIds: seenIds,
        }),
      });
      const data = await res.json();

      if (data.error === 'insufficient_questions') {
        return {
          success: false,
          error: data.error,
          availableCount: data.availableCount,
          requestedCount: data.requestedCount,
          message: data.message,
        };
      }

      if (!data.questions || data.questions.length === 0) {
        return { success: false, error: 'no_questions' };
      }

      markQuestionsAsSeen(data.questions.map((q: any) => q.id));

      const examObj = {
        id: data.examId,
        title: data.title,
        questions: data.questions,
        timeLimitMinutes: data.timeLimitMinutes,
      };
      setActiveExam(examObj);
      localStorage.setItem('examdna_active_exam_snapshot', JSON.stringify({ activeExam: examObj, savedAt: Date.now() }));
      setCurrentView('exam');
      return { success: true };
    } catch (err) {
      console.error('Custom exam error:', err);
      return { success: false, error: 'network_error' };
    }
  };

  // Start Adaptive Practice
  const handleStartAdaptive = async (count: number = 10) => {
    try {
      const res = await fetch('/api/adaptive/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentProfile.id, count }),
      });
      const data = await res.json();

      markQuestionsAsSeen(data.questions.map((q: any) => q.id));

      const examObj = {
        id: data.examId,
        title: data.title,
        questions: data.questions,
        timeLimitMinutes: data.timeLimitMinutes,
      };
      setActiveExam(examObj);
      localStorage.setItem('examdna_active_exam_snapshot', JSON.stringify({ activeExam: examObj, savedAt: Date.now() }));
      setCurrentView('exam');
    } catch (err) {
      console.error('Adaptive error:', err);
    }
  };

  // Submit Exam
  const handleSubmitExam = async (answers: Record<string, number>, timeSpentSeconds: number) => {
    try {
      const questionIds = activeExam?.questions.map((q) => q.id);
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: activeExam?.id,
          publishedExamId: activeExam?.publishedExamId,
          answers,
          timeSpentSeconds,
          userId: studentProfile.id,
          questionIds,
        }),
      });

      const result: GradedExamResult = await res.json();
      setActiveResult(result);

      // 1. Authoritative Answer Accuracy Calculation (No double averaging)
      setTotalExamsCount((prev) => {
        const nextCount = prev + 1;
        setAverageAccuracy((prevAcc) => {
          if (prev === 0) return result.accuracyPercentage;
          return Math.round((prevAcc * prev + result.accuracyPercentage) / nextCount);
        });
        return nextCount;
      });

      // 2. Study Streak Calculation with Asia/Dhaka Timezone
      const streakRes = calculateUpdatedStreak(studentProfile.streakDays, studentProfile.lastActivityDate);
      setStudentProfile((prev) => ({
        ...prev,
        streakDays: streakRes.newStreak,
        lastActivityDate: streakRes.todayDhaka,
      }));
      if (currentUser) {
        setCurrentUser((prev) => prev ? {
          ...prev,
          streakDays: streakRes.newStreak,
          lastActivityDate: streakRes.todayDhaka,
        } : null);
      }

      // Refresh mistakes from backend
      const mistRes = await fetch(`/api/mistakes?userId=${studentProfile.id}`);
      const updatedMistakes = await mistRes.json();
      setMistakes(updatedMistakes);

      // Persist submission, streak, and mistakes in Cloud Firestore for permanent student progress
      if (studentProfile?.id && studentProfile.id !== 'guest-student') {
        saveFirestoreExamResult(studentProfile.id, result).catch(() => {});
        saveFirestoreUserProfile({
          id: studentProfile.id,
          streakDays: streakRes.newStreak,
          lastActivityDate: streakRes.todayDhaka,
        }).catch(() => {});

        if (result.mistakes && result.mistakes.length > 0) {
          result.mistakes.forEach((m) => {
            saveFirestoreMistake(studentProfile.id, {
              id: `mstk-${m.questionId}`,
              userId: studentProfile.id,
              questionId: m.questionId,
              question: {
                id: m.questionId,
                subject: m.subject,
                chapter: m.chapter,
                topic: m.topic,
                questionText: m.questionText,
                options: m.options,
                correctAnswerIndex: m.correctOptionIndex,
                explanation: m.explanation,
                difficulty: m.difficulty,
                verificationStatus: 'verified',
              },
              selectedOptionIndex: m.selectedOptionIndex,
              correctOptionIndex: m.correctOptionIndex,
              attemptCount: 1,
              intervalStep: 0,
              nextReviewAt: new Date(Date.now() + 86400000).toISOString(),
              lastAttemptAt: new Date().toISOString(),
            }).catch(() => {});
          });
        }
      }

      setCurrentView('result');
    } catch (err) {
      console.error('Submit exam error:', err);
    }
  };

  // Retry Question in Mistake Notebook
  const handleRetryQuestion = async (questionId: string, selectedOpt: number) => {
    const res = await fetch('/api/mistakes/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: studentProfile.id,
        questionId,
        selectedOptionIndex: selectedOpt,
      }),
    });
    const data = await res.json();

    // Refresh mistakes list
    const mistRes = await fetch(`/api/mistakes?userId=${studentProfile.id}`);
    const updatedMistakes = await mistRes.json();
    setMistakes(updatedMistakes);

    return data;
  };

  // Create Batch
  const handleCreateBatch = async (batchData: Partial<TeacherBatch>) => {
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData),
    });
    const newBatch = await res.json();
    setBatches((prev) => [...prev, newBatch]);
    return newBatch;
  };

  // Join Batch
  const handleJoinBatch = async (code: string) => {
    const res = await fetch('/api/batches/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        studentName: studentProfile.name,
        studentId: studentProfile.id,
      }),
    });
    if (res.ok) {
      const bRes = await fetch('/api/batches');
      const bData = await bRes.json();
      setBatches(bData);
      return true;
    }
    return false;
  };

  // Teacher Generate Exam
  const handleTeacherGenerateExam = async (params: {
    subject: string;
    chapter: string;
    topic: string;
    count: number;
    difficulty: string;
    patternType: string;
  }) => {
    const res = await fetch('/api/teacher/generate-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  };

  // Teacher Publish Exam
  const handleTeacherPublishExam = async (examPayload: any) => {
    const res = await fetch('/api/teacher/publish-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examPayload),
    });
    const published = await res.json();

    const bRes = await fetch('/api/batches');
    const bData = await bRes.json();
    setBatches(bData);

    return published;
  };

  // Friends Challenge Create
  const handleCreateChallenge = async (data: {
    subject: string;
    chapter: string;
    topic: string;
    creatorName: string;
  }) => {
    const res = await fetch('/api/challenges/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        creatorId: studentProfile.id,
      }),
    });
    return await res.json();
  };

  // Friends Challenge Start taking
  const handleStartTakingChallenge = (challenge: ChallengeData) => {
    setActiveExam({
      id: challenge.code,
      title: `${challenge.chapter} - চ্যালেঞ্জ কুইজ`,
      questions: challenge.questions.map((q, idx) => ({
        id: `chal-${idx}`,
        subject: 'সাধারণ গণিত',
        chapter: challenge.chapter,
        topic: 'চ্যালেঞ্জ টপিক',
        questionText: q.questionText,
        options: q.options,
        difficulty: q.difficulty,
      })),
      timeLimitMinutes: 10,
    });
    setCurrentView('exam');
  };

  // Open AI Coach with context
  const handleOpenAiCoachWithContext = (questionText: string, explanation: string) => {
    setAiCoachContext({ question: questionText, explanation });
    setIsAiCoachOpen(true);
  };

  // Auth Success Callback
  const handleAuthSuccess = (user: UserAccount, token: string) => {
    setCurrentUser(user);
    setUserRole(user.role);
    if (user.role === 'student') {
      setStudentProfile((prev) => ({
        ...prev,
        id: user.id,
        name: user.name,
        photoUrl: user.photoUrl || prev.photoUrl,
      }));
      setCurrentView('student-dashboard');
    } else if (user.role === 'teacher') {
      setCurrentView('teacher-dashboard');
    } else if (user.role === 'admin') {
      setCurrentView('admin');
    }
  };

  // Student Photo Update Handler
  const handleUpdateStudentPhoto = async (newPhotoUrl: string | null) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, photoUrl: newPhotoUrl || undefined };
      setCurrentUser(updatedUser);
      setStudentProfile((prev) => ({ ...prev, photoUrl: newPhotoUrl || undefined }));

      try {
        await fetch('/api/user/photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('examdna_token') || ''}`,
          },
          body: JSON.stringify({ photoUrl: newPhotoUrl, userId: currentUser.id }),
        });
      } catch (err) {
        console.error('Failed to sync student photo to backend:', err);
      }
    }
  };

  // Logout Callback
  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase signout:', err);
    }
    const token = localStorage.getItem('examdna_token');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('examdna_token');
    setCurrentUser(null);
    setUserRole('student');
    setStudentProfile({
      id: 'guest-student',
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
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navigation Bar */}
      {currentView !== 'admin' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'diagnostic-setup') {
              handleStartDiagnostic();
            } else {
              setCurrentView(view);
            }
          }}
          lang={lang}
          onLanguageChange={handleLanguageChange}
          currentUser={currentUser}
          onOpenAuthModal={() => {
            setAuthDefaultRole('student');
            setIsAuthModalOpen(true);
          }}
          onOpenRoleSelect={() => setIsRoleSelectOpen(true)}
          onLogout={handleLogout}
          streakDays={studentProfile.streakDays}
        />
      )}

      {/* Main Views Container */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartExam={() => setCurrentView('exam-setup')}
            onDemoExamClick={handleTryDemoExam}
            currentUser={currentUser}
            totalExamsCount={totalExamsCount}
            averageAccuracy={averageAccuracy}
            onUpdateStudentPhoto={handleUpdateStudentPhoto}
            onStudentClick={() => {
              if (currentUser?.role === 'student') {
                setCurrentView('student-dashboard');
              } else {
                setAuthDefaultRole('student');
                setIsAuthModalOpen(true);
              }
            }}
            onTeacherClick={() => {
              if (currentUser?.role === 'teacher') {
                setCurrentView('teacher-dashboard');
              } else {
                setAuthDefaultRole('teacher');
                setIsAuthModalOpen(true);
              }
            }}
            onNavigate={setCurrentView}
            lang={lang}
          />
        )}

        {currentView === 'exam-setup' && (
          <ExamSetupPage
            lang={lang}
            onStartExam={handleStartCustomExam}
            onBack={() => setCurrentView('student-dashboard')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            lang={lang}
            currentUser={currentUser}
            onLogout={handleLogout}
            onAdminAuthSuccess={handleAuthSuccess}
            onExitAdminView={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'student-dashboard' && (
          <StudentDashboard
            profile={studentProfile}
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

        {currentView === 'exam' && activeExam && (
          <ExamScreen
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

        {currentView === 'result' && activeResult && (
          <ExamResultView
            result={activeResult}
            onOpenMistakes={() => setCurrentView('mistakes')}
            onStartAdaptive={() => setIsAdaptiveModalOpen(true)}
            onRetake={() => handleStartDiagnostic('all')}
            onBackToDashboard={() => setCurrentView('student-dashboard')}
          />
        )}

        {currentView === 'mistakes' && (
          <MistakeNotebook
            mistakes={mistakes}
            onRetryQuestion={handleRetryQuestion}
            onOpenAiCoachWithQuestion={handleOpenAiCoachWithContext}
            onBack={() => setCurrentView('student-dashboard')}
          />
        )}

        {currentView === 'teacher-dashboard' && (
          <TeacherDashboard
            batches={batches}
            onCreateBatch={handleCreateBatch}
            onGenerateExam={handleTeacherGenerateExam}
            onPublishExam={handleTeacherPublishExam}
            onBackToStudent={() => {
              setUserRole('student');
              setCurrentView('student-dashboard');
            }}
          />
        )}

        {currentView === 'challenge' && (
          <FriendsChallenge
            currentUser={currentUser}
            studentProfile={studentProfile}
            currentChallenge={currentChallenge}
            onCreateChallenge={handleCreateChallenge}
            onStartTakingChallenge={handleStartTakingChallenge}
            onBack={() => setCurrentView('student-dashboard')}
          />
        )}

        {currentView === 'historical' && (
          <HistoricalAnalysisView
            userRole={userRole}
            onBack={() => setCurrentView('student-dashboard')}
          />
        )}
      </main>

      {/* Role Selection Modal (Screen 2: Get Started) */}
      <RoleSelectModal
        isOpen={isRoleSelectOpen}
        onClose={() => setIsRoleSelectOpen(false)}
        lang={lang}
        onSelectRole={(selectedRole) => {
          setIsRoleSelectOpen(false);
          setAuthDefaultRole(selectedRole);
          setIsAuthModalOpen(true);
        }}
        onOpenLogin={() => {
          setIsRoleSelectOpen(false);
          setAuthDefaultRole('student');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Student & Teacher Auth Modal (Screens 3 & 4) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        defaultRole={authDefaultRole}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Student Onboarding Modal */}
      {showOnboarding && (
        <StudentOnboarding
          onComplete={(newProfile) => {
            setStudentProfile(newProfile);
            setShowOnboarding(false);
            handleStartDiagnostic('all');
          }}
          onCancel={() => setShowOnboarding(false)}
        />
      )}

      {/* Floating AI Study Coach Quick-Launcher */}
      {!isAiCoachOpen && currentView !== 'exam' && (
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

      {/* Bangla AI Study Coach Modal (Multi-turn Gemini Chatbot with Zero API Cost) */}
      <AiStudyCoachModal
        isOpen={isAiCoachOpen}
        onClose={() => setIsAiCoachOpen(false)}
        mistakes={mistakes}
        initialQuestion={aiCoachContext.question}
        initialExplanation={aiCoachContext.explanation}
      />

      {/* Adaptive Practice Launcher Modal */}
      <AdaptivePracticeModal
        isOpen={isAdaptiveModalOpen}
        onClose={() => setIsAdaptiveModalOpen(false)}
        mistakes={mistakes}
        onConfirmStart={(count) => handleStartAdaptive(count)}
      />

      {/* Daily Micro-Activities Modal (10 Min, Mistake Detective, Rematch) */}
      <DailyActivitiesModal
        isOpen={isDailyActivitiesOpen}
        onClose={() => setIsDailyActivitiesOpen(false)}
        mistakes={mistakes}
        availableQuestions={INITIAL_QUESTION_BANK}
      />
    </div>
  );
}
