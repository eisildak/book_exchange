# Kitap Takası – Proje Raporu

**Proje Adı:** Kitap Takası (Book Exchange)  
**Versiyon:** 2.1  
**Tarih:** 20 Mayıs 2026  
**Depo:** https://github.com/Book-Exchange-2-0/Book-Exchange-2.1

---

## 1. Proje Özeti

Kitap Takası, kullanıcıların ikinci el kitaplarını listeleyerek diğer kullanıcılarla takas etmesine olanak tanıyan tam yığınlı (full-stack) bir web uygulamasıdır. Platform; kayıt/giriş yönetimi, kişisel kitaplık oluşturma, kitap arama ve takas talebi gönderip alma gibi temel işlevleri tek bir SPA (Tek Sayfa Uygulaması) çatısı altında sunar.

---

## 2. Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| **Ön Yüz (Frontend)** | React 18, React Router DOM v6, React Bootstrap 2, SCSS |
| **Arka Yüz (Backend)** | Node.js, Express 4 |
| **Veritabanı** | PostgreSQL (`pg` kütüphanesi, bağlantı havuzu) |
| **Güvenlik** | bcrypt 5 (şifre karma — salt rounds: 12) |
| **Harici API** | Google Books API (ISBN tabanlı kitap bilgisi çekme) |
| **Derleme Araçları** | Webpack 5, Babel 7 |
| **Test** | Jest, @testing-library/react, Supertest |
| **Geliştirme** | Webpack Dev Server, Nodemon, Concurrently |

---

## 3. Proje Mimarisi

### 3.1 Klasör Yapısı

```
Book-Exchange-2.1/
├── client/              # React ön yüz kodu
│   ├── App.jsx          # Kök uygulama bileşeni, global durum (loggedIn, userId)
│   ├── index.js         # ReactDOM render giriş noktası
│   ├── components/      # Yeniden kullanılabilir bileşenler
│   │   ├── Nav.jsx
│   │   ├── MyBookRow.jsx
│   │   ├── SearchBookRow.jsx
│   │   └── ExchangeRow.jsx
│   ├── routes/          # Sayfa düzeyinde bileşenler
│   │   ├── Root.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── MyPage.jsx
│   │   ├── Search.jsx
│   │   ├── Exchange.jsx
│   │   └── NotFound.jsx
│   └── stylesheets/
│       └── styles.scss
├── server/              # Express arka yüz kodu
│   ├── server.js        # Express uygulama kurulumu ve dinleme
│   ├── routes/
│   │   └── api.js       # Tüm /api rotaları
│   ├── controllers/
│   │   ├── apiController.js    # Google Books API entegrasyonu
│   │   ├── dbController.js     # Veritabanı CRUD işlemleri
│   │   ├── userController.js   # Kullanıcı kayıt ve doğrulama
│   │   └── cookieController.js # (Henüz uygulanmadı)
│   └── models/
│       ├── booksModels.js      # pg Pool bağlantısı
│       └── Book Exchange 2.0_postgres_create.sql
├── __tests__/
│   ├── backendTesting.js
│   └── reactTesting.js
├── public/
│   └── index.html
├── scripts/
│   └── init-db.js
├── package.json
├── webpack.config.js
└── jest.config.js
```

### 3.2 Veri Akışı

```
Tarayıcı (React SPA)
       │  fetch() ile HTTP isteği
       ▼
Express Sunucusu (/api)
       │  Middleware zinciri (Controller fonksiyonları)
       ▼
PostgreSQL Veritabanı  ←→  Google Books API
```

Sunucu; `apiController → dbController → userController` şeklinde sıralı middleware zinciri kullanır. Her controller, `res.locals` üzerinden bir sonraki katmana veri aktarır.

---

## 4. Veritabanı Tasarımı

Uygulama PostgreSQL üzerinde üç tablo kullanmaktadır:

```sql
-- Kullanıcılar
CREATE TABLE users (
    user_id  SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,        -- bcrypt ile hashlenmiş
    email    VARCHAR NOT NULL,
    phone    VARCHAR NOT NULL,
    address  VARCHAR NOT NULL
);

-- Kitaplar (paylaşılan katalog)
CREATE TABLE books (
    isbn   VARCHAR PRIMARY KEY,
    title  VARCHAR NOT NULL,
    author VARCHAR NOT NULL,
    genre  VARCHAR NOT NULL
);

-- Kullanıcı–Kitap ilişkisi (takas durumu dahil)
CREATE TABLE users_books (
    users_books_id SERIAL PRIMARY KEY,
    requester      BIGINT REFERENCES users,     -- Kitabı talep eden kullanıcı
    user_id        INTEGER NOT NULL REFERENCES users,
    bookisbn       VARCHAR NOT NULL REFERENCES books,
    condition      VARCHAR NOT NULL             -- Kitap durumu (Sıfır Gibi, İyi…)
);
```

**İlişki Diyagramı:**

```
users ──< users_books >── books
            │
            └── requester → users (self-referencing FK)
```

`users_books.requester` alanı NULL ise kitap takas talebine açıktır; dolu ise başka bir kullanıcı talep etmiştir.

---

## 5. API Uç Noktaları

### Kullanıcı İşlemleri

| Metot | Yol | Açıklama |
|---|---|---|
| `POST` | `/api/register` | Yeni kullanıcı oluşturur; şifreyi bcrypt ile hashler |
| `POST` | `/api/verifyUser` | Kullanıcı girişi; bcrypt.compare ile doğrulama yapar |

### Kitap İşlemleri

| Metot | Yol | Açıklama |
|---|---|---|
| `POST` | `/api/addOldBook` | ISBN ile kitap ekler; Google Books API'dan bilgileri çeker |
| `POST` | `/api/addManualBook` | Başlık/yazar ile manuel kitap ekler |
| `POST` | `/api/findOldBook` | Başlığa göre kitap arar (regex destekli) |
| `POST` | `/api/deleteOldBook` | Kullanıcının kitaplığından kitap siler |
| `GET`  | `/api/getMyOldBookList/:userId` | Kullanıcının kitaplarını listeler |

### Takas İşlemleri

| Metot | Yol | Açıklama |
|---|---|---|
| `POST` | `/api/requestBook` | Kitap takas talebi gönderir |
| `GET`  | `/api/getIncomingInfo/:userId` | Gelen takas taleplerini listeler |
| `GET`  | `/api/getOutgoingInfo/:userId` | Giden takas taleplerini listeler |
| `POST` | `/api/acceptRequest` | Takas talebini kabul eder |
| `POST` | `/api/shipped` | Kitabın gönderildiğini işaretler |

---

## 6. Temel Özellikler

### 6.1 Kullanıcı Kayıt ve Giriş
Yeni kullanıcılar `username`, `password`, `email`, `phone` ve `address` bilgileriyle kayıt olur. Şifre, salt rounds 12 ile bcrypt kullanılarak hashlenir ve veritabanına düz metin olarak hiçbir zaman yazılmaz. Giriş işleminde `bcrypt.compare` ile doğrulama yapılır.

### 6.2 Kitaplığım (My Page)
Kullanıcı iki yöntemle kitap ekleyebilir:
- **ISBN ile ekleme:** ISBN numarası girildiğinde `apiController.findBook`, Google Books API'dan (`.../volumes?q=isbn:<isbn>`) başlık, yazar ve tür bilgilerini otomatik olarak getirir.
- **Manuel ekleme:** Başlık ve yazar zorunlu; ISBN isteğe bağlıdır. ISBN girilmezse sistem `MANUAL-<timestamp>-<rastgele>` formatında benzersiz bir tanımlayıcı üretir.

Her kitap için durum (condition) seçimi yapılır: *Sıfır Gibi, İyi, Orta* vb.

### 6.3 Kitap Arama
Kullanıcılar başlık metnine göre tüm sistemi tarayabilir. Arama sorgusu PostgreSQL'in `~*` (büyük-küçük harf duyarsız regex) operatörü ile `\y...\y` sözcük sınırları kullanılarak çalıştırılır. Sonuçlar; başlık, yazar, durum, ISBN ve sahip kullanıcı adını içerir. Buradan takas talebi gönderilebilir.

### 6.4 Takas Yönetimi (Exchange)
- **Gelen talepler:** Başka kullanıcıların talep ettiği kitapları gösterir; kabul etme seçeneği sunar.
- **Giden talepler:** Kullanıcının başkasından talep ettiği kitapları gösterir; gönderim durumunu (shipped) takip eder.

---

## 7. Ön Yüz Yapısı

### 7.1 Uygulama Durumu (State)
`App.jsx` global state'i yönetir:
```javascript
state = {
  loggedIn: false,   // Oturum durumu
  userId: null,      // Aktif kullanıcının ID'si
  error: null        // Hata mesajları
};
```
`loggedIn` ve `userId`, prop drilling ile ilgili rota bileşenlerine iletilir.

### 7.2 Rota Yapısı (React Router v6)

| Yol | Bileşen | Açıklama |
|---|---|---|
| `/` | `Root` | Ana sayfa / karşılama ekranı |
| `/login` | `Login` | Giriş formu |
| `/register` | `Register` | Kayıt formu |
| `/mypage` | `MyPage` | Kişisel kitaplık |
| `/search` | `Search` | Kitap arama |
| `/exchange` | `Exchange` | Takas yönetimi |
| `*` | `NotFound` | 404 sayfası |

### 7.3 Bileşenler

| Bileşen | Açıklama |
|---|---|
| `Nav` | Oturum durumuna göre Giriş/Çıkış bağlantıları gösterir |
| `MyBookRow` | Kitaplıktaki her kitabı satır olarak render eder; silme butonu içerir |
| `SearchBookRow` | Arama sonucundaki her kitabı render eder; "Talep Et" butonu içerir |
| `ExchangeRow` | Takas taleplerini render eder; kabul/gönderim butonları içerir |

---

## 8. Güvenlik Değerlendirmesi

### Uygulanan Güvenlik Önlemleri
- **Şifre karma:** bcrypt, salt rounds 12 ile kullanılır — kaba kuvvet saldırılarına karşı dirençlidir.
- **Şifre doğrulama:** `bcrypt.compare` ile gerçekleştirilir, zamanlama saldırılarına karşı güvenlidir.
- **Hata soyutlama:** Hata yanıtları, iç sistem detaylarını kullanıcıya açıklamaz.
- **Global hata yöneticisi:** Beklenmeyen hatalar merkezi middleware tarafından yakalanır.

### Bilinen Güvenlik Açıkları
- **SQL enjeksiyonu riski:** `dbController.js` içindeki bazı sorgular şablon dizesi (`${variable}`) kullanır ve SQL enjeksiyonuna karşı savunmasızdır. Bu sorgular parameterize edilmiş (`$1, $2, ...`) hale getirilmelidir.
- **Cookie tabanlı oturum yönetimi eksik:** `cookieController.js` boştur; oturum doğrulaması şu an yalnızca istemci tarafında `state` ile yönetilmektedir.
- **CSRF koruması yok:** Durum değiştiren POST uç noktaları CSRF token ile korunmamaktadır.

---

## 9. Test Kapsamı

`__tests__/` klasöründe iki test dosyası bulunmaktadır:

### Backend Testleri (`backendTesting.js`)
Supertest kütüphanesi kullanılarak Express sunucusuna entegrasyon testleri yazılmıştır. Test edilen uç noktalar:
- `/api/addOldBook`, `/api/findOldBook`, `/api/requestBook`
- `/api/deleteOldBook`, `/api/getMyOldBookList`
- `/api/register`, `/api/verifyUser`

> **Not:** Testlerin büyük çoğunluğu `xit` (atla) ile işaretlenmiştir; çalışan veritabanı bağlantısı gerektirdiğinden CI ortamında otomatik çalıştırılamamaktadır.

### Ön Yüz Testleri (`reactTesting.js`)
`@testing-library/react` ile bileşen render testleri yazılmıştır:
- `App`, `Nav`, `Login`, `Register` bileşenleri
- Oturum durumuna göre Nav görünümü

> **Not:** Bu testlerin büyük bölümü de `xtest` ile devre dışı bırakılmıştır.

---

## 10. Kurulum ve Çalıştırma

### Ön Koşullar
- Node.js >= 16
- PostgreSQL >= 13
- npm >= 8

### Adımlar

```bash
# 1. Depoyu klonlayın
git clone https://github.com/Book-Exchange-2-0/Book-Exchange-2.1.git
cd Book-Exchange-2.1

# 2. Bağımlılıkları yükleyin
npm install

# 3. Veritabanını oluşturun
psql -U postgres -c "CREATE DATABASE bookexchange;"
psql -U postgres -d bookexchange -f "server/models/Book Exchange 2.0_postgres_create.sql"

# 4. (İsteğe bağlı) Ortam değişkeni ayarlayın
export DATABASE_URL=postgresql://localhost/bookexchange

# 5. Geliştirme modunda çalıştırın (Webpack Dev Server + Nodemon)
npm run dev

# 6. Üretim için derleyin
npm run build
npm start
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

---

## 11. Geliştirme Önerileri

| Öncelik | Konu | Açıklama |
|---|---|---|
| Yüksek | SQL enjeksiyonu düzeltmesi | `dbController.js` içindeki tüm ham string interpolasyon sorguları, `pg` kütüphanesinin parametreli sorgu desteğine geçirilmelidir. |
| Yüksek | Cookie/JWT oturum yönetimi | `cookieController.js` tamamlanmalı; kullanıcı kimliği client-side state yerine güvenli oturum cookie'si veya JWT ile taşınmalıdır. |
| Orta | Test kapsamı genişletme | `xit`/`xtest` ile devre dışı bırakılmış testler etkinleştirilmeli; test ortamı için mock veritabanı (pg-mem veya Docker PostgreSQL) kurulmalıdır. |
| Orta | CSRF koruması | `csurf` veya benzeri bir kütüphane ile durum değiştiren tüm uç noktalara CSRF token koruması eklenmelidir. |
| Düşük | Class → Function bileşenlerine geçiş | `MyPage`, `Search`, `Exchange` gibi sınıf bileşenleri React Hooks kullanarak fonksiyon bileşenlerine dönüştürülebilir. |
| Düşük | Hata mesajlarının ön yüzde gösterimi | Kullanıcıya hataların açıkça gösterildiği bir bildiri (toast/alert) sistemi eklenebilir. |

---

## 12. Sonuç

Kitap Takası, kitap okuyucularını bir araya getiren, kullanıcı dostu ve işlevsel bir takas platformudur. React + Express + PostgreSQL üçlüsüyle modern, geliştirilebilir bir mimari sunmaktadır. Güvenlik açıklarının giderilmesi ve test kapsamının artırılması, projenin üretime alınmadan önce öncelikli olarak ele alınması gereken konulardır.
