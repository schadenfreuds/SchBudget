'use client';

import React, { useState } from 'react';
import { FixedExpenseItem, Person, Category, PersonId } from '@/types/budget';
import { Check, Clock, Plus, Trash2, Edit3, Calendar, Edit2 } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';

interface FixedExpensesCardProps {
  fixedExpenses: FixedExpenseItem[];
  persons: Person[];
  categories: Category[];
  selectedPersonId: PersonId | 'all';
  onTogglePaid: (id: string) => void;
  onUpdateAmount: (id: string, newAmount: number) => void;
  onDeleteExpense: (id: string) => void;
  onAddFixedExpense: (item: Omit<FixedExpenseItem, 'id' | 'isPaid'>) => void;
  onEditFixedExpense: (item: FixedExpenseItem) => void;
}

export const FixedExpensesCard: React.FC<FixedExpensesCardProps> = ({
  fixedExpenses,
  persons,
  categories,
  selectedPersonId,
  onTogglePaid,
  onUpdateAmount,
  onDeleteExpense,
  onAddFixedExpense,
  onEditFixedExpense,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPerson, setNewPerson] = useState<PersonId>('ortak');
  const [newCategory, setNewCategory] = useState('fatura');
  const [newDueDate, setNewDueDate] = useState('');

  // Inline tutar düzenleme
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmountVal, setEditAmountVal] = useState('');

  // Filtreleme
  const filteredList = fixedExpenses.filter(f => {
    if (selectedPersonId === 'all') return true;
    return f.personId === selectedPersonId;
  });

  const paidCount = filteredList.filter(f => f.isPaid).length;
  const totalCount = filteredList.length;
  const totalAmount = filteredList.reduce((s, f) => s + (Number(f.actualAmount || f.expectedAmount) || 0), 0);
  const paidAmount = filteredList.filter(f => f.isPaid).reduce((s, f) => s + (Number(f.actualAmount || f.expectedAmount) || 0), 0);

  const getPerson = (id: string) => persons.find(p => p.id === id);
  const getCategory = (id: string) => categories.find(c => c.id === id);

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFormattedAmount(newAmount);
    if (!newTitle.trim() || parsed <= 0) return;

    onAddFixedExpense({
      title: newTitle.trim(),
      expectedAmount: parsed,
      actualAmount: parsed,
      categoryId: newCategory,
      personId: newPerson,
      dueDate: newDueDate ? (parseInt(newDueDate, 10) || undefined) : undefined,
    });

    setNewTitle('');
    setNewAmount('');
    setNewDueDate('');
    setIsAdding(false);
  };

  const startEditAmount = (item: FixedExpenseItem) => {
    setEditingId(item.id);
    const current = item.actualAmount || item.expectedAmount || 0;
    setEditAmountVal(formatAmountInput(String(current)));
  };

  const saveEditAmount = (id: string) => {
    const val = parseFormattedAmount(editAmountVal);
    if (!isNaN(val) && val >= 0) {
      onUpdateAmount(id, val);
    }
    setEditingId(null);
  };

  const renderDueDateBadge = (item: FixedExpenseItem) => {
    if (item.isPaid) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          ✓ Ödendi
        </span>
      );
    }
    if (!item.dueDate) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <Clock className="w-2.5 h-2.5" /> Bekliyor
        </span>
      );
    }

    const today = new Date().getDate();
    const diff = item.dueDate - today;

    if (diff < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-300">
          🚨 {Math.abs(diff)} gün gecikti!
        </span>
      );
    } else if (diff === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
          ⚠️ Bugün son gün!
        </span>
      );
    } else if (diff <= 3) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          ⏳ {diff} gün kaldı
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
          🗓️ Ayın {item.dueDate}&apos;si
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col h-full">
      
      {/* Kart Başlığı */}
      <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900">Sabit Giderler & Faturalar</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 font-semibold text-zinc-700">
              {paidCount}/{totalCount}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ödenen: {paidAmount.toLocaleString('tr-TR')} ₺ / Toplam: {totalAmount.toLocaleString('tr-TR')} ₺
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Fatura Ekle</span>
        </button>
      </div>

      {/* İlerleme Çubuğu */}
      <div className="w-full bg-zinc-100 h-1.5">
        <div
          className="bg-emerald-500 h-1.5 transition-all duration-300"
          style={{ width: `${totalCount > 0 ? (paidCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      {/* Yeni Fatura Ekleme Formu (Açılırsa) */}
      {isAdding && (
        <form onSubmit={handleSaveNew} className="p-4 bg-zinc-50 border-b border-zinc-200 space-y-3 text-xs">
          <div className="font-bold text-zinc-900 text-sm">Yeni Sabit Gider / Fatura Ekle</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Fatura / Gider Adı *
              </label>
              <input
                type="text"
                placeholder="Örn: Elektrik, Su, Ev Kirası"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Aylık Beklenen Tutar (₺) *
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={newAmount}
                onChange={e => setNewAmount(formatAmountInput(e.target.value))}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Sorumlu Kişi
              </label>
              <select
                value={newPerson}
                onChange={e => setNewPerson(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 rounded-lg bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {persons.map(p => (
                  <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Kategori
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 rounded-lg bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Ödeme Günü
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Örn: 15 (İsteğe bağlı)"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 rounded border border-zinc-300 text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition cursor-pointer"
            >
              Ekle
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[480px] p-1 flex-1">
        {filteredList.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            Bu kriterde sabit gider bulunamadı.
          </div>
        ) : (
          filteredList.map((item) => {
            const person = getPerson(item.personId);
            const category = getCategory(item.categoryId);
            const amount = item.actualAmount || item.expectedAmount || 0;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg flex items-center justify-between gap-3 transition group ${
                  item.isPaid ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-zinc-50'
                }`}
              >
                {/* Sol: Onay kutusu + Bilgi */}
                <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => onTogglePaid(item.id)}
                    aria-label={item.isPaid ? 'Ödendi olarak işaretlendi, geri al' : 'Ödendi olarak işaretle'}
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition cursor-pointer shrink-0 border mt-0.5 sm:mt-0 ${
                      item.isPaid
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'border-zinc-300 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    {item.isPaid && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs sm:text-sm font-semibold truncate ${item.isPaid ? 'text-zinc-600 line-through' : 'text-zinc-900'}`}>
                        {item.title}
                      </span>
                      {category && (
                        <span className="text-xs text-zinc-400" title={category.name}>
                          {category.icon}
                        </span>
                      )}
                      <span className="sm:hidden inline-block">
                        {renderDueDateBadge(item)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 flex-wrap">
                      {person && (
                        <span className="inline-flex items-center gap-1">
                          <span>{person.avatar}</span>
                          <span className="text-zinc-600">{person.name}</span>
                        </span>
                      )}
                      {item.note && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-400 italic truncate max-w-[120px]">
                            {item.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ: Tutar + (Masaüstünde Vade) + Düzenle & Sil */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-1">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={editAmountVal}
                        onChange={e => setEditAmountVal(formatAmountInput(e.target.value))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEditAmount(item.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-20 sm:w-24 px-1.5 py-0.5 border border-emerald-500 rounded text-xs font-bold text-right"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditAmount(item.id)}
                        className="text-xs font-bold text-emerald-600 hover:underline px-1 cursor-pointer"
                      >
                        Tamam
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditAmount(item)}
                      title="Tutarı hızlıca değiştirmek için tıkla"
                      className="group/btn flex items-center gap-1 text-right cursor-pointer"
                    >
                      <span className={`text-xs sm:text-sm font-bold ${item.isPaid ? 'text-zinc-600' : 'text-zinc-900'}`}>
                        {amount.toLocaleString('tr-TR')} ₺
                      </span>
                      <Edit3 className="w-3 h-3 text-zinc-300 group-hover/btn:text-zinc-600 transition" />
                    </button>
                  )}

                  {/* Akıllı Vade Rozeti (Masaüstünde burada gösterilir) */}
                  <span className="hidden sm:inline-block">
                    {renderDueDateBadge(item)}
                  </span>

                  {/* Düzenleme ve Silme Butonları */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onEditFixedExpense(item)}
                      className="text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 p-1 rounded-md transition cursor-pointer"
                      title="Faturayı detaylı düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteExpense(item.id)}
                      className="text-zinc-300 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition cursor-pointer"
                      title="Bu sabit gideri sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
