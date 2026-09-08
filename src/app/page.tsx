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

import { Header } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { FixedExpensesCard } from '@/components/FixedExpensesCard';
import { VariableExpensesCard } from '@/components/VariableExpensesCard';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { IncomesCard } from '@/components/IncomesCard';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { AddIncomeModal } from '@/components/AddIncomeModal';
import { SettingsModal } from '@/components/SettingsModal';
import { Plus, LayoutDashboard, ReceiptText, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => getMonthKey());
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<PersonId | 'all'>('all');
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'accounting'>('dashboard');

  // Modallar
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Ilk yukleme ve ay verisi cekme
  const fetchMonthData = useCallback(async (monthKey: string) => {
    const data = await loadMonthWithCloud(monthKey);
    setBudget(data);
  }, []);

  useEffect(() => {
    // Bulut baglanti kontrolu
    const db = initFirebase();
    setIsCloudConnected(!!db);

    fetchMonthData(currentMonth);

    // Eger Firebase aktifse canli dinle
    const unsubscribe = subscribeToMonth(currentMonth, (updated) => {
      setBudget(updated);
      saveLocalMonth(updated);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentMonth, fetchMonthData]);

  // Kaydetme yardimci fonksiyonu
  const updateBudget = (updater: (prev: MonthlyBudget) => MonthlyBudget) => {
    if (!budget) return;
    const newBudget = updater(budget);
    setBudget(newBudget);
    saveMonthWithCloud(newBudget);
  };

  // 1. Sabit Gider Odendi / Bekliyor Degistir
  const handleTogglePaid = (id: string) => {
    updateBudget(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(f =>
        f.id === id ? { ...f, isPaid: !f.isPaid, paidAt: !f.isPaid ? new Date().toISOString() : undefined } : f
      ),
    }));
  };

  // 2. Sabit Gider Tutarini Guncelle
  const handleUpdateFixedAmount = (id: string, newAmount: number) => {
    updateBudget(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(f =>
        f.id === id ? { ...f, actualAmount: newAmount } : f
      ),
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

  // 5. Degisken Harcama Ekle
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

  // 6. Degisken Harcama Sil
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

  // 7.5 Gelir Sil
  const handleDeleteIncome = (id: string) => {
    updateBudget(prev => ({
      ...prev,
      incomes: prev.incomes.filter(i => i.id !== id),
    }));
  };

  // 8. Excel Indir
  const handleExportExcel = () => {
    if (!budget) return;
    exportBudgetToExcel(budget, settings);
  };

  // 8.5 Ornek Demo Verisi Yukle
  const handleLoadMockup = () => {
    if (confirm('Mevcut aya 1 aylık gerçekçi örnek bütçe ve harcama verileri yüklensin mi?')) {
      const mock = getMockupMonthBudget(currentMonth);
      setBudget(mock);
      saveMonthWithCloud(mock);
    }
  };

  // 9. Ayarlari Kaydet
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  // 10. Firebase Baglantisi
  const handleConnectFirebase = (configStr: string) => {
    try {
      const parsed = JSON.parse(configStr);
      localStorage.setItem('aile_butcesi_firebase_config', JSON.stringify(parsed));
      const db = initFirebase();
      setIsCloudConnected(!!db);
      if (budget) {
        saveMonthWithCloud(budget);
      }
    } catch (err) {
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
      
      {/* Ust Cubuk & Menu */}
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        activeView={currentView}
        onViewChange={setCurrentView}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenAddIncome={() => setIsAddIncomeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportExcel={handleExportExcel}
        onLoadMockup={handleLoadMockup}
        isCloudConnected={isCloudConnected}
      />

      {/* Ana Govde */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* 1. ANASAYFA GORUNUMU: Ozet, Kisi Harcamalari, Nereye Ne Kadar Harcadik */}
        {currentView === 'dashboard' && (
          <div className="space-y-5">
            {/* Toplam Gelir, Gider, Net Butce ve Kisi Bazli Harcamalar */}
            <SummaryCards
              budget={budget}
              persons={settings.persons}
              selectedPersonId={selectedPersonId}
              onSelectPerson={setSelectedPersonId}
            />

            {/* Nereye Ne Kadar Harcadik? (Kategori Dagilimi - Artik Genis ve Ferah) */}
            <CategoryBreakdown
              budget={budget}
              categories={settings.categories}
              selectedPersonId={selectedPersonId}
              onGoToAccounting={() => setCurrentView('accounting')}
            />
          </div>
        )}

        {/* 2. MUHASEBE GORUNUMU: Fatura ve Harcama Islemleri, Girisler ve Dokumler */}
        {currentView === 'accounting' && (
          <div className="space-y-5">
            
            {/* Hizli Filtre & Islemler Paneli */}
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

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAddIncomeOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer border border-emerald-200"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Gelir Ekle</span>
                </button>

                <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Harcama Ekle</span>
                </button>
              </div>
            </div>

            {/* Iki Kolonlu Muhasebe Tablosu */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Sol Kolon: Sabit Giderler & Faturalar + Gelirler (5 birim) */}
              <div className="lg:col-span-5 space-y-5">
                <FixedExpensesCard
                  fixedExpenses={budget.fixedExpenses}
                  persons={settings.persons}
                  categories={settings.categories}
                  selectedPersonId={selectedPersonId}
                  onTogglePaid={handleTogglePaid}
                  onUpdateAmount={handleUpdateFixedAmount}
                  onDeleteExpense={handleDeleteFixedExpense}
                  onAddFixedExpense={handleAddFixedExpense}
                />

                <IncomesCard
                  incomes={budget.incomes}
                  persons={settings.persons}
                  selectedPersonId={selectedPersonId}
                  onDeleteIncome={handleDeleteIncome}
                  onOpenAddIncome={() => setIsAddIncomeOpen(true)}
                />
              </div>

              {/* Sag Kolon: Gunluk & Degisken Harcamalar (7 birim) */}
              <div className="lg:col-span-7">
                <VariableExpensesCard
                  expenses={budget.expenses}
                  persons={settings.persons}
                  categories={settings.categories}
                  selectedPersonId={selectedPersonId}
                  onDeleteExpense={handleDeleteExpense}
                  onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                />
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Mobil Icin Alt Gezinti Cubugu (Bottom Navigation Bar) */}
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
          onClick={() => setIsAddExpenseOpen(true)}
          className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center transition active:scale-95 cursor-pointer -mt-5 border-4 border-white"
          aria-label="Harcama Ekle"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
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
      </div>

      {/* Modallar */}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onConnectFirebase={handleConnectFirebase}
        isCloudConnected={isCloudConnected}
      />

    </div>
  );
}
