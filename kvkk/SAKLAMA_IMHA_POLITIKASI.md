# KİŞİSEL VERİLERİ SAKLAMA VE İMHA POLİTİKASI

**[STÜDYO ADI]**
**Versiyon:** 1.0 | **Tarih:** Haziran 2026

---

## 1. Amaç ve Kapsam

Bu politika, 6698 sayılı KVKK'nın 7. maddesi ve **Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hâle Getirilmesi Hakkında Yönetmelik** uyarınca hazırlanmıştır.

Tüm müşteri kişisel verilerini kapsar.

---

## 2. Saklama Süreleri Tablosu

| Veri Kategorisi | Saklama Süresi | Dayanak |
|----------------|----------------|---------|
| Kullanıcı hesabı (ad, e-posta) | Hesap silme + 3 yıl | TTK m.82 – ticari defter saklama |
| Şifreli parola | Anlık (Firebase tarafında) | Güvenlik gereği |
| Fotoğraf dosyaları | Albüm bitiş tarihi + 30 gün | Sözleşmesel yükümlülük |
| Video dosyaları | Albüm bitiş tarihi + 30 gün | Sözleşmesel yükümlülük |
| Thumbnail/önizleme | Orijinal silindiğinde | Türev veri |
| Favori kayıtları | Hesap silme | Hizmet parçası |
| Yorum verileri | İstek veya 2 yıl | Hizmet kalitesi |
| Bildirim token'ları | Hesap silme veya rıza geri alma | Açık rıza |
| Görüntülenme sayaçları | Anonim — süresiz | Anonimleştirilmiş veri |
| Paylaşım linkleri (token) | Bitiş tarihi + 7 gün | Otomatik temizlik |

---

## 3. İmha Yöntemleri

### 3.1 Dijital Veriler

| Ortam | Yöntem |
|-------|--------|
| Firebase Storage (fotoğraf/video) | Firebase Admin SDK ile kalıcı silme (hard delete) |
| Firestore (kullanıcı kaydı) | Doküman silme + alt koleksiyonlar |
| Firebase Auth | `deleteUser()` ile hesap silme |
| Yedek / cache | Firebase tarafından otomatik |

### 3.2 İmha Periyodu

- **Periyodik İmha:** Her ayın ilk günü otomatik Cloud Function ile süresi dolan albümler ve veriler temizlenir
- **Talep Üzerine:** Müşteri başvurusundan itibaren **30 gün** içinde

---

## 4. Müşteri Hakları ve Başvuru

| Hak | Nasıl Kullanılır |
|-----|-----------------|
| Veri silme talebi | Uygulama → Profil → "Verilerimi Sil" veya e-posta |
| Veri kopyası talebi | E-posta ile başvuru |
| Düzeltme talebi | Uygulama → Profil veya e-posta |
| İşlemeye itiraz | E-posta ile başvuru |

**Yanıt süresi:** 30 gün (karmaşık taleplerde +30 gün uzatılabilir)

---

## 5. Otomatik İmha Cloud Function'ı

```
Tetikleyici: Her ayın 1'i, 03:00
Görev:
  1. expiresAt < şimdiki zaman olan albümleri bul
  2. Albüme ait Storage dosyalarını sil
  3. Firestore alt koleksiyonlarını (photos, favorites) sil
  4. Albüm dokümanını sil
  5. İmha kaydını audit_logs'a yaz
```

---

## 6. Politika Güncellemeleri

Bu politika yılda en az bir kez veya mevzuat değişikliklerinde güncellenir.
