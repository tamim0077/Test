import { randomInt, randomUUID } from 'node:crypto';
import type { Question, GradedExamResult } from '../src/utils/examScoring.ts';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export const requireValue = (ok: unknown, message: string, status = 400) => {
  if (!ok) throw new ApiError(status, message);
};
export function integer(value: unknown, min: number, max: number, fallback?: number): number {
  requireValue(value === undefined || typeof value === 'number' || typeof value === 'string' && /^\d+$/.test(value), `Expected integer ${min}–${max}`);
  const n = value === undefined ? fallback : Number(value);
  requireValue(Number.isInteger(n) && n! >= min && n! <= max, `Expected integer ${min}–${max}`);
  return n!;
}
export function validateQuestion(q: any): asserts q is Question {
  requireValue(q && ['subject', 'chapter', 'topic', 'questionText', 'explanation'].every(k =>
    typeof q[k] === 'string' && q[k].trim().length > 0 && q[k].length <= 10000), 'Question text, taxonomy and explanation are required');
  requireValue(Array.isArray(q.options) && q.options.length === 4 && q.options.every((s: any) =>
    typeof s === 'string' && s.trim() && s.length <= 4000) && new Set(q.options.map((s: string) => s.trim())).size === 4,
    'Four distinct, nonempty options required');
  requireValue(typeof q.correctAnswerIndex === 'number', 'Answer index must be a number');
  integer(q.correctAnswerIndex, 0, 3);
  requireValue(['easy', 'medium', 'hard'].includes(q.difficulty), 'Invalid difficulty');
}
export function shuffle<T>(values: T[], pick = (max: number) => randomInt(max)): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = pick(i + 1); [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function permuteQuestion(q: Question, pick?: (max: number) => number): Question {
  const order = shuffle([0, 1, 2, 3], pick);
  return { ...q, options: order.map(i => q.options[i]) as Question['options'], correctAnswerIndex: order.indexOf(q.correctAnswerIndex) };
}
export interface Attempt {
  id: string; owner: string; title: string; questions: Question[];
  startedAt: number; deadline: number; timeLimitMinutes: number;
  publishedExamId?: string; teacherId?: string; challengeCode?: string;
  isDemo?: boolean;
  result?: GradedExamResult; expiresAt?: number;
}
export function makeAttempt(owner: string, title: string, questions: Question[], minutes: number, now = Date.now()): Attempt {
  return { id: randomUUID(), owner, title, questions: questions.map(q => permuteQuestion(q)), startedAt: now,
    deadline: now + minutes * 60000, timeLimitMinutes: minutes, expiresAt: now + 86400000 };
}
export function publicAttempt(a: Attempt) {
  return { id: a.id, examId: a.id, title: a.title, totalQuestions: a.questions.length,
    timeLimitMinutes: a.timeLimitMinutes, deadline: a.deadline, serverNow: Date.now(),
    publishedExamId: a.publishedExamId,
    questions: a.questions.map(({ id, subject, chapter, topic, questionText, options, difficulty }) =>
      ({ id, subject, chapter, topic, questionText, options, difficulty })) };
}

