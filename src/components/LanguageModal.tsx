import React from 'react';
import { Check, Globe, X } from 'lucide-react';
import type { Language } from '../utils/i18n';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectLang,
}) => {
  if (!isOpen) return null;

  const handleSelect = (lang: Language) => {
    onSelectLang(lang);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-blue-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">
            {currentLang === 'bn' ? 'ভাষা পরিবর্তন করুন' : 'Select Language'}
          </h3>
        </div>

        <p className="text-xs text-slate-500 mb-5">
          {currentLang === 'bn'
            ? 'আপনার পছন্দের ভাষা নির্বাচন করুন। যেকোনো সময় পরিবর্তন করতে পারবেন।'
            : 'Choose your preferred language. You can change this anytime.'}
        </p>

        <div className="space-y-3">
          {/* Bangla Option */}
          <button
            type="button"
            onClick={() => handleSelect('bn')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
              currentLang === 'bn'
                ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-xs">
                বাং
              </span>
              <div>
                <div className="text-sm font-bold text-[#0F172A]">বাংলা (Bangla)</div>
                <div className="text-[11px] text-slate-500">বাংলাদেশ পাঠ্যক্রমের জন্য উপযোগী</div>
              </div>
            </div>
            {currentLang === 'bn' && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>

          {/* English Option */}
          <button
            type="button"
            onClick={() => handleSelect('en')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
              currentLang === 'en'
                ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold text-xs">
                EN
              </span>
              <div>
                <div className="text-sm font-bold text-[#0F172A]">English</div>
                <div className="text-[11px] text-slate-500">Standard English interface</div>
              </div>
            </div>
            {currentLang === 'en' && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            {currentLang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
