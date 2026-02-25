import React, { useState, useEffect } from 'react';
import {
  Scale, ArrowRight, ChevronDown, ChevronUp, BookOpen, Brain, Shield,
  FileText, Search, Globe, Sparkles, MessageSquare, Lock, Zap, Users,
  Building, Gavel, Mail, Phone, MapPin, Github, Linkedin, Twitter
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenLegal?: (tab: string) => void;
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


export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onOpenLegal }) => {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

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
    const timer = setInterval(() => {
      setCurrentModuleIndex((prev) => (prev + 1) % modulesInfo.length);
    }, 4500);
    return () => clearInterval(timer);
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
            <span className="landing-nav-title">İmarMevzuat.ai</span>
          </div>
          <div className="landing-nav-actions">
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
              <Zap size={14} />
              <span>Türkiye'nin İlk ve Tek İmar Mevzuatı Yapay Zekası</span>
            </div>
            <h1 className="landing-hero-title">
              İmar Mevzuatını<br />
              <span className="landing-hero-title-accent">Yapay Zekayla Çözün.</span><br />
              Saniyeler İçinde.
            </h1>
            <p className="landing-hero-desc">
              50'den fazla kanun, yönetmelik ve genelge tek bir portalda. Halüsinasyon riskini minimuma indiren,
              madde atıflı kesin yanıtlar veren Türkiye'nin ilk ve tek imar mevzuatı yapay zekası.
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
              <a href="mailto:info@imarmevzuat.ai" className="landing-btn-outline landing-btn-lg">
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
                <span className="landing-mockup-title">İmarMevzuat.ai</span>
              </div>
              <div className="landing-mockup-body">
                <div className="landing-mockup-msg landing-mockup-msg-user">
                  <p>3194 Sayılı Kanun 18. madde nedir?</p>
                </div>
                <div className="landing-mockup-msg landing-mockup-msg-ai">
                  <div className="landing-mockup-ai-badge">
                    <Shield size={10} /> MEVZUAT YANITI
                  </div>
                  <p>
                    3194 Sayılı İmar Kanunu'nun 18. maddesi, arazi ve arsa
                    düzenlemesi hakkındadır. Bu madde, imar planlarının
                    uygulanması sırasında düzenleme ortaklık payı (DOP)
                    kesintisini düzenler...
                  </p>
                  <div className="landing-mockup-refs">
                    <span>📎 Madde 18/1</span>
                    <span>📎 Madde 18/2</span>
                  </div>
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

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-container">
          <h2 className="landing-section-title">Neden İmarMevzuat.ai?</h2>
          <p className="landing-section-subtitle">
            Genel yapay zekalar imar sorunuza doğru cevap veremez. Biz veririz — her yanıtımız kanun maddesiyle desteklenir.
          </p>
          <div className="landing-features-list">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`landing-feature-item ${expandedFeature === i ? 'expanded' : ''}`}
                onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
              >
                <div className="landing-feature-header">
                  <div className="landing-feature-icon">{feature.icon}</div>
                  <span className="landing-feature-title">{feature.title}</span>
                  <div className="landing-feature-chevron">
                    {expandedFeature === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
                {expandedFeature === i && (
                  <div className="landing-feature-body">
                    <p>{feature.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>



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
            <span className="landing-footer-title">İmarMevzuat.ai</span>
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
            <p>© 2026 İmarMevzuat.ai — Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
