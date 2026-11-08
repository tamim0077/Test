import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { apiFetch } from '../utils/api.ts';
import type { UserAccount, UserMistakeEntry, TeacherBatch } from '../types.ts';
export { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, firebaseSignOut, onAuthStateChanged, type FirebaseUser };
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export async function getFirestoreUserProfile(_id: string): Promise<UserAccount | null> {
  return (await (await apiFetch('/api/auth/me')).json()).user;
}
export async function saveFirestoreUserProfile(profile: Partial<UserAccount> & {id: string}): Promise<void> {
  await apiFetch('/api/profile', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(profile)});
}
export async function getFirestoreExamResults(_id: string): Promise<any[]> { return (await apiFetch('/api/exams/history')).json(); }
export async function getFirestoreMistakes(_id: string): Promise<UserMistakeEntry[]> { return (await apiFetch('/api/mistakes')).json(); }
export async function getFirestoreBatches(): Promise<TeacherBatch[]> { return (await apiFetch('/api/batches')).json(); }

