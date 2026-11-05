/**
 * Study Streak Calculator with Asia/Dhaka Timezone
 * Enforces strict Bangladeshi calendar day boundaries for academic practice streaks.
 */

export function getDhakaDateString(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    // Fallback if Intl timeZone is not available
    const offset = 6 * 60; // UTC+6 for Bangladesh
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const dhakaDate = new Date(utc + (offset * 60000));
    return dhakaDate.toISOString().split('T')[0];
  }
}

export function getYesterdayDhakaDateString(date: Date = new Date()): string {
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  return getDhakaDateString(yesterday);
}

export interface StreakUpdateResult {
  newStreak: number;
  isNewDayPractice: boolean;
  todayDhaka: string;
}

/**
 * Calculates updated streak when a student completes an exam session.
 * - Same day practice: streak remains unchanged (no duplicate increment).
 * - Consecutive day practice: streak increments by 1.
 * - Missed day practice: streak resets to 1.
 */
export function calculateUpdatedStreak(
  currentStreak: number,
  lastActivityDate?: string
): StreakUpdateResult {
  const todayDhaka = getDhakaDateString();
  const yesterdayDhaka = getYesterdayDhakaDateString();

  if (!lastActivityDate) {
    return {
      newStreak: 1,
      isNewDayPractice: true,
      todayDhaka,
    };
  }

  if (lastActivityDate === todayDhaka) {
    // Already practiced today, keep existing streak
    return {
      newStreak: Math.max(1, currentStreak),
      isNewDayPractice: false,
      todayDhaka,
    };
  }

  if (lastActivityDate === yesterdayDhaka) {
    // Practiced yesterday, consecutive streak increment
    return {
      newStreak: (currentStreak || 0) + 1,
      isNewDayPractice: true,
      todayDhaka,
    };
  }

  // Missed one or more days, reset streak to 1
  return {
    newStreak: 1,
    isNewDayPractice: true,
    todayDhaka,
  };
}

/**
 * Checks if streak is currently active today or yesterday.
 * If user hasn't practiced yesterday or today, display streak as 0 until they practice.
 */
export function getActiveDisplayStreak(
  storedStreak: number,
  lastActivityDate?: string
): number {
  if (!lastActivityDate || !storedStreak) return 0;

  const todayDhaka = getDhakaDateString();
  const yesterdayDhaka = getYesterdayDhakaDateString();

  if (lastActivityDate === todayDhaka || lastActivityDate === yesterdayDhaka) {
    return storedStreak;
  }

  // Streak broken
  return 0;
}
