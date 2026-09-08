import React, { useState } from 'react';
import { AppSettings, FixedExpenseTemplate, Person, Category } from '@/types/budget';
import { BookmarkCheck, Plus, Trash2, Calendar, Sparkles, Check } from 'lucide-react';
import { formatAmountInput, parseFormattedAmount } from '@/lib/formatters';
import { useI18n } from '@/context/I18nContext';

interface FixedExpenseTemplatesCardProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onSyncMissingTemplatesToCurrentMonth?: () => void;
}

export const FixedExpenseTemplatesCard: React.FC<FixedExpenseTemplatesCardProps> = ({
  settings,
  onSaveSettings,
  onSyncMissingTemplatesToCurrentMonth,
}) => {
  const { t, formatMoney } = useI18n();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [personId, setPersonId] = useState(settings.persons[0]?.id || 'ortak');
  const [categoryId, setCategoryId] = useState(settings.categories[0]?.id || 'fatura');
  const [dueDate, setDueDate] = useState('');
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false);

  const templates = settings.defaultFixedExpenses || [];

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFormattedAmount(expectedAmount);
    if (!title.trim()) return;

    const newTemplate: FixedExpenseTemplate = {
      id: `tpl_${Date.now()}`,
      title: title.trim(),
      expectedAmount: parsed,
      categoryId,
      personId,
      dueDate: dueDate ? parseInt(dueDate, 10) : undefined,
    };

    const updated = [...templates, newTemplate];
    onSaveSettings({ ...settings, defaultFixedExpenses: updated });

    setTitle('');
    setExpectedAmount('');
    setDueDate('');
    setIsAdding(false);
  };

  const handleDeleteTemplate = (index: number) => {
    const updated = templates.filter((_, i) => i !== index);
    onSaveSettings({ ...settings, defaultFixedExpenses: updated });
  };

  const handleSync = () => {
    if (onSyncMissingTemplatesToCurrentMonth) {
      onSyncMissingTemplatesToCurrentMonth();
      setSyncSuccessMsg(true);
      setTimeout(() => setSyncSuccessMsg(false), 3000);
    }
  };

  const getPerson = (id: string) => settings.persons.find(p => p.id === id);
  const getCategory = (id: string) => settings.categories.find(c => c.id === id);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col h-full transition-colors duration-200">
      
      {/* Kart Başlığı */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 flex items-center justify-center">
            <BookmarkCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{t('templates.title')}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 font-semibold text-amber-900 dark:text-amber-300">
                {templates.length}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t('templates.syncBarText')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer shadow-xs"
        >
          <span>+ {t('templates.addTemplate')}</span>
        </button>
      </div>

      {/* Şablon Ekleme Formu */}
      {isAdding && (
        <form onSubmit={handleAddTemplate} className="p-4 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Yeni Rutin Şablon Ekle</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Fatura / Abonelik Adı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Netflix, İnternet, Aidat, Spor"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Varsayılan Aylık Tutar (₺)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={expectedAmount}
                onChange={e => setExpectedAmount(formatAmountInput(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Kategori</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-2 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              >
                {settings.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Kime Ait?</label>
              <select
                value={personId}
                onChange={e => setPersonId(e.target.value)}
                className="w-full px-2 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              >
                {settings.persons.map(p => (
                  <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Son Gün (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Örn: 15"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-2 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 rounded bg-amber-600 text-white font-bold hover:bg-amber-700 transition cursor-pointer"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Şablon Listesi */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-y-auto max-h-[480px] p-1 pr-1.5 flex-1 overscroll-contain">
        {templates.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-500">
            Kayıtlı rutin şablon bulunmuyor.
          </div>
        ) : (
          templates.map((tpl, idx) => {
            const person = getPerson(tpl.personId);
            const category = getCategory(tpl.categoryId);

            return (
              <div
                key={tpl.id || idx}
                className="p-3 rounded-lg flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{tpl.title}</span>
                    {category && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500" title={category.name}>
                        {category.icon}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {person && (
                      <span className="inline-flex items-center gap-1">
                        <span>{person.avatar}</span>
                        <span className="text-zinc-600 dark:text-zinc-300">{person.name}</span>
                      </span>
                    )}
                    {tpl.dueDate && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 text-zinc-400 dark:text-zinc-500">
                          <Calendar className="w-3 h-3" /> Her ayın {tpl.dueDate}&apos;si
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-200">
                    {tpl.expectedAmount > 0 ? formatMoney(tpl.expectedAmount) : t('templates.unspecified')}
                  </span>

                  <button
                    onClick={() => handleDeleteTemplate(idx)}
                    className="text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition cursor-pointer"
                    title="Şablonu sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Alt Bilgi & Bu Aya Aktar Butonu */}
      {onSyncMissingTemplatesToCurrentMonth && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 truncate">
              {t('templates.syncBarText')}
            </span>
          </div>

          <button
            onClick={handleSync}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs shrink-0 active:scale-95"
          >
            {syncSuccessMsg ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>{t('templates.syncSuccess')}</span>
              </>
            ) : (
              <>
                <span>{t('templates.syncBtn')}</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
};
