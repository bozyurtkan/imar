import { useState, useEffect } from 'react';
import { Users, Mail, MailCheck, TrendingUp, Send, MessageSquare } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [analytics, setAnalytics] = useState<any>({});

  useEffect(() => {
    fetch('/api/leads/stats').then(r => r.json()).then(setStats);
    fetch('/api/mailer/logs?limit=10').then(r => r.json()).then(setLogs);
    fetch('/api/mailer/today-count').then(r => r.json()).then(d => setTodayCount(d.count));
    fetch('/api/analytics/overview').then(r => r.json()).then(setAnalytics);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Genel bakış ve günlük istatistikler</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card purple">
          <div className="stat-icon"><Users size={28} /></div>
          <div className="stat-label">Toplam Lead</div>
          <div className="stat-value">{stats.total || 0}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon"><MailCheck size={28} /></div>
          <div className="stat-label">Email'i Olan</div>
          <div className="stat-value">{stats.withEmail || 0}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><Send size={28} /></div>
          <div className="stat-label">Bugün Gönderilen</div>
          <div className="stat-value">{todayCount}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"><TrendingUp size={28} /></div>
          <div className="stat-label">Toplam Gönderilen</div>
          <div className="stat-value">{stats.sent || 0}</div>
        </div>
        <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ content: "''", position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(135deg, #22c55e, #a855f7)' }} />
          <div className="stat-icon"><MessageSquare size={28} /></div>
          <div className="stat-label">Dönüş Oranı</div>
          <div className="stat-value">{analytics.replyRate || 0}%</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Lead Durumu</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <StatBar label="Yeni" value={stats.newLeads || 0} total={stats.total || 1} color="var(--info)" />
            <StatBar label="Mail Atıldı" value={stats.sent || 0} total={stats.total || 1} color="var(--success)" />
            <StatBar label="Cevap Geldi" value={stats.replied || 0} total={stats.total || 1} color="#a855f7" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Son Gönderimler</h3>
          </div>
          {logs.length === 0 ? (
            <div className="empty-state">
              <Mail size={40} />
              <h3>Henüz gönderim yok</h3>
              <p>Kampanya başlattığınızda burada görünecek</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Durum</th>
                    <th>Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="truncate">{log.email}</td>
                      <td>
                        <span className={`badge badge-${log.status}`}>
                          {log.status === 'sent' ? 'Gönderildi' : 'Hata'}
                        </span>
                      </td>
                      <td className="text-muted text-sm">
                        {new Date(log.sent_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span className="text-sm">{label}</span>
        <span className="text-sm text-muted">{value} ({pct}%)</span>
      </div>
      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}
