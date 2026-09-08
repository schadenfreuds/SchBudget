'use client';

import React, { useState } from 'react';
import { MonthlyBudget, AppSettings } from '@/types/budget';
import { Target, TrendingUp, Sparkles, AlertCircle, CheckCircle2, Edit3, ShieldCheck, Compass, PiggyBank } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';

interface BudgetPlannerCardProps {
  budget: MonthlyBudget;
  settings: AppSettings;
  onUpdateBudgetLimit: (limit: number) => void;
  onUpdateSavingsTarget: (target: number) => void;
}

export const BudgetPlannerCard: React.FC<BudgetPlannerCardProps> = ({
  budget,
  settings,
  onUpdateBudgetLimit,
  onUpdateSavingsTarget,
}) => {
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState('');

  const [isEditingSavings, setIsEditingSavings] = useState(false);
  const [savingsInput, setSavingsInput] = useState('');

  // Toplam Gelir
  const totalIncome = budget.incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  // Toplam Gider (Sabit + Değişken)
  const fixedTotal = budget.fixedExpenses.reduce((s, f) => s + (Number(f.actualAmount || f.expectedAmount) || 0), 0);
  const variableTotal = budget.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalExpense = fixedTotal + variableTotal;

  // Net Durum
  const netBalance = totalIncome - totalExpense;

  // Hedef Bütçe Limiti (Varsayılan yoksa gelirin %80'i veya 50.000 ₺)
  const budgetLimit = budget.budgetLimit || (totalIncome > 0 ? Math.round(totalIncome * 0.85) : 50000);
  const savingsTarget = budget.savingsTarget || 0;

  // İlerleme & Yüzde
  const expensePercentage = budgetLimit > 0 ? Math.min(Math.round((totalExpense / budgetLimit) * 100), 150) : 0;
  const remainingBudget = budgetLimit - totalExpense;

  // Ayın gün hesaplaması (Günlük harcama pusulası)
  const now = new Date();
  const year = parseInt(budget.monthKey.split('-')[0], 10);
  const month = parseInt(budget.monthKey.split('-')[1], 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(daysInMonth - currentDay + 1, 1);

  // Kalan gün başına serbest harcama
  const dailySafeSpend = remainingBudget > 0 ? Math.round(remainingBudget / daysRemaining) : 0;

  const handleSaveLimit = () => {
    const parsed = parseFormattedAmount(limitInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudgetLimit(parsed);
    }
    setIsEditingLimit(false);
  };

  const handleSaveSavings = () => {
    const parsed = parseFormattedAmount(savingsInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateSavingsTarget(parsed);
    }
    setIsEditingSavings(false);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('tr-TR') + ' ₺';
  };

  return (
    <div className="space-y-5">
      
      {/* 1. ANA KART: Aylık Harcama Limiti & İlerleme Barı */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
        
        {/* Başlık & Tavan Hedef Düzenleme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Aylık Harcama Limiti & Hedef Bütçe</h2>
              <p className="text-xs text-zinc-500">Bu ay için koyduğunuz tavan harcama sınırı</p>
            </div>
          </div>

          {/* Tavan Hedef Kutusu */}
          <div className="flex items-center gap-2">
            {isEditingLimit ? (
              <div className="flex items-center gap-1.5 bg-zinc-50 p-1 rounded-lg border border-emerald-500">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={limitInput}
                  onChange={e => setLimitInput(formatAmountInput(e.target.value))}
                  className="w-28 px-2 py-1 text-xs font-bold bg-white border border-zinc-300 rounded text-right focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveLimit}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setIsEditingLimit(false)}
                  className="px-2 py-1 text-zinc-500 hover:text-zinc-800 text-xs cursor-pointer"
                >
                  İptal
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLimitInput(formatAmountInput(String(budgetLimit)));
                  setIsEditingLimit(true);
                }}
                className="group flex items-center gap-2 px-3 py-1.5 bg-zinc-50 hover:bg-emerald-50 rounded-lg border border-zinc-200 hover:border-emerald-300 transition cursor-pointer text-left"
                title="Bütçe limitini değiştirmek için tıkla"
              >
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Tavan Hedef</span>
                  <span className="text-sm font-extrabold text-zinc-900 group-hover:text-emerald-700">
                    {formatCurrency(budgetLimit)}
                  </span>
                </div>
                <Edit3 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 transition" />
              </button>
            )}
          </div>
        </div>

        {/* Büyük İlerleme Çubuğu ve Durum */}
        <div className="pt-4 space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-zinc-700">
              Harcanan: <strong className="text-zinc-900 font-bold">{formatCurrency(totalExpense)}</strong>
            </span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] sm:text-xs ${
              totalExpense > budgetLimit
                ? 'bg-rose-100 text-rose-800'
                : expensePercentage >= 80
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              %{expensePercentage} Kullanıldı
            </span>
            <span className="font-semibold text-zinc-700">
              Kalan Serbest: <strong className={remainingBudget >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                {formatCurrency(remainingBudget)}
              </strong>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                totalExpense > budgetLimit
                  ? 'bg-rose-500'
                  : expensePercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(expensePercentage, 100)}%` }}
            />
          </div>

          {/* Durum Mesajı */}
          <div className="pt-1">
            {totalExpense > budgetLimit ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Bütçe Limiti Aşıldı!</strong> Belirlediğiniz tavan hedefi {formatCurrency(Math.abs(remainingBudget))} aştınız. Zorunlu olmayan harcamaları ertelemeniz tavsiye edilir.
                </span>
              </div>
            ) : expensePercentage >= 80 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Dikkat: Bütçenin %{expensePercentage}&apos;i harcandı.</strong> Ay sonuna kadar serbest kalan limitiniz {formatCurrency(remainingBudget)}.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Harika Gidiyorsunuz!</strong> Harcamalarınız bütçe hedefinin çok altında, plan dahilinde ilerliyorsunuz.
                </span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 2. KART: Günlük Harcama Pusulası (Finansal Zeka Rehberi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Günlük Harcama Limiti Pusulası */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wide">
              <Compass className="w-4 h-4" />
              <span>Günlük Harcama Pusulası</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Ay sonuna kadar bütçeyi aşmamak için önerilen günlük maksimum harcama
            </p>
          </div>

          <div className="mt-4 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-indigo-900 block">Kalan {daysRemaining} Gün İçin:</span>
              <span className="text-2xl font-black text-indigo-700">
                ~{dailySafeSpend.toLocaleString('tr-TR')} ₺ <span className="text-xs font-normal text-indigo-600">/ gün</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              🗓️
            </div>
          </div>
        </div>

        {/* Tasarruf & Birikim Kumbara Kartı */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wide">
                <PiggyBank className="w-4 h-4" />
                <span>Aylık Tasarruf Hedefi</span>
              </div>

              {isEditingSavings ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={savingsInput}
                    onChange={e => setSavingsInput(formatAmountInput(e.target.value))}
                    className="w-20 px-1.5 py-0.5 text-xs font-bold border border-emerald-500 rounded text-right"
                    autoFocus
                  />
                  <button onClick={handleSaveSavings} className="text-xs font-bold text-emerald-600">✓</button>
                  <button onClick={() => setIsEditingSavings(false)} className="text-xs text-zinc-400">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSavingsInput(formatAmountInput(String(savingsTarget)));
                    setIsEditingSavings(true);
                  }}
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>{savingsTarget > 0 ? formatCurrency(savingsTarget) : 'Hedef Belirle'}</span>
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Gelirlerden tüm giderler çıktıktan sonra elde kalan net tasarruf
            </p>
          </div>

          <div className="mt-4 p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-900 block">Şu Anki Net Tasarruf:</span>
              <span className={`text-2xl font-black ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {netBalance > 0 ? '+' : ''}{formatCurrency(netBalance)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block font-medium">Tasarruf Oranı</span>
              <span className="text-sm font-bold text-emerald-700">
                {totalIncome > 0 && netBalance > 0 ? `%${Math.round((netBalance / totalIncome) * 100)}` : '%0'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
