import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import express from 'express';
import { createApi } from '../server/api.ts';
import { FirestoreDatabase } from '../server/store.ts';

const projectId = 'demo-examdna-audit';
if (!process.env.FIRESTORE_EMULATOR_HOST?.startsWith('127.0.0.1:')) throw new Error('Local emulator required. Never run against production.');
test('Firestore deployed-style rules deny roster takeover, role escalation and direct result writes', async t => {
  const env = await initializeTestEnvironment({ projectId, firestore: { rules: readFileSync('firestore.rules','utf8') } });
  t.after(()=>env.cleanup());
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c: any) => {
    await setDoc(doc(c.firestore(),'users/alice'),{id:'alice',role:'student'});
    await setDoc(doc(c.firestore(),'users/alice/examResults/a'),{score:1});
    await setDoc(doc(c.firestore(),'batches/b'),{teacherId:'teacher',enrolledStudents:['alice']});
  });
  const alice=env.authenticatedContext('alice').firestore(),bob=env.authenticatedContext('bob').firestore(),guest=env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(alice,'users/alice')));
  await assertSucceeds(getDocs(collection(alice,'users/alice/examResults')));
  await assertFails(getDoc(doc(bob,'users/alice')));
  await assertFails(getDoc(doc(guest,'users/alice')));
  await assertFails(updateDoc(doc(alice,'users/alice'),{role:'admin',isVerifiedTeacher:true}));
  await assertFails(setDoc(doc(alice,'users/alice/examResults/fake'),{score:100}));
  await assertFails(updateDoc(doc(bob,'batches/b'),{enrolledStudents:[]}));
  await assertFails(setDoc(doc(alice,'admins/alice'),{admin:true}));
  await assertFails(getDocs(collection(alice,'attempts')));
  await assertFails(setDoc(doc(env.authenticatedContext('admin',{admin:true}).firestore(),'questions/fake'),{correctAnswerIndex:0}));
});
test('Firestore transaction adapter commits one result under concurrent retry and persists across API instances',async t=>{
  const admin=initializeApp({projectId},'integration');t.after(()=>deleteApp(admin));
  const firestore=getFirestore(admin),db=new FirestoreDatabase(firestore);
  const app=express();app.use('/api',createApi(db,async()=>({uid:'integration-student',name:'Test'})));
  const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
  t.after(()=>new Promise<void>(r=>{server.closeAllConnections();server.close(()=>r());}));
  const base=`http://127.0.0.1:${(server.address() as any).port}/api`;
  const post=async(route:string,body:any)=>{
    const response=await fetch(base+route,{method:'POST',headers:{Authorization:'Bearer emulator-test', 'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));return data;
  };
  await post('/profile',{name:'Integration Student'});
  const exam=await post('/exams/custom',{count:100,duration:60});
  const attempt=await db.transaction(s=>s.get(`attempts/${exam.examId}`));
  const answers=Object.fromEntries(attempt.questions.map((q:any)=>[q.id,(q.correctAnswerIndex+1)%4]));
  const [first,second]=await Promise.all([post('/exams/submit',{examId:exam.examId,answers}),post('/exams/submit',{examId:exam.examId,answers})]);
  assert.equal(first.incorrectCount,100);assert.deepEqual(first,second);
  const reopened=new FirestoreDatabase(getFirestore(admin));
  assert.equal((await reopened.transaction(s=>s.list('users/integration-student/examResults'))).length,1);
  assert.equal((await reopened.transaction(s=>s.list('users/integration-student/mistakes'))).length,100);
  assert.equal((await reopened.transaction(s=>s.get('users/integration-student'))).streakDays,1);
});

