export interface SpacedRepetitionRecord {
  mistakeId: string;
  questionId: string;
  intervalStep: number; // 0 = Day 1, 1 = Day 3, 2 = Day 7, 3 = Mastered
  lastAttemptAt: string;
  nextReviewAt: string;
  consecutiveSuccessCount: number;
  totalAttempts: number;
}

const INTERVAL_DAYS = [1, 3, 7, 14];

export function computeNextReview(
  currentStep: number,
  wasCorrect: boolean,
  baseDate: Date = new Date()
): { nextStep: number; nextReviewDate: Date } {
  let nextStep = currentStep;
  if (wasCorrect) {
    nextStep = Math.min(INTERVAL_DAYS.length - 1, currentStep + 1);
  } else {
    nextStep = 0; // Reset to 1-day interval on incorrect answer
  }

  const daysToAdd = INTERVAL_DAYS[nextStep];
  const nextReviewDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  return {
    nextStep,
    nextReviewDate,
  };
}

export function isReviewDue(nextReviewIsoString: string, now: Date = new Date()): boolean {
  const target = new Date(nextReviewIsoString).getTime();
  return now.getTime() >= target;
}

export function getSpacedRepetitionStatusLabel(step: number, nextReviewIso: string): { label: string; badge: string } {
  const due = isReviewDue(nextReviewIso);
  if (step >= 3) {
    return { label: 'মাস্টারড (Mastered)', badge: 'bg-emerald-100 text-emerald-800' };
  }
  if (due) {
    return { label: 'আজ রিভিশন দিন (Due Today)', badge: 'bg-rose-100 text-rose-800 font-semibold' };
  }
  const daysUntil = Math.max(1, Math.ceil((new Date(nextReviewIso).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
  return { label: `${daysUntil} দিন পর রিভিশন`, badge: 'bg-blue-100 text-blue-800' };
}
