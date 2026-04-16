import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'outreach.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDb() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      website TEXT,
      email TEXT,
      city TEXT,
      category TEXT,
      address TEXT,
      rating REAL,
      status TEXT DEFAULT 'new',
      source TEXT DEFAULT 'apify',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      sent_count INTEGER DEFAULT 0,
      total_leads INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaign_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      lead_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      sent_at DATETIME,
      error TEXT,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS send_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER,
      lead_id INTEGER,
      email TEXT,
      subject TEXT,
      body TEXT,
      status TEXT,
      error TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      campaign_id INTEGER,
      from_email TEXT,
      subject TEXT,
      snippet TEXT,
      received_at DATETIME,
      is_auto_reply BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
    );
  `);

  // Add reply_count to campaigns if not exists
  try {
    database.exec('ALTER TABLE campaigns ADD COLUMN reply_count INTEGER DEFAULT 0');
  } catch { /* column already exists */ }

  const defaults: Record<string, string> = {
    apify_api_key: '',
    gmail_email: '',
    gmail_app_password: '',
    sender_name: 'İmar Mevzuat Ekibi',
    daily_limit: '30',
    delay_min: '180',
    delay_max: '300',
    imap_enabled: 'false',
    imap_check_interval: '5',
  };

  const insertSetting = database.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  );
  for (const [key, value] of Object.entries(defaults)) {
    insertSetting.run(key, value);
  }

  console.log('✅ Database initialized');
}

export function getSetting(key: string): string {
  const row = getDb()
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(key) as { value: string } | undefined;
  return row?.value || '';
}
