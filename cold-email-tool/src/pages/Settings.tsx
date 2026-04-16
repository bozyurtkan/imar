import { useState, useEffect } from 'react';
import { Save, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [smtpResult, setSmtpResult] = useState<any>(null);
  const [apifyResult, setApifyResult] = useState<any>(null);
  const [testing, setTesting] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings);
  }, []);

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const testSmtp = async () => {
    setTesting('smtp');
    setSmtpResult(null);
    const res = await fetch('/api/settings/test-smtp', { method: 'POST' });
    setSmtpResult(await res.json());
    setTesting('');
  };

  const testApify = async () => {
    setTesting('apify');
    setApifyResult(null);
    const res = await fetch('/api/settings/test-apify', { method: 'POST' });
    setApifyResult(await res.json());
    setTesting('');
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Ayarlar</h2>
          <p>API anahtarları ve gönderim yapılandırması</p>
        </div>
        <button className="btn btn-primary" onClick={save}>
          <Save size={16} /> {saved ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>

      {saved && <div className="alert alert-success"><CheckCircle size={16} /> Ayarlar başarıyla kaydedildi.</div>}

      <div className="grid-2">
        {/* Apify */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔑 Apify API</h3>
          </div>

          <div className="form-group">
            <label>API Key</label>
            <input
              className="form-input"
              type="password"
              value={settings.apify_api_key || ''}
              onChange={e => update('apify_api_key', e.target.value)}
              placeholder="apify_api_xxxxxxxxxxxx"
            />
            <div className="form-hint">
              <a href="https://console.apify.com/account/integrations" target="_blank" rel="noreferrer"
                 style={{ color: 'var(--accent)' }}>
                Apify Console → Integrations
              </a> sayfasından alabilirsiniz.
            </div>
          </div>

          <button className="btn btn-secondary" onClick={testApify} disabled={testing === 'apify'}>
            {testing === 'apify' ? <><span className="spinner" style={{ width: '14px', height: '14px' }} /> Test ediliyor...</>
              : <><Wifi size={14} /> Bağlantıyı Test Et</>}
          </button>

          {apifyResult && (
            <div className={`alert mt-2 ${apifyResult.success ? 'alert-success' : 'alert-error'}`}>
              {apifyResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {apifyResult.message}
            </div>
          )}
        </div>

        {/* Gmail SMTP */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📧 Gmail SMTP</h3>
          </div>

          <div className="form-group">
            <label>Gmail Adresi</label>
            <input
              className="form-input"
              type="email"
              value={settings.gmail_email || ''}
              onChange={e => update('gmail_email', e.target.value)}
              placeholder="ornek@imarmevzuat.com.tr"
            />
          </div>

          <div className="form-group">
            <label>Uygulama Şifresi (App Password)</label>
            <input
              className="form-input"
              type="password"
              value={settings.gmail_app_password || ''}
              onChange={e => update('gmail_app_password', e.target.value)}
              placeholder="xxxx xxxx xxxx xxxx"
            />
            <div className="form-hint">
              Google Hesabı → Güvenlik → 2FA aktif →{' '}
              <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer"
                 style={{ color: 'var(--accent)' }}>
                Uygulama Şifreleri
              </a>
            </div>
          </div>

          <div className="form-group">
            <label>Gönderici Adı</label>
            <input
              className="form-input"
              value={settings.sender_name || ''}
              onChange={e => update('sender_name', e.target.value)}
              placeholder="İmar Mevzuat Ekibi"
            />
          </div>

          <button className="btn btn-secondary" onClick={testSmtp} disabled={testing === 'smtp'}>
            {testing === 'smtp' ? <><span className="spinner" style={{ width: '14px', height: '14px' }} /> Test ediliyor...</>
              : <><Wifi size={14} /> SMTP'yi Test Et</>}
          </button>

          {smtpResult && (
            <div className={`alert mt-2 ${smtpResult.success ? 'alert-success' : 'alert-error'}`}>
              {smtpResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {smtpResult.message}
            </div>
          )}
        </div>

        {/* Gönderim Ayarları */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">⚡ Gönderim Ayarları</h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Günlük Limit</label>
              <input
                className="form-input"
                type="number"
                value={settings.daily_limit || '30'}
                onChange={e => update('daily_limit', e.target.value)}
                min={1}
                max={50}
              />
              <div className="form-hint">Güvenli aralık: 30-50 arası. Yeni hesap ise 10 ile başlayın.</div>
            </div>
            <div className="form-group">
              <label>Min. Bekleme (Saniye)</label>
              <input
                className="form-input"
                type="number"
                value={settings.delay_min || '180'}
                onChange={e => update('delay_min', e.target.value)}
                min={60}
              />
              <div className="form-hint">Mailler arası minimum bekleme süresi.</div>
            </div>
            <div className="form-group">
              <label>Max. Bekleme (Saniye)</label>
              <input
                className="form-input"
                type="number"
                value={settings.delay_max || '300'}
                onChange={e => update('delay_max', e.target.value)}
                min={60}
              />
              <div className="form-hint">Mailler arası maksimum bekleme süresi.</div>
            </div>
          </div>

          <div className="alert alert-warning">
            <WifiOff size={14} />
            İlk 14 gün boyunca limiti düşük tutun (10-15) ve kademeli olarak artırın. Bu süreçte warm-up yapmanız önerilir.
          </div>
        </div>

        {/* IMAP Cevap Takibi */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">📬 Otomatik Cevap Takibi (IMAP)</h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Otomatik Kontrol</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <button
                  className={`btn btn-sm ${settings.imap_enabled === 'true' ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => update('imap_enabled', settings.imap_enabled === 'true' ? 'false' : 'true')}
                >
                  {settings.imap_enabled === 'true' ? '✓ Aktif' : 'Devre Dışı'}
                </button>
                <span className="text-sm text-muted">
                  {settings.imap_enabled === 'true'
                    ? 'Gelen kutusu periyodik olarak kontrol ediliyor'
                    : 'Etkinleştirin, lead cevapları otomatik algılansın'}
                </span>
              </div>
              <div className="form-hint">
                Gmail IMAP erişiminin aktif olması gerekir. Gmail ayarlarından IMAP'ı açın.
              </div>
            </div>
            <div className="form-group">
              <label>Kontrol Aralığı (Dakika)</label>
              <input
                className="form-input"
                type="number"
                value={settings.imap_check_interval || '5'}
                onChange={e => update('imap_check_interval', e.target.value)}
                min={1}
                max={60}
              />
              <div className="form-hint">Gelen kutusunun kaç dakikada bir kontrol edileceği.</div>
            </div>
          </div>

          <div className="alert alert-info">
            <CheckCircle size={14} />
            IMAP, Gmail SMTP ile aynı kimlik bilgilerini (email + uygulama şifresi) kullanır. Ayrıca ayar gerekmez.
            Kaydet'e bastıktan sonra Analitik sayfasından "Cevapları Kontrol Et" butonuyla manuel de tetikleyebilirsiniz.
          </div>
        </div>
      </div>
    </div>
  );
}
