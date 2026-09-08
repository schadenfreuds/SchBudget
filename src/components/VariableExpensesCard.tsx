import React, { useState } from 'react';
import { ExpenseItem, Person, Category, PersonId } from '@/types/budget';
import { Search, Trash2, CreditCard, Banknote, ShoppingBag, Edit2 } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

interface VariableExpensesCardProps {
  expenses: ExpenseItem[];
  persons: Person[];
  categories: Category[];
  selectedPersonId: PersonId | 'all';
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onOpenAddExpense: () => void;
}

export const VariableExpensesCard: React.FC<VariableExpensesCardProps> = ({
  expenses,
  persons,
  categories,
  selectedPersonId,
  onDeleteExpense,
  onEditExpense,
  onOpenAddExpense,
}) => {
  const { t, lang, formatMoney, translateCategory, translatePerson, translateQuick } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'kredi_karti' | 'nakit'>('all');

  // Filtreleme
  const filtered = expenses
    .filter(e => {
      if (selectedPersonId !== 'all' && e.personId !== selectedPersonId) return false;
      if (selectedCategory !== 'all' && e.categoryId !== selectedCategory) return false;
      if (paymentFilter !== 'all') {
        const method = e.paymentMethod || 'kredi_karti';
        if (method !== paymentFilter) return false;
      }
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
      const locale = lang === 'en' ? 'en-US' : 'tr-TR';
      return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col h-full transition-colors duration-200">
      
      {/* Kart Başlığı ve Arama / Filtreler */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{t('variable.title')}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 font-semibold text-zinc-700 dark:text-zinc-200">
                {filtered.length}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t('variable.totalSpent')}: <strong className="text-zinc-800 dark:text-zinc-200">{formatMoney(totalFiltered)}</strong>
            </p>
          </div>

          <button
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
          >
            <span>+ {t('nav.addExpense')}</span>
          </button>
        </div>

        {/* Arama, Kategori ve Ödeme Yöntemi Filtresi */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={t('variable.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto sm:flex sm:items-center">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="all">{t('variable.allCategories')}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {translateCategory(c)}</option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value as 'all' | 'kredi_karti' | 'nakit')}
              className="w-full sm:w-auto px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="all">{t('variable.allPayments')}</option>
              <option value="kredi_karti">{t('variable.cardPayment')}</option>
              <option value="nakit">{t('variable.cashPayment')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-y-auto max-h-[480px] p-1 flex-1">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 dark:text-zinc-500 mb-2">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t('variable.noExpensesFound')}</p>
            <button
              onClick={onOpenAddExpense}
              className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {t('variable.addExpenseNow')}
            </button>
          </div>
        ) : (
          filtered.map(expense => {
            const person = getPerson(expense.personId);
            const category = getCategory(expense.categoryId);

            return (
              <div
                key={expense.id}
                className="p-3 rounded-lg flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition group"
              >
                {/* Sol: İkon + Başlık + Kişi + Tarih */}
                <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm sm:text-base shrink-0 mt-0.5 sm:mt-0">
                    {category?.icon || '🛒'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {translateQuick(expense.title)}
                      </span>
                      {expense.note && (
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate max-w-[100px]" title={expense.note}>
                          ({expense.note})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 flex-wrap">
                      <span className="font-medium text-zinc-600 dark:text-zinc-300">
                        {formatDateLabel(expense.date)}
                      </span>
                      <span>•</span>
                      {person && (
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-medium border text-[10px] ${person.color}`}>
                          <span>{person.avatar}</span>
                          <span>{translatePerson(person)}</span>
                        </span>
                      )}
                      <span>•</span>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {category ? translateCategory(category) : t('categories.diger')}
                      </span>
                      {expense.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-zinc-400 dark:text-zinc-500">
                            {expense.paymentMethod === 'kredi_karti' ? (
                              <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1 rounded text-[10px] font-medium">
                                <CreditCard className="w-3 h-3" /> {t('variable.creditCard')}
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1 rounded text-[10px] font-medium">
                                <Banknote className="w-3 h-3" /> {t('variable.cash')}
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ: Tutar + Düzenle & Sil butonları */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-1">
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formatMoney(Number(expense.amount))}
                  </span>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="text-zinc-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 p-1 rounded-md transition cursor-pointer"
                      title={t('common.edit')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-zinc-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1 rounded-md transition cursor-pointer"
                      title={t('common.delete')}
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
