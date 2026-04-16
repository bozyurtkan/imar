import { Router } from 'express';
import nodemailer from 'nodemailer';
import { getDb, getSetting } from '../db.js';
import { parseSpintax, replacePlaceholders } from '../utils/spintax.js';

const router = Router();
const activeSenders = new Map<number, NodeJS.Timeout>();

function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: getSetting('gmail_email'),
      pass: getSetting('gmail_app_password'),
    },
  });
}

function getTodaySentCount(): number {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  return (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM send_logs WHERE date(sent_at) = ? AND status = 'sent'"
      )
      .get(today) as any
  ).c;
}

async function sendNextEmail(campaignId: number) {
  const db = getDb();
  const dailyLimit = parseInt(getSetting('daily_limit') || '30');

  if (getTodaySentCount() >= dailyLimit) {
    console.log(`⏸️ Günlük limit (${dailyLimit}) doldu. Kampanya duraklatıldı.`);
    db.prepare(
      "UPDATE campaigns SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(campaignId);
    activeSenders.delete(campaignId);
    return;
  }

  const campaign = db
    .prepare('SELECT * FROM campaigns WHERE id = ?')
    .get(campaignId) as any;
  if (!campaign || campaign.status !== 'running') {
    activeSenders.delete(campaignId);
    return;
  }

  const pending = db
    .prepare(
      `SELECT cl.id as cl_id, cl.lead_id, l.name, l.email, l.city, l.website, l.phone
       FROM campaign_leads cl
       JOIN leads l ON cl.lead_id = l.id
       WHERE cl.campaign_id = ? AND cl.status = 'pending'
       LIMIT 1`
    )
    .get(campaignId) as any;

  if (!pending) {
    db.prepare(
      "UPDATE campaigns SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(campaignId);
    activeSenders.delete(campaignId);
    console.log(`✅ Kampanya ${campaignId} tamamlandı.`);
    return;
  }

  const placeholders: Record<string, string> = {
    firma_adi: pending.name || '',
    sehir: pending.city || '',
    email: pending.email || '',
    website: pending.website || '',
    telefon: pending.phone || '',
  };

  const subject = replacePlaceholders(
    parseSpintax(campaign.subject),
    placeholders
  );
  const body = replacePlaceholders(parseSpintax(campaign.body), placeholders);
  const senderName = getSetting('sender_name');
  const gmailEmail = getSetting('gmail_email');

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${senderName}" <${gmailEmail}>`,
      to: pending.email,
      subject,
      text: body,
    });

    db.prepare(
      "UPDATE campaign_leads SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(pending.cl_id);
    db.prepare(
      "UPDATE leads SET status = 'sent', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(pending.lead_id);
    db.prepare(
      'UPDATE campaigns SET sent_count = sent_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(campaignId);
    db.prepare(
      "INSERT INTO send_logs (campaign_id, lead_id, email, subject, body, status) VALUES (?, ?, ?, ?, ?, 'sent')"
    ).run(campaignId, pending.lead_id, pending.email, subject, body);

    console.log(`📧 Gönderildi: ${pending.email}`);
  } catch (err: any) {
    db.prepare(
      "UPDATE campaign_leads SET status = 'failed', error = ? WHERE id = ?"
    ).run(err.message, pending.cl_id);
    db.prepare(
      "INSERT INTO send_logs (campaign_id, lead_id, email, subject, body, status, error) VALUES (?, ?, ?, ?, ?, 'failed', ?)"
    ).run(
      campaignId,
      pending.lead_id,
      pending.email,
      subject,
      body,
      err.message
    );
    console.error(`❌ Hata (${pending.email}):`, err.message);
  }

  const delayMin = parseInt(getSetting('delay_min') || '180') * 1000;
  const delayMax = parseInt(getSetting('delay_max') || '300') * 1000;
  const delay = Math.floor(Math.random() * (delayMax - delayMin + 1)) + delayMin;

  console.log(`⏳ Sonraki mail ${Math.round(delay / 1000)}s sonra...`);
  const timer = setTimeout(() => sendNextEmail(campaignId), delay);
  activeSenders.set(campaignId, timer);
}

router.post('/start/:campaignId', (req, res) => {
  const db = getDb();
  const campaignId = parseInt(req.params.campaignId);

  if (!getSetting('gmail_email') || !getSetting('gmail_app_password')) {
    return res
      .status(400)
      .json({ error: 'Gmail ayarları yapılmamış. Ayarlar sayfasına gidin.' });
  }

  if (activeSenders.has(campaignId)) {
    return res.status(400).json({ error: 'Kampanya zaten çalışıyor.' });
  }

  db.prepare(
    "UPDATE campaigns SET status = 'running', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(campaignId);

  sendNextEmail(campaignId);
  res.json({ success: true, message: 'Kampanya başlatıldı.' });
});

router.post('/pause/:campaignId', (req, res) => {
  const campaignId = parseInt(req.params.campaignId);
  const timer = activeSenders.get(campaignId);
  if (timer) {
    clearTimeout(timer);
    activeSenders.delete(campaignId);
  }

  const db = getDb();
  db.prepare(
    "UPDATE campaigns SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(campaignId);

  res.json({ success: true, message: 'Kampanya duraklatıldı.' });
});

router.post('/preview', (req, res) => {
  const { subject, body, leadData } = req.body;
  const placeholders = leadData || {
    firma_adi: 'Örnek İnşaat A.Ş.',
    sehir: 'Gaziantep',
    email: 'info@ornek.com.tr',
    website: 'www.ornek.com.tr',
    telefon: '0342 123 45 67',
  };

  res.json({
    subject: replacePlaceholders(parseSpintax(subject || ''), placeholders),
    body: replacePlaceholders(parseSpintax(body || ''), placeholders),
  });
});

router.post('/test-send', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const senderName = getSetting('sender_name');
    const gmailEmail = getSetting('gmail_email');

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${senderName}" <${gmailEmail}>`,
      to,
      subject,
      text: body,
    });

    res.json({ success: true, message: `Test maili ${to} adresine gönderildi.` });
  } catch (err: any) {
    res.json({ success: false, message: err.message });
  }
});

router.get('/logs', (req, res) => {
  const db = getDb();
  const { limit = '20' } = req.query;
  const logs = db
    .prepare('SELECT * FROM send_logs ORDER BY sent_at DESC LIMIT ?')
    .all(parseInt(limit as string));
  res.json(logs);
});

router.get('/today-count', (_req, res) => {
  res.json({ count: getTodaySentCount() });
});

export default router;
