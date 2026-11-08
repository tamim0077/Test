import { getAuth } from 'firebase/auth';

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  if (!input.startsWith('/api/')) return globalThis.fetch(input, init);
  const headers = new Headers(init.headers);
  headers.delete('Authorization'); // Never reuse an expired or different account's cached token.
  const auth = getAuth();
  await auth.authStateReady();
  const user = auth.currentUser;
  if (user) headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  else {
    let session = sessionStorage.getItem('examdna_demo_session');
    if (!session) { session = crypto.randomUUID(); sessionStorage.setItem('examdna_demo_session', session); }
    headers.set('X-Demo-Session', session);
  }
  if (auth.currentUser?.uid !== user?.uid) throw new Error('Account changed. Please retry.');
  const response = await globalThis.fetch(input, { ...init, headers });
  if (auth.currentUser?.uid !== user?.uid) throw new Error('Account changed. Please retry.');
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status}). Please retry.`);
  }
  return response;
}

