'use client';

import React from 'react';
import { MonthlyBudget, Person, PersonId } from '@/types/budget';
import { ArrowDownRight, ArrowUpRight, Wallet, CheckCircle2, Clock, CreditCard, Banknote } from 'lucide-react';

interface SummaryCardsProps {
  budget: MonthlyBudget;
  persons: Person[];
  selectedPersonId: PersonId | 'all';
  onSelectPerson: (personId: PersonId | 'all') => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  budget,
  persons,
  selectedPersonId,
  onSelectPerson,
}) => {
  // Hesaplamalar
  const totalIncome = budget.incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const fixedPaid = budget.fixedExpenses
    .filter(f => f.isPaid)
    .reduce((s, f) => s + (Number(f.actualAmount || f.expectedAmount) || 0), 0);

  const fixedPending = budget.fixedExpenses
    .filter(f => !f.isPaid)
    .reduce((s, f) => s + (Number(f.actualAmount || f.expectedAmount) || 0), 0);

  const fixedTotal = fixedPaid + fixedPending;

  const variableTotal = budget.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const totalExpense = fixedTotal + variableTotal;
  const netBalance = totalIncome - totalExpense;

  // Kredi Kartı vs Nakit Ayrımı
  const creditCardTotal = budget.expenses
    .filter(e => (e.paymentMethod || 'kredi_karti') === 'kredi_karti')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const cashTotal = budget.expenses
    .filter(e => e.paymentMethod === 'nakit' || e.paymentMethod === 'havale')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const cardPct = variableTotal > 0 ? Math.round((creditCardTotal / variableTotal) * 100) : 0;
  const cashPct = variableTotal > 0 ? 100 - cardPct : 0;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ₺';
  };

  return (
    <div className="space-y-4">
      {/* 3 Ana Finansal Özet Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Toplam Gelir */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Toplam Gelir</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100" suppressHydrationWarning>
            {formatCurrency(totalIncome)}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
            {budget.incomes.length > 0 ? `${budget.incomes.length} gelir kaydı` : 'Henüz gelir girilmedi'}
          </p>
        </div>

        {/* Toplam Gider */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Toplam Gider</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100" suppressHydrationWarning>
            {formatCurrency(totalExpense)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
            <span>Sabit: {formatCurrency(fixedTotal)}</span>
            <span>•</span>
            <span>Günlük: {formatCurrency(variableTotal)}</span>
          </div>
        </div>

        {/* Kalan Net Bütçe */}
        <div className={`rounded-xl p-4 border shadow-xs relative overflow-hidden ${
          netBalance >= 0 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-600' 
            : 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-600'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Kalan Net Bütçe</span>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight" suppressHydrationWarning>
            {formatCurrency(netBalance)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-white/90">
            {fixedPending > 0 ? (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatCurrency(fixedPending)} bekleyen fatura var
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tüm sabit faturalar ödendi
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Kredi Kartı vs. Nakit Harcama Dağılım Şeridi */}
      {variableTotal > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3.5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                Harcama Ödeme Kanalları
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-medium">
              <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                Kart: <strong className="font-bold">{formatCurrency(creditCardTotal)}</strong> ({cardPct}%)
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Nakit: <strong className="font-bold">{formatCurrency(cashTotal)}</strong> ({cashPct}%)
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-indigo-500 h-2 transition-all duration-300"
              style={{ width: `${cardPct}%` }}
              title={`Kredi Kartı: %${cardPct}`}
            />
            <div
              className="bg-emerald-500 h-2 transition-all duration-300"
              style={{ width: `${cashPct}%` }}
              title={`Nakit / Banka: %${cashPct}`}
            />
          </div>
        </div>
      )}

      {/* Kişi Bazlı Dağılım Kartları */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Kişi Bazlı Harcamalar</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal hidden sm:inline">(Filtrelemek için tıkla)</span>
          </div>
          {selectedPersonId !== 'all' && (
            <button
              onClick={() => onSelectPerson('all')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              Tümünü Göster
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {persons.map(person => {
            const pVar = budget.expenses
              .filter(e => e.personId === person.id)
              .reduce((s, e) => s + (Number(e.amount) || 0), 0);

            const pFixed = budget.fixedExpenses
              .filter(f => f.personId === person.id)
              .reduce((s, f) => s + (Number(f.actualAmount || f.expectedAmount) || 0), 0);

            const pTotal = pVar + pFixed;
            const isSelected = selectedPersonId === person.id;

            return (
              <button
                key={person.id}
                onClick={() => onSelectPerson(isSelected ? 'all' : person.id)}
                className={`p-2.5 sm:p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-400/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/70'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base">{person.avatar}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 truncate max-w-[80px]">
                    {person.role || person.name}
                  </span>
                </div>
                <div className="mt-2 min-w-0">
                  <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">{person.name}</div>
                  <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
                    {formatCurrency(pTotal)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
