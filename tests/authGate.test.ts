import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { createApi } from '../server/api.ts';
import { LocalDatabase } from '../server/store.ts';
import { INITIAL_QUESTION_BANK } from '../src/data/questionBank.ts';

const identities: Record<string, any> = {
  student: { uid: 'student-101', name: 'Test Student' },
  unverifiedTeacher: { uid: 'teacher-201', name: 'Pending Teacher' },
  verifiedTeacher: { uid: 'teacher-301', name: 'Approved Teacher' },
  admin: { uid: 'admin-999', name: 'System Admin', admin: true },
};

async function harness(t: any) {
  const db = new LocalDatabase();
  const demoDb = new LocalDatabase();
  const app = express();
  app.use(
    '/api',
    createApi(
      db,
      async (token) => {
        if (!identities[token]) throw new Error('Invalid token');
        return identities[token];
      },
      demoDb
    )
  );

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((r) => server.once('listening', r));
  t.after(
    () =>
      new Promise<void>((r) => {
        server.closeAllConnections();
        server.close(() => r());
      })
  );

  const port = (server.address() as any).port;
  const guest = randomUUID();
  const request = async (route: string, body?: any, identity?: string, session = guest) => {
    const r = await fetch(`http://127.0.0.1:${port}/api${route}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(identity ? { Authorization: `Bearer ${identity}` } : { 'X-Demo-Session': session }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: r.status, body: await r.json() };
  };

  return { db, request };
}

test('Auth Gate: Unauthenticated visitors cannot access protected teacher or admin APIs', async (t) => {
  const { request } = await harness(t);

  // Protected teacher/admin POST endpoints return 401 for guests
  for (const route of [
    '/batches',
    '/teacher/publish-exam',
    '/teacher/generate-exam',
    '/admin/board-coverage/status',
  ]) {
    assert.equal((await request(route, {})).status, 401, `Expected 401 for ${route}`);
  }
  // Protected admin GET endpoint returns 401 for guests
  assert.equal((await request('/admin/users')).status, 401);
});

test('Auth Gate: Existing user cannot elevate role or self-verify via /api/profile', async (t) => {
  const { request } = await harness(t);

  // 1. Initial profile creation as student
  const p1 = await request('/profile', { role: 'student', name: 'Original Student' }, 'student');
  assert.equal(p1.status, 200);
  assert.equal(p1.body.user.role, 'student');
  assert.equal(p1.body.user.isVerifiedTeacher, false);

  // 2. Student tries to elevate to teacher or admin
  const p2 = await request(
    '/profile',
    { role: 'teacher', isVerifiedTeacher: true, isAdmin: true },
    'student'
  );
  assert.equal(p2.status, 200);
  // Role must remain strictly 'student'
  assert.equal(p2.body.user.role, 'student');
  assert.equal(p2.body.user.isVerifiedTeacher, false);
});

test('Auth Gate: Unverified teacher is prevented from creating batches or publishing exams', async (t) => {
  const { request } = await harness(t);

  // Sign up as teacher
  const prof = await request(
    '/profile',
    { role: 'teacher', name: 'Pending Teacher', institution: 'Test College' },
    'unverifiedTeacher'
  );
  assert.equal(prof.status, 200);
  assert.equal(prof.body.user.role, 'teacher');
  assert.equal(prof.body.user.isVerifiedTeacher, false); // Pending approval by default

  // Unverified teacher attempts to create a batch -> Rejected with 403
  const batchRes = await request(
    '/batches',
    { name: 'Physics 2025', subject: 'পদার্থবিজ্ঞান' },
    'unverifiedTeacher'
  );
  assert.equal(batchRes.status, 403);

  // Unverified teacher attempts to publish exam -> Rejected with 403
  const pubRes = await request(
    '/teacher/publish-exam',
    {
      title: 'Midterm',
      subject: 'পদার্থবিজ্ঞান',
      questions: [INITIAL_QUESTION_BANK[0]],
    },
    'unverifiedTeacher'
  );
  assert.equal(pubRes.status, 403);
});

test('Auth Gate: Assignment access enforces batch enrollment', async (t) => {
  const { request, db } = await harness(t);

  // Setup verified teacher
  await request('/profile', { role: 'teacher', name: 'Approved' }, 'verifiedTeacher');
  // Elevate teacher in store
  await db.transaction(async (s) => {
    const teacher = await s.get('users/teacher-301');
    await s.set('users/teacher-301', { ...teacher, isVerifiedTeacher: true });
  });

  // Create batch as verified teacher
  const bRes = await request(
    '/batches',
    { name: 'Math Special', subject: 'সাধারণ গণিত' },
    'verifiedTeacher'
  );
  assert.equal(bRes.status, 200);
  const batchId = bRes.body.id;
  const batchCode = bRes.body.code;

  // Publish exam linked to this batch
  const exRes = await request(
    '/teacher/publish-exam',
    {
      title: 'Batch Exam 1',
      subject: 'সাধারণ গণিত',
      batchId,
      timeLimitMinutes: 15,
      questions: [INITIAL_QUESTION_BANK[0]],
    },
    'verifiedTeacher'
  );
  assert.equal(exRes.status, 200);
  const examId = exRes.body.id;

  // Student tries to access without being enrolled -> 403 Batch enrollment required
  const unauthorizedExam = await request(`/exams/${examId}`, undefined, 'student');
  assert.equal(unauthorizedExam.status, 403);
  assert.equal(unauthorizedExam.body.error, 'Batch enrollment required');

  // Student joins the batch
  const joinRes = await request('/batches/join', { code: batchCode }, 'student');
  assert.equal(joinRes.status, 200);

  // Now student accesses the assignment -> 200 OK
  const authorizedExam = await request(`/exams/${examId}`, undefined, 'student');
  assert.equal(authorizedExam.status, 200);
  assert.ok(authorizedExam.body.examId);
  assert.equal(authorizedExam.body.questions.length, 1);
});
