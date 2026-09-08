'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MonthlyBudget, AppSettings, FixedExpenseItem, ExpenseItem, IncomeItem, PersonId } from '@/types/budget';
import {
  getMonthKey,
  loadSettings,
  saveSettings,
  loadMonthWithCloud,
  saveMonthWithCloud,
  saveLocalMonth,
  getMockupMonthBudget,
} from '@/lib/storage';
import { initFirebase, subscribeToMonth } from '@/lib/firebase';
import { exportBudgetToExcel } from '@/lib/excelExport';

import { Header, AppView } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { FixedExpensesCard } from '@/components/FixedExpensesCard';
import { FixedExpenseTemplatesCard } from '@/components/FixedExpenseTemplatesCard';
import { VariableExpensesCard } from '@/components/VariableExpensesCard';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { IncomesCard } from '@/components/IncomesCard';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { AddIncomeModal } from '@/components/AddIncomeModal';
import { EditExpenseModal } from '@/components/EditExpenseModal';
import { EditIncomeModal } from '@/components/EditIncomeModal';
import { EditFixedExpenseModal } from '@/components/EditFixedExpenseModal';
import { SettingsModal } from '@/components/SettingsModal';
import { Plus, LayoutDashboard, ReceiptText, CalendarCheck, Users } from 'lucide-react';

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => getMonthKey());
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<PersonId | 'all'>('all');
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Ekleme Modalları
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Düzenleme Modalları
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
  const [editingFixedExpense, setEditingFixedExpense] = useState<FixedExpenseItem | null>(null);

  // İlk yükleme ve ay verisi çekme
  const fetchMonthData = useCallback(async (monthKey: string) => {
    const data = await loadMonthWithCloud(monthKey);
    setBudget(data);
  }, []);

  useEffect(() => {
    // Bulut bağlantı kontrolü
    const db = initFirebase();
    setIsCloudConnected(!!db);

    fetchMonthData(currentMonth);

    // Eğer Firebase aktifse canlı dinle
    const unsubscribe = subscribeToMonth(currentMonth, (updated) => {
      setBudget(updated);
      saveLocalMonth(updated);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
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

  // 8. Excel İndir
  const handleExportExcel = () => {
    if (!budget) return;
    exportBudgetToExcel(budget, settings);
  };

  // 8.5 Örnek Demo Verisi Yükle
  const handleLoadMockup = () => {
    if (confirm('Mevcut aya 1 aylık gerçekçi örnek bütçe ve harcama verileri yüklensin mi?')) {
      const mock = getMockupMonthBudget(currentMonth);
      setBudget(mock);
      saveMonthWithCloud(mock);
    }
  };

  // 9. Ayarları Kaydet
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  // 10. Firebase Bağlantısı
  const handleConnectFirebase = (configStr: string) => {
    try {
      const parsed = JSON.parse(configStr);
      localStorage.setItem('aile_butcesi_firebase_config', JSON.stringify(parsed));
      const db = initFirebase();
      setIsCloudConnected(!!db);
      if (budget) {
        saveMonthWithCloud(budget);
      }
    } catch {
      alert('Firebase yapılandırma formatı geçersiz. Lütfen geçerli bir JSON girin.');
    }
  };

  if (!budget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-600">Bütçe yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 pb-24 sm:pb-12">
      
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* ======================================================== */}
        {/* 1. ANASAYFA GÖRÜNÜMÜ: Özet, Ödeme Kanalları, Kişi Harcamaları, Kategori Dağılımı */}
        {/* ======================================================== */}
        {currentView === 'dashboard' && (
          <div className="space-y-5">
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
        {/* 2. MUHASEBE GÖRÜNÜMÜ: Gelirler & Günlük Harcamalar (Ferah İki Kolon) */}
        {/* ======================================================== */}
        {currentView === 'accounting' && (
          <div className="space-y-5">
            
            {/* Hızlı Filtre Paneli */}
            <div className="bg-white rounded-xl border border-zinc-200 p-3.5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Users className="w-3.5 h-3.5 text-zinc-400" /> Kişi:
                </span>
                <button
                  onClick={() => setSelectedPersonId('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedPersonId === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  Tümü
                </button>
                {settings.persons.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonId(selectedPersonId === p.id ? 'all' : p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      selectedPersonId === p.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    <span>{p.avatar}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* İki Kolonlu Muhasebe Tablosu: Sol Gelirler, Sağ Harcamalar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Sol Kolon: Gelirler (5 birim) - Artık doğrudan tepede, asla altta kalmıyor! */}
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

              {/* Sağ Kolon: Günlük & Değişken Harcamalar (7 birim) */}
              <div className="lg:col-span-7">
                <VariableExpensesCard
                  expenses={budget.expenses}
                  persons={settings.persons}
                  categories={settings.categories}
                  selectedPersonId={selectedPersonId}
                  onDeleteExpense={handleDeleteExpense}
                  onEditExpense={(expense) => setEditingExpense(expense)}
                  onOpenAddExpense={() => setIsAddExpenseOpen(true)}
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
            <div className="bg-white rounded-xl border border-zinc-200 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Users className="w-3.5 h-3.5 text-zinc-400" /> Kişi:
                </span>
                <button
                  onClick={() => setSelectedPersonId('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedPersonId === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  Tümü
                </button>
                {settings.persons.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonId(selectedPersonId === p.id ? 'all' : p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      selectedPersonId === p.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    <span>{p.avatar}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              <div className="text-xs text-zinc-500 font-medium">
                Bu ayki faturalarınızı tikleyin veya sağ taraftan kalıcı şablonlarınızı yönetin.
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

      </main>

      {/* Mobil İçin Alt Gezinti Çubuğu (Bottom Navigation Bar - 3 Sekmeli) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold transition cursor-pointer ${
            currentView === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-zinc-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Anasayfa</span>
        </button>

        <button
          onClick={() => setCurrentView('accounting')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold transition cursor-pointer ${
            currentView === 'accounting' ? 'text-emerald-600 font-bold' : 'text-zinc-500'
          }`}
        >
          <ReceiptText className="w-5 h-5" />
          <span>Muhasebe</span>
        </button>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center transition active:scale-95 cursor-pointer -mt-4 border-2 border-white"
          aria-label="Harcama Ekle"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setCurrentView('bills')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold transition cursor-pointer ${
            currentView === 'bills' ? 'text-emerald-600 font-bold' : 'text-zinc-500'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span>Faturalar</span>
        </button>
      </div>

      {/* Ekleme Modalları */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        persons={settings.persons}
        categories={settings.categories}
        onAddExpense={handleAddExpense}
        defaultPersonId={selectedPersonId !== 'all' ? selectedPersonId : (settings.persons[0]?.id || 'anne')}
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
        isCloudConnected={isCloudConnected}
        onLoadMockup={handleLoadMockup}
        onDataRestored={() => fetchMonthData(currentMonth)}
      />

    </div>
  );
}
