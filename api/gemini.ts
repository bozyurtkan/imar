import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Sunucu yapılandırma hatası: API anahtarı eksik." });
  }

  const {
    model,
    contents,
    systemInstruction,
    useGoogleSearch,
    responseMimeType,
    thinkingConfig,
    fallbackOnEmpty,
  } = req.body;

  if (!model || !contents) {
    return res.status(400).json({ error: "model ve contents alanları zorunludur." });
  }

  try {
    // gemini-2.5-x modelleri veya Google Search gerektiren çağrılar için yeni client
    const needsNewClient = useGoogleSearch || model.includes("2.5");

    if (needsNewClient) {
      const ai = new GoogleGenAI({ apiKey });

      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (useGoogleSearch) config.tools = [{ googleSearch: {} }];
      if (thinkingConfig) config.thinkingConfig = thinkingConfig;

      const response = await ai.models.generateContent({
        model,
        contents,
        config: Object.keys(config).length ? config : undefined,
      });

      const groundingMeta = response.candidates?.[0]?.groundingMetadata;
      const groundingChunks = groundingMeta?.groundingChunks || [];

      let text =
        response.text ||
        response.candidates?.[0]?.content?.parts
          ?.filter((p: any) => !p.thought && p.text)
          ?.map((p: any) => p.text)
          ?.join("") ||
        "";

      // compareLegislation gibi durumlarda thinkingBudget olmadan tekrar dene
      if (!text && fallbackOnEmpty) {
        const config2: any = { ...config };
        delete config2.thinkingConfig;

        const response2 = await ai.models.generateContent({
          model,
          contents,
          config: Object.keys(config2).length ? config2 : undefined,
        });

        text =
          response2.text ||
          response2.candidates?.[0]?.content?.parts
            ?.filter((p: any) => p.text)
            ?.map((p: any) => p.text)
            ?.join("") ||
          "";
      }

      return res.status(200).json({ text, groundingChunks });
    } else {
      // Basit çağrılar için eski client (gemini-2.0-flash vb.)
      const ai = new GoogleGenerativeAI(apiKey);

      const genConfig: any = {};
      if (responseMimeType) genConfig.responseMimeType = responseMimeType;

      const modelInstance = ai.getGenerativeModel({
        model,
        systemInstruction: systemInstruction || undefined,
        generationConfig: Object.keys(genConfig).length ? genConfig : undefined,
      });

      const result = await modelInstance.generateContent(contents);
      const response = await result.response;
      const text = response.text();

      return res.status(200).json({ text, groundingChunks: [] });
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || "Gemini servisi yanıt vermedi." });
  }
}
