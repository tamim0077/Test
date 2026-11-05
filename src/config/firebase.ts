import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import type { UserAccount, UserMistakeEntry, TeacherBatch } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  type FirebaseUser,
};

export const firebaseConfig = firebaseConfigJson;

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with specified Database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation Types for Hardened Error Context
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory Firestore Connection Verification
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection test: client is currently offline or connecting.');
    }
  }
}
testConnection();

// --- Firestore Data Access Helpers ---

/**
 * Fetch or sync user profile from Firestore
 */
export async function getFirestoreUserProfile(userId: string): Promise<UserAccount | null> {
  const userPath = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
    return null;
  }
}

/**
 * Create or save user profile in Firestore
 */
export async function saveFirestoreUserProfile(profile: Partial<UserAccount> & { id: string }): Promise<void> {
  const userPath = `users/${profile.id}`;
  try {
    const userRef = doc(db, 'users', profile.id);
    const existingSnap = await getDoc(userRef);
    if (existingSnap.exists()) {
      await updateDoc(userRef, {
        ...profile,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(userRef, {
        ...profile,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

/**
 * Sync mistake notebook entry to Firestore
 */
export async function saveFirestoreMistake(userId: string, mistake: UserMistakeEntry): Promise<void> {
  const mistakePath = `users/${userId}/mistakes/${mistake.id}`;
  try {
    const mistakeRef = doc(db, 'users', userId, 'mistakes', mistake.id);
    await setDoc(mistakeRef, {
      ...mistake,
      userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, mistakePath);
  }
}

/**
 * Fetch all mistakes for a user from Firestore
 */
export async function getFirestoreMistakes(userId: string): Promise<UserMistakeEntry[]> {
  const mistakesPath = `users/${userId}/mistakes`;
  try {
    const colRef = collection(db, 'users', userId, 'mistakes');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as UserMistakeEntry);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, mistakesPath);
    return [];
  }
}

/**
 * Save exam result submission to Firestore
 */
export async function saveFirestoreExamResult(userId: string, result: any): Promise<void> {
  const resultPath = `users/${userId}/examResults/${result.id || result.examId || Date.now()}`;
  try {
    const docId = result.id || result.examId || `res-${Date.now()}`;
    const resultRef = doc(db, 'users', userId, 'examResults', docId);
    await setDoc(resultRef, {
      ...result,
      id: docId,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, resultPath);
  }
}

/**
 * Fetch all exam results for a user from Firestore to compute authoritative statistics
 */
export async function getFirestoreExamResults(userId: string): Promise<any[]> {
  const resultsPath = `users/${userId}/examResults`;
  try {
    const colRef = collection(db, 'users', userId, 'examResults');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, resultsPath);
    return [];
  }
}

/**
 * Fetch teacher batches from Firestore
 */
export async function getFirestoreBatches(): Promise<TeacherBatch[]> {
  const batchesPath = 'batches';
  try {
    const snap = await getDocs(collection(db, batchesPath));
    return snap.docs.map(d => d.data() as TeacherBatch);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, batchesPath);
    return [];
  }
}

/**
 * Create teacher batch in Firestore
 */
export async function createFirestoreBatch(batch: TeacherBatch): Promise<void> {
  const batchPath = `batches/${batch.id}`;
  try {
    await setDoc(doc(db, 'batches', batch.id), batch);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, batchPath);
  }
}
