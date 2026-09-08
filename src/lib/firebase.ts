import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { MonthlyBudget } from '@/types/budget';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Firebase config can come from environment variables or custom config
export function getFirebaseConfig() {
  if (typeof window === 'undefined') return null;

  // 1. Check window local storage custom config
  const customConfig = localStorage.getItem('sch_budget_firebase_config') || localStorage.getItem('aile_butcesi_firebase_config');
  if (customConfig) {
    try {
      return JSON.parse(customConfig);
    } catch {
      // ignore
    }
  }

  // 2. Check Next.js public env vars
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }

  return null;
}

export function initFirebase(): Firestore | null {
  if (db) return db;

  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app);
    return db;
  } catch (err) {
    console.warn('Firebase başlatılamadı, yerel modda devam ediliyor:', err);
    return null;
  }
}

export async function fetchMonthFromFirebase(monthKey: string): Promise<MonthlyBudget | null> {
  const firestore = initFirebase();
  if (!firestore) return null;

  try {
    const docRef = doc(firestore, 'budgets', monthKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MonthlyBudget;
    }
    return null;
  } catch (err) {
    console.error('Firebase okuma hatası:', err);
    return null;
  }
}

export async function saveMonthToFirebase(budget: MonthlyBudget): Promise<boolean> {
  const firestore = initFirebase();
  if (!firestore) return false;

  try {
    const docRef = doc(firestore, 'budgets', budget.monthKey);
    await setDoc(docRef, {
      ...budget,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Firebase kaydetme hatası:', err);
    return false;
  }
}

export function subscribeToMonth(monthKey: string, onUpdate: (budget: MonthlyBudget) => void) {
  const firestore = initFirebase();
  if (!firestore) return () => {};

  const docRef = doc(firestore, 'budgets', monthKey);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as MonthlyBudget);
    }
  }, (err) => {
    console.warn('Firestore dinleme hatası:', err);
  });
}
