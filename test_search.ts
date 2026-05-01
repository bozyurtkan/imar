import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

const envStr = fs.readFileSync(".env.local", "utf8");
const match = envStr.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
    console.log("Testing Google Search Grounding...");

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "KULLANICI SORUSU: Kapı önü rüzgarlık holü ruhsata tabi midir?\n\nLütfen bu soruyu yanıtlarken özellikle 2025 veya 2026 yılına ait güncel Resmi Gazete değişikliklerini (Örn: Planlı Alanlar İmar Yönetmeliği Değişikliği) web'den muhakkak araştırarak yanıtla.",
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        console.log("RESPONSE TEXT:");
        console.log(response.text);

        console.log("\nGROUNDING METADATA:");
        const groundingMeta = response.candidates?.[0]?.groundingMetadata;
        console.log(JSON.stringify(groundingMeta, null, 2));

    } catch (e) {
        console.error("ERROR:", e);
    }
}

run();
