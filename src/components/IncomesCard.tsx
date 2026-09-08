'use client';

import React from 'react';
import { IncomeItem, Person, PersonId } from '@/types/budget';
import { TrendingUp, Plus, Trash2, Calendar, Edit2 } from 'lucide-react';

interface IncomesCardProps {
  incomes: IncomeItem[];
  persons: Person[];
  selectedPersonId: PersonId | 'all';
  onDeleteIncome: (id: string) => void;
  onEditIncome: (income: IncomeItem) => void;
  onOpenAddIncome: () => void;
}

export const IncomesCard: React.FC<IncomesCardProps> = ({
  incomes,
  persons,
  selectedPersonId,
  onDeleteIncome,
  onEditIncome,
  onOpenAddIncome,
}) => {
  const filteredList = incomes.filter(i => {
    if (selectedPersonId === 'all') return true;
    return i.personId === selectedPersonId;
  });

  const totalIncome = filteredList.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const getPerson = (id: string) => persons.find(p => p.id === id);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
      
      {/* Kart Başlığı */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Gelirler</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 font-semibold text-emerald-800 dark:text-emerald-300">
                {filteredList.length} adet
              </span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
              Toplam: {totalIncome.toLocaleString('tr-TR')} ₺
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddIncome}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Gelir Ekle</span>
        </button>
      </div>

      {/* Gelir Listesi */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-y-auto max-h-[360px] p-1">
        {filteredList.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
            Bu ay için henüz gelir kaydı eklenmedi.
          </div>
        ) : (
          filteredList.map((item) => {
            const person = getPerson(item.personId);

            return (
              <div
                key={item.id}
                className="p-3 rounded-lg flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group"
              >
                {/* Sol: Bilgi */}
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {person && (
                      <span className="inline-flex items-center gap-1">
                        <span>{person.avatar}</span>
                        <span className="text-zinc-600 dark:text-zinc-300">{person.name}</span>
                      </span>
                    )}
                    {item.date && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 text-zinc-400 dark:text-zinc-500">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </span>
                      </>
                    )}
                    {item.note && (
                      <>
                        <span>•</span>
                        <span className="italic text-zinc-400 dark:text-zinc-500 truncate max-w-[140px]">
                          {item.note}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Sağ: Tutar ve Butonlar */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +{item.amount.toLocaleString('tr-TR')} ₺
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditIncome(item)}
                      className="text-zinc-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 p-1 rounded-md transition cursor-pointer"
                      title="Geliri düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteIncome(item.id)}
                      className="text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-800 p-1 rounded-md transition cursor-pointer"
                      title="Bu geliri sil"
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
