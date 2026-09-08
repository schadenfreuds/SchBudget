'use client';

import React, { useState, useEffect } from 'react';
import { Person, IncomeItem, PersonId } from '@/types/budget';
import { X, TrendingUp, Edit2 } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';

interface EditIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  income: IncomeItem | null;
  persons: Person[];
  onSaveIncome: (updatedIncome: IncomeItem) => void;
}

export const EditIncomeModal: React.FC<EditIncomeModalProps> = ({
  isOpen,
  onClose,
  income,
  persons,
  onSaveIncome,
}) => {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<PersonId>('baba');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (income) {
      setAmount(formatAmountInput(String(income.amount || '')));
      setTitle(income.title || '');
      setSelectedPerson(income.personId || persons[0]?.id || 'baba');
      setDate(income.date || new Date().toISOString().split('T')[0]);
      setNote(income.note || '');
    }
  }, [income, persons]);

  if (!isOpen || !income) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFormattedAmount(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    onSaveIncome({
      ...income,
      title: title.trim() || 'Gelir',
      amount: parsedAmount,
      personId: selectedPerson,
      date,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-zinc-200 overflow-hidden">
        
        {/* Üst Bar */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900">Geliri Düzenle</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Tutar Girişi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Gelir Tutarı (₺) *
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={e => setAmount(formatAmountInput(e.target.value))}
                className="w-full px-3.5 py-2.5 text-2xl font-bold text-zinc-900 border-2 border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400">
                ₺
              </span>
            </div>
          </div>

          {/* Gelir Tanımı */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Gelir Tanımı / Kaynağı *
            </label>
            <input
              type="text"
              placeholder="Örn: Aylık Maaş, Kira Getirisi..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* İlgili Kişi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
              Kimin Geliri? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {persons.map(person => {
                const isSelected = selectedPerson === person.id;
                return (
                  <button
                    type="button"
                    key={person.id}
                    onClick={() => setSelectedPerson(person.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span className="text-base">{person.avatar}</span>
                    <span>{person.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tarih */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Tarih
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Not */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Özel Not (Opsiyonel)
            </label>
            <input
              type="text"
              placeholder="Eklemek istediğiniz not..."
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
              Değişiklikleri Kaydet
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
