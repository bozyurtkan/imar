import { useEffect } from "react";

declare global {
  interface Navigator {
    modelContext?: {
      provideContext: (tools: WebMCPContext) => void;
    };
  }
}

interface WebMCPContext {
  tools: WebMCPTool[];
}

interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: object;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

export function useWebMCP() {
  useEffect(() => {
    if (!navigator.modelContext) return;

    navigator.modelContext.provideContext({
      tools: [
        {
          name: "mevzuat_soru_sor",
          description:
            "İmar hukuku, yapı ruhsatı veya Türk şehircilik mevzuatı hakkında soru sor. 3194 Sayılı İmar Kanunu, Danıştay içtihatları ve yönetmelikler üzerinde analiz yapar.",
          inputSchema: {
            type: "object",
            properties: {
              soru: {
                type: "string",
                description: "İmar veya yapı ruhsatı ile ilgili soru",
              },
            },
            required: ["soru"],
          },
          execute: async (input) => {
            const res = await fetch("/api/gemini", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: input.soru }),
            });
            return res.json();
          },
        },
        {
          name: "blog_ara",
          description:
            "İmarmevzuat.ai blog yazılarında arama yapar. İmar planı, ruhsatsız yapı, tarım arazisi gibi konularda makaleler bulur.",
          inputSchema: {
            type: "object",
            properties: {
              konu: {
                type: "string",
                description: "Aranacak konu veya anahtar kelime",
              },
            },
            required: ["konu"],
          },
          execute: async (input) => {
            const sitemap = await fetch("/sitemap.xml").then((r) => r.text());
            const matches = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
              .map((m) => m[1])
              .filter((url) =>
                url
                  .toLowerCase()
                  .includes(String(input.konu).toLowerCase().replace(/\s+/g, "-"))
              );
            return { results: matches.slice(0, 5) };
          },
        },
        {
          name: "site_bilgisi",
          description:
            "İmarmevzuat.ai hakkında genel bilgi, yetenekler ve kapsam bilgisi döndürür.",
          inputSchema: {
            type: "object",
            properties: {},
          },
          execute: async () => {
            const res = await fetch("/llms.txt");
            return { content: await res.text() };
          },
        },
      ],
    });
  }, []);
}
