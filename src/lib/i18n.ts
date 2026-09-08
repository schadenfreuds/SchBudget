export type Language = 'tr' | 'en';
export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  enName: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  TRY: { code: 'TRY', symbol: '₺', name: 'Türk Lirası (₺)', enName: 'Turkish Lira (₺)' },
  USD: { code: 'USD', symbol: '$', name: 'Amerikan Doları ($)', enName: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)', enName: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini (£)', enName: 'British Pound (£)' },
};

export const translations = {
  tr: {
    appTitle: 'Ev Muhasebesi',
    appSubtitle: 'Aile & Ev Bütçesi',
    cloud: 'Bulut',
    local: 'Yerel',
    thisMonth: 'Bu Ay',

    subtitles: {
      accounting: 'Sola dokunarak hızlı ekleyin, sağdan tüm dökümü filtreleyin',
      bills: 'Bu ayki faturalarınızı tikleyin veya şablonlarınızı yönetin.',
      budget: 'Gelirlerinizi kaydedin ve aylık tavan bütçenizi kontrol edin.',
      personFilterLabel: 'Kişi:',
    },

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
      allBillsPaid: 'Tüm faturalar ödendi',
      noBillsPending: 'Bekleyen fatura yok',
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
      viewDetails: 'Muhasebe Detayı',
    },

    variable: {
      title: 'Değişken Harcamalar & Fişler',
      searchPlaceholder: 'Harcama ara (Migros, benzin, eczane...)',
      allCategories: 'Tüm Kategoriler',
      allPayments: '💳 / 💵 Tümü',
      cardPayment: '💳 Kredi Kartı',
      cashPayment: '💵 Nakit / Banka',
      cash: 'Nakit',
      creditCard: 'Kredi Kartı',
      bankTransfer: 'Havale/EFT',
      totalSpent: 'Toplam Harcama',
      noRecords: 'Harcama kaydı bulunmuyor.',
      noRecordsSub: 'Yukarıdaki butondan ilk harcamanızı ekleyebilirsiniz.',
      deleteConfirm: 'Bu harcamayı silmek istediğinize emin misiniz?',
      noExpensesFound: 'Bu kriterde harcama bulunamadı.',
      addExpenseNow: 'Hemen yeni bir harcama ekle',
    },

    quick: {
      title: 'Hızlı Harcama Kısayolları',
      addCustom: 'Yeni Kısayol',
      addedSuccess: 'Eklendi!',
      tapToAdd: 'Dokun ve Ekle',
      cash: '💵 Nakit',
      card: '💳 Kart',
      openPresetTitle: 'Tutarı değiştirerek aç',
      deleteTemplate: 'Şablonu sil',
      newTitle: 'Yeni Hızlı Harcama Kısayolu Ekle',
      titleLabel: 'Kısayol Başlığı *',
      titlePlaceholder: 'Örn: Simit & Ayran, Otopark',
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
      billNamePlaceholder: 'Örn: Elektrik, Su, Ev Kirası',
      expectedAmount: 'Aylık Beklenen Tutar *',
      dueDate: 'Son Gün (1-31)',
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
      searchPlaceholder: 'Fatura ara (Kira, elektrik, internet...)',
      allCategories: 'Tüm Kategoriler',
      allStatuses: 'Tüm Durumlar',
      pending: '⏳ Bekleyenler',
      paidFilter: '✓ Ödenenler',
      noBillsFound: 'Bu kriterde sabit gider bulunamadı.',
      addBillNow: 'Hemen yeni bir fatura ekle',
      editAmountTitle: 'Tutarı düzenle',
      saveAmount: 'Tamam',
      statusPaid: '✓ Ödendi',
      statusPending: 'Bekliyor',
      statusOverdue: '🚨 {days} gün gecikti!',
      statusDueToday: '⚠️ Bugün son gün!',
      statusDaysLeft: '⏳ {days} gün kaldı',
      dayOfMonth: '🗓️ Ayın {day}. günü',
    },

    templates: {
      title: 'Rutin Gider Şablonları',
      addTemplate: 'Yeni Şablon',
      addTemplateTitle: 'Yeni Rutin Şablon Ekle',
      templateTitle: 'Fatura / Abonelik Adı *',
      namePlaceholder: 'Örn: Netflix, İnternet, Aidat, Spor',
      defaultAmount: 'Varsayılan Aylık Tutar',
      categoryLabel: 'Kategori',
      personLabel: 'Kime Ait?',
      dueDayLabel: 'Son Gün (1-31)',
      dueDayPlaceholder: 'Örn: 15',
      dueDayFormat: 'Her ayın {day}. günü',
      saveBtn: 'Şablonu Kaydet',
      cancelBtn: 'Vazgeç',
      noTemplates: 'Kayıtlı rutin şablon bulunmuyor.',
      syncBarText: 'Eksik kalan şablonları mevcut aya ekle:',
      syncBtn: 'Mevcut Aya Yansıt',
      syncSuccess: 'Şablonlar Aktarıldı!',
      syncEmpty: 'Tüm şablonlar zaten mevcut ayda ekli.',
      deleteConfirm: 'Bu şablonu silmek istediğinize emin misiniz? Gelecek aylara yansıtılmayacak.',
      deleteTooltip: 'Şablonu sil',
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
      title: 'Aylık Harcama Limiti & Hedef Bütçe',
      subtitle: 'Bu ay için koyduğunuz tavan harcama sınırı',
      ceilingTarget: 'Tavan Hedef',
      editLimitTooltip: 'Bütçe limitini değiştirmek için tıkla',
      spent: 'Harcanan:',
      used: '%{pct} Kullanıldı',
      remaining: 'Kalan Serbest:',
      alertExceeded: 'Bütçe Limiti Aşıldı!',
      alertExceededDesc: 'Belirlediğiniz tavan hedefi {amount} aştınız. Zorunlu olmayan harcamaları ertelemeniz tavsiye edilir.',
      alertWarning: 'Dikkat: Bütçenin %{pct}\'i harcandı.',
      alertWarningDesc: 'Ay sonuna kadar serbest kalan limitiniz {amount}.',
      alertGood: 'Harika Gidiyorsunuz!',
      alertGoodDesc: 'Harcamalarınız bütçe hedefinin çok altında, plan dahilinde ilerliyorsunuz.',
      compassTitle: 'Günlük Harcama Pusulası',
      compassDesc: 'Ay sonuna kadar bütçeyi aşmamak için önerilen günlük maksimum harcama',
      compassForRemaining: 'Kalan {days} Gün İçin:',
      compassPerDay: '/ gün',
      savingsGoalTitle: 'Aylık Tasarruf Hedefi',
      savingsGoalDesc: 'Gelirlerden tüm giderler çıktıktan sonra elde kalan net tasarruf',
      setGoal: 'Hedef Belirle',
      currentNetSavings: 'Şu Anki Net Tasarruf:',
      savingsRate: 'Tasarruf Oranı',
      limitLabel: 'Aylık Harcama Tavanı',
      limitDesc: 'Bu ay aşmamak istediğiniz maksimum toplam harcama limiti.',
      savingsLabel: 'Aylık Tasarruf Hedefi',
      savingsDesc: 'Bu ay kenara koymayı hedeflediğiniz birikim tutarı.',
      saveBtn: 'Kaydet',
      cancelBtn: 'İptal',
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
      expensePlaceholder: 'Örn: Migros haftalık alışveriş, Eczane vitamin...',
      incomePlaceholder: 'Örn: Aylık Maaş, Kira Getirisi, Freelance...',
      fixedPlaceholder: 'Örn: Elektrik Faturası, Kira, Aidat...',
      duePlaceholder: 'Örn: 15',
      notePlaceholder: 'Eklemek istediğiniz not...',
      billNotePlaceholder: 'Abone no, otomatik ödeme talimatı vb...',
      defaultExpenseTitle: 'Harcama',
      defaultIncomeTitle: 'Gelir',
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
      persons: {
        bannerTitle: 'Aile Bireyleri & Ortak Ev Masrafları',
        bannerDesc: 'Evdeki bireyleri ekleyin veya düzenleyin. Her harcama ve gelir bu kişilere bağlanır.',
        currentPersons: 'Mevcut Kişiler',
        addNew: 'Yeni Birey Ekle',
        nameLabel: 'İsim *',
        namePlaceholder: 'Örn: Can, Ece, Ali...',
        roleLabel: 'Rol / Açıklama',
        rolePlaceholder: 'Örn: Anne, Baba, Çocuk, Ev Arkadaşı...',
        avatarSelect: 'Avatar Seçimi',
        addBtn: 'Kişiyi Ekle',
        deleteTooltip: 'Kişiyi kaldır',
      },
      categories: {
        bannerTitle: 'Harcama Kategorileri',
        bannerDesc: 'Ev bütçenize göre dilediğiniz kategoriyi ekleyin veya özelleştirin.',
        addNew: 'Yeni Kategori Ekle',
        namePlaceholder: 'Örn: Evcil Hayvan, Eğlence, Hobi...',
        addBtn: 'Ekle',
        deleteTooltip: 'Kategoriyi sil',
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
        bannerTitle: 'Çevrimdışı JSON Yedekleme (Data Portability)',
        bannerDesc: 'Tüm ay verilerini ve ayarlarınızı tek dosya halinde bilgisayarınıza veya telefonunuza indirin. İnternet veya hesap gerektirmez.',
        downloadBtn: 'Yedek Dosyasını İndir (.json)',
        restoreTitle: 'Yedekten Geri Yükle',
        restoreDesc: 'Daha önce indirdiğiniz .json yedek dosyasını seçerek tüm verilerinizi geri getirin.',
        restoreBtn: 'JSON Dosyası Seç ve Yükle',
        resetTitle: 'Tüm Verileri Sıfırla',
        resetDesc: 'Bu tarayıcıdaki tüm bütçe kayıtlarını ve ayarları sıfırlayarak temiz bir sayfa açar.',
        resetBtn: 'Verileri Tamamen Temizle',
        restoreSuccess: '✓ Başarılı! {count} adet ay ve ayarlar geri yüklendi.',
      },
      cloud: {
        statusLabel: 'Durum:',
        statusConnected: '🟢 Bulut Bağlı (Canlı Senkronizasyon)',
        statusLocal: '⚪ Yerel Mod (Sadece Bu Cihazda)',
        desc: 'Telefon ve bilgisayarınız arasında anlık senkronizasyon için ücretsiz Firebase Firestore projenizin JSON yapılandırmasını buraya yapıştırabilirsiniz.',
        jsonLabel: 'Firebase Yapılandırma JSON',
        saveBtn: 'Bulutu Bağla ve Senkronize Et',
        saveSuccess: 'Bağlantı kaydedildi!',
      },
      devtools: {
        bannerTitle: 'Geliştirici & Test Araçları',
        bannerDesc: 'Uygulamanın grafiklerini, analizlerini ve çift sekme düzenini test etmek için mevcut aya gerçekçi 1 aylık örnek aile verisi (Kira, faturalar, maaşlar, Migros, kasap vb.) yükler.',
        mockupTitle: 'Gerçekçi Demo Verisi Yükle',
        mockupDesc: 'Mevcut ayı temsili verilerle doldurur',
        mockupBtn: 'Demoyu Yükle',
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

    subtitles: {
      accounting: 'Tap on the left to quickly add, filter all records on the right',
      bills: 'Check off your bills for this month or manage templates.',
      budget: 'Record your incomes and track your monthly budget ceiling.',
      personFilterLabel: 'Person:',
    },

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
      allBillsPaid: 'All bills paid',
      noBillsPending: 'No pending bills',
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
      viewDetails: 'Expense Details',
    },

    variable: {
      title: 'Variable Expenses & Receipts',
      searchPlaceholder: 'Search expense (Groceries, fuel, pharmacy...)',
      allCategories: 'All Categories',
      allPayments: '💳 / 💵 All',
      cardPayment: '💳 Credit Card',
      cashPayment: '💵 Cash / Wire',
      cash: 'Cash',
      creditCard: 'Credit Card',
      bankTransfer: 'Wire / Transfer',
      totalSpent: 'Total Spent',
      noRecords: 'No expenses found.',
      noRecordsSub: 'Add your first expense using the button above.',
      deleteConfirm: 'Are you sure you want to delete this expense?',
      noExpensesFound: 'No expenses found matching criteria.',
      addExpenseNow: 'Add an expense now',
    },

    quick: {
      title: 'Quick Expense Shortcuts',
      addCustom: 'New Shortcut',
      addedSuccess: 'Added!',
      tapToAdd: 'Tap to Add',
      cash: '💵 Cash',
      card: '💳 Card',
      openPresetTitle: 'Open and modify amount',
      deleteTemplate: 'Delete shortcut',
      newTitle: 'Add New Quick Expense Shortcut',
      titleLabel: 'Shortcut Title *',
      titlePlaceholder: 'E.g. Coffee & Bagel, Parking',
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
      billNamePlaceholder: 'E.g. Electricity, Water, Rent',
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
      searchPlaceholder: 'Search bill (Rent, electricity, internet...)',
      allCategories: 'All Categories',
      allStatuses: 'All Statuses',
      pending: '⏳ Pending',
      paidFilter: '✓ Paid',
      noBillsFound: 'No fixed expenses found matching criteria.',
      addBillNow: 'Add a new bill now',
      editAmountTitle: 'Edit amount',
      saveAmount: 'Save',
      statusPaid: '✓ Paid',
      statusPending: 'Pending',
      statusOverdue: '🚨 {days} days overdue!',
      statusDueToday: '⚠️ Due today!',
      statusDaysLeft: '⏳ {days} days left',
      dayOfMonth: '🗓️ Day {day} of month',
    },

    templates: {
      title: 'Recurring Expense Templates',
      addTemplate: 'New Template',
      addTemplateTitle: 'Add Recurring Template',
      templateTitle: 'Bill / Subscription Name *',
      namePlaceholder: 'E.g. Netflix, Internet, Dues, Gym',
      defaultAmount: 'Default Monthly Amount',
      categoryLabel: 'Category',
      personLabel: 'Belongs To?',
      dueDayLabel: 'Due Day (1-31)',
      dueDayPlaceholder: 'E.g. 15',
      dueDayFormat: 'Day {day} of each month',
      saveBtn: 'Save Template',
      cancelBtn: 'Cancel',
      noTemplates: 'No recurring templates found.',
      syncBarText: 'Add missing templates to current month:',
      syncBtn: 'Sync to Month',
      syncSuccess: 'Templates Synced!',
      syncEmpty: 'All templates already exist in this month.',
      deleteConfirm: 'Are you sure you want to delete this template? Future months won\'t include it.',
      deleteTooltip: 'Delete template',
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
      title: 'Monthly Spending Limit & Target Budget',
      subtitle: 'Maximum spending ceiling set for this month',
      ceilingTarget: 'Spending Ceiling',
      editLimitTooltip: 'Click to modify budget limit',
      spent: 'Spent:',
      used: '%{pct} Used',
      remaining: 'Remaining Free:',
      alertExceeded: 'Budget Limit Exceeded!',
      alertExceededDesc: 'You exceeded your target ceiling by {amount}. It is recommended to postpone non-essential expenses.',
      alertWarning: 'Warning: %{pct}% of budget spent.',
      alertWarningDesc: 'Your remaining free budget until the end of the month is {amount}.',
      alertGood: 'Great Job!',
      alertGoodDesc: 'Your expenses are well below the target, staying on track.',
      compassTitle: 'Daily Spending Compass',
      compassDesc: 'Recommended daily maximum spending to stay within budget until month end',
      compassForRemaining: 'For Remaining {days} Days:',
      compassPerDay: '/ day',
      savingsGoalTitle: 'Monthly Savings Goal',
      savingsGoalDesc: 'Net savings left after deducting all expenses from incomes',
      setGoal: 'Set Goal',
      currentNetSavings: 'Current Net Savings:',
      savingsRate: 'Savings Rate',
      limitLabel: 'Monthly Spending Ceiling',
      limitDesc: 'Maximum spending limit you do not want to exceed this month.',
      savingsLabel: 'Monthly Savings Goal',
      savingsDesc: 'Amount of money you aim to set aside and save this month.',
      saveBtn: 'Save',
      cancelBtn: 'Cancel',
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
      expensePlaceholder: 'E.g. Supermarket grocery, Pharmacy vitamins...',
      incomePlaceholder: 'E.g. Monthly Salary, Rental Income, Freelance...',
      fixedPlaceholder: 'E.g. Electricity Bill, Rent, Dues...',
      duePlaceholder: 'E.g. 15',
      notePlaceholder: 'Additional notes...',
      billNotePlaceholder: 'Account number, auto-pay notice, etc...',
      defaultExpenseTitle: 'Expense',
      defaultIncomeTitle: 'Income',
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
      persons: {
        bannerTitle: 'Family Members & Joint Expenses',
        bannerDesc: 'Add or edit household members. All expenses and incomes attach to these profiles.',
        currentPersons: 'Current Members',
        addNew: 'Add New Member',
        nameLabel: 'Name *',
        namePlaceholder: 'E.g. John, Sarah, Alex...',
        roleLabel: 'Role / Description',
        rolePlaceholder: 'E.g. Mother, Father, Child, Roommate...',
        avatarSelect: 'Choose Avatar',
        addBtn: 'Add Member',
        deleteTooltip: 'Remove member',
      },
      categories: {
        bannerTitle: 'Expense Categories',
        bannerDesc: 'Add or customize categories based on your household budget.',
        addNew: 'Add New Category',
        namePlaceholder: 'E.g. Pets, Entertainment, Hobbies...',
        addBtn: 'Add',
        deleteTooltip: 'Delete category',
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
        languageTitle: 'Language',
        languageDesc: 'Change the application interface language.',
        langTr: 'Türkçe',
        langTrDesc: 'Türkçe arayüz',
        langEn: 'English',
        langEnDesc: 'English interface',
        currencyTitle: 'Currency',
        currencyDesc: 'Choose currency symbol displayed across the app.',
      },
      backup: {
        bannerTitle: 'Offline JSON Backup (Data Portability)',
        bannerDesc: 'Download all month data and settings as a single file to your computer or phone. No account or internet required.',
        downloadBtn: 'Download Backup File (.json)',
        restoreTitle: 'Restore from Backup',
        restoreDesc: 'Restore all data by selecting a previously downloaded .json backup file.',
        restoreBtn: 'Select & Upload JSON File',
        resetTitle: 'Reset All Data',
        resetDesc: 'Clears all budget records and settings in this browser for a fresh start.',
        resetBtn: 'Clear All Data',
        restoreSuccess: '✓ Success! {count} months and settings restored.',
      },
      cloud: {
        statusLabel: 'Status:',
        statusConnected: '🟢 Cloud Connected (Live Sync)',
        statusLocal: '⚪ Local Mode (This Device Only)',
        desc: 'Paste your free Firebase Firestore web config JSON here for live sync between your phone and desktop.',
        jsonLabel: 'Firebase Configuration JSON',
        saveBtn: 'Connect Cloud & Sync',
        saveSuccess: 'Connection saved!',
      },
      devtools: {
        bannerTitle: 'Developer & Testing Tools',
        bannerDesc: 'Loads 1 month of realistic family demo data (Rent, bills, salaries, groceries, etc.) to test charts and layouts.',
        mockupTitle: 'Load Realistic Demo Data',
        mockupDesc: 'Populates current month with sample data',
        mockupBtn: 'Load Demo Data',
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

const TEMPLATE_TITLE_MAP_EN: Record<string, string> = {
  'Ev Kirası': 'House Rent',
  'Bina / Site Aidatı': 'Building / Maintenance Dues',
  'Elektrik Faturası': 'Electricity Bill',
  'Doğalgaz Faturası': 'Gas Bill',
  'Su Faturası': 'Water Bill',
  'Ev İnterneti': 'Home Internet',
  'Cep Telefonu (Anne)': 'Mobile Phone (Mother)',
  'Cep Telefonu (Baba)': 'Mobile Phone (Father)',
};

export function translateTemplateTitle(title: string, lang: Language = 'tr'): string {
  if (lang === 'en' && TEMPLATE_TITLE_MAP_EN[title]) {
    return TEMPLATE_TITLE_MAP_EN[title];
  }
  return title;
}

const QUICK_TITLE_MAP_EN: Record<string, string> = {
  'Fırın & Ekmek': 'Bakery & Bread',
  'Damacana Su': 'Bottled Water',
  'Akaryakıt / Benzin': 'Fuel / Gas',
  'Dışarıda Kahve / Çay': 'Coffee & Tea',
  'Mini Market / Bakkal': 'Convenience Store / Grocery',
  'Kasap / Şarküteri': 'Butcher / Deli',
  'Eczane & Sağlık': 'Pharmacy & Health',
  'Taksi / Ulaşım': 'Taxi / Transit',
};

export function translateQuickTitle(title: string, lang: Language = 'tr'): string {
  if (lang === 'en' && QUICK_TITLE_MAP_EN[title]) {
    return QUICK_TITLE_MAP_EN[title];
  }
  return title;
}

const ROLE_MAP_EN: Record<string, string> = {
  'Anne': 'Mother',
  'Baba': 'Father',
  'Çocuk': 'Child',
  'Genel Ev': 'General Household',
};

export function translatePersonRole(role: string | undefined, lang: Language = 'tr'): string | undefined {
  if (!role) return undefined;
  if (lang === 'en' && ROLE_MAP_EN[role]) {
    return ROLE_MAP_EN[role];
  }
  return role;
}
