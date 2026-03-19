export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Sunucu yapılandırma hatası: ScraperAPI anahtarı eksik." });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "url alanı zorunludur." });
  }

  const proxyUrl = `https://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`;

  const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) {
    return res.status(response.status).json({ error: `Sayfa alınamadı: ${response.status}` });
  }

  const html = await response.text();

  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 60000);

  return res.status(200).json({ text });
}
