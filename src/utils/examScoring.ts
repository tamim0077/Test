export interface Question {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nctbReference?: string;
  verificationStatus: 'verified' | 'needs_review' | 'demo';
  source?: string;
  board?: string | null;
  year?: number | null;
}

export interface ExamSubmissionPayload {
  examId: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex (0-3)
  timeSpentSeconds: number;
  timeLimitSeconds: number;
}

export interface TopicResult {
  topic: string;
  chapter: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface MistakeDetail {
  questionId: string;
  subject: string;
  chapter: string;
  topic: string;
  questionText: string;
  options: [string, string, string, string];
  selectedOptionIndex: number;
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionReviewItem {
  questionId: string;
  subject: string;
  chapter: string;
  topic: string;
  questionText: string;
  options: [string, string, string, string];
  selectedOptionIndex: number | null;
  correctOptionIndex: number;
  status: 'correct' | 'incorrect' | 'unanswered';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nctbReference?: string;
  source?: string;
}

export interface GradedExamResult {
  examId: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  score: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
  topicPerformance: TopicResult[];
  strongestTopic: string | null;
  weakestTopic: string | null;
  mistakes: MistakeDetail[];
  questionsReview: QuestionReviewItem[];
  isPerfectScore: boolean;
  submittedAt: string;
}

export function gradeExamSubmission(
  questions: Question[],
  answers: Record<string, number>,
  timeSpentSeconds: number,
  timeLimitSeconds: number
): GradedExamResult {
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  const mistakes: MistakeDetail[] = [];
  const questionsReview: QuestionReviewItem[] = [];
  const topicMap: Record<string, { chapter: string; total: number; correct: number }> = {};

  for (const q of questions) {
    if (!topicMap[q.topic]) {
      topicMap[q.topic] = { chapter: q.chapter, total: 0, correct: 0 };
    }
    topicMap[q.topic].total += 1;

    const selected = answers[q.id];
    let status: 'correct' | 'incorrect' | 'unanswered';

    if (selected === undefined || selected === null) {
      unansweredCount += 1;
      status = 'unanswered';
    } else if (selected === q.correctAnswerIndex) {
      correctCount += 1;
      topicMap[q.topic].correct += 1;
      status = 'correct';
    } else {
      incorrectCount += 1;
      status = 'incorrect';
      mistakes.push({
        questionId: q.id,
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic,
        questionText: q.questionText,
        options: q.options,
        selectedOptionIndex: selected,
        correctOptionIndex: q.correctAnswerIndex,
        explanation: q.explanation,
        difficulty: q.difficulty,
      });
    }

    questionsReview.push({
      questionId: q.id,
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      questionText: q.questionText,
      options: q.options,
      selectedOptionIndex: selected !== undefined && selected !== null ? selected : null,
      correctOptionIndex: q.correctAnswerIndex,
      status,
      explanation: q.explanation,
      difficulty: q.difficulty,
      nctbReference: q.nctbReference,
      source: q.source,
    });
  }

  const totalQuestions = questions.length;
  const score = correctCount;
  const accuracyPercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPerfectScore = totalQuestions > 0 && correctCount === totalQuestions;

  const topicPerformance: TopicResult[] = Object.entries(topicMap).map(([topic, stats]) => ({
    topic,
    chapter: stats.chapter,
    total: stats.total,
    correct: stats.correct,
    percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
  }));

  // Sort topic performance: lowest accuracy first
  topicPerformance.sort((a, b) => a.percentage - b.percentage);

  const weakestTopic = topicPerformance.length > 0 && topicPerformance[0].percentage < 100
    ? topicPerformance[0].topic
    : null;

  const strongestTopic = topicPerformance.length > 0 && topicPerformance[topicPerformance.length - 1].percentage > 0
    ? topicPerformance[topicPerformance.length - 1].topic
    : null;

  return {
    examId: 'exam-' + Date.now(),
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    score,
    accuracyPercentage,
    timeSpentSeconds: Math.min(timeSpentSeconds, timeLimitSeconds),
    topicPerformance,
    strongestTopic,
    weakestTopic,
    mistakes,
    questionsReview,
    isPerfectScore,
    submittedAt: new Date().toISOString(),
  };
}

