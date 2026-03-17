export interface BlogArticle {
  slug: string;
  title: string;
  desc: string;
  keywords: string[];
  url: string;
}

export const blogArticles: BlogArticle[] = [
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
