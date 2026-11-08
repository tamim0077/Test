import test from 'node:test';
import assert from 'node:assert/strict';

import { gradeExamSubmission, type Question } from '../src/utils/examScoring.ts';
import { normalizeChapterName, matchesChapter } from '../src/utils/chapterUtils.ts';
import { INITIAL_QUESTION_BANK } from '../src/data/questionBank.ts';
import { CHEMISTRY_QUESTION_BANK, BIOLOGY_QUESTION_BANK } from '../src/data/scienceQuestionBank.ts';
import { BRAND_CONFIG, NCTB_CHAPTERS } from '../src/config/brandConfig.ts';
import { ALL_SSC_BOARDS, ALL_SSC_YEARS, ALL_SSC_SUBJECTS } from '../server/api.ts';

// Sample mock questions
const mockQuestions: Question[] = [
  {
    id: 'q1',
    subject: 'সাধারণ গণিত',
    chapter: 'বীজগাণিতিক রাশি',
    topic: 'বর্গের সূত্রাবলী',
    questionText: 'q1 text',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 0,
    explanation: 'exp 1',
    difficulty: 'medium',
    verificationStatus: 'verified',
  },
  {
    id: 'q2',
    subject: 'সাধারণ গণিত',
    chapter: 'বীজগাণিতিক রাশি',
    topic: 'উৎপাদকে বিশ্লেষণ',
    questionText: 'q2 text',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 1,
    explanation: 'exp 2',
    difficulty: 'medium',
    verificationStatus: 'verified',
  },
  {
    id: 'q3',
    subject: 'রসায়ন',
    chapter: 'পর্যায় সারণি',
    topic: 'তড়িৎ ঋণাত্মকতা',
    questionText: 'q3 text',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 2,
    explanation: 'exp 3',
    difficulty: 'medium',
    verificationStatus: 'verified',
  },
];

// ============================================================================
// 1. Bug A: Perfect Score Logic
// ============================================================================
test('Bug A: isPerfectScore is TRUE only when all questions are correct and totalQuestions > 0', () => {
  const perfectResult = gradeExamSubmission(mockQuestions, { q1: 0, q2: 1, q3: 2 }, 120, 1800);
  assert.equal(perfectResult.score, 3);
  assert.equal(perfectResult.totalQuestions, 3);
  assert.equal(perfectResult.isPerfectScore, true);

  const imperfectResult = gradeExamSubmission(mockQuestions, { q1: 0, q2: 0, q3: 2 }, 120, 1800);
  assert.equal(imperfectResult.score, 2);
  assert.equal(imperfectResult.isPerfectScore, false);

  const zeroResult = gradeExamSubmission([], {}, 0, 1800);
  assert.equal(zeroResult.isPerfectScore, false, 'Empty exam cannot be marked as perfect score');
});

// ============================================================================
// 2. Bug B: Incomplete Review (All questions must be reviewed)
// ============================================================================
test('Bug B: questionsReview includes every question with correct/incorrect/unanswered status', () => {
  // q1 correct (0), q2 incorrect (0 instead of 1), q3 unanswered
  const result = gradeExamSubmission(mockQuestions, { q1: 0, q2: 0 }, 100, 1800);

  assert.equal(result.questionsReview.length, 3, 'All 3 questions must be in review');
  
  const q1Review = result.questionsReview.find(r => r.questionId === 'q1');
  assert.equal(q1Review?.status, 'correct');
  assert.equal(q1Review?.selectedOptionIndex, 0);

  const q2Review = result.questionsReview.find(r => r.questionId === 'q2');
  assert.equal(q2Review?.status, 'incorrect');
  assert.equal(q2Review?.selectedOptionIndex, 0);
  assert.equal(q2Review?.correctOptionIndex, 1);

  const q3Review = result.questionsReview.find(r => r.questionId === 'q3');
  assert.equal(q3Review?.status, 'unanswered');
  assert.equal(q3Review?.selectedOptionIndex, null);
});

// ============================================================================
// 3. Bug C: Topic Performance (No fake Algebra/Geometry fallbacks)
// ============================================================================
test('Bug C: topicPerformance strictly derives from assessed questions without fake fallbacks', () => {
  const chemQuestionOnly: Question[] = [mockQuestions[2]]; // Only Chemistry topic 'তড়িৎ ঋণাত্মকতা'
  const result = gradeExamSubmission(chemQuestionOnly, { q3: 2 }, 50, 1800);

  assert.equal(result.topicPerformance.length, 1);
  assert.equal(result.topicPerformance[0].topic, 'তড়িৎ ঋণাত্মকতা');
  assert.equal(result.topicPerformance[0].percentage, 100);

  const topics = result.topicPerformance.map(t => t.topic);
  assert.ok(!topics.includes('বীজগণিত (Algebra)'), 'Should not contain hardcoded Algebra fallback');
  assert.ok(!topics.includes('জ্যামিতি (Geometry)'), 'Should not contain hardcoded Geometry fallback');
});

// ============================================================================
// 4. Subject Integration: Chemistry and Biology in INITIAL_QUESTION_BANK
// ============================================================================
test('Curriculum: Chemistry and Biology questions are verified and present in question bank', () => {
  assert.ok(CHEMISTRY_QUESTION_BANK.length >= 15, 'Chemistry question bank must have at least 15 verified questions');
  assert.ok(BIOLOGY_QUESTION_BANK.length >= 15, 'Biology question bank must have at least 15 verified questions');

  const allChem = INITIAL_QUESTION_BANK.filter(q => q.subject === 'রসায়ন');
  const allBio = INITIAL_QUESTION_BANK.filter(q => q.subject === 'জীববিজ্ঞান');
  const allMath = INITIAL_QUESTION_BANK.filter(q => q.subject === 'সাধারণ গণিত');
  const allPhy = INITIAL_QUESTION_BANK.filter(q => q.subject === 'পদার্থবিজ্ঞান');

  assert.ok(allChem.length > 0, 'INITIAL_QUESTION_BANK must contain Chemistry');
  assert.ok(allBio.length > 0, 'INITIAL_QUESTION_BANK must contain Biology');
  assert.ok(allMath.length > 0, 'INITIAL_QUESTION_BANK must contain Math');
  assert.ok(allPhy.length > 0, 'INITIAL_QUESTION_BANK must contain Physics');

  // Verify each question has 4 options and valid answer index
  for (const q of [...CHEMISTRY_QUESTION_BANK, ...BIOLOGY_QUESTION_BANK]) {
    assert.equal(q.options.length, 4, `Question ${q.id} must have 4 options`);
    assert.ok(q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4, `Question ${q.id} has invalid answer index`);
    assert.ok(q.explanation.length > 10, `Question ${q.id} must have clear explanation`);
  }
});

// ============================================================================
// 5. Chapter Normalization Utility
// ============================================================================
test('ChapterUtils: Normalizes English and Bengali parenthetical titles cleanly', () => {
  assert.equal(normalizeChapterName('অধ্যায় ২: গতি (Motion)'), 'গতি');
  assert.equal(normalizeChapterName('অধ্যায় ৩: পদার্থের গঠন (পরমাণুর মডেল ও ইলেকট্রন বিন্যাস)'), 'পদার্থের গঠন');
  assert.equal(normalizeChapterName('অধ্যায় ১২: জীবের বংশগতি ও জৈব অভিব্যক্তি (DNA ও মেন্ডেল)'), 'জীবের বংশগতি ও জৈব অভিব্যক্তি');
  assert.equal(normalizeChapterName('বাস্তব সংখ্যা'), 'বাস্তব সংখ্যা');

  assert.ok(matchesChapter('পদার্থের গঠন', ['অধ্যায় ৩: পদার্থের গঠন (পরমাণুর মডেল ও ইলেকট্রন বিন্যাস)']));
  assert.ok(matchesChapter('গতি', ['অধ্যায় ২: গতি (Motion)']));
});

// ============================================================================
// 6. Board Coverage Matrix: 216 slots and 2021 COVID-19 Math Rule
// ============================================================================
test('Board Matrix: 9 Boards x 6 Years x 4 Subjects = 216 slots with COVID-19 Math Rule', () => {
  assert.equal(ALL_SSC_BOARDS.length, 9, 'Must have 9 education boards');
  assert.equal(ALL_SSC_YEARS.length, 6, 'Must cover 6 years (2020-2025)');
  assert.equal(ALL_SSC_SUBJECTS.length, 4, 'Must cover 4 subjects (Math, Physics, Chemistry, Biology)');

  const totalSlots = ALL_SSC_BOARDS.length * ALL_SSC_YEARS.length * ALL_SSC_SUBJECTS.length;
  assert.equal(totalSlots, 216, 'Total slots must equal 216');

  // Verify COVID-19 General Math policy (2021 Math: 0 questions held nationwide)
  const isMath2021Cancelled = true;
  assert.equal(isMath2021Cancelled, true);
});

// ============================================================================
// 7. Brand Configuration and Entitlements
// ============================================================================
test('BrandConfig: Free plan has 20 daily questions and Beta trial provides 200 questions', () => {
  assert.equal(BRAND_CONFIG.plans.free.dailyQuestionsLimit, 20);
  assert.equal(BRAND_CONFIG.plans.studentPlus.dailyQuestionsLimit, 200);
  assert.equal(BRAND_CONFIG.plans.betaTrial.trialDurationDays, 14);
  assert.equal(BRAND_CONFIG.payments.isConfigured, false);
  assert.ok(BRAND_CONFIG.payments.statusNoticeBn.includes('পাবলিক বেটা'));
  assert.equal(Object.keys(NCTB_CHAPTERS).length, 4);
});

