import React, { useState } from 'react';
import { QuickExpenseTemplate, PersonId, ExpenseItem, AppSettings, Category } from '@/types/budget';
import { Zap, Plus, Trash2, Check, CreditCard, Banknote, Edit3 } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';
import { DEFAULT_QUICK_TEMPLATES } from '@/lib/constants';
import { useI18n } from '@/context/I18nContext';

interface QuickExpensesCardProps {
  settings: AppSettings;
  selectedPersonId: PersonId | 'all';
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  onOpenWithPreset?: (preset: Partial<ExpenseItem>) => void;
  onSaveSettings: (settings: AppSettings) => void;
}

export const QuickExpensesCard: React.FC<QuickExpensesCardProps> = ({
  settings,
  selectedPersonId,
  onAddExpense,
  onOpenWithPreset,
  onSaveSettings,
}) => {
  const { t, formatMoney, currencySymbol, translateCategory } = useI18n();
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [categoryId, setCategoryId] = useState(settings.categories[0]?.id || 'market');
  const [paymentMethod, setPaymentMethod] = useState<'kredi_karti' | 'nakit'>('kredi_karti');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const templates: QuickExpenseTemplate[] = settings.quickTemplates || DEFAULT_QUICK_TEMPLATES;

  const handleQuickAdd = (tpl: QuickExpenseTemplate) => {
    const today = new Date().toISOString().split('T')[0];
    const targetPerson = selectedPersonId !== 'all' ? selectedPersonId : (settings.persons[0]?.id || 'ortak');

    onAddExpense({
      title: tpl.title,
      amount: tpl.amount,
      categoryId: tpl.categoryId,
      personId: targetPerson,
      date: today,
      paymentMethod: tpl.paymentMethod || 'kredi_karti',
    });

    setJustAddedId(tpl.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFormattedAmount(amount);
    if (!title.trim() || parsed <= 0) return;

    const newTpl: QuickExpenseTemplate = {
      id: `qt_${Date.now()}`,
      title: title.trim(),
      amount: parsed,
      categoryId,
      icon: icon || '⚡',
      paymentMethod,
    };

    const updated = [...templates, newTpl];
    onSaveSettings({ ...settings, quickTemplates: updated });

    setTitle('');
    setAmount('');
    setIsAddingCustom(false);
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = templates.filter(t => t.id !== id);
    onSaveSettings({ ...settings, quickTemplates: updated });
  };

  const PRESET_ICONS = ['🥖', '💧', '⛽', '☕', '🛒', '🥩', '💊', '🚕', '🍕', '🍰', '🧹', '⚡'];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col h-full transition-colors duration-200">
      
      {/* Kart Başlığı */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 flex items-center justify-center">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{t('quick.title')}</h2>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('quick.addCustom')}</span>
        </button>
      </div>

      {/* Yeni Özel Şablon Ekleme Formu */}
      {isAddingCustom && (
        <form onSubmit={handleSaveCustom} className="p-4 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{t('quick.newTitle')}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t('quick.titleLabel')}</label>
              <input
                type="text"
                required
                placeholder="Örn: Simit & Ayran, Otopark"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t('quick.amountLabel')} ({currencySymbol}) *</label>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="0"
                value={amount}
                onChange={e => setAmount(formatAmountInput(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t('quick.categoryLabel')}</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-2 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              >
                {settings.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {translateCategory(c)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">İkon</label>
              <select
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="w-full px-2 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base"
              >
                {PRESET_ICONS.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{t('quick.methodLabel')}</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as 'kredi_karti' | 'nakit')}
                className="w-full px-2 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              >
                <option value="kredi_karti">💳 {t('variable.creditCard')}</option>
                <option value="nakit">💵 {t('variable.cash')}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              {t('quick.cancelBtn')}
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 rounded bg-amber-600 text-white font-bold hover:bg-amber-700 transition cursor-pointer"
            >
              {t('quick.saveBtn')}
            </button>
          </div>
        </form>
      )}

      {/* Şablon Kartları Grid */}
      <div className="p-3 pr-2 grid grid-cols-2 gap-2.5 overflow-y-auto max-h-[480px] flex-1 overscroll-contain">
        {templates.map(tpl => {
          const isJustAdded = justAddedId === tpl.id;

          return (
            <div
              key={tpl.id}
              onClick={() => handleQuickAdd(tpl)}
              className={`p-3 rounded-xl border transition cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden select-none ${
                isJustAdded
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 ring-2 ring-emerald-400/40'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 bg-white dark:bg-zinc-900'
              }`}
            >
              {/* Üst Bar: İkon ve İşlemler */}
              <div className="flex items-center justify-between w-full">
                <span className="text-2xl">{tpl.icon || '⚡'}</span>

                <div className="flex items-center gap-1">
                  {onOpenWithPreset && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWithPreset({
                          title: tpl.title,
                          amount: tpl.amount,
                          categoryId: tpl.categoryId,
                          paymentMethod: tpl.paymentMethod || 'kredi_karti',
                        });
                      }}
                      className="p-1 rounded text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition"
                      title="Tutarı değiştirerek aç"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {templates.length > 2 && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                      className="p-1 rounded text-zinc-300 dark:text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                      title="Şablonu sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Orta: Başlık */}
              <div className="mt-2.5">
                <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {tpl.title}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatMoney(tpl.amount)}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {tpl.paymentMethod === 'nakit' ? '💵 Nakit' : '💳 Kart'}
                  </span>
                </div>
              </div>

              {/* Alt: Hızlı Ekle İpucu veya Onay Rozeti */}
              <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px]">
                {isJustAdded ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Eklendi!
                  </span>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium transition flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Dokun ve Ekle
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
