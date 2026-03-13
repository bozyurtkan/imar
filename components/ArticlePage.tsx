import React, { useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Scale } from 'lucide-react';

interface ArticlePageProps {
    onBack: () => void;
    slug?: string;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ onBack, slug }) => {
    // SEO: Structured Data (Article Schema)
    useEffect(() => {
        const schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Müstakil Ev Sahiplerine İmar Müjdesi: Garaj ve Rüzgarlıkta Ruhsat Süreci Bitti!",
            "image": "https://imarmevzuat.com.tr/images/planli-alanlar.jpg",
            "author": {
                "@type": "Organization",
                "name": "İmar Mevzuat"
            },
            "publisher": {
                "@type": "Organization",
                "name": "İmar Mevzuat",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://imarmevzuat.com.tr/favicon.svg"
                }
            },
            "datePublished": "2026-01-14",
            "dateModified": "2026-03-13",
            "description": "Planlı Alanlar İmar Yönetmeliği 2026 değişikliği ile müstakil konutlarda ruhsatsız garaj ve rüzgarlık yapımı dönemi başladı. Detaylı uzman analizi."
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.innerHTML = JSON.stringify(schema);
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return (
        <div className="landing-page min-h-screen relative overflow-hidden bg-dark-bg">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-warm-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Navbar */}
            <nav className="landing-nav" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                <div className="landing-container landing-nav-inner flex items-center justify-between h-16 sm:h-20">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-warm-300 hover:text-accent font-semibold transition-colors bg-dark-surface/50 px-4 py-2 rounded-xl backdrop-blur-sm"
                    >
                        <ArrowLeft size={18} />
                        <span>Ana Sayfaya Dön</span>
                    </button>
                    <div className="landing-nav-brand flex items-center gap-2">
                        <Scale size={20} className="text-accent" />
                        <span className="font-bold text-warm-50 tracking-wide text-lg">İmar Mevzuat</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 relative z-10">
                <article className="mt-8">
                    {/* Header */}
                    <div className="mb-10 text-center space-y-4">
                        <div className="flex items-center justify-center gap-4 text-xs sm:text-sm font-medium text-warm-400 mb-6">
                            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20 uppercase tracking-widest">
                                Mevzuat Analizi
                            </span>
                            <span className="flex items-center gap-1.5 border border-dark-border px-3 py-1 rounded-full"><Calendar size={14} /> 14 Ocak 2026</span>
                            <span className="flex items-center gap-1.5 border border-dark-border px-3 py-1 rounded-full"><Clock size={14} /> 8 dk okuma</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-warm-50 tracking-tight leading-[1.15]">
                            Müstakil Ev Sahiplerine İmar Müjdesi:<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover inline-block mt-2">Garaj ve Rüzgarlıkta Ruhsat Süreci Bitti!</span>
                        </h1>
                    </div>

                    {/* Featured Image */}
                    <div className="w-full aspect-[16/9] mb-12 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-dark-border/50 relative group">
                        <div className="absolute inset-0 bg-accent/5 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                        <img
                            src="/images/planli-alanlar.jpg"
                            alt="Bağımsız Bölüm Eklentileri Garaj ve Rüzgarlık"
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>

                    {/* Content Body */}
                    <div className="prose prose-invert prose-lg max-w-none text-warm-300
                        prose-headings:text-warm-50 prose-headings:font-bold prose-headings:tracking-tight
                        prose-a:text-accent hover:prose-a:text-accent-hover prose-a:font-semibold prose-a:no-underline
                        prose-strong:text-warm-100 prose-strong:font-bold
                        prose-blockquote:bg-dark-surface/50 prose-blockquote:border-accent prose-blockquote:not-italic prose-blockquote:shadow-lg prose-blockquote:rounded-r-xl prose-blockquote:py-2
                        prose-ul:marker:text-accent
                        prose-li:my-1
                    ">

                        <h3 className="text-2xl mt-12 mb-6">Giriş</h3>
                        <p>
                            Evimize küçük ancak hayatımızı kolaylaştıran eklemeler yapmak istediğimizde, imar mevzuatının karmaşık yapısıyla ve uzun ruhsat süreçleriyle karşılaşırız. Ancak 14 Ocak 2026 tarihli Resmi Gazete'de yayımlanan <strong>Planlı Alanlar İmar Yönetmeliği</strong> değişikliği ile müstakil ev sahiplerine çok güzel bir haber geldi! Artık bahçenize portatif bir garaj yapmak veya kapınızın önüne kışın soğuğu kesecek bir rüzgarlık eklemek için belediyeden "yapı ruhsatı" beklemenize gerek yok.
                        </p>
                        <p>
                            Peki, herkes bahçesine dilediği gibi garaj yapabilir mi? Hangi kurallara uymak gerekiyor? Gelin hem ev sahiplerinin rahatlıkla anlayacağı dilden hem de bir imar uzmanının dikkat edeceği teknik detaylarla bu yeniliği inceleyelim.
                        </p>

                        <hr className="border-dark-border my-10" />

                        <h3 className="text-2xl mt-10 mb-6">Kimler Bu Düzenlemeden Yararlanabilir?</h3>
                        <p>
                            Bu yeni haktan faydalanabilmek için en önemli şart; bulunduğunuz parselde <strong>sadece sizin evinizin (tek bir bağımsız bölümün) yer almasıdır.</strong> Yani, apartman bahçeleri veya birden fazla konutun yer aldığı arsalar bu kapsama girmiyor.
                        </p>

                        <blockquote>
                            <strong className="text-accent flex items-center gap-2 mb-2"><Scale size={18} />Önemli Not:</strong> Eğer eviniz bir site içinde yer alan müstakil bir yapıysa, 634 sayılı Kat Mülkiyeti Kanunu gereği mutlaka çevrenizdeki diğer ev sahiplerinden (kat maliklerinden) görsel ve yapısal bütünlüğü bozmamak adına onay (muvafakat) almanız zorunludur.
                        </blockquote>

                        <hr className="border-dark-border my-10" />

                        <h3 className="text-2xl mt-10 mb-6">Neler Yapabilirsiniz? Düzenlemenin Şartları Neler?</h3>

                        <h4 className="text-xl text-warm-100 mt-8 mb-4">1. Aracınız İçin Sökülüp Takılabilir Garaj (Otopark Örtüsü)</h4>
                        <p>Arabanızı güneşten ve kardan korumak için bahçenize sundurma tarzı bir garaj inşa edebilirsiniz ancak şu kurallara kesinlikle uymalısınız:</p>
                        <ul className="space-y-3 bg-dark-surface/30 p-6 rounded-2xl border border-dark-border mt-4 mb-8">
                            <li><strong className="text-accent-hover">Büyüklüğü:</strong> Sadece sizin evinize tahsis edilen zorunlu otopark büyüklüğü kadar olabilir (Otopark Yönetmeliği uyarınca).</li>
                            <li><strong className="text-accent-hover">Açıklık ve Yükseklik:</strong> Yapacağınız garajın iç yüksekliği en fazla <strong>3.00 metre</strong> olmalı ve garajın en az iki tarafı tamamen açık olmalıdır. (Yani etrafını kapatıp kapalı bir kutu haline getiremezsiniz).</li>
                            <li><strong className="text-accent-hover">Malzemesi:</strong> En önemli husus malzemedir! Tuğla, beton gibi kalıcı bir imalat kullanmak kesinlikle yasaktır. Yangına dayanıklı, metal profillerden oluşan ve istendiğinde <strong>kolayca sökülüp takılabilen (portatif)</strong> hafif örtüler (mesh sistemler, branda, sac vb.) tercih edilmelidir.</li>
                        </ul>

                        <h4 className="text-xl text-warm-100 mt-8 mb-4">2. Evin Girişine Rüzgarlık (Giriş Holü)</h4>
                        <p>Kışın rüzgarın ve soğuğun doğrudan içeri girmesini engellemek, kapı önüne korunaklı bir ön alan yaratmak artık çok daha basit:</p>
                        <ul className="space-y-3 bg-dark-surface/30 p-6 rounded-2xl border border-dark-border mt-4 mb-8">
                            <li><strong className="text-accent-hover">Büyüklüğü:</strong> Rüzgarlığın taban alanı en fazla <strong>7 metrekare</strong> olabilir. İç yüksekliği de aynı şekilde <strong>3.00 metreyi</strong> geçmemelidir.</li>
                            <li><strong className="text-accent-hover">Malzemesi:</strong> Bu alan da tıpkı garaj gibi hafif malzemeden, sökülebilir özellikte olmalı ve evinizin doğrudan dışarı açılan ön kapısına inşa edilmelidir (örneğin hafif profilli portatif camlama sistemleri).</li>
                        </ul>

                        <hr className="border-dark-border my-10" />

                        <h3 className="text-2xl mt-10 mb-6 flex items-center gap-3">
                            <span className="bg-accent/20 p-2 rounded-lg text-accent"><Scale size={24} /></span> Bir İmar Uzmanı Olarak Analiz ve Uyarılarım
                        </h3>
                        <p>
                            Belediyelerin iş yükünü azaltan ve vatandaşa rahat bir nefes aldıran bu muafiyet, pratikte çok dikkatli uygulanmalıdır. Hem ev sahiplerinin hem de bu uygulamaları yapacak ustaların/mimarların aşağıdaki hayati uyarılara dikkat etmesi gerekir:
                        </p>
                        <ol className="space-y-4 pl-0 mt-6 marker:font-bold marker:text-accent">
                            <li className="pl-4"><strong>Taşıyıcı Sisteme Asla Zarar Vermeyin:</strong> Kuracağınız garajın veya rüzgarlığın montajı sırasında, kesinlikle evinizin taşıyıcı sistemine (kolon, kiriş, perde beton) ekstra bir yük bindirmemelisiniz. Aksi takdirde masum bir ekleme yüzünden evinizin deprem dayanımını riske atmış olursunuz.</li>
                            <li className="pl-4"><strong>Sınırlarınızı İhlal Etmeyin ve Yangın Güvenliğini Sağlayın:</strong> Yapılan imalatlar komşu parsele ya da yola kesinlikle taşmamalıdır. Ayrıca uygulamalar esnasında yangın tahliye senaryoları ve can güvenliği tedbirleri mutlak suretle ön planda tutulmalıdır.</li>
                            <li className="pl-4"><strong>Kalıcı İmalata Çevirme Hatası (Kaçak Yapı Riski):</strong> Uygulamada karşılaşılan en büyük hata; hafif konstrüksiyonla kurulan bu alanların zaman içinde tuğla veya betonla örülerek kapalı, yalıtımlı odalara dönüştürülmesidir. Denetimlerde veya bir şikayet sonucu bu durum tespit edilirse, yapınız <strong>"kaçak yapı"</strong> konumuna düşer ve İmar Kanunu’nun 32. ve 42. maddeleri gereği hukuki işlem (yıkım kararı ve oldukça ağır idari para cezaları) ile karşı karşıya kalabilirsiniz.</li>
                        </ol>

                        <div className="bg-dark-elevated p-8 rounded-3xl border border-dark-border mt-12 mb-8 text-center shadow-xl">
                            <h3 className="text-xl text-warm-50 font-bold mb-4 mt-0">Sonuç Olarak</h3>
                            <p className="text-warm-300 mb-0">
                                Yönetmeliğe eklenen bu madde, doğru kullanıldığında müstakil ev sahipleri ve yapılaşma pratikliği açısından harika bir fırsattır. Evinizi güzelleştirirken kalıcı ve ağır inşai faaliyetlerden uzak durun, sökülebilir ve estetik malzemeleri tercih edin. Değişikliğin tüm yapı sektörüne ve mülk sahiplerine hayırlı olmasını dileriz.
                            </p>
                        </div>
                    </div>
                </article>
            </div>

            <footer className="landing-footer mt-12">
                <div className="landing-container landing-footer-inner !py-8 text-center border-t border-dark-border">
                    <p className="text-warm-500 text-sm">© 2026 İmar Mevzuat — Tüm hakları saklıdır.</p>
                </div>
            </footer>
        </div>
    );
};
