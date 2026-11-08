import { useState, useRef, useEffect } from 'react';

export function useExamSession(examId: string, minutes: number, serverDeadline: number | undefined,
  onSubmit: (answers: Record<string, number>, elapsed: number) => Promise<void>) {
  const key = `exam_progress_${examId}`;
  const [initial] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(key) || '{}'); return { answers: saved.answers || {}, deadline: serverDeadline || saved.deadline || Date.now() + minutes * 60000 }; }
    catch { return { answers: {}, deadline: serverDeadline || Date.now() + minutes * 60000 }; }
  });
  const [answers, setAnswers] = useState<Record<string, number>>(initial.answers);
  const [timeLeftSeconds, setTimeLeft] = useState(Math.max(0, Math.ceil((initial.deadline - Date.now()) / 1000)));
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const current = useRef({ answers, onSubmit }); current.current = { answers, onSubmit };
  const busy = useRef(false), completed = useRef(false), autoAttempted = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (completed.current) return;
    try { localStorage.setItem(key, JSON.stringify({ answers, deadline: initial.deadline })); } catch { /* Server submission still works without browser storage. */ }
  }, [answers, key, initial.deadline]);
  const submit = async () => {
    if (busy.current || completed.current) return;
    busy.current = true; setSubmitting(true); setError('');
    try {
      const left = Math.max(0, Math.ceil((initial.deadline - Date.now()) / 1000));
      await current.current.onSubmit(current.current.answers, Math.max(0, minutes * 60 - left));
      completed.current = true;
      try { localStorage.removeItem(key); } catch {}
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : 'Submission failed. Your answers are retained. Retry.');
    } finally { busy.current = false; if (mounted.current) setSubmitting(false); }
  };
  const submitRef = useRef(submit); submitRef.current = submit;
  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.ceil((initial.deadline - Date.now()) / 1000));
      setTimeLeft(left);
      if (left === 0 && !autoAttempted.current) { autoAttempted.current = true; void submitRef.current(); }
    };
    tick(); const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [initial.deadline]);
  return { answers, setAnswers, timeLeftSeconds, isSubmitting, error, submit };
}

