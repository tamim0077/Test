import express, { type Request } from 'express';
import { randomUUID, randomBytes } from 'node:crypto';
import { LocalDatabase, type Database, type Store } from './store.ts';
import { ApiError, requireValue, integer, validateQuestion, shuffle, makeAttempt, publicAttempt, type Attempt } from './exams.ts';
import { INITIAL_QUESTION_BANK } from '../src/data/questionBank.ts';
import { getEligibleQuestions } from '../src/utils/questionSelector.ts';
import { gradeExamSubmission, type Question } from '../src/utils/examScoring.ts';
import { computeNextReview } from '../src/utils/spacedRepetition.ts';
import { getDhakaDateString, getYesterdayDhakaDateString } from '../src/utils/streakCalculator.ts';
import { selectAdaptiveQuestions } from '../src/utils/adaptiveEngine.ts';

export const ALL_SSC_BOARDS = ['ঢাকা', 'রাজশাহী', 'চট্টগ্রাম', 'কুমিল্লা', 'যশোর', 'বরিশাল', 'সিলেট', 'দিনাজপুর', 'ময়মনসিংহ'] as const;
export const ALL_SSC_YEARS = [2025, 2024, 2023, 2022, 2021, 2020] as const;
export const ALL_SSC_SUBJECTS = ['সাধারণ গণিত', 'পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান'] as const;
export type Identity = { uid: string; email?: string; name?: string; picture?: string; admin?: boolean };
type Context = { req: Request; store: Store; identity: Identity | null; user: any; owner: string; bank: Question[] };
const text = (value: any, max = 150) => { requireValue(typeof value === 'string' && value.trim() && value.length <= max, 'Required text is missing or too long'); return value.trim(); };
const requireUser = (c: Context) => requireValue(c.user, 'Sign in to continue', 401);
const requireAdmin = (c: Context) => { requireUser(c); requireValue(c.user.role === 'admin', 'Admin access required', 403); };
const requireTeacher = (c: Context) => { requireUser(c); requireValue(c.user.role === 'admin' || c.user.role === 'teacher' && c.user.isVerifiedTeacher, 'Approved teacher access required', 403); };
const canManage = (c: Context, batch: any) => c.user?.role === 'admin' || batch.teacherId === c.user?.id;
const prefix = (c: Context) => c.user ? `users/${c.user.id}` : `demoUsers/${c.owner.slice(6)}`;
const fingerprint = (q: Question) => q.questionText.normalize('NFKC').replace(/\s+/g, ' ').trim();

export function createApi(database: Database, verify: (token: string) => Promise<Identity>, testGuestDatabase?: Database) {
  const guests = new Map<string, { expires: number; db: Database }>();
  const guestStore = (session: string): Database => {
    if (testGuestDatabase) return testGuestDatabase;
    for (const [key, value] of guests) if (value.expires < Date.now()) guests.delete(key);
    if (!guests.has(session)) {
      if (guests.size >= 500) guests.delete(guests.keys().next().value!);
      guests.set(session, { expires: Date.now() + 86400000, db: new LocalDatabase() });
    }
    return guests.get(session)!.db;
  };
  const app = express.Router();
  app.use(express.json({ limit: '2mb' }));
  app.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  // Authentication runs before any route, and every authorization check runs inside the transaction.
  app.use(async (req, res, next) => {
    const header = req.headers.authorization;
    if (header) {
      try {
        requireValue(header.startsWith('Bearer ') && header.length < 10000, 'Invalid authentication', 401);
        res.locals.identity = await verify(header.slice(7));
      } catch { res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' }); return; }
    }
    next();
  });
  const route = (method: 'get' | 'post', paths: string | string[], handler: (c: Context) => Promise<any>) => {
    app[method](paths, async (req, res, next) => {
      try {
        const identity: Identity | null = res.locals.identity || null;
        const guest = req.header('X-Demo-Session');
        const owner = identity?.uid || (guest && /^[a-f0-9-]{36}$/i.test(guest) ? `guest:${guest}` : '');
        // Public demo attempts/results never write to the production database.
        const target = identity ? database : guestStore(owner || 'anonymous');
        const publicOverrides = identity ? null : await database.transaction(s => s.list<Question & { deleted?: boolean }>('questions'));
        const data = await target.transaction(async store => {
          let user = identity ? await store.get(`users/${identity.uid}`) : null;
          if (identity) {
            const admin = identity.admin === true || !!await store.get(`admins/${identity.uid}`);
            // Never trust a user-writable role=admin field.
            if (user) user = { ...user, id: identity.uid, role: admin ? 'admin' : user.role === 'teacher' ? 'teacher' : 'student' };
            else user = { id: identity.uid, name: identity.name || 'শিক্ষার্থী', email: identity.email || '', photoUrl: identity.picture || null, role: admin ? 'admin' : 'student', streakDays: 0, isVerifiedTeacher: false };
          }
          const overrides = publicOverrides || await store.list<Question & { deleted?: boolean }>('questions');
          const bank = new Map(INITIAL_QUESTION_BANK.map(q => [q.id, q]));
          for (const q of overrides) { if (q.deleted) bank.delete(q.id); else bank.set(q.id, q); }
          return handler({ req, store, identity, user, owner, bank: [...bank.values()] });
        });
        res.json(data);
      } catch (error) { next(error); }
    });
  };
  const start = (c: Context, questions: Question[], title: string, duration: number, extra: Partial<Attempt> = {}) => {
    requireValue(c.owner, 'A demo session or login is required', 401);
    requireValue(questions.length > 0, 'No matching questions');
    requireValue(Buffer.byteLength(JSON.stringify(questions)) < 300000, 'Question set is too large; reduce the question count');
    const attempt = { ...makeAttempt(c.owner, title, questions, duration), ...extra };
    c.store.set(`attempts/${attempt.id}`, attempt);
    return publicAttempt(attempt);
  };
  const filter = (body: any) => ({ subject: body.subject === 'সকল বিষয়' ? 'all' : body.subject || 'all', topic: body.topic, chapters: body.chapters || (body.chapter ? [body.chapter] : []), questionSource: body.questionSource || 'all', difficulty: body.difficulty === 'balanced' ? 'all' : body.difficulty || 'all', board: body.board, year: body.year });
  const eligible = (c: Context) => getEligibleQuestions(filter(c.req.body || {}), c.bank);
  route('get', '/health', async () => ({ status: 'ok', storage: 'transactional', paidGenerationEnabled: false }));
  route('get', '/auth/me', async c => ({ user: c.user }));
  route('post', ['/auth/login', '/auth/register', '/auth/admin-login'], async () => { throw new ApiError(410, 'Use Firebase Authentication. Legacy password sessions have been removed.'); });
  route('post', '/auth/logout', async () => ({ success: true }));
  route('post', '/profile', async c => {
    requireUser(c);
    const b = c.req.body;
    const existing = await c.store.get(`users/${c.user.id}`);
    const changes: any = {};
    for (const field of ['name', 'institution', 'subject', 'track', 'examLevel', 'examYear']) {
      if (b[field] !== undefined) changes[field] = text(b[field]);
    }
    if (b.photoUrl !== undefined) { requireValue(b.photoUrl === null || typeof b.photoUrl === 'string' && b.photoUrl.length < 200000, 'Invalid photo'); changes.photoUrl = b.photoUrl; }
    const user = { ...c.user, ...changes, role: existing ? c.user.role : c.user.role === 'admin' ? 'admin' : b.role === 'teacher' ? 'teacher' : 'student', createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    // Both registration and normal profile saves are atomic and cannot overwrite progress/approval.
    c.store.set(`users/${user.id}`, user);
    return { user };
  });
  route('get', '/exams/history', async c => {
    requireUser(c);
    return (await c.store.list(`${prefix(c)}/examResults`)).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  });
  route('get', '/mistakes', async c => c.owner ? c.store.list(`${prefix(c)}/mistakes`) : []);
  route('post', '/mistakes/retry', async c => {
    requireValue(c.owner, 'Sign in or start a demo', 401);
    const id = text(c.req.body.questionId);
    requireValue(!id.includes('/'), 'Invalid question ID');
    const key = `${prefix(c)}/mistakes/mstk-${id}`;
    const m = await c.store.get(key);
    requireValue(m, 'Mistake not found', 404);
    const selected = integer(c.req.body.selectedOptionIndex, 0, 3);
    const isCorrect = selected === m.correctOptionIndex;
    const next = computeNextReview(m.intervalStep, isCorrect);
    const entry = { ...m, selectedOptionIndex: selected, attemptCount: m.attemptCount + 1, intervalStep: next.nextStep, nextReviewAt: next.nextReviewDate.toISOString(), lastAttemptAt: new Date().toISOString() };
    c.store.set(key, entry);
    return { isCorrect, correctOptionIndex: entry.correctOptionIndex, explanation: entry.question.explanation, nextReviewAt: entry.nextReviewAt, intervalStep: entry.intervalStep };
  });
  route('get', '/exams/demo', async c => ({ ...start(c, shuffle(getEligibleQuestions({}, c.bank)).slice(0, 5), 'ডেমো পরীক্ষা — ফলাফল সাময়িক', 5, { isDemo: true }), isDemo: true }));
  route('post', '/exams/check-availability', async c => {
    const count = integer(c.req.body.count, 1, 100, 20), availableCount = eligible(c).length;
    return { availableCount, requestedCount: count, sufficient: availableCount >= count, isSufficient: availableCount >= count };
  });
  route('post', ['/exams/custom', '/exams/diagnostic', '/adaptive/generate'], async c => {
    const b = c.req.body || {};
    const count = integer(b.count, 1, 100, 20), duration = integer(b.duration, 1, 180, 20);
    if (c.req.path === '/exams/diagnostic') b.subject = ({ math: ALL_SSC_SUBJECTS[0], physics: ALL_SSC_SUBJECTS[1], chemistry: ALL_SSC_SUBJECTS[2], biology: ALL_SSC_SUBJECTS[3] } as any)[b.subject] || b.subject;
    let pool = eligible(c);
    if (pool.length < count && !b.allowPartial) return { error: 'insufficient_questions', availableCount: pool.length, requestedCount: count, message: `নির্বাচিত ফিল্টারে ${pool.length}টি প্রশ্ন পাওয়া যাচ্ছে।` };
    if (c.req.path === '/adaptive/generate') {
      requireValue(c.owner, 'Sign in or start a demo', 401);
      const mistakes = await c.store.list(`${prefix(c)}/mistakes`);
      pool = selectAdaptiveQuestions(pool, mistakes.map(m => ({ topic: m.question.topic })), count);
    } else {
      const recent = new Set(Array.isArray(b.recentQuestionIds) ? b.recentQuestionIds : []);
      const fresh = pool.filter(q => !recent.has(q.id));
      pool = shuffle(fresh.length >= count ? fresh : pool).slice(0, count);
    }
    return start(c, pool, `${b.subject || 'সকল বিষয়'} — MCQ পরীক্ষা`, duration);
  });
  route('get', '/attempts/:id', async c => {
    const a = await c.store.get<Attempt>(`attempts/${c.req.params.id}`);
    requireValue(a && c.owner && a.owner === c.owner, 'Attempt not found', 404);
    return { ...publicAttempt(a!), result: a!.result };
  });
  route('post', '/exams/submit', async c => {
    const id = text(c.req.body.examId); requireValue(!id.includes('/'), 'Invalid exam ID');
    const a = await c.store.get<Attempt>(`attempts/${id}`);
    requireValue(a && c.owner && a.owner === c.owner, 'Attempt not found', 404);
    if (a!.result) return a!.result; // Atomic idempotency: a retry never increments statistics again.
    const answers = c.req.body.answers;
    requireValue(answers && typeof answers === 'object' && !Array.isArray(answers), 'Invalid answers');
    const questionIds = new Set(a!.questions.map(q => q.id));
    for (const [key, value] of Object.entries(answers)) { requireValue(questionIds.has(key), 'Unknown question in attempt'); requireValue(typeof value === 'number', 'Answer index must be a number'); integer(value, 0, 3); }
    // A short transport grace allows expiry auto-submit; after that only saved server answers are valid.
    requireValue(Date.now() <= a!.deadline + 120000, 'Exam deadline passed. Submission was not accepted.', 409);
    const elapsed = Math.max(0, Math.floor((Date.now() - a!.startedAt) / 1000));
    const result: any = { ...gradeExamSubmission(a!.questions, answers, elapsed, a!.timeLimitMinutes * 60), examId: a!.id, title: a!.title, userId: c.user?.id || c.owner, teacherId: a!.teacherId || null, publishedExamId: a!.publishedExamId || null };
    c.store.set(`attempts/${id}`, { ...a, result });
    if (a!.isDemo && c.user) return result;
    c.store.set(`${prefix(c)}/examResults/${id}`, { ...result, id });
    for (const m of result.mistakes) {
      const key = `${prefix(c)}/mistakes/mstk-${m.questionId}`;
      const old = await c.store.get(key);
      const next = computeNextReview(old?.intervalStep || 0, false);
      c.store.set(key, { id: `mstk-${m.questionId}`, userId: result.userId, questionId: m.questionId,
        question: a!.questions.find(q => q.id === m.questionId), selectedOptionIndex: m.selectedOptionIndex,
        correctOptionIndex: m.correctOptionIndex, attemptCount: (old?.attemptCount || 0) + 1,
        intervalStep: next.nextStep, nextReviewAt: next.nextReviewDate.toISOString(), lastAttemptAt: result.submittedAt });
    }
    if (c.user) {
      const today = getDhakaDateString(), yesterday = getYesterdayDhakaDateString();
      const streakDays = c.user.lastActivityDate === today ? Math.max(1, c.user.streakDays || 0) : c.user.lastActivityDate === yesterday ? (c.user.streakDays || 0) + 1 : 1;
      c.store.set(`users/${c.user.id}`, { ...c.user, streakDays, lastActivityDate: today });
    }
    if (a!.challengeCode) {
      const challenge = await c.store.get(`challenges/${a!.challengeCode}`);
      if (challenge) c.store.set(`challenges/${a!.challengeCode}`, { ...challenge, [challenge.creatorId === c.user?.id ? 'creatorScore' : 'challengerScore']: result.score });
    }
    return result;
  });
  route('get', '/batches', async c => {
    if (!c.user) return [];
    const list = await c.store.list('batches');
    return list.filter(b => canManage(c, b) || b.enrolledStudents.some((s: any) => s.id === c.user.id)).map(b => canManage(c, b) ? b : { ...b, enrolledStudents: b.enrolledStudents.filter((s: any) => s.id === c.user.id) });
  });
  route('post', '/batches', async c => {
    requireTeacher(c);
    const code = randomBytes(4).toString('hex').toUpperCase();
    requireValue(!await c.store.get(`batchCodes/${code}`), 'Please retry code allocation', 409);
    const batch = { id: randomUUID(), code, name: text(c.req.body.name), subject: text(c.req.body.subject), classLevel: 'SSC', academicYear: String(c.req.body.academicYear || '2027'), teacherId: c.user.id, teacherName: c.user.name, enrolledStudents: [], exams: [], createdAt: new Date().toISOString() };
    c.store.set(`batches/${batch.id}`, batch); c.store.set(`batchCodes/${code}`, { id: batch.id });
    return batch;
  });
  route('post', '/batches/join', async c => {
    requireUser(c);
    const code = text(c.req.body.code, 20).toUpperCase(); requireValue(/^[A-Z0-9]+$/.test(code), 'Invalid batch code');
    const pointer = await c.store.get(`batchCodes/${code}`);
    const batch = pointer ? await c.store.get(`batches/${pointer.id}`) : null;
    requireValue(batch, 'Batch code not found', 404);
    if (!batch.enrolledStudents.some((s: any) => s.id === c.user.id)) batch.enrolledStudents.push({ id: c.user.id, name: c.user.name, enrolledAt: new Date().toISOString() });
    c.store.set(`batches/${batch.id}`, batch);
    return { success: true };
  });
  route('post', '/teacher/generate-exam', async c => {
    requireTeacher(c);
    const count = integer(c.req.body.count, 1, 100, 10), pool = eligible(c);
    requireValue(pool.length >= count, `Only ${pool.length} matching questions available`);
    return { blueprint: { subject: c.req.body.subject, chapter: c.req.body.chapter, totalQuestions: count, patternType: c.req.body.patternType, source: 'Verified question bank' }, draftQuestions: shuffle(pool).slice(0, count) };
  });
  route('post', '/teacher/publish-exam', async c => {
    requireTeacher(c);
    const b = c.req.body, questions = b.questions;
    requireValue(Array.isArray(questions) && questions.length >= 1 && questions.length <= 100, 'Provide 1–100 questions');
    questions.forEach(validateQuestion);
    requireValue(new Set(questions.map(fingerprint)).size === questions.length, 'Duplicate questions');
    let batch: any = null;
    if (b.batchId) { batch = await c.store.get(`batches/${text(b.batchId)}`); requireValue(batch && canManage(c, batch), 'Batch access denied', 403); }
    const exam = { id: randomUUID(), title: text(b.title || 'MCQ পরীক্ষা'), teacherId: c.user.id, batchId: batch?.id || null,
      subject: text(b.subject), chapter: b.chapter || '', topics: b.topics || [], questions: questions.map((q: Question) => ({ ...q, id: randomUUID(), verificationStatus: 'verified' })), timeLimitMinutes: integer(b.timeLimitMinutes, 1, 180, 20), patternType: b.patternType || 'teacher_custom', status: 'published', createdAt: new Date().toISOString() };
    c.store.set(`publishedExams/${exam.id}`, exam);
    if (batch) c.store.set(`batches/${batch.id}`, { ...batch, exams: [...batch.exams, exam.id] });
    return { ...exam, shareUrl: `/?exam=${exam.id}` };
  });
  route('get', '/exams/:id', async c => {
    requireUser(c);
    const exam = await c.store.get(`publishedExams/${c.req.params.id}`);
    requireValue(exam && exam.status === 'published', 'Published exam not found', 404);
    if (exam.batchId) { const batch = await c.store.get(`batches/${exam.batchId}`); requireValue(batch && (canManage(c, batch) || batch.enrolledStudents.some((s: any) => s.id === c.user.id)), 'Batch enrollment required', 403); }
    const previous = (await c.store.list<Attempt>('attempts')).find(a => a.owner === c.owner && a.publishedExamId === exam.id);
    if (previous) return { ...publicAttempt(previous), result: previous.result };
    return start(c, exam.questions, exam.title, exam.timeLimitMinutes, { publishedExamId: exam.id, teacherId: exam.teacherId });
  });
  route('get', '/teacher/analytics', async c => {
    requireTeacher(c);
    const batches = (await c.store.list('batches')).filter(b => canManage(c, b));
    const exams = (await c.store.list('publishedExams')).filter(e => e.teacherId === c.user.id || c.user.role === 'admin');
    const subs = (await c.store.list<Attempt>('attempts')).filter(a => a.result && (a.teacherId === c.user.id || c.user.role === 'admin' && a.teacherId)).map(a => a.result!);
    const topics: Record<string, any> = {}, missed: Record<string, any> = {};
    for (const s of subs) {
      for (const t of s.topicPerformance) { const old = topics[t.topic] || { topic: t.topic, total: 0, correct: 0 }; topics[t.topic] = { ...old, total: old.total + t.total, correct: old.correct + t.correct }; }
      for (const m of s.mistakes) { const old = missed[m.questionId]; missed[m.questionId] = { id: m.questionId, text: m.questionText, chapter: m.chapter, missedCount: (old?.missedCount || 0) + 1 }; }
    }
    return { totalBatches: batches.length, totalStudents: new Set(batches.flatMap(b => b.enrolledStudents.map((s: any) => s.id))).size, activeExamsCount: exams.length, completedSubmissions: subs.length,
      avgScore: subs.length ? subs.reduce((n, s) => n + s.score, 0) / subs.length : 0, highestScore: Math.max(0, ...subs.map(s => s.score)), lowestScore: subs.length ? Math.min(...subs.map(s => s.score)) : 0,
      topicAccuracy: Object.values(topics).map(t => ({ ...t, percentage: Math.round(t.correct / t.total * 100) })), mostMissedQuestions: Object.values(missed).sort((a, b) => b.missedCount - a.missedCount).slice(0, 5), recentSubmissions: subs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 10) };
  });
  route('get', '/admin/users', async c => { requireAdmin(c); return c.store.list('users'); });
  route('get', '/admin/questions', async c => { requireAdmin(c); return c.bank; });
  route('get', '/admin/overview', async c => {
    requireAdmin(c); const users = await c.store.list('users');
    return { totalStudents: users.filter(u => u.role === 'student').length, totalTeachers: users.filter(u => u.role === 'teacher').length, pendingTeachers: users.filter(u => u.role === 'teacher' && !u.isVerifiedTeacher).length, totalQuestions: c.bank.length, verifiedQuestions: c.bank.filter(q => q.verificationStatus === 'verified').length, pendingQuestions: c.bank.filter(q => q.verificationStatus !== 'verified').length, totalBatches: (await c.store.list('batches')).length, totalHistoricalPapers: (await c.store.list('papers')).length, aiModel: 'Not used for MCQ selection', systemStatus: 'healthy' };
  });
  route('get', '/admin/system-stats', async c => { requireAdmin(c); return { serverUptimeSeconds: Math.floor(process.uptime()), memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1048576), activeSessions: null, aiQuota: { dailyRequestsUsed: 0, dailyQuotaLimit: 0, quotaPercent: 0 }, note: 'Paid AI generation is disabled; active-session telemetry is unavailable.' }; });
  route('post', '/admin/verify-teacher', async c => {
    requireAdmin(c); const id = text(c.req.body.teacherId); requireValue(!id.includes('/'), 'Invalid ID');
    const user = await c.store.get(`users/${id}`); requireValue(user?.role === 'teacher', 'Teacher not found', 404);
    requireValue(['approved', 'rejected'].includes(c.req.body.status), 'Invalid status');
    c.store.set(`users/${id}`, { ...user, isVerifiedTeacher: c.req.body.status === 'approved' }); return { success: true };
  });
  route('post', '/admin/questions/moderate', async c => {
    requireAdmin(c); const q = c.bank.find(q => q.id === c.req.body.questionId); requireValue(q, 'Question not found', 404);
    const action = c.req.body.action; requireValue(['approve', 'reject', 'edit'].includes(action), 'Invalid action');
    const next = action === 'reject' ? { ...q, deleted: true } : action === 'approve' ? { ...q, verificationStatus: 'verified' } : { ...q, ...c.req.body.updatedData, id: q!.id, verificationStatus: 'needs_review' };
    validateQuestion(next); c.store.set(`questions/${q!.id}`, next); return { success: true };
  });
  route('post', ['/admin/import-questions', '/admin/pipeline/ingest', '/historical/import'], async c => {
    requireAdmin(c); const b = c.req.body; const list = b.jsonQuestions || b.questions;
    requireValue(Array.isArray(list) && list.length > 0 && list.length <= 100, 'Provide a JSON array of 1–100 complete questions. Text without an explicit answer key is not accepted.');
    const seen = new Set(c.bank.map(fingerprint)); let importedCount = 0;
    for (const item of list) {
      const q = { ...item, id: randomUUID(), subject: b.subject || item.subject, chapter: item.chapter || b.defaultChapter || b.chapter, topic: item.topic || b.defaultTopic,
        board: b.board || item.board || null, year: b.year ? integer(b.year, 1990, 2100) : item.year || null, source: item.source || 'Imported — awaiting verification', verificationStatus: 'needs_review' as const };
      validateQuestion(q); if (seen.has(fingerprint(q))) continue;
      seen.add(fingerprint(q)); c.store.set(`questions/${q.id}`, q); importedCount++;
    }
    return { success: true, parsedTotal: list.length, importedCount, duplicateCount: list.length - importedCount, totalBankSize: c.bank.length + importedCount };
  });
  route('get', '/admin/board-coverage', async c => {
    requireAdmin(c); const overrides = await c.store.list('boardCoverage');
    const matrix = ALL_SSC_BOARDS.flatMap(board => ALL_SSC_YEARS.flatMap(year => ALL_SSC_SUBJECTS.map(subject => {
      const id = `${board}_${year}_${subject}`; const q = c.bank.filter(q => q.board === board && q.year === year && q.subject === subject && q.verificationStatus === 'verified');
      return { id, board, year, subject, status: q.length ? 'verified' : 'awaiting_source', verifiedCount: q.length, ...(overrides.find(o => o.id === id) || {}) };
    })));
    const statusCounts: Record<string, number> = {}; for (const slot of matrix) statusCounts[slot.status] = (statusCounts[slot.status] || 0) + 1;
    const chapterDistribution: Record<string, number> = {}; for (const q of c.bank) chapterDistribution[`${q.subject}: ${q.chapter}`] = (chapterDistribution[`${q.subject}: ${q.chapter}`] || 0) + 1;
    return { matrix, statusCounts, totalSlots: matrix.length, totalVerifiedQuestions: matrix.reduce((n, m) => n + m.verifiedCount, 0), totalBankSize: c.bank.length, boards: ALL_SSC_BOARDS, years: ALL_SSC_YEARS, subjects: ALL_SSC_SUBJECTS, chapterDistribution };
  });
  route('post', '/admin/board-coverage/status', async c => {
    requireAdmin(c); const { board, year, subject, status } = c.req.body;
    requireValue(ALL_SSC_BOARDS.includes(board) && ALL_SSC_YEARS.includes(Number(year) as any) && ALL_SSC_SUBJECTS.includes(subject), 'Invalid board/year/subject');
    requireValue(['awaiting_source', 'pending_verification', 'permission_required', 'not_found', 'no_exam_held', 'not_held', 'not_applicable'].includes(status), 'Verified coverage is derived from reviewed questions');
    const id = `${board}_${year}_${subject}`; c.store.set(`boardCoverage/${id}`, { id, board, year: Number(year), subject, status, note: String(c.req.body.note || '').slice(0, 1000) }); return { success: true };
  });
  route('get', '/historical-analysis', async c => {
    const groups = new Map<string, any>();
    for (const q of c.bank) {
      if (!q.board || !q.year || q.verificationStatus !== 'verified') continue;
      const id = `${q.board}_${q.year}_${q.subject}_${q.chapter}`;
      const group = groups.get(id) || { id, board: q.board, year: q.year, subject: q.subject, chapter: q.chapter, topic: q.topic, verifiedCount: 0, status: 'verified' };
      group.verifiedCount++; groups.set(id, group);
    }
    const papers = [...groups.values()];
    return { papers, totalPapers: papers.length, hasVerifiedData: papers.length > 0,
      disclaimer: 'শুধু নথিভুক্ত বোর্ড ও বছরযুক্ত অনুমোদিত প্রশ্ন দেখানো হচ্ছে। সম্পূর্ণ প্রশ্নপত্রের নিশ্চয়তা নয়।',
      statusMessage: papers.length ? `${papers.length}টি বিষয়/অধ্যায় গ্রুপে যাচাইকৃত প্রশ্ন আছে।` : 'পর্যাপ্ত যাচাইকৃত বোর্ড প্রশ্নের তথ্য নেই।',
      trendTopics: [], suggestions: [], topicFrequency: [] };
  });
  route('post', ['/challenges', '/challenges/create'], async c => {
    requireUser(c); const count = integer(c.req.body.count, 1, 100, 5); const pool = eligible(c);
    requireValue(pool.length >= count, `Only ${pool.length} questions available`);
    const code = randomBytes(6).toString('hex').toUpperCase();
    const challenge = { code, creatorId: c.user.id, creatorName: c.user.name, subject: c.req.body.subject || 'all', chapter: c.req.body.chapter || '', questions: shuffle(pool).slice(0, count), status: 'waiting', createdAt: new Date().toISOString() };
    c.store.set(`challenges/${code}`, challenge);
    return { ...challenge, totalQuestions: count, questions: [] };
  });
  route('get', '/challenges/:code', async c => {
    requireUser(c); const code = text(c.req.params.code, 20).toUpperCase(); requireValue(/^[A-Z0-9]+$/.test(code), 'Invalid challenge code');
    const ch = await c.store.get(`challenges/${code}`); requireValue(ch, 'Challenge not found', 404);
    requireValue(!ch.challengerId || ch.challengerId === c.user.id || ch.creatorId === c.user.id, 'Challenge already joined', 403);
    if (ch.creatorId !== c.user.id && !ch.challengerId) { ch.challengerId = c.user.id; ch.challengerName = c.user.name; c.store.set(`challenges/${code}`, ch); }
    const previous = (await c.store.list<Attempt>('attempts')).find(a => a.owner === c.owner && a.challengeCode === code);
    const attempt = previous ? { ...publicAttempt(previous), result: previous.result } : start(c, ch.questions, `${ch.chapter} — Challenge`, 10, { challengeCode: code });
    return { ...ch, ...attempt, code, chapter: ch.chapter };
  });
  route('post', '/user/photo', async c => {
    requireUser(c); const photoUrl = c.req.body.photoUrl;
    requireValue(photoUrl === null || typeof photoUrl === 'string' && photoUrl.length < 200000, 'Photo too large');
    const user = { ...c.user, photoUrl }; c.store.set(`users/${c.user.id}`, user); return { success: true, photoUrl, user };
  });
  route('get', '/user/photo', async c => ({ photoUrl: c.user?.photoUrl || null }));
  route('get', '/founder/photo', async c => ({ photoUrl: (await c.store.get('settings/founder'))?.photoUrl || '/assets/founder-mustafizur-rahman.jpeg' }));
  route('post', '/founder/photo', async c => { requireAdmin(c); const photoUrl = text(c.req.body.photoUrl, 200000); c.store.set('settings/founder', { photoUrl }); return { success: true, photoUrl }; });
  app.use((error: any, _req: any, res: any, _next: any) => {
    if (!(error instanceof ApiError)) console.error('API failure:', error.message);
    res.status(error instanceof ApiError ? error.status : 503).json({ error: error instanceof ApiError ? error.message : 'Unable to save or load data. Please retry.' });
  });
  return app;
}

