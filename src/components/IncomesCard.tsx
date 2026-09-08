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
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col">
      
      {/* Kart Başlığı */}
      <div className="p-4 border-b border-zinc-200 bg-emerald-50/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900">Gelirler</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 font-semibold text-emerald-800">
                {filteredList.length} adet
              </span>
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">
              Toplam: {totalIncome.toLocaleString('tr-TR')} ₺
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddIncome}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Gelir Ekle</span>
        </button>
      </div>

      {/* Gelir Listesi */}
      <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[360px] p-1">
        {filteredList.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            Bu ay için henüz gelir kaydı eklenmedi.
          </div>
        ) : (
          filteredList.map((item) => {
            const person = getPerson(item.personId);

            return (
              <div
                key={item.id}
                className="p-3 rounded-lg flex items-center justify-between gap-3 hover:bg-zinc-50 transition group"
              >
                {/* Sol: Bilgi */}
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-zinc-900 truncate">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                    {person && (
                      <span className="inline-flex items-center gap-1">
                        <span>{person.avatar}</span>
                        <span className="text-zinc-600">{person.name}</span>
                      </span>
                    )}
                    {item.date && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 text-zinc-400">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </span>
                      </>
                    )}
                    {item.note && (
                      <>
                        <span>•</span>
                        <span className="italic text-zinc-400 truncate max-w-[140px]">
                          {item.note}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Sağ: Tutar ve Butonlar */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-emerald-600">
                    +{item.amount.toLocaleString('tr-TR')} ₺
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditIncome(item)}
                      className="text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 p-1 rounded-md transition cursor-pointer"
                      title="Geliri düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteIncome(item.id)}
                      className="text-zinc-300 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition cursor-pointer"
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
