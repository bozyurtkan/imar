
const https = require('https');

const SCRAPER_API_KEY = '4a4589871cba08cf10bf008eca4945f8'; // Key from env

// Polyfill fetch for Node if needed, or just use https. request is easier. 
// Actually node 18+ has fetch. check node version.
// Using explicit https request to be safe or simple fetch if supported.

async function fetchWithProxy(targetUrl) {
    const timestamp = new Date().getTime();
    const separator = targetUrl.includes('?') ? '&' : '?';
    const urlWithTs = `${targetUrl}${separator}_t=${timestamp}`;
    const proxyUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(urlWithTs)}&render=true`;

    console.log("Fetching: " + proxyUrl);

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            console.error("Fetch failed: " + response.status);
            return null;
        }
        return await response.text();
    } catch (e) {
        console.error('Fetch Error:', e);
        return null;
    }
}

function parseFihrist(html) {
    const articles = [];
    // Regex from the updated service
    const regex = /<a\s+[^>]*href=["']([^"']*(?:eskiler|ilanlar)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    let idCounter = 0;

    while ((match = regex.exec(html)) !== null) {
        let title = match[2].replace(/<[^>]+>/g, '').trim().replace(/^[–\-]+\s*/, '').replace(/\s+/g, ' ').trim();

        if (title.length < 5 || /^[a-z]\s*-/i.test(title)) continue;

        let link = match[1].trim();
        if (!link.startsWith('http')) link = `https://www.resmigazete.gov.tr/${link.startsWith('/') ? '' : '/'}${link}`;

        if (!articles.some(a => a.link === link)) {
            articles.push({ id: idCounter++, title, link });
        }
    }
    return articles;
}

async function runTest() {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const targetUrl = `https://www.resmigazete.gov.tr/fihrist?tarih=${today}`;

    console.log("Date: " + today);

    let html = await fetchWithProxy(targetUrl);

    if (!html) {
        console.log("Failed to fetch fihrist. Trying main page.");
        html = await fetchWithProxy('https://www.resmigazete.gov.tr');
    }

    if (!html) {
        console.log("Could not fetch content.");
        return;
    }

    console.log("Content fetched (length: " + html.length + ")");

    const articles = parseFihrist(html);
    console.log("Found " + articles.length + " articles.");

    // Filter for 'Üniversite'
    const universityArticles = articles.filter(a => a.title.toLocaleLowerCase('tr').includes('üniversite'));

    console.log(`\nFound ${universityArticles.length} articles containing 'Üniversite':`);
    universityArticles.forEach(a => {
        console.log("- " + a.title);
        console.log("  Link: " + a.link);
    });
}

runTest();
