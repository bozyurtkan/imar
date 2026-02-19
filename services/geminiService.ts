
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DocumentFile, Message } from "../types";

export class GeminiService {
  private getClient() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API Anahtarı bulunamadı. Lütfen Cloudflare ortam değişkenlerinde veya .env dosyasında VITE_GEMINI_API_KEY tanımlı olduğundan emin olun.");
    }
    return new GoogleGenerativeAI(apiKey);
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
      Sadece sana sunulan dökümanlardaki bilgilere dayanarak cevap vermelisin.
      
      CEVAPLAMA KURALLARI:
      1. Her yasal dayanağı MUTLAKA şu formatta etiketle: [MADDE: KanunNo/MaddeNo]
         Örnekler: [MADDE: 3194/18], [MADDE: 2942/11]
         Bu etiketler kullanıcının tıklayarak ilgili maddeye gitmesini sağlar.
      2. Yanıtlarını madde madde yapılandır.
      3. **ÖNEMLİ:** Kullanıcı bir kanun maddesini sorduğunda veya referans verdiğinde, eğer yüklenen belgelerde o maddenin tam metni yoksa, **kendi genel hukuki bilgini kullanarak** o maddenin içeriğini kısaca açıkla. "Bilgi yok" deme.
      4. Ancak yorum yaparken SADECE yüklenen belgedeki bağlama sadık kal.
      5. Tonun profesyonel ve objektif olsun.
      6. Önemli yasal terimleri kalın (**terim**) yaz.
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

  async askGeneral(question: string): Promise<{ text: string, sources: any[] }> {
    const ai = this.getClient();
    try {
      const model = ai.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "Türkiye imar mevzuatı ve güncel belediye/bakanlık kararları hakkında web araştırması yaparak bilgi ver."
      });

      const result = await model.generateContent(question);
      const response = await result.response;

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { text: response.text() || "Güncel bilgi bulunamadı.", sources };
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
}

export const geminiService = new GeminiService();
