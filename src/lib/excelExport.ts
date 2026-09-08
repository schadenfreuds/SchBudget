import * as XLSX from 'xlsx';
import { MonthlyBudget, AppSettings } from '@/types/budget';
import { formatMonthDisplay } from './storage';

export function exportBudgetToExcel(budget: MonthlyBudget, settings: AppSettings) {
  const wb = XLSX.utils.book_new();

  const getPersonName = (personId: string) => {
    return settings.persons.find(p => p.id === personId)?.name || personId;
  };

  const getCategoryName = (catId: string) => {
    return settings.categories.find(c => c.id === catId)?.name || catId;
  };

  // 1. Sayfa: Aylık Özet
  const totalIncome = budget.incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const fixedTotal = budget.fixedExpenses.reduce((s, f) => s + (Number(f.actualAmount || f.expectedAmount) || 0), 0);
  const variableTotal = budget.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalExpense = fixedTotal + variableTotal;
  const netBalance = totalIncome - totalExpense;

  const summaryData = [
    ['AİLE BÜTÇESİ VE AYLIK GİDER RAPORU'],
    ['Dönem:', formatMonthDisplay(budget.monthKey)],
    ['Oluşturulma Tarihi:', new Date().toLocaleDateString('tr-TR')],
    [],
    ['GENEL DURUM', 'TUTAR (TL)'],
    ['Toplam Gelir', totalIncome],
    ['Sabit Giderler Toplamı', fixedTotal],
    ['Değişken Harcamalar Toplamı', variableTotal],
    ['Toplam Gider', totalExpense],
    ['NET KALAN BÜTÇE', netBalance],
    [],
    ['KİŞİ BAZLI HARCAMA VE GELİR DAĞILIMI'],
    ['Kişi', 'Gelir (TL)', 'Harcama (TL)', 'Net Katkı/Fark (TL)']
  ];

  settings.persons.forEach(person => {
    const pIncome = budget.incomes
      .filter(i => i.personId === person.id)
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);
    
    const pFixed = budget.fixedExpenses
      .filter(f => f.personId === person.id)
      .reduce((s, f) => s + (Number(f.actualAmount || f.expectedAmount) || 0), 0);

    const pVar = budget.expenses
      .filter(e => e.personId === person.id)
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const pExpense = pFixed + pVar;
    summaryData.push([person.name, pIncome, pExpense, pIncome - pExpense]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Aylık Özet');

  // 2. Sayfa: Sabit Giderler
  const fixedHeader = ['Gider Adı', 'Kategori', 'Kişi / Sorumlu', 'Beklenen Tutar (TL)', 'Ödenen Tutar (TL)', 'Durum', 'Son Ödeme Günü', 'Not'];
  const fixedRows = budget.fixedExpenses.map(f => [
    f.title,
    getCategoryName(f.categoryId),
    getPersonName(f.personId),
    f.expectedAmount || 0,
    f.actualAmount || f.expectedAmount || 0,
    f.isPaid ? 'ÖDENDİ' : 'BEKLİYOR',
    f.dueDate ? `Her ayın ${f.dueDate}. günü` : '-',
    f.note || ''
  ]);
  const wsFixed = XLSX.utils.aoa_to_sheet([fixedHeader, ...fixedRows]);
  XLSX.utils.book_append_sheet(wb, wsFixed, 'Sabit Giderler');

  // 3. Sayfa: Değişken Harcamalar
  const varHeader = ['Tarih', 'Harcama Açıklaması', 'Tutar (TL)', 'Kategori', 'Harcayan Kişi', 'Ödeme Yöntemi', 'Not'];
  const sortedExpenses = [...budget.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const varRows = sortedExpenses.map(e => [
    e.date,
    e.title,
    e.amount,
    getCategoryName(e.categoryId),
    getPersonName(e.personId),
    e.paymentMethod === 'kredi_karti' ? 'Kredi Kartı' : e.paymentMethod === 'nakit' ? 'Nakit' : 'Diğer',
    e.note || ''
  ]);
  const wsVar = XLSX.utils.aoa_to_sheet([varHeader, ...varRows]);
  XLSX.utils.book_append_sheet(wb, wsVar, 'Harcama Listesi');

  // 4. Sayfa: Gelirler
  const incHeader = ['Tarih', 'Gelir Tanımı', 'Tutar (TL)', 'İlgili Kişi', 'Not'];
  const incRows = budget.incomes.map(i => [
    i.date,
    i.title,
    i.amount,
    getPersonName(i.personId),
    i.note || ''
  ]);
  const wsInc = XLSX.utils.aoa_to_sheet([incHeader, ...incRows]);
  XLSX.utils.book_append_sheet(wb, wsInc, 'Gelirler');

  // Excel dosyasını tetikle
  const fileName = `Aile_Butcesi_${budget.monthKey}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
