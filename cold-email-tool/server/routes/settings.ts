import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as {
    key: string;
    value: string;
  }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  if (settings.gmail_app_password) {
    settings.gmail_app_password_display =
      '●'.repeat(Math.min(settings.gmail_app_password.length, 8));
  }
  res.json(settings);
});

router.put('/', (req, res) => {
  const db = getDb();
  const update = db.prepare(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
  );
  const transaction = db.transaction(() => {
    for (const [key, value] of Object.entries(req.body)) {
      update.run(key, String(value));
    }
  });
  transaction();
  res.json({ success: true });
});

router.post('/test-smtp', async (_req, res) => {
  try {
    const nodemailer = await import('nodemailer');
    const db = getDb();
    const getVal = (key: string) => {
      const row = db
        .prepare('SELECT value FROM settings WHERE key = ?')
        .get(key) as { value: string } | undefined;
      return row?.value || '';
    };

    const transporter = nodemailer.default.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: getVal('gmail_email'),
        pass: getVal('gmail_app_password'),
      },
    });

    await transporter.verify();
    res.json({ success: true, message: 'SMTP bağlantısı başarılı!' });
  } catch (err: any) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/test-apify', async (_req, res) => {
  try {
    const { ApifyClient } = await import('apify-client');
    const db = getDb();
    const row = db
      .prepare('SELECT value FROM settings WHERE key = ?')
      .get('apify_api_key') as { value: string } | undefined;
    const apiKey = row?.value || '';

    if (!apiKey) {
      return res.json({ success: false, message: 'API Key girilmemiş.' });
    }

    const client = new ApifyClient({ token: apiKey });
    const user = await client.user().get();
    res.json({
      success: true,
      message: `Bağlantı başarılı! Kullanıcı: ${user?.username}`,
    });
  } catch (err: any) {
    res.json({ success: false, message: err.message });
  }
});

export default router;
