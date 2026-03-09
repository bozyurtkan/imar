import React from 'react';
import { BookOpen, ArrowRight, Clock, FileText, Gavel } from 'lucide-react';

const blogPosts = [
    {
        title: "3194 Sayılı İmar Kanunu Madde 32: Ruhsatsız Yapılar İçin Yıkım ve Para Cezası Süreçleri",
        category: "Mevzuat Analizi",
        readTime: "5 dk okuma",
        date: "08 Mart 2026",
        desc: "Ruhsatsız veya ruhsat eklerine aykırı olarak başlanan yapılar için belediyelerin uyguladığı mühürleme, yıkım kararı ve idari para cezası hesaplama yöntemlerine dair kapsamlı Yargıtay incelemesi.",
        icon: <Gavel size={32} />
    },
    {
        title: "Planlı Alanlar İmar Yönetmeliği 2026 Değişiklikleri Neler Getiriyor?",
        category: "Güncel Değişiklikler",
        readTime: "8 dk okuma",
        date: "25 Şubat 2026",
        desc: "Çekme mesafeleri, otopark yönetmeliği uyumu ve kat yüksekliği sınırlandırmaları başta olmak üzere Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nın yayınladığı son yönetmelik değişikliklerinin teknik özeti.",
        icon: <FileText size={32} />
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

export const BlogSection: React.FC = () => {
    const handleComingSoon = () => {
        alert("Bu özellik ve detaylı makaleler çok yakında aktif edilecektir. İlginiz için teşekkürler!");
    };

    return (
        <section className="landing-features" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="landing-container">
                <h2 className="landing-section-title">
                    İmar Hukuku Rehberleri & Makaleler
                </h2>
                <p className="landing-section-subtitle" style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
                    Yapay zeka asistanımızın güçlü analiz yeteneklerini keşfediden önce, hukukçularımız ve şehir plancılarımız tarafından hazırlanan derinlemesine mevzuat incelemelerine göz atın. <br /><span className="text-accent text-sm font-semibold">(Seçili makaleler çok yakında yayında!)</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
                    {blogPosts.map((post, index) => (
                        <div
                            key={index}
                            onClick={handleComingSoon}
                            className="group relative bg-dark-elevated rounded-2xl p-6 sm:p-8 border border-dark-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col h-full cursor-pointer overflow-hidden"
                        >
                            {/* Coming Soon Badge */}
                            <div className="absolute top-0 right-0 z-20">
                                <div className="bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300">
                                    ÇOK YAKINDA
                                </div>
                            </div>

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
                    <button onClick={handleComingSoon} className="landing-btn-ghost text-sm font-medium hover:text-accent-primary">
                        Tüm Makaleleri Görüntüle <ArrowRight size={16} className="inline-block ml-1" />
                    </button>
                </div>
            </div>
        </section>
    );
};
