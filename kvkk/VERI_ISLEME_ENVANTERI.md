# KİŞİSEL VERİ İŞLEME ENVANTERİ
## (VERBİS Kaydı İçin Hazırlık Belgesi)

**[STÜDYO ADI]**
**Tarih:** Haziran 2026

---

> **VERBİS Notu:** Yıllık çalışan sayısı 50'den az VE yıllık mali bilançosu 100 milyon TL altında olan stüdyolar VERBİS kaydından **muaf** olabilir — ancak muafiyet, KVKK'nın diğer tüm yükümlülüklerini (aydınlatma, güvenlik, saklama, ilgili kişi hakları) ortadan kaldırmaz. Stüdyonuzun büyümesiyle birlikte bu eşiği yıllık olarak kontrol etmeniz gerekir.

---

## Veri İşleme Faaliyetleri

### Faaliyet 1: Müşteri Hesabı Yönetimi

| Alan | Detay |
|------|-------|
| **İşleme Amacı** | Kimlik doğrulama, hizmet erişimi |
| **Hukuki Dayanak** | KVKK m.5/2-c (sözleşmenin ifası) |
| **Veri Kategorisi** | Kimlik (ad-soyad), iletişim (e-posta), güvenlik (şifreli parola) |
| **Veri Sahipleri** | Müşteriler |
| **Aktarım** | Firebase Authentication (Google LLC, ABD) |
| **Aktarım Güvencesi** | Standart sözleşme / yeterlilik kararı |
| **Saklama Süresi** | Hesap silme + 3 yıl |
| **Güvenlik Tedbirleri** | Şifreleme, HTTPS, rol tabanlı erişim |

---

### Faaliyet 2: Fotoğraf ve Video Teslimi

| Alan | Detay |
|------|-------|
| **İşleme Amacı** | Fotoğrafçılık hizmetinin dijital olarak teslim edilmesi |
| **Hukuki Dayanak** | KVKK m.5/2-c (sözleşmenin ifası) |
| **Veri Kategorisi** | Fotoğraf/video (kişisel görüntü verisi) |
| **Veri Sahipleri** | Müşteriler ve fotoğraflarda yer alan üçüncü kişiler |
| **Aktarım** | Firebase Storage (Google LLC, ABD) |
| **Aktarım Güvencesi** | Standart sözleşme / yeterlilik kararı |
| **Saklama Süresi** | Albüm bitiş tarihi + 30 gün |
| **Güvenlik Tedbirleri** | Signed URL, Storage Rules, şifreli iletim |

> **Not — Üçüncü Kişi Fotoğrafları:** Düğün/nişan çekimlerinde fotoğraflarda müşteri dışında başka kişiler de yer alabilir. Bu kişilerin görüntüleri de kişisel veri sayılır. Fotoğrafların yalnızca ilgili müşteriye teslim edilmesi ve üçüncü taraflarla paylaşılmaması bu riski yönetir. Ayrıca hizmet sözleşmesine "Fotoğraflarda yer alan üçüncü kişilerin görüntüleri yalnızca hizmet kapsamında işlenir" maddesi eklenmelidir.

---

### Faaliyet 3: Push Bildirim Gönderimi

| Alan | Detay |
|------|-------|
| **İşleme Amacı** | Albüm hazır bildirimi |
| **Hukuki Dayanak** | KVKK m.5/1 (açık rıza) |
| **Veri Kategorisi** | Teknik (FCM cihaz token'ı) |
| **Aktarım** | Firebase Cloud Messaging (Google LLC, ABD) |
| **Saklama Süresi** | Rıza geri alınana veya hesap silinene dek |
| **Güvenlik Tedbirleri** | Token şifreli iletim, yalnızca servis hesabı erişimi |

---

### Faaliyet 4: Analitik

| Alan | Detay |
|------|-------|
| **İşleme Amacı** | Hizmet kalitesi ölçümü |
| **Hukuki Dayanak** | KVKK m.5/2-f (meşru menfaat) |
| **Veri Kategorisi** | Kullanım verileri (görüntülenme sayısı, tarih) |
| **Saklama Süresi** | Anonim hale getirildikten sonra süresiz |
| **Not** | Kişiyle ilişkilendirilebilir ham log en fazla 90 gün saklanır |

---

## Güvenlik Tedbirleri Özeti (Kurul 2018/10 Kararı)

| Tedbir | Durum |
|--------|-------|
| Kişisel veri işleme envanteri | ✅ Bu belge |
| Aydınlatma metni | ✅ Hazır |
| Açık rıza metni | ✅ Hazır |
| Saklama ve imha politikası | ✅ Hazır |
| Veri güvenliği (şifreleme/HTTPS) | ✅ Firebase |
| Erişim kontrolü (rol tabanlı) | ✅ Kod içinde |
| Otomatik imha sistemi | ✅ Cloud Function |
| İhlal bildirimi prosedürü | ⚠️ Stüdyo sahibi tarafından belgelenmeli |
| Çalışan gizlilik taahhüdü | ⚠️ Çalışan varsa gerekli |
| VERBİS kaydı | ⚠️ Eşik kontrolü yapılmalı |
