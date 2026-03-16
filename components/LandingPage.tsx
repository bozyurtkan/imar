import React, { useState, useEffect, useRef } from 'react';
import {
    Scale, ArrowRight, ChevronDown, ChevronUp, BookOpen, Brain, Shield,
    FileText, Search, Globe, Sparkles, MessageSquare, Lock, Zap, Users,
    Building, Gavel, Mail, Phone, MapPin, Github, Linkedin, Twitter
} from 'lucide-react';
import { FAQSection } from './FAQSection';
import { BlogSection } from './BlogSection';

interface LandingPageProps {
    onGetStarted: () => void;
    onOpenLegal?: (tab: string) => void;
    onReadArticle?: (slug: string) => void;
    onOpenBlog?: () => void;
}

const features = [
    {
        icon: <BookOpen size={20} />,
        title: "Araştırma Sürenizi %90 Kısaltın",
        desc: "Binlerce sayfa okumak yerine, milyonlarca içtihat ve Resmi Gazete kararına doğal dille soru sorun. Yapay zeka saniyeler içinde özetlesin. Mevzuat.gov.tr ve Resmi Gazete kararlarından oluşan devasa havuzda aradığınız hukuki emsallere anında ulaşın."
    },
    {
        icon: <Brain size={20} />,
        title: "Kıdemli Bir Hukukçuyla Konuşur Gibi Danışın",
        desc: "Karmaşık imar sorularınıza madde numarası ve kanun atıflı kesin yanıtlar alın. Genel yapay zekalardan farklı olarak halüsinasyon riski minimuma indirilmiştir. İmar Kanunu ve ilgili yönetmeliklere dayalı, maddelerle desteklenmiş güvenilir cevaplar sunar."
    },
    {
        icon: <Sparkles size={20} />,
        title: "Çok Boyutlu Vakaları Tek Seferde Çözün",
        desc: "Birden fazla mevzuatın çapraz kontrolünü gerektiren karmaşık dosyalarda, adım adım muhakeme modu ile stratejik analiz raporu oluşturun. Yapay zeka her mevzuat maddesini ayrı ayrı değerlendirerek size en detaylı, çapraz kontrollü analizleri sunar."
    },
    {
        icon: <Zap size={20} />,
        title: "Mevzuat Haritasını Bir Bakışta Görün",
        desc: "Hangi madde hangi yönetmeliğe atıf yapıyor? İptal edilen hükümler neler? Birbirine atıf yapan yüzlerce kanun, yönetmelik ve tebliğ arasındaki bağlantıları interaktif bilgi grafiği üzerinde görsel olarak inceleyin ve mevzuat ağını saniyede kavrayın."
    },
    {
        icon: <Gavel size={20} />,
        title: "Eski ve Yeni Metinleri Anında Karşılaştırın",
        desc: "Yürürlükten kaldırılan metinler ile güncel mevzuat arasındaki farkları kelime kelime manuel aramak zorunda kalmayın. Farklı tarihli metinleri yan yana koyarak eklenen, çıkarılan veya değiştirilen kısımları renk kodlu biçimde doğrudan görün."
    },
    {
        icon: <FileText size={20} />,
        title: "Hiçbir Değişikliği Kaçırmayın",
        desc: "Günlük güncellenen Resmi Gazete takibi ile yeni yönetmelikler, iptal kararları ve değişiklikler anında önünüze düşsün. İmar mevzuatı çevresindeki tüm önemli duyurular anlık olarak sisteminize entegre edilir."
    },
    {
        icon: <Globe size={20} />,
        title: "Araştırmalarınızda Bir Adım Önde Olun",
        desc: "Mevzuatın ve yargı kararlarının ötesinde, hukuki literatürdeki son gelişmelere, idarelerin paylaşımlarına ve en güncel internet verilerine arama motoru entegrasyonumuzla erişin. Güncel web araştırması ile her zaman en doğru bilgiye sahip olun."
    }
];

const stats = [
    { value: "50+", label: "Kanun, Yönetmelik ve Genelge Tek Portalda" },
    { value: "Türkiye'de Tek", label: "İmar Mevzuatına Özel Yapay Zeka Platformu" },
    { value: "7/24", label: "Kesintisiz Erişim, Anlık Güncelleme" },
    { value: "Madde Atıflı", label: "Her Yanıt Kanun Maddesiyle Desteklenir" }
];

const comparisonData = [
    {
        feature: "İmar Bilgisi Derinliği",
        app: "Sadece İmar Kanunu ve ilgili yönetmeliklerle özel donatılmıştır. İmar terminolojisine tam hakimdir.",
        ai: "İçerikleri geneldir. Yerel ve spesifik imar mevzuatı (DOP, ruhsat süreçleri vb.) bilgisi yüzeysel kalır."
    },
    {
        feature: "Doğruluk ve Kaynak",
        app: "Halüsinasyon riski sıfıra yakındır. Her yanıtını mutlaka bir kanun veya yönetmelik maddesine (Madde X/Y) atıf yaparak verir.",
        ai: "Halüsinasyon riski yüksektir. Bazen mülga (kaldırılmış) kanun maddelerini veya var olmayan içtihatları gerçekmiş gibi sunabilir."
    },
    {
        feature: "Sistem Güncelliği",
        app: "Günlük Resmi Gazete takibi ile çalışır. Değişen, iptal edilen ve en yeni yürürlüğe giren imar mevzuatına anında erişir.",
        ai: "Eğitim verileri belirli bir geçmiş tarihte kesilmiştir. İmar mevzuatındaki son değişikliklerden ve güncel kararlardan habersiz olabilir."
    },
    {
        feature: "Karmaşık Vakaları Çözme",
        app: "\"Derin Düşünme Modu\" sayesinde birden fazla mevzuatı aynı anda analiz eder ve maddeler arası çapraz kontrol sağlar.",
        ai: "Çoklu mevzuat bağlantılarını birleştirmede zorlanır, genellikle tek boyutlu okumalar yaparak bağlamı kaçırır."
    },
    {
        feature: "Veri Gizliliği",
        app: "Yüklediğiniz belgeler ve yaptığınız sorgulamalar, yapay zeka modellerini eğitmek için kesinlikle kullanılmaz. Sunucu tabanlı güvenli bir mimarimiz vardır.",
        ai: "Kullanıcı verileri ve yüklenen dosyalar, genellikle modelin genel eğitim ve geliştirme süreçlerine dahil edilir."
    },
    {
        feature: "Eski ve Yeni Metin Kıyası",
        app: "Mevzuatın eski ve yeni metinleri arasındaki farkları kelime kelime, renk kodlu olarak anında karşınıza getirir.",
        ai: "Metinleri karşılaştırabilse de etki analizi yapamaz ve imar mevzuatı açısından farkların sonucunu doğrudan yorumlayamaz."
    },
    {
        feature: "Canlı Web Entegrasyonu",
        app: "Sadece veritabanı ile sınırlı kalmaz, güncel imar haberlerini, mahkeme kararlarını ve kurum duyurularını eşzamanlı olarak tarar.",
        ai: "Genellikle internet araması yapsa dahi imar mevzuatı kaynaklarını filtrelemekte ve doğru resmi kurumlardan teyit almakta zorlanır."
    },
    {
        feature: "Görsel Bilgi Haritaları (Mevzuat Ağı)",
        app: "İlgili kanun, yönetmelik ve tebliğlerin birbirine nasıl atıf yaptığını interaktif grafiklerle şematize ederek bağlantıları görselleştirir.",
        ai: "Bağlantıları sadece metinsel olarak sıralar. Görsel bir haritalama veya dinamik ilişki ağı (Knowledge Graph) sunamaz."
    }
];

const targetAudienceData = [
    {
        title: "Mimarlar ve Şehir Plancıları",
        desc: "Tasarım, projelendirme ve imar planı hazırlık süreçlerinde karşılaşılan mevzuat engellerini, \"Bu alanda kaç kata izin var? Çekme mesafesi nedir?\" gibi spesifik detayları araştırırken saatler kaybetmek istemeyen tasarımcılar için.",
        icon: <Building size={24} />
    },
    {
        title: "Mühendisler",
        desc: "Ruhsat süreçlerinde, proje onay aşamalarında ve zemin-şantiye uygulamalarında, İmar kanunu, Otopark yönetmeliği, Sığınak yönetmeliği gibi birbirine bağlı yüzlerce sayfayı saniyeler içinde tarayıp kesin bilgiye ulaşmak isteyen mühendisler için.",
        icon: <Zap size={24} />
    },
    {
        title: "Yapı Denetim ve Müteahhitler",
        desc: "Sahada veya ofiste, yapı ruhsatı ve iskan süreçlerinde mevzuata uygunluğu son bir kez hızlıca teyit etmek, ceza ve yaptırım risklerini minimize etmek isteyen şantiye şefleri, yapı denetçileri ve yüklenici firmalar için.",
        icon: <Shield size={24} />
    },
    {
        title: "Hukukçular ve Avukatlar",
        desc: "İmar davaları, iptal davaları, idare hukuku ve gayrimenkul anlaşmazlıkları üzerinde çalışan; ilgili kanun maddelerinin güncel hallerini ve emsal Danıştay/Yargıtay kararlarını yapay zeka ile hızla analiz etmek isteyen hukuk profesyonelleri için.",
        icon: <Scale size={24} />
    },
    {
        title: "Kamu Kurumları",
        desc: "Belediyelerin imar, ruhsat ve şehircilik müdürlüklerinde çalışan memurlar, karar mercileri ve ilgili bakanlık uzmanları için. Başvuruları değerlendirirken güncel mevzuatı saniyeler içinde çapraz sorgulayarak \"hatasız\" karar almak için.",
        icon: <Users size={24} />
    },
    {
        title: "Akademisyenler ve Öğrenciler",
        desc: "Üniversitelerin Mimarlık, Mühendislik ve Hukuk fakültelerinde öğrenim gören öğrenciler ile bu alanda makale/tez araştırması yapan akademisyenler için devasa bir \"dijital mevzuat laboratuvarı\"dır.",
        icon: <BookOpen size={24} />
    },
    {
        title: "Değerleme Uzmanları",
        desc: "Mevcut yapıların imar durumunu, yasal risklerini ve değerini belirlerken güncel mevzuata ve yönetmelik değişimlerine anında erişmek isteyen ekspertiz profesyonelleri için.",
        icon: <Search size={24} />
    }
];


export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onOpenLegal, onReadArticle, onOpenBlog }) => {
    const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentMockupIndex, setCurrentMockupIndex] = useState(0);
    const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
    const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        setVisibleItems((prev) => {
                            const newSet = new Set(prev);
                            newSet.add(index);
                            return newSet;
                        });
                    }
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
        );

        timelineRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    const mockupConversations = [
        // 1. Derin Düşünme / Karmaşık Vaka
        (
            <div key="mock-1" className="flex flex-col gap-4 animate-in fade-in">
                <div className="landing-mockup-msg landing-mockup-msg-user break-words">
                    <p>Bir arsada tevhit işlemi yapılmadan önce belediyenin DOP kesintisi %40 yapılmışsa, tevhit sonrası kalan miktar için tekrar DOP kesilebilir mi?</p>
                </div>
                <div className="landing-mockup-msg landing-mockup-msg-ai delay-1 break-words">
                    <div className="landing-mockup-ai-badge">
                        <Brain size={12} className="text-accent" /> DERİN DÜŞÜNME MODU ANALİZİ
                    </div>
                    <p className="mb-3">İlgili mevzuatları taradım ve şu sonuca ulaştım:</p>
                    <div className="p-3 bg-dark-surface border border-dark-border rounded-lg mb-3">
                        <p className="font-bold text-warm-100 flex items-start gap-2 mb-1">
                            <Scale size={14} className="text-accent mt-1 flex-shrink-0" /> <span className="flex-1 break-words">3194 Sayılı Kanun Madde 18 / Ek Fıkra</span>
                        </p>
                        <p className="text-xs text-warm-300 break-words">
                            Herhangi bir parselden bir defadan fazla düzenleme ortaklık payı alınamaz. Ancak, emsal artışı (nüfus artışı) halinde ilave DOP kesilebilir.
                        </p>
                    </div>
                    <p><strong>Sonuç:</strong> Tevhit sonrası emsal artışı olmuyorsa <strong>ikinci kez DOP kesilemez.</strong></p>
                </div>
            </div>
        ),
        // 2. Belge Yükleme / Mülga Analizi
        (
            <div key="mock-2" className="flex flex-col gap-4 animate-in fade-in">
                <div className="landing-mockup-msg landing-mockup-msg-user break-words">
                    <p>Ekteki pdf üzerinden: Arazi_düzenleme_raporu.pdf, bu rapordaki çekme mesafeleri güncel planlı alanlar imar yönetmeliğine uygun mu?</p>
                </div>
                <div className="landing-mockup-msg landing-mockup-msg-ai delay-1 break-words">
                    <div className="landing-mockup-ai-badge">
                        <FileText size={12} className="text-accent" /> BELGE VE MÜLGA ANALİZİ
                    </div>
                    <p>
                        Raporunuzu inceledim. Yan cephe çekme mesafesi raporda <strong>3 metre</strong> olarak belirtilmiş.
                        Ancak Planlı Alanlar İmar Yönetmeliği Madde 23'e göre (Son Güncelleme: 2024), yan bahçe mesafesi 4 kata kadar olan binalarda en az <strong>3 metre</strong>, 4 kattan sonraki her kat için <strong>0.5 metre</strong> ilave edilir.
                    </p>
                </div>
                <div className="landing-mockup-msg landing-mockup-msg-user delay-2 break-words">
                    <p>Bina 6 katlı olarak projelendirilmiş.</p>
                </div>
                <div className="landing-mockup-msg landing-mockup-msg-ai delay-3 break-words">
                    <p>
                        Bu durumda yan bahçe mesafesi <code className="break-all whitespace-normal">3m + (2 kat × 0.5m) = 4 metre</code> olmalıdır. <strong className="text-red-400">Raporunuzdaki 3 metre ölçüsü güncel mevzuata aykırıdır.</strong>
                    </p>
                </div>
            </div>
        ),
        // 3. Resmi Gazete ve Web Araması
        (
            <div key="mock-3" className="flex flex-col gap-4 animate-in fade-in">
                <div className="landing-mockup-msg landing-mockup-msg-user break-words">
                    <p>Bugünkü Resmi Gazete'de Otopark Yönetmeliği ile ilgili yeni yayınlanan karar nedir?</p>
                </div>
                <div className="landing-mockup-msg landing-mockup-msg-ai delay-1 break-words">
                    <div className="landing-mockup-ai-badge">
                        <Globe size={12} className="text-accent" /> CANLI VERİ TABANI ARAMASI
                    </div>
                    <p>
                        Bugün (27 Şubat 2026) yayımlanan Resmi Gazete verilerine ulaştım.
                    </p>
                    <div className="p-3 bg-dark-surface border border-accent/30 rounded-lg mt-3">
                        <p className="font-bold text-accent mb-1 break-words">
                            Otopark Yönetmeliğinde Değişiklik
                        </p>
                        <p className="text-xs text-warm-200 break-words">
                            Madde 1: Her daire için zorunlu otopark alanı 1'den 2'ye çıkarılan bölgelerde inşaat geçiş süresi 6 ay uzatılmıştır.
                        </p>
                    </div>
                </div>
            </div>
        )
    ];

    const modulesInfo = [
        {
            text: "Binlerce sayfa okumak yerine, milyonlarca içtihat ve Resmi Gazete kararına doğal dille soru sorun. Yapay zeka saniyeler içinde özetlesin.",
            author: "Araştırma Sürenizi %90 Kısaltın",
            icon: <BookOpen size={16} />
        },
        {
            text: "Karmaşık imar sorularınıza madde numarası ve kanun atıflı kesin yanıtlar alın. Halüsinasyon riski minimuma indirilmiştir.",
            author: "Kıdemli Bir Hukukçuyla Konuşur Gibi",
            icon: <Brain size={16} />
        },
        {
            text: "Birden fazla mevzuatın çapraz kontrolünü gerektiren karmaşık dosyalarda, adım adım muhakeme modu ile stratejik analiz raporu oluşturun.",
            author: "Çok Boyutlu Vakaları Tek Seferde Çözün",
            icon: <Sparkles size={16} />
        },
        {
            text: "Hangi madde hangi yönetmeliğe atıf yapıyor? İptal edilen hükümler neler? İnteraktif bilgi grafiği üzerinde mevzuat ağını saniyede kavrayın.",
            author: "Mevzuat Haritasını Bir Bakışta Görün",
            icon: <Zap size={16} />
        },
        {
            text: "Farklı tarihli metinleri yan yana koyarak eklenen, çıkarılan veya değiştirilen kısımları renk kodlu biçimde doğrudan görün.",
            author: "Eski ve Yeni Metinleri Anında Karşılaştırın",
            icon: <Gavel size={16} />
        },
        {
            text: "Günlük güncellenen Resmi Gazete takibi ile yeni yönetmelikler, iptal kararları ve değişiklikler anında önünüze düşsün.",
            author: "Hiçbir Değişikliği Kaçırmayın",
            icon: <FileText size={16} />
        },
        {
            text: "Hukuki literatürdeki son gelişmelere, idarelerin paylaşımlarına ve en güncel internet verilerine arama motoru entegrasyonumuzla erişin.",
            author: "Araştırmalarınızda Bir Adım Önde Olun",
            icon: <Globe size={16} />
        }
    ];

    useEffect(() => {
        const timer1 = setInterval(() => {
            setCurrentModuleIndex((prev) => (prev + 1) % modulesInfo.length);
        }, 4500);
        const timer2 = setInterval(() => {
            setCurrentMockupIndex((prev) => (prev + 1) % mockupConversations.length);
        }, 8500);
        return () => {
            clearInterval(timer1);
            clearInterval(timer2);
        };
    }, []);

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-container landing-nav-inner">
                    <div className="landing-nav-brand">
                        <div className="landing-nav-logo">
                            <Scale size={20} className="text-white" />
                        </div>
                        <span className="landing-nav-title">İmar Mevzuat</span>
                    </div>
                    <div className="landing-nav-actions">
                        <button onClick={onOpenBlog} className="landing-btn-ghost font-semibold text-warm-300 hover:text-accent mr-2">
                            Blog
                        </button>
                        <button onClick={onGetStarted} className="landing-btn-ghost">
                            Giriş Yap
                        </button>
                        <button onClick={onGetStarted} className="landing-btn-primary">
                            Hemen Başlayın <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-glow" />
                <div className="landing-container landing-hero-inner">
                    <div className="landing-hero-content">
                        <div className="landing-hero-badge">
                            <Sparkles size={16} className="text-accent-primary animate-pulse" />
                            <span>Türkiye'nin İlk Üretken Yapay Zekalı İmar Asistanı</span>
                        </div>
                        <h1 className="landing-hero-title">
                            İmar Hukuku ve Mevzuatını<br />
                            <span className="landing-hero-title-accent">Üretken Yapay Zeka ile Çözün.</span><br />
                            İçtihatlara Saniyeler İçinde Ulaşın.
                        </h1>
                        <p className="landing-hero-desc">
                            3194 Sayılı İmar Kanunu, güncel yönetmelikler ve mevzuat kararları tek portaldan karşınızda. Halüsinasyon riskini yok eden,
                            kesin madde atıflı hukuki yanıtlar sunan Türkiye'nin ilk uzman imar mevzuatı asistanı.
                        </p>

                        <div className="landing-hero-quote" style={{ minHeight: '130px', position: 'relative' }}>
                            <div className="landing-hero-quote-mark">"</div>

                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                {modulesInfo.map((mod, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            position: idx === currentModuleIndex ? 'relative' : 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            opacity: idx === currentModuleIndex ? 1 : 0,
                                            visibility: idx === currentModuleIndex ? 'visible' : 'hidden',
                                            transition: 'opacity 0.6s ease-in-out',
                                            pointerEvents: idx === currentModuleIndex ? 'auto' : 'none'
                                        }}
                                    >
                                        <p>{mod.text}</p>
                                        <div className="landing-hero-quote-author">
                                            <div className="landing-hero-quote-avatar">
                                                {mod.icon}
                                            </div>
                                            <span>{mod.author}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="landing-hero-actions">
                            <button onClick={onGetStarted} className="landing-btn-primary landing-btn-lg">
                                <MessageSquare size={18} />
                                Ücretsiz Deneyin — 30 Saniyede Başlayın
                                <ArrowRight size={18} />
                            </button>
                            <a href="mailto:info@imarmevzuat.com.tr" className="landing-btn-outline landing-btn-lg">
                                <Mail size={18} />
                                Bize Ulaşın
                            </a>
                        </div>
                    </div>
                    <div className="landing-hero-visual">
                        <div className="landing-hero-mockup">
                            <div className="landing-mockup-header">
                                <div className="landing-mockup-dots">
                                    <span /><span /><span />
                                </div>
                                <span className="landing-mockup-title">İmar Mevzuat</span>
                            </div>
                            <div className="landing-mockup-body">
                                {/* Invisible spacer block using the largest message to determine native container height without breaking the layout or triggering scrollbars */}
                                <div className="landing-mockup-content invisible pointer-events-none opacity-0" aria-hidden="true">
                                    <div className="flex flex-col gap-4">
                                        <div className="landing-mockup-msg landing-mockup-msg-user break-words">
                                            <p>Ekteki pdf üzerinden: Arazi_düzenleme_raporu.pdf, bu rapordaki çekme mesafeleri güncel planlı alanlar imar yönetmeliğine uygun mu?</p>
                                        </div>
                                        <div className="landing-mockup-msg landing-mockup-msg-ai break-words">
                                            <div className="landing-mockup-ai-badge">
                                                <FileText size={12} className="text-accent" /> BELGE VE MÜLGA ANALİZİ
                                            </div>
                                            <p>
                                                Raporunuzu inceledim. Yan cephe çekme mesafesi raporda <strong>3 metre</strong> olarak belirtilmiş.
                                                Ancak Planlı Alanlar İmar Yönetmeliği Madde 23'e göre (Son Güncelleme: 2024), yan bahçe mesafesi 4 kata kadar olan binalarda en az <strong>3 metre</strong>, 4 kattan sonraki her kat için <strong>0.5 metre</strong> ilave edilir.
                                            </p>
                                        </div>
                                        <div className="landing-mockup-msg landing-mockup-msg-user break-words">
                                            <p>Bina 6 katlı olarak projelendirilmiş.</p>
                                        </div>
                                        <div className="landing-mockup-msg landing-mockup-msg-ai break-words">
                                            <p>
                                                Bu durumda yan bahçe mesafesi <code className="break-all whitespace-normal">3m + (2 kat × 0.5m) = 4 metre</code> olmalıdır. <strong className="text-red-400">Raporunuzdaki 3 metre ölçüsü güncel mevzuata aykırıdır.</strong>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 landing-mockup-content">
                                    {mockupConversations[currentMockupIndex]}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Stats Section */}
            <section className="landing-stats">
                <div className="landing-container">
                    <div className="landing-stats-container">
                        <div className="landing-stats-row">
                            {stats.map((stat, i) => (
                                <div key={`stat-${i}`} className="landing-stat-card">
                                    <div className="landing-stat-value">{stat.value}</div>
                                    <div className="landing-stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section (Timeline) */}
            <section className="landing-features pb-24">
                <div className="landing-container">
                    <div className="text-center mb-16">
                        <h2 className="landing-section-title">Neden İmar Mevzuat?</h2>
                        <p className="landing-section-subtitle mx-auto">
                            Genel yapay zekalar imar sorunuza doğru cevap veremez. Biz veririz — her yanıtımız kanun maddesiyle desteklenir.
                        </p>
                    </div>

                    <div className="landing-timeline">
                        <div className="timeline-line"></div>

                        {features.map((feature, i) => {
                            const isVisible = visibleItems.has(i);
                            const isEven = i % 2 === 0;

                            return (
                                <div
                                    key={i}
                                    ref={(el) => (timelineRefs.current[i] = el)}
                                    data-index={i}
                                    className={`timeline-item ${isEven ? 'timeline-item-left' : 'timeline-item-right'} ${isVisible ? 'is-visible' : ''}`}
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                >
                                    <div className="timeline-content group">
                                        <div className="timeline-dot">
                                            <div className="timeline-dot-inner"></div>
                                        </div>

                                        <div className="timeline-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_30px_-10px_rgba(196,80,26,0.15)] group-hover:border-accent/30 flex items-start gap-5 p-6 sm:p-8 rounded-2xl bg-dark-surface/60 border border-dark-border/60 backdrop-blur-md relative overflow-hidden">
                                            {/* Hover Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                            <div className="timeline-icon flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shadow-[0_0_15px_rgba(196,80,26,0.1)] group-hover:bg-accent group-hover:text-white group-hover:shadow-[0_0_20px_rgba(196,80,26,0.4)] transition-all duration-300">
                                                {feature.icon}
                                            </div>
                                            <div className="timeline-text relative z-10">
                                                <h3 className="text-lg sm:text-xl font-bold text-warm-50 tracking-tight mb-2 group-hover:text-accent transition-colors duration-300">{feature.title}</h3>
                                                <p className="text-warm-300 text-sm leading-relaxed group-hover:text-warm-200 transition-colors duration-300">
                                                    {feature.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="landing-comparison pb-24">
                <div className="landing-container">
                    <h2 className="landing-section-title">İmar Mevzuat vs Genel Yapay Zeka Modelleri</h2>
                    <p className="landing-section-subtitle mb-12">
                        Hayati hukuki kararlarınızı jenerik modellere bırakmayın. Sadece imar hukukuna odaklanmış özel sistemimizin farkını görün.
                    </p>

                    <div className="comparison-wrapper overflow-x-auto custom-scrollbar pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="min-w-[800px] flex flex-col gap-4">

                            {/* Header */}
                            <div className="grid grid-cols-12 px-6 py-2 mb-2">
                                <div className="col-span-4 flex items-center justify-center">
                                    <span className="text-warm-300 font-bold text-sm sm:text-base uppercase tracking-wider opacity-80">Karşılaştırılan Özellik</span>
                                </div>
                                <div className="col-span-4 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3 shadow-[0_0_20px_rgba(196,80,26,0.15)] bg-opacity-50 backdrop-blur-sm">
                                        <Scale size={24} />
                                    </div>
                                    <span className="text-accent font-extrabold text-lg sm:text-xl">İmar Mevzuat</span>
                                </div>
                                <div className="col-span-4 flex flex-col items-center justify-center opacity-60">
                                    <div className="w-12 h-12 rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-center text-warm-300 mb-3 backdrop-blur-sm">
                                        <Brain size={24} />
                                    </div>
                                    <span className="text-warm-300 font-bold text-lg sm:text-xl text-center">Genel Yapay Zeka</span>
                                </div>
                            </div>

                            {/* Body Rows as Cards */}
                            {comparisonData.map((row, idx) => (
                                <div key={idx} className="group grid grid-cols-12 bg-dark-surface/40 hover:bg-dark-surface border border-dark-border hover:border-accent/40 rounded-2xl transition-all duration-300 hover:shadow-[0_12px_30px_-10px_rgba(196,80,26,0.2)] hover:-translate-y-1 relative overflow-hidden backdrop-blur-md">

                                    {/* Subtle Gradient Overlay on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-transparent flex-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                    {/* Feature Column */}
                                    <div className="col-span-4 p-5 sm:p-7 border-r border-dark-border/40 flex items-center justify-center relative z-10 transition-colors duration-300 group-hover:bg-dark-elevated/40">
                                        <span className="text-warm-50 font-bold text-center text-sm sm:text-base group-hover:text-accent transition-colors duration-300">{row.feature}</span>
                                    </div>

                                    {/* İmar Mevzuat Column */}
                                    <div className="col-span-4 p-5 sm:p-7 border-r border-dark-border/40 bg-accent/5 flex items-center text-center relative z-10 transition-colors duration-300 group-hover:bg-accent/10">
                                        <p className="text-warm-100 font-medium text-sm sm:text-sm leading-relaxed mx-auto max-w-[95%]">{row.app}</p>
                                    </div>

                                    {/* Genel YZ Column */}
                                    <div className="col-span-4 p-5 sm:p-7 flex items-center text-center opacity-60 group-hover:opacity-80 transition-opacity duration-300 relative z-10 bg-black/10">
                                        <p className="text-warm-400 text-sm sm:text-sm leading-relaxed mx-auto max-w-[95%]">{row.ai}</p>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>
            </section>

            {/* Target Audience Section */}
            <section className="landing-target-audience pt-12 pb-24">
                <div className="landing-container">
                    <div className="text-center mb-16">
                        <h2 className="landing-section-title">İmar Mevzuat Kimler İçin Tasarlandı?</h2>
                        <p className="landing-section-subtitle mx-auto">
                            İmar ve şehircilik ekosistemindeki tüm profesyonellerin mevzuat araştırma yükünü hafifletmek için özel olarak geliştirildi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {targetAudienceData.map((item, index) => (
                            <div
                                key={index}
                                className={`target-card group relative flex flex-col items-center text-center p-8 sm:p-10 rounded-[2rem] transition-all duration-500 hover:-translate-y-3 z-10 ${index === 6 ? 'md:col-span-2 lg:col-span-3 lg:w-2/3 mx-auto' : ''}`}
                            >
                                {/* Arka Plan ve Cam Efekti */}
                                <div className="absolute inset-0 bg-dark-surface/60 border border-dark-border/60 rounded-[2rem] backdrop-blur-xl transition-all duration-500 group-hover:border-accent/40 group-hover:bg-dark-surface/90 group-hover:shadow-[0_0_40px_-15px_rgba(196,80,26,0.3)] z-0 overflow-hidden">
                                    {/* İç Işıltı Gecişi */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                </div>

                                {/* Alt Parlama Çizgisi */}
                                <div className="absolute inset-x-12 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-2 group-hover:translate-y-0 rounded-t-lg z-0"></div>

                                {/* İçerik */}
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="target-card-icon relative w-20 h-20 rounded-2xl bg-dark-elevated/80 text-warm-300 flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-lg group-hover:bg-accent/10 group-hover:text-accent group-hover:shadow-[0_0_30px_rgba(196,80,26,0.3)] ring-1 ring-dark-border/50 group-hover:ring-accent/30 [&>svg]:w-8 [&>svg]:h-8 [&>svg]:transition-transform [&>svg]:duration-500">
                                        <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-extrabold text-warm-50 mb-4 tracking-tight group-hover:text-accent transition-colors duration-300">{item.title}</h3>
                                    <p className="text-warm-300 text-sm sm:text-base leading-relaxed group-hover:text-warm-100 transition-colors duration-300">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog / E-E-A-T Section */}
            <BlogSection onReadArticle={onReadArticle} onOpenBlog={onOpenBlog} />

            {/* FAQ Section */}
            <FAQSection />

            {/* CTA Section */}
            <section className="landing-cta">
                <div className="landing-container landing-cta-inner">
                    <h2 className="landing-cta-title">
                        İmar Mevzuatını Yapay Zekayla Keşfedin
                    </h2>
                    <p className="landing-cta-desc">
                        Kredi kartı gerekmez. Ücretsiz hesap oluşturun — 30 saniyede başlayın.
                    </p>
                    <button onClick={onGetStarted} className="landing-btn-primary landing-btn-lg landing-btn-white">
                        <MessageSquare size={18} />
                        Ücretsiz Deneyin
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-container landing-footer-inner">
                    <div className="landing-footer-brand">
                        <div className="landing-footer-logo">
                            <Scale size={18} className="text-white" />
                        </div>
                        <span className="landing-footer-title">İmar Mevzuat</span>
                        <p className="landing-footer-tagline">İmar Mevzuatını Yapay Zekayla Çözün. Saniyeler İçinde.</p>
                    </div>
                    <div className="landing-footer-links">
                        <div className="landing-footer-col">
                            <h4>Bizi Takip Edin</h4>
                            <div className="landing-footer-socials">
                                <a href="#" aria-label="LinkedIn"><Linkedin size={18} /></a>
                                <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
                                <a href="#" aria-label="GitHub"><Github size={18} /></a>
                            </div>
                        </div>
                        <div className="landing-footer-col">
                            <h4>Ürün</h4>
                            <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Giriş Yap</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Ücretsiz Dene</a>
                        </div>
                        <div className="landing-footer-col">
                            <h4>Hukuki</h4>
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenLegal?.('hizmet'); }}>Hizmet Şartları</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenLegal?.('aydinlatma'); }}>Gizlilik Politikası</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenLegal?.('mesafeli'); }}>Mesafeli Satış</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenLegal?.('teslimat'); }}>Teslimat ve İade</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenLegal?.('cerez'); }}>Çerez Politikası</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenLegal?.('acik-riza'); }}>Açık Rıza Metni</a>
                        </div>
                        <div className="landing-footer-col">
                            <h4>Kurumsal</h4>
                            <a href="#">Hakkımızda</a>
                            <a href="#">İletişim</a>
                        </div>
                    </div>
                </div>
                <div className="landing-footer-bottom">
                    <div className="landing-container">
                        <p>© 2026 İmar Mevzuat — Tüm hakları saklıdır.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
