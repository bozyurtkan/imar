import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key missing" });

  const { data, text: rawText } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Mod 1: PDF dosyası (base64) → Gemini OCR
    if (data) {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: "application/pdf", data } },
              {
                text: "Bu PDF belgesindeki tüm metni eksiksiz olarak çıkar. Türkçe karakterleri (ğ, ü, ş, ö, ç, ı, İ, Ğ, Ü, Ş, Ö, Ç) doğru şekilde yaz. Madde numaralarını, paragraf yapısını ve başlıkları aynen koru. Yorum veya açıklama ekleme, sadece belgedeki metni döndür.",
              },
            ],
          },
        ],
      });
      return res.status(200).json({ text: response.text || "" });
    }

    // Mod 2: Bozuk ham metin → Gemini düzeltme
    if (rawText) {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Bu metin Türkçe bir PDF'den çıkarıldı ancak font kodlaması bozuk — bazı karakterler (özellikle i, ı, ğ, ş, ö, ç) eksik veya boşlukla ayrılmış. Türkçe dil bilgisini kullanarak bozuk karakterleri düzelt. Metnin yapısını, madde numaralarını ve paragrafları koru. Sadece düzeltilmiş metni döndür.\n\nBOZUK METİN:\n${rawText}`,
              },
            ],
          },
        ],
      });
      return res.status(200).json({ text: response.text || rawText });
    }

    return res.status(400).json({ error: "data veya text gerekli" });
  } catch (error: any) {
    console.error("PDF extract error:", error);
    return res.status(500).json({ error: error.message });
  }
}
