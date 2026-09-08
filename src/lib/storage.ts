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

export function getMockupMonthBudget(monthKey: string = '2026-09'): MonthlyBudget {
  const settings = loadSettings();
  const p1 = settings.persons[0]?.id || 'anne';
  const p2 = settings.persons[1]?.id || 'baba';
  const p3 = settings.persons[2]?.id || 'cocuk';
  const pHome = 'ortak';

  return {
    monthKey,
    incomes: [
      { id: `inc_${monthKey}_1`, title: 'Aylık Maaş (Baba)', amount: 65000, personId: p2, date: `${monthKey}-01`, note: 'Net hakediş' },
      { id: `inc_${monthKey}_2`, title: 'Aylık Maaş (Anne)', amount: 48000, personId: p1, date: `${monthKey}-05`, note: 'Net hakediş' },
      { id: `inc_${monthKey}_3`, title: 'Freelance Yazılım Projesi', amount: 15000, personId: p3, date: `${monthKey}-12`, note: 'Açık kaynak danışmanlık' },
    ],
    fixedExpenses: [
      { id: `fix_${monthKey}_1`, title: 'Ev Kirası', expectedAmount: 22000, actualAmount: 22000, categoryId: 'kira_aidat', personId: pHome, isPaid: true, dueDate: 1, note: 'Banka havalesi ile ödendi' },
      { id: `fix_${monthKey}_2`, title: 'Bina & Site Aidatı', expectedAmount: 2500, actualAmount: 2500, categoryId: 'kira_aidat', personId: pHome, isPaid: true, dueDate: 5 },
      { id: `fix_${monthKey}_3`, title: 'Elektrik Faturası (Enerjisa)', expectedAmount: 1450, actualAmount: 1450, categoryId: 'fatura', personId: pHome, isPaid: true, dueDate: 15 },
      { id: `fix_${monthKey}_4`, title: 'Doğalgaz Faturası (İGDAŞ)', expectedAmount: 850, actualAmount: 850, categoryId: 'fatura', personId: pHome, isPaid: false, dueDate: 18, note: 'Son ödeme 18 Eylül' },
      { id: `fix_${monthKey}_5`, title: 'Su Faturası (İSKİ)', expectedAmount: 420, actualAmount: 420, categoryId: 'fatura', personId: pHome, isPaid: false, dueDate: 20, note: 'Son ödeme 20 Eylül' },
      { id: `fix_${monthKey}_6`, title: 'Ev İnterneti (Fiber)', expectedAmount: 490, actualAmount: 490, categoryId: 'fatura', personId: pHome, isPaid: true, dueDate: 12 },
      { id: `fix_${monthKey}_7`, title: 'Cep Telefonu (Anne)', expectedAmount: 340, actualAmount: 340, categoryId: 'fatura', personId: p1, isPaid: true, dueDate: 22 },
      { id: `fix_${monthKey}_8`, title: 'Cep Telefonu (Baba)', expectedAmount: 390, actualAmount: 390, categoryId: 'fatura', personId: p2, isPaid: true, dueDate: 22 },
      { id: `fix_${monthKey}_9`, title: 'Cep Telefonu (Çocuk)', expectedAmount: 290, actualAmount: 290, categoryId: 'fatura', personId: p3, isPaid: true, dueDate: 22 },
    ],
    expenses: [
      { id: `exp_${monthKey}_1`, title: 'Aylık Büyük Market (Metro)', amount: 5450, categoryId: 'market', personId: p1, date: `${monthKey}-01`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-01T10:00:00.000Z` },
      { id: `exp_${monthKey}_2`, title: 'Kasap & Şarküteri Alışverişi', amount: 2800, categoryId: 'kasap', personId: p2, date: `${monthKey}-02`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-02T10:00:00.000Z` },
      { id: `exp_${monthKey}_3`, title: 'Haftalık Semt Pazarı & Yeşillik', amount: 850, categoryId: 'pazar_manav', personId: p1, date: `${monthKey}-03`, paymentMethod: 'nakit', createdAt: `${monthKey}-03T10:00:00.000Z` },
      { id: `exp_${monthKey}_4`, title: 'Araç Benzin Dolumu (Opet)', amount: 2150, categoryId: 'ulasim', personId: p2, date: `${monthKey}-04`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-04T10:00:00.000Z` },
      { id: `exp_${monthKey}_5`, title: 'Eczane & Vitamin Takviyesi', amount: 920, categoryId: 'saglik', personId: p1, date: `${monthKey}-05`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-05T10:00:00.000Z` },
      { id: `exp_${monthKey}_6`, title: 'Aile Hafta Sonu Akşam Yemeği', amount: 2400, categoryId: 'yemek', personId: p2, date: `${monthKey}-06`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-06T10:00:00.000Z` },
      { id: `exp_${monthKey}_7`, title: 'Ev Temizlik & Yaşam Malzemeleri', amount: 1150, categoryId: 'ev_esya', personId: pHome, date: `${monthKey}-07`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-07T10:00:00.000Z` },
      { id: `exp_${monthKey}_8`, title: 'Haftalık Ara Market (Migros)', amount: 1850, categoryId: 'market', personId: p1, date: `${monthKey}-08`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-08T10:00:00.000Z` },
      { id: `exp_${monthKey}_9`, title: 'Üniversite Hazırlık & Kitaplar', amount: 1650, categoryId: 'egitim', personId: p3, date: `${monthKey}-10`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-10T10:00:00.000Z` },
      { id: `exp_${monthKey}_10`, title: 'Spor Salonu Aylık Fitness', amount: 2200, categoryId: 'saglik', personId: p3, date: `${monthKey}-12`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-12T10:00:00.000Z` },
      { id: `exp_${monthKey}_11`, title: 'Kedi Maması & Kum (Odin)', amount: 1350, categoryId: 'diger', personId: pHome, date: `${monthKey}-15`, paymentMethod: 'kredi_karti', note: 'Mama stoku yapıldı', createdAt: `${monthKey}-15T10:00:00.000Z` },
      { id: `exp_${monthKey}_12`, title: 'Dışarıda Kahve & Tatlı', amount: 680, categoryId: 'yemek', personId: p3, date: `${monthKey}-18`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-18T10:00:00.000Z` },
      { id: `exp_${monthKey}_13`, title: 'Kışlık Ayakkabı & Mont', amount: 3950, categoryId: 'giyim', personId: p2, date: `${monthKey}-20`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-20T10:00:00.000Z` },
      { id: `exp_${monthKey}_14`, title: 'Manav & Taze Meyve Alışverişi', amount: 550, categoryId: 'pazar_manav', personId: p1, date: `${monthKey}-24`, paymentMethod: 'nakit', createdAt: `${monthKey}-24T10:00:00.000Z` },
      { id: `exp_${monthKey}_15`, title: 'Araç Şehir İçi Yakıt', amount: 1900, categoryId: 'ulasim', personId: p2, date: `${monthKey}-28`, paymentMethod: 'kredi_karti', createdAt: `${monthKey}-28T10:00:00.000Z` },
    ],
  };
}

export function loadLocalMonth(monthKey: string): MonthlyBudget {
  if (typeof window === 'undefined') return getMockupMonthBudget(monthKey);

  try {
    const saved = localStorage.getItem(`${BUDGET_PREFIX}${monthKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Eğer mevcut ay boşsa otomatik zengin mockup ile başlat
      if (parsed && (!parsed.incomes || parsed.incomes.length === 0) && (!parsed.expenses || parsed.expenses.length === 0)) {
        const mock = getMockupMonthBudget(monthKey);
        saveLocalMonth(mock);
        return mock;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Yerel bütçe okunamadı:', err);
  }

  const initial = getMockupMonthBudget(monthKey);
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

// Bulut ile senkron yükleme (Maksimum 2.5 saniye zaman aşımlı, asla kilitlenmez)
export async function loadMonthWithCloud(monthKey: string): Promise<MonthlyBudget> {
  const local = loadLocalMonth(monthKey);

  // Arka planda Firebase'den çekip birleştir
  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    const remote = await Promise.race([fetchMonthFromFirebase(monthKey), timeoutPromise]);
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
