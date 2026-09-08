import React, { useState } from 'react';
import { MonthlyBudget, AppSettings } from '@/types/budget';
import { Target, TrendingUp, Sparkles, AlertCircle, CheckCircle2, Edit3, ShieldCheck, Compass, PiggyBank } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';
import { useI18n } from '@/context/I18nContext';

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
  const { t, formatMoney } = useI18n();
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

  const formatCurrency = (val: number) => formatMoney(val);

  return (
    <div className="space-y-5">
      
      {/* 1. ANA KART: Aylık Harcama Limiti & İlerleme Barı */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
        
        {/* Başlık & Tavan Hedef Düzenleme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{t('planner.title')}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('planner.subtitle')}</p>
            </div>
          </div>

          {/* Tavan Hedef Kutusu */}
          <div className="flex items-center gap-2">
            {isEditingLimit ? (
              <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 p-1 rounded-lg border border-emerald-500">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={limitInput}
                  onChange={e => setLimitInput(formatAmountInput(e.target.value))}
                  className="w-28 px-2 py-1 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-right text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveLimit}
                  className="px-2.5 py-1 bg-emerald-600 dark:bg-emerald-500 text-white rounded text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  {t('planner.saveBtn')}
                </button>
                <button
                  onClick={() => setIsEditingLimit(false)}
                  className="px-2 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs cursor-pointer"
                >
                  {t('planner.cancelBtn')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLimitInput(formatAmountInput(String(budgetLimit)));
                  setIsEditingLimit(true);
                }}
                className="group flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition cursor-pointer text-left"
                title={t('planner.editLimitTooltip')}
              >
                <div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-semibold block">{t('planner.ceilingTarget')}</span>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {formatCurrency(budgetLimit)}
                  </span>
                </div>
                <Edit3 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
              </button>
            )}
          </div>
        </div>

        {/* Büyük İlerleme Çubuğu ve Durum */}
        <div className="pt-4 space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {t('planner.spent')} <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{formatCurrency(totalExpense)}</strong>
            </span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] sm:text-xs ${
              totalExpense > budgetLimit
                ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                : expensePercentage >= 80
                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
            }`}>
              {t('planner.used').replace('{pct}', String(expensePercentage))}
            </span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {t('planner.remaining')} <strong className={remainingBudget >= 0 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                {formatCurrency(remainingBudget)}
              </strong>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5">
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
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 flex items-center gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>
                  <strong>{t('planner.alertExceeded')}</strong> {t('planner.alertExceededDesc').replace('{amount}', formatCurrency(Math.abs(remainingBudget)))}
                </span>
              </div>
            ) : expensePercentage >= 80 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>{t('planner.alertWarning').replace('{pct}', String(expensePercentage))}</strong> {t('planner.alertWarningDesc').replace('{amount}', formatCurrency(remainingBudget))}
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>{t('planner.alertGood')}</strong> {t('planner.alertGoodDesc')}
                </span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 2. KART: Günlük Harcama Pusulası (Finansal Zeka Rehberi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Günlük Harcama Limiti Pusulası */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wide">
              <Compass className="w-4 h-4" />
              <span>{t('planner.compassTitle')}</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {t('planner.compassDesc')}
            </p>
          </div>

          <div className="mt-4 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 block">
                {t('planner.compassForRemaining').replace('{days}', String(daysRemaining))}
              </span>
              <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400">
                ~{formatCurrency(dailySafeSpend)} <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400">{t('planner.compassPerDay')}</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
              🗓️
            </div>
          </div>
        </div>

        {/* Tasarruf & Birikim Kumbara Kartı */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide">
                <PiggyBank className="w-4 h-4" />
                <span>{t('planner.savingsGoalTitle')}</span>
              </div>

              {isEditingSavings ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={savingsInput}
                    onChange={e => setSavingsInput(formatAmountInput(e.target.value))}
                    className="w-20 px-1.5 py-0.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-emerald-500 rounded text-right text-zinc-900 dark:text-zinc-100"
                    autoFocus
                  />
                  <button onClick={handleSaveSavings} className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✓</button>
                  <button onClick={() => setIsEditingSavings(false)} className="text-xs text-zinc-400 dark:text-zinc-500">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSavingsInput(formatAmountInput(String(savingsTarget)));
                    setIsEditingSavings(true);
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>{savingsTarget > 0 ? formatCurrency(savingsTarget) : t('planner.setGoal')}</span>
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {t('planner.savingsGoalDesc')}
            </p>
          </div>

          <div className="mt-4 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 block">{t('planner.currentNetSavings')}</span>
              <span className={`text-2xl font-black ${netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {netBalance > 0 ? '+' : ''}{formatCurrency(netBalance)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block font-medium">{t('planner.savingsRate')}</span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {totalIncome > 0 && netBalance > 0 ? `%${Math.round((netBalance / totalIncome) * 100)}` : '%0'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
