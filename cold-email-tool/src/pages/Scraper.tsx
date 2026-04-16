import { useState } from 'react';
import { Search, Download, Zap, Loader } from 'lucide-react';

export default function Scraper() {
  const [city, setCity] = useState('Gaziantep');
  const [category, setCategory] = useState('inşaat firmaları');
  const [maxResults, setMaxResults] = useState(50);
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const startScrape = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/scraper/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, category, maxResults }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const enrichAll = async () => {
    setEnriching(true);
    try {
      const res = await fetch('/api/scraper/enrich-all', { method: 'POST' });
      const data = await res.json();
      setResult((prev: any) => ({
        ...prev,
        enrichResult: data,
      }));
    } catch (err: any) {
      setError(err.message);
    }
    setEnriching(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Lead Scraper</h2>
        <p>Google Maps üzerinden işletme verilerini Apify ile çekin</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Arama Parametreleri</h3>
          </div>

          <div className="form-group">
            <label>Şehir</label>
            <input
              className="form-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Örn: Gaziantep"
            />
          </div>

          <div className="form-group">
            <label>Sektör / Kategori</label>
            <input
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Örn: inşaat firmaları"
            />
            <div className="form-hint">
              Örnek aramalar: yapı denetim, mimar, müteahhit
            </div>
          </div>

          <div className="form-group">
            <label>Maksimum Sonuç</label>
            <input
              className="form-input"
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              min={5}
              max={200}
            />
            <div className="form-hint">
              Düşük tutmak Apify kredisinden tasarruf sağlar.
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={startScrape}
            disabled={loading || !city || !category}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <Loader className="spinner" size={16} style={{ border: 'none', animation: 'spin 0.8s linear infinite' }} />
                Scraping devam ediyor...
              </>
            ) : (
              <>
                <Search size={16} />
                Scrape Başlat
              </>
            )}
          </button>

          {loading && (
            <div className="alert alert-info mt-4">
              Apify actor çalışıyor. Bu işlem 2-5 dakika sürebilir. Lütfen bekleyin...
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sonuçlar</h3>
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          {!result && !error && !loading && (
            <div className="empty-state">
              <Search size={48} />
              <h3>Scrape başlatın</h3>
              <p>Sol panelden şehir ve sektör girerek başlayın</p>
            </div>
          )}

          {result && (
            <>
              <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="stat-card blue">
                  <div className="stat-label">Toplam Çekilen</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                    {result.totalScraped}
                  </div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Kaydedilen</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                    {result.saved}
                  </div>
                </div>
              </div>

              <div className="alert alert-success">
                {result.withEmail} işletmede email adresi bulundu.
                {result.saved - result.withEmail > 0 && (
                  <span>
                    {' '}
                    {result.saved - result.withEmail} işletmede email yok — "Web Sitelerinden Bul" ile taranabilir.
                  </span>
                )}
              </div>

              {result.enrichResult && (
                <div className="alert alert-info mt-2">
                  Web sitesi taramasında {result.enrichResult.enriched}/{result.enrichResult.total} işletmede email bulundu.
                </div>
              )}

              <button
                className="btn btn-secondary mt-2"
                onClick={enrichAll}
                disabled={enriching}
                style={{ width: '100%' }}
              >
                {enriching ? (
                  <>
                    <Loader size={16} />
                    Web siteleri taranıyor...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Email'siz Leadleri Web Sitelerinden Bul
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
