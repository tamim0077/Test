import type { Question } from './examScoring.ts';
import { INITIAL_QUESTION_BANK } from '../data/questionBank.ts';
import { matchesChapter } from './chapterUtils.ts';

export interface EligibleQuestionsFilter {
  subject?: string;
  chapters?: string[];
  questionSource?: string;
  difficulty?: string;
}

export function getEligibleQuestions(
  filter: EligibleQuestionsFilter = {},
  bank: Question[] = INITIAL_QUESTION_BANK
): Question[] {
  const {
    subject = 'all',
    chapters = [],
    questionSource = 'all',
    difficulty = 'all',
  } = filter;

  const list = bank.filter(q => {
    // Only approved/verified questions
    if (q.verificationStatus !== 'verified') return false;

    // 1. Subject filter (support "উভয় বিষয়", "সাধারণ গণিত", "পদার্থবিজ্ঞান", "all")
    if (subject && subject !== 'all' && subject !== 'উভয় বিষয়') {
      if (q.subject !== subject) return false;
    }

    // 2. Chapter filter (normalized matching)
    if (Array.isArray(chapters) && chapters.length > 0) {
      if (!matchesChapter(q.chapter, chapters)) return false;
    }

    // 3. Question source filter
    if (questionSource === 'board') {
      if (!q.source?.includes('বোর্ড')) return false;
    } else if (questionSource === 'ai') {
      if (!q.id.startsWith('ai-') && !q.source?.includes('এনসিটিবি')) return false;
    }

    // 4. Difficulty filter
    if (difficulty && difficulty !== 'adaptive' && difficulty !== 'all') {
      if (q.difficulty !== difficulty) return false;
    }

    return true;
  });

  // Deduplicate by question ID and text fingerprint
  const seenFp = new Set<string>();
  const seenIds = new Set<string>();
  const deduplicated: Question[] = [];

  for (const q of list) {
    if (seenIds.has(q.id)) continue;
    const fp = q.questionText.replace(/[\s\.\?\,\!\:\-\(\)\[\]"']/g, '').toLowerCase();
    if (seenFp.has(fp)) continue;
    seenFp.add(fp);
    seenIds.add(q.id);
    deduplicated.push(q);
  }

  return deduplicated;
}
