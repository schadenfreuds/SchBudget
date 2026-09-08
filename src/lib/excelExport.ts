import XLSX from 'xlsx-js-style';
import { MonthlyBudget, AppSettings } from '@/types/budget';
import { formatMonthDisplay } from './storage';

// Renk Paleti (Modern & Profesyonel Finans Teması)
const C = {
  emeraldDark: '065F46',    // Ana zümrüt başlık
  emeraldLight: 'ECFDF5',   // Gelir kartı dolgu
  emeraldText: '047857',
  blueDark: '1E3A8A',       // Sabit gider başlık
  blueLight: 'EFF6FF',      // Net bakiye kartı dolgu
  blueText: '1D4ED8',
  purpleDark: '4C1D95',     // Harcamalar başlık
  amberDark: '92400E',      // Bekleyen fatura metin
  amberLight: 'FEF3C7',     // Sabit gider kartı dolgu
  roseDark: '9F1239',       // Harcama kartı metin
  roseLight: 'FFE4E6',      // Harcama kartı dolgu
  slateHeader: '1E293B',    // Alt bölüm başlıkları
  slateBg: 'F8FAFC',        // Alternatif satır rengi
  border: 'CBD5E1',         // Hücre kenarlık rengi
  borderDark: '64748B',     // Toplam çizgisi
  white: 'FFFFFF',
  textMain: '0F172A',       // Koyu metin
  textMuted: '64748B',      // Gri metin
};

// Ortak Kenarlık Şablonları
const thinBorder = {
  top: { style: 'thin', color: { rgb: C.border } },
  bottom: { style: 'thin', color: { rgb: C.border } },
  left: { style: 'thin', color: { rgb: C.border } },
  right: { style: 'thin', color: { rgb: C.border } },
};

const totalBorder = {
  top: { style: 'thin', color: { rgb: C.borderDark } },
  bottom: { style: 'double', color: { rgb: C.borderDark } },
  left: { style: 'thin', color: { rgb: C.border } },
  right: { style: 'thin', color: { rgb: C.border } },
};

// Yardımcı hücre ekleme fonksiyonu
function addCell(
  ws: Record<string, any>,
  r: number,
  c: number,
  val: any,
  style?: Record<string, any>,
  numFmt?: string
) {
  const ref = XLSX.utils.encode_cell({ r, c });
  const cell: any = { v: val ?? '' };

  if (typeof val === 'number') {
    cell.t = 'n';
    if (numFmt) cell.z = numFmt;
  } else if (typeof val === 'boolean') {
    cell.t = 'b';
  } else {
    cell.t = 's';
  }

  if (style) {
    cell.s = { ...style };
    if (numFmt && !cell.s.numFmt) {
      cell.s.numFmt = numFmt;
    }
  }

  ws[ref] = cell;
}

export function exportBudgetToExcel(budget: MonthlyBudget, settings: AppSettings) {
  const wb = XLSX.utils.book_new();

  const getPerson = (personId: string) => {
    return settings.persons.find(p => p.id === personId);
  };

  const getPersonName = (personId: string) => {
    return getPerson(personId)?.name || personId;
  };

  const getCategory = (catId: string) => {
    return settings.categories.find(c => c.id === catId);
  };

  const getCategoryName = (catId: string) => {
    const c = getCategory(catId);
    return c ? `${c.icon} ${c.name}` : catId;
  };

  // Toplamlar
  const totalIncome = budget.incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const fixedTotal = budget.fixedExpenses.reduce((s, f) => s + (Number(f.actualAmount || f.expectedAmount) || 0), 0);
  const variableTotal = budget.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalExpense = fixedTotal + variableTotal;
  const netBalance = totalIncome - totalExpense;

  /* ==========================================================================
     1. SAYFA: 📊 AYLIK ÖZET (DASHBOARD)
     ========================================================================== */
  const wsSummary: Record<string, any> = {};
  const sMerges: any[] = [];

  // 1. Ana Başlık Banner'ı
  for (let c = 0; c <= 6; c++) {
    addCell(wsSummary, 0, c, c === 0 ? '🏡 AİLE BÜTÇESİ & EV MUHASEBESİ RAPORU' : '', {
      font: { name: 'Segoe UI', sz: 14, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.emeraldDark } },
      alignment: { horizontal: 'left', vertical: 'center' },
    });
    addCell(wsSummary, 1, c, c === 0 ? `Dönem: ${formatMonthDisplay(budget.monthKey)}   |   Rapor Alma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}` : '', {
      font: { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: 'D1FAE5' } },
      fill: { fgColor: { rgb: C.emeraldDark } },
      alignment: { horizontal: 'left', vertical: 'center' },
    });
  }
  sMerges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });
  sMerges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 6 } });

  // 2. KPI Özet Kartları (Satır 3-4)
  // Kart 1: Toplam Gelir
  addCell(wsSummary, 3, 0, 'TOPLAM GELİR', {
    font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.emeraldText } },
    fill: { fgColor: { rgb: C.emeraldLight } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
  });
  addCell(wsSummary, 4, 0, totalIncome, {
    font: { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: C.emeraldText } },
    fill: { fgColor: { rgb: C.emeraldLight } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
  }, '#,##0.00 "₺"');

  // Kart 2: Sabit Giderler
  addCell(wsSummary, 3, 2, 'SABİT GİDERLER (FATURALAR)', {
    font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.amberDark } },
    fill: { fgColor: { rgb: C.amberLight } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
  });
  addCell(wsSummary, 4, 2, fixedTotal, {
    font: { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: C.amberDark } },
    fill: { fgColor: { rgb: C.amberLight } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
  }, '#,##0.00 "₺"');

  // Kart 3: Değişken Giderler
  addCell(wsSummary, 3, 4, 'DEĞİŞKEN HARCAMALAR', {
    font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.roseDark } },
    fill: { fgColor: { rgb: C.roseLight } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
  });
  addCell(wsSummary, 4, 4, variableTotal, {
    font: { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: C.roseDark } },
    fill: { fgColor: { rgb: C.roseLight } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
  }, '#,##0.00 "₺"');

  // Kart 4: Net Bakiye
  addCell(wsSummary, 3, 6, 'NET KALAN BAKİYE / TASARRUF', {
    font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: netBalance >= 0 ? C.blueText : C.roseDark } },
    fill: { fgColor: { rgb: netBalance >= 0 ? C.blueLight : C.roseLight } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
  });
  addCell(wsSummary, 4, 6, netBalance, {
    font: { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: netBalance >= 0 ? C.blueText : C.roseDark } },
    fill: { fgColor: { rgb: netBalance >= 0 ? C.blueLight : C.roseLight } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
  }, '#,##0.00 "₺"');

  // Kartlar için aralık birleştirmeleri
  addCell(wsSummary, 3, 1, '', thinBorder);
  addCell(wsSummary, 4, 1, '', thinBorder);
  sMerges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: 1 } });
  sMerges.push({ s: { r: 4, c: 0 }, e: { r: 4, c: 1 } });

  addCell(wsSummary, 3, 3, '', thinBorder);
  addCell(wsSummary, 4, 3, '', thinBorder);
  sMerges.push({ s: { r: 3, c: 2 }, e: { r: 3, c: 3 } });
  sMerges.push({ s: { r: 4, c: 2 }, e: { r: 4, c: 3 } });

  addCell(wsSummary, 3, 5, '', thinBorder);
  addCell(wsSummary, 4, 5, '', thinBorder);
  sMerges.push({ s: { r: 3, c: 4 }, e: { r: 3, c: 5 } });
  sMerges.push({ s: { r: 4, c: 4 }, e: { r: 4, c: 5 } });

  // 3. Tablo 1: Kişi Bazlı Dağılım
  let r = 6;
  for (let c = 0; c <= 6; c++) {
    addCell(wsSummary, r, c, c === 0 ? '👥 AİLE BİREYLERİ BAZINDA GELİR VE GİDER TABLOSU' : '', {
      font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.slateHeader } },
      alignment: { horizontal: 'left', vertical: 'center' },
    });
  }
  sMerges.push({ s: { r, c: 0 }, e: { r, c: 6 } });

  r = 7;
  const personCols = ['Aile Bireyi', 'Rol / Konum', 'Kazanılan Gelir', 'Sabit Gider Payı', 'Değişken Harcama', 'Toplam Masraf', 'Net Katkı / Bakiye'];
  personCols.forEach((col, idx) => {
    addCell(wsSummary, r, idx, col, {
      font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.emeraldDark } },
      alignment: { horizontal: idx < 2 ? 'left' : 'right', vertical: 'center' },
      border: thinBorder,
    });
  });

  settings.persons.forEach(person => {
    r++;
    const pIncome = budget.incomes
      .filter(i => i.personId === person.id)
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);
    
    const pFixed = budget.fixedExpenses
      .filter(f => f.personId === person.id)
      .reduce((s, f) => s + (Number(f.actualAmount || f.expectedAmount) || 0), 0);

    const pVar = budget.expenses
      .filter(e => e.personId === person.id)
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const pTotalExpense = pFixed + pVar;
    const pNet = pIncome - pTotalExpense;

    addCell(wsSummary, r, 0, `${person.avatar || '👤'} ${person.name}`, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsSummary, r, 1, person.role || 'Birey', { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsSummary, r, 2, pIncome, { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMain } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '#,##0.00 "₺"');
    addCell(wsSummary, r, 3, pFixed, { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMain } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '#,##0.00 "₺"');
    addCell(wsSummary, r, 4, pVar, { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMain } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '#,##0.00 "₺"');
    addCell(wsSummary, r, 5, pTotalExpense, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '#,##0.00 "₺"');
    addCell(wsSummary, r, 6, pNet, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: pNet >= 0 ? C.emeraldText : C.roseDark } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '#,##0.00 "₺"');
  });

  // Toplam Satırı (Kişiler)
  r++;
  addCell(wsSummary, r, 0, 'TOPLAM GENEL', { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'left', vertical: 'center' }, border: totalBorder });
  addCell(wsSummary, r, 1, '-', { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: totalBorder });
  addCell(wsSummary, r, 2, totalIncome, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorder }, '#,##0.00 "₺"');
  addCell(wsSummary, r, 3, fixedTotal, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorder }, '#,##0.00 "₺"');
  addCell(wsSummary, r, 4, variableTotal, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorder }, '#,##0.00 "₺"');
  addCell(wsSummary, r, 5, totalExpense, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorder }, '#,##0.00 "₺"');
  addCell(wsSummary, r, 6, netBalance, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: netBalance >= 0 ? C.emeraldText : C.roseDark } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorder }, '#,##0.00 "₺"');

  // 4. Tablo 2: Kategori Dağılımı
  r += 2;
  for (let c = 0; c <= 3; c++) {
    addCell(wsSummary, r, c, c === 0 ? '📊 KATEGORİ BAZLI HARCAMA ÖZETİ' : '', {
      font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.slateHeader } },
      alignment: { horizontal: 'left', vertical: 'center' },
    });
  }
  sMerges.push({ s: { r, c: 0 }, e: { r, c: 3 } });

  r++;
  const catCols = ['Harcama Kategorisi', 'İşlem Sayısı', 'Toplam Harcama', 'Gider Payı (%)'];
  catCols.forEach((col, idx) => {
    addCell(wsSummary, r, idx, col, {
      font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.slateHeader } },
      alignment: { horizontal: idx < 1 ? 'left' : idx === 1 ? 'center' : 'right', vertical: 'center' },
      border: thinBorder,
    });
  });

  const categoryTotals: Record<string, { count: number; total: number }> = {};
  budget.fixedExpenses.forEach(f => {
    const cid = f.categoryId || 'diger';
    if (!categoryTotals[cid]) categoryTotals[cid] = { count: 0, total: 0 };
    categoryTotals[cid].count += 1;
    categoryTotals[cid].total += Number(f.actualAmount || f.expectedAmount || 0);
  });
  budget.expenses.forEach(e => {
    const cid = e.categoryId || 'diger';
    if (!categoryTotals[cid]) categoryTotals[cid] = { count: 0, total: 0 };
    categoryTotals[cid].count += 1;
    categoryTotals[cid].total += Number(e.amount || 0);
  });

  const sortedCatEntries = Object.entries(categoryTotals)
    .filter(([_, data]) => data.total > 0)
    .sort((a, b) => b[1].total - a[1].total);

  sortedCatEntries.forEach(([cid, data]) => {
    r++;
    const cat = getCategory(cid);
    const catName = cat ? `${cat.icon} ${cat.name}` : cid;
    const share = totalExpense > 0 ? (data.total / totalExpense) : 0;

    addCell(wsSummary, r, 0, catName, { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMain } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsSummary, r, 1, `${data.count} işlem`, { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, alignment: { horizontal: 'center', vertical: 'center' }, border: thinBorder });
    addCell(wsSummary, r, 2, data.total, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '#,##0.00 "₺"');
    addCell(wsSummary, r, 3, share, { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '0.0%');
  });

  wsSummary['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r + 1, c: 6 } });
  wsSummary['!merges'] = sMerges;
  wsSummary['!cols'] = [
    { wch: 28 }, // A
    { wch: 18 }, // B
    { wch: 20 }, // C
    { wch: 20 }, // D
    { wch: 20 }, // E
    { wch: 20 }, // F
    { wch: 24 }, // G
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Aylık Özet');

  /* ==========================================================================
     2. SAYFA: ⚡ SABİT GİDERLER & RUTİN FATURALAR
     ========================================================================== */
  const wsFixed: Record<string, any> = {};
  const fMerges: any[] = [];

  for (let c = 0; c <= 7; c++) {
    addCell(wsFixed, 0, c, c === 0 ? '⚡ SABİT GİDERLER & AYLIK RUTİN FATURALAR' : '', {
      font: { name: 'Segoe UI', sz: 13, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.blueDark } },
      alignment: { horizontal: 'left', vertical: 'center' },
    });
  }
  fMerges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });

  const fixedHeaders = ['Gider / Fatura Adı', 'Kategori', 'Sorumlu Birey', 'Beklenen Tutar', 'Ödenen Tutar', 'Durum', 'Vade Günü', 'Açıklama / Not'];
  fixedHeaders.forEach((h, idx) => {
    addCell(wsFixed, 1, idx, h, {
      font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.blueDark } },
      alignment: { horizontal: idx >= 3 && idx <= 4 ? 'right' : idx === 5 || idx === 6 ? 'center' : 'left', vertical: 'center' },
      border: thinBorder,
    });
  });

  let fr = 1;
  let fixedExpTotal = 0;
  let fixedActTotal = 0;

  budget.fixedExpenses.forEach(f => {
    fr++;
    const expected = Number(f.expectedAmount || 0);
    const actual = Number(f.actualAmount || f.expectedAmount || 0);
    fixedExpTotal += expected;
    fixedActTotal += actual;

    addCell(wsFixed, fr, 0, f.title, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsFixed, fr, 1, getCategoryName(f.categoryId), { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMain } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsFixed, fr, 2, getPersonName(f.personId), { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMain } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsFixed, fr, 3, expected, { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '#,##0.00 "₺"');
    addCell(wsFixed, fr, 4, actual, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '#,##0.00 "₺"');
    addCell(wsFixed, fr, 5, f.isPaid ? '✓ ÖDENDİ' : '⏳ BEKLİYOR', {
      font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: f.isPaid ? '047857' : 'B45309' } },
      fill: { fgColor: { rgb: f.isPaid ? 'D1FAE5' : 'FEF3C7' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinBorder,
    });
    addCell(wsFixed, fr, 6, f.dueDate ? `Ayın ${f.dueDate}. günü` : '-', { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, alignment: { horizontal: 'center', vertical: 'center' }, border: thinBorder });
    addCell(wsFixed, fr, 7, f.note || '', { font: { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: C.textMuted } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
  });

  // Sabit Toplam Satırı
  fr++;
  addCell(wsFixed, fr, 0, 'SABİT GİDERLER TOPLAMI', { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'left', vertical: 'center' }, border: totalBorder });
  addCell(wsFixed, fr, 1, '-', { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: totalBorder });
  addCell(wsFixed, fr, 2, '-', { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: totalBorder });
  addCell(wsFixed, fr, 3, fixedExpTotal, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMuted } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorder }, '#,##0.00 "₺"');
  addCell(wsFixed, fr, 4, fixedActTotal, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorder }, '#,##0.00 "₺"');
  addCell(wsFixed, fr, 5, '', totalBorder);
  addCell(wsFixed, fr, 6, '', totalBorder);
  addCell(wsFixed, fr, 7, '', totalBorder);

  wsFixed['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: fr + 1, c: 7 } });
  wsFixed['!merges'] = fMerges;
  wsFixed['!cols'] = [
    { wch: 28 }, // Gider Adı
    { wch: 22 }, // Kategori
    { wch: 18 }, // Sorumlu
    { wch: 18 }, // Beklenen
    { wch: 18 }, // Ödenen
    { wch: 15 }, // Durum
    { wch: 18 }, // Vade
    { wch: 25 }, // Not
  ];
  XLSX.utils.book_append_sheet(wb, wsFixed, 'Sabit Giderler');

  /* ==========================================================================
     3. SAYFA: 🛒 HARCAMA LİSTESİ (DEĞİŞKEN GİDERLER)
     ========================================================================== */
  const wsVar: Record<string, any> = {};
  const vMerges: any[] = [];

  for (let c = 0; c <= 6; c++) {
    addCell(wsVar, 0, c, c === 0 ? '🛒 GÜNLÜK & DEĞİŞKEN HARCAMA HAREKETLERİ' : '', {
      font: { name: 'Segoe UI', sz: 13, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.purpleDark } },
      alignment: { horizontal: 'left', vertical: 'center' },
    });
  }
  vMerges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });

  const varHeaders = ['İşlem Tarihi', 'Harcama Açıklaması', 'Harcama Tutarı', 'Kategori', 'Harcayan Birey', 'Ödeme Türü', 'Not'];
  varHeaders.forEach((h, idx) => {
    addCell(wsVar, 1, idx, h, {
      font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.purpleDark } },
      alignment: { horizontal: idx === 2 ? 'right' : idx === 0 || idx === 5 ? 'center' : 'left', vertical: 'center' },
      border: thinBorder,
    });
  });

  let vr = 1;
  const sortedExpenses = [...budget.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedExpenses.forEach(e => {
    vr++;
    const amt = Number(e.amount || 0);

    addCell(wsVar, vr, 0, e.date || '-', { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, alignment: { horizontal: 'center', vertical: 'center' }, border: thinBorder });
    addCell(wsVar, vr, 1, e.title, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsVar, vr, 2, amt, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.roseDark } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '#,##0.00 "₺"');
    addCell(wsVar, vr, 3, getCategoryName(e.categoryId), { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMain } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsVar, vr, 4, getPersonName(e.personId), { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMain } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsVar, vr, 5, e.paymentMethod === 'kredi_karti' ? '💳 Kredi Kartı' : e.paymentMethod === 'nakit' ? '💵 Nakit' : '🏦 Havale/EFT', {
      font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinBorder,
    });
    addCell(wsVar, vr, 6, e.note || '', { font: { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: C.textMuted } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
  });

  if (sortedExpenses.length === 0) {
    vr++;
    addCell(wsVar, vr, 0, 'Bu dönemde henüz değişken harcama kaydı girilmemiş.', { font: { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: C.textMuted } }, alignment: { horizontal: 'center', vertical: 'center' }, border: thinBorder });
    for (let c = 1; c <= 6; c++) addCell(wsVar, vr, c, '', thinBorder);
    vMerges.push({ s: { r: vr, c: 0 }, e: { r: vr, c: 6 } });
  }

  // Harcama Toplam Satırı
  vr++;
  addCell(wsVar, vr, 0, 'DEĞİŞKEN HARCAMALAR TOPLAMI', { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'left', vertical: 'center' }, border: totalBorder });
  addCell(wsVar, vr, 1, `${sortedExpenses.length} adet işlem`, { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: totalBorder });
  addCell(wsVar, vr, 2, variableTotal, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.roseDark } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorder }, '#,##0.00 "₺"');
  for (let c = 3; c <= 6; c++) addCell(wsVar, vr, c, '', totalBorder);

  wsVar['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: vr + 1, c: 6 } });
  wsVar['!merges'] = vMerges;
  wsVar['!cols'] = [
    { wch: 14 }, // Tarih
    { wch: 28 }, // Açıklama
    { wch: 18 }, // Tutar
    { wch: 22 }, // Kategori
    { wch: 18 }, // Kişi
    { wch: 16 }, // Yöntem
    { wch: 25 }, // Not
  ];
  XLSX.utils.book_append_sheet(wb, wsVar, 'Harcama Listesi');

  /* ==========================================================================
     4. SAYFA: 💰 GELİRLER LİSTESİ
     ========================================================================== */
  const wsInc: Record<string, any> = {};
  const iMerges: any[] = [];

  for (let c = 0; c <= 4; c++) {
    addCell(wsInc, 0, c, c === 0 ? '💰 AYLIK GELİR VE KAZANÇ GİRİŞLERİ' : '', {
      font: { name: 'Segoe UI', sz: 13, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.emeraldDark } },
      alignment: { horizontal: 'left', vertical: 'center' },
    });
  }
  iMerges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } });

  const incHeaders = ['Tarih', 'Gelir Açıklaması / Kaynağı', 'Gelir Tutarı', 'Geliri Getiren Birey', 'Not'];
  incHeaders.forEach((h, idx) => {
    addCell(wsInc, 1, idx, h, {
      font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.white } },
      fill: { fgColor: { rgb: C.emeraldDark } },
      alignment: { horizontal: idx === 2 ? 'right' : idx === 0 ? 'center' : 'left', vertical: 'center' },
      border: thinBorder,
    });
  });

  let ir = 1;
  budget.incomes.forEach(i => {
    ir++;
    const amt = Number(i.amount || 0);

    addCell(wsInc, ir, 0, i.date || '-', { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, alignment: { horizontal: 'center', vertical: 'center' }, border: thinBorder });
    addCell(wsInc, ir, 1, i.title, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsInc, ir, 2, amt, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.emeraldText } }, alignment: { horizontal: 'right', vertical: 'center' }, border: thinBorder }, '#,##0.00 "₺"');
    addCell(wsInc, ir, 3, getPersonName(i.personId), { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMain } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
    addCell(wsInc, ir, 4, i.note || '', { font: { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: C.textMuted } }, alignment: { horizontal: 'left', vertical: 'center' }, border: thinBorder });
  });

  if (budget.incomes.length === 0) {
    ir++;
    addCell(wsInc, ir, 0, 'Bu dönemde henüz gelir kaydı girilmemiş.', { font: { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: C.textMuted } }, alignment: { horizontal: 'center', vertical: 'center' }, border: thinBorder });
    for (let c = 1; c <= 4; c++) addCell(wsInc, ir, c, '', thinBorder);
    iMerges.push({ s: { r: ir, c: 0 }, e: { r: ir, c: 4 } });
  }

  // Gelir Toplam Satırı
  ir++;
  addCell(wsInc, ir, 0, 'TOPLAM GELİR', { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.textMain } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'left', vertical: 'center' }, border: totalBorder });
  addCell(wsInc, ir, 1, `${budget.incomes.length} adet gelir`, { font: { name: 'Segoe UI', sz: 9, color: { rgb: C.textMuted } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: totalBorder });
  addCell(wsInc, ir, 2, totalIncome, { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: C.emeraldText } }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorder }, '#,##0.00 "₺"');
  addCell(wsInc, ir, 3, '', totalBorder);
  addCell(wsInc, ir, 4, '', totalBorder);

  wsInc['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: ir + 1, c: 4 } });
  wsInc['!merges'] = iMerges;
  wsInc['!cols'] = [
    { wch: 14 }, // Tarih
    { wch: 28 }, // Açıklama
    { wch: 20 }, // Tutar
    { wch: 20 }, // Kişi
    { wch: 25 }, // Not
  ];
  XLSX.utils.book_append_sheet(wb, wsInc, 'Gelirler');

  // Excel dosyasını tetikle
  const fileName = `Aile_Butcesi_${budget.monthKey}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
