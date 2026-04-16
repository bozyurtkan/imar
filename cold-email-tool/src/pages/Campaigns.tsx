import { useState, useEffect } from 'react';
import { Plus, Play, Pause, Trash2, Eye, RefreshCw, Users } from 'lucide-react';

const defaultBody = `{Merhaba|Selamlar|İyi günler} {{firma_adi}} ekibi,

{{sehir}} bölgesinde faaliyet gösteren firmanızı inceleme fırsatım oldu.

{İmar mevzuatı ve yönetmelik takibi|Güncel yönetmelik değişikliklerini takip etmek}, özellikle {{sehir}} gibi {hızla gelişen|dinamik} şehirlerde ciddi zaman ve kaynak gerektiriyor.

Bu sorunu çözmek için imarmevzuat.ai platformunu geliştirdik. {Yapay zeka destekli asistanımız|AI tabanlı mevzuat asistanımız}:

• Planlı Alanlar İmar Yönetmeliği değişikliklerini {anında|saniyeler içinde} analiz eder
• {Ruhsat süreçleri|İnşaat ruhsatı|Yapı denetim} konularında güncel yanıtlar verir
• Resmi Gazete değişikliklerini {otomatik takip eder|gerçek zamanlı izler}

{Platformumuzu ücretsiz denemek ister misiniz?|Size kısa bir demo sunmamızı ister misiniz?|Bakmak ister misiniz?}

{Saygılarımla|İyi çalışmalar},
İmar Mevzuat Ekibi
imarmevzuat.com.tr`;

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: '', subject: '{{firma_adi}} için İmar Mevzuat Takip Çözümü', body: defaultBody });
  const [preview, setPreview] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const load = () => fetch('/api/campaigns').then(r => r.json()).then(setCampaigns);
  useEffect(() => { load(); }, []);

  const create = async () => {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsg(`Kampanya oluşturuldu (ID: ${data.id})`);
    setView('list');
    load();
  };

  const doPreview = async () => {
    const res = await fetch('/api/mailer/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: form.subject, body: form.body }),
    });
    setPreview(await res.json());
  };

  const startCampaign = async (id: number) => {
    const res = await fetch(`/api/mailer/start/${id}`, { method: 'POST' });
    const data = await res.json();
    if (data.error) setMsg(data.error);
    else setMsg(data.message);
    load();
  };

  const pauseCampaign = async (id: number) => {
    await fetch(`/api/mailer/pause/${id}`, { method: 'POST' });
    setMsg('Kampanya duraklatıldı.');
    load();
  };

  const deleteCampaign = async (id: number) => {
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    load();
  };

  const addLeads = async (id: number) => {
    const res = await fetch(`/api/campaigns/${id}/add-filtered-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'new' }),
    });
    const data = await res.json();
    setMsg(`${data.added} lead eklendi. Toplam: ${data.totalLeads}`);
    load();
  };

  const viewDetail = async (id: number) => {
    const res = await fetch(`/api/campaigns/${id}`);
    setSelected(await res.json());
    setView('detail');
  };

  const tags = ['{{firma_adi}}', '{{sehir}}', '{{email}}', '{{telefon}}', '{{website}}'];
  const statusLabels: Record<string, string> = {
    draft: 'Taslak', running: 'Çalışıyor', paused: 'Duraklatıldı', completed: 'Tamamlandı',
  };

  if (view === 'create') {
    return (
      <div>
        <div className="page-header">
          <h2>Yeni Kampanya</h2>
          <p>Spintax ve placeholder kullanarak kişiselleştirilmiş mail şablonu</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="grid-2">
          <div className="card">
            <div className="form-group">
              <label>Kampanya Adı</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Örn: Gaziantep İnşaat Q1" />
            </div>

            <div className="form-group">
              <label>Konu (Subject)</label>
              <input className="form-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              <div className="tag-list mt-2">
                {tags.map(t => <span key={t} className="tag" onClick={() => setForm({ ...form, subject: form.subject + ' ' + t })}>{t}</span>)}
              </div>
            </div>

            <div className="form-group">
              <label>Mail İçeriği (Spintax destekli)</label>
              <textarea className="form-textarea" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={14} />
              <div className="form-hint">
                {'{ }' } Spintax: {'{seçenek1|seçenek2|seçenek3}'} — {'{{ }}'} Placeholder: {'{{firma_adi}}'}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={create} disabled={!form.name}>
                <Plus size={16} /> Kampanya Oluştur
              </button>
              <button className="btn btn-secondary" onClick={doPreview}>
                <Eye size={16} /> Önizle
              </button>
              <button className="btn btn-secondary" onClick={() => setView('list')}>
                Geri
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Önizleme</h3>
              <button className="btn btn-sm btn-secondary" onClick={doPreview}><RefreshCw size={14} /> Yenile</button>
            </div>
            {preview ? (
              <div className="preview-panel">
                <div className="preview-subject">Konu: {preview.subject}</div>
                {preview.body}
              </div>
            ) : (
              <div className="empty-state">
                <Eye size={40} />
                <h3>Önizleme için "Önizle" butonuna tıklayın</h3>
                <p>Her tıklamada spintax rastgele değişir</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selected) {
    return (
      <div>
        <div className="page-header">
          <h2>{selected.name}</h2>
          <p>
            <span className={`badge badge-${selected.status}`}>{statusLabels[selected.status]}</span>
            {' '}— {selected.sent_count}/{selected.total_leads} gönderildi
          </p>
        </div>
        <button className="btn btn-secondary mb-4" onClick={() => setView('list')}>← Geri</button>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Firma</th><th>Email</th><th>Durum</th><th>Gönderim Zamanı</th></tr>
            </thead>
            <tbody>
              {(selected.leads || []).map((l: any) => (
                <tr key={l.cl_id}>
                  <td>{l.name}</td>
                  <td>{l.email}</td>
                  <td><span className={`badge badge-${l.cl_status}`}>{l.cl_status === 'sent' ? 'Gönderildi' : l.cl_status === 'failed' ? 'Hata' : 'Bekliyor'}</span></td>
                  <td className="text-sm text-muted">{l.sent_at ? new Date(l.sent_at).toLocaleString('tr-TR') : '—'}</td>
                </tr>
              ))}
              {(!selected.leads || selected.leads.length === 0) && (
                <tr><td colSpan={4} className="text-center text-muted" style={{ padding: '40px' }}>Bu kampanyaya henüz lead eklenmemiş.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Kampanyalar</h2>
          <p>Email kampanyalarınızı yönetin</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setView('create'); setPreview(null); setMsg(''); }}>
          <Plus size={16} /> Yeni Kampanya
        </button>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {campaigns.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Plus size={48} />
            <h3>Henüz kampanya yok</h3>
            <p>"Yeni Kampanya" butonuyla başlayın</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {campaigns.map((c) => (
            <div key={c.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{c.name}</div>
                <div className="text-sm text-muted">
                  <span className={`badge badge-${c.status}`} style={{ marginRight: '8px' }}>{statusLabels[c.status]}</span>
                  {c.sent_count}/{c.total_leads} gönderildi
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-sm btn-secondary" onClick={() => addLeads(c.id)}>
                  <Users size={14} /> Lead Ekle
                </button>
                {(c.status === 'draft' || c.status === 'paused') && (
                  <button className="btn btn-sm btn-success" onClick={() => startCampaign(c.id)}>
                    <Play size={14} /> Başlat
                  </button>
                )}
                {c.status === 'running' && (
                  <button className="btn btn-sm btn-secondary" onClick={() => pauseCampaign(c.id)}>
                    <Pause size={14} /> Duraklat
                  </button>
                )}
                <button className="btn btn-sm btn-secondary" onClick={() => viewDetail(c.id)}>
                  <Eye size={14} /> Detay
                </button>
                <button className="btn-icon" onClick={() => deleteCampaign(c.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
