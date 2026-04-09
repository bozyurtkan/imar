export interface BlogArticle {
  slug: string;
  title: string;
  desc: string;
  keywords: string[];
  url: string;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "ruhsatsiz-bag-evi-tarim-arazisi-2026",
    title: "Tarım Arazisindeki Ruhsatsız Bağ Eviniz Var mı? 4 Nisan 2026 Sonrası Ne Yapmalısınız?",
    desc: "4 Nisan 2026'da yürürlüğe giren tarım arazileri yönetmeliği, ruhsatsız bağ evi ve bungalov sahiplerini doğrudan etkiliyor. İşte adım adım yapmanız gerekenler.",
    keywords: [
      "ruhsatsız bağ evi", "ruhsatsiz bag evi", "tarım arazisi yapı", "tarim arazisi yapi",
      "bağ evi ruhsat", "bag evi ruhsat", "bungalov tarım", "bungalov tarim",
      "tarımsal yapı izni", "tarimsal yapi izni", "TAD portal", "tad portal",
      "yapı kayıt belgesi", "yapi kayit belgesi", "5403 sayılı kanun", "5403 sayili kanun",
      "yıkım kararı", "yikim karari", "tarım arazisi 2026", "tarim arazisi 2026",
      "bag evi yikim", "bağ evi yıkım", "ruhsatsız yapı tarım", "ruhsatsiz yapi tarim",
      "marjinal tarım arazisi", "marjinal tarim arazisi", "tarımsal turizm", "tarimsal turizm",
      "tarım arazisi ruhsatsız", "tarim arazisi ruhsatsiz"
    ],
    url: "/makale/ruhsatsiz-bag-evi-tarim-arazisi-2026"
  },
  {
    slug: "tarim-arazisi-tad-portal-2026",
    title: "Tarım Arazisi İzinlerinde Dijital Dönüşüm: TAD Portal ve 2026 Yönetmeliği",
    desc: "4 Nisan 2026'da yürürlüğe giren yeni yönetmelikle tarım arazisi izinleri TAD Portal üzerinden merkezi sisteme taşındı. Marjinal arazi, çatı GES ve toprak koruma projelerine yönelik yeni kurallar.",
    keywords: [
      "tarım arazisi izni", "tarim arazisi izni", "TAD portal", "tad portal",
      "tarım dışı kullanım", "tarim disi kullanim", "tarımsal yapı ruhsatı", "tarimsal yapi ruhsati",
      "büyük ova koruma alanı", "buyuk ova koruma alani", "marjinal tarım arazisi", "marjinal tarim arazisi",
      "toprak koruma kurulu", "çatı güneş enerjisi", "cati gunes enerjisi", "çatı GES", "cati GES",
      "tarım arazisi yönetmelik 2026", "tarim arazisi yonetmelik 2026",
      "arazi etüt raporu", "arazi etut raporu", "ziraat mühendisi raporu", "ziraat muhendisi raporu",
      "tarım dışı", "tarim disi", "tarımsal yapı", "tarimsal yapi"
    ],
    url: "/makale/tarim-arazisi-tad-portal-2026"
  },
  {
    slug: "santiye-m-dijital-donusum",
    title: "Şantiye-M Uygulaması ile İnşaat Sektöründe Dijital Dönüşüm",
    desc: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nın kullanıma sunduğu Şantiye-M yazılımının amacı, kolaylıkları ve sektörel etkileri.",
    keywords: [
      "şantiye-m", "santiye-m", "şantiye m", "santiye m", "dijital şantiye", "dijital santiye",
      "şantiye defteri", "santiye defteri", "şantiye şefi", "santiye sefi",
      "yapı denetim", "yapi denetim", "e-devlet", "edevlet", "dijital dönüşüm",
      "mobil şantiye", "mobil santiye", "müteahhit", "muteahhit", "MYK belgesi",
      "ustalık belgesi", "ruhsat", "şantiye yazılım", "santiye yazilim"
    ],
    url: "/makale/santiye-m-dijital-donusum"
  },
  {
    slug: "planli-alanlar-garaj-rüzgarlik-degisikligi",
    title: "Müstakil Ev Sahiplerine İmar Müjdesi: Garaj ve Rüzgarlıkta Ruhsat Süreci Bitti!",
    desc: "Planlı Alanlar İmar Yönetmeliği 2026 değişikliği ile müstakil konutlarda ruhsatsız garaj ve rüzgarlık yapımı dönemi başladı.",
    keywords: [
      "rüzgarlık", "ruzgarlik", "garaj", "müstakil", "mustakil", "ruhsat",
      "ruhsatsız", "planlı alanlar", "planli alanlar", "yönetmelik", "yonetmelik",
      "kapı önü", "kapi onu", "kapı rüzgarlık", "müstakil konut", "imar değişiklik",
      "2026 değişiklik", "çekme mesafesi", "cekme mesafesi"
    ],
    url: "/makale/planli-alanlar-garaj-rüzgarlik-degisikligi"
  },
  {
    slug: "mevcut-binalarda-yangin-merdiveni-esnekligi",
    title: "Mevcut Binalarda Yangın Merdiveni Çıkmazı Bitiyor: Bahçe Mesafelerinde Yeni Esneklik!",
    desc: "Mevcut yapılarda yangın merdiveni zorunluluğu durumunda bahçe mesafesi ihlallerine getirilen 1.50m ve 3.00m istisnaları.",
    keywords: [
      "yangın merdiveni", "yangin merdiveni", "yangın", "merdiven", "bahçe mesafesi",
      "bahce mesafesi", "mevcut bina", "mevcut yapı", "mevcut yapi", "istisnalar",
      "1.50", "3.00", "çekme mesafesi", "cekme mesafesi", "mevcut binalarda",
      "esneklik", "yangın güvenliği", "yapı dönüşüm"
    ],
    url: "/makale/mevcut-binalarda-yangin-merdiveni-esnekligi"
  }
];

export function findRelatedArticles(query: string): BlogArticle[] {
  const q = query.toLowerCase().replace(/[İıĞğÜüŞşÇçÖö]/g, (c) => {
    const map: Record<string, string> = {
      'İ': 'i', 'ı': 'i', 'Ğ': 'g', 'ğ': 'g',
      'Ü': 'u', 'ü': 'u', 'Ş': 's', 'ş': 's',
      'Ç': 'c', 'ç': 'c', 'Ö': 'o', 'ö': 'o'
    };
    return map[c] || c;
  });

  return blogArticles.filter(article =>
    article.keywords.some(kw => {
      const normalizedKw = kw.toLowerCase().replace(/[İıĞğÜüŞşÇçÖö]/g, (c) => {
        const map: Record<string, string> = {
          'İ': 'i', 'ı': 'i', 'Ğ': 'g', 'ğ': 'g',
          'Ü': 'u', 'ü': 'u', 'Ş': 's', 'ş': 's',
          'Ç': 'c', 'ç': 'c', 'Ö': 'o', 'ö': 'o'
        };
        return map[c] || c;
      });
      return q.includes(normalizedKw);
    })
  );
}
