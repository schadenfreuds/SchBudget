'use client';

import React from 'react';
import { formatMonthDisplay, getAdjacentMonth } from '@/lib/storage';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Settings,
  TrendingUp,
  Cloud,
  CloudOff,
  Sparkles,
  LayoutDashboard,
  ReceiptText,
} from 'lucide-react';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  activeView: 'dashboard' | 'accounting';
  onViewChange: (view: 'dashboard' | 'accounting') => void;
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
  activeView,
  onViewChange,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Sol: Logo & Bulut Durumu & Sekme Geçişi */}
          <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 flex-wrap">
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

            {/* Sayfa Geçiş Sekmeleri (Anasayfa / Muhasebe) */}
            <nav className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
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
            </nav>
          </div>

          {/* Sağ: Ay Seçici & Aksiyon Butonları */}
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
            {/* Ay Değiştirici */}
            <div className="flex items-center bg-zinc-100 rounded-lg p-1 border border-zinc-200">
              <button
                onClick={handlePrevMonth}
                aria-label="Önceki Ay"
                className="p-1.5 rounded-md hover:bg-white text-zinc-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2.5 text-xs sm:text-sm font-semibold text-zinc-800 min-w-[100px] text-center select-none">
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
                className="hidden lg:inline-block ml-1 text-xs px-2 py-0.5 text-emerald-700 hover:bg-white rounded font-medium transition cursor-pointer"
              >
                Bu Ay
              </button>
            </div>

            {/* Örnek Veri (Demo Butonu) */}
            {onLoadMockup && (
              <button
                onClick={onLoadMockup}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition cursor-pointer border border-amber-200"
                title="Bu aya 1 aylık örnek bütçe verisi yükle"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Örnek Veri</span>
              </button>
            )}

            {/* Excel İndir */}
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer border border-zinc-200"
              title="Bu ayın dökümünü Excel dosyası olarak indir"
            >
              <Download className="w-4 h-4 text-zinc-600" />
              <span className="hidden sm:inline">Excel</span> İndir
            </button>

            {/* Muhasebe Görünümündeyse Hızlı Ekleme Butonları */}
            {activeView === 'accounting' && (
              <>
                <button
                  onClick={onOpenAddIncome}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer border border-emerald-200"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Gelir Ekle</span>
                </button>

                <button
                  onClick={onOpenAddExpense}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Harcama Ekle</span>
                </button>
              </>
            )}

            {/* Ayarlar Butonu */}
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
