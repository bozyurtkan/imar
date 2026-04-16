import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { getDb, getSetting } from '../db.js';

let checkInterval: ReturnType<typeof setInterval> | null = null;
let isChecking = false;

function getImapConfig() {
  return {
    user: getSetting('gmail_email'),
    password: getSetting('gmail_app_password'),
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  };
}

function getLeadEmails(): Map<string, { leadId: number; campaignId: number | null }> {
  const db = getDb();
  const leads = db
    .prepare(
      `SELECT l.id as lead_id, l.email, cl.campaign_id
       FROM leads l
       LEFT JOIN campaign_leads cl ON cl.lead_id = l.id AND cl.status = 'sent'
       WHERE l.status = 'sent' AND l.email IS NOT NULL AND l.email != ''`
    )
    .all() as any[];

  const map = new Map<string, { leadId: number; campaignId: number | null }>();
  for (const lead of leads) {
    map.set(lead.email.toLowerCase(), {
      leadId: lead.lead_id,
      campaignId: lead.campaign_id,
    });
  }
  return map;
}

function isAutoReply(subject: string, headers: any): boolean {
  const subjectLower = (subject || '').toLowerCase();
  const autoIndicators = [
    'out of office', 'otomatik yanıt', 'automatic reply',
    'auto-reply', 'autoreply', 'tatildeyim', 'dışarıdayım',
  ];
  if (autoIndicators.some((i) => subjectLower.includes(i))) return true;

  const autoSubmitted = headers?.['auto-submitted'];
  if (autoSubmitted && autoSubmitted !== 'no') return true;

  const precedence = headers?.precedence;
  if (precedence === 'bulk' || precedence === 'junk' || precedence === 'auto_reply') return true;

  return false;
}

export async function checkReplies(): Promise<{
  checked: number;
  found: number;
  errors: string[];
}> {
  if (isChecking) return { checked: 0, found: 0, errors: ['Kontrol zaten devam ediyor.'] };

  const email = getSetting('gmail_email');
  const password = getSetting('gmail_app_password');
  if (!email || !password) {
    return { checked: 0, found: 0, errors: ['Gmail ayarları yapılmamış.'] };
  }

  isChecking = true;
  const result = { checked: 0, found: 0, errors: [] as string[] };

  return new Promise((resolve) => {
    const imap = new Imap(getImapConfig());

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err) => {
        if (err) {
          isChecking = false;
          result.errors.push(err.message);
          imap.end();
          return resolve(result);
        }

        // Search for emails from the last 7 days
        const since = new Date();
        since.setDate(since.getDate() - 7);

        imap.search(['ALL', ['SINCE', since]], (searchErr, uids) => {
          if (searchErr || !uids || uids.length === 0) {
            isChecking = false;
            if (searchErr) result.errors.push(searchErr.message);
            imap.end();
            return resolve(result);
          }

          const leadEmails = getLeadEmails();
          const db = getDb();
          const insertReply = db.prepare(
            `INSERT INTO replies (lead_id, campaign_id, from_email, subject, snippet, received_at, is_auto_reply)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          );

          const fetch = imap.fetch(uids, { bodies: '', struct: true });

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              let buffer = '';
              stream.on('data', (chunk: Buffer) => {
                buffer += chunk.toString('utf8');
              });
              stream.on('end', async () => {
                try {
                  const parsed = await simpleParser(buffer);
                  result.checked++;

                  const fromAddr = parsed.from?.value?.[0]?.address?.toLowerCase();
                  if (!fromAddr) return;

                  const match = leadEmails.get(fromAddr);
                  if (!match) return;

                  // Check if already recorded
                  const existing = db
                    .prepare(
                      'SELECT id FROM replies WHERE from_email = ? AND subject = ? AND lead_id = ?'
                    )
                    .get(fromAddr, parsed.subject || '', match.leadId);
                  if (existing) return;

                  const snippet = (parsed.text || '').substring(0, 300);
                  const receivedAt = parsed.date?.toISOString() || new Date().toISOString();
                  const autoReply = isAutoReply(parsed.subject || '', parsed.headers);

                  insertReply.run(
                    match.leadId,
                    match.campaignId,
                    fromAddr,
                    parsed.subject || '',
                    snippet,
                    receivedAt,
                    autoReply ? 1 : 0
                  );

                  // Update lead status
                  db.prepare(
                    "UPDATE leads SET status = 'replied', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
                  ).run(match.leadId);

                  // Update campaign reply_count
                  if (match.campaignId) {
                    db.prepare(
                      'UPDATE campaigns SET reply_count = reply_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
                    ).run(match.campaignId);
                    db.prepare(
                      "UPDATE campaign_leads SET status = 'replied' WHERE campaign_id = ? AND lead_id = ?"
                    ).run(match.campaignId, match.leadId);
                  }

                  result.found++;
                  console.log(
                    `📩 Cevap algılandı: ${fromAddr}${autoReply ? ' (otomatik yanıt)' : ''}`
                  );
                } catch (parseErr: any) {
                  result.errors.push(parseErr.message);
                }
              });
            });
          });

          fetch.once('end', () => {
            isChecking = false;
            imap.end();
            resolve(result);
          });

          fetch.once('error', (fetchErr) => {
            isChecking = false;
            result.errors.push(fetchErr.message);
            imap.end();
            resolve(result);
          });
        });
      });
    });

    imap.once('error', (imapErr: Error) => {
      isChecking = false;
      result.errors.push(imapErr.message);
      resolve(result);
    });

    imap.connect();
  });
}

export function startReplyChecker() {
  const enabled = getSetting('imap_enabled');
  if (enabled !== 'true') {
    console.log('📭 IMAP reply checker devre dışı. Ayarlar\'dan etkinleştirin.');
    return;
  }

  const intervalMin = parseInt(getSetting('imap_check_interval') || '5');
  const intervalMs = intervalMin * 60 * 1000;

  if (checkInterval) clearInterval(checkInterval);

  console.log(`📬 Reply checker başlatıldı (her ${intervalMin} dakikada bir kontrol)`);

  // İlk kontrol 30 saniye sonra
  setTimeout(async () => {
    const result = await checkReplies();
    console.log(`📬 İlk kontrol: ${result.checked} mail tarandı, ${result.found} cevap bulundu`);
  }, 30000);

  checkInterval = setInterval(async () => {
    const result = await checkReplies();
    if (result.found > 0) {
      console.log(`📬 ${result.found} yeni cevap algılandı!`);
    }
  }, intervalMs);
}

export function stopReplyChecker() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
    console.log('📭 Reply checker durduruldu.');
  }
}

export function restartReplyChecker() {
  stopReplyChecker();
  startReplyChecker();
}
