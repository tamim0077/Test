import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Firestore } from 'firebase-admin/firestore';

export interface Store {
  get<T = any>(key: string): Promise<T | null>;
  list<T = any>(collection: string): Promise<T[]>;
  set(key: string, value: any): void;
  delete(key: string): void;
}
export interface Database { transaction<T>(fn: (store: Store) => Promise<T>): Promise<T> }
const clean = (value: any) => JSON.parse(JSON.stringify(value));

// All mutations in a request commit together. Reads always precede Firestore writes.
export class FirestoreDatabase implements Database {
  private db: Firestore;
  constructor(db: Firestore) {
    this.db = db;
  }
  transaction<T>(fn: (store: Store) => Promise<T>): Promise<T> {
    return this.db.runTransaction(async tx => {
      const pending = new Map<string, any>();
      const result = await fn({
        get: async <T>(key: string) => {
          if (pending.has(key)) return pending.get(key) as T;
          const snap = await tx.get(this.db.doc(key));
          return snap.exists ? snap.data() as T : null;
        },
        list: async <T>(collection: string) => {
          const snap = await tx.get(this.db.collection(collection));
          const values = new Map(snap.docs.map(d => [d.ref.path, d.data()]));
          for (const [key, value] of pending) {
            if (key.slice(0, key.lastIndexOf('/')) === collection) {
              if (value === null) values.delete(key); else values.set(key, value);
            }
          }
          return [...values.values()] as T[];
        },
        set: (key, value) => pending.set(key, clean(value)),
        delete: key => pending.set(key, null),
      });
      for (const [key, value] of pending) {
        if (value === null) tx.delete(this.db.doc(key)); else tx.set(this.db.doc(key), value);
      }
      return result;
    });
  }
}

// Explicit local-development/test adapter. Never selected in production.
export class LocalDatabase implements Database {
  private file?: string;
  private data: Record<string, any> = {};
  private queue: Promise<unknown> = Promise.resolve();
  private loaded = false;
  constructor(file?: string) {
    this.file = file;
  }
  transaction<T>(fn: (store: Store) => Promise<T>): Promise<T> {
    const run = this.queue.then(async () => {
      if (!this.loaded && this.file) {
        try { this.data = JSON.parse(await readFile(this.file, 'utf8')); }
        catch (error: any) { if (error.code !== 'ENOENT') throw error; }
      }
      this.loaded = true;
      const draft = structuredClone(this.data);
      let changed = false;
      const result = await fn({
        get: async key => structuredClone(draft[key] ?? null),
        list: async collection => Object.entries(draft)
          .filter(([key]) => key.slice(0, key.lastIndexOf('/')) === collection)
          .map(([, value]) => structuredClone(value)),
        set: (key, value) => { draft[key] = clean(value); changed = true; },
        delete: key => { delete draft[key]; changed = true; },
      });
      if (changed && this.file) {
        await mkdir(path.dirname(this.file), { recursive: true });
        await writeFile(this.file + '.tmp', JSON.stringify(draft), { mode: 0o600 });
        await rename(this.file + '.tmp', this.file);
      }
      this.data = draft;
      return result;
    });
    this.queue = run.catch(() => {});
    return run;
  }
}

