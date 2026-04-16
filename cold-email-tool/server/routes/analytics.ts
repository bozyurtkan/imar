import { Router } from 'express';
import { getDb } from '../db.js';
import { checkReplies, restartReplyChecker } from '../services/reply-checker.js';

const router = Router();

// Genel bakış
router.get('/overview', (_req, res) => {
  const db = getDb();
  const g = (q: string) => (db.prepare(q).get() as any)?.c || 0;

  const totalSent = g("SELECT COUNT(*) as c FROM send_logs WHERE status = 'sent'");
  const totalReplies = g('SELECT COUNT(*) as c FROM replies WHERE is_auto_reply = 0');
  const autoReplies = g('SELECT COUNT(*) as c FROM replies WHERE is_auto_reply = 1');
  const totalLeads = g('SELECT COUNT(*) as c FROM leads');
  const withEmail = g("SELECT COUNT(*) as c FROM leads WHERE email IS NOT NULL AND email != ''");
  const replyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : '0.0';

  res.json({
    totalLeads,
    withEmail,
    totalSent,
    totalReplies,
    autoReplies,
    replyRate: parseFloat(replyRate),
  });
});

// Kampanya bazlı dönüş oranları
router.get('/campaigns', (_req, res) => {
  const db = getDb();
  const campaigns = db
    .prepare(
      `SELECT
        c.id, c.name, c.status, c.total_leads, c.sent_count, c.reply_count,
        c.created_at,
        CASE WHEN c.sent_count > 0
          THEN ROUND(CAST(c.reply_count AS FLOAT) / c.sent_count * 100, 1)
          ELSE 0
        END as reply_rate
      FROM campaigns c
      ORDER BY c.created_at DESC`
    )
    .all();
  res.json(campaigns);
});

// Dönüşüm hunisi
router.get('/funnel', (_req, res) => {
  const db = getDb();
  const g = (q: string) => (db.prepare(q).get() as any)?.c || 0;

  const totalLeads = g('SELECT COUNT(*) as c FROM leads');
  const withEmail = g("SELECT COUNT(*) as c FROM leads WHERE email IS NOT NULL AND email != ''");
  const sent = g("SELECT COUNT(*) as c FROM leads WHERE status = 'sent' OR status = 'replied'");
  const replied = g("SELECT COUNT(*) as c FROM leads WHERE status = 'replied'");
  const realReplies = g('SELECT COUNT(*) as c FROM replies WHERE is_auto_reply = 0');

  res.json({
    steps: [
      { label: 'Toplam Lead', value: totalLeads, color: '#6366f1' },
      { label: "Email'i Var", value: withEmail, color: '#3b82f6' },
      { label: 'Mail Gönderildi', value: sent, color: '#06b6d4' },
      { label: 'Cevap Geldi', value: replied, color: '#22c55e' },
      { label: 'Gerçek Cevap', value: realReplies, color: '#a855f7' },
    ],
  });
});

// Son 30 gün timeline
router.get('/timeline', (_req, res) => {
  const db = getDb();

  const sentByDay = db
    .prepare(
      `SELECT date(sent_at) as day, COUNT(*) as count
       FROM send_logs WHERE status = 'sent'
       AND sent_at >= date('now', '-30 days')
       GROUP BY date(sent_at)
       ORDER BY day`
    )
    .all() as { day: string; count: number }[];

  const repliesByDay = db
    .prepare(
      `SELECT date(received_at) as day, COUNT(*) as count
       FROM replies
       WHERE received_at >= date('now', '-30 days')
       AND is_auto_reply = 0
       GROUP BY date(received_at)
       ORDER BY day`
    )
    .all() as { day: string; count: number }[];

  // Build 30-day range
  const days: { day: string; sent: number; replies: number }[] = [];
  const sentMap = new Map(sentByDay.map((s) => [s.day, s.count]));
  const replyMap = new Map(repliesByDay.map((r) => [r.day, r.count]));

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({
      day: key,
      sent: sentMap.get(key) || 0,
      replies: replyMap.get(key) || 0,
    });
  }

  res.json(days);
});

// Gelen cevaplar listesi
router.get('/replies', (req, res) => {
  const db = getDb();
  const { limit = '50' } = req.query;

  const replies = db
    .prepare(
      `SELECT r.*, l.name as lead_name, c.name as campaign_name
       FROM replies r
       LEFT JOIN leads l ON r.lead_id = l.id
       LEFT JOIN campaigns c ON r.campaign_id = c.id
       ORDER BY r.received_at DESC
       LIMIT ?`
    )
    .all(parseInt(limit as string));

  res.json(replies);
});

// Manuel kontrol tetikle
router.post('/check-now', async (_req, res) => {
  try {
    const result = await checkReplies();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// IMAP checker'ı yeniden başlat
router.post('/restart-checker', (_req, res) => {
  restartReplyChecker();
  res.json({ success: true, message: 'Reply checker yeniden başlatıldı.' });
});

export default router;
