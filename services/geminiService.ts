
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { DocumentFile, Message } from "../types";

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
    if (activeDocs.length === 0) {
      throw new Error("Lütfen analiz için kütüphaneden en az bir belge seçin.");
    }

    const contextText = activeDocs
      .map(doc => `[KAYNAK: ${doc.name} | ETİKET: ${doc.description}]\n${doc.content}`)
      .join('\n\n---\n\n');

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

  async askGeneral(question: string, _documents: DocumentFile[] = []): Promise<{ text: string, sources: any[] }> {
    const ai = this.getNewClient(); // Use the new SDK for Gemini 2.0 tools

    const today = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

    const systemInstruction = `
      Sen profesyonel bir Türkiye İmar Mevzuatı danışmanısın.
      BUGÜNÜN TARİHİ: ${today}
      
      GÖREV: Kullanıcının sorusunu yanıtlarken sadece Google arama ile bulduğun EN GÜNCEL web kaynaklarını, son Resmi Gazete duyurularını ve güncel içtihatları kullan.
      
      ARAMA STRATEJİSİ (ÇOK ÖNEMLİ):
      Soruyu cevaplamak için web'de arama yaparken, her zaman konunun en güncel halini bulmak için arama sorgularını "2025", "2026", "Resmi Gazete", "güncel değişiklik", "yeni yönetmelik" gibi terimlerle daraltmalısın. Eski forum veya haber sitelerindeki eski bilgilere ASLA güvenme. Konu her ne ise (örneğin ruhsat, emsal, otopark, vb.), mutlaka ilgili yönetmeliğin veya kanunun EN SON (özellikle 2025/2026) değişmiş halini bul.
      
      CEVAPLAMA KURALLARI:
      1. Her yasal dayanağı MUTLAKA şu formatta etiketle: [MADDE: KanunNo/MaddeNo] veya [MADDE: Yönetmelik/MaddeNo]
      2. Yanıtlarını madde madde yapılandır.
      3. Önemli yasal terimleri kalın (**terim**) yaz.
      4. Bulduğun yasal dayanağın tarihini (Örn: 14 Ocak 2026 tarihli Resmi Gazete) mutlaka belirt ki kullanıcı taze bilgi olduğunu anlasın.
      5. Tonun profesyonel ve objektif olsun.
      6. Yanıtın doyurucu ve teknik derinliği olan profesyonel bir çıktı olmalıdır.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: `KULLANICI SORUSU: ${question}\n\nLütfen bu soruyu yanıtlarken hukuki/mevzuat açısından en güncel durumu (varsa 2025 ve 2026 Resmi Gazete değişikliklerini) web aramasında muhakkak teyit ederek profesyonelce yanıtla.`,
        config: {
          systemInstruction: "Türkiye imar mevzuatı ve güncel belediye/bakanlık kararları hakkında web araştırması yaparak bilgi ver.".trim(),
          tools: [{ googleSearch: {} }] // The new SDK natively supports this
        }
      });

      const groundingMeta = response.candidates?.[0]?.groundingMetadata;
      const sources = groundingMeta?.groundingChunks || [];

      return { text: response.text || "Güncel bilgi bulunamadı.", sources };
    } catch (error: any) {
      throw new Error("Web araştırması şu an meşgul: " + error.message);
    }
  }

  async compareLegislation(newRegulationUrl: string, _libraryDocs: DocumentFile[]): Promise<string> {
    const ai = this.getNewClient(); // Yeni SDK ve Web Arama Desteği

    const today = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

    const systemInstruction = `
      Sen Türkiye İmar Hukuku ve idare hukuku alanında uzman bir mevzuat analistisin. 
      3194 sayılı İmar Kanunu, Planlı Alanlar İmar Yönetmeliği, Otopark Yönetmeliği, Binaların Yangından Korunması Hakkında Yönetmelik ve ilgili tüm alt düzenlemelere hâkimsin.
      BUGÜNÜN TARİHİ: ${today}

      GÖREV:
      Kullanıcının verdiği Resmî Gazete linkindeki veya metnindeki düzenlemeyi analiz edeceksin.
      Analiz mutlaka ESKİ METİN – YENİ METİN karşılaştırmalı olacak. Web aramasını (googleSearch aracı) kullanarak ilgili mevzuatın eski/önceki metnini bulup çıkaracaksın.

      ZORUNLU ÇIKTI FORMATI:
      Aşağıdaki şablonu, başlıkları ve EMOJİLERİ HARFİYEN kullanarak yanıt vereceksin. Bu çerçevenin dışına çıkma.

      📌 Genel Bilgi

      Düzenleme: [Düzenlemenin Adı]
      Resmî Gazete: [Tarih] tarihli ve [Sayı] sayılı Resmî Gazete
      Yürürlük: [Ne zaman yürürlüğe girdiği]
      [Hangi yönetmelik/kanun üzerinde değişiklik yapıldığını anlatan 1-2 cümlelik kısa özet]

      🔎 Madde Bazlı Eski–Yeni Metin ve Analiz

      (Eğer birden fazla madde değişmişse, her biri için aşağıdaki yapıyı TEKRARLA)

      ✅ MADDE [No] — [Hangi Kanun/Yönetmeliğin Hangi Maddesi]

      📌 ESKİ METİN:
      [Arama yaparak bulduğun veya mevzuatta var olan önceki yürürlükteki metni yaz, hiç bulamazsan da bunu açıkça belirt]

      📌 YENİ METİN:
      [Söz konusu değişiklik metni]

      📌 Değişiklik Türü:
      [Sınırlandırma, ekleme, bent kaldırma, alan hesabı değişikliği vb. çok kısa yaz]

      📌 Hukuki Analiz
      [1-2 paragraf halinde imar hukuku açısından ne anlama geldiği, sürece, emsale, ruhsata veya hukuki riske etkisi]
      Sonuç: [Tek cümlelik özet sonuç]

      (Tüm maddeler bittikten sonra en alta şunları ekle:)

      🧠 Toplu Hukuki Değerlendirme
      [Tüm değişikliğin imar pratiğindeki yeri, amacının özeti, mükellefi mi idareyi mi ilgilendirdiği ve ana gayesi]

      🧩 Sonuç ve Uygulama Etkisi
      [Madde madde (bullet point) projelere, ruhsat süreçlerine veya sektöre somut etkileri]
    `;

    const prompt = `
      Kullanıcının verdiği link/metin: ${newRegulationUrl}

      Lütfen bu linki Web Arama aracı ile doğrulayıp yukarıdaki kesin ve katı formata/emojilere birebir uyarak analizi başlat. Başka hiçbir gereksiz giriş veya selam cümlesi kullanma. Doğrudan "📌 Genel Bilgi" ile başla.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction.trim(),
          tools: [{ googleSearch: {} }],
          temperature: 0.2 // Daha kurumsal ve formatına sadık çıktı için düşük temperature
        }
      });

      return response.text || "Karşılaştırma yapılamadı.";
    } catch (error: any) {
      console.error("Comparison Error:", error);
      throw new Error("Karşılaştırma sırasında hata veya Web Araması başarısız: " + error.message);
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
      Sen, Türk imar mevzuatı ve şehirleşme hukuku alanında uzmanlaşmış bir hukuki danışman ve profesyonel analistin. Sana iletilen Resmi Gazete maddelerini; belediyeler, mimarlar, inşaat mühendisleri ve yapı sektörü profesyonelleri için yorumlu, uygulanabilir ve hukuken sağlam biçimde analiz etmekle görevlisin.

      GÖREV:
      Aşağıdaki Resmi Gazete maddesini imar ve şehirleşme profesyonelleri için analiz et.

      BAŞLIK: ${title}

      İÇERİK:
      ${content.substring(0, 15000)}

      ---

      ANALİZ FORMATI (Markdown — aşağıdaki başlıkları ve sırayı değiştirmeden kullan):

      **ÖZET**
      Maddenin konusunu, kapsamını ve temel amacını 2-3 cümle ile açıkla. Teknik terimler kullan; basitleştirme.

      **HUKUKİ YORUM**
      - Bu düzenlemenin türünü belirt: kanun, yönetmelik, tebliğ, genelge, Cumhurbaşkanlığı kararnamesi vb.
      - Mevzuat hiyerarşisindeki yerini ve bağlı olduğu üst normu açıkla.
      - Varsa yürürlükten kaldırılan veya değiştirilen hükümlerlere değin.
      - Düzenlemenin hukuki geçerlilik tarihini ve geçiş hükümlerini belirt.

      **ETKİ**
      - Belediyeler ve kamu idareleri açısından idari ve operasyonel yükümlülükleri sırala.
      - Mimarlar, inşaat mühendisleri ve proje müellifleri için uygulamaya yansımaları açıkla.
      - İnşaat ve yapı sektörü için maliyet, süreç veya izin boyutlarındaki değişiklikleri belirt.
      - Gerekirse paydaş gruplarına göre ayrıştırılmış madde madde analiz sun.

      **TAVSİYE**
      - Profesyonellerin kısa vadede yapması gereken işlemleri ve öncelikleri listele.
      - Risk veya uyumsuzluk alanlarına karşı uyarı ver.
      - Varsa dikkat edilmesi gereken belirsiz veya tartışmalı hükümler için profesyonel danışmanlık alınmasını öner.

      ---

      KURALLAR:
      1. Giriş veya kapanış için nezaket cümlesi kullanma; doğrudan analize başla.
      2. Dil: profesyonel, hukuki, net. Belirsiz veya muğlak ifadelerden kaçın.
      3. Emoji, ünlem işareti veya informal ifade kullanma.
      4. Her başlık zorunludur; içerik yoksa "Bu madde için ilgili bir etki/hüküm tespit edilmemiştir." yaz.
      5. Madde numarası, yönetmelik adı, Resmî Gazete sayısı gibi referans bilgileri doğru aktar; tahmin etme.
      6. Yanıt Türkçe olacak.
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
    if (activeDocs.length === 0) {
      throw new Error("Lütfen analiz için kütüphaneden en az bir belge seçin.");
    }

    const contextText = activeDocs
      .map(doc => `[KAYNAK: ${doc.name} | ETİKET: ${doc.description}]\n${doc.content}`)
      .join('\n\n---\n\n');

    const systemInstruction = `
      Sen Türkiye'nin en deneyimli İmar Hukuku profesörü ve danışmanısın.
      Derin analiz ve çok adımlı muhakeme yeteneğine sahipsin.

      DERİN ANALİZ KURALLARI:
      1. Her soruyu adım adım analiz et. Önce konuyu tanımla, sonra ilgili maddeleri belirle, ardından yorumla.
      2. Farklı yorum olasılıklarını değerlendir (lehte / aleyhte argümanlar).
      3. Her yasal dayanağı MUTLAKA şu formatta etiketle: [MADDE: KanunNo/MaddeNo]
      4. Yargıtay / Danıştay içtihatlarından bildiğin örneklere atıf yap.
      5. Sonuç bölümünde net bir profesyonel görüş sun.
      6. Yanıtının başına 🧠 emojisi koy.
      7. Önemli yasal terimleri kalın (**terim**) yaz.
      8. Tonun akademik düzeyde profesyonel ve objektif olsun.
      9. **ÖNEMLİ:** Kullanıcı bir kanun maddesini sorduğunda, kendi genel hukuki bilgini kullanarak detaylı ve kapsamlı bir şekilde açıkla.
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
