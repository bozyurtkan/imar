import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key missing" });

  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "No PDF data provided" });

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: data,
              },
            },
            {
              text: "Bu PDF belgesindeki tüm metni eksiksiz olarak çıkar. Türkçe karakterleri (ğ, ü, ş, ö, ç, ı, İ, Ğ, Ü, Ş, Ö, Ç) doğru şekilde yaz. Madde numaralarını, paragraf yapısını ve başlıkları aynen koru. Yorum veya açıklama ekleme, sadece belgedeki metni döndür.",
            },
          ],
        },
      ],
    });

    const text = response.text || "";
    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("PDF extract error:", error);
    return res.status(500).json({ error: error.message });
  }
}
