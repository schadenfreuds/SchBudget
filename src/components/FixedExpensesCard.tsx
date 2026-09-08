import React, { useState } from 'react';
import { FixedExpenseItem, Person, Category, PersonId } from '@/types/budget';
import { Check, Clock, Plus, Trash2, Edit3, Calendar, Edit2, Search } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';
import { useI18n } from '@/context/I18nContext';

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
  const { t, formatMoney, translateCategory, translatePerson, translateTemplate } = useI18n();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPerson, setNewPerson] = useState<PersonId>('ortak');
  const [newCategory, setNewCategory] = useState('fatura');
  const [newDueDate, setNewDueDate] = useState('');

  // Arama ve Filtreleme
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  // Hızlı düzenleme için ID
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmountVal, setEditAmountVal] = useState('');

  // Filtrelenmiş liste
  const filteredList = fixedExpenses.filter((f) => {
    // Kişi filtresi
    if (selectedPersonId !== 'all' && f.personId !== selectedPersonId) return false;
    // Kategori filtresi
    if (selectedCategory !== 'all' && f.categoryId !== selectedCategory) return false;
    // Durum filtresi
    if (statusFilter === 'unpaid' && f.isPaid) return false;
    if (statusFilter === 'paid' && !f.isPaid) return false;
    // Arama filtresi
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = f.title.toLowerCase().includes(term);
      const matchNote = f.note?.toLowerCase().includes(term);
      return matchTitle || matchNote;
    }
    return true;
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
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          {t('fixed.statusPaid')}
        </span>
      );
    }
    if (!item.dueDate) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
          <Clock className="w-2.5 h-2.5" /> {t('fixed.statusPending')}
        </span>
      );
    }

    const today = new Date().getDate();
    const diff = item.dueDate - today;

    if (diff < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
          {t('fixed.statusOverdue').replace('{days}', String(Math.abs(diff)))}
        </span>
      );
    } else if (diff === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
          {t('fixed.statusDueToday')}
        </span>
      );
    } else if (diff <= 3) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
          {t('fixed.statusDaysLeft').replace('{days}', String(diff))}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
          {t('fixed.dayOfMonth').replace('{day}', String(item.dueDate))}
        </span>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col h-full transition-colors duration-200">
      
      {/* Kart Başlığı ve Arama / Filtreler */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{t('fixed.title')}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 font-semibold text-zinc-700 dark:text-zinc-200">
                {paidCount}/{totalCount}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t('fixed.paidLabel')}: <strong className="text-zinc-800 dark:text-zinc-200">{formatMoney(paidAmount)}</strong> / {t('fixed.totalLabel')}: <strong className="text-zinc-800 dark:text-zinc-200">{formatMoney(totalAmount)}</strong>
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
          >
            <span>+ {t('fixed.newBill')}</span>
          </button>
        </div>

        {/* Arama, Kategori ve Durum Filtresi */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={t('fixed.searchPlaceholder')}
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
              <option value="all">{t('fixed.allCategories')}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {translateCategory(c)}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'all' | 'unpaid' | 'paid')}
              className="w-full sm:w-auto px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="all">{t('fixed.allStatuses')}</option>
              <option value="unpaid">{t('fixed.pending')}</option>
              <option value="paid">{t('fixed.paidFilter')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* İlerleme Çubuğu */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5">
        <div
          className="bg-emerald-500 h-1.5 transition-all duration-300"
          style={{ width: `${totalCount > 0 ? (paidCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      {/* Yeni Fatura Ekleme Formu (Açılırsa) */}
      {isAdding && (
        <form onSubmit={handleSaveNew} className="p-4 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{t('fixed.addNewBill')}</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('fixed.billNameLabel')}
              </label>
              <input
                type="text"
                placeholder={t('fixed.billNamePlaceholder')}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('fixed.expectedAmount')}
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={newAmount}
                onChange={e => setNewAmount(formatAmountInput(e.target.value))}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('fixed.person')}
              </label>
              <select
                value={newPerson}
                onChange={e => setNewPerson(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {persons.map(p => (
                  <option key={p.id} value={p.id}>{p.avatar} {translatePerson(p)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('fixed.category')}
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {translateCategory(c)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('fixed.dueDate')}
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="15"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              {t('fixed.cancelBtn')}
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition cursor-pointer"
            >
              {t('modals.saveBtn')}
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-y-auto max-h-[480px] p-1 pr-1.5 flex-1 overscroll-contain">
        {filteredList.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 dark:text-zinc-500 mb-2">
              <Calendar className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t('fixed.noBillsFound')}</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {t('fixed.addBillNow')}
            </button>
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
                  item.isPaid ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                {/* Sol: Onay kutusu + Bilgi */}
                <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => onTogglePaid(item.id)}
                    aria-label={item.isPaid ? t('fixed.markUnpaid') : t('fixed.markPaid')}
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition cursor-pointer shrink-0 border mt-0.5 sm:mt-0 ${
                      item.isPaid
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-white dark:bg-zinc-800'
                    }`}
                  >
                    {item.isPaid && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs sm:text-sm font-semibold truncate ${item.isPaid ? 'text-zinc-600 dark:text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {translateTemplate(item.title)}
                      </span>
                      {category && (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500" title={translateCategory(category)}>
                          {category.icon}
                        </span>
                      )}
                      <span className="sm:hidden inline-block">
                        {renderDueDateBadge(item)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 flex-wrap">
                      {person && (
                        <span className="inline-flex items-center gap-1">
                          <span>{person.avatar}</span>
                          <span className="text-zinc-600 dark:text-zinc-300">{translatePerson(person)}</span>
                        </span>
                      )}
                      {item.note && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-400 dark:text-zinc-500 italic truncate max-w-[120px]">
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
                        className="w-20 sm:w-24 px-1.5 py-0.5 border border-emerald-500 rounded text-xs font-bold text-right bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditAmount(item.id)}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-1 cursor-pointer"
                      >
                        {t('fixed.saveAmount')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditAmount(item)}
                      title={t('fixed.editAmountTitle')}
                      className="group/btn flex items-center gap-1 text-right cursor-pointer"
                    >
                      <span className={`text-xs sm:text-sm font-bold ${item.isPaid ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {formatMoney(amount)}
                      </span>
                      <Edit3 className="w-3 h-3 text-zinc-300 dark:text-zinc-600 group-hover/btn:text-zinc-600 dark:group-hover/btn:text-zinc-300 transition" />
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
                      className="text-zinc-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 p-1 rounded-md transition cursor-pointer"
                      title={t('common.edit')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteExpense(item.id)}
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
