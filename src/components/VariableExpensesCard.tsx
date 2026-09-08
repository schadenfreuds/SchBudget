'use client';

import React, { useState } from 'react';
import { ExpenseItem, Person, Category, PersonId } from '@/types/budget';
import { Search, Trash2, CreditCard, Banknote, ShoppingBag } from 'lucide-react';

interface VariableExpensesCardProps {
  expenses: ExpenseItem[];
  persons: Person[];
  categories: Category[];
  selectedPersonId: PersonId | 'all';
  onDeleteExpense: (id: string) => void;
  onOpenAddExpense: () => void;
}

export const VariableExpensesCard: React.FC<VariableExpensesCardProps> = ({
  expenses,
  persons,
  categories,
  selectedPersonId,
  onDeleteExpense,
  onOpenAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtreleme
  const filtered = expenses
    .filter(e => {
      if (selectedPersonId !== 'all' && e.personId !== selectedPersonId) return false;
      if (selectedCategory !== 'all' && e.categoryId !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(term);
        const matchNote = e.note?.toLowerCase().includes(term);
        return matchTitle || matchNote;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalFiltered = filtered.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const getPerson = (id: string) => persons.find(p => p.id === id);
  const getCategory = (id: string) => categories.find(c => c.id === id);

  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col h-full">
      
      {/* Kart Başlığı ve Arama / Filtreler */}
      <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900">Günlük & Değişken Harcamalar</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 font-semibold text-zinc-700">
                {filtered.length} kayıt
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Toplam Harcama: <strong className="text-zinc-800">{totalFiltered.toLocaleString('tr-TR')} ₺</strong>
            </p>
          </div>

          <button
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
          >
            <span>+ Harcama Ekle</span>
          </button>
        </div>

        {/* Arama ve Kategori Filtresi */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Harcama ara (Migros, benzin, eczane...)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[480px] p-1 flex-1">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 mb-2">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Bu kriterde harcama bulunamadı.</p>
            <button
              onClick={onOpenAddExpense}
              className="mt-2 text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              Hemen yeni bir harcama ekle
            </button>
          </div>
        ) : (
          filtered.map(expense => {
            const person = getPerson(expense.personId);
            const category = getCategory(expense.categoryId);

            return (
              <div
                key={expense.id}
                className="p-3 rounded-lg flex items-center justify-between gap-3 hover:bg-zinc-50 transition"
              >
                {/* Sol: İkon + Başlık + Kişi + Tarih */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-base shrink-0">
                    {category?.icon || '🛒'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-zinc-900 truncate">
                        {expense.title}
                      </span>
                      {expense.note && (
                        <span className="text-xs text-zinc-400 truncate max-w-[120px]" title={expense.note}>
                          ({expense.note})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                      <span className="font-medium text-zinc-600">
                        {formatDateLabel(expense.date)}
                      </span>
                      <span>•</span>
                      {person && (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded font-medium border text-[10px] ${person.color}`}>
                          <span>{person.avatar}</span>
                          <span>{person.name}</span>
                        </span>
                      )}
                      <span>•</span>
                      <span className="text-zinc-500">
                        {category?.name || 'Diğer'}
                      </span>
                      {expense.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-zinc-400">
                            {expense.paymentMethod === 'kredi_karti' ? (
                              <CreditCard className="w-3 h-3" />
                            ) : (
                              <Banknote className="w-3 h-3" />
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ: Tutar + Sil butonu */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-sm font-bold text-zinc-900">
                    {Number(expense.amount).toLocaleString('tr-TR')} ₺
                  </span>

                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    className="text-zinc-300 hover:text-rose-500 transition p-1 cursor-pointer"
                    title="Harcamayı sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
