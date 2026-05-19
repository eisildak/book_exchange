<h1 align="center">
  <br>
    <img src="./images/book-4986.png">
    <br>
    <br>
  Kitap Takası
    <br>
  <br>
</h1>

<p align="center">
<img src="./images/official-bookExchange.gif">
</p>

## Açıklama
<h4><strong>Kitap Takası, kullanıcıların favori kitaplarını koleksiyonuna ekleyerek diğer kullanıcılarla takas etmesine olanak tanıyan hepsi bir arada bir kitap ticaret platformudur.</strong></h4>

## Özellikler

### Giriş ve Kayıt İşlevselliği
PostgreSQL'in ilişkisel yapısından yararlanarak Kitap Takası, yeni kullanıcılar oluşturabilmekte ve bu kullanıcıların kendi profilleriyle ilişkili kitaplara sahip olmasını sağlamaktadır.

<p align="center">
<img src="./images/register.png" />
</p>

### Manuel Kitap Ekleme
Koleksiyonunuza kitap eklemek için başlık ve yazar bilgilerini girin. ISBN isteğe bağlıdır; bilmiyorsanız boş bırakabilirsiniz. Kitabın durumunu (Sıfır Gibi, İyi, Orta…) seçip ekleyin.

<p align="center">
<img src="./images/findingBooks.png" />
</p>

## Teknoloji Yığını

### React
React'in tercih edilmesinin temel nedeni, bu uygulamanın web veya mobil arasında kolayca geçiş yapabilen SPA yapısına uygunluğudur. Bileşenlerin yeniden kullanılabilirliği ve modülerliği de önemli bir etkendir. Ayrıca React, sunucu tarafında render desteğiyle geliştiricilerin Sanal DOM'u her seferinde sayfayı yeniden yüklemeden kullanmasına olanak tanır.

### PostgreSQL
PostgreSQL, uygulamada ihtiyaç duyulan yüksek düzeyde ilişkisel veriyi verimli biçimde yönetmek için seçilmiştir. SQL veritabanının ilişkisel yapısı, backend'den frontend'e taşınan verilerin bütüncül ve net görülmesini sağlamış; geliştirme sürecinde veri akışının tutarlı kalmasına katkıda bulunmuştur.

### Bcrypt
Bcrypt, kullanıcı şifrelerini şifrelemek için ideal bir seçimdir. Benzersiz tuz (salt) hashing sistemi sayesinde ek güvenlik katmanı sağlar ve gerektiğinde şifrelerin daha güçlü biçimde hashlenmesi için esnek bir çerçeve sunar.

### Node / Express
Node ve Express, frontend ile backend arasında dil tutarlılığı sağlamak amacıyla tercih edilmiştir. V8 motoru üzerine inşa edilmiş platformlar arası bu çalışma ortamı, olay güdümlü ve bloklamayan G/Ç paradigmasında üstün performans sunar.

## Başlarken

### Depoyu klonlayın
\`\`\`bash
git clone https://github.com/Book-Exchange-2-0/Book-Exchange-2.1.git
\`\`\`

### Bağımlılıkları yükleyin
\`\`\`bash
npm install
\`\`\`

### Geliştirme modunda çalıştırın
\`\`\`bash
npm run dev
\`\`\`

### Uygulamayı başlatın
\`\`\`bash
npm start
\`\`\`


# book_exchange
