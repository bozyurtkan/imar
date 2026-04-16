import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Mail, MessageSquare, RefreshCw, Bot, Loader, Zap, ZapOff,
} from 'lucide-react';

export default function Analytics() {
  const [overview, setOverview] = useState<any>({});
  const [funnel, setFunnel] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [imapEnabled, setImapEnabled] = useState(false);
  const [togglingImap, setTogglingImap] = useState(false);

  const load = () => {
    fetch('/api/analytics/overview').then((r) => r.json()).then(setOverview);
    fetch('/api/analytics/funnel').then((r) => r.json()).then((d) => setFunnel(d.steps || []));
    fetch('/api/analytics/campaigns').then((r) => r.json()).then(setCampaigns);
    fetch('/api/analytics/timeline').then((r) => r.json()).then(setTimeline);
    fetch('/api/analytics/replies?limit=20').then((r) => r.json()).then(setReplies);
  };

  const loadImapState = () => {
    fetch('/api/settings').then((r) => r.json()).then((s) => {
      setImapEnabled(s.imap_enabled === 'true');
    });
  };

  useEffect(() => {
    load();
    loadImapState();
  }, []);

  const toggleImap = async () => {
    setTogglingImap(true);
    const newVal = !imapEnabled;
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imap_enabled: newVal ? 'true' : 'false' }),
    });
    await fetch('/api/analytics/restart-checker', { method: 'POST' });
    setImapEnabled(newVal);
    setTogglingImap(false);
  };

  const checkNow = async () => {
    setChecking(true);
    setCheckResult(null);
    const res = await fetch('/api/analytics/check-now', { method: 'POST' });
    const data = await res.json();
    setCheckResult(data);
    setChecking(false);
    load();
  };

  const maxTimeline = Math.max(...timeline.map((t) => t.sent + t.replies), 1);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>📊 Analitik</h2>
          <p>Gönderim ve dönüş istatistikleri</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* IMAP Otomatik Mod Toggle */}
          <button
            onClick={toggleImap}
            disabled={togglingImap}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: `1px solid ${imapEnabled ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
              background: imapEnabled ? 'rgba(34,197,94,0.08)' : undefined,
              position: 'relative',
              overflow: 'hidden',
            }}
            title={imapEnabled ? 'Otomatik taramayı kapat' : 'Otomatik taramayı aç'}
          >
            {togglingImap ? (
              <Loader size={14} />
            ) : imapEnabled ? (
              <Zap size={14} style={{ color: 'var(--success)' }} />
            ) : (
              <ZapOff size={14} style={{ color: 'var(--text-muted)' }} />
            )}
            <span style={{ color: imapEnabled ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem' }}>
              {imapEnabled ? 'Otomatik Açık' : 'Otomatik Kapalı'}
            </span>
            {/* Pulsing dot when active */}
            {imapEnabled && (
              <span style={{
                width: '7px', height: '7px',
                borderRadius: '50%',
                background: 'var(--success)',
                animation: 'pulse 2s infinite',
                flexShrink: 0,
              }} />
            )}
          </button>

          <button className="btn btn-primary" onClick={checkNow} disabled={checking}>
            {checking ? <><Loader size={16} /> Kontrol ediliyor...</> : <><RefreshCw size={16} /> Cevapları Kontrol Et</>}
          </button>
        </div>
      </div>

      {checkResult && (
        <div className={`alert ${checkResult.found > 0 ? 'alert-success' : 'alert-info'}`}>
          {checkResult.found > 0
            ? `🎉 ${checkResult.found} yeni cevap bulundu! (${checkResult.checked} mail tarandı)`
            : `${checkResult.checked} mail tarandı, yeni cevap bulunamadı.`}
          {checkResult.errors?.length > 0 && (
            <span style={{ marginLeft: '8px', opacity: 0.7 }}>
              Hatalar: {checkResult.errors.join(', ')}
            </span>
          )}
        </div>
      )}

      {/* Genel Bakış */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon"><Mail size={28} /></div>
          <div className="stat-label">Toplam Gönderim</div>
          <div className="stat-value">{overview.totalSent || 0}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><MessageSquare size={28} /></div>
          <div className="stat-label">Gerçek Cevap</div>
          <div className="stat-value">{overview.totalReplies || 0}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon"><TrendingUp size={28} /></div>
          <div className="stat-label">Dönüş Oranı</div>
          <div className="stat-value">{overview.replyRate || 0}%</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"><Bot size={28} /></div>
          <div className="stat-label">Otomatik Yanıt</div>
          <div className="stat-value">{overview.autoReplies || 0}</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Dönüşüm Hunisi */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Dönüşüm Hunisi</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {funnel.map((step, i) => {
              const maxVal = funnel[0]?.value || 1;
              const pct = maxVal > 0 ? Math.round((step.value / maxVal) * 100) : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="text-sm" style={{ fontWeight: 600 }}>{step.label}</span>
                    <span className="text-sm text-muted">{step.value} ({pct}%)</span>
                  </div>
                  <div style={{ height: '24px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: step.color,
                      borderRadius: '6px',
                      transition: 'width 0.8s ease',
                      minWidth: step.value > 0 ? '20px' : '0',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 30 Gün Grafik */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Son 30 Gün</h3>
          </div>
          {timeline.length > 0 ? (
            <div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <span className="text-sm"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6', marginRight: '6px' }} />Gönderilen</span>
                <span className="text-sm"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#22c55e', marginRight: '6px' }} />Cevap</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '160px' }}>
                {timeline.map((day, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }} title={`${day.day}: ${day.sent} gönderim, ${day.replies} cevap`}>
                    <div style={{
                      width: '100%',
                      height: `${Math.max((day.sent / maxTimeline) * 140, day.sent > 0 ? 4 : 0)}px`,
                      background: '#3b82f6',
                      borderRadius: '2px 2px 0 0',
                      opacity: 0.7,
                    }} />
                    <div style={{
                      width: '100%',
                      height: `${Math.max((day.replies / maxTimeline) * 140, day.replies > 0 ? 4 : 0)}px`,
                      background: '#22c55e',
                      borderRadius: '0 0 2px 2px',
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span className="text-sm text-muted">{timeline[0]?.day?.slice(5)}</span>
                <span className="text-sm text-muted">{timeline[timeline.length - 1]?.day?.slice(5)}</span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <BarChart3 size={40} />
              <h3>Henüz veri yok</h3>
              <p>Kampanya başlattığınızda grafik oluşur</p>
            </div>
          )}
        </div>
      </div>

      {/* Kampanya Karşılaştırma */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Kampanya Performansı</h3>
        </div>
        {campaigns.length === 0 ? (
          <div className="empty-state">
            <BarChart3 size={40} />
            <h3>Henüz kampanya yok</h3>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Kampanya</th>
                  <th>Durum</th>
                  <th>Gönderilen</th>
                  <th>Cevap</th>
                  <th>Dönüş Oranı</th>
                  <th>Performans</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className={`badge badge-${c.status}`}>{c.status === 'draft' ? 'Taslak' : c.status === 'running' ? 'Çalışıyor' : c.status === 'paused' ? 'Duraklatıldı' : 'Tamamlandı'}</span></td>
                    <td>{c.sent_count}</td>
                    <td style={{ fontWeight: 700, color: c.reply_count > 0 ? 'var(--success)' : 'inherit' }}>{c.reply_count || 0}</td>
                    <td style={{ fontWeight: 700 }}>%{c.reply_rate || 0}</td>
                    <td style={{ width: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(c.reply_rate || 0, 100)}%`,
                            height: '100%',
                            background: (c.reply_rate || 0) >= 10 ? 'var(--success)' : (c.reply_rate || 0) >= 5 ? 'var(--warning)' : 'var(--danger)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <span className="text-sm text-muted" style={{ minWidth: '40px' }}>
                          {(c.reply_rate || 0) >= 10 ? '🟢' : (c.reply_rate || 0) >= 5 ? '🟡' : '🔴'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Son Cevaplar */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">📩 Son Gelen Cevaplar</h3>
        </div>
        {replies.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={40} />
            <h3>Henüz cevap gelmedi</h3>
            <p>"Cevapları Kontrol Et" butonuyla gelen kutusunu tarayın</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Gönderici</th>
                  <th>Firma</th>
                  <th>Konu</th>
                  <th>Önizleme</th>
                  <th>Tür</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {replies.map((r: any) => (
                  <tr key={r.id}>
                    <td className="truncate">{r.from_email}</td>
                    <td>{r.lead_name || '—'}</td>
                    <td className="truncate">{r.subject || '—'}</td>
                    <td className="truncate text-muted" style={{ maxWidth: '250px' }}>{r.snippet || '—'}</td>
                    <td>
                      {r.is_auto_reply ? (
                        <span className="badge badge-paused">Otomatik</span>
                      ) : (
                        <span className="badge badge-sent">Gerçek</span>
                      )}
                    </td>
                    <td className="text-sm text-muted">
                      {r.received_at ? new Date(r.received_at).toLocaleString('tr-TR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
