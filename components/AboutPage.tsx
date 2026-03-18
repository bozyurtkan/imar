import React from 'react';
import { Scale, BookOpen, Globe, Brain, FileText, Map, Mic, Check, X } from 'lucide-react';

interface AboutPageProps {
    onBack: () => void;
    onGetStarted: () => void;
}

const comparisonRows = [
    { feature: 'Alan uzmanlığı', app: 'Yalnızca imar ve yapı mevzuatı', ai: 'Genel bilgi tabanı' },
    { feature: 'Madde atfı', app: 'Her yanıtta kanun/madde no', ai: 'Sıklıkla eksik veya hatalı' },
    { feature: 'Güncellik', app: 'Resmi Gazete günlük takip', ai: 'Eğitim verisi tarihi ile sınırlı' },
    { feature: 'Hallüsinasyon riski', app: 'Minimize edilmiş', ai: 'Yüksek' },
    { feature: 'İçtihat erişimi', app: 'Gerçek zamanlı web araması', ai: 'Tahmin tabanlı' },
    { feature: 'Belge analizi', app: 'PDF / Word / görüntü yükleyebilir', ai: 'Çoğunlukla desteklenmiyor' },
    { feature: 'Karmaşık vaka analizi', app: 'Derin Düşünce modu', ai: 'Yüzeysel' },
    { feature: 'Veri gizliliği', app: 'Sorgu verileri eğitime kullanılmaz', ai: 'Politika değişkenlik gösterir' },
];

const modes = [
    {
        icon: <BookOpen size={22} />,
        num: '1',
        title: 'Kütüphane Modu',
        desc: 'Kullanıcıların platforma yüklediği PDF, Word veya görüntü formatındaki mevzuat belgelerini analiz eder. Proje dosyaları, özel yönetmelikler veya kuruma özgü belgeler üzerinden madde madde soru sorulabilir. Her yanıt, ilgili kanun maddesiyle etiketlenerek',
        badge: '[MADDE: 3194/18]',
        badgeDesc: 'formatında sunulur.',
    },
    {
        icon: <Globe size={22} />,
        num: '2',
        title: 'Web Arama Modu',
        desc: 'Resmi Gazete, mevzuat.gov.tr, Danıştay karar bankaları ve Bakanlık sitelerini gerçek zamanlı tarayan bu mod; ceza tutarları, harç miktarları ve yıllık güncellenen sayısal veriler dahil güncel bilgilere ulaşır. Yanıtlar, kullanılan kaynakların bağlantılarıyla birlikte sunulur.',
    },
    {
        icon: <Brain size={22} />,
        num: '3',
        title: 'Derin Düşünce Modu',
        desc: 'Çok boyutlu ve karmaşık imar uyuşmazlıkları için tasarlanmış bu mod; modelin içsel çok adımlı muhakeme (chain-of-thought reasoning) yeteneğini web araştırmasıyla birleştirir. Konu tanımından başlayarak yasal dayanak, güncel içtihat, lehte/aleyhte hukuki yorumlar, risk değerlendirmesi ve profesyonel sonuç görüşünü kapsayan yapılandırılmış bir analiz raporu üretir.',
    },
];

const features = [
    {
        icon: <FileText size={20} />,
        title: 'Mevzuat Karşılaştır',
        desc: "Resmi Gazete'de yayımlanan bir düzenlemenin linkini platforma girerek; değişen her maddenin eski ve yeni halini, değişikliğin kapsamını ve etki analizini otomatik olarak görün. Mimarlık, mühendislik ve hukuk ofisleri, kamu çalışanları ve akademisyenler için düzenleme takibinde kritik bir araç.",
    },
    {
        icon: <Globe size={20} />,
        title: 'Resmi Gazete Takibi',
        desc: 'Her gün yayımlanan Resmi Gazete içerikleri otomatik olarak taranır, imar ve yapı mevzuatıyla ilgili maddeler filtrelenir ve yapay zeka tarafından analiz edilerek kullanıcıya sunulur. Hiçbir mevzuat değişikliği gözden kaçmaz.',
    },
    {
        icon: <Map size={20} />,
        title: 'Mevzuat İlişki Grafiği',
        desc: "İmar Kanunu'nun 18. maddesi ile Arazi Düzenlemesi, DOP kesintisi ve kamulaştırma hükümleri arasındaki ilişki nedir? Yüklediğiniz belgedeki maddeler birbirini nasıl etkiliyor? İnteraktif bilgi grafiği, mevzuat maddelerini görsel olarak haritalandırır.",
    },
    {
        icon: <FileText size={20} />,
        title: 'PDF Dışa Aktarma',
        desc: 'Gerçekleştirilen analizler, danışmanlık raporları formatında PDF olarak dışa aktarılabilir. Müvekkile ya da danışana sunulacak hukuki görüş veya proje dosyasına eklenecek teknik rapor tek tıkla hazırlanır.',
    },
    {
        icon: <Mic size={20} />,
        title: 'Sesli Giriş',
        desc: 'Türkçe dil desteğiyle sesli tanıma özelliği; arazi başında, şantiyede veya duruşma hazırlığında elleri dolu çalışan profesyoneller için pratik bir erişim yolu sunar.',
    },
];

const audiences = [
    {
        title: 'Mimarlar ve Şehir Plancıları',
        desc: "İmar planı kararları, yapı nizamı, çekme mesafeleri, emsal ve TAKS/KAKS hesaplamaları; proje geliştirme sürecinde saniyeler içinde yanıt bulur. Planlı Alanlar İmar Yönetmeliği'nin en son halini daima güncel olarak takip edin.",
    },
    {
        title: 'İnşaat Mühendisleri ve Yapı Denetçileri',
        desc: 'Yapı ruhsatı, iskân, teknik uygulama sorumluluğu, yapı denetim yükümlülükleri ve sahada karşılaşılan mevzuat sorunlarına anlık çözüm. Otopark Yönetmeliği, Sığınak Yönetmeliği ve Deprem Yönetmeliği dahil tüm teknik mevzuat kapsama alınmıştır.',
    },
    {
        title: 'Hukukçular ve Avukatlar',
        desc: 'İmar iptali davaları, kamulaştırma uyuşmazlıkları, yıkım kararlarına itiraz ve idari yargı süreçlerinde Danıştay içtihadına gerçek zamanlı erişim. Dilekçe ve hukuki görüş hazırlığını hızlandıran madde atıflı analizler.',
    },
    {
        title: 'Belediyeler ve Kamu Kurumları',
        desc: 'İmar, ruhsat ve şehircilik müdürlükleri; karar süreçlerinde mevzuat yorumunu hızlandırır. Bakanlık genelgeleri, değişen yönetmelikler ve Danıştay bozma kararları anlık takip edilir.',
    },
    {
        title: 'Gayrimenkul Değerleme Uzmanları',
        desc: 'Taşınmazın imar durumu, yapılaşma koşulları, yasal riskleri ve mevzuat değişikliklerinin değere etkisi; ekspertiz raporları için güvenilir kaynak.',
    },
    {
        title: 'Akademisyenler ve Öğrenciler',
        desc: 'Mimarlık, şehir ve bölge planlama, hukuk ve mühendislik öğrencileri için tez ve makale araştırmalarında derinlemesine kaynak tarama.',
    },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onBack, onGetStarted }) => {
    return (
        <div className="landing-page min-h-screen relative overflow-hidden bg-dark-bg">
            {/* Background glow effects — same as BlogPage */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-warm-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Navbar */}
            <nav className="landing-nav" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                <div className="landing-container landing-nav-inner">
                    <div
                        className="landing-nav-brand cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                            window.history.pushState({}, '', '/');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                    >
                        <div className="landing-nav-logo">
                            <Scale size={20} className="text-white" />
                        </div>
                        <span className="landing-nav-title">İmar Mevzuat</span>
                    </div>
                    <div className="landing-nav-actions">
                        <button onClick={onBack} className="landing-btn-ghost font-semibold text-warm-300 hover:text-accent mr-2">
                            ← Geri
                        </button>
                        <button onClick={onGetStarted} className="landing-btn-primary">
                            Hemen Başlayın
                        </button>
                    </div>
                </div>
            </nav>

            <div className="relative z-10">

                {/* ── Hero ── */}
                <section className="landing-container pt-20 pb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
                        <Scale size={14} className="text-accent" />
                        <span className="text-accent text-xs font-semibold tracking-wide uppercase">Hakkında</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-warm-100 leading-tight mb-6">
                        İmar Mevzuat
                    </h1>
                    <p className="text-warm-300 text-lg leading-relaxed mb-4">
                        Türkiye'nin imar ve yapı mevzuatı alanında faaliyet gösteren mimar, mühendis, hukukçu, yapı denetçisi ve kamu kurumu uzmanlarına özel olarak geliştirilmiş <strong className="text-warm-100">yapay zekâ destekli profesyonel mevzuat danışmanlık platformudur.</strong>
                    </p>
                    <p className="text-warm-400 text-base leading-relaxed">
                        3194 sayılı İmar Kanunu başta olmak üzere Planlı Alanlar İmar Yönetmeliği, Yapı Denetimi Kanunu, Kentsel Dönüşüm mevzuatı, Otopark ve Sığınak Yönetmelikleri ile güncel Resmi Gazete düzenlemelerini kapsayan platform; onlarca yıllık birikim gerektiren mevzuat bilgisine <strong className="text-warm-300">saniyeler içinde, madde atıflı ve kaynak gösterimli</strong> erişim imkânı sunar.
                    </p>
                </section>

                <div className="landing-container max-w-4xl mx-auto pb-24 space-y-20">

                    {/* ── Neden İmar Mevzuat ── */}
                    <section>
                        <h2 className="text-2xl font-bold text-warm-100 mb-4 border-l-4 border-accent pl-4">Neden İmar Mevzuat?</h2>
                        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 space-y-4">
                            <p className="text-warm-300 leading-relaxed">
                                Türkiye'de imar mevzuatı; kanunlar, yönetmelikler, tebliğler, Danıştay içtihatları ve sürekli güncellenen Resmi Gazete kararlarıyla son derece dinamik bir yapıya sahiptir. Bu yapı içinde doğru bilgiye ulaşmak, yanlış yorumun ciddi hukuki ve mali sonuçlar doğurabildiği bir alanda, uzman düzeyinde mevzuat takibini zorunlu kılmaktadır.
                            </p>
                            <p className="text-warm-300 leading-relaxed">
                                Genel amaçlı yapay zeka araçları (ChatGPT, Gemini ve benzerleri) bu alanda ciddi bir yetersizlik sergilemektedir: eğitim verisi güncel olmayabilir, madde numaraları yanlış verilebilir, içtihatlar uydurulabilir. <strong className="text-warm-100">İmar Mevzuat, bu problemi köküyle çözmek için tasarlanmıştır.</strong>
                            </p>
                        </div>
                    </section>

                    {/* ── Platform Nasıl Çalışır ── */}
                    <section>
                        <h2 className="text-2xl font-bold text-warm-100 mb-6 border-l-4 border-accent pl-4">Platform Nasıl Çalışır?</h2>
                        <p className="text-warm-400 mb-8 leading-relaxed">
                            İmar Mevzuat, en gelişmiş dil modeli altyapısı üzerine inşa edilmiştir. Platform üç temel mod üzerinden çalışır:
                        </p>
                        <div className="space-y-4">
                            {modes.map((mode) => (
                                <div key={mode.num} className="bg-dark-surface border border-dark-border rounded-2xl p-6 flex gap-5">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                        {mode.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{mode.num}</span>
                                            <h3 className="text-warm-100 font-semibold">{mode.title}</h3>
                                        </div>
                                        <p className="text-warm-400 text-sm leading-relaxed">
                                            {mode.desc}
                                            {mode.badge && (
                                                <> <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs font-mono">{mode.badge}</code> {mode.badgeDesc}</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Öne Çıkan Özellikler ── */}
                    <section>
                        <h2 className="text-2xl font-bold text-warm-100 mb-6 border-l-4 border-accent pl-4">Öne Çıkan Özellikler</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {features.map((f) => (
                                <div key={f.title} className="bg-dark-surface border border-dark-border rounded-2xl p-5 flex gap-4">
                                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                        {f.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-warm-100 font-semibold text-sm mb-1">{f.title}</h3>
                                        <p className="text-warm-400 text-sm leading-relaxed">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Kimler Kullanır ── */}
                    <section>
                        <h2 className="text-2xl font-bold text-warm-100 mb-6 border-l-4 border-accent pl-4">Kimler Kullanır?</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {audiences.map((a) => (
                                <div key={a.title} className="bg-dark-surface border border-dark-border rounded-2xl p-5">
                                    <h3 className="text-warm-100 font-semibold text-sm mb-2 flex items-start gap-2">
                                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                                            <Check size={10} className="text-accent" />
                                        </span>
                                        {a.title}
                                    </h3>
                                    <p className="text-warm-400 text-sm leading-relaxed pl-6">{a.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Karşılaştırma Tablosu ── */}
                    <section>
                        <h2 className="text-2xl font-bold text-warm-100 mb-6 border-l-4 border-accent pl-4">Genel Yapay Zekadan Farkı</h2>
                        <div className="overflow-x-auto rounded-2xl border border-dark-border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-dark-surface border-b border-dark-border">
                                        <th className="text-left text-warm-400 font-medium px-5 py-3 w-1/3">Kriter</th>
                                        <th className="text-left text-accent font-semibold px-5 py-3 w-1/3">İmar Mevzuat</th>
                                        <th className="text-left text-warm-500 font-medium px-5 py-3 w-1/3">Genel Yapay Zeka</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonRows.map((row, i) => (
                                        <tr key={row.feature} className={`border-b border-dark-border last:border-0 ${i % 2 === 0 ? 'bg-dark-bg/40' : ''}`}>
                                            <td className="px-5 py-3 text-warm-300 font-medium">{row.feature}</td>
                                            <td className="px-5 py-3">
                                                <span className="flex items-start gap-1.5 text-warm-200">
                                                    <Check size={14} className="text-accent flex-shrink-0 mt-0.5" />
                                                    {row.app}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="flex items-start gap-1.5 text-warm-500">
                                                    <X size={14} className="text-warm-600 flex-shrink-0 mt-0.5" />
                                                    {row.ai}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ── Teknik Altyapı ── */}
                    <section>
                        <h2 className="text-2xl font-bold text-warm-100 mb-4 border-l-4 border-accent pl-4">Teknik Altyapı</h2>
                        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                            <p className="text-warm-300 leading-relaxed">
                                Platform; ileri düzey büyük dil modelleri (LLM), <strong className="text-warm-200">Firebase</strong> kimlik doğrulama ve veri altyapısı, <strong className="text-warm-200">Cloudflare</strong> edge network ve <strong className="text-warm-200">Vercel</strong> dağıtım sistemi üzerine inşa edilmiştir. <strong className="text-warm-200">React 19</strong> ile geliştirilmiş arayüz; masaüstü, tablet ve mobil cihazlarda sorunsuz çalışır. Tüm iletişim uçtan uca şifreleme ile korunur; kullanıcı sorguları ve yüklenen belgeler üçüncü taraflarla paylaşılmaz.
                            </p>
                        </div>
                    </section>

                    {/* ── Başlamak İçin / CTA ── */}
                    <section className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-warm-100 mb-3">Başlamak İçin</h2>
                        <p className="text-warm-300 mb-2 leading-relaxed max-w-lg mx-auto">
                            Hesap oluşturmak ücretsizdir ve kredi kartı gerektirmez. Tüm özellikler — Derin Düşünce, Mevzuat Karşılaştır, Resmi Gazete takibi ve Mevzuat Grafiği dahil — ücretsiz hesapla deneme amaçlı kullanılabilir.
                        </p>
                        <p className="text-warm-400 text-sm mb-6">
                            Destek ve kurumsal lisans: <a href="mailto:bilgi@imarmevzuat.com.tr" className="text-accent hover:underline">bilgi@imarmevzuat.com.tr</a>
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="landing-btn-primary text-base px-8 py-3"
                        >
                            30 Saniyede Başlayın →
                        </button>
                    </section>

                    {/* ── Yasal Uyarı ── */}
                    <p className="text-warm-600 text-xs text-center leading-relaxed border-t border-dark-border pt-8">
                        İmar Mevzuat; hukuki tavsiye niteliği taşımaz. Platform, bilgilendirme ve araştırma amacıyla tasarlanmıştır. Somut hukuki süreçler için yetkili hukuk danışmanına başvurulması önerilir.
                    </p>

                </div>
            </div>

            {/* Footer */}
            <footer className="landing-footer mt-auto relative z-10">
                <div className="landing-container landing-footer-inner !py-8 text-center border-t border-dark-border">
                    <p className="text-warm-500 text-sm">© 2026 İmar Mevzuat — Tüm hakları saklıdır.</p>
                </div>
            </footer>
        </div>
    );
};
