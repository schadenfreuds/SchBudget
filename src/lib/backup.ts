import { AppSettings, MonthlyBudget } from '@/types/budget';
import { loadSettings, saveSettings } from './storage';

export interface FullBackupData {
  version: number;
  exportedAt: string;
  settings: AppSettings;
  months: Record<string, MonthlyBudget>;
}

export function generateFullBackup(): FullBackupData {
  const settings = loadSettings();
  const months: Record<string, MonthlyBudget> = {};

  if (typeof window !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('aile_butcesi_month_')) {
        const monthKey = key.replace('aile_butcesi_month_', '');
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            months[monthKey] = JSON.parse(raw);
          }
        } catch (e) {
          console.error(`Yedeklenirken hata oluştu (${key}):`, e);
        }
      }
    }
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    months,
  };
}

export function downloadBackupFile(): void {
  const data = generateFullBackup();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `aile-butcesi-yedek-${today}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function restoreBackupFile(jsonString: string): { success: boolean; error?: string; count?: number } {
  try {
    const data = JSON.parse(jsonString) as FullBackupData;

    if (!data.settings || !data.months) {
      return { success: false, error: 'Geçersiz yedek dosyası formatı. (settings veya months eksik)' };
    }

    // Ayarları geri yükle
    saveSettings(data.settings);

    // Aylık bütçeleri geri yükle
    let count = 0;
    Object.entries(data.months).forEach(([monthKey, budget]) => {
      localStorage.setItem(`aile_butcesi_month_${monthKey}`, JSON.stringify(budget));
      count++;
    });

    return { success: true, count };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.' };
  }
}

export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('aile_butcesi_month_') || key === 'aile_butcesi_settings')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
