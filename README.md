# 📸 Fotoğraf Stüdyosu Mobil Uygulama

Flutter + Firebase + Next.js tabanlı, fotoğraf stüdyosu müşteri galerisi uygulaması.

---

## 🆕 v2'de Eklenen Özellikler

İnternet araştırması sonucunda **PicPeak**, **Picstome** ve **Lightfolio** projelerinden ilham alınarak eklendi:

| Özellik | Kaynak | Nerede |
|---------|--------|--------|
| **QR Kod ile Albüme Erişim** | PicPeak | `functions/shareLink.ts` + `QRShareScreen.dart` |
| **Filigran (Watermark)** | PicPeak | `functions/watermark.ts` |
| **Görüntülenme & İndirme Sayacı** | PicPeak | `functions/analytics.ts` + `AlbumAnalytics.tsx` |
| **Müşteri Yorum Sistemi** | PicPeak | `functions/comments.ts` + `CommentsSheet.dart` |
| **Fotoğraf Seçim & Onay Modu** | Lightfolio | `functions/photoSelection.ts` + `PhotoSelectionScreen.dart` |
| **Müşteri CRM Notu** | Picstome | `lib/types.ts` → User.notes |

---

## 🚀 Hızlı Başlangıç

### 1. Firebase Projesi Oluştur

```bash
# Firebase CLI kur
npm install -g firebase-tools

# Giriş yap
firebase login

# Proje oluştur (Firebase Console'dan da yapılabilir)
firebase projects:create fotograf-studyosu
```

### 2. Firebase'i Yapılandır

Firebase Console → Project Settings → Your Apps → Add app (Web + iOS + Android)

`.env.local.example` dosyasını `.env.local` olarak kopyala ve değerleri doldur:

```bash
cp admin-panel/.env.local.example admin-panel/.env.local
```

### 3. Firebase Kuralları & Indexleri Deploy Et

```bash
cd firebase
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 4. Cloud Functions Deploy Et

```bash
cd firebase/functions
npm install
npm run build
firebase deploy --only functions
```

### 5. Admin Panel'i Başlat

```bash
cd admin-panel
npm install
npm run dev
# http://localhost:3000
```

### 6. İlk Admin Kullanıcısını Oluştur

Firebase Console → Authentication → Add user

Ardından Firestore'da `users/{uid}` dokümanı oluştur:
```json
{
  "id": "UID_BURAYA",
  "name": "Admin",
  "email": "admin@studyo.com",
  "role": "admin",
  "createdAt": "serverTimestamp"
}
```

Son olarak custom claim ekle (Firebase Console → Functions → `setAdminRole` callable):
```js
// Admin paneli ilk kez açınca browser console'dan:
firebase.functions().httpsCallable('setAdminRole')({ targetUid: 'UID' })
```

### 7. Flutter Uygulamasını Yapılandır

```bash
# FlutterFire CLI kur
dart pub global activate flutterfire_cli

cd mobile-app
flutter pub get

# Firebase'i bağla (firebase_options.dart oluşturur)
flutterfire configure

# Uygulamayı çalıştır
flutter run
```

---

## 📁 Proje Yapısı

```
fotograf-studyosu/
├── ARASTIRMA.md          ← Araştırma bulguları ve entegrasyon notları
├── firebase/             ← Firebase kuralları & Cloud Functions
│   ├── firestore.rules
│   ├── storage.rules
│   ├── firestore.indexes.json
│   └── functions/src/
│       ├── auth/
│       ├── albums/       ← Core + Watermark + QR + Analytics + Comments + Selection
│       └── notifications/
├── admin-panel/          ← Next.js 14 admin paneli
│   ├── app/
│   ├── components/features/
│   │   ├── PhotoUploader.tsx
│   │   ├── AlbumQRCode.tsx    ← YENİ
│   │   └── AlbumAnalytics.tsx ← YENİ
│   └── lib/
└── mobile-app/           ← Flutter uygulaması
    └── lib/
        ├── presentation/screens/
        │   ├── albums/
        │   │   ├── comments_sheet.dart         ← YENİ
        │   │   └── photo_selection_screen.dart ← YENİ
        │   └── share/
        │       └── qr_share_screen.dart        ← YENİ
        └── providers/
```

---

## 🔐 Güvenlik Notları

- `.env.local` dosyasını asla git'e pushlama
- Firebase private key'ini Vercel/hosting ortam değişkenlerine ekle
- Production'da Firebase Storage kurallarını sıkılaştır
- KVKK için gizlilik politikası ve açık rıza metni ekle

---

## 🗓 Geliştirme Yol Haritası

### V1 (MVP) — Şu an
- [x] Firebase altyapısı
- [x] Admin panel (müşteri + albüm + fotoğraf yönetimi)
- [x] Flutter mobil uygulama (giriş, albüm, fotoğraf, favori)
- [x] QR kod paylaşım linki
- [x] Görüntülenme analitikleri

### V2 — Yakında
- [ ] Video desteği
- [ ] Filigran (watermark) uygulaması
- [ ] Fotoğraf seçim onay modu
- [ ] Müşteri yorum sistemi
- [ ] E-posta bildirimleri

### V3 — İleri
- [ ] Stripe/iyzico ödeme entegrasyonu
- [ ] Baskı siparişi
- [ ] Yapay zeka yüz arama
- [ ] Portföy sayfası
