'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MonthlyBudget, AppSettings, FixedExpenseItem, ExpenseItem, IncomeItem, PersonId } from '@/types/budget';
import {
  getMonthKey,
  loadSettings,
  saveSettings,
  loadLocalMonth,
  loadMonthWithCloud,
  saveMonthWithCloud,
  saveLocalMonth,
  createInitialMonthBudget,
  getMockupMonthBudget,
} from '@/lib/storage';
import { clearAllLocalData } from '@/lib/backup';
import { initFirebase, subscribeToMonth, saveMonthToFirebase, parseFirebaseConfigInput, disconnectFirebase, testFirebaseConnection } from '@/lib/firebase';
import { exportBudgetToExcel } from '@/lib/excelExport';
import { useI18n } from '@/context/I18nContext';

import { Header, AppView } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { FixedExpensesCard } from '@/components/FixedExpensesCard';
import { FixedExpenseTemplatesCard } from '@/components/FixedExpenseTemplatesCard';
import { QuickExpensesCard } from '@/components/QuickExpensesCard';
import { BudgetPlannerCard } from '@/components/BudgetPlannerCard';
import { VariableExpensesCard } from '@/components/VariableExpensesCard';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { IncomesCard } from '@/components/IncomesCard';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { AddIncomeModal } from '@/components/AddIncomeModal';
import { EditExpenseModal } from '@/components/EditExpenseModal';
import { EditIncomeModal } from '@/components/EditIncomeModal';
import { EditFixedExpenseModal } from '@/components/EditFixedExpenseModal';
import { SettingsModal } from '@/components/SettingsModal';
import { Plus, LayoutDashboard, ReceiptText, CalendarCheck, Target, Users } from 'lucide-react';

import { DEFAULT_APP_SETTINGS } from '@/lib/constants';

export default function Home() {
  const { t, translatePerson } = useI18n();
  const [currentMonth, setCurrentMonth] = useState<string>(() => getMonthKey());
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [budget, setBudget] = useState<MonthlyBudget>(() => createInitialMonthBudget(getMonthKey()));
  const [selectedPersonId, setSelectedPersonId] = useState<PersonId | 'all'>('all');
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Ekleme Modalları & Preset
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [presetExpense, setPresetExpense] = useState<Partial<ExpenseItem> | null>(null);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Düzenleme Modalları
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
  const [editingFixedExpense, setEditingFixedExpense] = useState<FixedExpenseItem | null>(null);

  // İlk yükleme ve ay verisi çekme (Anında yerel hafızadan yükler, asla kilitlenmez)
  const fetchMonthData = useCallback(async (monthKey: string) => {
    // 1. Doğrudan yerel hafızadan anında yükle (0ms bekleme)
    const local = loadLocalMonth(monthKey);
    setBudget(local);

    // 2. Arka planda varsa bulut verisiyle güncelle
    try {
      const updated = await loadMonthWithCloud(monthKey);
      if (updated) {
        setBudget(updated);
        saveLocalMonth(updated);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // İstemcide mount tamamlandıktan sonra yerel ayarları senkronize et
    const savedSettings = loadSettings();
    setSettingsState(savedSettings);

    fetchMonthData(currentMonth);

    const db = initFirebase();
    setIsCloudConnected(!!db);

    if (db) {
      const unsubscribe = subscribeToMonth(currentMonth, (updated) => {
        setBudget(updated);
        saveLocalMonth(updated);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [currentMonth, fetchMonthData]);

  // Kaydetme yardımcı fonksiyonu
  const updateBudget = (updater: (prev: MonthlyBudget) => MonthlyBudget) => {
    if (!budget) return;
    const newBudget = updater(budget);
    setBudget(newBudget);
    saveMonthWithCloud(newBudget);
  };

  // 1. Sabit Gider Ödendi / Bekliyor Değiştir
  const handleTogglePaid = (id: string) => {
    updateBudget(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(f =>
        f.id === id ? { ...f, isPaid: !f.isPaid, paidAt: !f.isPaid ? new Date().toISOString() : undefined } : f
      ),
    }));
  };

  // 2. Sabit Gider Tutarını Güncelle (Hızlı Inline)
  const handleUpdateFixedAmount = (id: string, newAmount: number) => {
    updateBudget(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(f =>
        f.id === id ? { ...f, actualAmount: newAmount } : f
      ),
    }));
  };

  // 2.5 Sabit Gideri Detaylı Güncelle (Modal)
  const handleSaveFixedExpense = (updatedItem: FixedExpenseItem) => {
    updateBudget(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(f => f.id === updatedItem.id ? updatedItem : f),
    }));
  };

  // 3. Sabit Gider Sil
  const handleDeleteFixedExpense = (id: string) => {
    updateBudget(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.filter(f => f.id !== id),
    }));
  };

  // 4. Yeni Sabit Gider Ekle
  const handleAddFixedExpense = (item: Omit<FixedExpenseItem, 'id' | 'isPaid'>) => {
    const newItem: FixedExpenseItem = {
      ...item,
      id: `fixed_${Date.now()}`,
      isPaid: false,
    };
    updateBudget(prev => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, newItem],
    }));
  };

  // 4.5 Şablondaki Eksik Faturaları Mevcut Aya Aktar
  const handleSyncTemplatesToCurrentMonth = () => {
    if (!budget) return;
    const existingTitles = new Set(budget.fixedExpenses.map(f => f.title.toLowerCase().trim()));
    const missing = (settings.defaultFixedExpenses || []).filter(
      tpl => !existingTitles.has(tpl.title.toLowerCase().trim())
    );

    if (missing.length === 0) {
      alert('Şablondaki tüm faturalar zaten bu aya eklenmiş durumda.');
      return;
    }

    const newItems: FixedExpenseItem[] = missing.map((tpl, i) => ({
      id: `fixed_${currentMonth}_sync_${Date.now()}_${i}`,
      title: tpl.title,
      expectedAmount: tpl.expectedAmount,
      actualAmount: tpl.expectedAmount,
      categoryId: tpl.categoryId,
      personId: tpl.personId,
      dueDate: tpl.dueDate,
      isPaid: false,
    }));

    updateBudget(prev => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, ...newItems],
    }));
  };

  // 5. Değişken Harcama Ekle
  const handleAddExpense = (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const newItem: ExpenseItem = {
      ...expense,
      id: `exp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateBudget(prev => ({
      ...prev,
      expenses: [newItem, ...prev.expenses],
    }));
  };

  // 5.5 Değişken Harcama Güncelle
  const handleSaveExpense = (updatedExpense: ExpenseItem) => {
    updateBudget(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e),
    }));
  };

  // 6. Değişken Harcama Sil
  const handleDeleteExpense = (id: string) => {
    updateBudget(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id),
    }));
  };

  // 7. Gelir Ekle
  const handleAddIncome = (income: Omit<IncomeItem, 'id'>) => {
    const newItem: IncomeItem = {
      ...income,
      id: `inc_${Date.now()}`,
    };
    updateBudget(prev => ({
      ...prev,
      incomes: [newItem, ...prev.incomes],
    }));
  };

  // 7.2 Gelir Güncelle
  const handleSaveIncome = (updatedIncome: IncomeItem) => {
    updateBudget(prev => ({
      ...prev,
      incomes: prev.incomes.map(i => i.id === updatedIncome.id ? updatedIncome : i),
    }));
  };

  // 7.5 Gelir Sil
  const handleDeleteIncome = (id: string) => {
    updateBudget(prev => ({
      ...prev,
      incomes: prev.incomes.filter(i => i.id !== id),
    }));
  };

  // 8. Bütçe Limiti & Tasarruf Hedefi Güncelle
  const handleUpdateBudgetLimit = (limit: number) => {
    updateBudget(prev => ({
      ...prev,
      budgetLimit: limit,
    }));
  };

  const handleUpdateSavingsTarget = (target: number) => {
    updateBudget(prev => ({
      ...prev,
      savingsTarget: target,
    }));
  };

  // 9. Excel İndir
  const handleExportExcel = () => {
    if (!budget) return;
    exportBudgetToExcel(budget, settings);
  };

  // 9.5 Örnek Demo Verisi Yükle
  const handleLoadMockup = () => {
    if (confirm('Mevcut aya 1 aylık gerçekçi örnek bütçe ve harcama verileri yüklensin mi?')) {
      const mock = getMockupMonthBudget(currentMonth);
      setBudget(mock);
      saveMonthWithCloud(mock);
    }
  };

  // 9.6 Tüm Verileri Sıfırla (Temiz Sayfa Aç)
  const handleResetAllData = async () => {
    clearAllLocalData();
    const clean = createInitialMonthBudget(currentMonth);
    setBudget(clean);
    setSettingsState(DEFAULT_APP_SETTINGS);
    saveLocalMonth(clean);
    if (isCloudConnected) {
      try {
        await saveMonthToFirebase(clean);
      } catch (e) {
        console.warn('Bulut verisi sıfırlanamadı:', e);
      }
    }
    window.location.reload();
  };

  // 10. Ayarları Kaydet
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  // 11. Firebase Bağlantısı
  const handleConnectFirebase = async (configStr: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const parsed = parseFirebaseConfigInput(configStr);
      if (!parsed) {
        return {
          success: false,
          error: 'Geçerli bir Firebase yapılandırması bulunamadı. Lütfen JSON, JS veya .env formatında bir yapılandırma girin.',
        };
      }

      localStorage.setItem('sch_budget_firebase_config', JSON.stringify(parsed));
      localStorage.setItem('aile_butcesi_firebase_config', JSON.stringify(parsed));

      const db = initFirebase(true);
      if (!db) {
        return { success: false, error: 'Firebase başlatılamadı. API anahtarı veya Project ID değerini kontrol edin.' };
      }

      const test = await testFirebaseConnection();
      if (!test.success) {
        return { success: false, error: test.error || 'Firestore bağlantı hatası oluştu.' };
      }

      setIsCloudConnected(true);
      if (budget) {
        await saveMonthToFirebase(budget);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  };

  const handleDisconnectFirebase = () => {
    disconnectFirebase();
    setIsCloudConnected(false);
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24 sm:pb-12 transition-colors duration-200">
      
      {/* Üst Çubuk & Menü */}
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        activeView={currentView}
        onViewChange={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportExcel={handleExportExcel}
        isCloudConnected={isCloudConnected}
      />

      {/* Ana Gövde */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 overflow-hidden">
        
        {/* ======================================================== */}
        {/* 1. ANASAYFA GÖRÜNÜMÜ: Özet, Ödeme Kanalları, Kişi Harcamaları, Kategori Dağılımı */}
        {/* ======================================================== */}
        {currentView === 'dashboard' && (
          <div className="space-y-4 sm:space-y-5">
            <SummaryCards
              budget={budget}
              persons={settings.persons}
              selectedPersonId={selectedPersonId}
              onSelectPerson={setSelectedPersonId}
            />

            <CategoryBreakdown
              budget={budget}
              categories={settings.categories}
              selectedPersonId={selectedPersonId}
              onGoToAccounting={() => setCurrentView('accounting')}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. MUHASEBE GÖRÜNÜMÜ: Hızlı Harcama Şablonları & Günlük Harcamalar Akışı */}
        {/* ======================================================== */}
        {currentView === 'accounting' && (
          <div className="space-y-4 sm:space-y-5">
            
            {/* Hızlı Kişi Filtresi */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 sm:p-3.5 shadow-xs flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
                  <Users className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                </span>
                <button
                  onClick={() => setSelectedPersonId('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    selectedPersonId === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {t('nav.allPersons')}
                </button>
                {settings.persons.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonId(selectedPersonId === p.id ? 'all' : p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      selectedPersonId === p.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>{p.avatar}</span>
                    <span>{translatePerson(p)}</span>
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium hidden lg:inline shrink-0">
                {t('subtitles.accounting')}
              </span>
            </div>

            {/* İki Kolonlu Harcama Ekranı: Sol Harcamalar (7 birim), Sağ Hızlı Şablonlar (5 birim) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Sol Kolon: Günlük & Değişken Harcamalar (7 birim) */}
              <div className="lg:col-span-7">
                <VariableExpensesCard
                  expenses={budget.expenses}
                  persons={settings.persons}
                  categories={settings.categories}
                  selectedPersonId={selectedPersonId}
                  onDeleteExpense={handleDeleteExpense}
                  onEditExpense={(expense) => setEditingExpense(expense)}
                  onOpenAddExpense={() => {
                    setPresetExpense(null);
                    setIsAddExpenseOpen(true);
                  }}
                />
              </div>

              {/* Sağ Kolon: Hızlı Şablon Butonları (5 birim) */}
              <div className="lg:col-span-5">
                <QuickExpensesCard
                  settings={settings}
                  selectedPersonId={selectedPersonId}
                  onAddExpense={handleAddExpense}
                  onOpenWithPreset={(preset) => {
                    setPresetExpense(preset);
                    setIsAddExpenseOpen(true);
                  }}
                  onSaveSettings={handleSaveSettings}
                />
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 3. FATURALAR GÖRÜNÜMÜ: Bu Ayın Sabit Giderleri + Rutin Şablonlar */}
        {/* ======================================================== */}
        {currentView === 'bills' && (
          <div className="space-y-5">
            
            {/* Hızlı Kişi Filtresi */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 sm:p-3.5 shadow-xs flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
                  <Users className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                </span>
                <button
                  onClick={() => setSelectedPersonId('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    selectedPersonId === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {t('nav.allPersons')}
                </button>
                {settings.persons.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonId(selectedPersonId === p.id ? 'all' : p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      selectedPersonId === p.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>{p.avatar}</span>
                    <span>{translatePerson(p)}</span>
                  </button>
                ))}
              </div>

              <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium hidden lg:inline shrink-0">
                {t('subtitles.bills')}
              </div>
            </div>

            {/* İki Kolon: Sol Bu Ayın Faturaları (7 birim), Sağ Rutin Fatura Şablonları (5 birim) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              <div className="lg:col-span-7">
                <FixedExpensesCard
                  fixedExpenses={budget.fixedExpenses}
                  persons={settings.persons}
                  categories={settings.categories}
                  selectedPersonId={selectedPersonId}
                  onTogglePaid={handleTogglePaid}
                  onUpdateAmount={handleUpdateFixedAmount}
                  onDeleteExpense={handleDeleteFixedExpense}
                  onAddFixedExpense={handleAddFixedExpense}
                  onEditFixedExpense={(item) => setEditingFixedExpense(item)}
                />
              </div>

              <div className="lg:col-span-5">
                <FixedExpenseTemplatesCard
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  onSyncMissingTemplatesToCurrentMonth={handleSyncTemplatesToCurrentMonth}
                />
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 4. BÜTÇE & GELİR GÖRÜNÜMÜ: Gelir Yönetimi + Harcama Limiti & Pusula */}
        {/* ======================================================== */}
        {currentView === 'budget' && (
          <div className="space-y-5">
            
            {/* Hızlı Kişi Filtresi */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 sm:p-3.5 shadow-xs flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
                  <Users className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                </span>
                <button
                  onClick={() => setSelectedPersonId('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    selectedPersonId === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {t('nav.allPersons')}
                </button>
                {settings.persons.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonId(selectedPersonId === p.id ? 'all' : p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      selectedPersonId === p.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>{p.avatar}</span>
                    <span>{translatePerson(p)}</span>
                  </button>
                ))}
              </div>

              <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium hidden lg:inline shrink-0">
                {t('subtitles.budget')}
              </div>
            </div>

            {/* İki Kolon: Sol Gelir Yönetimi (5 birim), Sağ Bütçe Limiti & Pusula (7 birim) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Sol: Gelirler Kartı */}
              <div className="lg:col-span-5">
                <IncomesCard
                  incomes={budget.incomes}
                  persons={settings.persons}
                  selectedPersonId={selectedPersonId}
                  onDeleteIncome={handleDeleteIncome}
                  onEditIncome={(income) => setEditingIncome(income)}
                  onOpenAddIncome={() => setIsAddIncomeOpen(true)}
                />
              </div>

              {/* Sağ: Aylık Bütçe Limiti & Günlük Harcama Pusulası */}
              <div className="lg:col-span-7">
                <BudgetPlannerCard
                  budget={budget}
                  settings={settings}
                  onUpdateBudgetLimit={handleUpdateBudgetLimit}
                  onUpdateSavingsTarget={handleUpdateSavingsTarget}
                />
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Mobil İçin Alt Gezinti Çubuğu (Bottom Navigation Bar - 4 Sekme + Ortada +) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-3 py-1.5 flex items-center justify-between shadow-lg pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] transition-colors duration-200">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition cursor-pointer flex-1 ${
            currentView === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>{t('nav.dashboard')}</span>
        </button>

        <button
          onClick={() => setCurrentView('accounting')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition cursor-pointer flex-1 ${
            currentView === 'accounting' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span>{t('nav.accounting')}</span>
        </button>

        <button
          onClick={() => {
            setPresetExpense(null);
            setIsAddExpenseOpen(true);
          }}
          className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center transition active:scale-95 cursor-pointer -mt-4 border-2 border-white dark:border-zinc-900 shrink-0 mx-1"
          aria-label={t('nav.addExpense')}
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setCurrentView('bills')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition cursor-pointer flex-1 ${
            currentView === 'bills' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{t('nav.bills')}</span>
        </button>

        <button
          onClick={() => setCurrentView('budget')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition cursor-pointer flex-1 ${
            currentView === 'budget' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>{t('nav.budget')}</span>
        </button>
      </div>

      {/* Ekleme Modalları */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setPresetExpense(null);
        }}
        persons={settings.persons}
        categories={settings.categories}
        onAddExpense={handleAddExpense}
        defaultPersonId={selectedPersonId !== 'all' ? selectedPersonId : (settings.persons[0]?.id || 'anne')}
        initialPreset={presetExpense}
      />

      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
        persons={settings.persons}
        onAddIncome={handleAddIncome}
        defaultPersonId={settings.persons[1]?.id || settings.persons[0]?.id || 'baba'}
      />

      {/* Düzenleme Modalları */}
      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        persons={settings.persons}
        categories={settings.categories}
        onSaveExpense={handleSaveExpense}
      />

      <EditIncomeModal
        isOpen={!!editingIncome}
        onClose={() => setEditingIncome(null)}
        income={editingIncome}
        persons={settings.persons}
        onSaveIncome={handleSaveIncome}
      />

      <EditFixedExpenseModal
        isOpen={!!editingFixedExpense}
        onClose={() => setEditingFixedExpense(null)}
        fixedExpense={editingFixedExpense}
        persons={settings.persons}
        categories={settings.categories}
        onSaveFixedExpense={handleSaveFixedExpense}
      />

      {/* Ayarlar Modalı */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onConnectFirebase={handleConnectFirebase}
        onDisconnectFirebase={handleDisconnectFirebase}
        isCloudConnected={isCloudConnected}
        onLoadMockup={handleLoadMockup}
        onResetAllData={handleResetAllData}
        onDataRestored={() => fetchMonthData(currentMonth)}
      />

    </div>
  );
}
