# KVKK UYUM KONTROL LİSTESİ
## Fotoğraf Stüdyosu — Stüdyo Sahibi İçin

---

## ✅ Uygulama İçinde Tamamlananlar (Teknik)

- [x] **Aydınlatma metni** — İlk girişte kullanıcıya gösterilir (`KvkkConsentScreen`)
- [x] **Açık rıza kaydı** — Firestore `users/{uid}.kvkkConsentDate` alanına yazılır
- [x] **Rıza denetim izi** — `audit_logs` koleksiyonuna tarih damgalı kayıt düşülür
- [x] **Rıza geri alma** — Profil → Gizlilik ekranından switch ile anlık
- [x] **Veri silme hakkı** — `deleteMyData` Cloud Function (m.11/e)
- [x] **Veri kopyası hakkı** — `exportMyData` Cloud Function (m.11/b)
- [x] **Otomatik imha** — `periodicDataCleanup` her ayın 1'i çalışır (m.7)
- [x] **Şifreli iletim** — HTTPS/TLS, Firebase güvenli bağlantı
- [x] **Erişim kontrolü** — Her müşteri yalnızca kendi verilerini görür
- [x] **Fotoğraflara doğrudan link yok** — Signed URL (1 saat geçerli)
- [x] **Şifre şifreleme** — Firebase Authentication (bcrypt)

---

## ⚠️ Stüdyo Sahibinin Yapması Gerekenler

### 🔴 Zorunlu — Hemen Yapılmalı

- [ ] **Aydınlatma metnini özelleştir**
  - `kvkk/AYDINLATMA_METNI.md` dosyasındaki `[STÜDYO ADI]`, `[E-POSTA]`, `[ADRES]` alanlarını doldur
  - Metni web sitenize ve uygulama içine ekle

- [ ] **Açık rıza metnini özelleştir**
  - `kvkk/ACIK_RIZA_METNI.md` içindeki stüdyo bilgilerini doldur

- [ ] **Google Firebase ile Veri İşleme Sözleşmesi imzala**
  - Firebase Console → Proje Ayarları → Kullanım Şartları
  - Google, KVKK m.9 kapsamında standart sözleşme sunmaktadır

- [ ] **VERBİS durumunu kontrol et**
  - Çalışan sayısı 50'den az VE bilanço 100 milyon TL altındaysa: muafiyet olabilir
  - Emin değilsen bir KVKK danışmanına başvur
  - Yükümlüysen: verbis.kvkk.gov.tr adresinden kayıt yap

### 🟡 Önemli — 1 Ay İçinde Yapılmalı

- [ ] **Hizmet sözleşmesine KVKK maddesi ekle**
  ```
  "Müşteri, fotoğraf çekimi sırasında ve sonrasında elde edilen kişisel
  verilerinin KVKK Aydınlatma Metni kapsamında işleneceğini kabul eder."
  ```

- [ ] **Fotoğraflardaki üçüncü kişiler için not**
  - Düğün/nişan çekimlerinde sözleşmeye ekle:
  ```
  "Fotoğraflarda görünen üçüncü kişilerin görüntüleri yalnızca
  müşteriye hizmet teslimi amacıyla işlenmekte olup üçüncü taraflarla
  paylaşılmamaktadır."
  ```

- [ ] **Veri ihlali prosedürü hazırla**
  - Firebase sistemi ihlal edilirse → 72 saat içinde KVKK Kurumu'na bildirim
  - Bildirim formu: kvkk.gov.tr → İhlal Bildirimi

- [ ] **E-posta başvuru adresi belirle**
  - Müşteri talepleri için: örn. `kvkk@studyo.com`
  - Bu adres aydınlatma metninde belirtilmeli

### 🟢 İyi Uygulama — 3 Ay İçinde

- [ ] **Yıllık KVKK gözden geçirmesi planla**
  - Saklama sürelerini kontrol et
  - Yeni özellikler eklenirse aydınlatma metnini güncelle
  - VERBİS eşiğini tekrar kontrol et

- [ ] **Fiziksel belgeler** (USB bellek, baskı vb.)
  - Müşteri fotoğraflarını içeren USB bellekleri güvenli yerde sakla
  - Kullanılmayan kopyaları imha et

---

## 📋 Ceza Referansı (2025 yılı itibarıyla)

| İhlal | Ceza Aralığı |
|-------|-------------|
| Aydınlatma yükümlülüğü ihlali | 68.083 TL – 1.362.021 TL |
| Açık rıza ihlali | 272.380 TL – 13.620.402 TL |
| Veri güvenliği ihlali | 272.380 TL – 13.620.402 TL |
| VERBİS kayıt ihlali | 68.083 TL – 1.362.021 TL |

> **Not:** Bu kontrol listesi bilgilendirme amaçlıdır, hukuki tavsiye niteliği taşımaz. Kesin uyum için bir KVKK avukatına veya danışmanına başvurmanız önerilir.
