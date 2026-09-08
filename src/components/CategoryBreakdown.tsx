'use client';

import React from 'react';
import { MonthlyBudget, Category, PersonId } from '@/types/budget';
import { PieChart } from 'lucide-react';

interface CategoryBreakdownProps {
  budget: MonthlyBudget;
  categories: Category[];
  selectedPersonId: PersonId | 'all';
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  budget,
  categories,
  selectedPersonId,
}) => {
  // Sabit ve değişken harcamaları birleştir
  const allExpenses = [
    ...budget.expenses
      .filter(e => selectedPersonId === 'all' || e.personId === selectedPersonId)
      .map(e => ({ amount: Number(e.amount) || 0, categoryId: e.categoryId })),
    ...budget.fixedExpenses
      .filter(f => selectedPersonId === 'all' || f.personId === selectedPersonId)
      .map(f => ({ amount: Number(f.actualAmount || f.expectedAmount) || 0, categoryId: f.categoryId }))
  ];

  const totalSpent = allExpenses.reduce((s, e) => s + e.amount, 0);

  // Kategori bazlı topla
  const categoryMap: Record<string, number> = {};
  allExpenses.forEach(e => {
    categoryMap[e.categoryId] = (categoryMap[e.categoryId] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryMap)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Diğer',
        icon: cat?.icon || '📦',
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  if (totalSpent === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-zinc-900">Nereye Ne Kadar Harcadık?</h3>
        </div>
        <span className="text-xs text-zinc-500 font-medium">
          Toplam: {totalSpent.toLocaleString('tr-TR')} ₺
        </span>
      </div>

      <div className="space-y-2.5">
        {sortedCategories.slice(0, 6).map(item => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-zinc-700 truncate">
                <span>{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </span>
              <span className="font-bold text-zinc-900 shrink-0 ml-2">
                {item.amount.toLocaleString('tr-TR')} ₺ ({item.percentage.toFixed(0)}%)
              </span>
            </div>
            
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
