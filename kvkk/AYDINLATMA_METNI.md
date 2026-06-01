# KİŞİSEL VERİLERİN KORUNMASI KANUNU KAPSAMINDA AYDINLATMA METNİ

**[STÜDYO ADI]** ("Stüdyo")
**Son Güncelleme:** Haziran 2026

---

## 1. Veri Sorumlusu

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca **veri sorumlusu** sıfatıyla hareket eden:

| | |
|---|---|
| **Ticaret Unvanı** | [Stüdyo Adı / Ad Soyad] |
| **Adres** | [Tam Adres] |
| **E-posta** | [E-posta Adresi] |
| **Telefon** | [Telefon Numarası] |

---

## 2. İşlenen Kişisel Veriler ve İşleme Amaçları

### 2.1 Kimlik ve İletişim Verileri

| Veri | Amaç | Hukuki Dayanak |
|------|------|----------------|
| Ad, soyad | Hizmet sunumu, kimlik doğrulama | KVKK m.5/2-c (sözleşmenin ifası) |
| E-posta adresi | Albüm erişim bilgisi, bildirim | KVKK m.5/2-c (sözleşmenin ifası) |
| Telefon numarası | İletişim (opsiyonel) | KVKK m.5/1 (açık rıza) |
| Şifreli parola | Hesap güvenliği | KVKK m.5/2-c (sözleşmenin ifası) |

### 2.2 Fotoğraf ve Video Verileri

| Veri | Amaç | Hukuki Dayanak |
|------|------|----------------|
| Çekilen fotoğraflar | Müşteriye hizmet teslimi | KVKK m.5/2-c (sözleşmenin ifası) |
| Çekilen videolar | Müşteriye hizmet teslimi | KVKK m.5/2-c (sözleşmenin ifası) |

> **Önemli Not:** Stüdyo tarafından çekilen fotoğraflar kişisel veri niteliği taşımakla birlikte, **yüz tanıma veya kimlik doğrulama amacıyla teknik işleme tabi tutulmadığından** KVKK kapsamında "biyometrik veri" sayılmamaktadır (KVKK Kurul Kararı ve KVK Uygulama Rehberi, Mart 2018). Ancak bu durum, fotoğrafların kişisel veri olma niteliğini ortadan kaldırmaz; tüm fotoğraflar bu Aydınlatma Metni kapsamında korunur.

### 2.3 Teknik ve Kullanım Verileri

| Veri | Amaç | Hukuki Dayanak |
|------|------|----------------|
| Cihaz FCM token'ı | Push bildirim gönderimi | KVKK m.5/1 (açık rıza) |
| Albüm görüntülenme tarihleri | Hizmet kalitesi | KVKK m.5/2-f (meşru menfaat) |
| Albüm görüntülenme sayısı | Hizmet kalitesi | KVKK m.5/2-f (meşru menfaat) |

---

## 3. Verilerin Aktarılması

Kişisel verileriniz aşağıdaki taraflara aktarılabilir:

| Alıcı | Aktarılan Veri | Amaç | Dayanak |
|-------|---------------|------|---------|
| **Google Firebase** (ABD) | Hesap bilgileri, fotoğraflar | Bulut depolama ve altyapı | KVKK m.9 – Yeterlilik kararı / Standart Sözleşme |
| **Yetkili Kamu Kurumları** | Talep edilen veriler | Yasal yükümlülük | KVKK m.8/2-ç |

> **Yurt Dışı Aktarım Notu:** Veriler Google LLC altyapısında (Firebase) işlenmektedir. Google, AB-ABD Veri Gizlilik Çerçevesi ile KVKK kapsamında yeterli güvenceleri sağlamaktadır. Stüdyo olarak Google ile KVKK m.9 uyarınca standart veri koruma sözleşmesi imzalanmıştır.

---

## 4. Saklama Süreleri

| Veri Kategorisi | Saklama Süresi | Gerekçe |
|----------------|----------------|---------|
| Hesap bilgileri | Hizmet ilişkisi + 3 yıl | Ticari alacak zamanaşımı |
| Fotoğraf / video dosyaları | Albüm bitiş tarihi + 30 gün | Sözleşme gereği |
| Yorum verileri | Hesap silme talebi veya 2 yıl | Hizmet kalitesi |
| Analitik veriler (anonim) | Süresiz | Anonimleştirilmiş, kişisel veri değil |
| Push bildirim token'ları | Hesap silme talebi | Bildirim hizmeti |

Saklama süresi dolan veriler **silinir, yok edilir veya anonim hale getirilir.**

---

## 5. Veri Güvenliği Tedbirleri

Stüdyo, kişisel verilerinizin güvenliğini sağlamak için KVKK m.12 ve Kurul'un 2018/10 sayılı kararı uyarınca aşağıdaki teknik ve idari tedbirleri almaktadır:

**Teknik Tedbirler:**
- Tüm veriler HTTPS/TLS ile şifreli iletilir
- Firebase Storage güvenlik kuralları ile yetkisiz erişim engellenir
- Fotoğraflara herkese açık link verilmez; imzalı URL (Signed URL) kullanılır
- Şifreler asla düz metin olarak saklanmaz (Firebase Authentication – bcrypt)
- Kullanıcı oturumları güvenli token ile yönetilir
- Rol tabanlı erişim kontrolü (Admin / Müşteri)

**İdari Tedbirler:**
- Müşteri verilerine yalnızca stüdyo sahibi erişebilir
- Üçüncü taraflarla kişisel veri paylaşılmaz
- Veri ihlali durumunda 72 saat içinde KVK Kurumu'na bildirim yapılır

---

## 6. İlgili Kişi Hakları (KVKK m.11)

KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:

- ✅ Kişisel verilerinizin işlenip işlenmediğini **öğrenme**
- ✅ İşlenmişse buna ilişkin bilgi **talep etme**
- ✅ İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını **öğrenme**
- ✅ Yurt içinde/dışında aktarıldığı üçüncü kişileri **bilme**
- ✅ Eksik/yanlış işlenmiş verilerin **düzeltilmesini isteme**
- ✅ Kanun'un 7. maddesindeki şartlara göre **silinmesini talep etme**
- ✅ Düzeltme/silme işlemlerinin üçüncü kişilere **bildirilmesini isteme**
- ✅ Otomatik sistemler aracılığıyla aleyhinize sonuç doğurmasına **itiraz etme**
- ✅ Kanuna aykırı işleme nedeniyle zararın **tazminini talep etme**

**Başvuru Yöntemi:**

Taleplerinizi aşağıdaki yollarla iletebilirsiniz:

- **E-posta:** [E-POSTA ADRESİ] (kayıtlı e-posta / KEP tercih edilir)
- **Yazılı Başvuru:** Yukarıdaki adrese ıslak imzalı dilekçe

Başvurunuz **30 gün** içinde yanıtlanacaktır. Talebin reddedilmesi veya yanıtsız kalması halinde KVK Kurumu'na şikayette bulunabilirsiniz.

---

## 7. Çerezler ve Analitik

Mobil uygulama; analitik, oturum yönetimi ve bildirim amacıyla teknik veri toplar. Bu kapsamda:
- Firebase Analytics **devre dışı bırakılmıştır** (yalnızca stüdyo içi sayaçlar kullanılır)
- Üçüncü taraf reklam ağlarına veri aktarılmaz
- Profil oluşturma veya davranışsal hedefleme yapılmaz

---

*Bu metin en son KVKK düzenlemeleri esas alınarak hazırlanmıştır. Mevzuat değişikliklerinde güncellenecektir. Hukuki tavsiye niteliği taşımaz; nihai uyum için bir KVKK avukatına danışmanız önerilir.*
