
import { DocumentFile, Message } from "../types";
import { findRelatedArticles, BlogArticle } from "../data/blogArticles";

interface GeminiApiParams {
  model: string;
  contents: string;
  systemInstruction?: string;
  useGoogleSearch?: boolean;
  responseMimeType?: string;
  thinkingConfig?: { thinkingBudget: number };
  fallbackOnEmpty?: boolean;
}

interface GeminiApiResponse {
  text: string;
  groundingChunks: any[];
}

export class GeminiService {
  private async callApi(params: GeminiApiParams): Promise<GeminiApiResponse> {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Sunucu hatası" }));
      throw new Error(err.error || "API isteği başarısız.");
    }

    return response.json();
  }

  async askQuestion(
    question: string,
    documents: DocumentFile[],
    chatHistory: Message[]
  ): Promise<string> {
    const activeDocs = documents.filter((doc) => doc.isActive);

    const contextText =
      activeDocs.length > 0
        ? activeDocs
            .map(
              (doc) =>
                `[KAYNAK: ${doc.name} | ETİKET: ${doc.description}]\n${doc.content}`
            )
            .join("\n\n---\n\n")
        : "Kullanıcı kütüphaneden analiz için herhangi bir özel belge seçmedi. Lütfen geniş genel hukuk ve imar mevzuatı bilgilerini kullanarak soruyu en iyi şekilde cevapla. Cevabının başında kullanıcıya sistemde aktif belge olmadığını ve genel bilgilerinle yanıt verdiğini nazikçe belirt.";

    const systemInstruction = `
      Sen profesyonel bir Türkiye İmar Mevzuatı danışmanısın.
      Sana sunulan dokümanlardaki bağlama dayanarak, akademik ve profesyonel bir üslupla yanıt vermelisin.

      YANIT YAPILANDIRMASI:
      1. Yanıtı sistematik bir hiyerarşi ile oluştur (Örn: I, II, III ve alt başlıklar için a, b, (1)).
      2. Önemli her bölümün veya paragrafın sonunda mutlaka dayanak göster: [MADDE: KanunNo/MaddeNo]
      3. İlk paragrafta konunun genel tanımını ve halk arasındaki yaygın ismini (Örn: "18 uygulaması") belirt.
      4. Bölümleri "Maddenin Amacı", "DOP (Düzenleme Ortaklık Payı)", "Uygulama Süreci", "Hakkaniyet" ve "Kamulaştırmadan Farkı" gibi profesyonel başlıklarla ayır.
      5. Teknik terimleri (Örn: **parselasyon**, **mücavir alan**) mutlaka kalın yaz.
      6. "Bilgi yok" demek yerine, eğer dökümanda eksiklik varsa genel hukuk bilginle madde içeriğini kapsamlıca açıkla.

      DAYANAK ETİKETLEME KURALI:
      Metin içinde mutlaka şu formatı kullan: [MADDE: 3194/18]
    `;

    try {
      const { text } = await this.callApi({
        model: "gemini-2.0-flash",
        contents: `KÜTÜPHANE İÇERİĞİ:\n\n${contextText}\n\nKULLANICI SORUSU: ${question}`,
        systemInstruction: systemInstruction.trim(),
      });
      return text || "Yüklediğiniz mevzuat dökümanlarından bir yanıt üretilemedi.";
    } catch (error: any) {
      throw new Error(error?.message || "Mevzuat servisi şu an yanıt veremiyor.");
    }
  }

  async summarizeDocument(doc: DocumentFile): Promise<string> {
    try {
      const { text } = await this.callApi({
        model: "gemini-2.0-flash",
        contents: `Aşağıdaki imar mevzuatı dökümanını profesyonel bir şekilde özetle:\n\n${doc.content}`,
        systemInstruction: "Sen bir hukuk asistanısın. Kısa ve net özetler çıkarırsın.",
      });
      return text || "Özet çıkarılamadı.";
    } catch (e: any) {
      throw new Error(e?.message || "Özetleme hatası.");
    }
  }

  async askGeneral(
    question: string,
    _documents: DocumentFile[] = []
  ): Promise<{ text: string; sources: any[]; relatedArticles: BlogArticle[] }> {
    const today = new Date().toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const systemInstruction = `Sen profesyonel bir Türkiye İmar Mevzuatı danışmanısın.
Kullanıcılara imar hukuku, planlama mevzuatı, yapı denetimi ve kentsel dönüşüm konularında akademik ve profesyonel düzeyde danışmanlık verirsin.
BUGÜNÜN TARİHİ: ${today}

## BİLGİ KAYNAĞI KURALI

Her soru için mutlaka web araması yap.
Yanıtını asla yalnızca hafızandaki bilgiye dayandırma. Kullanıcı bir soru sorduğunda:
1. Önce konuyla ilgili web araması gerçekleştir.
2. Güvenilir ve güncel kaynakları bul.
3. Bulunan bilgiyi yapılandırılmış formatta sun.
4. Kaynak ve dayanak bilgisini mutlaka göster.

Neden? Mevzuat sürekli değişir. Ceza tutarları yıllık güncellenir, yönetmelikler değişir, Danıştay yeni kararlar verir. Hafızandaki bilgi güncel olmayabilir.

## WEB SEARCH STRATEJİSİ

Arama Kuralları:
1. Aramaları Türkçe yap. Mevzuat terimlerini Türkçe kullan.
2. Karmaşık sorularda tek aramayla yetinme. Konunun farklı boyutları için ayrı aramalar yap.
3. Aramalara yıl ekle veya "güncel" kelimesini kullan. (Örn: "imar kanunu değişiklik 2026", "yapı kayıt belgesi güncel durum")

Kaynak Güvenilirliği Sıralaması (öncelik sırasıyla):
1. Resmi Gazete (resmigazete.gov.tr) — En güvenilir
2. Mevzuat Bilgi Sistemi (mevzuat.gov.tr) — En güvenilir
3. Bakanlık resmi siteleri (csb.gov.tr vb.) — Güvenilir
4. Danıştay / Yargıtay karar bankaları — Güvenilir
5. Akademik makaleler, tezler — Güvenilir
6. Hukuk portalları (lexpera, kazanci, hukukihaber) — Doğrulanmalı
7. Forum, blog, kişisel siteler — Tek kaynak olarak kullanma

Çelişki Yönetimi:
- Farklı kaynaklarda çelişkili bilgi varsa daha güncel tarihli kaynağı esas al.
- Çelişkiyi kullanıcıya açıkça bildir.
- Emin olamadığın durumlarda kullanıcıyı uyar ve resmi kuruma başvurmasını öner.

## YANIT YAPILANDIRMASI

1. Sistematik hiyerarşi kullan: Ana başlıklar I, II, III; alt başlıklar a, b, c; alt-alt başlıklar (1), (2), (3)
2. İlk paragrafta şunları mutlaka belirt: konunun genel tanımı, halk arasındaki yaygın ismi (Örn: "18 uygulaması"), hangi kanun/yönetmelikte düzenlendiği.
3. Bölüm başlıkları profesyonel olmalı: "Yasal Dayanak", "Tanımlar", "Maddenin Amacı ve Kapsamı", "Uygulama Süreci", "DOP / KOP Hesaplaması", "Yaptırımlar ve Cezai Hükümler", "İlgili Yargı Kararları", "Pratik Özet"
4. Dayanak etiketi her önemli paragrafın sonunda: [MADDE: KanunNo/MaddeNo] → Örn: [MADDE: 3194/18], [MADDE: 6306/3]
5. Teknik terimler kalın yazılmalı: parselasyon, mücavir alan, imar planı, DOP, KOP, emsal, TAKS, KAKS, ifraz, tevhid, irtifak hakkı, yapı ruhsatı, iskan, imar çapı vb.

## ÖZEL DURUM TALİMATLARI

Sayısal Bilgiler (Ceza, Harç, Birim Fiyat):
- Bu bilgiler her yıl değişir. Mutlaka web aramasıyla o anki güncel rakamı bul.
- Bulamazsan: "Bu tutar yıllık olarak güncellenmektedir. Güncel tutar için ilgili belediye veya Bakanlık sitesini kontrol ediniz." de.
- Eski yıla ait rakamı güncelmiş gibi sunma.

Yargı Kararları:
- Kullanıcı karar sorduğunda web aramasıyla güncel içtihat ara.
- Karar bilgisi verirken: Mahkeme adı, daire, esas/karar no ve tarih belirt.

Yönetmelik ve Genelgeler:
- Bakanlık genelgeleri sık değişir. Her genelge sorusunda mutlaka web araması yap.
- Resmi Gazete tarih ve sayısını belirt.

## YANITLAMAMASI GEREKEN DURUMLAR

- Somut bir davaya hukuki görüş vermekten kaçın. Bunun yerine genel mevzuat bilgisi sun ve şunu ekle: "Bu konuda somut durumunuza özel değerlendirme için bir imar hukukçusuna danışmanızı öneririm."
- Kesin yargısal sonuç tahmini yapma.
- Güncelliğinden emin olmadığın bir rakamı kesin bilgi olarak sunma.`;

    try {
      const { text, groundingChunks } = await this.callApi({
        model: "gemini-2.5-flash",
        contents: `KULLANICI SORUSU: ${question}\n\nLütfen bu soruyu yanıtlarken hukuki/mevzuat açısından en güncel durumu (varsa 2025 ve 2026 Resmi Gazete değişikliklerini) web aramasında muhakkak teyit ederek profesyonelce yanıtla.`,
        systemInstruction: systemInstruction.trim(),
        useGoogleSearch: true,
      });

      const relatedArticles = findRelatedArticles(question);
      return { text: text || "Güncel bilgi bulunamadı.", sources: groundingChunks, relatedArticles };
    } catch (error: any) {
      throw new Error("Web araştırması şu an meşgul: " + error.message);
    }
  }

  async compareLegislation(
    urlContent: string,
    regulationUrl: string,
    libraryDocs: DocumentFile[]
  ): Promise<string> {
    const libraryContext = libraryDocs
      .filter((doc) => doc.isActive && doc.content)
      .map(
        (doc) =>
          `[KÜTÜPHANE BELGESİ: ${doc.name}]\n${doc.content?.substring(0, 8000)}`
      )
      .join("\n\n---\n\n");

    const today = new Date().toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const systemInstruction = `
Sen Türkiye'nin en deneyimli imar hukuku uzmanısın. Resmi Gazete mevzuat değişikliklerini analiz edip karşılaştırıyorsun.
BUGÜNÜN TARİHİ: ${today}

GÖREV:
Sana verilen yeni düzenleme metnini analiz et. Değişen her maddenin ESKİ halini web araması ile bul, yeni haliyle karşılaştır ve etkisini açıkla.

ÇIKTI FORMATI (tam olarak bu yapıyı kullan):

## Düzenleme Özeti
- **Tür:** (Yönetmelik değişikliği / Kanun / Tebliğ / Karar vb.)
- **Dayanak:** (Hangi kanun/yönetmeliği değiştiriyor)
- **Yayın Tarihi:** (Resmi Gazete tarih ve sayısı)
- **Yürürlük:** (Ne zaman yürürlüğe giriyor)

## Madde Madde Değişiklikler

Her değişen madde için şu yapıyı kullan:

### Madde [X] — [Kısa başlık]

**Eski Hal:**
> [Web araması ile bulunan eski metin. Bulunamazsa: "Yürürlükteki metin resmi kaynaklardan doğrulanmalıdır."]

**Yeni Hal:**
> [Verilen belgeden alınan yeni metin]

**Ne Değişti:** [1-2 cümle özet]

---

## Etki Analizi

**Kimler Etkileniyor:**
- [Meslek grupları / kurumlar]

**Uygulama Notları:**
- [Dikkat edilmesi gerekenler]

**Geçiş Hükümleri:**
- [Mevcut projeler / başvurular için durum]

KURALLAR:
1. Maddelerin eski halini bulmak için mutlaka web araması yap (mevzuat.gov.tr öncelikli)
2. Kütüphanedeki belgeler varsa onlarla da karşılaştır
3. Profesyonel ve net bir dil kullan
4. Emoji kullanma
5. Madde metinlerini olduğu gibi aktar, yorumunu ayrı yaz
    `.trim();

    const prompt = `KAYNAK URL: ${regulationUrl}\n\n${
      urlContent.trim()
        ? `YENİ DÜZENLEME METNİ:\n${urlContent}`
        : `NOT: Sayfa içeriği otomatik çekilemedi. Google Search aracıyla bu URL'deki resmi düzenlemeyi bul ve analiz et: ${regulationUrl}`
    }\n\n${libraryContext ? `KÜTÜPHANE BELGELERİ:\n${libraryContext}` : "Aktif kütüphane belgesi yok."}`;

    try {
      const { text } = await this.callApi({
        model: "gemini-2.5-flash",
        contents: prompt,
        systemInstruction,
        useGoogleSearch: true,
        thinkingConfig: { thinkingBudget: 0 },
        fallbackOnEmpty: true,
      });
      return text || "Karşılaştırma yapılamadı. Lütfen tekrar deneyin.";
    } catch (error: any) {
      throw new Error("Karşılaştırma sırasında hata: " + error.message);
    }
  }

  async filterResmiGazete(
    articles: { id: number; title: string; link: string }[],
    interests: string
  ): Promise<number[]> {
    const json = JSON.stringify(articles.map((a) => ({ id: a.id, metin: a.title })));

    const prompt = `
      GÖREV: Aşağıdaki Resmi Gazete başlıklarından hangilerinin şu ilgi alanlarıyla ilgili olduğunu belirle.

      İLGİ ALANLARI:
      ${interests}

      BAŞLIKLAR LİSTESİ (JSON):
      ${json}

      KURALLAR:
      1. İlgi alanlarındaki HERHANGİ bir kelime veya kavram başlıkta geçiyorsa o başlığı dahil et.
      2. Örneğin ilgi alanında "Üniversite" yazıyorsa, başlıkta "Üniversite" geçen TÜM maddeleri seç.
      3. Geniş yorumla — emin olmadığın durumlarda dahil et.
      4. Sadece ilgili başlıkların ID'lerini JSON dizisi olarak döndür. Örn: [1, 5, 12]
      5. Hiçbiri ilgili değilse [] döndür.
      6. Başka hiçbir metin veya açıklama ekleme. Sadece saf JSON dizisi ver.
    `;

    try {
      const { text } = await this.callApi({ model: "gemini-2.0-flash", contents: prompt });
      const jsonMatch = text.match(/\[.*?\]/s);
      if (!jsonMatch) {
        console.warn("Gemini Filter: JSON dizisi bulunamadı.");
        return [];
      }
      const ids = JSON.parse(jsonMatch[0]);
      return Array.isArray(ids) ? ids : [];
    } catch (error) {
      console.error("Gemini Filter Error:", error);
      return [];
    }
  }

  async analyzeResmiGazete(title: string, content: string): Promise<string> {
    const prompt = `
      GÖREV: Şu Resmi Gazete maddesini imar ve şehirleşme profesyoneli için analiz et: "${title}"

      İÇERİK:
      ${content.substring(0, 15000)}

      ANALİZ FORMATI (Markdown):
      **ÖZET**: (2-3 cümle ile içeriği özetle)

      **HUKUKİ YORUM**: (Mevzuat açısından ne anlama geliyor? Yönetmelik, tebliğ vs. hiyerarşisi nedir?)

      **ETKİ**: (Belediyeler, mimarlar veya inşaat sektörü için somut etkisi nedir?)

      **TAVSİYE**: (Profesyoneller ne yapmalı? Dikkat edilmesi gerekenler neler?)

      KURALLAR:
      1. Gereksiz giriş/çıkış cümleleri kullanma.
      2. Profesyonel, net ve hukuki bir dil kullan.
      3. Emoji kullanma.
    `;

    try {
      const { text } = await this.callApi({ model: "gemini-2.0-flash", contents: prompt });
      return text;
    } catch (error: any) {
      return "Analiz yapılamadı: " + error.message;
    }
  }

  async analyzeMadde(
    kanunNo: string,
    maddeNo: string,
    fikraNo?: string | null
  ): Promise<{ icerik: string; anahtarKelimeler: string[]; iliskiliMaddeler: string[] }> {
    const fikraInstruction = fikraNo
      ? `Özellikle ${fikraNo}. fıkrasını detaylı ver, ancak maddenin tüm fıkralarını da kısaca ekle.`
      : `Tüm fıkra ve bentleriyle birlikte yaz.`;

    const prompt = `
      GÖREV: ${kanunNo} Sayılı Kanun'un ${maddeNo}. maddesinin RESMİ METNİNİ yaz.
      ${fikraInstruction}

      ÇIKTI FORMATI (SAF JSON):
      {
        "icerik": "Maddenin resmi metni — fıkra ve bentleriyle birlikte aynen kanunda yazdığı şekilde.",
        "anahtarKelimeler": ["anahtar1", "anahtar2"],
        "iliskiliMaddeler": ["${kanunNo}/1", "${kanunNo}/5"]
      }

      KURALLAR:
      1. Sadece JSON döndür.
      2. "icerik" alanına SADECE maddenin resmi metnini yaz. Yorum yapma, analiz ekleme, açıklama yapma.
      3. Fıkraları numaralı olarak yaz (1), (2), (3)... Bentleri harfli yaz a), b), c)...
      4. Önemli terimleri **kalın** yaz.
      5. İlişkili maddeler formatı: "KanunNo/MaddeNo" (Örn: "3194/18")
      6. En fazla 5 ilişkili madde.
      7. İçerik ASLA boş olmasın. Madde metnini bilgin dahilinde mutlaka yaz.
    `;

    try {
      const { text } = await this.callApi({
        model: "gemini-2.0-flash",
        contents: prompt,
        responseMimeType: "application/json",
      });
      const data = JSON.parse(text);
      return {
        icerik: data.icerik || "Madde metni bulunamadı.",
        anahtarKelimeler: Array.isArray(data.anahtarKelimeler) ? data.anahtarKelimeler : [],
        iliskiliMaddeler: Array.isArray(data.iliskiliMaddeler) ? data.iliskiliMaddeler : [],
      };
    } catch (error: any) {
      throw new Error("Madde metni getirilemedi: " + error.message);
    }
  }

  async askDeepThink(
    question: string,
    _documents: DocumentFile[],
    _chatHistory: Message[]
  ): Promise<{ text: string; sources: any[] }> {
    const today = new Date().toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const systemInstruction = `Sen Türkiye'nin en deneyimli imar hukuku danışmanı ve akademisyenisin. Derin hukuki muhakeme, güncel mevzuat araştırması ve içtihat analizi konularında uzmansın.
BUGÜNÜN TARİHİ: ${today}

## TEMEL İLKE

Her soru için önce kapsamlı bir web araştırması yap. Mevzuat sürekli değişir — hafızandaki bilgi yetersiz veya güncel olmayabilir. Analizini daima güncel ve doğrulanmış kaynaklara dayandır.

## WEB ARAŞTIRMASI KURALLARI

Aramaları şu öncelik sırasıyla yap:
1. mevzuat.gov.tr — yürürlükteki kanun/yönetmelik metni
2. resmigazete.gov.tr — son değişiklikler ve yürürlük tarihleri
3. Danıştay / Yargıtay karar bankaları — güncel içtihat
4. Bakanlık resmi siteleri (csb.gov.tr, edevlet.gov.tr) — genelge ve tebliğler

Tek aramada yetinme. Konunun farklı boyutları için ayrı aramalar yap:
- Yürürlükteki mevzuat metni için bir arama
- Son değişiklikler için bir arama (aramalara yıl ekle: "2025", "2026")
- İlgili içtihat için bir arama

## YANIT YAPISI

Sorunun niteliğine göre bölüm seç — her soruya aynı şablonu zorla uygulama. Ancak şu başlıkları kapsayan bir yanıt üret:

**I. Konu ve Hukuki Nitelik**
Sorunun hangi hukuk dalına girdiğini, ilgili temel kanun/yönetmeliği ve yaygın adını belirt.

**II. Yürürlükteki Mevzuat**
Web aramasından elde ettiğin güncel kanun metinlerini aktar. Her madde için dayanak etiketi kullan: [MADDE: KanunNo/MaddeNo]
Resmi Gazete tarih ve sayısını belirt.

**III. Güncel İçtihat**
Web aramasıyla bulunan Danıştay / Yargıtay / Bölge İdare Mahkemesi kararları. Her karar için: mahkeme, daire, esas/karar no ve tarih.
Bulunamazsa: "Araştırmamda bu konuya ilişkin güncel içtihat tespit edilemedi." — içtihat uydurma.

**IV. Hukuki Yorum ve Tartışmalı Noktalar**
Konuya ilişkin farklı yorumları değerlendir:
- Lehte argümanlar ve dayanakları
- Aleyhte argümanlar ve dayanakları
- Doktrindeki hâkim görüş (varsa)

**V. Pratik Uygulama ve Riskler**
İdarenin olası tutumu, belediye uygulamaları, denetim riskleri ve süreç tavsiyeleri.

**VI. Sonuç ve Profesyonel Değerlendirme**
Net, öz bir profesyonel görüş. "Kanaatimce", "güçlü argüman", "önerilir" gibi hukuki ihtiyat dili kullan — kesin garantiler verme.

---
*Bu analiz bilgilendirme amaçlıdır. Somut durumunuz için güncel mevzuat ve uzman hukuk danışmanlığı alınması önerilir.*

## YAZIM KURALLARI

- Önemli hukuki terimleri **kalın** yaz: parselasyon, mücavir alan, imar planı, DOP, KOP, emsal, TAKS, KAKS, ifraz, tevhid, irtifak, yapı ruhsatı, iskan, imar çapı vb.
- Ton: akademik, profesyonel, tarafsız
- Emoji kullanma
- Başlıkları Markdown formatında yaz (## ve ### kullan)
- Madde metinlerini blok alıntı olarak göster (> ile)
- İçtihat uydurmama — emin değilsen açıkça belirt`;

    try {
      const { text, groundingChunks } = await this.callApi({
        model: "gemini-2.5-pro",
        contents: `SORU: ${question}\n\nLütfen bu soruyu yukarıdaki talimatlara göre derin bir hukuki analiz ile yanıtla. Web aramasını mutlaka kullan — özellikle 2025 ve 2026 Resmi Gazete değişikliklerini ve güncel içtihadı teyit et.`,
        systemInstruction: systemInstruction.trim(),
        useGoogleSearch: true,
      });
      return { text: text || "Derin analiz tamamlanamadı.", sources: groundingChunks };
    } catch (error: any) {
      throw new Error(error?.message || "Derin düşünce servisi şu an yanıt veremiyor.");
    }
  }

  async extractGraphFromText(text: string): Promise<import("../types").GraphData> {
    const truncatedText =
      text.length > 30000 ? text.substring(0, 30000) + "..." : text;

    const prompt = `
      Sen bir hukuk ve veri analistisin. Aşağıdaki mevzuat metninden maddeler arası ilişkileri çıkararak zenginleştirilmiş bir bilgi grafiği (Knowledge Graph) oluşturmalısın.

      GÖREV:
      1. Metindeki ana maddeleri (Node) tespit et. (Örn: Madde 1, Madde 5, Ek Madde 2)
      2. Her maddenin kategorisini belirle:
         - "procedural"   → Uygulama ve süreç maddeleri (18, 19, 36 gibi)
         - "definitional" → Tanım ve kavram maddeleri (5 gibi)
         - "penalty"      → Yaptırım, ceza, müeyyide maddeleri (40, 41, 42 gibi)
         - "referral"     → Başka kanun veya yönetmeliklere atıf yapan maddeler
         - "transitional" → Geçici ve ek maddeler
      3. Her madde için önem skoru belirle (1: normal, 2: önemli, 3: kritik/merkezi).
      4. Maddeler arası ilişkileri (Edge) tespit et ve tipini belirle:
         - "references"  → "...maddesine göre" gibi doğrudan atıflar
         - "amends"      → Değiştiren veya tadil eden hükümler
         - "depends_on"  → Uygulanması başka maddeye bağlı olanlar
         - "related_to"  → Aynı konuyu farklı açıdan ele alan maddeler

      ÇIKTI FORMATI (SAF JSON — başka hiçbir şey ekleme):
      {
        "nodes": [
          { "id": "Md. 1", "label": "Amaç", "desc": "Kanunun genel amacı", "category": "definitional", "importance": 1 },
          { "id": "Md. 18", "label": "Arazi Düzenlemesi", "desc": "Parselasyon ve DOP", "category": "procedural", "importance": 3 }
        ],
        "edges": [
          { "source": "Md. 18", "target": "Md. 5", "relation": "tanım", "type": "references" },
          { "source": "Md. 18", "target": "Md. 19", "relation": "atıf", "type": "references" }
        ]
      }

      KURALLAR:
      1. Sadece JSON döndür. Markdown kod bloğu, açıklama veya başka metin ekleme.
      2. En fazla 20 önemli maddeyi seç; grafik okunabilir kalsın.
      3. ID'leri kısa tut: "Md. 1", "Md. 18", "Ek Md. 1", "Geç. Md. 3" gibi.
      4. Her node'da category ve importance alanları zorunludur.
      5. Her edge'de type alanı zorunludur; relation Türkçe kısa etiket (max 10 karakter).
      6. Metin çok kısaysa veya madde yapısı yoksa, anahtar kavramları node olarak al
         ve category="definitional", importance=1 ver.

      METİN:
      ${truncatedText}
    `;

    const VALID_CATEGORIES = new Set(["procedural", "definitional", "penalty", "referral", "transitional"]);
    const VALID_EDGE_TYPES = new Set(["references", "amends", "depends_on", "related_to"]);

    try {
      const { text: jsonText } = await this.callApi({
        model: "gemini-2.0-flash",
        contents: prompt,
        responseMimeType: "application/json",
      });

      let data: any;
      try {
        data = JSON.parse(jsonText);
      } catch {
        const match = jsonText.match(/\{[\s\S]*\}/);
        if (match) data = JSON.parse(match[0]);
        else return { nodes: [], edges: [] };
      }

      const nodes = (Array.isArray(data.nodes) ? data.nodes : []).map((n: any) => ({
        id: String(n.id ?? ""),
        label: String(n.label ?? n.id ?? ""),
        desc: String(n.desc ?? ""),
        category: VALID_CATEGORIES.has(n.category) ? n.category : "definitional",
        importance: ([1, 2, 3].includes(n.importance) ? n.importance : 1) as 1 | 2 | 3,
      }));

      const nodeIds = new Set(nodes.map((n: any) => n.id));
      const edges = (Array.isArray(data.edges) ? data.edges : [])
        .filter((e: any) => nodeIds.has(e.source) && nodeIds.has(e.target))
        .map((e: any) => ({
          source: String(e.source),
          target: String(e.target),
          relation: String(e.relation ?? "ilgili"),
          type: VALID_EDGE_TYPES.has(e.type) ? e.type : "related_to",
        }));

      return { nodes, edges };
    } catch (error: any) {
      throw new Error("Grafik oluşturulamadı: " + error.message);
    }
  }
}

export const geminiService = new GeminiService();
