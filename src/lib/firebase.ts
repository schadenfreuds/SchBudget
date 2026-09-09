import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { MonthlyBudget } from '@/types/budget';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Akıllı Yapılandırma Ayrıştırıcı (JSON, JS Objesi, .env formatlarını otomatik çözer)
export function parseFirebaseConfigInput(input: string): Record<string, string> | null {
  if (!input || !input.trim()) return null;
  const clean = input.trim();

  // 1. Standart JSON
  try {
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === 'object' && parsed.apiKey && parsed.projectId) {
      return parsed;
    }
  } catch {}

  // 2. JS / .env formatlarından Regex ile çıkarım
  const extract = (key: string, envKey: string) => {
    const envPattern = new RegExp(`(?:NEXT_PUBLIC_FIREBASE_${envKey}|FIREBASE_${envKey}|${envKey})\\s*=\\s*['"]?([^'\"\\r\\n,;]+)['"]?`, 'i');
    const envMatch = clean.match(envPattern);
    if (envMatch) return envMatch[1].trim();

    const jsPattern = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
    const jsMatch = clean.match(jsPattern);
    if (jsMatch) return jsMatch[1].trim();

    return '';
  };

  const apiKey = extract('apiKey', 'API_KEY');
  const projectId = extract('projectId', 'PROJECT_ID');

  if (apiKey && projectId) {
    return {
      apiKey,
      projectId,
      authDomain: extract('authDomain', 'AUTH_DOMAIN') || `${projectId}.firebaseapp.com`,
      storageBucket: extract('storageBucket', 'STORAGE_BUCKET') || `${projectId}.firebasestorage.app`,
      messagingSenderId: extract('messagingSenderId', 'MESSAGING_SENDER_ID'),
      appId: extract('appId', 'APP_ID'),
    };
  }

  return null;
}

// Firebase instance sıfırlayıcı
export function resetFirebaseInstance() {
  app = null;
  db = null;
}

// Bağlı olan Firebase projesinin kimliğini döner
export function getCurrentFirebaseProject(): string | null {
  const config = getFirebaseConfig();
  return config?.projectId || null;
}

// Firebase bağlantısını kaldırır ve yerel moda çeker
export function disconnectFirebase() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sch_budget_firebase_config');
    localStorage.removeItem('aile_butcesi_firebase_config');
  }
  resetFirebaseInstance();
}

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

export function initFirebase(force = false): Firestore | null {
  if (db && !force) return db;

  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (getApps().length === 0 || force) {
      app = initializeApp(config, force ? `schbudget-${Date.now()}` : undefined);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    return db;
  } catch (err) {
    console.warn('Firebase başlatılamadı, yerel modda devam ediliyor:', err);
    return null;
  }
}

// Canlı test fonksiyonu: Firestore'a sağlık kontrolü yazıp okur
export async function testFirebaseConnection(): Promise<{ success: boolean; error?: string }> {
  const firestore = initFirebase();
  if (!firestore) return { success: false, error: 'Firebase yapılandırması eksik veya başlatılamadı.' };

  try {
    const testDoc = doc(firestore, 'budgets', '__health_check__');
    await setDoc(testDoc, { ping: true, time: new Date().toISOString() });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
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
    // Firestore undefined alanları kabul etmediği için JSON ile sterilize ediyoruz
    const cleanBudget = JSON.parse(JSON.stringify(budget));
    await setDoc(docRef, {
      ...cleanBudget,
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
