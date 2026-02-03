
import { GoogleGenAI } from "@google/genai";
import { DocumentFile, Message } from "../types";

export class GeminiService {
  private getClient() {
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
      Sadece sana sunulan dökümanlardaki bilgilere dayanarak cevap vermelisin.
      
      CEVAPLAMA KURALLARI:
      1. Yanıtlarını madde madde ve yasal dayanak göstererek (Örn: [MADDE: 3194/5]) yapılandır.
      2. Eğer dökümanlarda sorunun cevabı YOKSA, "İstenilen bilgiler kütüphanede yok" de ve nedenini belirt. Kendi genel bilgini asla katma.
      3. Tonun profesyonel ve objektif olsun.
      4. Önemli yasal terimleri kalın (**terim**) yaz.
    `;

    try {
      // Using gemini-1.5-pro for complex Turkish Zoning Law reasoning.
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: `KÜTÜPHANE İÇERİĞİ:\n\n${contextText}\n\nKULLANICI SORUSU: ${question}`,
        config: {
          systemInstruction: systemInstruction.trim(),
          temperature: 0.1,
        },
      });

      return response.text || "Yüklediğiniz mevzuat dökümanlarından bir yanıt üretilemedi.";
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(error?.message || "Mevzuat servisi şu an yanıt veremiyor.");
    }
  }

  async summarizeDocument(doc: DocumentFile): Promise<string> {
    const ai = this.getClient();
    try {
      // Using gemini-1.5-flash for basic summarization tasks.
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Aşağıdaki imar mevzuatı dökümanını profesyonel bir şekilde özetle:\n\n${doc.content}`,
        config: {
          systemInstruction: "Sen bir hukuk asistanısın. Kısa ve net özetler çıkarırsın.",
        }
      });
      return response.text || "Özet çıkarılamadı.";
    } catch (e: any) {
      throw new Error(e?.message || "Özetleme hatası.");
    }
  }

  async askGeneral(question: string): Promise<{ text: string, sources: any[] }> {
    const ai = this.getClient();
    try {
      // Using gemini-1.5-flash with googleSearch for real-time grounding.
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: question,
        config: {
          systemInstruction: "Türkiye imar mevzuatı ve güncel belediye/bakanlık kararları hakkında web araştırması yaparak bilgi ver.",
          tools: [{ googleSearch: {} }],
        },
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { text: response.text || "Güncel bilgi bulunamadı.", sources };
    } catch (error: any) {
      throw new Error("Web araştırması şu an meşgul: " + error.message);
    }
  }

  async compareLegislation(newRegulationUrl: string, libraryDocs: DocumentFile[]): Promise<string> {
    const ai = this.getClient();

    // Kütüphane bağlamını oluştur
    const libraryContext = libraryDocs
      .filter(doc => doc.isActive)
      .map(doc => `[MEVCUT BELGE: ${doc.name}]\n${doc.description}`)
      .join('\n');

    const prompt = `
      GÖREV: Mevzuat Karşılaştırma ve Analiz

      KULLANICI GİRDİSİ (YENİ DÜZENLEME): ${newRegulationUrl}
      
      MEVCUT KÜTÜPHANE İNDEKSİ:
      ${libraryContext}

      YÖNERGELER:
      1. Verilen URL'deki (Resmi Gazete vb.) yeni düzenlemeyi incele.
      2. Bu düzenlemenin değiştirdiği "Ana Yönetmeliği" veya "Eski Mevzuatı" tespit et.
      3. ARAMA STRATEJİSİ:
         - Eğer eski mevzuat yukarıdaki "MEVCUT KÜTÜPHANE İNDEKSİ" içinde varsa, sistemdeki bilgiyi kullanacağını belirt.
         - Eğer kütüphanede YOKSA, "Google Search" aracını kullanarak eski mevzuatın ilgili maddelerini bul.
      4. ANALİZ:
         - Yeni düzenleme ile neyin değiştiğini madde madde karşılaştır.
         - Eski Hali vs Yeni Hali şeklinde net bir ayrım yap.
         - Değişikliğin pratik etkisini (mimarlar/mühendisler için) yorumla.

      ÇIKTI FORMATI:
      ## Karşılaştırma Raporu
      **İlgili Mevzuat:** [Yönetmelik Adı]
      **Durum:** [Kütüphaneden Bulundu / Webden Araştırıldı]

      ### Değişiklik 1: [Madde No/Konu]
      | Eski Durum | Yeni Durum |
      | :--- | :--- |
      | [Eski hüküm özeti] | [Yeni hüküm özeti] |
      
      **Yorum:** [Bu değişikliğin etkisi nedir?]

      (Diğer değişiklikler için tekrarla...)
    `;

    try {
      // Using gemini-1.5-pro for smart reasoning and web capabilities
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }], // Web arama yeteneği aktif
          temperature: 0.1
        },
      });

      return response.text || "Karşılaştırma yapılamadı.";
    } catch (error: any) {
      console.error("Comparison Error:", error);
      throw new Error("Karşılaştırma sırasında hata: " + error.message);
    }
  }
}

export const geminiService = new GeminiService();
