import React, { useRef, useState, useEffect, useCallback } from 'react';
import { BookOpen, ArrowRight, ArrowLeft, Clock, FileText, Gavel, Building2 } from 'lucide-react';

// En yeni makale en başta (solda) olacak şekilde sıralanmıştır
const blogPosts = [
    {
        title: "Şantiye-M Uygulaması ile İnşaat Sektöründe Dijital Dönüşüm",
        category: "Güncel Değişiklikler",
        readTime: "5 dk okuma",
        date: "24 Mart 2026",
        desc: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nın kullanıma sunduğu Şantiye-M yazılımının amacı, sağladığı kolaylıklar ve sektörel etkileri hakkında kapsamlı bir değerlendirme.",
        icon: <Building2 size={32} />,
        slug: "santiye-m-dijital-donusum"
    },
    {
        title: "Mevcut Binalarda Yangın Merdiveni Çıkmazı Bitiyor: Bahçe Mesafelerinde Yeni Esneklik!",
        category: "Mevzuat Analizi",
        readTime: "6 dk okuma",
        date: "14 Ocak 2026",
        desc: "Mevzuat değişikliği veya kullanım amacı değişimleri nedeniyle yangın merdiveni zorunlu hale gelen mevcut yapılara ilişkin bahçe mesafesi istisnalarının uzman analizi.",
        icon: <Gavel size={32} />,
        slug: "mevcut-binalarda-yangin-merdiveni-esnekligi"
    },
    {
        title: "Planlı Alanlar İmar Yönetmeliği 2026 Değişiklikleri Neler Getiriyor?",
        category: "Güncel Değişiklikler",
        readTime: "8 dk okuma",
        date: "25 Şubat 2026",
        desc: "Çekme mesafeleri, otopark yönetmeliği uyumu ve kat yüksekliği sınırlandırmaları başta olmak üzere Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nın yayınladığı son yönetmelik değişikliklerinin teknik özeti.",
        icon: <FileText size={32} />,
        slug: "planli-alanlar-garaj-rüzgarlik-degisikligi"
    },
    {
        title: "İmar Planı İptal Davalarında Yürütmeyi Durdurma ve Emsal Danıştay Kararları",
        category: "İçtihatlar",
        readTime: "6 dk okuma",
        date: "12 Şubat 2026",
        desc: "Askıya çıkan Nazım ve Uygulama İmar Planlarına itiraz süreleri, menfaat ihlali şartları ve Danıştay 6. Dairesi'nin şehircilik ilkeleri doğrultusunda verdiği emsal nitelikteki yürütmeyi durdurma kararları.",
        icon: <BookOpen size={32} />
    }
];

interface BlogSectionProps {
    onReadArticle?: (slug: string) => void;
    onOpenBlog?: () => void;
    isStandalone?: boolean;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onReadArticle, onOpenBlog, isStandalone }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isPausedRef = useRef(false);

    const handleComingSoon = () => {
        alert("Bu özellik ve detaylı makaleler çok yakında aktif edilecektir. İlginiz için teşekkürler!");
    };

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

        // update active dot
        const cards = el.querySelectorAll('.blog-card');
        let closestIndex = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
            const dist = Math.abs((card as HTMLElement).offsetLeft - el.scrollLeft - el.offsetLeft);
            if (dist < closestDist) {
                closestDist = dist;
                closestIndex = i;
            }
        });
        setActiveIndex(closestIndex);
    }, []);

    const scrollToIndex = useCallback((index: number) => {
        const el = scrollRef.current;
        if (!el) return;
        const card = el.querySelectorAll('.blog-card')[index] as HTMLElement;
        if (card) {
            el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
        }
    }, []);

    const scroll = useCallback((direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = (el.querySelector('.blog-card') as HTMLElement)?.offsetWidth || 360;
        const gap = 24;
        el.scrollBy({ left: direction === 'left' ? -(cardWidth + gap) : (cardWidth + gap), behavior: 'smooth' });
    }, []);

    // Auto-scroll: her 3.5 saniyede bir sağa kaydır, sona gelince başa dön
    const startAutoScroll = useCallback(() => {
        if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        autoScrollRef.current = setInterval(() => {
            if (isPausedRef.current) return;
            const el = scrollRef.current;
            if (!el) return;
            const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
            if (atEnd) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                const cardWidth = (el.querySelector('.blog-card') as HTMLElement)?.offsetWidth || 360;
                el.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
            }
        }, 3500);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll);
        startAutoScroll();

        // Kullanıcı etkileşimi sırasında otomatik kaymayı durdur, 5 sn sonra tekrar başlat
        const onPointerDown = () => { isPausedRef.current = true; };
        const onPointerUp = () => {
            setTimeout(() => { isPausedRef.current = false; }, 5000);
        };
        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointerup', onPointerUp);
        el.addEventListener('touchstart', onPointerDown, { passive: true });
        el.addEventListener('touchend', onPointerUp);

        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
            el.removeEventListener('pointerdown', onPointerDown);
            el.removeEventListener('pointerup', onPointerUp);
            el.removeEventListener('touchstart', onPointerDown);
            el.removeEventListener('touchend', onPointerUp);
            if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        };
    }, [checkScroll, startAutoScroll]);

    return (
        <section
            className="landing-features"
            style={{
                backgroundColor: 'var(--bg-surface)',
                ...(isStandalone ? { paddingTop: '32px' } : {})
            }}
        >
            <div className="landing-container">
                <h2 className="landing-section-title">
                    İmar Hukuku Rehberleri & Makaleler
                </h2>
                <p className="landing-section-subtitle" style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
                    Yapay zeka asistanımızın güçlü analiz yeteneklerini keşfediden önce, hukukçularımız ve şehir plancılarımız tarafından hazırlanan derinlemesine mevzuat incelemelerine göz atın. <br /><span className="text-accent text-sm font-semibold">(Seçili makaleler çok yakında yayında!)</span>
                </p>

                {/* Carousel Wrapper */}
                <div className="relative max-w-7xl mx-auto">
                    {/* Left Arrow */}
                    <button
                        onClick={() => { isPausedRef.current = true; scroll('left'); setTimeout(() => { isPausedRef.current = false; }, 5000); }}
                        aria-label="Önceki makale"
                        className={`absolute -left-4 sm:-left-6 top-1/2 -translate-y-8 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-dark-border bg-dark-elevated shadow-lg flex items-center justify-center transition-all duration-300 hover:border-accent/50 hover:shadow-xl ${canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    >
                        <ArrowLeft size={18} className="text-warm-300" />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={() => { isPausedRef.current = true; scroll('right'); setTimeout(() => { isPausedRef.current = false; }, 5000); }}
                        aria-label="Sonraki makale"
                        className={`absolute -right-4 sm:-right-6 top-1/2 -translate-y-8 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-dark-border bg-dark-elevated shadow-lg flex items-center justify-center transition-all duration-300 hover:border-accent/50 hover:shadow-xl ${canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    >
                        <ArrowRight size={18} className="text-warm-300" />
                    </button>

                    {/* Scrollable Cards */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                            scrollBehavior: 'smooth',
                        }}
                    >
                        {blogPosts.map((post, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    if (post.slug && onReadArticle) {
                                        onReadArticle(post.slug);
                                    } else {
                                        handleComingSoon();
                                    }
                                }}
                                className="blog-card group relative bg-dark-elevated rounded-2xl p-6 sm:p-8 border border-dark-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col cursor-pointer overflow-hidden snap-start flex-shrink-0"
                                style={{ minWidth: '300px', maxWidth: '380px', width: 'calc(33.333% - 16px)' }}
                                onMouseEnter={() => { isPausedRef.current = true; }}
                                onMouseLeave={() => { setTimeout(() => { isPausedRef.current = false; }, 2000); }}
                            >
                                {/* New Badge for first (most recent) article */}
                                {index === 0 && (
                                    <div className="absolute top-0 left-0 z-20">
                                        <div className="bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-br-xl shadow-lg">
                                            YENİ
                                        </div>
                                    </div>
                                )}

                                {/* Coming Soon Badge */}
                                {!post.slug && (
                                    <div className="absolute top-0 right-0 z-20">
                                        <div className="bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300">
                                            ÇOK YAKINDA
                                        </div>
                                    </div>
                                )}

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                {/* Meta */}
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-accent-primary bg-accent/10 px-3 py-1 rounded-full">
                                        {post.category}
                                    </span>
                                    <div className="flex items-center text-warm-500 text-xs font-medium gap-1">
                                        <Clock size={12} />
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative z-10 flex-grow">
                                    <h3 className="text-lg sm:text-xl font-bold text-warm-50 mb-3 leading-snug group-hover:text-accent transition-colors duration-300">
                                        {post.title}
                                    </h3>
                                    <p className="text-warm-400 text-sm leading-relaxed mb-6">
                                        {post.desc}
                                    </p>
                                </div>

                                {/* Read More */}
                                <div className="relative z-10 mt-auto pt-4 border-t border-dark-border/30 flex items-center justify-between text-sm font-semibold text-warm-300 group-hover:text-accent transition-colors duration-300">
                                    <span>Makaleyi Oku</span>
                                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                                        <ArrowRight size={16} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dot Indicators */}
                    <div className="flex items-center justify-center gap-2 mt-5">
                        {blogPosts.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => { isPausedRef.current = true; scrollToIndex(index); setTimeout(() => { isPausedRef.current = false; }, 5000); }}
                                className={`rounded-full transition-all duration-300 ${activeIndex === index ? 'w-5 h-2 bg-accent' : 'w-2 h-2 bg-dark-border hover:bg-accent/50'}`}
                                aria-label={`Makale ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button onClick={() => {
                        if (onOpenBlog) {
                            onOpenBlog();
                        } else {
                            window.history.pushState({}, '', '/makaleler');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                        }
                    }} className="landing-btn-ghost text-sm font-medium hover:text-accent-primary">
                        Tüm Makaleleri Görüntüle <ArrowRight size={16} className="inline-block ml-1" />
                    </button>
                </div>
            </div>
        </section>
    );
};
