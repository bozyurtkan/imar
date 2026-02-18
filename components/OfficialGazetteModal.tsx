import React, { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, ExternalLink, Settings, X, Loader2, Calendar, FileCheck, AlertCircle } from 'lucide-react';
import { resmiGazeteService, GazetteReport, USER_INTERESTS_DEFAULT } from '../services/resmiGazeteService';
import { useAuth } from '../contexts/AuthContext';
import { saveUserSettings, loadUserSettings } from '../services/firebase';

interface OfficialGazetteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OfficialGazetteModal: React.FC<OfficialGazetteModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<GazetteReport | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [interests, setInterests] = useState(USER_INTERESTS_DEFAULT);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Load cached report first
            const cached = resmiGazeteService.getCachedReport();
            const today = new Date().toISOString().split('T')[0];

            if (cached) {
                // Cache validation: If cached report is from a previous day, don't show it as "current" effectively, 
                // but showing yesterday's report is better than nothing until user refreshes.
                // However, user expects "Daily" tracking.
                setReport(cached);
            }

            // Load settings
            const loadSettings = async () => {
                // Always attempt to load from Firestore, even if user is null.
                // The loadUserSettings function should handle the case of a null user.
                const settings = await loadUserSettings(user?.uid); // Pass user.uid or undefined
                if (settings && settings.resmiGazeteInterests) {
                    setInterests(settings.resmiGazeteInterests);
                }
            };

            loadSettings();
        }
    }, [isOpen, user]);

    const handleScan = async () => {
        setLoading(true);
        setError(null);
        try {
            // true -> Cache'i del ve taze veri çek (forceRefresh)
            const newReport = await resmiGazeteService.checkResmiGazete(interests, true);
            setReport(newReport);
        } catch (e: any) {
            setError(e.message || "Tarama sırasında bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        // Always attempt to save to Firestore, even if user is null.
        // The saveUserSettings function should handle the case of a null user.
        await saveUserSettings(user?.uid, { resmiGazeteInterests: interests }); // Pass user.uid or undefined
        setShowSettings(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay p-4" onClick={onClose}>
            <div
                className="bg-dark-tertiary border border-dark-border w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-dark-border flex items-center justify-between bg-dark-secondary">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                            <ScrollText size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-warm-50 text-lg">Resmi Gazete Takip</h3>
                            <p className="text-xs text-warm-400">Yapay Zeka Destekli Günlük Analiz</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!showSettings && (
                            <button
                                onClick={() => setShowSettings(true)}
                                className="p-2 hover:bg-dark-surface text-warm-400 hover:text-warm-50 rounded-xl transition-colors"
                                title="İlgi Alanı Ayarları"
                            >
                                <Settings size={18} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-dark-surface rounded-xl transition-colors">
                            <X size={20} className="text-warm-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 flex flex-col bg-dark-primary relative">

                    {showSettings ? (
                        <div className="p-6 flex-1 overflow-y-auto animate-in">
                            <h4 className="text-sm font-bold text-warm-100 mb-4 flex items-center gap-2">
                                <Settings size={16} className="text-accent" />
                                Takip Edilecek Konular
                            </h4>
                            <p className="text-xs text-warm-500 mb-4">
                                Yapay zeka, Resmi Gazete'deki yüzlerce başlık arasından sadece burada belirttiğiniz konularla ilgili olanları seçip analiz edecektir.
                            </p>
                            <textarea
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                className="w-full h-64 bg-dark-surface border border-dark-border rounded-xl p-4 text-sm text-warm-50 focus:border-accent/50 focus:outline-none resize-none font-mono leading-relaxed"
                                placeholder="İlgi alanlarınızı buraya yazın..."
                            />
                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-4 py-2 text-xs font-bold text-warm-400 hover:text-warm-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={saveSettings}
                                    className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-lg shadow-accent/20 transition-all"
                                >
                                    Ayarları Kaydet
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0 flex flex-col">
                            {/* Dashboard Status Bar */}
                            <div className="p-4 border-b border-dark-border bg-dark-surface/50 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-xs text-warm-400">
                                        <Calendar size={14} />
                                        <span>{report ? `Rapor Tarihi: ${report.date}` : `Bugün: ${new Date().toLocaleDateString('tr-TR')}`}</span>
                                    </div>
                                    {report && (
                                        <div className="flex items-center gap-2 text-xs text-warm-400">
                                            <FileCheck size={14} className="text-green-500" />
                                            <span>Tespit Edilen: <strong className="text-warm-50">{report.relevantArticles.length}</strong> / {report.totalArticles}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleScan}
                                    disabled={loading}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${loading
                                        ? 'bg-dark-elevated text-warm-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-900/20'
                                        }`}
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    {loading ? 'Taranıyor...' : 'Şimdi Tara'}
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="m-4 p-4 bg-red-900/20 border border-red-800/50 rounded-xl flex items-center gap-3 text-red-400 text-xs">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            {/* Main Feed */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar space-y-4">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                                        <Loader2 size={40} className="text-accent animate-spin" />
                                        <p className="text-sm text-warm-400 animate-pulse">Resmi Gazete taranıyor ve analiz ediliyor...</p>
                                        <p className="text-xs text-warm-600">Bu işlem 1-2 dakika sürebilir.</p>
                                    </div>
                                ) : !report ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <div className="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center mb-4 text-warm-500">
                                            <ScrollText size={32} />
                                        </div>
                                        <h4 className="text-warm-200 font-bold mb-2">Henüz tarama yapılmadı</h4>
                                        <p className="text-xs text-warm-500 max-w-xs">Bugünün Resmi Gazete içeriğini taramak ve ilgi alanlarınıza uygun maddeleri bulmak için "Şimdi Tara" butonuna basın.</p>
                                    </div>
                                ) : report.relevantArticles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <div className="w-16 h-16 bg-warm-900/20 rounded-full flex items-center justify-center mb-4 text-warm-500">
                                            <FileCheck size={32} />
                                        </div>
                                        <h4 className="text-warm-200 font-bold mb-2">İlgili İçerik Bulunamadı</h4>
                                        <p className="text-xs text-warm-500 max-w-xs">Bugün yayınlanan Resmi Gazete'de, seçtiğiniz ilgi alanlarına uygun bir düzenleme tespit edilemedi.</p>
                                    </div>
                                ) : (
                                    report.relevantArticles.map((article, i) => (
                                        <div key={i} className="bg-dark-surface border border-dark-border rounded-xl p-5 hover:border-warm-700 transition-all animate-in" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <h4 className="text-base font-bold text-warm-50 leading-snug">{article.title}</h4>
                                                <a
                                                    href={article.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-dark-elevated hover:bg-dark-border text-accent rounded-lg transition-colors flex-shrink-0"
                                                    title="Resmi Gazete'de Aç"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            </div>

                                            {article.analysis ? (() => {
                                                const sections = [
                                                    { key: 'ÖZET', color: 'text-accent', bg: 'bg-accent/10 border-accent/30', label: 'ÖZET' },
                                                    { key: 'HUKUKİ YORUM', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', label: 'HUKUKİ YORUM' },
                                                    { key: 'ETKİ', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'ETKİ' },
                                                    { key: 'TAVSİYE', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'TAVSİYE' },
                                                ];
                                                const cleanText = article.analysis.replace(/\*\*/g, '').replace(/\*/g, '');
                                                const sectionRegex = new RegExp(`(${sections.map(s => s.key).join('|')}):`, 'gi');
                                                const parts = cleanText.split(sectionRegex).filter(p => p.trim());
                                                const parsed: { label: string; color: string; bg: string; content: string }[] = [];
                                                for (let i = 0; i < parts.length; i++) {
                                                    const matched = sections.find(s => s.key === parts[i].trim().toUpperCase());
                                                    if (matched && i + 1 < parts.length) {
                                                        parsed.push({ label: matched.label, color: matched.color, bg: matched.bg, content: parts[i + 1].trim() });
                                                        i++;
                                                    }
                                                }
                                                if (parsed.length === 0) {
                                                    return <div className="text-sm text-warm-300 bg-dark-primary/50 p-4 rounded-lg border border-dark-border/50 leading-relaxed">{cleanText}</div>;
                                                }
                                                return (
                                                    <div className="space-y-3">
                                                        {parsed.map((section, idx) => (
                                                            <div key={idx} className={`rounded-xl border p-4 ${section.bg}`}>
                                                                <span className={`inline-block text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md border mb-2 ${section.bg} ${section.color}`}>
                                                                    {section.label}
                                                                </span>
                                                                <p className="text-sm text-warm-200 leading-relaxed">{section.content}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })() : (
                                                <p className="text-xs text-warm-500 italic">Analiz bekleniyor...</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-dark-secondary border-t border-dark-border flex justify-center">
                    <p className="text-[10px] text-warm-600 flex items-center gap-1">
                        Bu veriler bilgilendirme amaçlıdır, resmi dayanak olarak kullanılamaz.
                    </p>
                </div>
            </div>
        </div>
    );
};
