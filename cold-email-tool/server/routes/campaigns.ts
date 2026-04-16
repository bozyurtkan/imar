import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const db = getDb();
  const campaigns = db
    .prepare('SELECT * FROM campaigns ORDER BY created_at DESC')
    .all();
  res.json(campaigns);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, subject, body } = req.body;
  const result = db
    .prepare(
      'INSERT INTO campaigns (name, subject, body) VALUES (?, ?, ?)'
    )
    .run(name, subject, body);
  res.json({ success: true, id: result.lastInsertRowid });
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const campaign = db
    .prepare('SELECT * FROM campaigns WHERE id = ?')
    .get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Kampanya bulunamadı' });

  const leads = db
    .prepare(
      `SELECT cl.id as cl_id, cl.status as cl_status, cl.sent_at, cl.error,
              l.id, l.name, l.email, l.city, l.phone
       FROM campaign_leads cl
       JOIN leads l ON cl.lead_id = l.id
       WHERE cl.campaign_id = ?`
    )
    .all(req.params.id);

  res.json({ ...(campaign as any), leads });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, subject, body, status } = req.body;
  if (name !== undefined) {
    db.prepare(
      'UPDATE campaigns SET name = ?, subject = ?, body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(name, subject, body, req.params.id);
  }
  if (status !== undefined) {
    db.prepare(
      'UPDATE campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, req.params.id);
  }
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM campaign_leads WHERE campaign_id = ?').run(
    req.params.id
  );
  db.prepare('DELETE FROM campaigns WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/:id/add-leads', (req, res) => {
  const db = getDb();
  const { leadIds } = req.body;
  const campaignId = req.params.id;

  const insert = db.prepare(
    'INSERT OR IGNORE INTO campaign_leads (campaign_id, lead_id) VALUES (?, ?)'
  );
  const tr = db.transaction(() => {
    for (const leadId of leadIds) {
      insert.run(campaignId, leadId);
    }
  });
  tr();

  const count = (
    db
      .prepare(
        'SELECT COUNT(*) as c FROM campaign_leads WHERE campaign_id = ?'
      )
      .get(campaignId) as any
  ).c;
  db.prepare(
    'UPDATE campaigns SET total_leads = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(count, campaignId);

  res.json({ success: true, totalLeads: count });
});

router.post('/:id/add-filtered-leads', (req, res) => {
  const db = getDb();
  const campaignId = req.params.id;
  const { status: leadStatus = 'new', city } = req.body;

  let query =
    'SELECT id FROM leads WHERE email IS NOT NULL AND email != ""';
  const params: any[] = [];

  if (leadStatus) {
    query += ' AND status = ?';
    params.push(leadStatus);
  }
  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }

  const leads = db.prepare(query).all(...params) as { id: number }[];

  const insert = db.prepare(
    'INSERT OR IGNORE INTO campaign_leads (campaign_id, lead_id) VALUES (?, ?)'
  );
  const tr = db.transaction(() => {
    for (const lead of leads) {
      insert.run(campaignId, lead.id);
    }
  });
  tr();

  const count = (
    db
      .prepare(
        'SELECT COUNT(*) as c FROM campaign_leads WHERE campaign_id = ?'
      )
      .get(campaignId) as any
  ).c;
  db.prepare(
    'UPDATE campaigns SET total_leads = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(count, campaignId);

  res.json({ success: true, added: leads.length, totalLeads: count });
});

export default router;
