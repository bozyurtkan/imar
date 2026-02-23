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
    title: "Milyonlarca Karar",
    desc: "Mevzuat.gov.tr ve Resmi Gazetede yayımlanan kararlarından oluşan milyonlarca içtihat havuzunda doğal dille arama yapabilirsiniz. Binlerce sayfalık kararları okumak yerine yapay zekanın çıkardığı detaylı karar özetleri ile aradığınız hukuki emsallere saniyeler içinde ulaşın."
  },
  {
    icon: <Brain size={20} />,
    title: "Yapay Zeka",
    desc: "İleri seviye dil modelleriyle desteklenmiş AI tabanlı sohbet asistanımız sayesinde, karmaşık İmar Mevzuat sorularınızı sanki kıdemli bir hukukçuyla konuşuyormuşçasına tartışın. İmar Kanunu ve ilgili yönetmeliklere dayalı, maddelerle desteklenmiş kesin atıflı cevaplar alın."
  },
  {
    icon: <Sparkles size={20} />,
    title: "Derin Düşünce",
    desc: "Çözülmesi zor, çok boyutlu ve birden fazla mevzuat maddesinin aynı anda değerlendirilmesini gerektiren vakalar için tasarlanmış özel muhakeme modudur. Yapay zeka adım adım çalışarak size en detaylı, çapraz kontrollü stratejik analizleri sunar."
  },
  {
    icon: <Zap size={20} />,
    title: "Mevzuat Grafiği",
    desc: "Birbirine atıf yapan yüzlerce kanun, yönetmelik ve tebliğ arasındaki bağlantıları interaktif bir bilgi grafiği üzerinde görsel olarak inceleyin. Hangi maddenin hangi yönetmeliğe dayandığını ve iptalleri bir bakışta görerek hukuki metin trafiğine hakim olun."
  },
  {
    icon: <Gavel size={20} />,
    title: "Mevzuat Karşılaştır",
    desc: "Yürürlükten kaldırılan metinler ile güncel mevzuat arasındaki farkları kelime kelime manuel aramak zorunda kalmayın. Sistemimiz, farklı tarihli metinleri yan yana koyarak eklenen, çıkarılan veya değiştirilen kısımları renk kodlu biçimde doğrudan gösterir."
  },
  {
    icon: <FileText size={20} />,
    title: "Resmi Gazete Takibi",
    desc: "Her gün güncellenen Resmi Gazete veritabanı ile hiçbir yasal değişikliği gözden kaçırmayın. İmar mevzuatı çevresinde gerçekleşen tüm önemli duyurular, iptal kararları veya yeni yönetmelikler anlık olarak sisteminize entegre edilir."
  },
  {
    icon: <Globe size={20} />,
    title: "Güncel Web Araştırma",
    desc: "Mevzuatın ve yargı kararlarının ötesinde, hukuki literatürdeki son gelişmelere, idarelerin paylaşımlarına ve en güncel internet verilerine arama motoru entegrasyonumuzla erişin; araştırmalarınızda her zaman bir adım önde olun."
  }
];

const stats = [
  { value: "Milyonlarca Karar", label: "İçerisinde arama ve karar özetleri" },
  { value: "Yapay Zeka", label: "AI Tabanlı Karar Arama ve Sohbet Sistemi" },
  { value: "Derin Düşünce", label: "Karmaşık süreçler için derinlemesine analiz" },
  { value: "Mevzuat Grafiği", label: "Maddeler arası ilişkileri görselleştirin" },
  { value: "Mevzuat Karşılaştır", label: "Eski ve yeni metinleri yan yana analiz edin" },
  { value: "Resmi Gazete Takibi", label: "Günlük değişiklikleri anında öğrenin" },
  { value: "Güncel Web Araştırma", label: "Arama motoru entegrasyonu ile son dakika bilgileri" }
];


export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onOpenLegal }) => {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  const modulesInfo = [
    {
      text: "Mevzuat.gov.tr ve Resmi Gazetede yayımlanan kararlarından oluşan milyonlarca içtihat havuzunda doğal dille yapay zeka destekli arama yapabilirsiniz.",
      author: "Milyonlarca Karar",
      icon: <BookOpen size={16} />
    },
    {
      text: "İleri seviye dil modelleriyle desteklenmiş AI tabanlı sohbet asistanımız sayesinde, karmaşık İmar Mevzuat sorularınızı tartışın.",
      author: "Yapay Zeka",
      icon: <Brain size={16} />
    },
    {
      text: "Çözülmesi zor ve birden fazla mevzuat maddesinin aynı anda değerlendirilmesini gerektiren vakalar için tasarlanmış çapraz kontrollü muhakeme modu.",
      author: "Derin Düşünce",
      icon: <Sparkles size={16} />
    },
    {
      text: "Birbirine atıf yapan yüzlerce kanun, yönetmelik ve tebliğ arasındaki bağlantıları interaktif bir bilgi grafiği üzerinde görsel olarak inceleyin.",
      author: "Mevzuat Grafiği",
      icon: <Zap size={16} />
    },
    {
      text: "Farklı tarihli metinleri yan yana koyarak eklenen, çıkarılan veya değiştirilen kısımları renk kodlu biçimde doğrudan inceleyip karşılaştırın.",
      author: "Mevzuat Karşılaştır",
      icon: <Gavel size={16} />
    },
    {
      text: "Her gün güncellenen Resmi Gazete veritabanı ile hiçbir yasal değişikliği, iptal kararını veya yeni yönetmeliği gözden kaçırmayın.",
      author: "Resmi Gazete Takibi",
      icon: <FileText size={16} />
    },
    {
      text: "Hukuki literatürdeki son gelişmelere, idarelerin paylaşımlarına ve en güncel internet verilerine arama motoru entegrasyonumuzla erişin.",
      author: "Güncel Web Araştırma",
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
              <span>Türkiye'nin 1 Numaralı ve Tek İmar Mevzuatı Yapay Zekası</span>
            </div>
            <h1 className="landing-hero-title">
              Yeni Nesil<br />
              <span className="landing-hero-title-accent">Ai İmar Mevzuatı</span><br />
              Asistanı
            </h1>
            <p className="landing-hero-desc">
              Gelişmiş Muhakeme Yeteneği, Akıllı Mevzuat Analizi, Belge Yükleme
              ve Semantik Arama ile Profesyonel İmar Mevzuatı Desteği.
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
                Hemen Başlayın
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
              {stats.slice(0, 3).map((stat, i) => (
                <div key={`top-${i}`} className="landing-stat-card">
                  <div className="landing-stat-value">{stat.value}</div>
                  <div className="landing-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="landing-stats-row">
              {stats.slice(3).map((stat, i) => (
                <div key={`bottom-${i}`} className="landing-stat-card">
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
          <h2 className="landing-section-title">Özelliklerimiz</h2>
          <p className="landing-section-subtitle">
            İmar mevzuatı alanında ihtiyacınız olan her şey, tek bir platformda.
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
            İmar Mevzuatında Yapay Zeka Devrimi
          </h2>
          <p className="landing-cta-desc">
            Ücretsiz hesap oluşturun ve İmarMevzuat.ai'nin gücünü keşfedin.
          </p>
          <button onClick={onGetStarted} className="landing-btn-primary landing-btn-lg landing-btn-white">
            <MessageSquare size={18} />
            Ücretsiz Başlayın
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
            <p className="landing-footer-tagline">Yeni Nesil Ai İmar Mevzuatı Asistanı</p>
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
