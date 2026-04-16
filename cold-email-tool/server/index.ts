import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import settingsRouter from './routes/settings.js';
import scraperRouter from './routes/scraper.js';
import leadsRouter from './routes/leads.js';
import campaignsRouter from './routes/campaigns.js';
import mailerRouter from './routes/mailer.js';
import analyticsRouter from './routes/analytics.js';
import { startReplyChecker } from './services/reply-checker.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

initDb();

app.use('/api/settings', settingsRouter);
app.use('/api/scraper', scraperRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/mailer', mailerRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Cold Email Tool API: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:5173\n`);
  startReplyChecker();
});
