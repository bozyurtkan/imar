const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const axios = require('axios');
const admin = require('firebase-admin');

// Initialize Firebase Admin (for Firestore access if needed)
admin.initializeApp();
const db = admin.firestore();

const SCRAPER_API_KEY = "4a4589871cba08cf10bf008eca4945f8";

async function fetchWithProxy(targetUrl) {
    const timestamp = new Date().getTime();
    const separator = targetUrl.includes('?') ? '&' : '?';
    const urlWithTs = `${targetUrl}${separator}_t=${timestamp}`;
    const proxyUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(urlWithTs)}&render=true`;

    try {
        const response = await axios.get(proxyUrl, { timeout: 30000 });
        if (response.status !== 200) {
            logger.error(`ScraperAPI error: ${response.status}`);
            return null;
        }
        return response.data;
    } catch (e) {
        logger.error('Fetch Error:', e);
        return null; // Return null on error to let caller handle retry or fail
    }
}

function parseFihrist(html) {
    const articles = [];
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

exports.checkResmiGazete = onCall({ region: "europe-west1" }, async (request) => {
    logger.info("Function called: checkResmiGazete");

    // 1. Get Today's Date String
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const targetUrl = `https://www.resmigazete.gov.tr/fihrist?tarih=${today}`;

    // 2. Try Fetching Today's Gazette
    logger.info(`Fetching URL: ${targetUrl}`);
    let html = await fetchWithProxy(targetUrl);

    // Fallback if needed
    if (!html) {
        logger.info("Falling back to main page...");
        html = await fetchWithProxy('https://www.resmigazete.gov.tr');
    }

    if (!html) {
        throw new HttpsError('unavailable', 'Resmi Gazete sitesine ulaşılamadı (ScraperAPI Error).');
    }

    // 3. Parse Articles
    const articles = parseFihrist(html);
    logger.info(`Found ${articles.length} articles.`);

    // 4. Return results (filtering will happen on client side with Gemini)
    return {
        date: today,
        articles: articles
    };
});
