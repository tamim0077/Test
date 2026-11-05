import type { Question } from './examScoring.ts';

export interface TopicWeight {
  topic: string;
  category: 'weak' | 'developing' | 'strong';
  mistakeCount: number;
}

export function categorizeTopics(
  allTopics: string[],
  userMistakes: Array<{ topic: string }>
): Record<string, 'weak' | 'developing' | 'strong'> {
  const counts: Record<string, number> = {};
  for (const t of allTopics) {
    counts[t] = 0;
  }
  for (const m of userMistakes) {
    counts[m.topic] = (counts[m.topic] || 0) + 1;
  }

  const result: Record<string, 'weak' | 'developing' | 'strong'> = {};
  for (const t of allTopics) {
    const mistakeCount = counts[t] || 0;
    if (mistakeCount >= 2) {
      result[t] = 'weak';
    } else if (mistakeCount === 1) {
      result[t] = 'developing';
    } else {
      result[t] = 'strong';
    }
  }
  return result;
}

/**
 * Selects an adaptive quiz based on the 60% weak, 25% developing, 15% strong ratio
 */
export function selectAdaptiveQuestions(
  allQuestions: Question[],
  userMistakes: Array<{ topic: string }>,
  targetCount: number = 10
): Question[] {
  if (allQuestions.length === 0) return [];
  if (allQuestions.length <= targetCount) return [...allQuestions];

  const topics = Array.from(new Set(allQuestions.map(q => q.topic)));
  const topicCategories = categorizeTopics(topics, userMistakes);

  const weakPool = allQuestions.filter(q => topicCategories[q.topic] === 'weak');
  const developingPool = allQuestions.filter(q => topicCategories[q.topic] === 'developing');
  const strongPool = allQuestions.filter(q => topicCategories[q.topic] === 'strong');

  // If student has no mistakes yet, sample evenly across all topics
  if (weakPool.length === 0 && developingPool.length === 0) {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, targetCount);
  }

  // Quotas: approx 60% weak, 25% developing, 15% strong
  const weakTarget = Math.max(1, Math.round(targetCount * 0.6));
  const devTarget = Math.max(1, Math.round(targetCount * 0.25));
  const strongTarget = Math.max(1, targetCount - weakTarget - devTarget);

  const selectedIds = new Set<string>();
  const selectedQuestions: Question[] = [];

  function pickFrom(pool: Question[], count: number) {
    const shuffled = pool.filter(q => !selectedIds.has(q.id)).sort(() => 0.5 - Math.random());
    for (const q of shuffled) {
      if (selectedQuestions.length >= targetCount) break;
      if (count <= 0) break;
      selectedIds.add(q.id);
      selectedQuestions.push(q);
      count--;
    }
  }

  pickFrom(weakPool, weakTarget);
  pickFrom(developingPool, devTarget);
  pickFrom(strongPool, strongTarget);

  // Fill remainder if any pool had fewer questions than target
  if (selectedQuestions.length < targetCount) {
    const remaining = allQuestions.filter(q => !selectedIds.has(q.id)).sort(() => 0.5 - Math.random());
    for (const q of remaining) {
      if (selectedQuestions.length >= targetCount) break;
      selectedIds.add(q.id);
      selectedQuestions.push(q);
    }
  }

  return selectedQuestions;
}
