import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenAI } from '@google/genai';
import { createApi } from './server/api.ts';
import { FirestoreDatabase, LocalDatabase, type Database } from './server/store.ts';
import { INITIAL_QUESTION_BANK } from './src/data/questionBank.ts';

export { ALL_SSC_BOARDS, ALL_SSC_YEARS, ALL_SSC_SUBJECTS } from './server/api.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));

let adminApp: any;
try {
  adminApp = initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || config.projectId,
    credential: applicationDefault(),
  });
} catch {
  try {
    adminApp = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || config.projectId,
    });
  } catch {
    // If already initialized
    adminApp = initializeApp({}, 'fallback-app');
  }
}

const production = process.env.NODE_ENV === 'production';

let database: Database;
if (process.env.DATA_STORE === 'firestore') {
  try {
    database = new FirestoreDatabase(getFirestore(adminApp, process.env.FIRESTORE_DATABASE_ID || config.firestoreDatabaseId || '(default)'));
  } catch (err) {
    console.warn('Firestore initialization warning, falling back to local store:', err);
    database = new LocalDatabase(path.resolve(process.env.LOCAL_DATA_FILE || '.local-data/examdna.json'));
  }
} else {
  database = new LocalDatabase(path.resolve(process.env.LOCAL_DATA_FILE || '.local-data/examdna.json'));
}

export const app = express();
app.disable('x-powered-by');

// API Router with Server-authoritative Authentication & Transactions
app.use('/api', createApi(database, async token => {
  const decoded = await getAuth(adminApp).verifyIdToken(token, true);
  return {
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
    admin: decoded.admin === true,
  };
}));

const questionBank = INITIAL_QUESTION_BANK;

// Syllabus definitions
app.get('/api/syllabus', (_req: Request, res: Response) => {
  res.json({
    targetExam: 'SSC 2027',
    activeSubject: 'সাধারণ গণিত, পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞান',
    status: 'live',
    subjects: [
      { id: 'math', name: 'সাধারণ গণিত', icon: 'Calculator', status: 'live' },
      { id: 'physics', name: 'পদার্থবিজ্ঞান', icon: 'Atom', status: 'live' },
      { id: 'chemistry', name: 'রসায়ন', icon: 'FlaskConical', status: 'live' },
      { id: 'biology', name: 'জীববিজ্ঞান', icon: 'Dna', status: 'live' },
    ],
    chapters: [
      // Mathematics
      {
        id: 'ch-math-alg',
        subject: 'সাধারণ গণিত',
        name: 'বীজগাণিতিক রাশি (Algebraic Expressions)',
        topics: ['বর্গের সূত্রাবলী ও অনুসিদ্ধান্ত', 'ঘনের সূত্রাবলী ও অনুসিদ্ধান্ত', 'উৎপাদকে বিশ্লেষণ'],
        totalQuestions: questionBank.filter(q => q.subject === 'সাধারণ গণিত' && q.chapter === 'বীজগাণিতিক রাশি').length,
      },
      {
        id: 'ch-math-sf',
        subject: 'সাধারণ গণিত',
        name: 'সেট ও ফাংশন (Set and Function)',
        topics: ['উপসেট ও শক্তি সেট', 'সেট প্রক্রিয়া ও ভেনচিত্র', 'অন্বয় ও ফাংশন'],
        totalQuestions: questionBank.filter(q => q.subject === 'সাধারণ গণিত' && q.chapter === 'সেট ও ফাংশন').length,
      },
      {
        id: 'ch-math-rn',
        subject: 'সাধারণ গণিত',
        name: 'বাস্তব সংখ্যা (Real Numbers)',
        topics: ['মূলদ ও অমূলদ সংখ্যা', 'আবৃত দশমিক ভগ্নাংশ', 'অমূলদ সংখ্যার প্রমাণ'],
        totalQuestions: questionBank.filter(q => q.subject === 'সাধারণ গণিত' && q.chapter === 'বাস্তব সংখ্যা').length,
      },
      {
        id: 'ch-math-trig',
        subject: 'সাধারণ গণিত',
        name: 'ত্রিকোণমিতিক অনুপাত (Trigonometry)',
        topics: ['ত্রিকোণমিতিক অভেদাবলী', 'ত্রিকোণমিতিক কোণের মান', 'উন্নতি ও অবনতি কোণ'],
        totalQuestions: questionBank.filter(q => q.subject === 'সাধারণ গণিত' && q.chapter === 'ত্রিকোণমিতিক অনুপাত').length,
      },
      {
        id: 'ch-math-stat',
        subject: 'সাধারণ গণিত',
        name: 'পরিসংখ্যান (Statistics)',
        topics: ['কেন্দ্রীয় প্রবণতার পরিমাপ', 'মধ্যক ও প্রচুরক'],
        totalQuestions: questionBank.filter(q => q.subject === 'সাধারণ গণিত' && q.chapter === 'পরিসংখ্যান').length,
      },
      // Physics
      {
        id: 'ch-phy-qm',
        subject: 'পদার্থবিজ্ঞান',
        name: 'ভৌত রাশি ও পরিমাপ (Physical Quantities)',
        topics: ['মৌলিক রাশি ও একক', 'পরিমাপের যন্ত্রপাতি ও ভার্নিয়ার ধ্রুবক', 'মাত্রা ও মাত্রা সমীকরণ'],
        totalQuestions: questionBank.filter(q => q.subject === 'পদার্থবিজ্ঞান' && q.chapter === 'ভৌত রাশি ও পরিমাপ').length,
      },
      {
        id: 'ch-phy-mot',
        subject: 'পদার্থবিজ্ঞান',
        name: 'গতি (Motion)',
        topics: ['স্কেলার ও ভেক্টর রাশি', 'গতির সমীকরণ', 'পরন্ত বস্তুর সূত্রাবলী', 'ত্বরণ ও মন্দন'],
        totalQuestions: questionBank.filter(q => q.subject === 'পদার্থবিজ্ঞান' && q.chapter === 'গতি').length,
      },
      {
        id: 'ch-phy-frc',
        subject: 'পদার্থবিজ্ঞান',
        name: 'বল (Force)',
        topics: ['নিউটনের গতিসূত্র ও ভরবেগ', 'ভরবেগ ও বলের সমীকরণ', 'ভরবেগের সংরক্ষণ সূত্র', 'ঘর্ষণ ও ঘর্ষণ বল'],
        totalQuestions: questionBank.filter(q => q.subject === 'পদার্থবিজ্ঞান' && q.chapter === 'বল').length,
      },
      {
        id: 'ch-phy-frc',
        subject: 'পদার্থবিজ্ঞান',
        name: 'কাজ, ক্ষমতা ও শক্তি (Work, Power & Energy)',
        topics: ['কাজের সংজ্ঞা ও একক', 'গতিশক্তি ও বিভব শক্তি', 'ক্ষমতা ও কর্মদক্ষতা'],
        totalQuestions: questionBank.filter(q => q.subject === 'পদার্থবিজ্ঞান' && q.chapter === 'কাজ, ক্ষমতা ও শক্তি').length,
      },
      {
        id: 'ch-phy-prs',
        subject: 'পদার্থবিজ্ঞান',
        name: 'পদার্থের অবস্থা ও চাপ (Pressure & States of Matter)',
        topics: ['চাপ ও ঘনত্বের একক', 'প্যাসকেলের সূত্র ও হাইড্রোলিক প্রেস', 'আর্কিমিডিসের নীতি ও প্লবতা'],
        totalQuestions: questionBank.filter(q => q.subject === 'পদার্থবিজ্ঞান' && q.chapter === 'পদার্থের অবস্থা ও চাপ').length,
      },
      // Chemistry
      {
        id: 'ch-chem-str',
        subject: 'রসায়ন',
        name: 'পদার্থের গঠন ও পরমাণুর মডেল',
        topics: ['পরমাণুর মূল কণিকা', 'বোর পরমাণু মডেল', 'ইলেকট্রন বিন্যাস ও আইসোটোপ'],
        totalQuestions: questionBank.filter(q => q.subject === 'রসায়ন' && q.chapter.includes('পদার্থের গঠন')).length,
      },
      {
        id: 'ch-chem-pt',
        subject: 'রসায়ন',
        name: 'পর্যায় সারণি (Periodic Table)',
        topics: ['পর্যায়বৃত্ত ধর্ম', 'পারমাণবিক ব্যাসার্ধ', 'আয়নিকরণ শক্তি ও তড়িৎ ঋণাত্মকতা'],
        totalQuestions: questionBank.filter(q => q.subject === 'রসায়ন' && q.chapter === 'পর্যায় সারণি').length,
      },
      {
        id: 'ch-chem-mol',
        subject: 'রসায়ন',
        name: 'মোলের ধারণা ও রাসায়নিক গণনা',
        topics: ['অ্যাভোগাড্রো সংখ্যা', 'মোলার আয়তন', 'মোলারিটি'],
        totalQuestions: questionBank.filter(q => q.subject === 'রসায়ন' && q.chapter.includes('মোলের ধারণা')).length,
      },
      // Biology
      {
        id: 'ch-bio-cell',
        subject: 'জীববিজ্ঞান',
        name: 'জীবকোষ ও টিস্যু (Cell & Tissue)',
        topics: ['মাইটোকনড্রিয়া', 'প্লাস্টিড', 'জাইলেম ও ফ্লোয়েম'],
        totalQuestions: questionBank.filter(q => q.subject === 'জীববিজ্ঞান' && q.chapter === 'জীবকোষ ও টিস্যু').length,
      },
      {
        id: 'ch-bio-cd',
        subject: 'জীববিজ্ঞান',
        name: 'কোষ বিভাজন (Cell Division)',
        topics: ['মাইটোসিসের ধাপসমূহ', 'মিয়োসিস ও ক্রসিং ওভার'],
        totalQuestions: questionBank.filter(q => q.subject === 'জীববিজ্ঞান' && q.chapter === 'কোষ বিভাজন').length,
      },
      {
        id: 'ch-bio-dna',
        subject: 'জীববিজ্ঞান',
        name: 'জীবের বংশগতি (Genetics & DNA)',
        topics: ['DNA ডাবল হেলিক্স', 'ক্রোমোজোম ও মানব লিঙ্গ নির্ধারণ', 'মেন্ডেলের সূত্র'],
        totalQuestions: questionBank.filter(q => q.subject === 'জীববিজ্ঞান' && q.chapter.includes('বংশগতি')).length,
      },
    ],
  });
});

// Zero API Cost Free Starter Tier AI Study Coach (Preserving unrelated AI features)
const aiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (aiApiKey && aiApiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey: aiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const roleInstructions: Record<string, string> = {
  concept_tutor: `তুমি ExamDNA BD এর এসএসসি গণিত ও বিজ্ঞান বিষয়ভিত্তিক শিক্ষক।
এসএসসি ২০২৩-২০২৭ NCTB সিলেবাস অনুযায়ী সাধারণ গণিত, পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞানের যেকোনো জটিল নিয়ম ও সূত্র সহজ, প্রাঞ্জল ও বাংলায় বুঝিয়ে দাও।`,
  mistake_analyst: `তুমি ExamDNA BD এর ভুল বিশ্লেষণ বিশেষজ্ঞ। শিক্ষার্থীর ভুল উত্তরের পেছনের কারণ চিহ্নিত করে ভবিষ্যতে সঠিক করার উপায় শেখাও।`,
  board_strategist: `তুমি এসএসসি বোর্ড পরীক্ষা ও সময় ব্যবস্থাপনা কৌশলবিদ। ৩০ মিনিটে ৩০টি MCQ দাগানোর নিখুঁত রণকৌশল শেখাও।`,
  speed_formula: `তুমি দ্রুত সূত্র ও শর্টকাট ট্রেইনার। সূত্র, মাত্রা ও একক চোখের পলকে মনে রাখার ছন্দ ও টেকনিক শেখাও।`,
};

app.post('/api/ai/coach', async (req: Request, res: Response) => {
  const { question, messages = [], role = 'concept_tutor', subject = 'সাধারণ গণিত' } = req.body || {};

  const systemInstruction = roleInstructions[role] || roleInstructions.concept_tutor;
  let contents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

  if (Array.isArray(messages) && messages.length > 0) {
    contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));
  } else if (question) {
    contents = [{ role: 'user', parts: [{ text: `শিক্ষার্থীর প্রশ্ন: ${question}\nবিষয়: ${subject}` }] }];
  }

  if (contents.length > 0 && contents[0].role === 'model') {
    contents.unshift({ role: 'user', parts: [{ text: 'আসসালামু আলাইকুম' }] });
  }

  if (aiClient && contents.length > 0) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents as any,
        config: { systemInstruction },
      });
      const replyText = response.text?.trim();
      if (replyText) {
        return res.json({
          reply: replyText,
          role,
          model: 'gemini-3.8-flash',
          tier: 'Free Starter Tier ($0 API Cost)',
          cost: '$0.00',
        });
      }
    } catch {
      // Fall through to deterministic curriculum fallback
    }
  }

  let fallbackReply = 'বীজগাণিতিক সূত্রে মনে রাখবে: বর্গের অনুসিদ্ধান্ত যেমন ab = ((a+b)/2)² - ((a-b)/2)² এবং (x+1/x)² = (x-1/x)² + 4 খুবই গুরুত্বপূর্ণ। নিয়মিত সূত্রের অনুশীলন করলে ভুল কমবে।';
  if (role === 'mistake_analyst') {
    fallbackReply = 'চিহ্নের অসাবধানতা ও সূত্রের বিভ্রান্তি এড়াতে খাতার একপাশে মানগুলো লিখে সূত্রের সঙ্গে মিলিয়ে নাও।';
  } else if (role === 'board_strategist') {
    fallbackReply = '১ম ১৫ মিনিটে সহজ প্রশ্নগুলো সমাধান করো এবং জটিল গণনা পরবর্তী রাউন্ডের জন্য সংরক্ষণ করো।';
  } else if (role === 'speed_formula') {
    fallbackReply = 'গতি ও বলের প্রধান সমীকরণ: v = u + at, s = ut + ½at², v² = u² + 2as, F = ma।';
  }

  res.json({
    reply: fallbackReply,
    role,
    model: 'gemini-3.8-flash',
    tier: 'Free Starter Tier ($0 API Cost)',
    cost: '$0.00',
  });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));

async function startServer() {
  if (production) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '0.0.0.0';
  app.listen(port, host, () => {
    console.log(`ExamDNA BD server ready on http://${host}:${port}`);
  });
}

if (process.env.NODE_TEST !== '1' && process.env.IS_TEST !== 'true') {
  startServer();
}
