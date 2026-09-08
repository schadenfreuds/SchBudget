export type Language = 'tr' | 'en';
export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  TRY: { code: 'TRY', symbol: '₺', name: 'Türk Lirası (₺)' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
};

export const translations = {
  tr: {
    appTitle: 'Ev Muhasebesi',
    appSubtitle: 'Aile & Ev Bütçesi',
    cloud: 'Bulut',
    local: 'Yerel',
    thisMonth: 'Bu Ay',

    nav: {
      dashboard: 'Anasayfa',
      accounting: 'Harcamalar',
      bills: 'Faturalar',
      budget: 'Bütçe Planı',
      exportExcel: 'Excel',
      addExpense: 'Harcama',
      addIncome: 'Gelir',
      allPersons: 'Tümü',
    },

    months: [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ],

    summary: {
      totalIncome: 'Toplam Gelir',
      totalIncomeSub: 'Bu ay toplam net gelir',
      netBalance: 'Kalan Net Bakiye',
      surplusSub: 'Tasarruf / Artan',
      deficitSub: 'Bütçe Açığı!',
      fixedExpenses: 'Sabit Gider & Faturalar',
      fixedPaidSub: 'fatura ödendi',
      fixedPendingSub: 'bekleyen fatura',
      variableExpenses: 'Değişken Harcamalar',
      variableCountSub: 'adet harcama fişi',
      totalExpense: 'Toplam Gider',
      totalExpenseSub: 'sabit + değişken',
      savingsRate: 'Tasarruf Oranı',
      savingsRateSub: 'Gelirin tasarruf edilen payı',
    },

    category: {
      title: 'Kategoriye Göre Dağılım',
      totalSpent: 'Toplam Harcama',
      noExpenses: 'Henüz harcama kaydı yok.',
      fixedPortion: 'sabit',
      variablePortion: 'değişken',
    },

    variable: {
      title: 'Değişken Harcamalar & Fişler',
      searchPlaceholder: 'Harcama başlığı veya notlarda ara...',
      allPayments: 'Tüm Ödemeler',
      cash: 'Nakit',
      creditCard: 'Kredi Kartı',
      bankTransfer: 'Havale/EFT',
      totalSpent: 'Toplam Harcama',
      noRecords: 'Harcama kaydı bulunmuyor.',
      noRecordsSub: 'Yukarıdaki butondan ilk harcamanızı ekleyebilirsiniz.',
      deleteConfirm: 'Bu harcamayı silmek istediğinize emin misiniz?',
    },

    quick: {
      title: 'Hızlı Harcama Kısayolları',
      addCustom: 'Yeni Kısayol',
      addedSuccess: 'Eklendi!',
      newTitle: 'Yeni Hızlı Harcama Kısayolu Ekle',
      titleLabel: 'Kısayol Başlığı *',
      amountLabel: 'Varsayılan Tutar *',
      categoryLabel: 'Kategori *',
      personLabel: 'Varsayılan Kişi *',
      methodLabel: 'Ödeme Yöntemi *',
      saveBtn: 'Kısayolu Kaydet',
      cancelBtn: 'Vazgeç',
    },

    fixed: {
      title: 'Sabit Giderler & Faturalar',
      paidLabel: 'Ödenen',
      totalLabel: 'Toplam',
      newBill: 'Fatura Ekle',
      newBillTitle: 'Yeni Sabit Gider / Fatura Ekle',
      billTitle: 'Gider / Fatura Adı *',
      expectedAmount: 'Aylık Beklenen Tutar *',
      dueDate: 'Son Ödeme Günü (1-31)',
      category: 'Kategori',
      person: 'İlgili Kişi / Hesap',
      note: 'Not / Açıklama',
      saveBtn: 'Faturayı Kaydet',
      cancelBtn: 'Vazgeç',
      paid: 'Ödendi',
      unpaid: 'Ödenmedi',
      markPaid: 'Ödendi Yap',
      markUnpaid: 'Ödenmedi Yap',
      noBills: 'Bu ay için henüz fatura / sabit gider kaydı bulunmuyor.',
      noBillsSub: 'Sağ taraftaki şablonları bu aya aktarabilir veya yeni bir fatura ekleyebilirsiniz.',
      dueDayPrefix: 'Her ayın',
      dueDaySuffix: '. günü',
      deleteConfirm: 'Bu faturayı bu aydan silmek istediğinize emin misiniz?',
    },

    templates: {
      title: 'Rutin Gider Şablonları',
      addTemplate: 'Yeni Şablon',
      addTemplateTitle: 'Yeni Rutin Şablon Ekle',
      templateTitle: 'Şablon Adı *',
      defaultAmount: 'Varsayılan Aylık Tutar',
      saveBtn: 'Şablonu Kaydet',
      cancelBtn: 'Vazgeç',
      noTemplates: 'Kayıtlı rutin şablon bulunmuyor.',
      syncBarText: 'Eksik kalan şablonları mevcut aya ekle:',
      syncBtn: 'Mevcut Aya Yansıt',
      syncSuccess: 'Şablonlar Aktarıldı!',
      syncEmpty: 'Tüm şablonlar zaten mevcut ayda ekli.',
      deleteConfirm: 'Bu şablonu silmek istediğinize emin misiniz? Gelecek aylara yansıtılmayacak.',
      unspecified: 'Belirtilmedi',
    },

    incomes: {
      title: 'Gelirler & Maaşlar',
      totalIncome: 'Toplam',
      addIncome: 'Yeni Gelir',
      noIncomes: 'Bu ay için henüz gelir kaydı girilmedi.',
      noIncomesSub: 'Maaş, prim veya ek gelirlerinizi ekleyin.',
      deleteConfirm: 'Bu geliri silmek istediğinize emin misiniz?',
    },

    planner: {
      title: 'Aylık Bütçe & Tasarruf Hedefleri',
      limitLabel: 'Aylık Harcama Tavanı',
      limitDesc: 'Bu ay aşmamak istediğiniz maksimum toplam harcama limiti.',
      savingsLabel: 'Aylık Tasarruf Hedefi',
      savingsDesc: 'Bu ay kenara koymayı hedeflediğiniz birikim tutarı.',
      saveBtn: 'Hedefleri Güncelle',
      saveSuccess: 'Hedefler güncellendi!',
      limitUsed: 'Limit Kullanımı',
      limitRemaining: 'Kalan Harcama Payı',
      limitExceeded: 'Limit Aşıldı!',
      savingsProgress: 'Tasarruf Gerçekleşmesi',
      savingsAchieved: 'Hedefe Ulaşıldı!',
      notesTitle: 'Aylık Bütçe Notları & Hatırlatıcılar',
      notesPlaceholder: 'Bu ay için finansal hedefleriniz, özel planlarınız veya hatırlatmalarınız...',
      saveNotesBtn: 'Notları Kaydet',
      notesSaved: 'Notlar kaydedildi!',
    },

    modals: {
      addExpenseTitle: 'Yeni Harcama Ekle',
      editExpenseTitle: 'Harcamayı Düzenle',
      addIncomeTitle: 'Yeni Gelir Ekle',
      editIncomeTitle: 'Geliri Düzenle',
      editFixedTitle: 'Sabit Gideri Düzenle',
      titleLabel: 'Açıklama / Başlık *',
      amountLabel: 'Tutar',
      categoryLabel: 'Kategori *',
      personLabel: 'Harcamayı Yapan / Gelir Sahibi *',
      dateLabel: 'Tarih *',
      paymentMethodLabel: 'Ödeme Yöntemi *',
      noteLabel: 'Not (Opsiyonel)',
      actualAmountLabel: 'Gerçekleşen Tutar',
      expectedAmountLabel: 'Beklenen Tutar',
      isPaidLabel: 'Bu fatura ödendi olarak işaretlensin',
      saveBtn: 'Kaydet',
      updateBtn: 'Güncelle',
      cancelBtn: 'Vazgeç',
    },

    settings: {
      title: 'Uygulama Ayarları & Yönetim',
      tabs: {
        persons: 'Kişiler',
        categories: 'Kategoriler',
        theme: 'Görünüm & Dil',
        backup: 'Yedek & Veri',
        cloud: 'Bulut (Firebase)',
        devtools: 'Geliştirici',
      },
      appearance: {
        themeTitle: 'Tema Seçimi',
        themeDesc: 'Göz zevkinize göre açık, koyu veya sistem varsayılan temasını kullanın.',
        light: 'Açık Tema',
        lightDesc: 'Klasik aydınlık görünüm',
        dark: 'Koyu Tema',
        darkDesc: 'Gözü yormayan karanlık mod',
        system: 'Sistem Varsayılanı',
        systemDesc: 'Cihaz temasını izler',
        languageTitle: 'Dil Seçimi (Language)',
        languageDesc: 'Uygulama arayüz dilini değiştirin.',
        langTr: 'Türkçe',
        langTrDesc: 'Türkçe arayüz',
        langEn: 'English',
        langEnDesc: 'English interface',
        currencyTitle: 'Para Birimi (Currency)',
        currencyDesc: 'Bütçe tutarlarının gösterileceği para birimi simgesini seçin.',
      },
      backup: {
        title: 'Veri Yedekleme & Geri Yükleme',
        backupDesc: 'Tüm aylarınızı, harcamalarınızı ve ayarlarınızı JSON dosyası olarak cihazınıza yedekleyin veya eski yedeği geri yükleyin.',
        downloadBtn: 'Yedek İndir (JSON)',
        uploadBtn: 'Yedekten Geri Yükle',
        resetTitle: 'Tüm Verileri Sıfırla',
        resetDesc: 'Bu tarayıcıdaki tüm bütçe kayıtlarını ve ayarları sıfırlayarak temiz bir sayfa açar.',
        resetBtn: 'Verileri Tamamen Temizle',
      },
      cloud: {
        title: 'Durum:',
        connected: '🟢 Bulut Bağlı (Canlı Senkronizasyon)',
        localOnly: '⚪ Yerel Mod (Sadece Bu Cihazda)',
        desc: 'Telefon ve bilgisayarınız arasında anlık senkronizasyon için ücretsiz Firebase Firestore projenizin JSON yapılandırmasını buraya yapıştırabilirsiniz.',
        placeholder: 'Firebase web yapılandırma JSON objesini buraya yapıştırın...',
        saveBtn: 'Bulutu Bağla ve Eşitle',
      },
      devtools: {
        mockupTitle: 'Örnek Demo Verisi Yükle',
        mockupDesc: 'Uygulamayı test etmek için mevcut aya 1 aylık gerçekçi örnek bütçe, gelirler ve harcamalar yükler.',
        mockupBtn: 'Örnek Demo Verisi Yükle',
      },
    },

    common: {
      loading: 'Yükleniyor...',
      close: 'Kapat',
      delete: 'Sil',
      edit: 'Düzenle',
      save: 'Kaydet',
      cancel: 'Vazgeç',
    },

    categories: {
      market: 'Süpermarket',
      pazar_manav: 'Pazar & Manav',
      kasap: 'Kasap',
      fatura: 'Faturalar',
      kira_aidat: 'Kira & Aidat',
      saglik: 'Eczane & Sağlık',
      ulasim: 'Ulaşım & Akaryakıt',
      yemek: 'Dışarıda Yemek',
      giyim: 'Giyim & Ayakkabı',
      ev_esya: 'Ev & Yaşam',
      egitim: 'Eğitim & Kitap',
      diger: 'Diğer Harcama',
    },

    persons: {
      anne: 'Anne',
      baba: 'Baba',
      cocuk: 'Çocuk',
      ortak: 'Ev / Ortak',
    },
  },

  en: {
    appTitle: 'Home Budget',
    appSubtitle: 'Family & Home Accounting',
    cloud: 'Cloud',
    local: 'Local',
    thisMonth: 'This Month',

    nav: {
      dashboard: 'Dashboard',
      accounting: 'Expenses',
      bills: 'Bills',
      budget: 'Budget Planner',
      exportExcel: 'Excel',
      addExpense: 'Expense',
      addIncome: 'Income',
      allPersons: 'All',
    },

    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],

    summary: {
      totalIncome: 'Total Income',
      totalIncomeSub: 'Total net income this month',
      netBalance: 'Net Balance',
      surplusSub: 'Surplus / Saved',
      deficitSub: 'Budget Deficit!',
      fixedExpenses: 'Fixed Expenses & Bills',
      fixedPaidSub: 'bills paid',
      fixedPendingSub: 'pending bills',
      variableExpenses: 'Variable Expenses',
      variableCountSub: 'receipts / transactions',
      totalExpense: 'Total Expenses',
      totalExpenseSub: 'fixed + variable',
      savingsRate: 'Savings Rate',
      savingsRateSub: 'Portion of income saved',
    },

    category: {
      title: 'Spending by Category',
      totalSpent: 'Total Spending',
      noExpenses: 'No expenses recorded yet.',
      fixedPortion: 'fixed',
      variablePortion: 'variable',
    },

    variable: {
      title: 'Variable Expenses & Receipts',
      searchPlaceholder: 'Search title or notes...',
      allPayments: 'All Payments',
      cash: 'Cash',
      creditCard: 'Credit Card',
      bankTransfer: 'Wire / Transfer',
      totalSpent: 'Total Spent',
      noRecords: 'No expenses found.',
      noRecordsSub: 'Add your first expense using the button above.',
      deleteConfirm: 'Are you sure you want to delete this expense?',
    },

    quick: {
      title: 'Quick Expense Shortcuts',
      addCustom: 'New Shortcut',
      addedSuccess: 'Added!',
      newTitle: 'Add New Quick Expense Shortcut',
      titleLabel: 'Shortcut Title *',
      amountLabel: 'Default Amount *',
      categoryLabel: 'Category *',
      personLabel: 'Default Person *',
      methodLabel: 'Payment Method *',
      saveBtn: 'Save Shortcut',
      cancelBtn: 'Cancel',
    },

    fixed: {
      title: 'Fixed Expenses & Bills',
      paidLabel: 'Paid',
      totalLabel: 'Total',
      newBill: 'Add Bill',
      newBillTitle: 'Add Fixed Expense / Bill',
      billTitle: 'Bill Name *',
      expectedAmount: 'Monthly Expected Amount *',
      dueDate: 'Due Day (1-31)',
      category: 'Category',
      person: 'Person / Account',
      note: 'Note / Description',
      saveBtn: 'Save Bill',
      cancelBtn: 'Cancel',
      paid: 'Paid',
      unpaid: 'Unpaid',
      markPaid: 'Mark as Paid',
      markUnpaid: 'Mark as Unpaid',
      noBills: 'No fixed expenses or bills recorded for this month.',
      noBillsSub: 'You can sync templates on the right or add a new bill.',
      dueDayPrefix: 'Day',
      dueDaySuffix: 'of each month',
      deleteConfirm: 'Are you sure you want to delete this bill for this month?',
    },

    templates: {
      title: 'Recurring Expense Templates',
      addTemplate: 'New Template',
      addTemplateTitle: 'Add Recurring Template',
      templateTitle: 'Template Name *',
      defaultAmount: 'Default Monthly Amount',
      saveBtn: 'Save Template',
      cancelBtn: 'Cancel',
      noTemplates: 'No recurring templates found.',
      syncBarText: 'Add missing templates to current month:',
      syncBtn: 'Sync to Month',
      syncSuccess: 'Templates Synced!',
      syncEmpty: 'All templates already exist in this month.',
      deleteConfirm: 'Are you sure you want to delete this template? Future months won\'t include it.',
      unspecified: 'Unspecified',
    },

    incomes: {
      title: 'Incomes & Salaries',
      totalIncome: 'Total',
      addIncome: 'Add Income',
      noIncomes: 'No income recorded for this month yet.',
      noIncomesSub: 'Add your salary, bonuses, or additional earnings.',
      deleteConfirm: 'Are you sure you want to delete this income?',
    },

    planner: {
      title: 'Monthly Budget & Savings Targets',
      limitLabel: 'Monthly Spending Ceiling',
      limitDesc: 'Maximum spending limit you do not want to exceed this month.',
      savingsLabel: 'Monthly Savings Goal',
      savingsDesc: 'Amount of money you aim to set aside and save this month.',
      saveBtn: 'Update Targets',
      saveSuccess: 'Targets updated!',
      limitUsed: 'Limit Used',
      limitRemaining: 'Remaining Budget',
      limitExceeded: 'Limit Exceeded!',
      savingsProgress: 'Savings Progress',
      savingsAchieved: 'Target Reached!',
      notesTitle: 'Monthly Budget Notes & Reminders',
      notesPlaceholder: 'Financial goals, special plans or reminders for this month...',
      saveNotesBtn: 'Save Notes',
      notesSaved: 'Notes saved!',
    },

    modals: {
      addExpenseTitle: 'Add New Expense',
      editExpenseTitle: 'Edit Expense',
      addIncomeTitle: 'Add New Income',
      editIncomeTitle: 'Edit Income',
      editFixedTitle: 'Edit Fixed Expense',
      titleLabel: 'Description / Title *',
      amountLabel: 'Amount',
      categoryLabel: 'Category *',
      personLabel: 'Paid By / Income Earner *',
      dateLabel: 'Date *',
      paymentMethodLabel: 'Payment Method *',
      noteLabel: 'Note (Optional)',
      actualAmountLabel: 'Actual Amount',
      expectedAmountLabel: 'Expected Amount',
      isPaidLabel: 'Mark this bill as paid',
      saveBtn: 'Save',
      updateBtn: 'Update',
      cancelBtn: 'Cancel',
    },

    settings: {
      title: 'App Settings & Management',
      tabs: {
        persons: 'Persons',
        categories: 'Categories',
        theme: 'Appearance & Language',
        backup: 'Backup & Data',
        cloud: 'Cloud (Firebase)',
        devtools: 'Developer',
      },
      appearance: {
        themeTitle: 'Theme Mode',
        themeDesc: 'Switch between light, dark, or system default theme.',
        light: 'Light Theme',
        lightDesc: 'Classic light mode',
        dark: 'Dark Theme',
        darkDesc: 'Easy on the eyes dark mode',
        system: 'System Default',
        systemDesc: 'Follows device theme',
        languageTitle: 'Language (Dil Seçimi)',
        languageDesc: 'Change the application interface language.',
        langTr: 'Türkçe',
        langTrDesc: 'Türkçe arayüz',
        langEn: 'English',
        langEnDesc: 'English interface',
        currencyTitle: 'Currency (Para Birimi)',
        currencyDesc: 'Choose currency symbol displayed across the app.',
      },
      backup: {
        title: 'Data Backup & Restore',
        backupDesc: 'Backup all your months, expenses and settings as a JSON file or restore from a previous backup.',
        downloadBtn: 'Download Backup (JSON)',
        uploadBtn: 'Restore from Backup',
        resetTitle: 'Reset All Data',
        resetDesc: 'Clears all budget records and settings in this browser for a fresh start.',
        resetBtn: 'Clear All Data',
      },
      cloud: {
        title: 'Status:',
        connected: '🟢 Cloud Connected (Live Sync)',
        localOnly: '⚪ Local Mode (This Device Only)',
        desc: 'Paste your free Firebase Firestore web config JSON here for instant live sync between your phone and desktop.',
        placeholder: 'Paste your Firebase web config JSON here...',
        saveBtn: 'Connect Cloud & Sync',
      },
      devtools: {
        mockupTitle: 'Load Sample Demo Data',
        mockupDesc: 'Loads 1 month of realistic sample budget, incomes and expenses to test the app.',
        mockupBtn: 'Load Sample Demo Data',
      },
    },

    common: {
      loading: 'Loading...',
      close: 'Close',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
    },

    categories: {
      market: 'Groceries / Market',
      pazar_manav: 'Produce / Bazaar',
      kasap: 'Butcher / Meat',
      fatura: 'Utilities & Bills',
      kira_aidat: 'Rent & Dues',
      saglik: 'Pharmacy & Health',
      ulasim: 'Transport & Fuel',
      yemek: 'Dining Out',
      giyim: 'Clothing & Shoes',
      ev_esya: 'Home & Living',
      egitim: 'Education & Books',
      diger: 'Other',
    },

    persons: {
      anne: 'Mother',
      baba: 'Father',
      cocuk: 'Child',
      ortak: 'Home / Joint',
    },
  },
} as const;

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'TRY',
  lang: Language = 'tr'
): string {
  const symbol = CURRENCIES[currency]?.symbol || '₺';
  const locale = lang === 'en' ? 'en-US' : 'tr-TR';
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  if (currency === 'USD' || currency === 'GBP') {
    return `${symbol}${formatted}`;
  }
  return `${formatted} ${symbol}`;
}

export function formatMonthDisplay(monthKey: string, lang: Language = 'tr'): string {
  const [year, month] = monthKey.split('-');
  const mIndex = parseInt(month, 10) - 1;
  const monthName = translations[lang]?.months?.[mIndex] || translations.tr.months[mIndex] || month;
  return `${monthName} ${year}`;
}

export function getCategoryName(category: { id: string; name: string }, lang: Language = 'tr'): string {
  if (lang === 'en') {
    const enMap = translations.en.categories as Record<string, string>;
    if (enMap[category.id]) {
      return enMap[category.id];
    }
  }
  return category.name;
}

export function getPersonName(person: { id: string; name: string }, lang: Language = 'tr'): string {
  if (lang === 'en') {
    const enMap = translations.en.persons as Record<string, string>;
    if (enMap[person.id]) {
      return enMap[person.id];
    }
  }
  return person.name;
}
