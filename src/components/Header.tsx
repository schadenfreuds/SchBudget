import React from 'react';
import { getAdjacentMonth } from '@/lib/storage';
import { useI18n } from '@/context/I18nContext';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Settings,
  Cloud,
  CloudOff,
  LayoutDashboard,
  ReceiptText,
  CalendarCheck,
  Target,
  Sun,
  Moon,
} from 'lucide-react';
import { toggleTheme, isDarkModeActive } from '@/lib/theme';

export type AppView = 'dashboard' | 'accounting' | 'bills' | 'budget';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenSettings: () => void;
  onExportExcel: () => void;
  isCloudConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  activeView,
  onViewChange,
  onOpenSettings,
  onExportExcel,
  isCloudConnected,
}) => {
  const { t, formatMonth, currencySymbol } = useI18n();

  const handlePrevMonth = () => {
    onMonthChange(getAdjacentMonth(currentMonth, -1));
  };

  const handleNextMonth = () => {
    onMonthChange(getAdjacentMonth(currentMonth, 1));
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  };

  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(isDarkModeActive());
  }, []);

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setIsDark(next === 'dark');
  };

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
        
        {/* Sol: Logo & Bulut Durumu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-xs">
            {currencySymbol}
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              <span className="text-emerald-600 dark:text-emerald-400 font-black">Sch</span>Budget
            </h1>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
              {isCloudConnected ? (
                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Cloud className="w-3 h-3" /> {t('cloud')}
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-zinc-400 dark:text-zinc-500">
                  <CloudOff className="w-3 h-3" /> {t('local')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Orta: YALNIZCA Masaüstünde Sayfa Geçiş Sekmeleri (Mobilde zaten altta var) */}
        <nav className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.dashboard')}</span>
          </button>

          <button
            onClick={() => onViewChange('accounting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'accounting'
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.accounting')}</span>
          </button>

          <button
            onClick={() => onViewChange('bills')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'bills'
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.bills')}</span>
          </button>

          <button
            onClick={() => onViewChange('budget')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'budget'
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.budget')}</span>
          </button>
        </nav>

        {/* Sağ: Ay Seçici & Aksiyon Butonları */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Ay Değiştirici */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 sm:p-1 border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={handlePrevMonth}
              aria-label="Önceki Ay"
              className="p-1 sm:p-1.5 rounded-md hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <span className="px-1.5 sm:px-2.5 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 min-w-[75px] sm:min-w-[100px] text-center select-none">
              {formatMonth(currentMonth)}
            </span>

            <button
              onClick={handleNextMonth}
              aria-label="Sonraki Ay"
              className="p-1 sm:p-1.5 rounded-md hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={handleCurrentMonth}
              className="hidden lg:inline-block ml-1 text-xs px-2 py-0.5 text-emerald-700 dark:text-emerald-400 hover:bg-white dark:hover:bg-zinc-700 rounded font-medium transition cursor-pointer"
            >
              {t('thisMonth')}
            </button>
          </div>

          {/* Excel İndir (Yalnızca Anasayfada) */}
          {activeView === 'dashboard' && (
            <button
              onClick={onExportExcel}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition cursor-pointer border border-zinc-200 dark:border-zinc-700 whitespace-nowrap"
              title="Excel"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-600 dark:text-zinc-300 shrink-0" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          )}


          {/* Tema Değiştirici (Koyu / Açık Mod) */}
          <button
            onClick={handleToggleTheme}
            aria-label={isDark ? "Açık Moda Geç" : "Koyu Moda Geç"}
            title={isDark ? "Açık Moda Geç" : "Koyu Moda Geç"}
            className="p-1.5 sm:p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Ayarlar Butonu */}
          <button
            onClick={onOpenSettings}
            aria-label="Ayarlar"
            className="p-1.5 sm:p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
