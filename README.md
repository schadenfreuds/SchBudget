# 🏡 Aile Bütçesi & Ev Muhasebesi

Excel formüllerinden ve karmaşık köprülerden bunalan anne-babalar için tasarlanmış, sıfır sürtünmeli modern aile bütçesi ve gider takip uygulaması.

---

## ✨ Öne Çıkan Özellikler

1. **Kişiye Özel Gider Ayrımı:**
   - **Tülay (Anne)**, **Caner (Baba)**, **Can** ve **Ev / Ortak** profilleri.
   - Her harcamayı yapan kişi tek tıkla seçilir.
   - Ay sonunda kim ne kadar harcamış, evin ortak masrafı ne kadar tutmuş anında listelenir.

2. **Sabit Giderler & Faturalar (Checklist):**
   - Kira, aidat, elektrik, su, doğalgaz ve internet gibi rutin faturalar her yeni ayda otomatik listelenir.
   - Ödendikçe yanına bir tik atılır `[✓ Ödendi]`.
   - Bekleyen faturalar ve ödenecek tutar anında görünür.

3. **Günlük & Değişken Harcamalar:**
   - Saniyeler içinde harcama ekleme (Tutar + Kategori + Kişi).
   - Canlı arama ve filtreleme.

4. **Kategori Dağılım Çubukları:**
   - "Bu ay en çok nereye harcadık?" sorusuna tek bakışta görsel yanıt (Market, Fatura, Kasap, Eczane vb.).

5. **📥 Tek Tıkla Excel Çıktısı (.xlsx):**
   - Excel alışkanlığı olanlar için tek tıkla 4 sekmeli (Aylık Özet, Sabit Giderler, Harcamalar, Gelirler) formatlı Excel dosyası indirir.

6. **☁️ Çift Katmanlı Hafıza (Sıfır Kesinti):**
   - **Yerel Hafıza:** İnternet olmasa da veya Firebase kurulmasa bile tarayıcıda eksiksiz çalışır.
   - **Firebase Firestore:** İstenirse telefon ve bilgisayar arasında 7/24 anlık senkronizasyon sağlar (uyku modu yoktur, sıfır maliyet).

---

## 🚀 Çalıştırma

```bash
cd "🏰 300-Projects/aile-butcesi"
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 🌐 Vercel'e Yayına Alma (Annenin Telefonu & Bilgisayarı İçin)

1. Projeyi GitHub'a pushlayın veya Vercel CLI ile `vercel` deyin.
2. Vercel size ücretsiz bir link (`aile-butcesi.vercel.app`) verir.
3. Annenizin bilgisayarına ve telefonuna linki gönderin:
   - **Bilgisayarda:** Tarayıcıda yer imlerine ekleyin veya "Masaüstüne Kısayol Oluştur" deyin.
   - **Telefonda:** Chrome/Safari menüsünden "Ana Ekrana Ekle" deyin; normal bir mobil uygulama gibi açılır.
