import { useState, useEffect } from 'react';
import { Trash2, ExternalLink, Search } from 'lucide-react';

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const fetchLeads = () => {
    const params = new URLSearchParams({
      page: String(page), limit: '30', status, search,
    });
    fetch(`/api/leads?${params}`)
      .then((r) => r.json())
      .then((d) => { setLeads(d.leads); setTotal(d.total); });
  };

  useEffect(() => { fetchLeads(); }, [page, status, search]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const selectAll = () => {
    if (selected.size === leads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leads.map((l) => l.id)));
    }
  };

  const bulkStatus = async (newStatus: string) => {
    await fetch('/api/leads/bulk-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], status: newStatus }),
    });
    setSelected(new Set());
    fetchLeads();
  };

  const deleteLead = async (id: number) => {
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    fetchLeads();
  };

  const totalPages = Math.ceil(total / 30);
  const statuses = ['all', 'new', 'sent', 'replied', 'not_interested'];
  const statusLabels: Record<string, string> = {
    all: 'Tümü', new: 'Yeni', sent: 'Gönderildi', replied: 'Cevap Geldi', not_interested: 'İlgisiz',
  };

  return (
    <div>
      <div className="page-header">
        <h2>Lead Yönetimi</h2>
        <p>Toplam {total} lead kayıtlı</p>
      </div>

      <div className="toolbar">
        <div className="search-input" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="İsim, email veya web sitesi ara..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {statuses.map((s) => (
          <button
            key={s}
            className={`filter-btn${status === s ? ' active' : ''}`}
            onClick={() => { setStatus(s); setPage(1); }}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="alert alert-info mb-4">
          {selected.size} lead seçildi —
          <button className="btn btn-sm btn-secondary" style={{ marginLeft: '12px' }} onClick={() => bulkStatus('sent')}>
            Gönderildi Yap
          </button>
          <button className="btn btn-sm btn-secondary" style={{ marginLeft: '6px' }} onClick={() => bulkStatus('replied')}>
            Cevap Geldi
          </button>
          <button className="btn btn-sm btn-secondary" style={{ marginLeft: '6px' }} onClick={() => bulkStatus('not_interested')}>
            İlgisiz
          </button>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" className="checkbox" onChange={selectAll} checked={selected.size === leads.length && leads.length > 0} /></th>
              <th>Firma</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Şehir</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td><input type="checkbox" className="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} /></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{lead.name || '—'}</div>
                  {lead.website && (
                    <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                       target="_blank" rel="noreferrer"
                       style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ExternalLink size={10} /> {lead.website}
                    </a>
                  )}
                </td>
                <td className="truncate">{lead.email || <span className="text-muted">—</span>}</td>
                <td className="text-sm">{lead.phone || '—'}</td>
                <td className="text-sm">{lead.city || '—'}</td>
                <td><span className={`badge badge-${lead.status}`}>{statusLabels[lead.status] || lead.status}</span></td>
                <td>
                  <div className="actions-cell">
                    <button className="btn-icon" title="Sil" onClick={() => deleteLead(lead.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted" style={{ padding: '40px' }}>Henüz lead yok. Scraper sayfasından veri çekin.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Önceki</button>
          <span className="text-sm text-muted">Sayfa {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sonraki →</button>
        </div>
      )}
    </div>
  );
}
