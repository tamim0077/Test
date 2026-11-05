import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeExamSubmission, type Question } from './examScoring.ts';
import { categorizeTopics, selectAdaptiveQuestions } from './adaptiveEngine.ts';
import { computeNextReview, isReviewDue } from './spacedRepetition.ts';
import { translations } from './i18n.ts';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    subject: 'সাধারণ গণিত',
    chapter: 'বীজগাণিতিক রাশি',
    topic: 'বর্গের সূত্রাবলী',
    questionText: 'a + b = 5 এবং a - b = 3 হলে, ab এর মান কত?',
    options: ['4', '8', '16', '2'],
    correctAnswerIndex: 0,
    explanation: 'ab = ((a+b)/2)^2 - ((a-b)/2)^2 = (5/2)^2 - (3/2)^2 = 25/4 - 9/4 = 16/4 = 4',
    difficulty: 'easy',
    verificationStatus: 'verified',
  },
  {
    id: 'q2',
    subject: 'সাধারণ গণিত',
    chapter: 'বীজগাণিতিক রাশি',
    topic: 'বর্গের সূত্রাবলী',
    questionText: 'x + 1/x = 2 হলে x^2 + 1/x^2 = ?',
    options: ['2', '4', '0', '1'],
    correctAnswerIndex: 0,
    explanation: 'x^2 + 1/x^2 = (x+1/x)^2 - 2 = 4 - 2 = 2',
    difficulty: 'easy',
    verificationStatus: 'verified',
  },
  {
    id: 'q3',
    subject: 'সাধারণ গণিত',
    chapter: 'সেট ও ফাংশন',
    topic: 'উপসেট ও শক্তি সেট',
    questionText: 'A = {1, 2, 3} সেটের উপসেট সংখ্যা কত?',
    options: ['3', '6', '8', '9'],
    correctAnswerIndex: 2,
    explanation: 'উপসেট সংখ্যা = 2^n = 2^3 = 8',
    difficulty: 'easy',
    verificationStatus: 'verified',
  },
  {
    id: 'q4',
    subject: 'সাধারণ গণিত',
    chapter: 'সেট ও ফাংশন',
    topic: 'সেট প্রক্রিয়া ও ভেনচিত্র',
    questionText: 'A ∩ B = ∅ হলে A ও B সেটদ্বয় কেমন সেট?',
    options: ['সংযোগ সেট', 'নিশ্ছেদ সেট', 'সার্বিক সেট', 'পূরক সেট'],
    correctAnswerIndex: 1,
    explanation: 'ছেদ সেট ফাঁকা হলে তারা পরস্পর নিশ্ছেদ সেট (Disjoint Set)',
    difficulty: 'medium',
    verificationStatus: 'verified',
  },
];

test('gradeExamSubmission computes correct score, mistakes, and topic accuracy', () => {
  const answers = {
    q1: 0, // correct
    q2: 1, // incorrect (selected 1, correct is 0)
    q3: 2, // correct
    // q4 unanswered
  };

  const result = gradeExamSubmission(mockQuestions, answers, 120, 600);

  assert.equal(result.totalQuestions, 4);
  assert.equal(result.correctCount, 2);
  assert.equal(result.incorrectCount, 1);
  assert.equal(result.unansweredCount, 1);
  assert.equal(result.score, 2);
  assert.equal(result.accuracyPercentage, 50);
  assert.equal(result.mistakes.length, 1);
  assert.equal(result.mistakes[0].questionId, 'q2');
  assert.equal(result.mistakes[0].selectedOptionIndex, 1);
  assert.equal(result.mistakes[0].correctOptionIndex, 0);
});

test('categorizeTopics identifies weak, developing, and strong topics based on mistakes', () => {
  const allTopics = ['Topic A', 'Topic B', 'Topic C'];
  const userMistakes = [
    { topic: 'Topic A' },
    { topic: 'Topic A' },
    { topic: 'Topic B' },
  ];

  const categories = categorizeTopics(allTopics, userMistakes);

  assert.equal(categories['Topic A'], 'weak');
  assert.equal(categories['Topic B'], 'developing');
  assert.equal(categories['Topic C'], 'strong');
});

test('selectAdaptiveQuestions prioritizes questions from weak topics', () => {
  const userMistakes = [
    { topic: 'বর্গের সূত্রাবলী' },
    { topic: 'বর্গের সূত্রাবলী' },
  ];

  const selected = selectAdaptiveQuestions(mockQuestions, userMistakes, 2);
  assert.equal(selected.length, 2);
  assert.ok(selected.some(q => q.topic === 'বর্গের সূত্রাবলী'));
});

test('computeNextReview implements spaced repetition interval progression and resets on error', () => {
  const baseDate = new Date('2026-10-24T00:00:00.000Z');

  // Step 0 -> correct answer moves to Step 1 (+3 days)
  const step1 = computeNextReview(0, true, baseDate);
  assert.equal(step1.nextStep, 1);
  assert.equal(step1.nextReviewDate.toISOString(), '2026-10-27T00:00:00.000Z');

  // Step 1 -> correct answer moves to Step 2 (+7 days)
  const step2 = computeNextReview(1, true, baseDate);
  assert.equal(step2.nextStep, 2);
  assert.equal(step2.nextReviewDate.toISOString(), '2026-10-31T00:00:00.000Z');

  // Step 2 -> incorrect answer resets to Step 0 (+1 day)
  const reset = computeNextReview(2, false, baseDate);
  assert.equal(reset.nextStep, 0);
  assert.equal(reset.nextReviewDate.toISOString(), '2026-10-25T00:00:00.000Z');
});

test('isReviewDue correctly detects whether a revision timestamp has arrived', () => {
  const past = '2026-10-20T00:00:00.000Z';
  const future = '2026-10-30T00:00:00.000Z';
  const now = new Date('2026-10-24T12:00:00.000Z');

  assert.equal(isReviewDue(past, now), true);
  assert.equal(isReviewDue(future, now), false);
});

test('i18n translations dictionary has complete parity between bn and en', () => {
  const bnKeys = Object.keys(translations.bn) as (keyof typeof translations.bn)[];
  const enKeys = Object.keys(translations.en) as (keyof typeof translations.en)[];

  assert.equal(bnKeys.length, enKeys.length);
  for (const k of bnKeys) {
    assert.ok(translations.bn[k], `Missing bn value for ${k}`);
    assert.ok(translations.en[k], `Missing en value for ${k}`);
  }
});
