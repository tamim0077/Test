import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { create, act } from 'react-test-renderer';
import { useExamSession } from '../src/utils/useExamSession.ts';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
async function harness(t: any, deadline: number, callback: any) {
  const values = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => values.set(k, v), removeItem: (k: string) => values.delete(k),
  }});
  let session: ReturnType<typeof useExamSession>;
  function Probe() { session = useExamSession('test-attempt', 1, deadline, callback); return null; }
  let renderer: any;
  await act(async () => { renderer = create(<Probe />); });
  t.after(async () => {
    await act(async () => renderer.unmount());
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete (globalThis as any).localStorage;
  });
  return { get: () => session!, values };
}
test('timer expiry submits latest changed answers once and clears only after success', async t => {
  const originalNow = Date.now;
  let now = originalNow();
  Date.now = () => now;
  t.after(() => { Date.now = originalNow; });
  const submissions: any[] = [];
  const h = await harness(t, now + 60000, async (answers: any) => { submissions.push(answers); });
  await act(async () => h.get().setAnswers({ q1: 2, q2: 3 }));
  now += 61000;
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 300)); });
  assert.deepEqual(submissions, [{ q1: 2, q2: 3 }]);
  await act(async () => h.get().submit());
  assert.equal(submissions.length, 1);
  assert.equal(h.values.has('exam_progress_test-attempt'), false);
});
test('network failure preserves selections, releases lock, and retry succeeds', async t => {
  let calls = 0;
  const h = await harness(t, Date.now() + 60000, async () => {
    if (++calls === 1) throw new Error('offline');
  });
  await act(async () => h.get().setAnswers({ q1: 1 }));
  await act(async () => h.get().submit());
  assert.equal(h.get().isSubmitting, false);
  assert.equal(h.get().error, 'offline');
  assert.deepEqual(JSON.parse(h.values.get('exam_progress_test-attempt')!).answers, { q1: 1 });
  await act(async () => h.get().submit());
  assert.equal(calls, 2);
  assert.equal(h.values.has('exam_progress_test-attempt'), false);
});
test('simultaneous manual and automatic submission share synchronous lock', async t => {
  let calls = 0, resolve!: () => void;
  const h = await harness(t, Date.now() + 60000, () => { calls++; return new Promise<void>(r => { resolve = r; }); });
  let pending: Promise<void>;
  await act(async () => { pending = h.get().submit(); void h.get().submit(); });
  assert.equal(calls, 1);
  assert.equal(h.get().isSubmitting, true);
  await act(async () => { resolve(); await pending; });
  assert.equal(h.get().isSubmitting, false);
});

