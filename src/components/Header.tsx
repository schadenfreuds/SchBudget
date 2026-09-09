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
  LayoutGrid,
  Dumbbell,
  GraduationCap,
  Brain,
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
  const { t, formatMonth, currencySymbol, lang } = useI18n();

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
  const [isSuiteOpen, setIsSuiteOpen] = React.useState(false);
  const suiteMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsDark(isDarkModeActive());
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suiteMenuRef.current && !suiteMenuRef.current.contains(e.target as Node)) {
        setIsSuiteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setIsDark(next === 'dark');
  };

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
        
        {/* Sol: Logo & Bulut Durumu */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <img
            src="/icon.svg"
            alt="SchBudget"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-xs shrink-0 object-contain"
          />
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                <span className="text-emerald-600 dark:text-emerald-400 font-black">Sch</span>Budget
              </h1>
              <span className="text-[9px] font-extrabold font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tracking-wider">
                SUITE
              </span>
            </div>
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

          {/* Sch Suite Menüsü */}
          <div className="relative" ref={suiteMenuRef}>
            <button
              onClick={() => setIsSuiteOpen(!isSuiteOpen)}
              aria-label="The Sch Suite"
              title="The Sch Suite"
              className={`p-1.5 sm:p-2 rounded-lg transition cursor-pointer border ${
                isSuiteOpen
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            {isSuiteOpen && (
              <div className="absolute right-0 mt-2 w-72 p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="text-xs font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">Sch</span> Suite
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">CanOS Ecosystem</span>
                </div>

                <div className="space-y-1.5">
                  {/* SchBudget */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        💰
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                          <span>SchBudget</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {lang === 'en' ? 'Family & Home Accounting' : 'Ev & Bütçe Muhasebesi'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                      {lang === 'en' ? 'Active' : 'Aktif'}
                    </span>
                  </div>

                  {/* SchFit */}
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent transition">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                        <Dumbbell className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          SchFit
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {lang === 'en' ? 'Workout & Body Goal' : 'Fitness & Kilo Takibi'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono">
                      {lang === 'en' ? 'Next' : 'Sırada'}
                    </span>
                  </div>

                  {/* SchStudy */}
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent transition">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          SchStudy
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {lang === 'en' ? 'Exam & Focus Tracker' : 'Deneme & Odak Sayacı'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-mono">
                      Concept
                    </span>
                  </div>

                  {/* SchBrain */}
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent transition">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                        <Brain className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          SchBrain
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {lang === 'en' ? 'Companion & Notes' : 'CanOS Hızlı Not & Günlük'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-mono">
                      Concept
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-center text-zinc-400 dark:text-zinc-500">
                  {lang === 'en' ? 'Unified Personal Productivity Suite' : 'CanOS Kişisel Ürün Ekosistemi'}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
