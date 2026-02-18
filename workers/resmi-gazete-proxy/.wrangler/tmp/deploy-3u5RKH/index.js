var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var SCRAPER_API_KEY = "4a4589871cba08cf10bf008eca4945f8";
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};
var index_default = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }
    const url = new URL(request.url);
    const tarih = url.searchParams.get("tarih");
    if (!tarih) {
      return new Response(
        JSON.stringify({ error: "tarih parametresi gerekli. \xD6rn: ?tarih=2026-02-18" }),
        { status: 400, headers: CORS_HEADERS }
      );
    }
    const targetUrl = `https://www.resmigazete.gov.tr/fihrist?tarih=${tarih}`;
    const proxyUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}`;
    try {
      const response = await fetch(proxyUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ResmiGazeteBot/1.0)" }
      });
      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: `ScraperAPI hatas\u0131: ${response.status}` }),
          { status: 502, headers: CORS_HEADERS }
        );
      }
      const html = await response.text();
      const articles = parseFihrist(html);
      return new Response(
        JSON.stringify({ date: tarih, articles, total: articles.length }),
        { headers: CORS_HEADERS }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500, headers: CORS_HEADERS }
      );
    }
  }
};
function parseFihrist(html) {
  const articles = [];
  const regex = /<a\s+[^>]*href=["']([^"']*(?:eskiler|ilanlar)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  let idCounter = 0;
  while ((match = regex.exec(html)) !== null) {
    const title = match[2].replace(/<[^>]+>/g, "").trim().replace(/^[–\-]+\s*/, "").replace(/\s+/g, " ").trim();
    if (title.length < 5) continue;
    let link = match[1].trim();
    if (!link.startsWith("http")) {
      link = `https://www.resmigazete.gov.tr${link.startsWith("/") ? "" : "/"}${link}`;
    }
    if (!articles.some((a) => a.link === link)) {
      articles.push({ id: idCounter++, title, link });
    }
  }
  return articles;
}
__name(parseFihrist, "parseFihrist");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
