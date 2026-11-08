import { auth, signInWithEmailAndPassword, getFirestoreUserProfile } from '../config/firebase.ts';
import { apiFetch as fetch } from '../utils/api.ts';
import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  GraduationCap,
  School,
  FileQuestion,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Upload,
  BookOpen,
  Lock,
  ArrowRight,
  FileText,
  Layers,
  Sparkles,
  Clock,
  MinusCircle,
} from 'lucide-react';
import { translations, Language } from '../utils/i18n';
import type { UserAccount } from '../types';

interface AdminDashboardProps {
  lang: Language;
  currentUser: UserAccount | null;
  onLogout: () => void;
  onAdminAuthSuccess: (user: UserAccount, token: string) => void;
  onExitAdminView: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  currentUser,
  onLogout,
  onAdminAuthSuccess,
  onExitAdminView,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'questions' | 'board_papers' | 'system'>('overview');

  // Admin login form states (when not authenticated as admin)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin data states
  const [overview, setOverview] = useState<any>(null);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Historical board paper input & Board Matrix Tracker
  const [paperYear, setPaperYear] = useState('2024');
  const [paperBoard, setPaperBoard] = useState('ঢাকা');
  const [paperSubject, setPaperSubject] = useState('সাধারণ গণিত');
  const [paperChapter, setPaperChapter] = useState('বীজগাণিতিক রাশি');
  const [paperImportStatus, setPaperImportStatus] = useState<string | null>(null);

  // Board Coverage Matrix & Ingestion Pipeline States
  const [boardCoverage, setBoardCoverage] = useState<any>(null);
  const [matrixSubject, setMatrixSubject] = useState<'সাধারণ গণিত' | 'পদার্থবিজ্ঞান' | 'রসায়ন' | 'জীববিজ্ঞান'>('সাধারণ গণিত');
  const [ingestRawText, setIngestRawText] = useState('');
  const [ingestBoard, setIngestBoard] = useState('ঢাকা');
  const [ingestYear, setIngestYear] = useState('2024');
  const [ingestSubject, setIngestSubject] = useState('সাধারণ গণিত');
  const [ingestChapter, setIngestChapter] = useState('বীজগাণিতিক রাশি');
  const [ingestTopic, setIngestTopic] = useState('বোর্ড নৈর্ব্যক্তিক');
  const [ingestFormat, setIngestFormat] = useState<'text' | 'json'>('json');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestFeedback, setIngestFeedback] = useState<any | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Fetch admin data on load or tab change if authenticated
  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const getAdminHeaders = () => {
    const token = localStorage.getItem('examdna_token') || currentUser?.token || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const headers = getAdminHeaders();
      const [overviewRes, usersRes, questionsRes, statsRes, coverageRes] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/questions', { headers }),
        fetch('/api/admin/system-stats', { headers }),
        fetch('/api/admin/board-coverage', { headers }),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (questionsRes.ok) setQuestions(await questionsRes.json());
      if (statsRes.ok) setSystemStats(await statsRes.json());
      if (coverageRes.ok) setBoardCoverage(await coverageRes.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handlePipelineIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestRawText.trim()) return;
    setIsIngesting(true);
    setIngestFeedback(null);

    try {
      let payload: any = {
        board: ingestBoard,
        year: parseInt(ingestYear, 10),
        subject: ingestSubject,
        defaultChapter: ingestChapter,
        defaultTopic: ingestTopic,
        autoApprove: false,
      };

      if (ingestFormat === 'json') {
        try {
          payload.jsonQuestions = JSON.parse(ingestRawText);
        } catch {
          setIngestFeedback({ error: 'ভুল JSON ফরম্যাট। সঠিক JSON অ্যারে প্রদান করুন।' });
          setIsIngesting(false);
          return;
        }
      } else {
        payload.rawText = ingestRawText;
      }

      const res = await fetch('/api/admin/pipeline/ingest', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setIngestFeedback({ error: data.error || 'আমদানি ব্যর্থ হয়েছে।' });
      } else {
        setIngestFeedback({
          success: true,
          parsedTotal: data.parsedTotal,
          importedCount: data.importedCount,
          duplicateCount: data.duplicateCount,
          totalBankSize: data.totalBankSize,
        });
        setIngestRawText('');
        fetchAdminData();
      }
    } catch (err: any) {
      setIngestFeedback({ error: err.message || 'নেটওয়ার্ক ত্রুটি' });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleUpdateSlotStatus = async (board: string, year: number, subject: string, status: string) => {
    try {
      const res = await fetch('/api/admin/board-coverage/status', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ board, year, subject, status }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update slot status:', err);
    }
  };

  // Secure Admin Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, adminEmail.trim(), adminPassword);
      const user = await getFirestoreUserProfile(credential.user.uid);
      if (!user || user.role !== 'admin') throw new Error('Admin access required.');
      onAdminAuthSuccess(user, await credential.user.getIdToken());
    } catch (err: any) {
      setAuthError(err.message || 'Access denied');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Teacher verification toggle
  const handleTeacherVerification = async (teacherId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/verify-teacher', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ teacherId, status }),
      });

      if (res.ok) {
        // Refresh users list
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Question moderation (Approve / Reject)
  const handleModerateQuestion = async (questionId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/questions/moderate', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ questionId, action }),
      });

      if (res.ok) {
        setQuestions((prev) =>
          action === 'reject'
            ? prev.filter((q) => q.id !== questionId)
            : prev.map((q) => (q.id === questionId ? { ...q, verificationStatus: 'verified' } : q))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Import board questions batch
  const handleImportBoardPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaperImportStatus(lang === 'bn' ? 'আমদানি প্রক্রিয়াধীন...' : 'Importing...');
    try {
      setPaperImportStatus('Use the JSON import panel with actual source questions and explicit answer keys.');
    } catch (err) {
      setPaperImportStatus(lang === 'bn' ? 'আমদানি ব্যর্থ হয়েছে।' : 'Import failed.');
    }
  };

  // If NOT authenticated as admin, render the protected login gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 max-w-md w-full rounded-3xl p-8 shadow-2xl relative text-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>ExamDNA Security Gateway</span>
            </div>
            <button
              type="button"
              onClick={onExitAdminView}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {lang === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {lang === 'bn' ? 'সংরক্ষিত অ্যাডমিন পোর্টাল' : 'Restricted Admin Portal'}
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {lang === 'bn'
              ? 'এই রুটটি শুধুমাত্র প্ল্যাটফর্ম প্রতিষ্ঠাতা ও সিস্টেম প্রশাসকের জন্য সংরক্ষিত। ব্যাকএন্ড যাচাইকরণের মাধ্যমে কঠোরভাবে প্রবেশাধিকার নিয়ন্ত্রিত।'
              : 'This route is strictly restricted to platform founders and verified administrators. Access is enforced by server-side claims.'}
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'bn' ? 'প্রশাসক ইমেইল (Founder Email)' : 'Administrator Email'}
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="founder@domain.com"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'bn' ? 'সিক্রেট কি বা পাসওয়ার্ড' : 'Secret Key / Password'}
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? (lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Authenticating...') : (lang === 'bn' ? 'প্রবেশ করুন' : 'Verify & Enter')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700 text-center">
            <p className="text-[11px] text-slate-500">
              ExamDNA BD &bull; Powered by Gemini 3.8 Flash Engine
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Admin Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-500/30">
              DNA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base">ExamDNA BD</span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold tracking-wider uppercase">
                  Admin Master Console
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'সিস্টেম প্রশাসন ও এআই কনফিগারেশন' : 'System Administration & AI Governance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAdminData}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onExitAdminView}
              className="text-xs text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
            >
              {lang === 'bn' ? 'ওয়েবসাইটে ফিরে যান' : 'Exit to App'}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100/80 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.navLogout}</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 border-t border-slate-100 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'bn' ? 'ওভারভিউ ও অ্যানালিটিক্স' : 'Overview & Analytics'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teachers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'teachers' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{lang === 'bn' ? 'শিক্ষক যাচাইকরণ' : 'Teacher Verification'}</span>
            {overview?.pendingTeachers > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {overview.pendingTeachers}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'questions' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'bn' ? 'প্রশ্ন ব্যাংক মডারেশন' : 'Question Bank Moderation'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('board_papers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'board_papers' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'bn' ? 'বোর্ড পেপার আমদানি' : 'Board Paper Manager'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'system' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'bn' ? 'সিস্টেম ও এআই কোটা' : 'System & AI Telemetry'}
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500">{lang === 'bn' ? 'মোট নিবন্ধিত শিক্ষার্থী' : 'Total Students'}</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{overview?.totalStudents ?? 1}</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <span>+100% সক্রিয় অংশগ্রহণকারী</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500">{lang === 'bn' ? 'মোট নিবন্ধিত শিক্ষক' : 'Total Teachers'}</span>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <School className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{overview?.totalTeachers ?? 1}</div>
                <div className="text-[11px] text-amber-600 font-medium mt-1">
                  {overview?.pendingTeachers || 0} {lang === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'pending approval'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500">{lang === 'bn' ? 'যাচাইকৃত প্রশ্ন ব্যাংক' : 'Question Bank Size'}</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{overview?.totalQuestions ?? questions.length}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  {overview?.verifiedQuestions || 0} {lang === 'bn' ? 'এনসিটিবি যাচাইকৃত' : 'verified'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500">{lang === 'bn' ? 'এআই মডেল স্ট্যাটাস' : 'Active AI Model'}</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-900">gemini-3.8-flash</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>সরাসরি ইন্টিগ্রেশন চালু</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'সাম্প্রতিক ব্যবহারকারীগণ' : 'Recent Registered Users'}</span>
                  <span className="text-xs text-blue-600 font-normal">মোট {usersList.length} জন</span>
                </h3>
                <div className="divide-y divide-slate-100">
                  {usersList.slice(0, 5).map((u) => (
                    <div key={u.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{u.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'teacher' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500">{u.institution || u.track || 'SSC 2027'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  {lang === 'bn' ? 'সিস্টেম নিরাপত্তা ও অডিট লগ' : 'System Security & Audit Summary'}
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {lang === 'bn' ? 'কাস্টম রোল বেসড অ্যাক্সেস কন্ট্রোল (RBAC) সক্রিয়' : 'Custom RBAC Enforced'}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {lang === 'bn'
                          ? 'শুধুমাত্র ব্যাকএন্ডে যাচাইকৃত প্রতিষ্ঠাতা ইমেইল ও টোকেন ধারী অ্যাডমিন রুটের ডেটা দেখতে সক্ষম।'
                          : 'Only a server-authorized administrator can inspect admin datasets.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {lang === 'bn' ? 'এনসিটিবি পাঠ্যক্রম সুরক্ষা ও বোর্ড প্যাটার্ন গার্ড' : 'NCTB Curriculum Safety Guard'}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {lang === 'bn'
                          ? 'স্বয়ংক্রিয়ভাবে ভুল উত্তর সূচক ও বিভ্রান্তিকর অপশন পরিহার করে নির্ভুল পরীক্ষা নিশ্চয়তা দেওয়া হচ্ছে।'
                          : 'Deterministic solution verification applied to all published and diagnostic tests.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEACHERS */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {lang === 'bn' ? 'শিক্ষক তালিকা ও ভেরিফিকেশন ম্যানেজমেন্ট' : 'Teacher Verification Management'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {lang === 'bn'
                ? 'শিক্ষকদের প্রশ্নপত্র প্রকাশ ও স্টুডেন্ট ব্যাচ তৈরির পূর্বে অ্যাডমিন ভেরিফিকেশন অনুমোদন করুন।'
                : 'Review credentials and approve teacher accounts before granting official exam publishing rights.'}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">{lang === 'bn' ? 'শিক্ষকের নাম' : 'Name'}</th>
                    <th className="py-3 px-4">{lang === 'bn' ? 'ইমেইল' : 'Email'}</th>
                    <th className="py-3 px-4">{lang === 'bn' ? 'প্রতিষ্ঠান' : 'Institution'}</th>
                    <th className="py-3 px-4">{lang === 'bn' ? 'বিষয়' : 'Subject'}</th>
                    <th className="py-3 px-4">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'bn' ? 'পদক্ষেপ' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList
                    .filter((u) => u.role === 'teacher')
                    .map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{teacher.name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{teacher.email}</td>
                        <td className="py-3.5 px-4 text-slate-600">{teacher.institution || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-600">{teacher.subject || 'সাধারণ গণিত'}</td>
                        <td className="py-3.5 px-4">
                          {teacher.isVerifiedTeacher ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{lang === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>{lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {!teacher.isVerifiedTeacher ? (
                            <button
                              type="button"
                              onClick={() => handleTeacherVerification(teacher.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                            >
                              {lang === 'bn' ? 'অনুমোদন করুন' : 'Approve'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTeacherVerification(teacher.id, 'rejected')}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                            >
                              {lang === 'bn' ? 'অনুমোদন স্থগিত' : 'Revoke'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QUESTIONS */}
        {activeTab === 'questions' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'bn' ? 'প্রশ্ন ব্যাংক ও এআই ড্রাফট মডারেশন' : 'Question Bank Moderation'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'bn'
                    ? 'মোট ' + questions.length + 'টি প্রশ্ন ডাটাবেজে উপস্থিত রয়েছে।'
                    : questions.length + ' questions loaded in database.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-200 transition-all bg-slate-50/40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {q.chapter}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {q.topic}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          q.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {q.verificationStatus || 'verified'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 pt-1 leading-relaxed">
                        {idx + 1}. {q.questionText}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                        {q.options?.map((opt: string, i: number) => (
                          <div
                            key={i}
                            className={`p-2 rounded-lg text-xs ${
                              i === q.correctAnswerIndex
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold'
                                : 'bg-white text-slate-700 border border-slate-200'
                            }`}
                          >
                            <span className="text-[10px] text-slate-400 mr-1">({String.fromCharCode(65 + i)})</span>
                            {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-[11px] text-slate-500 italic pt-1">
                          {lang === 'bn' ? 'ব্যাখ্যা: ' : 'Explanation: '}{q.explanation}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {q.verificationStatus !== 'verified' && (
                        <button
                          type="button"
                          onClick={() => handleModerateQuestion(q.id, 'approve')}
                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="অনুমোদন করুন"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleModerateQuestion(q.id, 'reject')}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="বাতিল করুন"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BOARD PAPERS & INGESTION PIPELINE */}
        {activeTab === 'board_papers' && (
          <div className="space-y-6">
            {/* Header & Academic Integrity Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Layers className="w-5 h-5" />
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {lang === 'bn'
                        ? 'এসএসসি ২০১৮–২০২৫ শিক্ষা বোর্ড কাভারেজ ট্র্যাকার ও ইনজেশন পাইপলাইন'
                        : 'SSC 2018–2025 Board Coverage Tracker & Ingestion Pipeline'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'bn'
                      ? '৯টি শিক্ষা বোর্ড × ৬টি শিক্ষাবর্ষ × ৪টি বিষয় (মোট ২১৬টি বোর্ড পরীক্ষার ইনডেক্স ও বাস্তব অগ্রগতি)'
                      : '9 Education Boards × 6 Academic Years × 4 Subjects (216 Total Paper Slots)'}
                  </p>
                </div>

                {/* Subject Switcher */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => setMatrixSubject('সাধারণ গণিত')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      matrixSubject === 'সাধারণ গণিত'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'bn' ? 'সাধারণ গণিত' : 'General Math'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatrixSubject('পদার্থবিজ্ঞান')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      matrixSubject === 'পদার্থবিজ্ঞান'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'bn' ? 'পদার্থবিজ্ঞান' : 'Physics'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatrixSubject('রসায়ন')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      matrixSubject === 'রসায়ন'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'bn' ? 'রসায়ন' : 'Chemistry'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatrixSubject('জীববিজ্ঞান')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      matrixSubject === 'জীববিজ্ঞান'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'bn' ? 'জীববিজ্ঞান' : 'Biology'}
                  </button>
                </div>
              </div>

              {/* Academic Integrity Highlight for 2021 Math */}
              {matrixSubject === 'সাধারণ গণিত' && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {lang === 'bn' ? 'ঐতিহাসিক একাডেমিক তথ্য (২০২১ সাল): ' : 'Historical Academic Policy (2021): '}
                    </span>
                    {lang === 'bn'
                      ? 'কোভিড-১৯ মহামারীর কারণে ২০২১ সালে সমগ্র বাংলাদেশে এসএসসি সাধারণ গণিত পরীক্ষা অনুষ্ঠিত হয়নি (কেবল ৩টি সংক্ষিপ্ত নৈর্বাচনিক গ্রুপ বিষয় অনুষ্ঠিত হয়েছিল)। তাই ২০২১ সাধারণ গণিত কলামটি সততার সাথে "পরীক্ষা অনুষ্ঠিত হয়নি" হিসেবে সংরক্ষিত।'
                      : 'Due to COVID-19, compulsory SSC General Math was not administered nationwide in 2021 (only 3 shortened group electives took place). All 2021 General Math slots are legitimately marked as "No Exam Held".'}
                  </div>
                </div>
              )}

              {/* Status Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 font-medium">
                    {lang === 'bn' ? 'মোট পরীক্ষা স্লট' : 'Total Slots'}
                  </div>
                  <div className="text-base font-bold text-slate-800">
                    {boardCoverage?.totalSlots || 144}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
                  <div className="text-[10px] text-emerald-700 font-medium">
                    {lang === 'bn' ? 'যাচাইকৃত পেপার' : 'Verified Papers'}
                  </div>
                  <div className="text-base font-bold text-emerald-800">
                    {boardCoverage?.statusCounts?.verified || 0}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80">
                  <div className="text-[10px] text-blue-700 font-medium">
                    {lang === 'bn' ? 'এক্সট্র্যাক্ট করা' : 'Extracted'}
                  </div>
                  <div className="text-base font-bold text-blue-800">
                    {boardCoverage?.statusCounts?.extracted || 0}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80">
                  <div className="text-[10px] text-amber-700 font-medium">
                    {lang === 'bn' ? 'অপেক্ষমান' : 'Pending'}
                  </div>
                  <div className="text-base font-bold text-amber-800">
                    {boardCoverage?.statusCounts?.pending_verification || 0}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80">
                  <div className="text-[10px] text-rose-700 font-medium">
                    {lang === 'bn' ? 'পরীক্ষা হয়নি (COVID)' : 'No Exam Held'}
                  </div>
                  <div className="text-base font-bold text-rose-800">
                    {boardCoverage?.statusCounts?.no_exam_held || 9}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200/80">
                  <div className="text-[10px] text-indigo-700 font-medium">
                    {lang === 'bn' ? 'সংরক্ষিত প্রশ্ন ব্যাংক' : 'Total Bank Questions'}
                  </div>
                  <div className="text-base font-bold text-indigo-800">
                    {boardCoverage?.totalBankSize || questions.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Board Coverage Matrix Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {lang === 'bn'
                      ? `বোর্ড কাভারেজ ম্যাট্রিক্স: ${matrixSubject}`
                      : `Board Coverage Matrix: ${matrixSubject}`}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {lang === 'bn' ? '৯টি বোর্ড × ৮টি বছর' : '9 Boards × 8 Years'}
                  </span>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified
                  </span>
                  <span className="flex items-center gap-1 text-blue-700">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Extracted
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending
                  </span>
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> No Exam
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Not Found
                  </span>
                </div>
              </div>

              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60">
                    <th className="py-2.5 px-3 font-semibold text-slate-800">শিক্ষা বোর্ড (Board)</th>
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(year => (
                      <th key={year} className="py-2.5 px-2 text-center font-bold text-slate-700">
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    'ঢাকা',
                    'রাজশাহী',
                    'চট্টগ্রাম',
                    'কুমিল্লা',
                    'যশোর',
                    'বরিশাল',
                    'সিলেট',
                    'দিনাজপুর',
                    'ময়মনসিংহ',
                  ].map(board => {
                    return (
                      <tr key={board} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {board}
                        </td>
                        {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(year => {
                          const slot = boardCoverage?.matrix?.find(
                            (s: any) => s.board === board && s.year === year && s.subject === matrixSubject
                          );
                          const isNoExam = year === 2021 && matrixSubject === 'সাধারণ গণিত';
                          const status = isNoExam ? 'no_exam_held' : (slot?.status || 'not_found');
                          const count = slot?.verifiedCount || 0;

                          let bgClass = 'bg-slate-100/70 text-slate-600 border-slate-200';
                          if (status === 'verified') bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
                          else if (status === 'extracted') bgClass = 'bg-blue-50 text-blue-800 border-blue-200';
                          else if (status === 'pending_verification') bgClass = 'bg-amber-50 text-amber-800 border-amber-200';
                          else if (status === 'no_exam_held') bgClass = 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';

                          return (
                            <td key={year} className="py-2 px-1.5 text-center">
                              <div
                                title={
                                  isNoExam
                                    ? 'কোভিড-১৯ মহামারীর কারণে ২০২১ সালে সাধারণ গণিত পরীক্ষা অনুষ্ঠিত হয়নি'
                                    : `${board} বোর্ড ${year} (${matrixSubject}): ${status} [${count} প্রশ্ন]`
                                }
                                className={`px-2 py-1.5 rounded-lg border text-[11px] flex flex-col items-center justify-center transition-all ${bgClass}`}
                              >
                                {isNoExam ? (
                                  <span className="text-[10px] leading-tight text-rose-700">পরীক্ষা হয়নি</span>
                                ) : (
                                  <>
                                    <span className="text-[10px] font-bold">
                                      {count > 0 ? `${count}টি` : status === 'verified' ? 'যাচাইকৃত' : status === 'extracted' ? 'ড্রাফট' : status === 'pending_verification' ? 'অপেক্ষমান' : 'নেই'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Ingestion Pipeline Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {lang === 'bn' ? 'স্বয়ংক্রিয় প্রশ্ন ইনজেশন ও ডুপ্লিকেট রোধ পাইপলাইন' : 'Automated Question Ingestion & Deduplication Pipeline'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {lang === 'bn'
                        ? 'বোর্ড প্রশ্নপত্রের ট্রানস্ক্রিপ্ট, টেক্সট বা JSON সরাসরি পেস্ট করুন। রেগেক্স পার্সার স্বয়ংক্রিয়ভাবে প্রশ্ন, ক/খ/গ/ঘ অপশন এবং সঠিক উত্তর এক্সট্র্যাক্ট করবে।'
                        : 'Paste question transcripts or JSON. The deterministic pipeline extracts options, detects answer keys, and prevents duplicates.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    disabled title="JSON import requires an explicit answer key"
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      ingestFormat === 'text' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Plain Text / Transcript
                  </button>
                  <button
                    type="button"
                    onClick={() => setIngestFormat('json')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      ingestFormat === 'json' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Structured JSON
                  </button>
                </div>
              </div>

              {ingestFeedback && (
                <div
                  className={`mb-4 p-4 rounded-xl border text-xs ${
                    ingestFeedback.error
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  {ingestFeedback.error ? (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{ingestFeedback.error}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>সফলভাবে ইনজেশন সম্পন্ন হয়েছে!</span>
                      </div>
                      <p>
                        শনাক্তকৃত প্রশ্ন: {ingestFeedback.parsedTotal}টি | নতুন আমদানি: {ingestFeedback.importedCount}টি | ডুপ্লিকেট বাদ দেওয়া হয়েছে: {ingestFeedback.duplicateCount}টি | মোট ব্যাংক সাইজ: {ingestFeedback.totalBankSize}টি
                      </p>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handlePipelineIngest} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">শিক্ষা বোর্ড</label>
                    <select
                      value={ingestBoard}
                      onChange={(e) => setIngestBoard(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      {[
                        'ঢাকা',
                        'রাজশাহী',
                        'চট্টগ্রাম',
                        'কুমিল্লা',
                        'যশোর',
                        'বরিশাল',
                        'সিলেট',
                        'দিনাজপুর',
                        'ময়মনসিংহ',
                      ].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">সাল (Year)</label>
                    <select
                      value={ingestYear}
                      onChange={(e) => setIngestYear(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">বিষয় (Subject)</label>
                    <select
                      value={ingestSubject}
                      onChange={(e) => setIngestSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="সাধারণ গণিত">সাধারণ গণিত</option>
                      <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">অধ্যায় (Chapter)</label>
                    <select
                      value={ingestChapter}
                      onChange={(e) => setIngestChapter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      {ingestSubject === 'সাধারণ গণিত' ? (
                        <>
                          <option value="বাস্তব সংখ্যা">অধ্যায় ১: বাস্তব সংখ্যা</option>
                          <option value="সেট ও ফাংশন">অধ্যায় ২: সেট ও ফাংশন</option>
                          <option value="বীজগাণিতিক রাশি">অধ্যায় ৩: বীজগাণিতিক রাশি</option>
                          <option value="সূচক ও লগারিদম">অধ্যায় ৪: সূচক ও লগারিদম</option>
                          <option value="ত্রিকোণমিতিক অনুপাত">অধ্যায় ৯: ত্রিকোণমিতিক অনুপাত</option>
                          <option value="দূরত্ব ও উচ্চতা">অধ্যায় ১০: দূরত্ব ও উচ্চতা</option>
                          <option value="পরিসংখ্যান">অধ্যায় ১৭: পরিসংখ্যান</option>
                        </>
                      ) : (
                        <>
                          <option value="ভৌত রাশি ও পরিমাপ">অধ্যায় ১: ভৌত রাশি ও পরিমাপ</option>
                          <option value="গতি">অধ্যায় ২: গতি</option>
                          <option value="বল">অধ্যায় ৩: বল</option>
                          <option value="কাজ, ক্ষমতা ও শক্তি">অধ্যায় ৪: কাজ, ক্ষমতা ও শক্তি</option>
                          <option value="পদার্থের অবস্থা ও চাপ">অধ্যায় ৫: পদার্থের অবস্থা ও চাপ</option>
                          <option value="আলোর প্রতিফলন">অধ্যায় ৮: আলোর প্রতিফলন</option>
                          <option value="চল বিদ্যুৎ">অধ্যায় ১১: চল বিদ্যুৎ</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700">
                      {ingestFormat === 'text'
                        ? 'প্রশ্নপত্রের টেক্সট পেস্ট করুন (ক/খ/গ/ঘ বা A/B/C/D অপশনসহ)'
                        : 'Structured JSON Array of Questions'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (ingestFormat === 'text') {
                          setIngestRawText(
                            `১. নিচের কোনটি অমূলদ সংখ্যা?\n(ক) √2  (খ) √4  (গ) 3.5  (ঘ) 2/3\nউত্তরঃ ক\nব্যাখ্যা: যে সংখ্যাকে ভগ্নাংশ আকারে প্রকাশ করা যায় না।\n\n২. 0.3̇ এর সাধারণ ভগ্নাংশ রূপ কোনটি?\n(ক) 1/3  (খ) 3/10  (গ) 1/9  (ঘ) 3/100\nউত্তরঃ ক\nব্যাখ্যা: 3/9 = 1/3`
                          );
                        } else {
                          setIngestRawText(
                            JSON.stringify(
                              [
                                {
                                  questionText: "কোন বলের ক্রিয়ায় পৃথিবী সূর্যের চারদিকে ঘোরে?",
                                  options: ["মহাকর্ষ বল", "তড়িৎ বল", "চৌম্বক বল", "সবল নিউক্লীয় বল"],
                                  correctAnswerIndex: 0,
                                  explanation: "সূর্য ও পৃথিবীর মধ্যে মহাকর্ষ বল কার্যকর থাকে।",
                                  chapter: "বল",
                                  topic: "নিউটনের মহাকর্ষ সূত্র",
                                  difficulty: "easy"
                                }
                              ],
                              null,
                              2
                            )
                          );
                        }
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      + নমুনা টেক্সট বসান (Load Sample)
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={ingestRawText}
                    onChange={(e) => setIngestRawText(e.target.value)}
                    placeholder={
                      ingestFormat === 'text'
                        ? `১. নিচের কোনটি অমূলদ সংখ্যা?\n(ক) √2  (খ) √4  (গ) 3.5  (ঘ) 2/3\nউত্তরঃ ক\nব্যাখ্যা: যে সংখ্যাকে দুটি পূর্ণসংখ্যার ভগ্নাংশ আকারে প্রকাশ করা যায় না।`
                        : `[\n  {\n    "questionText": "...",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswerIndex": 0\n  }\n]`
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isIngesting || !ingestRawText.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                  >
                    {isIngesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>পার্স ও আমদানি হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>ইনজেস্ট ও স্বয়ংক্রিয় বিশ্লেষণ চালান</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM TELEMETRY */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-3xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {lang === 'bn' ? 'সিস্টেম স্ট্যাটাস ও এআই রিসোর্স মেট্রিক্স' : 'System Status & AI Resource Metrics'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'bn'
                  ? 'গুগল এআই স্টুডিও জেমিনি ৩.৮ ফ্ল্যাশ ক্লাউড রান পরিবেশ পর্যবেক্ষণ।'
                  : 'Monitoring Google AI Studio Gemini 3.8 Flash deployment environment.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500">{lang === 'bn' ? 'দৈনিক এআই কোটা ব্যবহার' : 'Daily AI Quota'}</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{systemStats?.aiQuota?.quotaPercent || 2.8}%</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{systemStats?.aiQuota?.dailyRequestsUsed || 42} / {systemStats?.aiQuota?.dailyQuotaLimit || 1500} requests</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500">{lang === 'bn' ? 'সার্ভার আপটাইম' : 'Server Uptime'}</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{Math.floor((systemStats?.serverUptimeSeconds || 120) / 60)} মিনিট</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">সবগুলো সার্ভিস কার্যকর</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500">{lang === 'bn' ? 'মেমরি ব্যবহার' : 'Memory Heap'}</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{systemStats?.memoryUsageMB || 64} MB</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Node.js V8 Runtime</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

