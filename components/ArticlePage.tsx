import React, { useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Scale, Building2 } from 'lucide-react';

interface ArticlePageProps {
    onBack: () => void;
    slug?: string;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ onBack, slug }) => {
    const isFireEscape = slug === 'mevcut-binalarda-yangin-merdiveni-esnekligi';
    const isSantiyeM = slug === 'santiye-m-dijital-donusum';
    const isTarimArazisi = slug === 'tarim-arazisi-tad-portal-2026';

    // SEO: Structured Data (Article Schema)
    useEffect(() => {
        const headlines: Record<string, string> = {
            'tarim-arazisi-tad-portal-2026': "Tarım Arazisi İzinlerinde Dijital Dönüşüm: TAD Portal ve 2026 Yönetmeliği",
            'mevcut-binalarda-yangin-merdiveni-esnekligi': "Mevcut Binalarda Yangın Merdiveni Çıkmazı Bitiyor: Bahçe Mesafelerinde Yeni Esneklik!",
            'santiye-m-dijital-donusum': "Şantiye-M Uygulaması ile İnşaat Sektöründe Dijital Dönüşüm: Yeni Şantiye Defteri ve Düzenlemeler",
        };
        const descriptions: Record<string, string> = {
            'tarim-arazisi-tad-portal-2026': "4 Nisan 2026'da yürürlüğe giren yeni yönetmelikle tarım arazisi izinleri TAD Portal üzerinden merkezi sisteme taşındı. Marjinal arazi, çatı GES ve toprak koruma projelerine yönelik yeni kurallar.",
            'mevcut-binalarda-yangin-merdiveni-esnekligi': "Mevcut yapılarda yangın merdiveni zorunluluğu durumunda bahçe mesafesi ihlallerine getirilen 1.50m ve 3.00m istisnaları.",
            'santiye-m-dijital-donusum': "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nın kullanıma sunduğu Şantiye-M yazılımının amacı, kolaylıkları ve sektörel etkileri.",
        };

        const schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": headlines[slug || ''] || "Müstakil Ev Sahiplerine İmar Müjdesi: Garaj ve Rüzgarlıkta Ruhsat Süreci Bitti!",
            "image": isTarimArazisi
                ? "https://imarmevzuat.com.tr/images/tarim-arazisi-2026.png"
                : isSantiyeM
                    ? "https://imarmevzuat.com.tr/images/santiye-m.jpg"
                    : isFireEscape
                        ? "https://imarmevzuat.com.tr/images/yangin-merdiveni.jpg"
                        : "https://imarmevzuat.com.tr/images/planli-alanlar.jpg",
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
            "datePublished": isTarimArazisi ? "2026-04-06" : isSantiyeM ? "2026-03-24" : "2026-01-14",
            "dateModified": isTarimArazisi ? "2026-04-06" : isSantiyeM ? "2026-03-24" : "2026-03-13",
            "description": descriptions[slug || ''] || "Planlı Alanlar İmar Yönetmeliği 2026 değişikliği ile müstakil konutlarda ruhsatsız garaj ve rüzgarlık yapımı dönemi başladı."
        };

        const articleTitles: Record<string, string> = {
            'tarim-arazisi-tad-portal-2026': "Tarım Arazisi TAD Portal 2026",
            'mevcut-binalarda-yangin-merdiveni-esnekligi': "Mevcut Binalarda Yangın Merdiveni Esnekliği",
            'santiye-m-dijital-donusum': "Şantiye-M ile Dijital Dönüşüm",
        };
        const breadcrumb = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Ana Sayfa",
                    "item": "https://imarmevzuat.com.tr/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Makaleler",
                    "item": "https://imarmevzuat.com.tr/makaleler"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": articleTitles[slug || ''] || "Planlı Alanlarda Garaj ve Rüzgarlık Değişikliği",
                    "item": `https://imarmevzuat.com.tr/makale/${slug}`
                }
            ]
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.innerHTML = JSON.stringify(schema);
        document.head.appendChild(script);

        const breadcrumbScript = document.createElement('script');
        breadcrumbScript.type = 'application/ld+json';
        breadcrumbScript.innerHTML = JSON.stringify(breadcrumb);
        document.head.appendChild(breadcrumbScript);

        return () => {
            document.head.removeChild(script);
            document.head.removeChild(breadcrumbScript);
        };
    }, [slug]);

    return (
        <div className="landing-page min-h-screen relative overflow-hidden bg-dark-bg">
            {/* Background Effects */}
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
                        <button
                            onClick={onBack}
                            className="landing-btn-ghost flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            <span>Geri</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 relative z-10">
                <article className="mt-4">
                    {/* Header */}
                    <div className="mb-10 text-center space-y-4">
                        <div className="flex items-center justify-center gap-4 text-xs sm:text-sm font-medium text-warm-400 mb-6">
                            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20 uppercase tracking-widest">
                                {isTarimArazisi ? 'Güncel Değişiklikler' : isSantiyeM ? 'Güncel Değişiklikler' : 'Mevzuat Analizi'}
                            </span>
                            <span className="flex items-center gap-1.5 border border-dark-border px-3 py-1 rounded-full"><Calendar size={14} /> {isTarimArazisi ? '6 Nisan 2026' : isSantiyeM ? '24 Mart 2026' : '14 Ocak 2026'}</span>
                            <span className="flex items-center gap-1.5 border border-dark-border px-3 py-1 rounded-full"><Clock size={14} /> {isTarimArazisi ? '7 dk okuma' : isSantiyeM ? '5 dk okuma' : '8 dk okuma'}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-warm-50 tracking-tight leading-[1.15]">
                            {isTarimArazisi ? (
                                <>Tarım Arazisi İzinlerinde Dijital Dönüşüm:<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover inline-block mt-2">TAD Portal ve 2026 Yönetmeliği</span></>
                            ) : isSantiyeM ? (
                                <>Şantiye-M Uygulaması ile İnşaat Sektöründe Dijital Dönüşüm:<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover inline-block mt-2">Yeni Şantiye Defteri ve Düzenlemeler</span></>
                            ) : isFireEscape ? (
                                <>Mevcut Binalarda Yangın Merdiveni Çıkmazı Bitiyor:<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover inline-block mt-2">Bahçe Mesafelerinde Yeni Esneklik!</span></>
                            ) : (
                                <>Müstakil Ev Sahiplerine İmar Müjdesi:<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover inline-block mt-2">Garaj ve Rüzgarlıkta Ruhsat Süreci Bitti!</span></>
                            )}
                        </h1>
                    </div>

                    {/* Featured Image */}
                    <div className="w-full aspect-[16/9] mb-12 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-dark-border/50 relative group">
                        <div className="absolute inset-0 bg-accent/5 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                        <img
                            src={isTarimArazisi ? "/images/tarim-arazisi-2026.png" : isSantiyeM ? "/hero.jpg" : isFireEscape ? "/images/yangin-merdiveni-sema.jpg" : "/images/planli-alanlar.jpg"}
                            alt={isTarimArazisi ? "Tarım Arazisi İzinleri TAD Portal 2026" : isSantiyeM ? "Şantiye-M Dijital Şantiye Yönetimi" : isFireEscape ? "Mevcut Binaya İlave Yangın Merdiveni" : "Bağımsız Bölüm Eklentileri Garaj ve Rüzgarlık"}
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
                        {isTarimArazisi ? (
                            <>
                                <h3 className="text-2xl font-bold mt-12 mb-6">Giriş</h3>
                                <p className="text-justify">
                                    Türkiye'deki tarım arazilerinin korunması ve kullanımına ilişkin temel mevzuat, 4 Nisan 2026 tarihli ve 20260404-2 sayılı Resmi Gazete ile köklü bir dönüşüme uğradı. 9 Aralık 2017 tarihinden bu yana yürürlükte olan <strong>"Tarım Arazilerinin Korunması, Kullanılması ve Planlanmasına Dair Yönetmelik"</strong> tamamen yürürlükten kaldırılarak yerine tümüyle yeni bir düzenleme getirildi. Yeni yönetmelik yayım tarihinde derhal yürürlüğe girdi; geçiş süreci veya ertelenmiş hüküm bulunmuyor.
                                </p>
                                <p className="text-justify">
                                    İmar mevzuatıyla kesişim noktaları son derece kritik olan bu değişiklik; arazi sahiplerini, müteahhitleri, yatırımcıları ve enerji sektörünü doğrudan ilgilendiriyor. Peki yeni yönetmelik neyi değiştiriyor, hangi süreçler dijitalleşiyor ve sahada nelere dikkat etmek gerekiyor? Gelin ayrıntılı inceleyelim.
                                </p>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6">TAD Portal: Tarım Dışı İzinler Artık Merkezi Sistemde</h3>
                                <p className="text-justify">Yeni yönetmeliğin getirdiği en köklü değişiklik, tarım dışı kullanım (TDK) taleplerinin artık <strong>TAD Portal</strong> adı verilen dijital platform üzerinden yürütülmesi zorunluluğudur. Kâğıt tabanlı başvuruların yol açtığı bürokratik yığılma ve takip güçlükleri bu adımla ortadan kaldırılmak hedefleniyor.</p>
                                <ul className="space-y-3 bg-dark-surface/30 p-6 rounded-2xl border border-dark-border mt-4 mb-8">
                                    <li className="text-justify"><strong className="text-accent-hover">Merkezi Değerlendirme:</strong> Enerji yatırımları, madencilik projeleri ve yenilenebilir enerji tesisleri dahil tüm tarım dışı kullanım talepleri TAD Portal üzerinden toplanarak değerlendiriliyor. Farklı kurumlar arasındaki koordinasyon tek platform üzerinden sağlanıyor.</li>
                                    <li className="text-justify"><strong className="text-accent-hover">Alternatif Alan Zorunluluğu:</strong> Arazi etüt raporlarında alternatif alanların neden tercih edilemeyeceği artık zorunlu olarak belgelenmek zorunda. Tarım arazisi talep eden her proje için "neden başka yer yok?" sorusunun yanıtı dosyada yer almalı.</li>
                                    <li className="text-justify"><strong className="text-accent-hover">İki Ziraat Mühendisi Şartı:</strong> Etüt raporları en az iki ziraat mühendisi tarafından hazırlanmalı ve Ek-3 formatına uygun olmalı. Tek imzalı raporlar artık kabul görmeyecek.</li>
                                </ul>

                                <blockquote>
                                    <strong className="text-accent flex items-center gap-2 mb-2"><Scale size={18} />Önemli Not:</strong> Eski yönetmelik kapsamında başlatılmış ancak henüz sonuçlandırılmamış başvuruların yeni sistem üzerinden mi yoksa eski prosedürle mi tamamlanacağı henüz tebliğ düzeyinde netleşmemiştir. İlgili il tarım müdürlükleriyle iletişime geçilmesi önerilir.
                                </blockquote>

                                <p className="text-justify text-sm bg-dark-surface/40 border border-dark-border rounded-xl p-4 mt-2">
                                    TAD Portal başvuru süreci veya geçiş hükümleri hakkında net bir yanıt arıyorsanız <strong><a href="https://imarmevzuat.com.tr" className="text-accent hover:text-accent-hover" target="_blank" rel="noopener noreferrer">İmar Mevzuat AI Asistanı</a></strong>'na sorabilirsiniz. 50'den fazla güncel mevzuata madde atıflı kesin yanıtlar veriyor.
                                </p>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6">Çatı GES Artık Tarımsal Yapı Sayılıyor</h3>
                                <p className="text-justify">Yenilenebilir enerji sektörü ve tarımsal yapı ruhsatı için kritik bir yenilik: yeni yönetmelik, <strong>çatı güneş enerjisi santrallerini (GES) tarımsal amaçlı yapı</strong> olarak tanımladı. Bu düzenlemenin pratikte üç önemli sonucu var:</p>
                                <ul className="space-y-3 bg-dark-surface/30 p-6 rounded-2xl border border-dark-border mt-4 mb-8">
                                    <li className="text-justify"><strong className="text-accent-hover">Tarım Dışı Kullanım İzni Gerekmez:</strong> Mevcut tarımsal yapıların (sera, ahır, depo vb.) çatısına kurulacak güneş panelleri için ayrıca tarım dışı kullanım izni talep edilmeyecek.</li>
                                    <li className="text-justify"><strong className="text-accent-hover">Yapı Ruhsatı Boyutu:</strong> Çatı GES'in yapı ruhsatı ve statik proje gerektirip gerektirmediği, yapının niteliğine ve ilgili belediye ya da il özel idaresinin yetkisine göre değerlendirilmeye devam edecek.</li>
                                    <li className="text-justify"><strong className="text-accent-hover">Arazi GES Farkı:</strong> Bu kolaylık yalnızca mevcut yapıların çatısı için geçerli. Açık arazi üzerine kurulacak güneş santralleri (zemin GES) tarım dışı kullanım prosedürüne tabi olmaya devam ediyor.</li>
                                </ul>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6">Büyük Ova Koruma Alanlarında Kural Değişmedi, Uygulaması Sıkılaştı</h3>
                                <p className="text-justify">Yönetmeliğin 15. maddesi, Büyük Ova Koruma Alanları için önceki düzenlemenin temel ilkesini korudu: bu alanlarda arazi <strong>hiçbir surette amaç dışında kullanılamaz.</strong> Ancak istisnalar daha sınırlı ve denetimli hale getirildi.</p>
                                <ul className="space-y-2 mb-8">
                                    <li className="text-justify">Tarımsal yapılar (sera, sulama tesisi vb.) belirli koşullarda hâlâ mümkün.</li>
                                    <li className="text-justify">Kamu yararı kararı alınmış projeler için özel değerlendirme prosedürü uygulanacak.</li>
                                    <li className="text-justify">Hangi alanların "Büyük Ova" kapsamında olduğu Cumhurbaşkanlığı kararnamesiyle belirleniyor; güncel listeyi Tarım ve Orman Bakanlığı web sitesinden kontrol etmek gerekiyor.</li>
                                </ul>

                                <p className="text-justify text-sm bg-dark-surface/40 border border-dark-border rounded-xl p-4">
                                    Parselin Büyük Ova kapsamında olup olmadığını ve projenize etkilerini <strong><a href="https://imarmevzuat.com.tr" className="text-accent hover:text-accent-hover" target="_blank" rel="noopener noreferrer">imarmevzuat.com.tr</a></strong> kütüphanesinden anında sorgulayabilirsiniz. Cumhurbaşkanlığı kararname listeleri dahil tüm güncel mevzuat yer almaktadır.
                                </p>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6 flex items-center gap-3">
                                    <span className="bg-accent/20 p-2 rounded-lg text-accent"><Scale size={24} /></span> Bir İmar Uzmanı Olarak Analiz ve Uyarılarım
                                </h3>
                                <p className="text-justify">Yönetmelik değişikliği teknik açıdan doğru bir yönde ilerlese de geçiş sürecinde dikkat edilmesi gereken hususlar var. Arazi sahibi, yatırımcı veya proje müellifi olarak şu noktalara özellikle dikkat edin:</p>
                                <ol className="space-y-4 pl-0 mt-6 marker:font-bold marker:text-accent">
                                    <li className="pl-4 text-justify"><strong>TAD Portal Hazırlığı Yapın:</strong> Yakın dönemde tarım arazisi üzerinde yapı veya tesis planlayanlar, TAD Portal'a kayıt yaptırmalı ve gerekli belgeleri önceden hazırlamalıdır. Sistem yeni olduğundan başvuru yoğunluğunun ilk aylarda gecikmelere yol açabileceğini göz önünde bulundurun.</li>
                                    <li className="pl-4 text-justify"><strong>Etüt Raporu Maliyetleri Arttı:</strong> İki ziraat mühendisi zorunluluğu, etüt raporu hazırlama süresini ve maliyetini doğrudan etkiler. Proje bütçenizi ve takviminizi bu değişikliğe göre revize edin.</li>
                                    <li className="pl-4 text-justify"><strong>İzinsiz Yapılarda Süre Kısadır:</strong> Yönetmeliğin 22. maddesi, izinsiz kullanımda yapının derhal durdurulmasını ve bir ay içinde izin alınmaması durumunda yıkımı öngörüyor. Süre aşıldığında ceza üç katına çıkıyor. Tarım arazisi üzerinde herhangi bir yapım işine izin belgesi tamamlanmadan başlanmamalıdır.</li>
                                    <li className="pl-4 text-justify"><strong>Marjinal Arazi Tanımını Kontrol Edin:</strong> "2 hektardan küçük lokal marjinal tarım arazisi" tanımı, küçük parsellerin proje geliştirilebilirliğini doğrudan etkiliyor. Parselin bu kapsamda değerlendirilip değerlendirilemeyeceğini il tarım müdürlüğüyle teyit etmek uzun izin süreçlerinden kurtarabilir.</li>
                                </ol>

                                <div className="bg-dark-surface/50 border border-dark-border rounded-2xl p-5 mt-6 mb-8">
                                    <p className="text-justify text-sm mb-0">
                                        <strong className="text-warm-100">Projenize özel mevzuat soruları mı var?</strong> İmar Mevzuat AI Asistanı; tarım arazisi izinleri, yapı ruhsatı süreçleri ve tüm imar mevzuatına madde atıflı kesin yanıtlar veriyor. <a href="https://imarmevzuat.com.tr" className="text-accent hover:text-accent-hover font-semibold" target="_blank" rel="noopener noreferrer">imarmevzuat.com.tr</a> üzerinden ücretsiz deneyin.
                                    </p>
                                </div>

                                <div className="bg-dark-elevated p-8 rounded-3xl border border-dark-border mt-12 mb-8 text-center shadow-xl">
                                    <h3 className="text-xl text-warm-50 font-bold mb-4 mt-0">Sonuç Olarak</h3>
                                    <p className="text-warm-300 mb-0 text-justify">
                                        4 Nisan 2026 yönetmeliği, tarım arazisi izin süreçlerini dijitalleştirerek şeffaflığı artırmayı ve tarım dışı kullanım baskısını kontrol altına almayı hedefliyor. TAD Portal'ın etkin çalışması, çatı GES kolaylığı ve toprak koruma proje zorunluluğu gibi yenilikler mevzuatı daha tutarlı bir zemine taşıyor. Tarım arazisi üzerinde proje geliştiriyorsanız veya mevcut yapılarınıza ek tesis planlamak istiyorsanız, yeni yönetmeliği dikkate alarak ilgili uzmanlarla çalışmanızı ve başvurunuzu geciktirmeden TAD Portal üzerinden hazırlamanızı öneririz.
                                    </p>
                                </div>

                                <div className="mt-8 mb-6 text-warm-400 text-sm">
                                    <strong>Kaynak:</strong>{' '}
                                    <a href="https://www.resmigazete.gov.tr/eskiler/2026/04/20260404-2.htm" target="_blank" rel="noopener noreferrer">Resmi Gazete — 4 Nisan 2026 / Tarım Arazilerinin Korunması, Kullanılması ve Planlanmasına Dair Yönetmelik</a>
                                </div>
                            </>
                        ) : isSantiyeM ? (
                            <>
                                <h3 className="text-2xl font-bold mt-12 mb-6">Giriş</h3>
                                <p className="text-justify">
                                    Planlı Alanlar İmar Yönetmeliği ve ilgili mevzuat uyarınca yapı ruhsatına tabi her türlü yapım ve yıkım işinde şantiye şefi çalıştırılması mecburidir. Geleneksel yöntemlerle kâğıt üzerinde tutulan şantiye defterleri ve manuel denetim süreçleri, günümüz veri akışı hızına uyum sağlamakta zorluk çekmekteydi.
                                </p>
                                <p className="text-justify">
                                    Bu ihtiyaca binaen Çevre, Şehircilik ve İklim Değişikliği Bakanlığı tarafından kullanıma sunulan <strong>Şantiye-M Yazılımı</strong>; müteahhitlerin, şantiye şeflerinin ve ilgili idarelerin tüm iş süreçlerini merkezi bir yapıda e-Devlet hizmeti olarak birleştirmeyi amaçlamaktadır. 1 Ocak 2026 tarihi itibarıyla kullanımı kademeli olarak zorunlu hale gelecek olan sistem, "Mobil Şantiye Defteri" dönemini resmen başlatıyor.
                                </p>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6">Şantiye-M'nin Amacı ve Kolaylıkları Neler?</h3>
                                <p className="text-justify">Şantiye-M uygulamasının başlıca amacı; yapı denetim süreçlerini dijitalleştirmek, faaliyetleri kayıt altına almak ve bürokratik yükü hafifletmektir. Sistem aşağıdaki avantajları sağlar:</p>
                                <ul className="space-y-3 bg-dark-surface/30 p-6 rounded-2xl border border-dark-border mt-4 mb-8">
                                    <li className="text-justify"><strong className="text-accent-hover">Dijital Kayıt ve Takip:</strong> Şantiye şefleri; işin ilerleyişini, günlük faaliyet raporlarını, personel ve ekipman durumlarını dijital olarak kayıt altına alabilir.</li>
                                    <li className="text-justify"><strong className="text-accent-hover">e-Devlet Entegrasyonu:</strong> Tek tıkla şantiyelere dair tüm ruhsat, proje ve geçmiş deneyim bilgilerine erişim imkânı tanır. Evrak yığılması ve fiziksel arşiv zorunluluğu ortadan kalkar.</li>
                                    <li className="text-justify"><strong className="text-accent-hover">Modüler Yönetim:</strong> Şantiye şefinin yasal metrekare kotası ve üstlendiği iş limitleri sistem tarafından otomatik hesaplanarak limit aşımlarının baştan önüne geçilir.</li>
                                </ul>

                                <blockquote>
                                    <strong className="text-accent flex items-center gap-2 mb-2"><Scale size={18} />Önemli Not:</strong> Mesleki Yeterlilik Kurumu (MYK) ve MEB onaylı yapı ustaları sisteme kaydedilecek; ustalık belgesi bulunmayan kişilerin şantiyelerde çalıştırılması sistem üzerinden engellenecektir.
                                </blockquote>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6 flex items-center gap-3">
                                    <span className="bg-accent/20 p-2 rounded-lg text-accent"><Scale size={24} /></span> Bir İmar Uzmanı Olarak Analiz ve Uyarılarım
                                </h3>
                                <p className="text-justify">Belediyelerin iş yükünü azaltan ve şeffaflığı sağlayan bu uygulamanın sahada kusursuz yürümesi için şantiye şeflerinin ve müteahhitlerin aşağıdaki uyarılara dikkat etmesi gerekir:</p>

                                <ol className="space-y-4 pl-0 mt-6 marker:font-bold marker:text-accent">
                                    <li className="pl-4 text-justify"><strong>Verilerin Zamanında Girilmesi:</strong> Günlük faaliyet raporları, işe yeni giren veya işten ayrılan personelin bilgileri (7 iş günü içinde) zamanında işlenmelidir. Aksi durumda yasal bildirim süreleri aşılarak idari para cezası verilebilir.</li>
                                    <li className="pl-4 text-justify"><strong>Yetki Belgesi Kontrolleri:</strong> Taşeron firmalarla çalışırken ekiplerin MYK belgeleri mutlaka teyit edilmeli, sisteme girişte uyumsuzluk yaratacak durumlardan kaçınılmalıdır.</li>
                                    <li className="pl-4 text-justify"><strong>Denetimlerin Elektronik İşlenmesi:</strong> Ruhsat vermeye yetkili idareler tarafından yapılan şantiye şefi denetimlerinin ve tespitlerin Bakanlık sistemine eş zamanlı düştüğü unutulmamalıdır.</li>
                                </ol>

                                <div className="bg-dark-elevated p-8 rounded-3xl border border-dark-border mt-12 mb-8 text-center shadow-xl">
                                    <h3 className="text-xl text-warm-50 font-bold mb-4 mt-0">Sonuç Olarak</h3>
                                    <p className="text-warm-300 mb-0 text-justify">
                                        Şantiye-M uygulaması, sektörün kağıt israfından, bürokratik gecikmelerden ve veri kaybından kurtulması adına hayati bir adımdır. Yeni sisteme hızlıca entegre olan müteahhit ve şantiye şefleri, kanuni sorumluluklarını çok daha güvenilir ve profesyonel bir yolla ispatlama şansına sahip olacaktır. Tüm sektör profesyonellerine dijital inşaat döneminde başarılar dileriz.
                                    </p>
                                </div>

                                <div className="mt-8 mb-6 text-warm-400 text-sm">
                                    <strong>Kaynak:</strong>{' '}
                                    <a href="https://www.imo.org.tr/Eklenti/9135,santiyem-kullanici-kilavuzu251230181820pdf.pdf?0" target="_blank" rel="noopener noreferrer">IMO / ÇŞB Uygulama Kılavuzu</a>
                                </div>
                            </>
                        ) : isFireEscape ? (
                            <>
                                <h3 className="text-2xl font-bold mt-12 mb-6">Giriş</h3>
                                <p className="text-justify">
                                    Eski binalarda yapılan tadilatlar veya mevzuat değişiklikleri nedeniyle "yangın merdiveni zorunluluğu" doğduğunda, bina sahipleri ve yöneticileri çoğu zaman teknik bir imkansızlıkla karşı karşıya kalıyordu: Bina içinde yer yok, dışarıda ise bahçe mesafeleri (çekme mesafeleri) engel teşkil ediyor. 14 Ocak 2026 tarihli Resmi Gazete'de yayımlanan yönetmelik değişikliği, bu krizi can güvenliğini önceliğe alarak çözüme kavuşturuyor.
                                </p>
                                <p className="text-justify">
                                    Peki, mevcut binanıza dışarıdan yangın merdiveni eklemek istediğinizde bahçeye ne kadar taşabilirsiniz? Hangi şartlar aranıyor? Gelin, hem bina sakinlerinin hem de uzmanların merak ettiği detaylara imar hukuku perspektifiyle bakalım.
                                </p>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6">Yangın Merdiveni Eklentisinde "Mesafe" Devrimi</h3>
                                <p className="text-justify">Bugüne kadar yan ve arka bahçelerde çekme mesafelerini ihlal etmek neredeyse imkansızdı. Yeni düzenleme ile <strong>can ve mal güvenliğini teminen</strong> şu istisnalar getirilmiştir:</p>
                                <ul className="space-y-3 bg-dark-surface/30 p-6 rounded-2xl border border-dark-border mt-4 mb-8">
                                    <li className="text-justify"><strong className="text-accent-hover">Yan ve Arka Bahçelerde:</strong> Eğer bina içinde tadilatla yangın merdiveni yapılamıyorsa; parsel sınırına <strong>en az 1.50 metre</strong> mesafe bırakmak kaydıyla yan ve arka bahçe mesafeleri içinde yangın merdiveni yapılabilir.</li>
                                    <li className="text-justify"><strong className="text-accent-hover">Ön Bahçelerde:</strong> Parsel sınırına (yola) <strong>en az 3.00 metre</strong> mesafe bırakılması şartıyla ön bahçe alanına da yangın merdiveni inşa edilebilir.</li>
                                </ul>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6">Hangi Durumlarda Bu Haktan Yararlanılabilir?</h3>
                                <p className="text-justify">Bu düzenleme sadece yeni yapılan binalar için değil, özellikle <strong>mevcut binalar</strong> için bir kurtarıcıdır:</p>
                                <ul className="space-y-2 mb-8">
                                    <li>Mevzuat değişikliği nedeniyle yangın merdiveni zorunlu hale gelmişse,</li>
                                    <li>Binadaki yükseklik, kat veya alan artışları yangın güvenliği ihtiyacını doğurmuşsa,</li>
                                    <li>Yapının kullanım amacı değişmişse (Örneğin konuttan işyerine veya otele dönüşüm gibi).</li>
                                </ul>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6 flex items-center gap-3">
                                    <span className="bg-accent/20 p-2 rounded-lg text-accent"><Scale size={24} /></span> Bir İmar Uzmanı Olarak Teknik Analiz ve Uyarılarım
                                </h3>
                                <p className="text-justify">Bu esneklik mülk sahipleri için büyük bir kolaylık olsa da, ruhsat sürecinde ve uygulamada dikkat edilmesi gereken hayati noktalar vardır:</p>
                                <ol className="space-y-4 pl-0 mt-6 marker:font-bold marker:text-accent">
                                    <li className="pl-4 text-justify"><strong>Önce İç Çözüm Zorunluluğu:</strong> Belediyeye başvurduğunuzda mimari projeniz incelenir. Eğer bina içerisinde yangın merdiveni yapılabilecek bir alan varsa, bahçeye çıkmanıza izin verilmeyecektir.</li>
                                    <li className="pl-4 text-justify"><strong>Yangın Yönetmeliği Koşulları:</strong> Planlı Alanlar İmar Yönetmeliği mesafeyi esnetse de, imalatın kendisi <strong>"Binaların Yangından Korunması Hakkında Yönetmelik"</strong>teki teknik koşullara harfiyen uymak zorundadır.</li>
                                    <li className="pl-4 text-justify"><strong>Parsel Sınırı İhlali Riski:</strong> Yan bahçede 1.50 metre, ön bahçede 3.00 metre kuralı hayati önemdedir. Bu mesafelerin altına düşülmesi durumunda komşu parselin hakları ihlal edilmiş sayılır.</li>
                                    <li className="pl-4 text-justify"><strong>Tadilat Ruhsatı Şartı:</strong> Bu işlem için mutlaka ilgili belediyeden <strong>"Tadilat Ruhsatı"</strong> alınmalıdır. Kendi başınıza yaptırmanız sizi hukuki sorumluluk altına sokar.</li>
                                </ol>

                                <div className="bg-dark-elevated p-8 rounded-3xl border border-dark-border mt-12 mb-8 text-center shadow-xl">
                                    <h3 className="text-xl text-warm-50 font-bold mb-4 mt-0">Sonuç Olarak</h3>
                                    <p className="text-warm-300 mb-0 text-justify">
                                        Can güvenliği, imar çekme mesafelerinden daha önceliklidir. Bu yeni madde ile binalarımızı deprem kadar yangın riskine karşı da güçlendirmek için önemli bir hukuki zemin oluşmuştur. Binanızda böyle bir ihtiyaç varsa, uzman bir mimardan mevcut projeniz üzerinden analiz yapmasını talep edin.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold mt-12 mb-6">Giriş</h3>
                                <p className="text-justify">
                                    Evimize küçük ancak hayatımızı kolaylaştıran eklemeler yapmak istediğimizde, imar mevzuatının karmaşık yapısıyla ve uzun ruhsat süreçleriyle karşılaşırız. Ancak 14 Ocak 2026 tarihli Resmi Gazete’de yayımlanan <strong>Planlı Alanlar İmar Yönetmeliği</strong> değişikliği ile müstakil ev sahiplerine çok güzel bir haber geldi! Artık bahçenize portatif bir garaj yapmak veya kapınızın önüne kışın soğuğu kesecek bir rüzgarlık eklemek için belediyeden "yapı ruhsatı" beklemenize gerek yok.
                                </p>
                                <p className="text-justify">
                                    Peki, herkes bahçesine dilediği gibi garaj yapabilir mi? Hangi kurallara uymak gerekiyor? Gelin hem ev sahiplerinin rahatlıkla anlayacağı dilden hem de bir imar uzmanının dikkat edeceği teknik detaylarla bu yeniliği inceleyelim.
                                </p>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6">Kimler Bu Düzenlemeden Yararlanabilir?</h3>
                                <p className="text-justify">
                                    Bu yeni haktan faydalanabilmek için en önemli şart; bulunduğunuz parselde <strong>sadece sizin evinizin (tek bir bağımsız bölümün) yer almasıdır.</strong> Yani, apartman bahçeleri veya birden fazla konutun yer aldığı arsalar bu kapsama girmiyor.
                                </p>

                                <blockquote>
                                    <strong className="text-accent flex items-center gap-2 mb-2"><Scale size={18} />Önemli Not:</strong> Eğer eviniz bir site içinde yer alan müstakil bir yapıysa, 634 sayılı Kat Mülkiyeti Kanunu gereği mutlaka çevrenizdeki diğer ev sahiplerinden (kat maliklerinden) görsel ve yapısal bütünlüğü bozmamak adına onay (muvafakat) almanız zorunludur.
                                </blockquote>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6">Neler Yapabilirsiniz? Düzenlemenin Şartları Neler?</h3>

                                <h4 className="text-xl font-bold text-warm-100 mt-8 mb-4">1. Aracınız İçin Sökülüp Takılabilir Garaj (Otopark Örtüsü)</h4>
                                <p className="text-justify">Arabanızı güneşten ve kardan korumak için bahçeye sundurma tarzı bir garaj inşa edebilirsiniz ancak şu kurallara kesinlikle uymalısınız:</p>
                                <ul className="space-y-3 bg-dark-surface/30 p-6 rounded-2xl border border-dark-border mt-4 mb-8">
                                    <li className="text-justify"><strong className="text-accent-hover">Büyüklüğü:</strong> Sadece sizin evinize tahsis edilen zorunlu otopark büyüklüğü kadar olabilir (Otopark Yönetmeliği uyarınca).</li>
                                    <li className="text-justify"><strong className="text-accent-hover">Açıklık ve Yükseklik:</strong> Yapacağınız garajın iç yüksekliği en fazla <strong>3.00 metre</strong> olmalı ve garajın en az iki tarafı tamamen açık olmalıdır. (Yani etrafını kapatıp kapalı bir kutu haline getiremezsiniz).</li>
                                    <li className="text-justify"><strong className="text-accent-hover">Malzemesi:</strong> En önemli husus malzemedir! Tuğla, beton gibi kalıcı bir imalat kullanmak kesinlikle yasaktır. Yangına dayanıklı, metal profillerden oluşan ve istendiğinde <strong>kolayca sökülüp takılabilen (portatif)</strong> hafif örtüler (mesh sistemler, branda, sac vb.) tercih edilmelidir.</li>
                                </ul>

                                <h4 className="text-xl font-bold text-warm-100 mt-8 mb-4">2. Evin Girişine Rüzgarlık (Giriş Holü)</h4>
                                <p className="text-justify">Kışın rüzgarın ve soğuğun doğrudan içeri girmesini engellemek, kapı önüne korunaklı bir ön alan yaratmak artık çok daha basit:</p>
                                <ul className="space-y-3 bg-dark-surface/30 p-6 rounded-2xl border border-dark-border mt-4 mb-8">
                                    <li className="text-justify"><strong className="text-accent-hover">Büyüklüğü:</strong> Rüzgarlığın taban alanı en fazla <strong>7 metrekare</strong> olabilir. İç yüksekliği de aynı şekilde <strong>3.00 metreyi</strong> geçmemelidir.</li>
                                    <li className="text-justify"><strong className="text-accent-hover">Malzemesi:</strong> Bu alan da tıpkı garaj gibi hafif malzemeden, sökülebilir özellikte olmalı ve evinizin doğrudan dışarı açılan ön kapısına inşa edilmelidir (örneğin hafif profilli portatif camlama sistemleri).</li>
                                </ul>

                                <hr className="border-dark-border my-10" />

                                <h3 className="text-2xl font-bold mt-10 mb-6 flex items-center gap-3">
                                    <span className="bg-accent/20 p-2 rounded-lg text-accent"><Scale size={24} /></span> Bir İmar Uzmanı Olarak Analiz ve Uyarılarım
                                </h3>
                                <p className="text-justify">
                                    Belediyelerin iş yükünü azaltan ve vatandaşa rahat bir nefes aldıran bu muafiyet, pratikte çok dikkatli uygulanmalıdır. Hem ev sahiplerinin hem de bu uygulamaları yapacak ustaların/mimarların aşağıdaki hayati uyarılara dikkat etmesi gerekir:
                                </p>
                                <ol className="space-y-4 pl-0 mt-6 marker:font-bold marker:text-accent">
                                    <li className="pl-4 text-justify"><strong>Taşıyıcı Sisteme Asla Zarar Vermeyin:</strong> Kuracağınız garajın veya rüzgarlığın montajı sırasında, kesinlikle evinizin taşıyıcı sistemine (kolon, kiriş, perde beton) ekstra bir yük bindirmemelisiniz. Aksi takdirde masum bir ekleme yüzünden evinizin deprem dayanımını riske atmış olursunuz.</li>
                                    <li className="pl-4 text-justify"><strong>Sınırlarınızı İhlal Etmeyin ve Yangın Güvenliğini Sağlayın:</strong> Yapılan imalatlar komşu parsele ya da yola kesinlikle taşmamalıdır. Ayrıca uygulamalar esnasında yangın tahliye senaryoları ve can güvenliği tedbirleri mutlak suretle ön planda tutulmalıdır.</li>
                                    <li className="pl-4 text-justify"><strong>Kalıcı İmalata Çevirme Hatası (Kaçak Yapı Riski):</strong> Uygulamada karşılaşılan en büyük hata; hafif konstrüksiyonla kurulan bu alanların zaman içinde tuğla veya betonla örülerek kapalı, yalıtımlı odalara dönüştürülmesidir. Denetimlerde veya bir şikayet sonucu bu durum tespit edilirse, yapınız <strong>"kaçak yapı"</strong> konumuna düşer ve İmar Kanunu’nun 32. ve 42. maddeleri gereği hukuki işlem (yıkım kararı ve oldukça ağır idari para cezaları) ile karşı karşıya kalabilirsiniz.</li>
                                </ol>

                                <div className="bg-dark-elevated p-8 rounded-3xl border border-dark-border mt-12 mb-8 text-center shadow-xl">
                                    <h3 className="text-xl text-warm-50 font-bold mb-4 mt-0">Sonuç Olarak</h3>
                                    <p className="text-warm-300 mb-0 text-justify">
                                        Yönetmeliğe eklenen bu madde, doğru kullanıldığında müstakil ev sahipleri ve yapılaşma pratikliği açısından harika bir fırsattır. Evinizi güzelleştirirken kalıcı ve ağır inşai faaliyetlerden uzak durun, sökülebilir ve estetik malzemeleri tercih edin. Değişikliğin tüm yapı sektörüne ve mülk sahiplerine hayırlı olmasını dileriz.
                                    </p>
                                </div>
                            </>
                        )}
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
