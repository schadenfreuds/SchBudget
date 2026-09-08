'use client';

import React, { useState, useEffect } from 'react';
import { Person, Category, FixedExpenseItem, PersonId } from '@/types/budget';
import { X, Check, Calendar, Edit2, FileText } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';

interface EditFixedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixedExpense: FixedExpenseItem | null;
  persons: Person[];
  categories: Category[];
  onSaveFixedExpense: (updatedItem: FixedExpenseItem) => void;
}

export const EditFixedExpenseModal: React.FC<EditFixedExpenseModalProps> = ({
  isOpen,
  onClose,
  fixedExpense,
  persons,
  categories,
  onSaveFixedExpense,
}) => {
  const [title, setTitle] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<PersonId>('ortak');
  const [selectedCategory, setSelectedCategory] = useState<string>('fatura');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (fixedExpense) {
      setTitle(fixedExpense.title || '');
      setExpectedAmount(formatAmountInput(String(fixedExpense.expectedAmount || '')));
      setActualAmount(formatAmountInput(String(fixedExpense.actualAmount || fixedExpense.expectedAmount || '')));
      setSelectedPerson(fixedExpense.personId || 'ortak');
      setSelectedCategory(fixedExpense.categoryId || 'fatura');
      setDueDate(fixedExpense.dueDate ? String(fixedExpense.dueDate) : '');
      setNote(fixedExpense.note || '');
    }
  }, [fixedExpense]);

  if (!isOpen || !fixedExpense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedExpected = parseFormattedAmount(expectedAmount);
    const parsedActual = parseFormattedAmount(actualAmount);

    if (!title.trim() || parsedExpected < 0) return;

    onSaveFixedExpense({
      ...fixedExpense,
      title: title.trim(),
      expectedAmount: parsedExpected,
      actualAmount: parsedActual > 0 ? parsedActual : parsedExpected,
      personId: selectedPerson,
      categoryId: selectedCategory,
      dueDate: dueDate ? parseInt(dueDate, 10) : undefined,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Üst Bar */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900">Sabit Gideri / Faturayı Düzenle</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          
          {/* Fatura Başlığı */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Fatura / Gider Adı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Elektrik Faturası, Kira, Aidat..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Beklenen ve Gerçekleşen Tutar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Fatura Tutarı (₺) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="0"
                  value={actualAmount}
                  onChange={e => setActualAmount(formatAmountInput(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold text-zinc-900 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                  ₺
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Son Ödeme Günü (1-31)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Örn: 15"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>
          </div>

          {/* İlgili Kişi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
              Kime Ait? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {persons.map(person => {
                const isSelected = selectedPerson === person.id;
                return (
                  <button
                    type="button"
                    key={person.id}
                    onClick={() => setSelectedPerson(person.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{person.avatar}</span>
                      <span>{person.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kategori Seçimi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
              Kategori *
            </label>
            <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1 border border-zinc-200 rounded-xl bg-zinc-50/50">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2 rounded-lg text-[11px] font-medium flex flex-col items-center gap-1 transition cursor-pointer border ${
                      isSelected
                        ? 'bg-white border-emerald-500 text-emerald-900 shadow-xs font-bold ring-1 ring-emerald-400'
                        : 'bg-white/80 border-zinc-200 text-zinc-600 hover:bg-white'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate w-full text-center">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Özel Not */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Özel Not (Opsiyonel)
            </label>
            <input
              type="text"
              placeholder="Abone no, otomatik ödeme talimatı vb..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Kaydet Butonu */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition cursor-pointer"
            >
              Faturayı Güncelle
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
