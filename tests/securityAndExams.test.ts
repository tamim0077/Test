import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApi } from '../server/api.ts';
import { LocalDatabase } from '../server/store.ts';
import { permuteQuestion } from '../server/exams.ts';
import { INITIAL_QUESTION_BANK } from '../src/data/questionBank.ts';
import { getEligibleQuestions } from '../src/utils/questionSelector.ts';
const identities: Record<string, any> = { student:{uid:'student-a',name:'Student A'}, other:{uid:'student-b',name:'Student B'}, teacher:{uid:'teacher-a',name:'Teacher A'}, admin:{uid:'admin-a',name:'Admin',admin:true} };
async function harness(t: any, db = new LocalDatabase()) {
  const demoDb = new LocalDatabase();
  const app=express(); app.use('/api',createApi(db,async token=>{if(!identities[token])throw new Error('Invalid');return identities[token];},demoDb));
  const server=app.listen(0,'127.0.0.1'); await new Promise<void>(r=>server.once('listening',r));
  t.after(()=>new Promise<void>(r=>{server.closeAllConnections();server.close(()=>r());}));
  const port=(server.address() as any).port,guest=randomUUID();
  const request=async(route:string,body?:any,identity?:string,session=guest)=>{
    const r=await fetch(`http://127.0.0.1:${port}/api${route}`,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(identity?{Authorization:`Bearer ${identity}`}:{'X-Demo-Session':session})},body:body===undefined?undefined:JSON.stringify(body)});
    return {status:r.status,body:await r.json()};
  }; return {db,demoDb,request};
}
test('option permutation remaps answer without changing source',()=>{
  const original=INITIAL_QUESTION_BANK[0],q=permuteQuestion(original,()=>0);
  assert.notEqual(q.correctAnswerIndex,0);assert.equal(q.options[q.correctAnswerIndex],original.options[0]);assert.equal(original.correctAnswerIndex,0);
});
test('admin/teacher writes reject guests and students; forged and legacy credentials fail',async t=>{
  const {request}=await harness(t);
  for(const route of ['/admin/import-questions','/admin/pipeline/ingest','/admin/board-coverage/status','/batches','/teacher/publish-exam','/teacher/generate-exam']){
    assert.equal((await request(route,{})).status,401,route);assert.equal((await request(route,{},'student')).status,403,route);
  }
  assert.equal((await request('/auth/me',undefined,'forged')).status,401);
  assert.equal((await request('/auth/admin-login',{email:'anything',password:'anything'})).status,410);
});
test('actual API six-count matrix, hidden answers, scoring, ownership and concurrent idempotency',async t=>{
  const {request,db}=await harness(t);
  for(const count of [10,20,30,35,50,100]){
    const generated=await request('/exams/custom',{subject:'all',count,duration:20},'student');
    assert.equal(generated.status,200);assert.equal(generated.body.questions.length,count);
    assert.equal(new Set(generated.body.questions.map((q:any)=>q.id)).size,count);
    assert.ok(generated.body.questions.every((q:any)=>!('correctAnswerIndex' in q)&&!('explanation' in q)));
    const a=await db.transaction(s=>s.get(`attempts/${generated.body.examId}`));
    const answers=Object.fromEntries(a.questions.map((q:any)=>[q.id,q.correctAnswerIndex]));
    const [first,retry]=await Promise.all([request('/exams/submit',{examId:a.id,answers},'student'),request('/exams/submit',{examId:a.id,answers},'student')]);
    assert.equal(first.body.score,count);assert.deepEqual(first.body,retry.body);
    assert.equal((await request('/exams/submit',{examId:a.id,answers},'other')).status,404);
  }
  assert.equal((await request('/exams/history',undefined,'student')).body.length,6);
  assert.equal((await request('/exams/history',undefined,'other')).body.length,0);
  assert.equal((await request('/exams/submit',{examId:'missing',answers:{}},'student')).status,404);
});
test('invalid count, insufficient pool, explicit partial consent and exact board/year filter',async t=>{
  const {request}=await harness(t);
  for(const count of [0,-1,101,3.5,'NaN'])assert.equal((await request('/exams/custom',{count})).status,400);
  assert.equal((await request('/exams/custom',{subject:'জীববিজ্ঞান',count:100})).body.error,'insufficient_questions');
  assert.equal((await request('/exams/custom',{subject:'জীববিজ্ঞান',count:100,allowPartial:true})).body.totalQuestions,22);
  const q=INITIAL_QUESTION_BANK[0],bank=[{...q,board:'ঢাকা',year:2024},{...q,id:'different',questionText:'Different',board:'রাজশাহী',year:2023}];
  assert.equal(getEligibleQuestions({board:'ঢাকা',year:2024},bank).length,1);assert.equal(getEligibleQuestions({board:'ঢাকা',year:2023},bank).length,0);
});
test('teacher approval, batch identity, assignment membership and validated pending imports',async t=>{
  const {request,db}=await harness(t);
  await request('/profile',{name:'Teacher',role:'teacher'},'teacher');
  assert.equal((await request('/batches',{name:'Batch',subject:'সাধারণ গণিত'},'teacher')).status,403);
  await request('/admin/verify-teacher',{teacherId:'teacher-a',status:'approved'},'admin');
  const batch=(await request('/batches',{name:'Batch',subject:'সাধারণ গণিত'},'teacher')).body;assert.equal(batch.teacherId,'teacher-a');
  await request('/batches/join',{code:batch.code,studentId:'victim',studentName:'Forged'},'student');
  assert.equal((await db.transaction(s=>s.get(`batches/${batch.id}`))).enrolledStudents[0].id,'student-a');
  assert.equal((await request('/batches',undefined,'other')).body.length,0);
  const pub=(await request('/teacher/publish-exam',{title:'Test',subject:'সাধারণ গণিত',batchId:batch.id,questions:[INITIAL_QUESTION_BANK[0]]},'teacher')).body;
  assert.equal((await request('/exams/'+pub.id,undefined,'other')).status,403);assert.equal((await request('/exams/'+pub.id,undefined,'student')).status,200);
  const malformed={...INITIAL_QUESTION_BANK[0],questionText:'New',correctAnswerIndex:undefined};
  assert.equal((await request('/admin/import-questions',{questions:[malformed]},'admin')).status,400);
  const valid={...INITIAL_QUESTION_BANK[0],questionText:'New question'};
  assert.equal((await request('/admin/import-questions',{questions:[valid]},'admin')).body.importedCount,1);
  assert.equal((await request('/admin/questions',undefined,'admin')).body.find((q:any)=>q.questionText==='New question').verificationStatus,'needs_review');
});
test('temporary guest isolation, notebook retry and server deadline',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'examdna-test-')),file=path.join(dir,'data.json');
  const {request,demoDb:db}=await harness(t,new LocalDatabase(file));const exam=(await request('/exams/demo')).body;
  assert.equal((await request('/attempts/'+exam.examId,undefined,undefined,randomUUID())).status,404);
  const a=await db.transaction(s=>s.get(`attempts/${exam.examId}`)),q=a.questions[0];
  const result=await request('/exams/submit',{examId:a.id,answers:{[q.id]:(q.correctAnswerIndex+1)%4}});
  assert.equal(result.body.incorrectCount,1);assert.equal(result.body.unansweredCount,4);
  assert.equal((await request('/mistakes')).body.length,1);
  await request('/mistakes/retry',{questionId:q.id,selectedOptionIndex:q.correctAnswerIndex});
  const saved=await db.transaction(s=>s.get(`demoUsers/${a.owner.slice(6)}/mistakes/mstk-${q.id}`));
  assert.equal(saved.attemptCount,2);assert.equal(saved.intervalStep,1);
  const late=(await request('/exams/demo')).body;
  await db.transaction(async s=>{const a=await s.get(`attempts/${late.examId}`);s.set(`attempts/${a.id}`,{...a,deadline:Date.now()-130000});});
  assert.equal((await request('/exams/submit',{examId:late.examId,answers:{}})).status,409);
});
test('transaction failure rolls back staged writes',async()=>{
  const db=new LocalDatabase();await assert.rejects(db.transaction(async s=>{s.set('things/one',{value:1});throw new Error('failed');}));assert.equal(await db.transaction(s=>s.get('things/one')),null);
});
test('profile creation respects requested teacher role and refuses self-granted approval/admin', async t => {
  const { request } = await harness(t);
  assert.equal((await request('/auth/me', undefined, 'teacher')).body.user.createdAt, undefined);
  const profile = (await request('/profile', { name: 'New teacher', role: 'teacher', isVerifiedTeacher: true }, 'teacher')).body.user;
  assert.equal(profile.role, 'teacher'); assert.equal(profile.isVerifiedTeacher, false);
  assert.ok(profile.createdAt);
  assert.equal((await request('/profile', { role: 'admin', isVerifiedTeacher: true }, 'teacher')).body.user.role, 'teacher');
  assert.equal((await request('/admin/users', undefined, 'teacher')).status, 403);
});
test('assignment resume keeps one immutable snapshot and completed result', async t => {
  const { request } = await harness(t);
  const pub = (await request('/teacher/publish-exam', { title: 'Test', subject: 'সাধারণ গণিত', questions: [INITIAL_QUESTION_BANK[0]] }, 'admin')).body;
  const a = (await request('/exams/' + pub.id, undefined, 'student')).body;
  const again = (await request('/exams/' + pub.id, undefined, 'student')).body;
  assert.equal(a.examId, again.examId); assert.deepEqual(a.questions, again.questions); assert.equal(a.deadline, again.deadline);
  await request('/exams/submit', { examId: a.examId, answers: {} }, 'student');
  assert.equal((await request('/exams/' + pub.id, undefined, 'student')).body.result.unansweredCount, 1);
});
test('answer payload rejects booleans, null, strings and unknown question IDs', async t => {
  const { request } = await harness(t);
  const a = (await request('/exams/custom', {count: 10}, 'student')).body;
  for (const value of [null, false, '0', 4, -1, 1.5]) {
    assert.equal((await request('/exams/submit', {examId:a.examId,answers:{[a.questions[0].id]:value}}, 'student')).status,400);
  }
  assert.equal((await request('/exams/submit',{examId:a.examId,answers:{unknown:0}},'student')).status,400);
});
test('topic filtering and Bengali all-subject alias apply to API selection', async t => {
  const { request } = await harness(t);
  const all = await request('/exams/custom', {subject:'সকল বিষয়',count:100}, 'student');
  assert.equal(all.body.questions.length,100);
  const topic = INITIAL_QUESTION_BANK[0].topic;
  const specific = await request('/exams/custom', {topic,count:1}, 'student');
  assert.equal(specific.body.questions[0].topic,topic);
});
test('authenticated results and notebook survive database restart; demo never changes personal history', async t => {
  const dir=await mkdtemp(path.join(tmpdir(),'examdna-persistence-')),file=path.join(dir,'data.json');
  const { request, db }=await harness(t,new LocalDatabase(file));
  const exam=(await request('/exams/custom',{count:10},'student')).body;
  const a=await db.transaction(s=>s.get(`attempts/${exam.examId}`));
  const q=a.questions[0];
  await request('/exams/submit',{examId:a.id,answers:{[q.id]:(q.correctAnswerIndex+1)%4}},'student');
  await request('/mistakes/retry',{questionId:q.id,selectedOptionIndex:q.correctAnswerIndex},'student');
  const restarted=new LocalDatabase(file);
  assert.equal((await restarted.transaction(s=>s.list('users/student-a/examResults'))).length,1);
  assert.equal((await restarted.transaction(s=>s.get(`users/student-a/mistakes/mstk-${q.id}`))).attemptCount,2);
  const demo=(await request('/exams/demo',undefined,'student')).body;
  await request('/exams/submit',{examId:demo.examId,answers:{}},'student');
  assert.equal((await request('/exams/history',undefined,'student')).body.length,1);
});

