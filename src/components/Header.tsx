'use client';

import React from 'react';
import { formatMonthDisplay, getAdjacentMonth } from '@/lib/storage';
import { ChevronLeft, ChevronRight, Download, Plus, Settings, TrendingUp, Cloud, CloudOff, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenSettings: () => void;
  onExportExcel: () => void;
  onLoadMockup?: () => void;
  isCloudConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenSettings,
  onExportExcel,
  onLoadMockup,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Logo & Dönem Seçici */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                ₺
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-900 leading-tight">Ev Muhasebesi</h1>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  {isCloudConnected ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Cloud className="w-3.5 h-3.5" /> Bulut Aktif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-zinc-400">
                      <CloudOff className="w-3.5 h-3.5" /> Yerel Hafıza
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ay Değiştirici */}
            <div className="flex items-center bg-zinc-100 rounded-lg p-1 border border-zinc-200">
              <button
                onClick={handlePrevMonth}
                aria-label="Önceki Ay"
                className="p-1.5 rounded-md hover:bg-white text-zinc-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 text-sm font-semibold text-zinc-800 min-w-[110px] text-center select-none">
                {formatMonthDisplay(currentMonth)}
              </span>

              <button
                onClick={handleNextMonth}
                aria-label="Sonraki Ay"
                className="p-1.5 rounded-md hover:bg-white text-zinc-700 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleCurrentMonth}
                className="hidden md:inline-block ml-1 text-xs px-2 py-1 text-emerald-700 hover:bg-white rounded font-medium transition cursor-pointer"
              >
                Bu Ay
              </button>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center justify-end gap-2">
            {onLoadMockup && (
              <button
                onClick={onLoadMockup}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition cursor-pointer border border-amber-200"
                title="Bu aya 1 aylık gerçekçi örnek bütçe verisi yükle"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Örnek Veri</span>
              </button>
            )}

            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer border border-zinc-200"
              title="Bu ayın dökümünü Excel dosyası olarak indir"
            >
              <Download className="w-4 h-4 text-zinc-600" />
              <span className="hidden sm:inline">Excel</span> İndir
            </button>

            <button
              onClick={onOpenAddIncome}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer border border-emerald-200"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Gelir Ekle</span>
            </button>

            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Harcama Ekle</span>
            </button>

            <button
              onClick={onOpenSettings}
              aria-label="Ayarlar"
              className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition cursor-pointer border border-transparent hover:border-zinc-200"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
