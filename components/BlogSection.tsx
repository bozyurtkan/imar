import React, { useState } from 'react';
import { BookOpen, ArrowRight, Clock, FileText, Gavel, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

const POSTS_PER_PAGE = 5;

interface BlogPost {
    title: string;
    category: string;
    readTime: string;
    date: string;
    desc: string;
    icon: React.ReactNode;
    slug?: string;
    image?: string;
    author?: string;
}

const blogPosts: BlogPost[] = [
    {
        title: "Şantiye-M Uygulaması ile İnşaat Sektöründe Dijital Dönüşüm",
        category: "Güncel Değişiklikler",
        readTime: "5 dk okuma",
        date: "24 Mart 2026",
        author: "İmar Mevzuat Editörü",
        image: "/hero.jpg",
        desc: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nın kullanıma sunduğu Şantiye-M yazılımının amacı, sağladığı kolaylıklar ve sektörel etkileri hakkında kapsamlı bir değerlendirme.",
        icon: <Building2 size={32} />,
        slug: "santiye-m-dijital-donusum"
    },
    {
        title: "Planlı Alanlar İmar Yönetmeliği 2026 Değişiklikleri Neler Getiriyor?",
        category: "Güncel Değişiklikler",
        readTime: "8 dk okuma",
        date: "25 Şubat 2026",
        author: "İmar Mevzuat Editörü",
        image: "/images/planli-alanlar.jpg",
        desc: "Çekme mesafeleri, otopark yönetmeliği uyumu ve kat yüksekliği sınırlandırmaları başta olmak üzere Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nın yayınladığı son yönetmelik değişikliklerinin teknik özeti.",
        icon: <FileText size={32} />,
        slug: "planli-alanlar-garaj-rüzgarlik-degisikligi"
    },
    {
        title: "Mevcut Binalarda Yangın Merdiveni Çıkmazı Bitiyor: Bahçe Mesafelerinde Yeni Esneklik!",
        category: "Mevzuat Analizi",
        readTime: "6 dk okuma",
        date: "14 Ocak 2026",
        author: "İmar Mevzuat Editörü",
        image: "/images/yangin-merdiveni.jpg",
        desc: "Mevzuat değişikliği veya kullanım amacı değişimleri nedeniyle yangın merdiveni zorunlu hale gelen mevcut yapılara ilişkin bahçe mesafesi istisnalarının uzman analizi.",
        icon: <Gavel size={32} />,
        slug: "mevcut-binalarda-yangin-merdiveni-esnekligi"
    },
    {
        title: "İmar Planı İptal Davalarında Yürütmeyi Durdurma ve Emsal Danıştay Kararları",
        category: "İçtihatlar",
        readTime: "6 dk okuma",
        date: "12 Şubat 2026",
        author: "İmar Mevzuat Editörü",
        image: "/images/yangin-merdiveni-sema.jpg",
        desc: "Askıya çıkan Nazım ve Uygulama İmar Planlarına itiraz süreleri, menfaat ihlali şartları ve Danıştay 6. Dairesi'nin şehircilik ilkeleri doğrultusunda verdiği emsal nitelikteki yürütmeyi durdurma kararları.",
        icon: <BookOpen size={32} />
    }
];

const ArticleRow: React.FC<{ post: BlogPost; onReadArticle?: (slug: string) => void }> = ({ post, onReadArticle }) => {
    const isClickable = !!post.slug;

    return (
        <article
            onClick={() => { if (post.slug && onReadArticle) onReadArticle(post.slug); }}
            className={`group flex flex-col sm:flex-row gap-5 sm:gap-7 py-8 ${isClickable ? 'cursor-pointer' : ''}`}
        >
            {/* Sol: Thumbnail */}
            <div className="relative flex-shrink-0 w-full sm:w-[260px] rounded-xl overflow-hidden bg-dark-elevated" style={{ height: '190px' }}>
                {post.image && (
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                )}
                {!post.slug && (
                    <div
                        className="absolute top-0 left-0 h-full flex items-center justify-center"
                        style={{ width: '52px', background: 'rgba(196,80,26,0.88)', backdropFilter: 'blur(2px)' }}
                    >
                        <span
                            style={{
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                fontSize: '11px',
                                fontWeight: 800,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: '#fff',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Çok Yakında
                        </span>
                    </div>
                )}
            </div>

            {/* Sağ: İçerik */}
            <div className="flex flex-col justify-center gap-2">
                {post.author && (
                    <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
                        {post.author}
                    </p>
                )}
                <h2
                    className={`text-xl font-extrabold leading-snug transition-colors duration-200 ${isClickable ? 'group-hover:text-accent' : ''}`}
                    style={{ color: 'var(--text-primary)' }}
                >
                    {post.title}
                </h2>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                        <Clock size={13} /> {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={13} /> {post.readTime}
                    </span>
                </div>
                <p className="text-sm leading-relaxed" style={{
                    color: 'var(--text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden'
                }}>
                    {post.desc}
                </p>
                {isClickable && (
                    <p className="text-accent text-sm font-semibold flex items-center gap-1 mt-1">
                        Devamını Oku <ArrowRight size={13} />
                    </p>
                )}
            </div>
        </article>
    );
};

interface BlogSectionProps {
    onReadArticle?: (slug: string) => void;
    onOpenBlog?: () => void;
    isStandalone?: boolean;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onReadArticle, onOpenBlog, isStandalone }) => {
    const handleComingSoon = () => {
        alert("Bu özellik ve detaylı makaleler çok yakında aktif edilecektir. İlginiz için teşekkürler!");
    };

    // /makaleler sayfası: dikey liste layout
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
    const pagedPosts = blogPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isStandalone) {
        return (
            <section style={{ padding: '48px 0', minHeight: '60vh' }}>
                <div className="landing-container">
                    <div style={{ marginBottom: '40px' }}>
                        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                            İmar Mevzuatı Rehberleri & Makaleler
                        </h1>
                    </div>
                    <div>
                        {pagedPosts.map((post, i) => (
                            <React.Fragment key={i}>
                                <ArticleRow post={post} onReadArticle={onReadArticle} />
                                {i < pagedPosts.length - 1 && (
                                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12 pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                style={{
                                    color: currentPage === 1 ? 'var(--text-faint)' : 'var(--text-primary)',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    opacity: currentPage === 1 ? 0.4 : 1
                                }}
                            >
                                <ChevronLeft size={16} /> Önceki
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className="w-9 h-9 rounded-lg text-sm font-semibold transition-colors duration-200"
                                    style={{
                                        background: page === currentPage ? 'var(--accent-primary)' : 'transparent',
                                        color: page === currentPage ? '#fff' : 'var(--text-primary)',
                                        border: page === currentPage ? 'none' : '1px solid var(--border-color)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                style={{
                                    color: currentPage === totalPages ? 'var(--text-faint)' : 'var(--text-primary)',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    opacity: currentPage === totalPages ? 0.4 : 1
                                }}
                            >
                                Sonraki <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        );
    }

    // Landing page: mevcut dark carousel layout
    return (
        <section
            className="landing-features"
            style={{ backgroundColor: 'var(--bg-surface)' }}
        >
            <div className="landing-container">
                <h2 className="landing-section-title">
                    İmar Mevzuatı Rehberleri & Makaleler
                </h2>
                <p className="landing-section-subtitle" style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
                    Yapay zeka asistanımızın güçlü analiz yeteneklerini keşfetmeden önce, uzmanlarımız tarafından hazırlanan derinlemesine mevzuat incelemelerine göz atın. <br /><span className="text-accent text-sm font-semibold">(Seçili makaleler çok yakında yayında!)</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
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
                            className="group relative bg-dark-elevated rounded-2xl p-6 sm:p-8 border border-dark-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col h-full cursor-pointer overflow-hidden"
                        >
                            {/* Coming Soon Badge */}
                            {!post.slug && (
                                <div className="absolute top-0 right-0 z-20">
                                    <div className="bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300">
                                        ÇOK YAKINDA
                                    </div>
                                </div>
                            )}

                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Meta Info */}
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

                            {/* Read More Link */}
                            <div className="relative z-10 mt-auto pt-4 border-t border-dark-border/30 flex items-center justify-between text-sm font-semibold text-warm-300 group-hover:text-accent transition-colors duration-300">
                                <span>Makaleyi Oku</span>
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                                    <ArrowRight size={16} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
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
