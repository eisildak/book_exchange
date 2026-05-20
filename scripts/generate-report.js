const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, convertInchesToTwip, UnderlineType
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Yardımcı fonksiyonlar ───────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 120 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 100 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 80 },
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, ...opts })],
    spacing: { after: 120 },
  });
}

function bold(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22 })],
    spacing: { after: 80 },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Courier New', size: 18 })],
    spacing: { after: 60 },
    indent: { left: 720 },
  });
}

function separator() {
  return new Paragraph({ text: '', spacing: { after: 80 } });
}

function makeTable(headers, rows) {
  const headerCells = headers.map(h =>
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, size: 20, color: 'FFFFFF' })],
      })],
      shading: { type: ShadingType.SOLID, color: '2E74B5' },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
    })
  );

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map(cell =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: cell, size: 20 })],
          })],
          shading: ri % 2 === 0
            ? { type: ShadingType.SOLID, color: 'F2F7FD' }
            : { type: ShadingType.SOLID, color: 'FFFFFF' },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
        })
      ),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...dataRows],
    margins: { top: 0, bottom: 200, left: 0, right: 0 },
  });
}

// ─── Belge içeriği ───────────────────────────────────────────────────────────

const children = [

  // Başlık sayfası
  new Paragraph({
    children: [new TextRun({ text: 'Kitap Takası', bold: true, size: 56, color: '2E74B5' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Proje Raporu', size: 36, color: '404040' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Versiyon 2.1  |  20 Mayıs 2026', size: 24, color: '808080' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 1200 },
  }),
  new Paragraph({ text: '', pageBreakBefore: true }),

  // 1. Proje Özeti
  h1('1. Proje Özeti'),
  para(
    'Kitap Takası, kullanıcıların ikinci el kitaplarını listeleyerek diğer kullanıcılarla takas ' +
    'etmesine olanak tanıyan tam yığınlı (full-stack) bir web uygulamasıdır. Platform; kullanıcı ' +
    'kayıt/giriş yönetimi, kişisel kitaplık oluşturma, başlığa göre kitap arama ve takas talebi ' +
    'gönderip alma gibi temel işlevleri tek bir SPA (Tek Sayfa Uygulaması) çatısı altında sunar.'
  ),

  separator(),

  // 2. Teknoloji Yığını
  h1('2. Teknoloji Yığını'),
  makeTable(
    ['Katman', 'Teknoloji'],
    [
      ['Ön Yüz (Frontend)', 'React 18, React Router DOM v6, React Bootstrap 2, SCSS'],
      ['Arka Yüz (Backend)', 'Node.js, Express 4'],
      ['Veritabanı', 'PostgreSQL (pg kütüphanesi, bağlantı havuzu)'],
      ['Güvenlik', 'bcrypt 5 (şifre karma — salt rounds: 12)'],
      ['Harici API', 'Google Books API (ISBN tabanlı kitap bilgisi)'],
      ['Derleme Araçları', 'Webpack 5, Babel 7'],
      ['Test', 'Jest, @testing-library/react, Supertest'],
      ['Geliştirme', 'Webpack Dev Server, Nodemon, Concurrently'],
    ]
  ),

  separator(),

  // 3. Proje Mimarisi
  h1('3. Proje Mimarisi'),

  h2('3.1 Klasör Yapısı'),
  para('Proje iki ana bölüme ayrılmaktadır:'),
  bullet('client/  – React ön yüz kodu (bileşenler, rotalar, stiller)'),
  bullet('server/  – Express arka yüz kodu (rotalar, controller\'lar, veritabanı modeli)'),
  bullet('__tests__/ – Backend entegrasyon ve React bileşen testleri'),
  bullet('public/  – Statik HTML giriş noktası'),
  bullet('scripts/ – Veritabanı başlatma betiği'),

  h2('3.2 Veri Akışı'),
  para('Tarayıcı (React SPA) → fetch() → Express Sunucusu (/api) → Controller Middleware Zinciri → PostgreSQL'),
  para(
    'Sunucu, apiController → dbController → userController sırasında çalışan middleware zinciri ' +
    'kullanır. Her controller, res.locals üzerinden bir sonraki katmana veri aktarır.'
  ),

  separator(),

  // 4. Veritabanı Tasarımı
  h1('4. Veritabanı Tasarımı'),
  para('Uygulama PostgreSQL üzerinde üç tablo kullanmaktadır:'),

  h2('4.1 Tablolar'),
  makeTable(
    ['Tablo', 'Anahtar Alanlar', 'Açıklama'],
    [
      ['users', 'user_id (PK), username (UNIQUE), password, email, phone, address', 'Kullanıcı hesapları; şifre bcrypt ile hashlidir'],
      ['books', 'isbn (PK), title, author, genre', 'Paylaşılan kitap kataloğu'],
      ['users_books', 'users_books_id (PK), user_id (FK), bookisbn (FK), requester (FK), condition', 'Kullanıcı–kitap ilişkisi ve takas durumu'],
    ]
  ),

  h2('4.2 İlişkiler'),
  bullet('users  ──<  users_books  >──  books  (çoka-çok köprü tablosu)'),
  bullet('users_books.requester  →  users  (kim talep etti; NULL ise açık takasa hazır)'),
  bullet('users_books.accepted  alanı kabul durumunu izler'),

  separator(),

  // 5. API Uç Noktaları
  h1('5. API Uç Noktaları'),

  h2('5.1 Kullanıcı İşlemleri'),
  makeTable(
    ['Metot', 'Yol', 'Açıklama'],
    [
      ['POST', '/api/register', 'Yeni kullanıcı oluşturur; bcrypt ile şifreyi hashler'],
      ['POST', '/api/verifyUser', 'Giriş; bcrypt.compare ile doğrulama yapar'],
    ]
  ),

  h2('5.2 Kitap İşlemleri'),
  makeTable(
    ['Metot', 'Yol', 'Açıklama'],
    [
      ['POST', '/api/addOldBook', 'ISBN ile kitap ekler; Google Books API entegrasyonu'],
      ['POST', '/api/addManualBook', 'Başlık/yazar ile manuel kitap ekler'],
      ['POST', '/api/findOldBook', 'Başlığa göre regex tabanlı arama yapar'],
      ['POST', '/api/deleteOldBook', 'Kullanıcının kitaplığından kitap siler'],
      ['GET', '/api/getMyOldBookList/:userId', 'Kullanıcının kitap listesini döndürür'],
    ]
  ),

  h2('5.3 Takas İşlemleri'),
  makeTable(
    ['Metot', 'Yol', 'Açıklama'],
    [
      ['POST', '/api/requestBook', 'Kitap takas talebi gönderir'],
      ['GET', '/api/getIncomingInfo/:userId', 'Gelen takas taleplerini listeler'],
      ['GET', '/api/getOutgoingInfo/:userId', 'Giden takas taleplerini listeler'],
      ['POST', '/api/acceptRequest', 'Takas talebini kabul eder'],
      ['POST', '/api/shipped', 'Kitabın gönderildiğini işaretler'],
    ]
  ),

  separator(),

  // 6. Temel Özellikler
  h1('6. Temel Özellikler'),

  h2('6.1 Kullanıcı Kayıt ve Giriş'),
  para(
    'Yeni kullanıcılar username, password, email, phone ve address bilgileriyle kayıt olur. ' +
    'Şifre, salt rounds 12 ile bcrypt kullanılarak hashlenir; veritabanına düz metin olarak ' +
    'hiçbir zaman yazılmaz. Giriş işleminde bcrypt.compare ile güvenli doğrulama yapılır.'
  ),

  h2('6.2 Kitaplığım (My Page)'),
  para('Kullanıcı iki yöntemle kitap ekleyebilir:'),
  bullet(
    'ISBN ile ekleme: ISBN numarası girildiğinde Google Books API\'dan başlık, yazar ve tür ' +
    'bilgileri otomatik olarak getirilir.'
  ),
  bullet(
    'Manuel ekleme: Başlık ve yazar zorunludur; ISBN isteğe bağlıdır. ISBN girilmezse sistem ' +
    'MANUAL-<timestamp>-<rastgele> formatında benzersiz bir tanımlayıcı üretir.'
  ),
  para('Her kitap için durum bilgisi girilir: Sıfır Gibi, İyi, Orta vb.'),

  h2('6.3 Kitap Arama'),
  para(
    'Kullanıcılar başlık metnine göre tüm sistemi tarayabilir. Arama sorgusu PostgreSQL\'in ' +
    '~* (büyük-küçük harf duyarsız regex) operatörü ile sözcük sınırları kullanılarak çalışır. ' +
    'Sonuçlar; başlık, yazar, durum, ISBN ve sahip kullanıcı adını içerir. ' +
    'Buradan doğrudan takas talebi gönderilebilir.'
  ),

  h2('6.4 Takas Yönetimi'),
  bullet('Gelen talepler: Başka kullanıcıların talep ettiği kitapları gösterir; kabul etme seçeneği sunar.'),
  bullet('Giden talepler: Kullanıcının başkasından talep ettiği kitapları gösterir; gönderim durumunu (shipped) takip eder.'),

  separator(),

  // 7. Ön Yüz Yapısı
  h1('7. Ön Yüz Yapısı'),

  h2('7.1 React Router Rotaları'),
  makeTable(
    ['Yol', 'Bileşen', 'Açıklama'],
    [
      ['/', 'Root', 'Ana sayfa / karşılama ekranı'],
      ['/login', 'Login', 'Giriş formu'],
      ['/register', 'Register', 'Kayıt formu'],
      ['/mypage', 'MyPage', 'Kişisel kitaplık yönetimi'],
      ['/search', 'Search', 'Başlığa göre kitap arama'],
      ['/exchange', 'Exchange', 'Takas talebi yönetimi'],
      ['*', 'NotFound', '404 sayfası'],
    ]
  ),

  h2('7.2 Bileşenler'),
  makeTable(
    ['Bileşen', 'Açıklama'],
    [
      ['Nav', 'Oturum durumuna göre Giriş/Çıkış bağlantıları gösterir'],
      ['MyBookRow', 'Kitaplıktaki her kitabı satır olarak render eder; silme butonu içerir'],
      ['SearchBookRow', 'Arama sonucundaki her kitabı render eder; "Talep Et" butonu içerir'],
      ['ExchangeRow', 'Takas taleplerini render eder; kabul/gönderim butonları içerir'],
    ]
  ),

  h2('7.3 Global Durum (State)'),
  para('App.jsx global state\'i yönetir ve prop drilling ile alt bileşenlere iletir:'),
  bullet('loggedIn: boolean – Oturum durumu'),
  bullet('userId: number | null – Aktif kullanıcının ID\'si'),
  bullet('error: string | null – Hata mesajları'),

  separator(),

  // 8. Güvenlik
  h1('8. Güvenlik Değerlendirmesi'),

  h2('8.1 Uygulanan Güvenlik Önlemleri'),
  makeTable(
    ['Önlem', 'Uygulama'],
    [
      ['Şifre karma', 'bcrypt, salt rounds 12 — kaba kuvvet saldırılarına karşı dirençli'],
      ['Güvenli doğrulama', 'bcrypt.compare — zamanlama saldırılarına karşı güvenli'],
      ['Hata soyutlama', 'Hata yanıtları iç sistem detaylarını kullanıcıya açıklamaz'],
      ['Global hata yöneticisi', 'Beklenmeyen hatalar merkezi Express middleware tarafından yakalanır'],
    ]
  ),

  h2('8.2 Bilinen Güvenlik Açıkları'),
  makeTable(
    ['Açık', 'Konum', 'Çözüm'],
    [
      ['SQL Enjeksiyonu', 'dbController.js — şablon dizesi ile oluşturulan sorgular', 'Tüm sorgular pg\'nin parametreli ($1, $2...) formatına geçirilmeli'],
      ['Eksik oturum yönetimi', 'cookieController.js boş; oturum yalnızca client-side state', 'HTTP-only cookie veya JWT tabanlı oturum uygulanmalı'],
      ['CSRF koruması yok', 'Durum değiştiren tüm POST uç noktaları', 'CSRF token middleware eklenmeli'],
    ]
  ),

  separator(),

  // 9. Test Kapsamı
  h1('9. Test Kapsamı'),

  h2('9.1 Backend Testleri'),
  para(
    'Supertest kütüphanesi ile Express sunucusuna entegrasyon testleri yazılmıştır. ' +
    'Test edilen uç noktalar: /api/addOldBook, /api/findOldBook, /api/requestBook, ' +
    '/api/deleteOldBook, /api/getMyOldBookList, /api/register, /api/verifyUser.'
  ),
  para(
    'Not: Testlerin büyük çoğunluğu xit ile devre dışıdır; çalışan veritabanı gerektirdiğinden ' +
    'CI ortamında otomatik çalıştırılamamaktadır.'
  ),

  h2('9.2 Ön Yüz Testleri'),
  para(
    '@testing-library/react ile bileşen render testleri mevcuttur: App, Nav, Login, Register. ' +
    'Testlerin çoğu xtest ile devre dışı bırakılmıştır.'
  ),

  separator(),

  // 10. Kurulum
  h1('10. Kurulum ve Çalıştırma'),

  h2('Ön Koşullar'),
  bullet('Node.js >= 16'),
  bullet('PostgreSQL >= 13'),
  bullet('npm >= 8'),

  h2('Adımlar'),
  code('# 1. Depoyu klonlayın'),
  code('git clone https://github.com/Book-Exchange-2-0/Book-Exchange-2.1.git'),
  code('cd Book-Exchange-2.1'),
  code(''),
  code('# 2. Bağımlılıkları yükleyin'),
  code('npm install'),
  code(''),
  code('# 3. Veritabanını oluşturun'),
  code('psql -U postgres -c "CREATE DATABASE bookexchange;"'),
  code('psql -U postgres -d bookexchange -f "server/models/Book Exchange 2.0_postgres_create.sql"'),
  code(''),
  code('# 4. Geliştirme modunda çalıştırın'),
  code('npm run dev'),
  code(''),
  code('# 5. Üretim için derleyin ve başlatın'),
  code('npm run build && npm start'),

  para('Uygulama varsayılan olarak http://localhost:3000 adresinde çalışır.'),

  separator(),

  // 11. Geliştirme Önerileri
  h1('11. Geliştirme Önerileri'),
  makeTable(
    ['Öncelik', 'Konu', 'Açıklama'],
    [
      ['Yüksek', 'SQL enjeksiyonu düzeltmesi', 'dbController.js içindeki ham string interpolasyon sorguları parametreli hale getirilmeli'],
      ['Yüksek', 'Cookie/JWT oturum yönetimi', 'cookieController.js tamamlanmalı; kimlik HTTP-only cookie veya JWT ile taşınmalı'],
      ['Orta', 'Test kapsamı genişletme', 'xit/xtest testleri etkinleştirilmeli; mock veritabanı (pg-mem veya Docker) kurulmalı'],
      ['Orta', 'CSRF koruması', 'Durum değiştiren tüm uç noktalara CSRF token koruması eklenmeli'],
      ['Düşük', 'Class → Function bileşenleri', 'Sınıf bileşenleri React Hooks kullanarak fonksiyon bileşenlerine dönüştürülmeli'],
      ['Düşük', 'Hata bildirimleri', 'Kullanıcıya hataların açıkça gösterildiği toast/alert sistemi eklenmeli'],
    ]
  ),

  separator(),

  // 12. Sonuç
  h1('12. Sonuç'),
  para(
    'Kitap Takası, kitap okuyucularını bir araya getiren, kullanıcı dostu ve işlevsel bir takas ' +
    'platformudur. React + Express + PostgreSQL üçlüsüyle modern ve geliştirilebilir bir mimari ' +
    'sunmaktadır. Güvenlik açıklarının giderilmesi (özellikle SQL enjeksiyonu ve oturum yönetimi) ' +
    've test kapsamının artırılması, projenin üretime alınmadan önce öncelikli olarak ele alınması ' +
    'gereken konulardır.'
  ),
];

// ─── Belgeyi oluştur ve kaydet ───────────────────────────────────────────────

const doc = new Document({
  styles: {
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        run: { size: 32, bold: true, color: '2E74B5' },
        paragraph: { spacing: { before: 400, after: 120 } },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        run: { size: 26, bold: true, color: '2E74B5' },
        paragraph: { spacing: { before: 280, after: 100 } },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        run: { size: 24, bold: true, color: '404040' },
        paragraph: { spacing: { before: 200, after: 80 } },
      },
    ],
  },
  sections: [{ children }],
});

const outputPath = path.join(__dirname, '..', 'Kitap_Takasi_Proje_Raporu.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log('Rapor oluşturuldu:', outputPath);
});
