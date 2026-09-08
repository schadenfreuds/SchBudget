'use client';

import React, { useState, useEffect } from 'react';
import { Person, IncomeItem, PersonId } from '@/types/budget';
import { X, TrendingUp } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';
import { useI18n } from '@/context/I18nContext';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  persons: Person[];
  onAddIncome: (income: Omit<IncomeItem, 'id'>) => void;
  defaultPersonId?: PersonId;
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  persons,
  onAddIncome,
  defaultPersonId,
}) => {
  const { t, currencySymbol, translatePerson } = useI18n();
  const todayStr = new Date().toISOString().split('T')[0];

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<PersonId>(defaultPersonId || persons[1]?.id || persons[0]?.id || 'baba');

  useEffect(() => {
    if (isOpen) {
      setSelectedPerson(defaultPersonId || persons[1]?.id || persons[0]?.id || 'baba');
    }
  }, [isOpen, defaultPersonId, persons]);
  const [date, setDate] = useState(todayStr);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFormattedAmount(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    onAddIncome({
      title: title.trim() || 'Gelir',
      amount: parsedAmount,
      personId: selectedPerson,
      date,
      note: note.trim() || undefined,
    });

    setAmount('');
    setTitle('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Üst Bar */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{t('modals.addIncomeTitle')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Tutar Girişi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              {t('modals.amountLabel')} ({currencySymbol}) *
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
                className="w-full px-3.5 py-2.5 text-2xl font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border-2 border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400 dark:text-zinc-500">
                {currencySymbol}
              </span>
            </div>
          </div>

          {/* Gelir Tanımı */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              {t('modals.titleLabel')}
            </label>
            <input
              type="text"
              placeholder="Örn: Aylık Maaş, Kira Getirisi, Freelance..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>

          {/* İlgili Kişi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              {t('modals.personLabel')}
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
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-base">{person.avatar}</span>
                    <span>{translatePerson(person)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tarih */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              {t('modals.dateLabel')}
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Kaydet Butonu */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition cursor-pointer"
            >
              {t('modals.saveBtn')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
