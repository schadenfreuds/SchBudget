'use client';

import React, { useState, useEffect } from 'react';
import { Person, Category, ExpenseItem, PersonId } from '@/types/budget';
import { X, Check, CreditCard, Banknote } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';
import { useI18n } from '@/context/I18nContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  persons: Person[];
  categories: Category[];
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  defaultPersonId?: PersonId;
  initialPreset?: Partial<ExpenseItem> | null;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  persons,
  categories,
  onAddExpense,
  defaultPersonId,
  initialPreset,
}) => {
  const { t, currencySymbol, translatePerson, translateCategory } = useI18n();
  const todayStr = new Date().toISOString().split('T')[0];

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<PersonId>(defaultPersonId || persons[0]?.id || 'ortak');
  const [selectedCategory, setSelectedCategory] = useState<string>('market');

  useEffect(() => {
    if (isOpen) {
      setSelectedPerson(defaultPersonId || persons[0]?.id || 'ortak');
      if (initialPreset) {
        setTitle(initialPreset.title || '');
        setAmount(initialPreset.amount ? formatAmountInput(String(initialPreset.amount)) : '');
        setSelectedCategory(initialPreset.categoryId || 'market');
        setPaymentMethod(initialPreset.paymentMethod === 'nakit' ? 'nakit' : 'kredi_karti');
      } else {
        setTitle('');
        setAmount('');
      }
    }
  }, [isOpen, defaultPersonId, persons, initialPreset]);
  const [date, setDate] = useState(todayStr);
  const [paymentMethod, setPaymentMethod] = useState<'kredi_karti' | 'nakit'>('kredi_karti');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFormattedAmount(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    // Eğer başlık yazmadıysa kategorinin adını varsayılan yap
    const categoryObj = categories.find(c => c.id === selectedCategory);
    const finalTitle = title.trim() || (categoryObj ? translateCategory(categoryObj) : t('modals.defaultExpenseTitle'));

    onAddExpense({
      title: finalTitle,
      amount: parsedAmount,
      categoryId: selectedCategory,
      personId: selectedPerson,
      date,
      paymentMethod,
      note: note.trim() || undefined,
    });

    // Sıfırla ve kapat
    setAmount('');
    setTitle('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Üst Bar */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{t('modals.addExpenseTitle')}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          
          {/* Tutar Girişi (Büyük ve Net) */}
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

          {/* Harcayan Kişi (Anne, Baba, Çocuk, Ortak) */}
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
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{person.avatar}</span>
                      <span>{translatePerson(person)}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kategori Seçimi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              {t('modals.categoryLabel')}
            </label>
            <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2 rounded-lg text-[11px] font-medium flex flex-col items-center gap-1 transition cursor-pointer border ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs font-bold ring-1 ring-emerald-400'
                        : 'bg-white/80 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate w-full text-center">{translateCategory(cat)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Harcama Başlığı / Açıklama */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              {t('modals.titleLabel')}
            </label>
            <input
              type="text"
              placeholder={t('modals.expensePlaceholder')}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Tarih ve Ödeme Yöntemi */}
          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                {t('modals.paymentMethodLabel')}
              </label>
              <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700 p-0.5 bg-zinc-100 dark:bg-zinc-800">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('kredi_karti')}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-md flex items-center justify-center gap-1 transition cursor-pointer ${
                    paymentMethod === 'kredi_karti'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <CreditCard className="w-3 h-3" /> {t('variable.creditCard')}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nakit')}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-md flex items-center justify-center gap-1 transition cursor-pointer ${
                    paymentMethod === 'nakit'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Banknote className="w-3 h-3" /> {t('variable.cash')}
                </button>
              </div>
            </div>
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
