'use client';

import React from 'react';
import { formatMonthDisplay, getAdjacentMonth } from '@/lib/storage';
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
} from 'lucide-react';

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

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
        
        {/* Sol: Logo & Bulut Durumu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-xs">
            ₺
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-zinc-900 leading-tight">Ev Muhasebesi</h1>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
              {isCloudConnected ? (
                <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                  <Cloud className="w-3 h-3" /> Bulut
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-zinc-400">
                  <CloudOff className="w-3 h-3" /> Yerel
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Orta: YALNIZCA Masaüstünde Sayfa Geçiş Sekmeleri (Mobilde zaten altta var) */}
        <nav className="hidden md:flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Anasayfa</span>
          </button>

          <button
            onClick={() => onViewChange('accounting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'accounting'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Muhasebe</span>
          </button>

          <button
            onClick={() => onViewChange('bills')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'bills'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Faturalar</span>
          </button>

          <button
            onClick={() => onViewChange('budget')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeView === 'budget'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bütçe</span>
          </button>
        </nav>

        {/* Sağ: Ay Seçici & Aksiyon Butonları */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Ay Değiştirici */}
          <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 sm:p-1 border border-zinc-200">
            <button
              onClick={handlePrevMonth}
              aria-label="Önceki Ay"
              className="p-1 sm:p-1.5 rounded-md hover:bg-white text-zinc-700 transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <span className="px-1.5 sm:px-2.5 text-xs sm:text-sm font-semibold text-zinc-800 min-w-[75px] sm:min-w-[100px] text-center select-none">
              {formatMonthDisplay(currentMonth)}
            </span>

            <button
              onClick={handleNextMonth}
              aria-label="Sonraki Ay"
              className="p-1 sm:p-1.5 rounded-md hover:bg-white text-zinc-700 transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={handleCurrentMonth}
              className="hidden lg:inline-block ml-1 text-xs px-2 py-0.5 text-emerald-700 hover:bg-white rounded font-medium transition cursor-pointer"
            >
              Bu Ay
            </button>
          </div>

          {/* Excel İndir (Yalnızca Anasayfada) */}
          {activeView === 'dashboard' && (
            <button
              onClick={onExportExcel}
              className="p-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer border border-zinc-200"
              title="Bu ayın dökümünü Excel dosyası olarak indir"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-600" />
              <span className="hidden sm:inline sm:ml-1.5">Excel</span>
            </button>
          )}

          {/* Ayarlar Butonu */}
          <button
            onClick={onOpenSettings}
            aria-label="Ayarlar"
            className="p-1.5 sm:p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition cursor-pointer border border-transparent hover:border-zinc-200"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
