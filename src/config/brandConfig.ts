/**
 * Central Brand, Entitlement & Subject Configuration for ExamDNA BD / GNNBD.
 * Centralized so brand name, support details, pricing and quotas can be configured in one place.
 */

export const BRAND_CONFIG = {
  // Brand Identity (Changeable without breaking codebase)
  name: 'ExamDNA BD',
  secondaryName: 'GNNBD',
  taglineBn: 'তোমার ভুলই তোমার পরবর্তী প্রস্তুতি',
  taglineEn: 'Turn Every Mistake Into Academic Mastery',
  version: 'Public Beta 1.0',
  launchDate: 'November 2026',

  // Contact & Support
  supportEmail: 'support@examdna.bd',
  helpline: '+880 1700-000000',
  address: 'ঢাকা, বাংলাদেশ',
  fbGroupUrl: 'https://facebook.com/groups/examdnabd',

  // Curriculum Alignment
  curriculum: 'NCTB (জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড)',
  examLevel: 'SSC (মাধ্যমিক স্কুল সার্টিফিকেট)',
  targetYears: ['2026', '2027', '2028'],

  // Core Subjects Supported
  subjects: [
    {
      id: 'math',
      nameBn: 'সাধারণ গণিত',
      nameEn: 'General Mathematics',
      code: '109',
      color: 'blue',
      totalChapters: 17,
    },
    {
      id: 'physics',
      nameBn: 'পদার্থবিজ্ঞান',
      nameEn: 'Physics',
      code: '136',
      color: 'indigo',
      totalChapters: 14,
    },
    {
      id: 'chemistry',
      nameBn: 'রসায়ন',
      nameEn: 'Chemistry',
      code: '137',
      color: 'emerald',
      totalChapters: 12,
    },
    {
      id: 'biology',
      nameBn: 'জীববিজ্ঞান',
      nameEn: 'Biology',
      code: '138',
      color: 'teal',
      totalChapters: 14,
    },
  ],

  // 9 Education Boards of Bangladesh
  boards: [
    { id: 'dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka' },
    { id: 'rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi' },
    { id: 'chittagong', nameBn: 'চট্টগ্রাম', nameEn: 'Chittagong' },
    { id: 'comilla', nameBn: 'কুমিল্লা', nameEn: 'Comilla' },
    { id: 'jessore', nameBn: 'যশোর', nameEn: 'Jessore' },
    { id: 'barisal', nameBn: 'বরিশাল', nameEn: 'Barisal' },
    { id: 'sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet' },
    { id: 'dinajpur', nameBn: 'দিনাজপুর', nameEn: 'Dinajpur' },
    { id: 'mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh' },
  ],

  // Plans & Entitlements
  plans: {
    free: {
      id: 'free',
      nameBn: 'ফ্রি প্ল্যান',
      nameEn: 'Free Starter',
      priceBdt: 0,
      dailyQuestionsLimit: 20,
      aiResponsesLimit: 5,
      featuresBn: [
        'দৈনিক ২০টি ব্যক্তিগত অনুশীলন প্রশ্ন',
        'মৌলিক পরীক্ষার ফলাফল ও বিশ্লেষণ',
        'মিস্টেক নোটবুক ট্র্যাকিং',
        'আজকের ১০ মিনিট মাইক্রো-প্র্যাকটিস',
        '৪টি মূল বিষয়ে অ্যাক্সেস',
      ],
    },
    studentPlus: {
      id: 'student_plus',
      nameBn: 'স্টুডেন্ট প্লাস',
      nameEn: 'Student Plus',
      priceBdt: 149,
      durationDays: 30,
      dailyQuestionsLimit: 200,
      aiResponsesLimit: 100,
      featuresBn: [
        'দৈনিক ২০০টি পর্যন্ত অনুশীলন প্রশ্ন',
        'পূর্ণাঙ্গ কাস্টম ও অ্যাডাপটিভ পরীক্ষা',
        '১০০টি সফল বাংলা এআই স্টাডি কোচ উত্তর',
        'বিস্তারিত উইকনেস ও চ্যাপ্টার অ্যানালিটিক্স',
        'সীমাহীন মিস্টেক নোটবুক ও রিভিশন শিডিউলার',
        'ঐতিহাসিক বোর্ড প্রশ্নপত্র আর্কাইভ প্র্যাকটিস',
      ],
    },
    teacherBeta: {
      id: 'teacher_beta',
      nameBn: 'শিক্ষক বেটা স্পেশাল',
      nameEn: 'Teacher Beta',
      priceBdt: 0,
      durationDays: 30,
      maxBatches: 1,
      maxStudentsPerBatch: 50,
      featuresBn: [
        'প্রথম ৩০ দিন সম্পূর্ণ বিনামূল্যে',
        '১টি নিজস্ব ডিজিটাল ব্যাচ তৈরি ও কোড শেয়ার',
        '৫০ জন শিক্ষার্থী যুক্ত করার সুযোগ',
        'বোর্ড প্যাটার্ন অ্যাসাইনমেন্ট ও এক্সাম ক্রিয়েশন',
        'ব্যাচ পারফরম্যান্স ও কমন ভুলের অ্যানালিটিক্স',
      ],
    },
    betaTrial: {
      id: 'beta_trial',
      nameBn: '১৪ দিনের পাবলিক বেটা ট্রায়াল',
      trialDurationDays: 14,
      autoRenew: false,
      descriptionBn: 'সকল নতুন শিক্ষার্থীর জন্য প্রথম ১৪ দিন প্লাস ফিচারের ট্রায়াল অ্যাক্টিভ থাকবে। কোনো হিডেন চার্জ নেই।',
    },
  },

  // Payment Status
  payments: {
    isConfigured: false, // Set to true when bKash/Nagad/SSLCommerz merchant is live
    provider: 'bKash / Nagad / SSLCommerz',
    statusNoticeBn: 'পাবলিক বেটা চলাকালীন ১৪ দিনের ফ্রি ট্রায়াল সক্রিয় রয়েছে — পেমেন্ট গেটওয়ে মার্চেন্ট অনুমোদন প্রক্রিয়াধীন।',
  },
} as const;

// Official NCTB Subject Chapters
export const NCTB_CHAPTERS = {
  'সাধারণ গণিত': [
    'অধ্যায় ১: বাস্তব সংখ্যা',
    'অধ্যায় ২: সেট ও ফাংশন',
    'অধ্যায় ৩: বীজগাণিতিক রাশি',
    'অধ্যায় ৪: সূচক ও লগারিদম',
    'অধ্যায় ৫: এক চলকবিশিষ্ট সমীকরণ',
    'অধ্যায় ৬: রেখা, কোণ ও ত্রিভুজ',
    'অধ্যায় ৭: ব্যবহারিক জ্যামিতি',
    'অধ্যায় ৮: বৃত্ত',
    'অধ্যায় ৯: ত্রিকোণমিতিক অনুপাত',
    'অধ্যায় ১০: দূরত্ব ও উচ্চতা',
    'অধ্যায় ১১: বীজগাণিতিক অনুপাত ও সমানুপাত',
    'অধ্যায় ১২: দুই চলকবিশিষ্ট সরল সহসমীকরণ',
    'অধ্যায় ১৩: সসীম ধারা',
    'অধ্যায় ১৪: অনুপাত, সদৃশতা ও প্রতিসমতা',
    'অধ্যায় ১৫: ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য',
    'অধ্যায় ১৬: পরিমিতি',
    'অধ্যায় ১৭: পরিসংখ্যান',
  ],
  'পদার্থবিজ্ঞান': [
    'অধ্যায় ১: ভৌত রাশি ও পরিমাপ',
    'অধ্যায় ২: গতি (Motion)',
    'অধ্যায় ৩: বল (Force)',
    'অধ্যায় ৪: কাজ, ক্ষমতা ও শক্তি',
    'অধ্যায় ৫: পদার্থের অবস্থা ও চাপ',
    'অধ্যায় ৬: বস্তুর উপর তাপের প্রভাব',
    'অধ্যায় ৭: তরঙ্গ ও শব্দ',
    'অধ্যায় ৮: আলোর প্রতিফলন',
    'অধ্যায় ৯: আলোর প্রতিসরণ',
    'অধ্যায় ১০: স্থির তড়িৎ',
    'অধ্যায় ১১: চল তড়িৎ',
    'অধ্যায় ১২: বিদ্যুতের চৌম্বক ক্রিয়া',
    'অধ্যায় ১৩: আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স',
    'অধ্যায় ১৪: জীবন বাঁচাতে পদার্থবিজ্ঞান',
  ],
  'রসায়ন': [
    'অধ্যায় ১: রসায়নের ধারণা',
    'অধ্যায় ২: পদার্থের অবস্থা',
    'অধ্যায় ৩: পদার্থের গঠন (পরমাণুর মডেল ও ইলেকট্রন বিন্যাস)',
    'অধ্যায় ৪: পর্যায় সারণি',
    'অধ্যায় ৫: রাসায়নিক বন্ধন (আয়নিক ও সমযোজী)',
    'অধ্যায় ৬: মোলের ধারণা ও রাসায়নিক গণনা',
    'অধ্যায় ৭: রাসায়নিক বিক্রিয়া (রেডক্স ও লা শাতেলিয়ে)',
    'অধ্যায় ৮: রসায়ন ও শক্তি (তড়িৎ রাসায়নিক কোষ)',
    'অধ্যায় ৯: এসিড-ক্ষার সমতা (pH ও প্রশমন)',
    'অধ্যায় ১০: খনিজ সম্পদ: ধাতু ও অধাতু',
    'অধ্যায় ১১: খনিজ সম্পদ: জীবাশ্ম (হাইড্রোকার্বন)',
    'অধ্যায় ১২: আমাদের জীবনে রসায়ন',
  ],
  'জীববিজ্ঞান': [
    'অধ্যায় ১: জীবন পাঠ (শ্রেণিবিন্যাস)',
    'অধ্যায় ২: জীবকোষ ও টিস্যু',
    'অধ্যায় ৩: কোষ বিভাজন (মাইটোসিস ও মিয়োসিস)',
    'অধ্যায় ৪: জীবনীশক্তি (সালোকসংশ্লেষণ ও শ্বসন)',
    'অধ্যায় ৫: খাদ্য, পুষ্টি এবং পরিপাক',
    'অধ্যায় ৬: জীবে পরিবহন (মানব রক্ত সংবহন ও হৃদপিণ্ড)',
    'অধ্যায় ৭: গ্যাসীয় বিনিময় (মানব শ্বসনতন্ত্র)',
    'অধ্যায় ৮: রেচন প্রক্রিয়া (বৃক্ক ও নেফ্রন)',
    'অধ্যায় ৯: দৃঢ়তা প্রদান ও চলন (কঙ্কালতন্ত্র)',
    'অধ্যায় ১০: সমন্বয় (স্নায়ুতন্ত্র ও হরমোন)',
    'অধ্যায় ১১: জীবের প্রজনন',
    'অধ্যায় ১২: জীবের বংশগতি ও জৈব অভিব্যক্তি (DNA ও মেন্ডেল)',
    'অধ্যায় ১৩: জীবের পরিবেশ (বাস্তুতন্ত্র)',
    'অধ্যায় ১৪: জীবপ্রযুক্তি (টিস্যু কালচার ও জেনেটিক ইঞ্জিনিয়ারিং)',
  ],
} as const;
