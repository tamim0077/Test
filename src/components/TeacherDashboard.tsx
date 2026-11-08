import { apiFetch as fetch } from '../utils/api.ts';
import React, { useState, useEffect } from 'react';
import { TeacherBatch } from '../types';
import { Question } from '../utils/examScoring';
import {
  Users,
  Plus,
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Share2,
  BrainCircuit,
  BarChart3,
  Edit2,
  Trash2,
  FileCheck,
  Send
} from 'lucide-react';

interface TeacherAnalyticsData {
  totalBatches: number;
  totalStudents: number;
  activeExamsCount: number;
  completedSubmissions: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  topicAccuracy: Array<{ topic: string; total: number; correct: number; percentage: number }>;
  mostMissedQuestions: Array<{ id: string; text: string; chapter: string; missedCount: number }>;
  recentSubmissions: Array<any>;
}

interface TeacherDashboardProps {
  batches: TeacherBatch[];
  onCreateBatch: (batchData: Partial<TeacherBatch>) => Promise<TeacherBatch>;
  onGenerateExam: (config: any) => Promise<{ blueprint: any; draftQuestions: Question[] }>;
  onPublishExam: (examData: any) => Promise<any>;
  onBackToStudent: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  batches,
  onCreateBatch,
  onGenerateExam,
  onPublishExam,
  onBackToStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'batches' | 'generator' | 'analytics'>('batches');

  // Create Batch Form Modal State
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [newBatchName, setNewBatchName] = useState('SSC 2027 Math Batch A');
  const [newBatchYear, setNewBatchYear] = useState('2027');
  const [newBatchSubject, setNewBatchSubject] = useState('সাধারণ গণিত');

  // Generator Config Form State
  const [genSubject, setGenSubject] = useState('সাধারণ গণিত');
  const [genChapter, setGenChapter] = useState('বীজগাণিতিক রাশি');
  const [genTopic, setGenTopic] = useState('বর্গের সূত্রাবলী ও অনুসিদ্ধান্ত');
  const [genCount, setGenCount] = useState(10);
  const [genDifficulty, setGenDifficulty] = useState('balanced');
  const [genPattern, setGenPattern] = useState('board_style');
  const [isGenerating, setIsGenerating] = useState(false);

  // Review Panel State
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const [blueprintInfo, setBlueprintInfo] = useState<any | null>(null);
  const [publishedExamResult, setPublishedExamResult] = useState<any | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Analytics data
  const [actionError, setActionError] = useState('');
  const [targetBatchId, setTargetBatchId] = useState('');
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [analytics, setAnalytics] = useState<TeacherAnalyticsData | null>(null);

  useEffect(() => {
    fetch('/api/teacher/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Failed to load analytics:', err));
  }, [activeTab]);

  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingBatch) return;
    setCreatingBatch(true); setActionError('');
    try {
      await onCreateBatch({ name: newBatchName, subject: newBatchSubject, academicYear: newBatchYear, classLevel: 'SSC' });
      setShowCreateBatchModal(false);
    } catch (error: any) { setActionError(error.message); }
    finally { setCreatingBatch(false); }

  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setPublishedExamResult(null);
    try {
      const res = await onGenerateExam({
        subject: genSubject,
        chapter: genChapter,
        topic: genTopic,
        count: genCount,
        difficulty: genDifficulty,
        patternType: genPattern,
      });
      setReviewQuestions(res.draftQuestions);
      setBlueprintInfo(res.blueprint);
    } catch (e: any) {
      setActionError(e.message || 'কাজটি সম্পন্ন হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveAllAndPublish = async () => {
    if (reviewQuestions.length === 0) return;
    setIsPublishing(true);
    try {
      setActionError('');
      const res = await onPublishExam({
        title: `${genChapter}: ${genTopic} (${genPattern === 'board_style' ? 'বোর্ড স্ট্যান্ডার্ড' : 'মাস্টারি'})`,
        batchId: targetBatchId || undefined,
        subject: genSubject,
        chapter: genChapter,
        topics: [genTopic],
        questions: reviewQuestions,
        timeLimitMinutes: Math.max(10, Math.round(reviewQuestions.length * 1.5)),
        patternType: genPattern,
      });
      setPublishedExamResult(res);
    } catch (e: any) {
      setActionError(e.message || 'কাজটি সম্পন্ন হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyExamLink = (examId: string) => {
    const url = `${window.location.origin}/?exam=${examId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyBatchCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`ব্যাচ কোড "${code}" কপি করা হয়েছে!`);
  };

  const handleExportCSV = () => {
    if (!analytics || analytics.recentSubmissions.length === 0) {
      alert('রপ্তানি করার মতো কোনো সাবমিশন এখনও জমা পড়েনি।');
      return;
    }
    const headers = ['Exam ID', 'Score', 'Accuracy %', 'Correct', 'Incorrect', 'Time (s)', 'Date'];
    const rows = analytics.recentSubmissions.map(s => [
      s.examId,
      s.score,
      s.accuracyPercentage,
      s.correctCount,
      s.incorrectCount,
      s.timeSpentSeconds,
      s.submittedAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ExamDNA_Batch_Results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {actionError && <p role="alert" className="p-4 bg-red-50 text-red-800">{actionError}</p>}
      {/* Teacher Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-md mb-2">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>শিক্ষক ও প্রতিষ্ঠান ওয়ার্কস্পেস (Teacher Workspace)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            শিক্ষক ড্যাশবোর্ড ও এআই প্রশ্ন জেনারেটর
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            মিনিটেই তৈরি করুন বোর্ড প্যাটার্ন পরীক্ষা, ব্যাচে শেয়ার করুন এবং ক্লাসের সার্বিক দুর্বলতা ট্র্যাক করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateBatchModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ব্যাচ তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'batches' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          আমার ব্যাচসমূহ ({batches.length})
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'generator' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>এআই বোর্ড প্যাটার্ন জেনারেটর</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ক্লাস অ্যানালিটিক্স ও রিপোর্ট
        </button>
      </div>

      {/* TAB 1: Batches & Enrolled Students */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                    {batch.classLevel} {batch.academicYear}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">কোড:</span>
                    <button
                      onClick={() => copyBatchCode(batch.code)}
                      className="font-mono font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 px-2 py-0.5 rounded flex items-center gap-1"
                      title="কোড কপি করুন"
                    >
                      <span>{batch.code}</span>
                      <Copy className="w-3 h-3 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{batch.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">বিষয়: {batch.subject}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>সংযুক্ত শিক্ষার্থী:</span>
                    <span className="font-bold text-slate-900">
                      {batch.enrolledStudents.length} জন
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>পরীক্ষা সংখ্যা:</span>
                    <span className="font-bold text-slate-900">
                      {batch.exams.length} টি
                    </span>
                  </div>
                </div>

                {/* Enrolled Students Quick List */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-slate-700">এনরোল্ড শিক্ষার্থী তালিকা:</div>
                  {batch.enrolledStudents.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">এখনও কোনো শিক্ষার্থী যুক্ত হয়নি</div>
                  ) : (
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {batch.enrolledStudents.map((s, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-600 py-0.5">
                          <span>{s.name}</span>
                          <span className="text-[10px] text-slate-400">{s.enrolledAt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setActiveTab('generator');
                      setGenSubject(batch.subject); setTargetBatchId(batch.id);
                    }}
                    className="w-full py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                  >
                    এই ব্যাচের জন্য নতুন পরীক্ষা তৈরি করুন →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AI Board Pattern Exam Generator */}
      {activeTab === 'generator' && (
        <div className="space-y-8">
          {/* Config Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                স্বয়ংক্রিয় প্রশ্ন সেট তৈরি (AI Exam Generator)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Field 1: Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">বিষয় (Subject)</label>
                <select
                  value={genSubject}
                  onChange={(e) => {
                    const s = e.target.value;
                    setGenSubject(s);
                    if (s === 'পদার্থবিজ্ঞান') {
                      setGenChapter('গতি (Motion)');
                      setGenTopic('গতি ও দ্রুতি');
                    } else {
                      setGenChapter('বীজগাণিতিক রাশি');
                      setGenTopic('বর্গের সূত্রাবলী ও অনুসিদ্ধান্ত');
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 bg-slate-50"
                >
                  <option value="সাধারণ গণিত">সাধারণ গণিত (General Math - SSC)</option>
                  <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান (Physics - SSC)</option>
                </select>
              </div>

              {/* Field 2: Chapter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">অধ্যায় (Chapter)</label>
                <select
                  value={genChapter}
                  onChange={(e) => {
                    setGenChapter(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 bg-slate-50"
                >
                  {genSubject === 'সাধারণ গণিত' ? (
                    <>
                      <option value="বাস্তব সংখ্যা">অধ্যায় ১: বাস্তব সংখ্যা</option>
                      <option value="সেট ও ফাংশন">অধ্যায় ২: সেট ও ফাংশন</option>
                      <option value="বীজগাণিতিক রাশি">অধ্যায় ৩: বীজগাণিতিক রাশি</option>
                      <option value="সূচক ও লগারিদম">অধ্যায় ৪: সূচক ও লগারিদম</option>
                      <option value="ত্রিকোণমিতিক অনুপাত">অধ্যায় ৯: ত্রিকোণমিতিক অনুপাত</option>
                      <option value="পরিসংখ্যান">অধ্যায় ১৭: পরিসংখ্যান</option>
                    </>
                  ) : (
                    <>
                      <option value="ভৌত রাশি ও পরিমাপ">অধ্যায় ১: ভৌত রাশি ও পরিমাপ</option>
                      <option value="গতি (Motion)">অধ্যায় ২: গতি (Motion)</option>
                      <option value="বল (Force)">অধ্যায় ৩: বল (Force)</option>
                      <option value="কাজ, ক্ষমতা ও শক্তি">অধ্যায় ৪: কাজ, ক্ষমতা ও শক্তি</option>
                      <option value="পদার্থের অবস্থা ও চাপ">অধ্যায় ৫: পদার্থের অবস্থা ও চাপ</option>
                    </>
                  )}
                </select>
              </div>

              {/* Field 3: Topic */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">টপিক (Topic)</label>
                <select
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 bg-slate-50"
                >
                  {genSubject === 'সাধারণ গণিত' ? (
                    <>
                      <option value="বর্গের সূত্রাবলী ও অনুসিদ্ধান্ত">বর্গের সূত্রাবলী ও অনুসিদ্ধান্ত</option>
                      <option value="ঘনের সূত্রাবলী ও অনুসিদ্ধান্ত">ঘনের সূত্রাবলী ও অনুসিদ্ধান্ত</option>
                      <option value="উৎপাদকে বিশ্লেষণ">উৎপাদকে বিশ্লেষণ</option>
                      <option value="উপসেট ও শক্তি সেট">উপসেট ও শক্তি সেট</option>
                      <option value="ত্রিকোণমিতিক অভেদাবলী">ত্রিকোণমিতিক অভেদাবলী</option>
                    </>
                  ) : (
                    <>
                      <option value="গতি ও দ্রুতি">গতি ও দ্রুতি</option>
                      <option value="গতির সমীকরণ ও প্রক্ষেপক">গতির সমীকরণ ও প্রক্ষেপক</option>
                      <option value="নিউটনের গতিসূত্র">নিউটনের গতিসূত্র</option>
                      <option value="গতিশক্তি ও বিভব শক্তি">গতিশক্তি ও বিভব শক্তি</option>
                      <option value="প্যাসকেলের সূত্র ও প্লবতা">প্যাসকেলের সূত্র ও প্লবতা</option>
                    </>
                  )}
                </select>
              </div>

              {/* Field 4: Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">প্রশ্ন সংখ্যা (Count)</label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 bg-slate-50"
                >
                  <option value={10}>১০টি বহুনির্বাচনী প্রশ্ন (MCQ)</option>
                  <option value={20}>২০টি বহুনির্বাচনী প্রশ্ন (MCQ)</option>
                  <option value={30}>৩০টি বহুনির্বাচনী প্রশ্ন (Full Test)</option>
                </select>
              </div>

              {/* Field 5: Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">কঠিনতার স্তর (Difficulty)</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 bg-slate-50"
                >
                  <option value="balanced">ভারসাম্যপূর্ণ (Balanced: ৫০% সহজ, ৩০% মাঝারি, ২০% উচ্চতর)</option>
                  <option value="easy">সহজ (Easy)</option>
                  <option value="medium">মাঝারি (Medium)</option>
                  <option value="hard">উচ্চতর দক্ষতা (Hard)</option>
                </select>
              </div>

              {/* Field 6: Pattern Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">পরীক্ষার ধরন (Pattern)</label>
                <select
                  value={genPattern}
                  onChange={(e) => setGenPattern(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 bg-slate-50"
                >
                  <option value="board_style">বোর্ড স্ট্যান্ডার্ড স্টাইল (Board Style)</option>
                  <option value="concept_mastery">কনসেপ্ট মাস্টারি (Concept Mastery)</option>
                  <option value="teacher_custom">কাস্টম শিক্ষক টেস্ট (Custom)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleStartGeneration}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/25 flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'প্রশ্ন সেট তৈরি হচ্ছে...' : 'প্রশ্ন সেট জেনারেট করুন'}</span>
              </button>
            </div>
          </div>

          {/* Published Link Notification */}
          {publishedExamResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-950 text-base">
                    পরীক্ষা সফলভাবে প্রকাশিত হয়েছে!
                  </h3>
                  <p className="text-xs text-emerald-800">
                    শিক্ষার্থীরা নিচের লিংক দিয়ে সরাসরি পরীক্ষা দিতে পারবে।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-emerald-200">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/?exam=${publishedExamResult.id}`}
                  className="flex-1 text-xs font-mono bg-transparent text-slate-800 focus:outline-none"
                />
                <button
                  onClick={() => copyExamLink(publishedExamResult.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'কপি হয়েছে!' : 'লিংক কপি করুন'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Review Panel for Draft Questions */}
          {reviewQuestions.length > 0 && !publishedExamResult && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded mb-1">
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>শিক্ষক প্রশ্ন রিভিউ প্যানেল ({reviewQuestions.length} টি প্রশ্ন)</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    প্রকাশের পূর্বে প্রশ্নের শুদ্ধতা ও মান যাচাই করুন
                  </h3>
                  <p className="text-xs text-slate-500">
                    শিক্ষকের অনুমোদন ছাড়া কোনো খসড়া প্রশ্ন সরাসরি শিক্ষার্থীদের কাছে পৌঁছায় না।
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handleApproveAllAndPublish}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isPublishing ? 'প্রকাশিত হচ্ছে...' : 'সকল প্রশ্ন অনুমোদন ও প্রকাশ করুন'}</span>
                </button>
              </div>

              <label className="block">যে ব্যাচে প্রকাশ করবেন
                <select aria-label="Assignment batch" value={targetBatchId} onChange={e => setTargetBatchId(e.target.value)} className="ml-3 p-2 border rounded">
                  <option value="">লিংকধারী সকল লগইন করা শিক্ষার্থী</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </label>
              {/* Question Cards */}
              <div className="space-y-4">
                {reviewQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600">প্রশ্ন {idx + 1}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{q.topic}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        যাচাইকৃত (Verified)
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm leading-relaxed">
                      {q.questionText}
                    </div>

                    {/* 4 Options Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctAnswerIndex;
                        const prefix = ['ক', 'খ', 'গ', 'ঘ'][oIdx];

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-mono text-slate-500 font-bold">{prefix}.</span>
                            <span>{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800">ব্যাখ্যা:</span> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Class Performance & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Top 4 Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-medium mb-1">মোট অংশগ্রহণ</div>
              <div className="text-2xl font-bold text-slate-900">
                {analytics?.completedSubmissions || 0} বার
              </div>
              <div className="text-[11px] text-slate-400 mt-1">শিক্ষার্থী সাবমিশন</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-medium mb-1">ক্লাসের গড় স্কোর</div>
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.avgScore || 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">সব ব্যাচ মিলিয়ে</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-medium mb-1">সর্বোচ্চ স্কোর</div>
              <div className="text-2xl font-bold text-emerald-600">
                {analytics?.highestScore || 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">সর্বনিম্ন: {analytics?.lowestScore || 0}%</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-medium mb-1">সক্রিয় ব্যাচ</div>
              <div className="text-2xl font-bold text-slate-900">
                {batches.length} টি
              </div>
              <div className="text-[11px] text-slate-400 mt-1">মোট শিক্ষার্থী: {analytics?.totalStudents || 0} জন</div>
            </div>
          </div>

          {/* Topic-wise Accuracy Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                ক্লাসের সামগ্রিক টপিক নির্ভুলতা (Topic Accuracy)
              </h3>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV রিপোর্ট ডাউনলোড</span>
              </button>
            </div>

            <div className="space-y-4">
              {analytics?.topicAccuracy && analytics.topicAccuracy.length > 0 ? (
                analytics.topicAccuracy.map((t, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{t.topic}</span>
                      <span className="text-slate-500 font-mono-numbers">
                        {t.correct} / {t.total} ({t.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${t.percentage < 50 ? 'bg-rose-500' : t.percentage < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${t.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic py-4 text-center">
                  শিক্ষার্থীরা পরীক্ষা সম্পন্ন করার পর এখানে টপিক অ্যানালিটিক্স দৃশ্যমান হবে।
                </div>
              )}
            </div>
          </div>

          {/* Top Missed Questions by Class */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              ক্লাসের সবচেয়ে বেশি ভুল করা প্রশ্নসমূহ (Most Missed Questions)
            </h3>
            {analytics?.mostMissedQuestions && analytics.mostMissedQuestions.length > 0 ? (
              <div className="space-y-3">
                {analytics.mostMissedQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-rose-950">
                      <span>{idx + 1}. {q.text}</span>
                      <span className="text-rose-700 shrink-0 ml-2 font-mono-numbers">{q.missedCount} বার ভুল হয়েছে</span>
                    </div>
                    <div className="text-[11px] text-slate-500">অধ্যায়: {q.chapter}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-4 text-center">
                এখনও কোনো প্রশ্ন ত্রুটির পুনরাবৃত্তি রেকর্ড হয়নি।
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      {showCreateBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBatchSubmit}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">নতুন ব্যাচ তৈরি করুন</h3>
              <button
                type="button"
                onClick={() => setShowCreateBatchModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                বাতিল
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ব্যাচের নাম</label>
              <input
                type="text"
                required
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বিষয়</label>
                <select
                  value={newBatchSubject}
                  onChange={(e) => setNewBatchSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="সাধারণ গণিত">সাধারণ গণিত</option>
                  <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষাবর্ষ</label>
                <input
                  type="text"
                  readOnly
                  value={newBatchYear}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              ব্যাচ তৈরি করার সাথে সাথে একটি ইউনিক ইনভাইট কোড তৈরি হবে, যা শিক্ষার্থীদের দিলে তারা যুক্ত হতে পারবে।
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateBatchModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
              >
                ব্যাচ নিশ্চিত করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

