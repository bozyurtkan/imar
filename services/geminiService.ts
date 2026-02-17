
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
      1. Yanıtlarını madde madde ve yasal dayanak göstererek (Örn: [MADDE: 3194/5]) yapılandır.
      2. Eğer dökümanlarda sorunun cevabı YOKSA, "İstenilen bilgiler kütüphanede yok" de ve nedenini belirt. Kendi genel bilgini asla katma.
      3. Tonun profesyonel ve objektif olsun.
      4. Önemli yasal terimleri kalın (**terim**) yaz.
    `;

    try {
      const model = ai.getGenerativeModel({
        model: "gemini-2.5-flash",
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
        model: "gemini-2.5-flash",
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
        model: "gemini-2.5-flash",
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
        model: "gemini-2.5-flash"
      });

      const result = await model.generateContent(`${prompt}\n\nYENİ DÜZENLEME LİNKİ: ${newRegulationUrl}\n\nKÜTÜPHANE: ${libraryContext}`);
      const response = await result.response;

      return response.text() || "Karşılaştırma yapılamadı.";
    } catch (error: any) {
      console.error("Comparison Error:", error);
      throw new Error("Karşılaştırma sırasında hata: " + error.message);
    }
  }
}

export const geminiService = new GeminiService();
