import React, { useState } from 'react';
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
    icon: <Brain size={20} />,
    title: "Yapay Zeka Destekli Mevzuat Analizi",
    desc: "Gelişmiş yapay zeka modelleri ile imar mevzuatını anlık analiz edin. Karmaşık maddeleri basit ve anlaşılır şekilde yorumlayın."
  },
  {
    icon: <Search size={20} />,
    title: "Anlamsal Arama Gücü",
    desc: "Anahtar kelime değil, anlam bazlı arama yapın. Sorularınızı doğal dilde sorun, en uygun mevzuat maddelerini bulun."
  },
  {
    icon: <FileText size={20} />,
    title: "Belge Yükleme ve Analiz",
    desc: "PDF, DOCX ve görsel formatlarında mevzuat belgeleri yükleyin. Yapay zeka belgeleri otomatik olarak işlesin."
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Yapay Zeka ile Sohbet Deneyimi",
    desc: "Kıdemli bir hukuk danışmanıyla konuşuyormuş gibi mevzuat sorularınızı sorun. Bağlam duyarlı, atıflı yanıtlar alın."
  },
  {
    icon: <Globe size={20} />,
    title: "Web Destekli Güncel Bilgiye Erişim",
    desc: "Online arama modu ile güncel mevzuat değişikliklerini ve Resmi Gazete duyurularını anında takip edin."
  },
  {
    icon: <Sparkles size={20} />,
    title: "Derin Düşünce Modu",
    desc: "Çok adımlı analiz gerektiren karmaşık sorular için gelişmiş muhakeme motoru. Çapraz referans kontrolü ve detaylı hukuki değerlendirme."
  },
  {
    icon: <Lock size={20} />,
    title: "Gizlilik ve Güvenlik",
    desc: "Belgeleriniz ve sohbet geçmişiniz şifreli olarak saklanır. Verileriniz yalnızca size aittir."
  },
  {
    icon: <Gavel size={20} />,
    title: "Mevzuat Karşılaştırma",
    desc: "Farklı mevzuat metinlerini yan yana karşılaştırın. Değişiklikleri ve farkları otomatik tespit edin."
  }
];

const stats = [
  { value: "50+", label: "Mevzuat ve Yönetmelik" },
  { value: "Gemini 2.0", label: "Yapay Zeka Modeli" },
  { value: "7/24", label: "Anlık Erişim" },
  { value: "100%", label: "Güvenli Bulut" }
];


export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onOpenLegal }) => {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

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
              <span>Türkiye'nin 1 Numaralı İmar Mevzuatı Yapay Zekası</span>
            </div>
            <h1 className="landing-hero-title">
              Yeni Nesil<br />
              <span className="landing-hero-title-accent">AI İmar Mevzuatı</span><br />
              Asistanı
            </h1>
            <p className="landing-hero-desc">
              Gelişmiş Muhakeme Yeteneği, Akıllı Mevzuat Analizi, Belge Yükleme
              ve Semantik Arama ile Profesyonel İmar Mevzuatı Desteği.
            </p>

            <div className="landing-hero-quote">
              <div className="landing-hero-quote-mark">"</div>
              <p>
                İmar mevzuatı konusunda en güncel ve doğru bilgiye hızla ulaşmak
                isteyen profesyoneller için vazgeçilmez bir araç.
              </p>
              <div className="landing-hero-quote-author">
                <div className="landing-hero-quote-avatar">
                  <Building size={16} />
                </div>
                <span>İmar Profesyonelleri İçin Tasarlandı</span>
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
          <div className="landing-stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="landing-stat-card">
                <div className="landing-stat-value">{stat.value}</div>
                <div className="landing-stat-label">{stat.label}</div>
              </div>
            ))}
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

      {/* Technology Section */}
      <section className="landing-tech">
        <div className="landing-container">
          <h2 className="landing-section-title">Teknoloji Altyapısı</h2>
          <p className="landing-section-subtitle">
            En güncel ve güvenilir teknolojilerle desteklenmektedir.
          </p>
          <div className="landing-tech-grid">
            {[
              { name: "Google AI", icon: <Sparkles size={22} /> },
              { name: "Gemini 2.0", icon: <Brain size={22} /> },
              { name: "Firebase", icon: <Shield size={22} /> },
              { name: "Mevzuat.gov.tr", icon: <Building size={22} /> },
              { name: "Resmi Gazete", icon: <FileText size={22} /> }
            ].map((tech, i) => (
              <div key={i} className="landing-tech-card">
                <div className="landing-tech-icon">{tech.icon}</div>
                <span className="landing-tech-name">{tech.name}</span>
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
            <p className="landing-footer-tagline">Yeni Nesil AI İmar Mevzuatı Asistanı</p>
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
