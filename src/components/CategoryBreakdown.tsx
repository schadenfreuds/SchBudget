import React from 'react';
import { MonthlyBudget, Category, PersonId } from '@/types/budget';
import { PieChart, ArrowRight } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

interface CategoryBreakdownProps {
  budget: MonthlyBudget;
  categories: Category[];
  selectedPersonId: PersonId | 'all';
  onGoToAccounting?: () => void;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  budget,
  categories,
  selectedPersonId,
  onGoToAccounting,
}) => {
  const { t, formatMoney, translateCategory } = useI18n();

  // Sabit ve degisken harcamalari birlestir
  const allExpenses = [
    ...budget.expenses
      .filter(e => selectedPersonId === 'all' || e.personId === selectedPersonId)
      .map(e => ({ amount: Number(e.amount) || 0, categoryId: e.categoryId })),
    ...budget.fixedExpenses
      .filter(f => selectedPersonId === 'all' || f.personId === selectedPersonId)
      .map(f => ({ amount: Number(f.actualAmount || f.expectedAmount) || 0, categoryId: f.categoryId }))
  ];

  const totalSpent = allExpenses.reduce((s, e) => s + e.amount, 0);

  // Kategori bazli topla
  const categoryMap: Record<string, number> = {};
  allExpenses.forEach(e => {
    categoryMap[e.categoryId] = (categoryMap[e.categoryId] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryMap)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: cat ? translateCategory(cat) : 'Other',
        icon: cat?.icon || '📦',
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs transition-colors duration-200">
      
      {/* Baslik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{t('category.title')}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('summary.totalExpenseSub')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
            {t('category.totalSpent')}: {formatMoney(totalSpent)}
          </span>
          {onGoToAccounting && (
            <button
              onClick={onGoToAccounting}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Muhasebe Detayı</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {totalSpent === 0 ? (
        <div className="py-12 text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('category.noExpenses')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4">
          {sortedCategories.map(item => (
            <div key={item.id} className="p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition space-y-1.5 border border-zinc-100/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px]">
                    %{item.percentage.toFixed(1)}
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatMoney(item.amount)}
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(item.percentage, 2))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
