import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const { status, city, search, page = '1', limit = '50' } = req.query;
  let query = 'SELECT * FROM leads WHERE 1=1';
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }
  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ? OR website LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const countQ = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const { total } = db.prepare(countQ).get(...params) as { total: number };

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit as string), offset);

  const leads = db.prepare(query).all(...params);
  res.json({
    leads,
    total,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });
});

router.get('/stats', (_req, res) => {
  const db = getDb();
  const g = (q: string) => (db.prepare(q).get() as any).c;

  res.json({
    total: g('SELECT COUNT(*) as c FROM leads'),
    withEmail: g(
      'SELECT COUNT(*) as c FROM leads WHERE email IS NOT NULL AND email != ""'
    ),
    newLeads: g("SELECT COUNT(*) as c FROM leads WHERE status = 'new'"),
    sent: g("SELECT COUNT(*) as c FROM leads WHERE status = 'sent'"),
    replied: g("SELECT COUNT(*) as c FROM leads WHERE status = 'replied'"),
  });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const { status, email } = req.body;
  if (status) {
    db.prepare(
      'UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, req.params.id);
  }
  if (email !== undefined) {
    db.prepare(
      'UPDATE leads SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(email, req.params.id);
  }
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/bulk-status', (req, res) => {
  const db = getDb();
  const { ids, status } = req.body;
  const update = db.prepare(
    'UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  const tr = db.transaction(() => {
    for (const id of ids) update.run(status, id);
  });
  tr();
  res.json({ success: true });
});

router.get('/cities', (_req, res) => {
  const db = getDb();
  const cities = db
    .prepare(
      'SELECT DISTINCT city FROM leads WHERE city IS NOT NULL ORDER BY city'
    )
    .all();
  res.json(cities.map((c: any) => c.city));
});

export default router;
