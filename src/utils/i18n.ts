export type Language = 'bn' | 'en';

export interface Translations {
  // Navigation
  navHome: string;
  navStudentDashboard: string;
  navTeacherPanel: string;
  navMistakeNotebook: string;
  navBoardPattern: string;
  navFounder: string;
  navLogin: string;
  navLogout: string;
  navSignUp: string;
  navStreak: string;
  navDays: string;
  navFreeExam: string;
  navCreateExam: string;
  roleStudent: string;
  roleTeacher: string;
  roleAdmin: string;

  // Landing Page
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroStartExamBtn: string;
  heroTeacherBtn: string;
  heroTrust1: string;
  heroTrust2: string;
  heroTrust3: string;
  heroMockTitle: string;
  heroMockChapter: string;
  heroMockMastery: string;
  heroMockCompleted: string;
  heroMockAccuracy: string;
  heroMockDue: string;
  heroMockTopicTitle: string;
  heroMockAiInsight: string;
  heroMockStartDiag: string;

  // Features Section
  featBadge: string;
  featTitle: string;
  featStep1Title: string;
  featStep1Desc: string;
  featStep2Title: string;
  featStep2Desc: string;
  featStep3Title: string;
  featStep3Desc: string;
  featStep4Title: string;
  featStep4Desc: string;

  // Core Pillars
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;

  // Teacher Pitch
  teacherPitchBadge: string;
  teacherPitchTitle: string;
  teacherPitchDesc: string;
  teacherPitchBtn1: string;
  teacherPitchBtn2: string;

  // Founder Section
  founderBadge: string;
  founderTitle: string;
  founderSubtitle: string;
  founderQuote: string;
  founderUploadBtn: string;
  founderRemoveBtn: string;
  founderRole: string;
  founderPillar1Title: string;
  founderPillar1Desc: string;
  founderPillar2Title: string;
  founderPillar2Desc: string;

  // FAQ
  faqTitle: string;
  faqSubtitle: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  footerRights: string;
  footerTagline: string;

  // Dashboards
  studentWelcome: string;
  studentTagline: string;
  readinessTitle: string;
  readinessDisclaimer: string;
  masteryScore: string;
  activeBasedOn: string;
  completedExams: string;
  avgAccuracy: string;
  studyStreak: string;
  keepStreak: string;
  dueToday: string;
  reviewInNotebook: string;
  quickActionsTitle: string;
  qaAdaptiveTitle: string;
  qaAdaptiveDesc: string;
  qaMistakesTitle: string;
  qaMistakesDesc: string;
  qaChallengeTitle: string;
  qaChallengeDesc: string;
  qaAiCoachTitle: string;
  qaAiCoachDesc: string;
  suggestionsTitle: string;
  curriculumProgressTitle: string;
  joinBatchTitle: string;
  joinBatchPlaceholder: string;
  joinBatchBtn: string;

  // Auth Modal
  authModalTitleLogin: string;
  authModalTitleSignup: string;
  authRoleStudent: string;
  authRoleTeacher: string;
  authEmail: string;
  authPassword: string;
  authName: string;
  authInstitution: string;
  authSubject: string;
  authSubmitLogin: string;
  authSubmitSignup: string;
  authNoAccount: string;
  authHasAccount: string;
  authDemoLoginStudent: string;
  authDemoLoginTeacher: string;
  authAdminNotice: string;
}

export const translations: Record<Language, Translations> = {
  bn: {
    // Navigation
    navHome: 'হোম (Home)',
    navStudentDashboard: 'শিক্ষার্থী ড্যাশবোর্ড',
    navTeacherPanel: 'শিক্ষক প্যানেল',
    navMistakeNotebook: 'মিস্টেক নোটবুক',
    navBoardPattern: 'বোর্ড প্যাটার্ন',
    navFounder: 'প্রতিষ্ঠাতা ও লক্ষ্য',
    navLogin: 'লগইন করুন',
    navLogout: 'লগআউট',
    navSignUp: 'নতুন একাউন্ট',
    navStreak: 'দিন স্ট্রিক',
    navDays: 'দিন',
    navFreeExam: 'ফ্রি পরীক্ষা দাও',
    navCreateExam: 'পরীক্ষা তৈরি করুন',
    roleStudent: 'শিক্ষার্থী (Student)',
    roleTeacher: 'শিক্ষক (Teacher)',
    roleAdmin: 'অ্যাডমিন (Admin)',

    // Landing Page
    heroBadge: 'বাংলাদেশি এসএসসি ২০২৭ শিক্ষার্থীদের স্মার্ট প্ল্যাটফর্ম',
    heroTitle: 'পরীক্ষার প্রস্তুতি এবার আরও স্মার্ট।',
    heroSubtitle: 'AI দিয়ে পরীক্ষা দাও, নিজের দুর্বলতা খুঁজে বের করো, আর প্রতিদিন আরও ভালো করো। তোমার ভুলই তোমার পরবর্তী প্রস্তুতি।',
    heroStartExamBtn: 'ফ্রি পরীক্ষা শুরু করো',
    heroTeacherBtn: 'আমি একজন শিক্ষক',
    heroTrust1: 'এনসিটিবি পাঠ্যবই ভিত্তিক নির্ভরযোগ্য প্রশ্ন',
    heroTrust2: 'ভুলের কারণসহ বাংলা ব্যাখ্যা',
    heroTrust3: 'সম্পূর্ণ ফ্রি ও মোবাইল-বান্ধব',
    heroMockTitle: 'এসএসসি সাধারণ গণিত ড্যাশবোর্ড',
    heroMockChapter: 'অধ্যায় ৩: বীজগাণিতিক রাশি',
    heroMockMastery: 'মাস্টারি স্কোর ৮৪%',
    heroMockCompleted: 'পরীক্ষা সম্পন্ন',
    heroMockAccuracy: 'গড় নির্ভুলতা',
    heroMockDue: 'রিভিশন বাকি',
    heroMockTopicTitle: 'টপিকভিত্তিক দক্ষতা বিশ্লেষণ',
    heroMockAiInsight: 'এআই বিশ্লেষণ: উৎপাদকে বিশ্লেষণের শেষ পরীক্ষায় তুমি চিহ্ন পরিবর্তনের ভুলেই ভুল করেছো। ৫ মিনিটের একটি স্পেশাল প্র্যাকটিস কুইজ দাও।',
    heroMockStartDiag: 'ডায়াগনস্টিক পরীক্ষা শুরু করো (১২টি প্রশ্ন)',

    // Features Section
    featBadge: 'সহজ ও বৈজ্ঞানিক পদ্ধতি',
    featTitle: 'কীভাবে ExamDNA তোমার প্রস্তুতি আমূল বদলে দেবে?',
    featStep1Title: 'বিষয় ও টপিক নির্বাচন',
    featStep1Desc: 'তোমার বোর্ড ও ক্লাসের জন্য নির্ধারিত অধ্যায় এবং পছন্দের টপিক বেছে নাও।',
    featStep2Title: 'স্মার্ট পরীক্ষা গ্রহণ',
    featStep2Desc: 'টাইমার ও স্বয়ংক্রিয় নিরাপত্তা সহকারে আসল পরীক্ষার অনুভূতিতে পরীক্ষা দাও।',
    featStep3Title: 'ভুলের তাৎক্ষণিক বিশ্লেষণ',
    featStep3Desc: 'সিস্টেম প্রতিটি ভুল প্রশ্নের কারণ ও সঠিক সমাধান স্বয়ংক্রিয় নোটবুকে সংরক্ষণ করে।',
    featStep4Title: 'অ্যাডাপটিভ দুর্বলতা দূরীকরণ',
    featStep4Desc: 'তোমার দুর্বল অংশে বেশি প্রশ্ন দিয়ে পরবর্তী পরীক্ষা তৈরি হয়, যতক্ষণ না তুমি মাস্টার হও।',

    // Core Pillars
    pillar1Title: 'স্মার্ট মিস্টেক নোটবুক',
    pillar1Desc: 'ভুল থেকেই আসল শেখা। তোমার প্রতিটি ভুল উত্তর, ব্যাখ্যা ও চেষ্টার সংখ্যা আলাদাভাবে সেভ থাকে। স্পেসড রিপিটেশন পদ্ধতিতে ১ দিন, ৩ দিন ও ৭ দিন পর রিভিশনের তাগিদ দেয়।',
    pillar2Title: 'অ্যাডাপটিভ এআই ইঞ্জিন',
    pillar2Desc: 'সাধারণ কুইজ অ্যাপ এলোমেলো প্রশ্ন দেয়। কিন্তু ExamDNA তোমার দুর্বলতম টপিককে ৬০% প্রাধান্য দিয়ে কুইজ তৈরি করে, যেন সময় নষ্ট না করে দুর্বলতা দ্রুত কাটিয়ে ওঠা যায়।',
    pillar3Title: 'বন্ধুদের সাথে চ্যালেঞ্জ',
    pillar3Desc: 'একই প্রশ্নপত্রে বন্ধুদের সাথে কুইজ যুদ্ধ করো। ৯:১৬ অনুপাতের স্টোরি কার্ডের মাধ্যমে ফেসবুক বা হোয়াটসঅ্যাপে স্কোর শেয়ার করে জানাও: "আমার স্কোর হারাতে পারবে কি?"',

    // Teacher Pitch
    teacherPitchBadge: 'শিক্ষক ও কোচিং সেন্টারের জন্য ডেডিকেটেড ফিচার',
    teacherPitchTitle: 'প্রশ্ন লেখার ঝামেলা ছাড়া মিনিটেই তৈরি করুন বোর্ড স্ট্যান্ডার্ড পরীক্ষা।',
    teacherPitchDesc: 'টপিক নির্বাচন করলেই এআই সিলেবাসের নিয়ম মেনে প্রশ্ন সেট তৈরি করে। শিক্ষক যাচাই করে এক ক্লিকে অনুমোদন দিয়ে ব্যাচে লিংক পাঠিয়ে দিতে পারেন। শিক্ষার্থীরা পরীক্ষা শেষ করলেই ক্লাস রেজাল্ট শিট এবং কোন প্রশ্নে পুরো ক্লাস বেশি ভুল করেছে তা স্বয়ংক্রিয়ভাবে দেখা যায়।',
    teacherPitchBtn1: 'শিক্ষক হিসেবে ব্যাচ তৈরি করুন',
    teacherPitchBtn2: 'বোর্ড প্রশ্নের সততা নীতি দেখুন',

    // Founder Section
    founderBadge: 'প্রতিষ্ঠাতার কথা ও দর্শন',
    founderTitle: 'বাংলাদেশের প্রতিটি শিক্ষার্থীর কাছে বিশ্বমানের প্রস্তুতি পৌঁছে দেওয়া',
    founderSubtitle: 'ExamDNA BD — ভুলকে ভয় না পেয়ে তা থেকে শ্রেষ্ঠত্ব অর্জনের প্ল্যাটফর্ম।',
    founderQuote: '"আমরা বিশ্বাস করি প্রতিটি ভুলের ভেতরেই পরবর্তী সফলতার সূত্র লুকিয়ে থাকে। আমাদের লক্ষ্য একটি পয়সাও অপচয় না করে বাংলাদেশের প্রত্যন্ত অঞ্চলের শিক্ষার্থী ও শিক্ষকদের কাছে সেরা এআই শিক্ষাপ্রযুক্তি পৌঁছে দেওয়া।"',
    founderUploadBtn: 'প্রতিষ্ঠাতার ছবি যুক্ত করুন',
    founderRemoveBtn: 'ছবি মুছুন',
    founderRole: 'উদ্যোক্তা ও রূপকার, ExamDNA BD',
    founderPillar1Title: '১০০% জিরো-বাজেট সমতা',
    founderPillar1Desc: 'প্রাইভেট টিউশনের ব্যয়বহুল সীমাবদ্ধতা দূর করে বিনামূল্যে মানসম্মত বোর্ড প্রস্তুতি।',
    founderPillar2Title: 'একাডেমিক সততা ও নিরাপত্তা',
    founderPillar2Desc: 'ভুয়া কৃত্রিম ডেটা পরিহার করে নির্ভুল এনসিটিবি সিলেবাসের প্রতি নিষ্ঠা।',

    // FAQ
    faqTitle: 'সাধারণ জিজ্ঞাসা (FAQ)',
    faqSubtitle: 'ExamDNA BD সম্পর্কে বহুল জিজ্ঞাসিত প্রশ্নাবলী',
    faq1Q: 'ExamDNA BD ব্যবহার করতে কি কোনো ফি দিতে হবে?',
    faq1A: 'না। বর্তমান প্রোটোটাইপ ও মৌলিক ফিচার সম্পূর্ণ ফ্রি। শিক্ষার্থী ও শিক্ষক উভয়েই ফ্রিতে অ্যাকাউন্ট তৈরি করে পরীক্ষা দিতে এবং ব্যাচ পরিচালনা করতে পারেন।',
    faq2Q: 'প্রশ্নের উত্তর কি নির্ভরযোগ্য ও সিলেবাসভুক্ত?',
    faq2A: 'হ্যাঁ। আমাদের সকল প্রশ্ন বাংলাদেশ জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত এসএসসি ২০২৭ গণিত সিলেবাস অনুযায়ী তৈরি এবং গাণিতিকভাবে সুনির্দিষ্ট উত্তর সংবলিত।',
    faq3Q: 'পরীক্ষার মাঝখানে মোবাইল রিলোড বা নেট চলে গেলে কি উত্তর মুছে যাবে?',
    faq3A: 'না। ExamDNA তে লোকাল অটো-সেভ প্রযুক্তি ব্যবহৃত হয়। অসাবধানতাবশত পেজ রিফ্রেশ হলেও তোমার পূর্বে দেওয়া উত্তর ও টাইমার নিরাপদ থাকে।',
    footerRights: 'সর্বস্বত্ব সংরক্ষিত। শিক্ষামূলক উদ্দেশ্যে নির্মিত।',
    footerTagline: 'তোমার ভুলই তোমার পরবর্তী প্রস্তুতি',

    // Dashboards
    studentWelcome: 'স্বাগতম, ',
    studentTagline: 'আজ তোমার প্রস্তুতি কেমন চলছে? তোমার ভুলই তোমার পরবর্তী প্রস্তুতি।',
    readinessTitle: 'প্রস্তুতি ওভারভিউ (Readiness Overview)',
    readinessDisclaimer: '*প্র্যাকটিস স্কোর শুধুমাত্র নিয়মিত অনুশীলনের নির্দেশক, বোর্ড পরীক্ষার ফলাফলের পূর্বাভাস নয়।',
    masteryScore: 'প্র্যাকটিস মাস্টারি স্কোর',
    activeBasedOn: 'সক্রিয় অনুশীলনের ভিত্তিতে',
    completedExams: 'সম্পন্ন পরীক্ষা',
    avgAccuracy: 'গড় নির্ভুলতা',
    studyStreak: 'স্টাডি স্ট্রিক',
    keepStreak: 'ধারাবাহিকতা বজায় রাখো',
    dueToday: 'আজ রিভিশন বাকি',
    reviewInNotebook: 'নোটবুকে রিভিশন করো →',
    quickActionsTitle: 'দ্রুত শুরু করো (Quick Actions)',
    qaAdaptiveTitle: 'অ্যাডাপটিভ এআই প্র্যাকটিস',
    qaAdaptiveDesc: 'তোমার দুর্বল টপিককে ৬০% অগ্রাধিকার দিয়ে কাস্টম কুইজ তৈরি করবে।',
    qaMistakesTitle: 'স্মার্ট মিস্টেক নোটবুক',
    qaMistakesDesc: 'সংরক্ষিত ভুলের ব্যাখ্যা দেখো ও স্পেসড রিপিটেশনে পুনরায় চেষ্টা করো।',
    qaChallengeTitle: 'বন্ধুর সাথে চ্যালেঞ্জ',
    qaChallengeDesc: 'একই প্রশ্নে বন্ধুকে ৫ মিনিটের চ্যালেঞ্জ ছুঁড়ে দিয়ে স্কোর তুলনা করো।',
    qaAiCoachTitle: 'বাংলা এআই স্টাডি কোচ',
    qaAiCoachDesc: '"আমি এই অঙ্কটা কেন ভুল করলাম?" সরাসরি বাংলায় জিজ্ঞাসা করো।',
    suggestionsTitle: 'ব্যক্তিগত পরামর্শ (Personalized Suggestions)',
    curriculumProgressTitle: 'সিলেবাস অগ্রগতি (Curriculum Progress)',
    joinBatchTitle: 'শিক্ষকের ব্যাচে যুক্ত হও (Join Teacher Batch)',
    joinBatchPlaceholder: 'যেমন: SSC2027M',
    joinBatchBtn: 'যুক্ত হও',

    // Auth Modal
    authModalTitleLogin: 'একাউন্টে লগইন করুন',
    authModalTitleSignup: 'নতুন একাউন্ট খুলুন',
    authRoleStudent: 'শিক্ষার্থী একাউন্ট',
    authRoleTeacher: 'শিক্ষক একাউন্ট',
    authEmail: 'ইমেইল ঠিকানা',
    authPassword: 'পাসওয়ার্ড',
    authName: 'পূর্ণ নাম',
    authInstitution: 'বিদ্যালয় / প্রতিষ্ঠানের নাম',
    authSubject: 'পড়ানোর প্রধান বিষয়',
    authSubmitLogin: 'লগইন করুন',
    authSubmitSignup: 'একাউন্ট নিশ্চিত করুন',
    authNoAccount: 'একাউন্ট নেই? নতুন একাউন্ট খুলুন',
    authHasAccount: 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন',
    authDemoLoginStudent: '⚡ দ্রুত টেস্ট লগইন (শিক্ষার্থী)',
    authDemoLoginTeacher: '⚡ দ্রুত টেস্ট লগইন (শিক্ষক)',
    authAdminNotice: 'অ্যাডমিন পোর্টাল পৃথক সুরক্ষিত রুটে সংরক্ষিত।',
  },
  en: {
    // Navigation
    navHome: 'Home',
    navStudentDashboard: 'Student Dashboard',
    navTeacherPanel: 'Teacher Workspace',
    navMistakeNotebook: 'Mistake Notebook',
    navBoardPattern: 'Board Patterns',
    navFounder: 'Founder & Mission',
    navLogin: 'Sign In',
    navLogout: 'Sign Out',
    navSignUp: 'Sign Up',
    navStreak: 'Day Streak',
    navDays: 'days',
    navFreeExam: 'Start Free Exam',
    navCreateExam: 'Create Exam',
    roleStudent: 'Student',
    roleTeacher: 'Teacher',
    roleAdmin: 'Administrator',

    // Landing Page
    heroBadge: 'Smart Examination Engine for SSC 2027 in Bangladesh',
    heroTitle: 'Exam Preparation, Reimagined with AI.',
    heroSubtitle: 'Take exams, pinpoint exact learning gaps, and improve every day. Your mistakes are your next preparation.',
    heroStartExamBtn: 'Start Free Diagnostic',
    heroTeacherBtn: 'I am a Teacher',
    heroTrust1: 'Aligned with official NCTB curriculum',
    heroTrust2: 'Step-by-step Bengali & Math solutions',
    heroTrust3: '100% Free & Mobile First',
    heroMockTitle: 'SSC General Math Dashboard',
    heroMockChapter: 'Chapter 3: Algebraic Expressions',
    heroMockMastery: 'Mastery Score 84%',
    heroMockCompleted: 'Completed Exams',
    heroMockAccuracy: 'Avg Accuracy',
    heroMockDue: 'Revisions Due',
    heroMockTopicTitle: 'Concept Mastery Breakdown',
    heroMockAiInsight: 'AI Insight: In your last test, you made sign inversion errors in factoring. Take a 5-minute targeted quiz.',
    heroMockStartDiag: 'Start Diagnostic Exam (12 Questions)',

    // Features Section
    featBadge: 'Simple & Scientific Workflow',
    featTitle: 'How ExamDNA BD Transforms Your Preparation',
    featStep1Title: 'Select Subject & Topics',
    featStep1Desc: 'Choose your curriculum track and specific chapter concepts.',
    featStep2Title: 'Smart Examination',
    featStep2Desc: 'Experience timed, authentic board-pattern tests with auto-save.',
    featStep3Title: 'Instant Mistake Analytics',
    featStep3Desc: 'Mistakes are automatically stored with grounded step-by-step explanations.',
    featStep4Title: 'Adaptive Weakness Eradication',
    featStep4Desc: 'Targeted quizzes allocate 60% of questions to your weakest topics until mastered.',

    // Core Pillars
    pillar1Title: 'Smart Mistake Notebook',
    pillar1Desc: 'Real learning comes from mistakes. Every error is preserved with spaced-repetition prompts at 1, 3, and 7-day intervals.',
    pillar2Title: 'Adaptive AI Engine',
    pillar2Desc: 'Rather than random questions, ExamDNA crafts quizzes focusing 60% on your weakest areas so no study time is wasted.',
    pillar3Title: 'Challenge Your Friends',
    pillar3Desc: 'Duel your peers with identical question sets and share 9:16 score cards to Messenger and WhatsApp stories.',

    // Teacher Pitch
    teacherPitchBadge: 'Built for Teachers & Coaching Centers',
    teacherPitchTitle: 'Create Board-Standard Exams in Minutes Without Writing Questions.',
    teacherPitchDesc: 'Select your topic and difficulty. ExamDNA generates an NCTB-compliant question paper. Review, approve with one click, share private batch links, and monitor real-time class analytics.',
    teacherPitchBtn1: 'Create Teacher Batch',
    teacherPitchBtn2: 'Inspect Academic Integrity Standards',

    // Founder Section
    founderBadge: 'Founder Vision & Ethics',
    founderTitle: 'Delivering World-Class EdTech to Every Student Across Bangladesh',
    founderSubtitle: 'ExamDNA BD — Turning learning mistakes into milestones of mastery.',
    founderQuote: '"We believe every mistake contains the blueprint for the student\'s next breakthrough. Our mission is to provide zero-budget, high-intelligence education tools to every student and teacher in Bangladesh."',
    founderUploadBtn: 'Upload Founder Photo',
    founderRemoveBtn: 'Remove Photo',
    founderRole: 'Founder & Vision Architect, ExamDNA BD',
    founderPillar1Title: '100% Zero-Budget Equity',
    founderPillar1Desc: 'Eliminating the financial barrier of expensive private tutoring with free board-level prep.',
    founderPillar2Title: 'Academic Honesty & Security',
    founderPillar2Desc: 'No fabricated frequencies or fake statistics; strictly verified NCTB curriculum alignment.',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Everything you need to know about ExamDNA BD',
    faq1Q: 'Is ExamDNA BD completely free to use?',
    faq1A: 'Yes. The core prototype and learning features are 100% free for students and teachers.',
    faq2Q: 'Are the questions aligned with the Bangladesh board syllabus?',
    faq2A: 'Yes. All questions follow the NCTB SSC 2027 Mathematics syllabus with deterministic mathematical solutions.',
    faq3Q: 'Will I lose my answers if my browser refreshes or network drops?',
    faq3A: 'No. Local auto-save ensures your selected answers and timer state are preserved safely.',
    footerRights: 'All rights reserved. Created for educational empowerment.',
    footerTagline: 'Your mistakes are your next preparation',

    // Dashboards
    studentWelcome: 'Welcome, ',
    studentTagline: 'How is your study progressing today? Your mistakes are your next preparation.',
    readinessTitle: 'Readiness Overview',
    readinessDisclaimer: '*Practice mastery indicates study consistency and is not a prediction of final board results.',
    masteryScore: 'Practice Mastery',
    activeBasedOn: 'Based on active practice',
    completedExams: 'Completed Exams',
    avgAccuracy: 'Avg Accuracy',
    studyStreak: 'Study Streak',
    keepStreak: 'Maintain consistency',
    dueToday: 'Due Today',
    reviewInNotebook: 'Review in Notebook →',
    quickActionsTitle: 'Quick Actions',
    qaAdaptiveTitle: 'Adaptive AI Practice',
    qaAdaptiveDesc: 'Generates custom quizzes focusing 60% on your weakest concepts.',
    qaMistakesTitle: 'Smart Mistake Notebook',
    qaMistakesDesc: 'Review verified solutions and retry using spaced repetition.',
    qaChallengeTitle: 'Challenge a Friend',
    qaChallengeDesc: 'Create a 5-minute identical quiz battle and compare scores.',
    qaAiCoachTitle: 'Bangla AI Study Coach',
    qaAiCoachDesc: '"Why did I make this mistake?" Get instant explanations in Bengali.',
    suggestionsTitle: 'Personalized Suggestions',
    curriculumProgressTitle: 'Curriculum Progress',
    joinBatchTitle: 'Join Teacher Batch',
    joinBatchPlaceholder: 'e.g. SSC2027M',
    joinBatchBtn: 'Join Batch',

    // Auth Modal
    authModalTitleLogin: 'Sign in to ExamDNA BD',
    authModalTitleSignup: 'Create Your Account',
    authRoleStudent: 'Student Account',
    authRoleTeacher: 'Teacher Account',
    authEmail: 'Email Address',
    authPassword: 'Password',
    authName: 'Full Name',
    authInstitution: 'School / Coaching Name',
    authSubject: 'Primary Teaching Subject',
    authSubmitLogin: 'Sign In',
    authSubmitSignup: 'Complete Sign Up',
    authNoAccount: "Don't have an account? Sign up",
    authHasAccount: 'Already have an account? Sign in',
    authDemoLoginStudent: '⚡ Quick Demo Login (Student)',
    authDemoLoginTeacher: '⚡ Quick Demo Login (Teacher)',
    authAdminNotice: 'Admin portal is restricted to founder accounts on a separate route.',
  },
};
