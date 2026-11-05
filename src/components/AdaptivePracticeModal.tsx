import React, { useState } from 'react';
import { UserMistakeEntry } from '../types';
import { BrainCircuit, Target, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface AdaptivePracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: UserMistakeEntry[];
  onConfirmStart: (count: number) => void;
}

export const AdaptivePracticeModal: React.FC<AdaptivePracticeModalProps> = ({
  isOpen,
  onClose,
  mistakes,
  onConfirmStart,
}) => {
  const [count, setCount] = useState(10);

  if (!isOpen) return null;

  // Compute weakest topics from mistakes
  const counts: Record<string, number> = {};
  for (const m of mistakes) {
    counts[m.question.topic] = (counts[m.question.topic] || 0) + 1;
  }
  const weakTopics = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">অ্যাডাপটিভ এআই প্র্যাকটিস ইঞ্জিন</h3>
              <p className="text-[11px] text-slate-500">তোমার ভুলের প্যাটার্ন অনুযায়ী কাস্টমাইজড কুইজ</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Algorithm distribution breakdown */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
          <div className="font-bold text-slate-900 text-xs">অ্যাডাপটিভ প্রশ্ন নির্বাচন অনুপাত:</div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-600">১. দুর্বল টপিক (Weak Concepts):</span>
              <span className="font-bold text-rose-600 font-mono-numbers">৬০% প্রশ্ন</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">২. উন্নয়নশীল টপিক (Developing):</span>
              <span className="font-bold text-amber-600 font-mono-numbers">২৫% প্রশ্ন</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">৩. শক্ত কনসেপ্ট ও নতুন যাচাই (Mastered):</span>
              <span className="font-bold text-emerald-600 font-mono-numbers">১৫% প্রশ্ন</span>
            </div>
          </div>
        </div>

        {/* Detected weak concepts */}
        {weakTopics.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700">তোমার চিহ্নিত দুর্বল টপিকসমূহ:</div>
            <div className="space-y-1.5">
              {weakTopics.map(([top, count], idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900">
                  <span className="font-medium">{top}</span>
                  <span className="font-bold font-mono-numbers text-[11px] bg-rose-100 px-2 py-0.5 rounded">
                    {count}টি ভুল নথিভুক্ত
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Count Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            কয়টি প্রশ্নের কুইজ দিতে চাও?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCount(5)}
              className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                count === 5 ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              ৫টি প্রশ্ন (৮ মিনিট)
            </button>
            <button
              type="button"
              onClick={() => setCount(10)}
              className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                count === 10 ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              ১০টি প্রশ্ন (১৫ মিনিট)
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmStart(count);
            }}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md flex items-center gap-2"
          >
            <span>কুইজ শুরু করো</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
