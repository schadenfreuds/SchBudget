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
} from '@/lib/storage';
import { initFirebase, subscribeToMonth } from '@/lib/firebase';
import { exportBudgetToExcel } from '@/lib/excelExport';

import { Header } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { FixedExpensesCard } from '@/components/FixedExpensesCard';
import { VariableExpensesCard } from '@/components/VariableExpensesCard';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { AddIncomeModal } from '@/components/AddIncomeModal';
import { SettingsModal } from '@/components/SettingsModal';
import { Plus } from 'lucide-react';

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => getMonthKey());
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<PersonId | 'all'>('all');
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Modallar
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

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

  // 2. Sabit Gider Tutarını Güncelle
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

  // 8. Excel İndir
  const handleExportExcel = () => {
    if (!budget) return;
    exportBudgetToExcel(budget, settings);
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
    <div className="min-h-screen bg-zinc-100 text-zinc-900 pb-20 sm:pb-12">
      
      {/* Üst Çubuk & Menü */}
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenAddIncome={() => setIsAddIncomeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportExcel={handleExportExcel}
        isCloudConnected={isCloudConnected}
      />

      {/* Ana Gövde */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Özet ve Kişi Kartları */}
        <SummaryCards
          budget={budget}
          persons={settings.persons}
          selectedPersonId={selectedPersonId}
          onSelectPerson={setSelectedPersonId}
        />

        {/* İki Sütunlu Ana Panel (Geniş Ekranda Yan Yana, Mobilde Alt Alta) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Sol Kolon: Sabit Giderler ve Faturalar (5 birim) */}
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

            {/* Kategori Dağılım Grafiği */}
            <CategoryBreakdown
              budget={budget}
              categories={settings.categories}
              selectedPersonId={selectedPersonId}
            />
          </div>

          {/* Sağ Kolon: Günlük & Değişken Harcama Akışı (7 birim) */}
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

      </main>

      {/* Mobil İçin Başparmak Dostu Hızlı Harcama Ekleme Butonu (Floating Button) */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
          aria-label="Harcama Ekle"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
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
