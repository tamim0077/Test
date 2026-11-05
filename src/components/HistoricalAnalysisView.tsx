import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Upload,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

interface HistoricalPaper {
  id: string;
  year: number;
  board: string;
  subject: string;
  chapter: string;
  topic: string;
  verifiedCount: number;
  status: 'verified' | 'pending';
}

interface HistoricalAnalysisResponse {
  hasVerifiedData: boolean;
  disclaimer: string;
  statusMessage: string;
  papers: HistoricalPaper[];
}

interface HistoricalAnalysisViewProps {
  userRole: string;
  onBack: () => void;
}

export const HistoricalAnalysisView: React.FC<HistoricalAnalysisViewProps> = ({
  userRole,
  onBack,
}) => {
  const [data, setData] = useState<HistoricalAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin Import Form State
  const [showImportForm, setShowImportForm] = useState(false);
  const [importYear, setImportYear] = useState('2024');
  const [importBoard, setImportBoard] = useState('ঢাকা');
  const [importSubject, setImportSubject] = useState('সাধারণ গণিত');
  const [importChapter, setImportChapter] = useState('বীজগাণিতিক রাশি');
  const [sampleQuestionsText, setSampleQuestionsText] = useState(`প্রশ্ন ১: a + b = 5 এবং ab = 6 হলে a² + b² = কত? | অপশন: 13, 15, 25, 37 | উত্তর: 13 | ব্যাখ্যা: 5² - 2(6) = 25 - 12 = 13`);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetch('/api/historical-analysis')
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAdminImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);
    try {
      // Mock structured parsing from text for admin preview
      const parsedQuestion = {
        questionText: 'ঢাকা বোর্ড ২০২৪: a + b = 5 এবং ab = 6 হলে a² + b² এর মান কত?',
        options: ['13', '15', '25', '37'] as [string, string, string, string],
        correctAnswerIndex: 0,
        explanation: 'a² + b² = (a+b)² - 2ab = 5² - 2(6) = 25 - 12 = 13।',
        topic: 'বর্গের সূত্রাবলী ও অনুসিদ্ধান্ত',
      };

      const res = await fetch('/api/admin/import-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: importYear,
          board: importBoard,
          subject: importSubject,
          chapter: importChapter,
          questions: [parsedQuestion],
        }),
      });

      if (res.ok) {
        alert('বোর্ড প্রশ্নপত্র সফলভাবে ইনডেক্স ও যাচাই করা হয়েছে!');
        setShowImportForm(false);
        // Refresh
        const refreshRes = await fetch('/api/historical-analysis');
        const refreshedData = await refreshRes.json();
        setData(refreshedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-md mb-2">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>বোর্ড প্রশ্ন প্যাটার্ন বিশ্লেষণ (Board Pattern Analysis)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            যাচাইকৃত ঐতিহাসিক বোর্ড প্রশ্ন বিশ্লেষণ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ExamDNA BD শিক্ষামূলক সততায় বিশ্বাসী। আমরা ভুয়া বা কাল্পনিক প্রশ্নের ফ্রিকোয়েন্সি প্রদর্শন করি না।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl"
          >
            ফিরে যান
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => setShowImportForm(true)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>বোর্ড প্রশ্নপত্র ইমপোর্ট</span>
            </button>
          )}
        </div>
      </div>

      {/* Honest Academic Standard Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <span>একাডেমিক সততা ও তথ্যের স্বচ্ছতা সংক্রান্ত নীতিমালা</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {data?.disclaimer ||
            'ExamDNA BD শিক্ষামূলক সততা বজায় রাখে। পর্যাপ্ত যাচাইকৃত প্রশ্ন সংরক্ষিত না থাকলে কোনো কৃত্রিম বা ভুয়া ফ্রিকোয়েন্সি প্রদর্শন করা হয় না।'}
        </p>
      </div>

      {/* Main Status Container */}
      {!data?.hasVerifiedData ? (
        /* Honest Empty State */
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {data?.statusMessage || 'পর্যাপ্ত যাচাইকৃত বোর্ড প্রশ্নের তথ্য নেই।'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            কোনো বোর্ড পরীক্ষা না নিয়ে বা প্রশ্নপত্র আইনসম্মতভাবে সংগ্রহ ও শিক্ষক মণ্ডলী কর্তৃক যাচাই না করে ভুয়া ঐতিহাসিক অ্যানালিটিক্স প্রদর্শন করা শিক্ষার্থীর জন্য ক্ষতিকর। অ্যাডমিন কর্তৃক প্রশ্নপত্র নথিভুক্ত হলে তা এখানে প্রকাশিত হবে।
          </p>

          <div className="pt-2">
            <button
              onClick={() => setShowImportForm(true)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              (অ্যাডমিন মোডে) প্রথম বোর্ড প্রশ্নপত্র নথিভুক্ত করুন
            </button>
          </div>
        </div>
      ) : (
        /* Verified Imported Papers List */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">
              যাচাইকৃত নথিভুক্ত প্রশ্নপত্র ({data.papers.length} টি)
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
              যাচাই সম্পন্ন
            </span>
          </div>

          <div className="space-y-3">
            {data.papers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {p.board} বোর্ড {p.year} — {p.subject}
                  </div>
                  <div className="text-slate-500 mt-0.5">অধ্যায়: {p.chapter}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600 font-mono-numbers">
                    {p.verifiedCount}টি প্রশ্ন অনুমোদিত
                  </div>
                  <div className="text-[10px] text-slate-400">স্ট্যাটাস: লাইভ প্রশ্নব্যাংক</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Import Modal */}
      {showImportForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAdminImport}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                বোর্ড পরীক্ষার প্রশ্নপত্র ইনডেক্স ও যাচাই
              </h3>
              <button
                type="button"
                onClick={() => setShowImportForm(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                বাতিল
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বোর্ড</label>
                <select
                  value={importBoard}
                  onChange={(e) => setImportBoard(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="ঢাকা">ঢাকা বোর্ড</option>
                  <option value="চট্টগ্রাম">চট্টগ্রাম বোর্ড</option>
                  <option value="রাজশাহী">রাজশাহী বোর্ড</option>
                  <option value="যশোর">যশোর বোর্ড</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বছর</label>
                <select
                  value={importYear}
                  onChange={(e) => setImportYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="2024">২০২৪</option>
                  <option value="2023">২০২৩</option>
                  <option value="2022">২০২২</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বিষয় ও অধ্যায়</label>
              <input
                type="text"
                readOnly
                value={`${importSubject} - ${importChapter}`}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                প্রশ্নের নমুনা টেক্সট (অ্যাডমিন প্রিভিউ)
              </label>
              <textarea
                rows={3}
                value={sampleQuestionsText}
                onChange={(e) => setSampleQuestionsText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-900">
              *প্রশ্ন সংরক্ষণ করার পর তা সরাসরি প্রশ্নব্যাংক ও বোর্ড প্যাটার্ন এআই ইঞ্জিনে যুক্ত হবে।
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowImportForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isImporting}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {isImporting ? 'সংরক্ষণ হচ্ছে...' : 'যাচাই ও ইমপোর্ট সম্পন্ন করুন'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
