/**
 * Chapter normalization and matching utility for ExamDNA BD.
 * Handles variations between UI labels (e.g. "অধ্যায় ৩: বীজগাণিতিক রাশি")
 * and database storage strings (e.g. "বীজগাণিতিক রাশি").
 */

export function normalizeChapterName(chapter: string): string {
  if (!chapter) return '';
  return chapter
    // Strip leading "অধ্যায় ১:", "অধ্যায় ০২ -", "Chapter 3:", etc.
    .replace(/^(?:অধ্যায়\s*[০-৯0-9]+\s*[:\-–]\s*|chapter\s*[0-9]+\s*[:\-–]\s*)/i, '')
    // Strip trailing English and Bengali parentheticals like "(Motion)", "(পরমাণুর মডেল)"
    .replace(/\s*\([^)]+\)/g, '')
    .trim();
}

export function matchesChapter(questionChapter: string, targetChapters: string[]): boolean {
  if (!targetChapters || targetChapters.length === 0) return true;
  
  const normQ = normalizeChapterName(questionChapter);
  
  for (const target of targetChapters) {
    const normT = normalizeChapterName(target);
    if (!normT) continue;
    if (normQ === normT || normQ.includes(normT) || normT.includes(normQ)) {
      return true;
    }
  }
  return false;
}
