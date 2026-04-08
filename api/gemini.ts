import { GoogleGenAI } from "@google/genai";

async function fetchWithRetry(fn: () => Promise<any>, retries = 5, baseDelayMs = 1500) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("Too Many Requests") || error?.message?.includes("quota") || error?.message?.includes("rate") || error?.message?.includes("overloaded");
      if (isRateLimit && attempt < retries - 1) {
        attempt++;
        const waitTime = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`Gemini API rate limit hit (429). Retrying in ${waitTime}ms... (Attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw error;
      }
    }
  }
}

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
    // Tüm istekler yeni GoogleGenAI SDK üzerinden gidiyor
    const ai = new GoogleGenAI({ apiKey });

    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (useGoogleSearch) config.tools = [{ googleSearch: {} }];
    if (thinkingConfig) config.thinkingConfig = thinkingConfig;
    if (responseMimeType) config.responseMimeType = responseMimeType;

    const response = await fetchWithRetry(() => ai.models.generateContent({
      model,
      contents,
      config: Object.keys(config).length ? config : undefined,
    }));

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

      const response2 = await fetchWithRetry(() => ai.models.generateContent({
        model,
        contents,
        config: Object.keys(config2).length ? config2 : undefined,
      }));

      text =
        response2.text ||
        response2.candidates?.[0]?.content?.parts
          ?.filter((p: any) => p.text)
          ?.map((p: any) => p.text)
          ?.join("") ||
        "";
    }

    return res.status(200).json({ text, groundingChunks });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || "Gemini servisi yanıt vermedi." });
  }
}
