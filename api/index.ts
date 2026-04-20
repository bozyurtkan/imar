import type { VercelRequest, VercelResponse } from "@vercel/node";

const HOMEPAGE_MARKDOWN = `# İmarmevzuat.ai — Profesyonel Mevzuat Asistanı

> Türkiye'nin en kapsamlı imar hukuku, şehircilik ve emlak mevzuatı uzmanlık platformu.

## Ne Yapabiliriz?

- **İmar Kanunu Analizi**: 3194 Sayılı İmar Kanunu ve ilgili yönetmeliklerin derinlemesine analizi.
- **Danıştay İçtihatları**: Emsal kararlar ve hukuki süreç rehberliği.
- **Hesaplama Araçları**: İmar barışı, ruhsat harcı, TAKS/KAKS alan hesaplama.
- **Tarım Arazisi İzinleri**: Bağ evi, bungalow ve prefabrik yapı izin süreçleri.

## Uzmanlık Alanları

- [Ruhsatsız Yapılar](https://imarmevzuat.com.tr/etiket/ruhsatsiz-yapilar): Kaçak yapılar ve yasallaştırma süreçleri.
- [Tarım Arazileri](https://imarmevzuat.com.tr/etiket/tarim-arazileri): Yapı izin koşulları ve kısıtlamalar.
- [İmar Barışı](https://imarmevzuat.com.tr/etiket/imar-barisi): Güncel düzenlemeler ve kayıt belgeleri.
- [Kentsel Dönüşüm](https://imarmevzuat.com.tr/etiket/kentsel-donusum): 6306 Sayılı Kanun uygulamaları.

## Güven Sinyalleri

- Tüm içerikler hukukçular ve şehir plancıları tarafından doğrulanmıştır.
- Günlük Resmi Gazete takibi ile anlık güncellemeler.
- 7/24 yapay zeka destekli mevzuat asistanı.

## Kaynaklar

- Site: https://imarmevzuat.com.tr
- llms.txt: https://imarmevzuat.com.tr/llms.txt
- Sitemap: https://imarmevzuat.com.tr/sitemap.xml
- Agent Skills: https://imarmevzuat.com.tr/.well-known/agent-skills/SKILL.md
`;

export default function handler(req: VercelRequest, res: VercelResponse) {
  const accept = req.headers["accept"] || "";

  if (accept.includes("text/markdown")) {
    const tokens = HOMEPAGE_MARKDOWN.split(/\s+/).length;
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("x-markdown-tokens", String(tokens));
    res.setHeader("Vary", "Accept");
    return res.status(200).send(HOMEPAGE_MARKDOWN);
  }

  // HTML için normal SPA davranışı — index.html'e yönlendir
  res.setHeader("Vary", "Accept");
  return res.redirect(302, "/");
}
