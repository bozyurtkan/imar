
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { DocumentFile, Message } from "../types";
import { findRelatedArticles, BlogArticle } from "../data/blogArticles";

export class GeminiService {
  private getClient() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API Anahtarı bulunamadı. Lütfen Cloudflare ortam değişkenlerinde veya .env dosyasında VITE_GEMINI_API_KEY tanımlı olduğundan emin olun.");
    }
    return new GoogleGenerativeAI(apiKey);
  }

  private getNewClient() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API Anahtarı bulunamadı. Lütfen Cloudflare ortam değişkenlerinde veya .env dosyasında VITE_GEMINI_API_KEY tanımlı olduğundan emin olun.");
    }
    return new GoogleGenAI({ apiKey });
  }

  async askQuestion(
    question: string,
    documents: DocumentFile[],
    chatHistory: Message[]
  ): Promise<string> {
    const ai = this.getClient();

    const activeDocs = documents.filter(doc => doc.isActive);

    const contextText = activeDocs.length > 0
      ? activeDocs.map(doc => `[KAYNAK: ${doc.name} | ETİKET: ${doc.description}]\n${doc.content}`).join('\n\n---\n\n')
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
      const model = ai.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: systemInstruction.trim()
      });

      const result = await model.generateContent(`KÜTÜPHANE İÇERİĞİ:\n\n${contextText}\n\nKULLANICI SORUSU: ${question}`);
      const response = await result.response;
      return response.text() || "Yüklediğiniz mevzuat dökümanlarından bir yanıt üretilemedi.";
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(error?.message || "Mevzuat servisi şu an yanıt veremiyor.");
    }
  }

  async summarizeDocument(doc: DocumentFile): Promise<string> {
    const ai = this.getClient();
    try {
      const model = ai.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "Sen bir hukuk asistanısın. Kısa ve net özetler çıkarırsın."
      });
      const result = await model.generateContent(`Aşağıdaki imar mevzuatı dökümanını profesyonel bir şekilde özetle:\n\n${doc.content}`);
      const response = await result.response;
      return response.text() || "Özet çıkarılamadı.";
    } catch (e: any) {
      throw new Error(e?.message || "Özetleme hatası.");
    }
  }

  async askGeneral(question: string, _documents: DocumentFile[] = []): Promise<{ text: string, sources: any[], relatedArticles: BlogArticle[] }> {
    const ai = this.getNewClient();

    const today = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

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
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `KULLANICI SORUSU: ${question}\n\nLütfen bu soruyu yanıtlarken hukuki/mevzuat açısından en güncel durumu (varsa 2025 ve 2026 Resmi Gazete değişikliklerini) web aramasında muhakkak teyit ederek profesyonelce yanıtla.`,
        config: {
          systemInstruction: systemInstruction.trim(),
          tools: [{ googleSearch: {} }]
        }
      });

      const groundingMeta = response.candidates?.[0]?.groundingMetadata;
      const sources = groundingMeta?.groundingChunks || [];
      const relatedArticles = findRelatedArticles(question);

      return { text: response.text || "Güncel bilgi bulunamadı.", sources, relatedArticles };
    } catch (error: any) {
      throw new Error("Web araştırması şu an meşgul: " + error.message);
    }
  }

  async compareLegislation(newRegulationUrl: string, libraryDocs: DocumentFile[]): Promise<string> {
    const ai = this.getClient();

    const libraryContext = libraryDocs
      .filter(doc => doc.isActive)
      .map(doc => `[MEVCUT BELGE: ${doc.name}]\n${doc.description}`)
      .join('\n');

    const today = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

    const prompt = `
      BUGÜNÜN TARİHİ: ${today}
      ÖNEMLİ: Sen bir AI modelisin ve eğitim verilerin eski olabilir. Ama bugün ${today}. Kullanıcının verdiği linklerdeki tarihler (2025, 2026 vb.) geçerlidir. Tarihi sorgulamadan analiz yap.
      SEN: Türkiye'nin en deneyimli imar hukuku uzmanısın. Mevzuat değişikliklerini analiz etmekte 20 yıllık tecrüben var. İmar hukuku konularında derinlemesine analiz yap.
    `;

    try {
      const model = ai.getGenerativeModel({
        model: "gemini-2.0-flash"
      });

      const result = await model.generateContent(`${prompt}\n\nYENİ DÜZENLEME LİNKİ: ${newRegulationUrl}\n\nKÜTÜPHANE: ${libraryContext}`);
      const response = await result.response;

      return response.text() || "Karşılaştırma yapılamadı.";
    } catch (error: any) {
      console.error("Comparison Error:", error);
      throw new Error("Karşılaştırma sırasında hata: " + error.message);
    }
  }
  async filterResmiGazete(articles: { id: number, title: string, link: string }[], interests: string): Promise<number[]> {
    const ai = this.getClient();
    const json = JSON.stringify(articles.map(a => ({ id: a.id, metin: a.title })));

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
      // JSON mode kullanmıyoruz — bazı modellerde desteklenmiyor
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Yanıttan JSON dizisini çıkar (markdown code block içinde gelebilir)
      const jsonMatch = text.match(/\[.*?\]/s);
      if (!jsonMatch) {
        console.warn("Gemini Filter: JSON dizisi bulunamadı. Yanıt:", text.substring(0, 200));
        return [];
      }
      const ids = JSON.parse(jsonMatch[0]);
      console.log("Gemini Filter IDs:", ids);
      return Array.isArray(ids) ? ids : [];
    } catch (error) {
      console.error("Gemini Filter Error:", error);
      return [];
    }
  }

  async analyzeResmiGazete(title: string, content: string): Promise<string> {
    const ai = this.getClient();
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
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      return "Analiz yapılamadı: " + error.message;
    }
  }

  async analyzeMadde(kanunNo: string, maddeNo: string, fikraNo?: string | null): Promise<{ icerik: string, anahtarKelimeler: string[], iliskiliMaddeler: string[] }> {
    const ai = this.getClient();

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
      const model = ai.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const data = JSON.parse(response.text());

      return {
        icerik: data.icerik || "Madde metni bulunamadı.",
        anahtarKelimeler: Array.isArray(data.anahtarKelimeler) ? data.anahtarKelimeler : [],
        iliskiliMaddeler: Array.isArray(data.iliskiliMaddeler) ? data.iliskiliMaddeler : []
      };
    } catch (error: any) {
      console.error("Madde Analysis Error:", error);
      throw new Error("Madde metni getirilemedi: " + error.message);
    }
  }

  async askDeepThink(
    question: string,
    documents: DocumentFile[],
    chatHistory: Message[]
  ): Promise<string> {
    const ai = this.getClient();

    const activeDocs = documents.filter(doc => doc.isActive);

    const contextText = activeDocs.length > 0
      ? activeDocs.map(doc => `[KAYNAK: ${doc.name} | ETİKET: ${doc.description}]\n${doc.content}`).join('\n\n---\n\n')
      : "Kullanıcı kütüphaneden analiz için herhangi bir özel belge seçmedi. Lütfen geniş genel hukuk ve imar mevzuatı bilgilerini kullanarak soruyu derinlemesine analiz et. Analizinin I. adımında kullanıcıya sistemde aktif belge olmadığını ve bu sebeple genel mevzuat üzerinden cevap verdiğini not düş.";

    const systemInstruction = `
      Sen Türkiye'nin en deneyimli İmar Hukuku profesörü ve danışmanısın.
      Derin analiz ve çok adımlı hukuki muhakeme yeteneğine sahipsin.

      ─────────────────────────────────────────
      TEMEL DAVRANIŞLAR
      ─────────────────────────────────────────
      - Önemli hukuki terimleri **kalın** yaz.
      - Ton: akademik, profesyonel, objektif.
      - Bilgi kesim tarihinden sonra değişmiş olabilecek mevzuat için kullanıcıyı uyar.
      - Eğer soru çok geniş veya belirsizse, önce soruyu netleştir.

      ─────────────────────────────────────────
      ANALİZ ADIMLARI (sırayla uygula)
      ─────────────────────────────────────────
      1. KONU TANIMI: Sorunun hukuki niteliğini ve hangi alt alana girdiğini belirle.
      2. YASAL DAYANAK: İlgili kanun maddelerini şu formatta etiketle:
         [MADDE: KanunNo/MaddeNo – Kısa Başlık]
         Örnek: [MADDE: 3194/18 – Arazi ve Arsa Düzenlemesi]
      3. İÇTİHAT DESTEĞİ: Varsa ilgili Danıştay / Yargıtay / Bölge İdare Mahkemesi kararlarına atıf yap. Emin değilsen "İçtihada rastlanmamıştır, doğrulama önerilir" yaz — uydurma.
      4. YORUM ANALİZİ: Konuya ilişkin en az iki farklı yorumu değerlendir:
         - 📗 Lehte yorum (lehte argümanlar)
         - 📕 Aleyhte yorum (aleyhte argümanlar)
      5. RİSK DEĞERLENDİRMESİ: Pratik uygulama riskleri ve idarenin olası tutumunu belirt.
      6. SONUÇ & GÖRÜŞ: Net, tek paragraflık profesyonel görüş sun. "Kesin" ifadeler yerine "kanaatimce", "güçlü argüman", "önerilir" gibi hukuki ihtiyat dili kullan.

      ─────────────────────────────────────────
      ÇIKTI YAPISI (zorunlu)
      ─────────────────────────────────────────
      🧠 [SORU ÖZETİ]

      **I. Konu Tanımı**
      ...

      **II. Yasal Dayanak**
      ...

      **III. İçtihat**
      ...

      **IV. Yorum Analizi**
      📗 Lehte: ...
      📕 Aleyhte: ...

      **V. Risk Değerlendirmesi**
      ...

      **VI. Sonuç ve Profesyonel Görüş**
      ...

      ⚠️ *Bu analiz bilgilendirme amaçlıdır; somut hukuki tavsiye için güncel mevzuat ve yetkili hukuk danışmanlığı alınması önerilir.*

      ─────────────────────────────────────────
      KISITLAMALAR
      ─────────────────────────────────────────
      - İçtihat referansı uydurma. Emin değilsen açıkça belirt.
      - Kesin sonuç garantisi verme.
      - Etik dışı amaçlar için yorum yapma.
    `;

    try {
      const model = ai.getGenerativeModel({
        model: "gemini-2.5-pro",
        systemInstruction: systemInstruction.trim()
      });

      const result = await model.generateContent(`KÜTÜPHANE İÇERİĞİ:\n\n${contextText}\n\nKULLANICI SORUSU: ${question}`);
      const response = await result.response;
      return response.text() || "Derin analiz tamamlanamadı.";
    } catch (error: any) {
      console.error("Deep Think API Error:", error);
      throw new Error(error?.message || "Derin düşünce servisi şu an yanıt veremiyor.");
    }
  }

  async extractGraphFromText(text: string): Promise<{ nodes: any[], edges: any[] }> {
    const ai = this.getClient();
    // Metin çok uzunsa kırp (Token limiti önlemi)
    const truncatedText = text.length > 30000 ? text.substring(0, 30000) + "..." : text;

    const prompt = `
      Sen bir hukuk ve veri analistisin. Aşağıdaki mevzuat metninden maddeler arası ilişkileri çıkararak bir bilgi grafiği (Knowledge Graph) oluşturmalısın.

      GÖREV:
      1. Metindeki ana maddeleri (Node) tespit et. (Örn: Madde 1, Madde 5, Ek Madde 2)
      2. Bu maddelerin birbirine yaptığı atıfları (Edge) tespit et. (Örn: "5. maddeye göre..." -> Madde 5 ile ilişki)
      3. Her madde için kısa bir başlık/konu belirle.
      
      ÇIKTI FORMATI (SAF JSON):
      {
        "nodes": [
          { "id": "Md. 1", "label": "Amaç", "desc": "Kanunun amacı..." },
          { "id": "Md. 5", "label": "Tanımlar", "desc": "Nazım plan, yapı vb. tanımlar" }
        ],
        "edges": [
          { "source": "Md. 1", "target": "Md. 5", "relation": "ilgili" },
          { "source": "Md. 18", "target": "Md. 19", "relation": "atıf" }
        ]
      }

      KURALLAR:
      1. Sadece, JSON döndür. Markdown, açıklama vb. ekleme.
      2. En fazla 15-20 önemli maddeyi seç, grafik çok karmaşık olmasın.
      3. ID'leri kısa tut (Örn: "Md. 1").
      4. Eğer metin çok kısaysa veya madde yapısı yoksa, anahtar kavramları node olarak al.

      METİN:
      ${truncatedText}
    `;

    try {
      const model = ai.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" } // JSON modu zorla
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text();

      try {
        const data = JSON.parse(jsonText);
        return {
          nodes: Array.isArray(data.nodes) ? data.nodes : [],
          edges: Array.isArray(data.edges) ? data.edges : []
        };
      } catch (e) {
        console.error("JSON Parse Error:", e, jsonText);
        // Fallback: Basit regex ile JSON yakalamaya çalış
        const match = jsonText.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
        return { nodes: [], edges: [] };
      }
    } catch (error: any) {
      console.error("Graph Extraction Error:", error);
      throw new Error("Grafik oluşturulamadı: " + error.message);
    }
  }
}

export const geminiService = new GeminiService();
