# Blog Makale Ekleme

Yeni bir blog makalesi ekle. Makaleyi `blogPosts` listesine **en üste** (en yeni) ekle.

## Kullanıcıdan toplanacak bilgiler (yoksa sor):

- **Başlık** — Makalenin tam başlığı
- **Slug** — URL dostu kısa isim (örn: `yeni-imar-yonetmeligi-2026`)
- **Kategori** — `Mevzuat Analizi` / `Güncel Değişiklikler` / `İçtihatlar` / `Rehber`
- **Tarih** — Türkçe format (örn: `15 Nisan 2026`)
- **Okuma süresi** — (örn: `6 dk okuma`)
- **Yazar** — Varsayılan: `İmar Mevzuat Editörü`
- **Görsel yolu** — `public/images/` altında bir dosya (yoksa `/hero.jpg`)
- **Kısa açıklama** — 2-3 cümle özet
- **Makale içeriği** — Tam yazı (HTML/JSX olarak yazılacak)
- **Anahtar kelimeler** — AI eşleştirmesi için virgülle ayrılmış liste

## Yapılacaklar (sırasıyla):

### 1. `components/BlogSection.tsx` — blogPosts dizisine ekle

`blogPosts` dizisinin **en başına** (index 0) yeni makaleyi ekle:

```typescript
{
    title: "<BAŞLIK>",
    category: "<KATEGORİ>",
    readTime: "<OKUMA_SÜRESİ>",
    date: "<TARİH>",
    author: "<YAZAR>",
    image: "<GÖRSEL_YOLU>",
    desc: "<KISA_AÇIKLAMA>",
    icon: <FileText size={32} />,   // kategoriye göre: Gavel, BookOpen, Building2, FileText
    slug: "<SLUG>"
},
```

### 2. `data/blogArticles.ts` — blogArticles dizisine ekle

`blogArticles` dizisinin **en başına** ekle:

```typescript
{
    slug: "<SLUG>",
    title: "<BAŞLIK>",
    desc: "<KISA_AÇIKLAMA>",
    keywords: [
        // Makalenin konusuna göre Türkçe + normalize edilmiş anahtar kelimeler
        // Örn: "imar planı", "imar plani", "yönetmelik", "yonetmelik", ...
    ],
    url: "/makale/<SLUG>"
},
```

### 3. `components/ArticlePage.tsx` — makale içeriğini ekle

Dosyanın başındaki değişken tanımlamalarına yeni slug'ı ekle:

```typescript
const is<SLUG_PASCAL_CASE> = slug === '<SLUG>';
```

`headlines` ve `descriptions` nesnelerine ekle:

```typescript
'<SLUG>': "<BAŞLIK>",
'<SLUG>': "<KISA_AÇIKLAMA>",
```

SEO image mapping'e ekle:

```typescript
: is<SLUG_PASCAL_CASE>
    ? "https://imarmevzuat.com.tr/<GÖRSEL_YOLU>"
```

`datePublished` / `dateModified` mapping'e ekle.

Featured image `src` mapping'ine ekle.

İçerik render bloğuna (`isSantiyeM ? ... : isFireEscape ? ... : ...`) yeni `is<SLUG_PASCAL_CASE> ? (<>...</>) :` dalını **en başa** ekle ve içeriği JSX olarak yaz.

**Makale formatı — her makale bu standarda uymalı:**
- `<h3>` başlıkları: `className="text-2xl font-bold mt-12 mb-6"` (veya `mt-10`)
- `<h4>` alt başlıkları: `className="text-xl font-bold text-warm-100 mt-8 mb-4"`
- `<p>` paragrafları: `className="text-justify"`
- `<li>` liste öğeleri: `className="text-justify"` (veya `className="pl-4 text-justify"`)
- Sonuç kutusu içindeki paragraf: `className="text-warm-300 mb-0 text-justify"`

```tsx
{is<SLUG_PASCAL_CASE> ? (
    <>
        <h3 className="text-2xl font-bold mt-12 mb-6">Giriş</h3>
        <p className="text-justify">...</p>
        {/* Tam makale içeriği buraya */}
    </>
) : isSantiyeM ? (
    ...mevcut...
```

### 4. Doğrulama

```bash
npm run build
```

Build hatasız geçmeli. Ardından `http://localhost:3000/makaleler` adresinde:
- Yeni makale listenin **en üstünde** görünmeli
- Thumbnail görseli yüklenmiş olmalı
- Makaleye tıklanınca içerik doğru açılmalı

### 5. Git commit & push

```
git add components/ArticlePage.tsx components/BlogSection.tsx data/blogArticles.ts
git commit -m "feat: <BAŞLIK> makalesi eklendi"
git push origin main
```

## Önemli kurallar

- `blogPosts` ve `blogArticles` dizilerinde **her zaman en yeni tarihli makale en üstte** olmalı
- Slug: küçük harf, Türkçe karaktersiz, tire ile ayrılmış (örn: `imar-plani-iptali-2026`)
- Coming soon makaleler için `slug` alanı **yazılmaz** (undefined kalır)
- Görsel `public/images/` klasöründe yoksa `public/hero.jpg` fallback olarak kullanılır
