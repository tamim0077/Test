import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Heart, Award, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { translations, Language } from '../utils/i18n';

interface FounderSectionProps {
  lang: Language;
  onExploreExams?: () => void;
}

const DEFAULT_FOUNDER_IMAGE = '/assets/founder-mustafizur-rahman.jpeg';

export const FounderSection: React.FC<FounderSectionProps> = ({ lang, onExploreExams }) => {
  const t = translations[lang];
  const [photoUrl, setPhotoUrl] = useState<string>(DEFAULT_FOUNDER_IMAGE);

  // Load saved founder photo from backend or default to founder image
  useEffect(() => {
    fetch('/api/founder/photo')
      .then((res) => res.json())
      .then((data) => {
        if (data.photoUrl) {
          setPhotoUrl(data.photoUrl);
        } else {
          setPhotoUrl(DEFAULT_FOUNDER_IMAGE);
        }
      })
      .catch(() => {
        setPhotoUrl(DEFAULT_FOUNDER_IMAGE);
      });
  }, []);

  return (
    <section id="founder-section" className="py-20 bg-gradient-to-b from-white via-blue-50/40 to-slate-50 border-t border-blue-100/60 relative overflow-hidden">
      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>{t.founderBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            {t.founderTitle}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t.founderSubtitle}
          </p>
        </div>

        {/* Content Card with Two Columns */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-blue-500/5 border border-blue-100/80 backdrop-blur-sm transition-all hover:shadow-2xl hover:shadow-blue-500/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Founder Photo & Framing Column (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group">
                {/* White to soft-blue gradient frame glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-200 via-indigo-100 to-sky-200 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-500" />
                
                {/* Inner Card Framing */}
                <div className="relative bg-gradient-to-tr from-white via-blue-50/60 to-white p-3 rounded-2xl border border-blue-200/70 shadow-lg">
                  <div className="w-64 h-80 sm:w-72 sm:h-96 rounded-xl overflow-hidden bg-gradient-to-b from-blue-50 to-slate-100 border border-blue-100 flex items-center justify-center relative shadow-inner">
                    <img
                      src={photoUrl || DEFAULT_FOUNDER_IMAGE}
                      alt="Mustafizur Rahman - Founder & Vision Architect, ExamDNA BD"
                      className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/WhatsApp_Image_2026-11-04_at_5.53.28_PM_d85e6cfb.jpeg';
                      }}
                    />

                    {/* Verified Badge */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-blue-100 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>{lang === 'bn' ? 'যাচাইকৃত প্রতিষ্ঠাতা' : 'Verified Founder'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Founder Identity Card below Portrait (Replacing upload button) */}
              <div className="mt-5 text-center">
                <h4 className="text-xl font-bold text-[#0F172A] tracking-tight">Mustafizur Rahman</h4>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{t.founderRole}</p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/80 border border-blue-200/80 rounded-full text-[11px] font-medium text-blue-700">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>{lang === 'bn' ? 'উদ্যোক্তা ও প্রধান রূপকার' : 'Founder & Vision Architect'}</span>
                </div>
              </div>
            </div>

            {/* Founder Message & Vision Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                  {lang === 'bn' ? 'আমাদের প্রত্যয় ও পেছনের গল্প' : 'Our Mission & Story'}
                </h3>
                <p className="text-sm font-semibold text-blue-600">
                  ExamDNA BD &bull; {lang === 'bn' ? 'বাংলাদেশি শিক্ষার্থীদের জন্য তৈরি' : 'Engineered for Bangladeshi Students'}
                </p>
              </div>

              {/* Quote Box with Gentle Left Border */}
              <div className="relative pl-6 border-l-4 border-blue-500 py-1 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-2xl">
                <p className="text-base sm:text-lg text-slate-700 italic leading-relaxed">
                  "{t.founderQuote}"
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-[#0F172A]">Mustafizur Rahman</span>
                  <span className="text-xs text-slate-500">&bull; {t.founderRole}</span>
                </div>
              </div>

              {/* Two Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/40 hover:border-blue-200 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0F172A] mb-1">{t.founderPillar1Title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.founderPillar1Desc}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/40 hover:border-blue-200 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0F172A] mb-1">{t.founderPillar2Title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.founderPillar2Desc}</p>
                </div>
              </div>

              {/* Call to action inside founder section */}
              {onExploreExams && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onExploreExams}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30"
                  >
                    <span>{t.heroStartExamBtn}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
