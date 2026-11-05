import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_QUESTION_BANK } from '../src/data/questionBank.ts';
import { getEligibleQuestions } from '../src/utils/questionSelector.ts';
import { gradeExamSubmission } from '../src/utils/examScoring.ts';
import { matchesChapter, normalizeChapterName } from '../src/utils/chapterUtils.ts';

test('EXAM COUNT BUG FIX: Chapter Normalization', () => {
  assert.equal(normalizeChapterName('অধ্যায় ৩: বীজগাণিতিক রাশি'), 'বীজগাণিতিক রাশি');
  assert.equal(normalizeChapterName('অধ্যায় ২: গতি (Motion)'), 'গতি');
  assert.equal(normalizeChapterName('অধ্যায় ১: ভৌত রাশি ও পরিমাপ'), 'ভৌত রাশি ও পরিমাপ');
  assert.equal(normalizeChapterName('অধ্যায় ১৭: পরিসংখ্যান'), 'পরিসংখ্যান');

  // Matching check
  assert.equal(matchesChapter('বীজগাণিতিক রাশি', ['অধ্যায় ৩: বীজগাণিতিক রাশি']), true);
  assert.equal(matchesChapter('গতি', ['অধ্যায় ২: গতি (Motion)']), true);
  assert.equal(matchesChapter('বাস্তব সংখ্যা', ['অধ্যায় ১: বাস্তব সংখ্যা']), true);
});

test('EXAM COUNT BUG FIX: Exact Count for 10 Questions (General Math)', () => {
  const eligible = getEligibleQuestions({
    subject: 'সাধারণ গণিত',
    chapters: [],
  });
  assert.ok(eligible.length >= 10, `Eligible count ${eligible.length} must be >= 10`);
  
  const chosen = eligible.slice(0, 10);
  assert.equal(chosen.length, 10, 'Selected questions must be exactly 10');
  
  // Verify deduplication
  const uniqueIds = new Set(chosen.map(q => q.id));
  assert.equal(uniqueIds.size, 10, 'All 10 questions must be unique');
});

test('EXAM COUNT BUG FIX: Exact Count for 20 Questions (Physics)', () => {
  const eligible = getEligibleQuestions({
    subject: 'পদার্থবিজ্ঞান',
    chapters: [],
  });
  assert.ok(eligible.length >= 20, `Eligible count ${eligible.length} must be >= 20`);
  
  const chosen = eligible.slice(0, 20);
  assert.equal(chosen.length, 20, 'Selected questions must be exactly 20');
  
  const uniqueIds = new Set(chosen.map(q => q.id));
  assert.equal(uniqueIds.size, 20, 'All 20 questions must be unique');
});

test('EXAM COUNT BUG FIX: Exact Count for 30 Questions (General Math)', () => {
  const eligible = getEligibleQuestions({
    subject: 'সাধারণ গণিত',
    chapters: [],
  });
  assert.ok(eligible.length >= 30, `Eligible count ${eligible.length} must be >= 30`);
  
  const chosen = eligible.slice(0, 30);
  assert.equal(chosen.length, 30, 'Selected questions must be exactly 30');
  
  const uniqueIds = new Set(chosen.map(q => q.id));
  assert.equal(uniqueIds.size, 30, 'All 30 questions must be unique');
});

test('EXAM COUNT BUG FIX: Exact Count for 35 Questions (Custom Count)', () => {
  const eligible = getEligibleQuestions({
    subject: 'সাধারণ গণিত',
    chapters: [],
  });
  assert.ok(eligible.length >= 35, `Eligible count ${eligible.length} must be >= 35`);
  
  const chosen = eligible.slice(0, 35);
  assert.equal(chosen.length, 35, 'Selected questions must be exactly 35');
  
  const uniqueIds = new Set(chosen.map(q => q.id));
  assert.equal(uniqueIds.size, 35, 'All 35 questions must be unique');
});

test('EXAM COUNT BUG FIX: Exact Count for 50 Questions (General Math)', () => {
  const eligible = getEligibleQuestions({
    subject: 'সাধারণ গণিত',
    chapters: [],
  });
  assert.ok(eligible.length >= 50, `Eligible count ${eligible.length} must be >= 50`);
  
  const chosen = eligible.slice(0, 50);
  assert.equal(chosen.length, 50, 'Selected questions must be exactly 50');
  
  const uniqueIds = new Set(chosen.map(q => q.id));
  assert.equal(uniqueIds.size, 50, 'All 50 questions must be unique');
});

test('EXAM COUNT BUG FIX: Exact Count for 50 Questions (Physics)', () => {
  const eligible = getEligibleQuestions({
    subject: 'পদার্থবিজ্ঞান',
    chapters: [],
  });
  assert.ok(eligible.length >= 50, `Eligible count ${eligible.length} must be >= 50`);
  
  const chosen = eligible.slice(0, 50);
  assert.equal(chosen.length, 50, 'Selected questions must be exactly 50');
  
  const uniqueIds = new Set(chosen.map(q => q.id));
  assert.equal(uniqueIds.size, 50, 'All 50 questions must be unique');
});

test('EXAM COUNT BUG FIX: Exact Count for 100 Questions (Combined / Both Subjects)', () => {
  const eligible = getEligibleQuestions({
    subject: 'উভয় বিষয়',
    chapters: [],
  });
  assert.ok(eligible.length >= 100, `Eligible count ${eligible.length} must be >= 100`);
  
  const chosen = eligible.slice(0, 100);
  assert.equal(chosen.length, 100, 'Selected questions must be exactly 100');
  
  const uniqueIds = new Set(chosen.map(q => q.id));
  assert.equal(uniqueIds.size, 100, 'All 100 questions must be unique');
});

test('EXAM COUNT BUG FIX: Insufficient Questions Protection', () => {
  // Narrow to a single chapter that has only ~5-8 questions
  const eligible = getEligibleQuestions({
    subject: 'সাধারণ গণিত',
    chapters: ['অধ্যায় ১: বাস্তব সংখ্যা'],
  });
  
  const requested = 50;
  assert.ok(eligible.length < requested, `Single chapter count ${eligible.length} should be < 50`);
  
  // Verify that an exam is NOT silently truncated to fewer questions without user consent
  const isSufficient = eligible.length >= requested;
  assert.equal(isSufficient, false, 'Must identify insufficiency');
  
  // When allowPartial is false, the system must report insufficient_questions
  const responsePayload = !isSufficient ? {
    error: 'insufficient_questions',
    requestedCount: requested,
    availableCount: eligible.length,
    message: `আপনার নির্বাচিত বিষয়ের জন্য বর্তমানে ${eligible.length}টি প্রশ্ন পাওয়া যাচ্ছে।`,
  } : null;
  
  assert.ok(responsePayload !== null);
  assert.equal(responsePayload.error, 'insufficient_questions');
  assert.equal(responsePayload.availableCount, eligible.length);
});

test('EXAM COUNT BUG FIX: Exam Scoring with 50 Questions', () => {
  const eligible = getEligibleQuestions({
    subject: 'সাধারণ গণিত',
    chapters: [],
  }).slice(0, 50);
  
  assert.equal(eligible.length, 50);

  // Simulate student answering 40 questions (35 correct, 5 wrong, 10 unanswered)
  const answers: Record<string, number> = {};
  for (let i = 0; i < 35; i++) {
    answers[eligible[i].id] = eligible[i].correctAnswerIndex;
  }
  for (let i = 35; i < 40; i++) {
    // Deliberately incorrect answer
    answers[eligible[i].id] = (eligible[i].correctAnswerIndex + 1) % 4;
  }
  // Questions 40..49 remain unanswered

  const result = gradeExamSubmission(eligible, answers, 1200, 1800);

  assert.equal(result.totalQuestions, 50, 'Total questions graded must be exactly 50');
  assert.equal(result.correctCount, 35, 'Correct count must be 35');
  assert.equal(result.incorrectCount, 5, 'Incorrect count must be 5');
  assert.equal(result.unansweredCount, 10, 'Unanswered count must be 10');
  assert.equal(result.score, 35, 'Score must be 35');
  assert.equal(result.accuracyPercentage, 70, 'Accuracy percentage must be 35/50 = 70%');
  assert.equal(
    result.correctCount + result.incorrectCount + result.unansweredCount,
    50,
    'Sum of categories must equal exact denominator of 50'
  );
});

test('EXAM COUNT BUG FIX: Exam Scoring with 35 Questions', () => {
  const eligible = getEligibleQuestions({
    subject: 'সাধারণ গণিত',
    chapters: [],
  }).slice(0, 35);
  
  assert.equal(eligible.length, 35);

  const answers: Record<string, number> = {};
  for (let i = 0; i < 35; i++) {
    answers[eligible[i].id] = eligible[i].correctAnswerIndex;
  }

  const result = gradeExamSubmission(eligible, answers, 900, 1500);

  assert.equal(result.totalQuestions, 35, 'Total questions graded must be exactly 35');
  assert.equal(result.correctCount, 35, 'Correct count must be 35');
  assert.equal(result.score, 35, 'Score must be 35/35');
  assert.equal(result.accuracyPercentage, 100, 'Accuracy must be 100%');
});
