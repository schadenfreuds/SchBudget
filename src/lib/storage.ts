import { MonthlyBudget, AppSettings, FixedExpenseItem } from '@/types/budget';
import { DEFAULT_APP_SETTINGS, DEFAULT_FIXED_TEMPLATES } from './constants';
import { fetchMonthFromFirebase, saveMonthToFirebase } from './firebase';

const SETTINGS_KEY = 'aile_butcesi_settings';
const BUDGET_PREFIX = 'aile_butcesi_month_';

export function getMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatMonthDisplay(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${months[mIndex]} ${year}`;
}

export function getAdjacentMonth(monthKey: string, delta: number): string {
  const [yStr, mStr] = monthKey.split('-');
  let y = parseInt(yStr, 10);
  let m = parseInt(mStr, 10) + delta;

  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_APP_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Ayarlar yüklenemedi:', err);
  }
  return DEFAULT_APP_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Ayarlar kaydedilemedi:', err);
  }
}

export function createInitialMonthBudget(monthKey: string): MonthlyBudget {
  const settings = loadSettings();
  const fixedTemplates = settings.defaultFixedExpenses || DEFAULT_FIXED_TEMPLATES;

  const fixedExpenses: FixedExpenseItem[] = fixedTemplates.map((tpl, index) => ({
    id: `fixed_${monthKey}_${index}_${Date.now()}`,
    title: tpl.title,
    expectedAmount: tpl.expectedAmount,
    actualAmount: tpl.expectedAmount,
    categoryId: tpl.categoryId,
    personId: tpl.personId,
    isPaid: false,
    dueDate: tpl.dueDate,
  }));

  return {
    monthKey,
    incomes: [],
    fixedExpenses,
    expenses: [],
  };
}

export function loadLocalMonth(monthKey: string): MonthlyBudget {
  if (typeof window === 'undefined') return createInitialMonthBudget(monthKey);

  try {
    const saved = localStorage.getItem(`${BUDGET_PREFIX}${monthKey}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Yerel bütçe okunamadı:', err);
  }

  // Eğer ilk kez açılıyorsa ve Mart 2026 ise örnek verilerle dolduralım ki annenin kafası karışmasın
  const initial = createInitialMonthBudget(monthKey);
  saveLocalMonth(initial);
  return initial;
}

export function saveLocalMonth(budget: MonthlyBudget): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${BUDGET_PREFIX}${budget.monthKey}`, JSON.stringify(budget));
  } catch (err) {
    console.error('Yerel bütçe kaydedilemedi:', err);
  }
}

// Bulut ile senkron yükleme
export async function loadMonthWithCloud(monthKey: string): Promise<MonthlyBudget> {
  const local = loadLocalMonth(monthKey);

  // Arka planda Firebase'den çekip birleştir
  try {
    const remote = await fetchMonthFromFirebase(monthKey);
    if (remote) {
      saveLocalMonth(remote);
      return remote;
    }
  } catch {
    // Cloud erişilemezse yerel ile devam
  }

  return local;
}

// Hem yerel hem buluta yaz
export async function saveMonthWithCloud(budget: MonthlyBudget): Promise<void> {
  saveLocalMonth(budget);
  try {
    await saveMonthToFirebase(budget);
  } catch (err) {
    console.warn('Firebase senkronizasyonu yapılamadı, yerel kayıt korundu:', err);
  }
}
