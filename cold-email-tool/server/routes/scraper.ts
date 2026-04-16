import { Router } from 'express';
import { getDb, getSetting } from '../db.js';
import { findEmailsFromWebsite } from '../utils/email-finder.js';

const router = Router();

router.post('/start', async (req, res) => {
  try {
    const { city, category, maxResults = 50 } = req.body;
    const apiKey = getSetting('apify_api_key');

    if (!apiKey) {
      return res
        .status(400)
        .json({ error: 'Apify API Key ayarlanmamış. Ayarlar sayfasından girin.' });
    }

    const { ApifyClient } = await import('apify-client');
    const client = new ApifyClient({ token: apiKey });
    const searchQuery = `${city} ${category}`;

    console.log(`🔍 Scraping: "${searchQuery}" (max: ${maxResults})`);

    const run = await client
      .actor('compass/crawler-google-places')
      .call(
        {
          searchStringsArray: [searchQuery],
          maxCrawledPlacesPerSearch: maxResults,
          language: 'tr',
          maxImages: 0,
        },
        { waitSecs: 300 }
      );

    const { items } = await client
      .dataset(run.defaultDatasetId)
      .listItems();

    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO leads (name, phone, website, email, city, category, address, rating, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'apify')
    `);

    let savedCount = 0;
    let emailCount = 0;

    const insertMany = db.transaction((rows: any[]) => {
      for (const item of rows) {
        const name = item.title || item.name || '';
        const phone = item.phone || item.phoneUnformatted || '';
        const website = item.website || item.url || '';
        const address = item.address || item.street || '';
        const rating = item.totalScore || item.rating || null;
        let email = '';

        if (item.emails && item.emails.length > 0) {
          email = item.emails[0];
        } else if (item.email) {
          email = Array.isArray(item.email) ? item.email[0] : item.email;
        }

        if (email) emailCount++;

        const existing = db
          .prepare(
            'SELECT id FROM leads WHERE name = ? AND city = ?'
          )
          .get(name, city);

        if (!existing && name) {
          insert.run(name, phone, website, email, city, category, address, rating);
          savedCount++;
        }
      }
    });

    insertMany(items);

    res.json({
      success: true,
      totalScraped: items.length,
      saved: savedCount,
      withEmail: emailCount,
    });
  } catch (err: any) {
    console.error('Scraper error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/enrich-all', async (_req, res) => {
  const db = getDb();
  const leads = db
    .prepare(
      'SELECT * FROM leads WHERE (email IS NULL OR email = "") AND website IS NOT NULL AND website != ""'
    )
    .all() as any[];

  let found = 0;
  for (const lead of leads) {
    const emails = await findEmailsFromWebsite(lead.website);
    if (emails.length > 0) {
      db.prepare(
        'UPDATE leads SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(emails[0], lead.id);
      found++;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  res.json({ success: true, enriched: found, total: leads.length });
});

export default router;
