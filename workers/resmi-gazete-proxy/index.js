/**
 * Cloudflare Worker - Resmi Gazete Proxy
 * Resmi Gazete sitesini sunucu tarafında çekip tarayıcıya döndürür.
 * CORS sorununu ortadan kaldırır.
 */

const SCRAPER_API_KEY = '4a4589871cba08cf10bf008eca4945f8';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
};

export default {
    async fetch(request, env, ctx) {
        // OPTIONS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        const url = new URL(request.url);
        const tarih = url.searchParams.get('tarih');

        if (!tarih) {
            return new Response(
                JSON.stringify({ error: 'tarih parametresi gerekli. Örn: ?tarih=2026-02-18' }),
                { status: 400, headers: CORS_HEADERS }
            );
        }

        // Resmi Gazete fihrist URL'si
        const targetUrl = `https://www.resmigazete.gov.tr/fihrist?tarih=${tarih}`;
        const proxyUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}`;

        try {
            const response = await fetch(proxyUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ResmiGazeteBot/1.0)' },
            });

            if (!response.ok) {
                return new Response(
                    JSON.stringify({ error: `ScraperAPI hatası: ${response.status}` }),
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
    },
};

function parseFihrist(html) {
    const articles = [];
    // Hem çift hem tek tırnaklı href'leri yakala, iç HTML taglerini temizle
    const regex = /<a\s+[^>]*href=["']([^"']*(?:eskiler|ilanlar)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    let idCounter = 0;

    while ((match = regex.exec(html)) !== null) {
        const title = match[2]
            .replace(/<[^>]+>/g, '')
            .trim()
            .replace(/^[–\-]+\s*/, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (title.length < 5) continue;

        let link = match[1].trim();
        if (!link.startsWith('http')) {
            link = `https://www.resmigazete.gov.tr${link.startsWith('/') ? '' : '/'}${link}`;
        }

        if (!articles.some((a) => a.link === link)) {
            articles.push({ id: idCounter++, title, link });
        }
    }

    return articles;
}
