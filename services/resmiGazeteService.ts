import { geminiService } from './geminiService';

// Cloudflare Worker URL - deploy sonrası burası otomatik güncellenecek
// Format: https://resmi-gazete-proxy.<cloudflare-account>.workers.dev
const WORKER_URL = 'https://resmi-gazete-proxy.burakozyurtkan.workers.dev';

export interface GazetteArticle {
    id: number;
    title: string;
    link: string;
    analysis?: string;
}

export interface GazetteReport {
    date: string;
    totalArticles: number;
    relevantArticles: GazetteArticle[];
    lastCheckTime: string;
}

export const USER_INTERESTS_DEFAULT = `
- İmar mevzuatı, planlama, kentsel dönüşüm
- İnşaat, yapı denetim, belediye kararları, planlı alanlar tip sözleşmesi
- İhale Mevzuatı, Yapı, Mal ve Hizmet İşleri genel yönetmelikleri
- Mimar, Mühendis, Yapı Maliyeti
- Çevre ve Şehircilik Bakanlığı tebliğleri
`;

export class ResmiGazeteService {
    private getTodayDateString(): string {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    async checkResmiGazete(customInterests?: string, forceRefresh: boolean = false): Promise<GazetteReport | null> {
        const today = this.getTodayDateString();

        // 1. Cache kontrolü (forceRefresh değilse)
        if (!forceRefresh) {
            const cached = this.getCachedReport();
            if (cached && cached.date === today && cached.relevantArticles.length > 0) {
                console.log("Cache'den yüklendi.");
                return cached;
            }
        }

        console.log('🚀 Cloudflare Worker üzerinden tarama başlıyor...');

        // 2. Cloudflare Worker üzerinden Resmi Gazete fihristini çek
        let articles: GazetteArticle[] = [];
        let totalArticles = 0;

        try {
            const workerUrl = `${WORKER_URL}?tarih=${today}`;
            const response = await fetch(workerUrl);

            if (!response.ok) {
                throw new Error(`Worker hatası: ${response.status}`);
            }

            const data = await response.json() as { date: string; articles: GazetteArticle[]; total: number };
            articles = data.articles || [];
            totalArticles = data.total || 0;
            console.log(`☁️ Worker: ${totalArticles} madde geldi.`);
        } catch (error) {
            console.error("Worker Error:", error);
            throw new Error("Resmi Gazete verileri sunucudan çekilemedi. Lütfen tekrar deneyin.");
        }

        if (totalArticles === 0) {
            return {
                date: today,
                totalArticles: 0,
                relevantArticles: [],
                lastCheckTime: new Date().toLocaleTimeString('tr-TR')
            };
        }

        // 3. Gemini ile ilgili maddeleri filtrele
        console.log('🤖 Gemini filtreliyor...');
        const interests = customInterests || USER_INTERESTS_DEFAULT;
        const relevantIds = await geminiService.filterResmiGazete(articles, interests);
        const relevantArticles = articles.filter(a => relevantIds.includes(a.id));
        console.log(`🎯 ${relevantArticles.length} ilgili madde bulundu.`);

        // 4. Her ilgili maddeyi Gemini ile analiz et
        const analyzedArticles: GazetteArticle[] = [];
        for (const article of relevantArticles) {
            try {
                // Başlık üzerinden analiz (içerik çekme Worker'a eklenebilir ileride)
                const analysis = await geminiService.analyzeResmiGazete(article.title, '');
                analyzedArticles.push({ ...article, analysis });
            } catch (e) {
                console.error(`Analiz hatası: ${article.title}`, e);
                analyzedArticles.push({ ...article, analysis: 'Analiz sırasında hata oluştu.' });
            }
        }

        const report: GazetteReport = {
            date: today,
            totalArticles,
            relevantArticles: analyzedArticles,
            lastCheckTime: new Date().toLocaleTimeString('tr-TR')
        };

        // 5. Cache'e kaydet
        localStorage.setItem('resmi_gazete_last_report', JSON.stringify(report));

        return report;
    }

    getCachedReport(): GazetteReport | null {
        const json = localStorage.getItem('resmi_gazete_last_report');
        return json ? JSON.parse(json) : null;
    }

    async fetchUrlContent(url: string): Promise<string> {
        const response = await fetch('/api/scraper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Sunucu hatası' }));
            throw new Error(err.error || `Sayfa alınamadı: ${response.status}`);
        }

        const { text } = await response.json();
        return text;
    }
}

export const resmiGazeteService = new ResmiGazeteService();
