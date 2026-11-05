import type { Question, GradedExamResult, MistakeDetail } from './utils/examScoring.ts';

export type UserRole = 'student' | 'teacher' | 'admin' | 'guest';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution?: string;
  subject?: string;
  track?: 'science' | 'business' | 'humanities';
  examLevel?: 'SSC' | 'HSC' | 'Admission';
  examYear?: '2027' | '2028';
  streakDays: number;
  lastActivityDate?: string;
  isVerifiedTeacher?: boolean;
  photoUrl?: string;
  token?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  role: UserRole;
  track: 'science' | 'business' | 'humanities';
  examLevel: 'SSC' | 'HSC' | 'Admission';
  examYear: '2027' | '2028';
  activeSubject: string;
  streakDays: number;
  lastActivityDate?: string;
  photoUrl?: string;
}

export interface TeacherBatch {
  id: string;
  code: string;
  name: string;
  classLevel: string;
  subject: string;
  academicYear: string;
  teacherId: string;
  teacherName: string;
  enrolledStudents: Array<{ id: string; name: string; enrolledAt: string }>;
  exams: string[];
  createdAt: string;
}

export interface UserMistakeEntry {
  id: string;
  userId: string;
  questionId: string;
  question: Question;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  attemptCount: number;
  intervalStep: number;
  nextReviewAt: string;
  lastAttemptAt: string;
}

export interface ExamMetadata {
  id: string;
  title: string;
  batchId?: string;
  subject: string;
  chapter: string;
  topics: string[];
  timeLimitMinutes: number;
  totalQuestions: number;
  questions: Array<{
    id: string;
    subject: string;
    chapter: string;
    topic: string;
    questionText: string;
    options: [string, string, string, string];
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}

export interface ChallengeData {
  code: string;
  creatorName: string;
  creatorScore?: number;
  challengerName?: string;
  challengerScore?: number;
  chapter: string;
  status: 'waiting' | 'completed';
  totalQuestions: number;
  questions: Array<{
    id: string;
    questionText: string;
    options: [string, string, string, string];
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}
