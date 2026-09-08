# 🏡 Aile Bütçesi & Ev Muhasebesi (Family Budget)

> Karmaşık Excel formüllerinden, köprülerden ve kaybolan tablolardan bunalan evler için tasarlanmış; sıfır sürtünmeli, modern, gizlilik odaklı ve çevrimdışı (offline-first) aile bütçesi uygulaması.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

---

## ✨ Öne Çıkan Özellikler

1. **👥 Dinamik Kişi ve Gider Ayrımı:**
   - Ev halkını (Anne, Baba, Çocuklar veya Ev Arkadaşları) dilediğiniz gibi ekleyin, düzenleyin veya kaldırın.
   - Her harcama ve gelir tek tıkla ilgili bireye bağlanır.
   - Ay sonunda kimin ne kadar harcadığı, ortak ev masraflarının ne tuttuğu şeffafça listelenir.

2. **📋 Sabit Giderler & Rutin Faturalar (Checklist):**
   - Kira, aidat, elektrik, su, doğalgaz ve internet gibi rutin giderler her yeni ayda otomatik şablon olarak gelir.
   - Ödendikçe tek dokunuşla tiklenir `[✓ Ödendi]`.
   - Vade günü takibi ve bekleyen faturaların toplam tutarı anında gösterilir.

3. **⚡ Hızlı & Pratik Harcama Girişi:**
   - Saniyeler içinde harcama veya gelir ekleme (Tutar + Kategori + Kişi + Ödeme Türü).
   - Canlı arama ve kişi bazlı anlık filtreleme.

4. **📊 Kategori Dağılımı ve Analiz:**
   - "Bu ay en çok nereye para gitti?" sorusuna anında yanıt veren görsel kategori barları (Market, Fatura, Kasap, Eczane, Ulaşım vb.).

5. **📥 Tek Tıkla Formatlı Excel Çıktısı (.xlsx):**
   - Excel alışkanlığı olanlar için tek tıkla 4 sekmeli (Aylık Özet, Sabit Giderler, Harcamalar, Gelirler) biçimlendirilmiş `.xlsx` tablosu indirir.

6. **☁️ Çift Katmanlı Hafıza (Gizlilik & Sıfır Maliyet):**
   - **Yerel Hafıza (LocalStorage):** İnternet olmadan, sunucusuz ve hesap açmadan doğrudan tarayıcınızda %100 gizli çalışır.
   - **İsteğe Bağlı Firebase Firestore:** Telefon ve bilgisayar arasında 7/24 anlık senkronizasyon isterseniz ücretsiz Firebase anahtarınızı Ayarlar panelinden tek tıkla bağlayabilirsiniz.

---

## 🚀 Hızlı Başlangıç (Local Geliştirme)

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 🌐 Vercel / Cloud Üzerinde Tek Tıkla Canlıya Alma

1. Repoyu GitHub hesabınıza pushlayın.
2. [Vercel](https://vercel.com) üzerinde projeyi import edin.
3. Otomatik oluşturulan linki (`aile-butcesi.vercel.app`) ailenizle paylaşın:
   - **Masaüstünde:** Tarayıcıda yer imlerine ekleyin veya "Masaüstüne Kısayol Oluştur" deyin.
   - **Telefonda (PWA):** Chrome veya Safari menüsünden **"Ana Ekrana Ekle"** seçeneğini seçin; tam ekran bir mobil uygulama gibi çalışır.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında açık kaynak olarak lisanslanmıştır. Dilediğiniz gibi kullanabilir, özelleştirebilir ve katkıda bulunabilirsiniz.
